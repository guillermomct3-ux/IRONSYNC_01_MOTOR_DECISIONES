// IronSync Sign — Signature Service
// ============================================================
// IRONSYNC SIGN — Signature Service
// Archivo: services/signature.js
// Motores A, B, C, D integrados
// ============================================================

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// ============================================================
// MOTOR A: Crear solicitud de firma
// ============================================================

class SignatureService {

    static async crearSolicitud(params) {
        const {
            tipo_documento,
            documento_id,
            documento_tabla = 'turnos',
            contenido,
            firmante_rol,
            firmante_nombre,
            firmante_telefono,
            solicitado_por,
            contrato_id
        } = params;

        const contenidoResumen = this.generarResumenWhatsApp(tipo_documento, contenido);
        const contenidoCompleto = JSON.stringify(contenido);
        const contenidoHash = crypto
            .createHash('sha256')
            .update(contenidoCompleto)
            .digest('hex');

        // Detectar si hay tenant link activo (Escenario B)
        const { data: tenantLink } = await supabase
            .from('tenant_links')
            .select('id')
            .eq('contrato_id', contrato_id)
            .eq('rol', 'arrendatario')
            .eq('conexion_estado', 'activa')
            .single();

        const resolver = tenantLink ? 'federado' : 'whatsapp';

        const { data: solicitud, error } = await supabase
            .from('signature_requests')
            .insert({
                tipo_documento,
                documento_id,
                documento_tabla,
                contenido_resumen: contenidoResumen,
                contenido_completo: contenido,
                contenido_hash: contenidoHash,
                firmante_rol,
                firmante_nombre,
                firmante_telefono,
                firmante_canal: resolver === 'federado' ? 'is_dashboard' : 'whatsapp',
                solicitado_por,
                resolver,
                contrato_id,
                estado: 'pendiente',
                intentos_envio: 0
            })
            .select()
            .single();

        if (error) throw error;

        // Actualizar turno con referencia a la solicitud
        if (documento_tabla === 'turnos') {
            await supabase
                .from('turnos')
                .update({
                    firma_residente_status: 'pending',
                    firma_residente_request_id: solicitud.id
                })
                .eq('id', documento_id);
        }

        // Enviar por canal apropiado
        if (resolver === 'whatsapp') {
            await this.enviarWhatsApp(solicitud);
        }

        return solicitud;
    }

    // ============================================================
    // MOTOR B: Enviar por WhatsApp
    // ============================================================

    static async enviarWhatsApp(solicitud) {
        const urlFirma = `${process.env.APP_URL}/f/${solicitud.token_acceso}`;

        const response = await fetch(
            `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: solicitud.firmante_telefono,
                    type: 'text',
                    text: {
                        body: `${solicitud.contenido_resumen}\n\n✅ Responda: SI\n❌ Responda: NO\n\n🔗 Ver detalle: ${urlFirma}`
                    }
                })
            }
        );

        const result = await response.json();

        await supabase
            .from('signature_requests')
            .update({
                estado: response.ok ? 'enviada' : 'error',
                intentos_envio: solicitud.intentos_envio + 1,
                ultimo_envio_en: new Date().toISOString(),
                ultimo_error: response.ok ? null : JSON.stringify(result),
                proximo_reintento_en: response.ok
                    ? null
                    : new Date(Date.now() + this.calcularBackoff(solicitud.intentos_envio + 1)).toISOString()
            })
            .eq('id', solicitud.id);

        return result;
    }

    // ============================================================
    // MOTOR C: Registrar firma inmutable
    // ============================================================

    static async registrarFirma(params) {
        const {
            request_id,
            pin_raw,
            firmante_nombre,
            firmante_rol,
            firmante_telefono,
            firmante_canal,
            contexto = {}
        } = params;

        // Buscar solicitud
        const { data: solicitud, error: findError } = await supabase
            .from('signature_requests')
            .select('*')
            .eq('id', request_id)
            .in('estado', ['enviada', 'vista'])
            .single();

        if (findError || !solicitud) {
            return { success: false, error: 'Solicitud no encontrada o ya procesada' };
        }

        // Verificar expiración
        if (new Date(solicitud.expira_en) < new Date()) {
            await supabase
                .from('signature_requests')
                .update({ estado: 'expirada' })
                .eq('id', solicitud.id);
            await this.actualizarEstadoFirmaTurno(solicitud, 'expired');
            return { success: false, error: 'Solicitud expirada' };
        }

        // Buscar config del firmante para verificar PIN
        const { data: config } = await supabase
            .from('firmas_config')
            .select('*')
            .eq('telefono', firmante_telefono)
            .eq('contrato_id', solicitud.contrato_id)
            .eq('activo', true)
            .single();

        if (!config) {
            return { success: false, error: 'Firmante no configurado' };
        }

        // Verificar bloqueo
        if (config.pin_bloqueado_hasta && new Date(config.pin_bloqueado_hasta) > new Date()) {
            return {
                success: false,
                error: 'PIN bloqueado',
                desbloquea_en: config.pin_bloqueado_hasta
            };
        }

        // Verificar PIN con bcrypt
        const pinValido = await bcrypt.compare(pin_raw, config.pin_hash);

        if (!pinValido) {
            const nuevosIntentos = config.pin_intentos_fallidos + 1;
            await supabase
                .from('firmas_config')
                .update({
                    pin_intentos_fallidos: nuevosIntentos,
                    pin_bloqueado_hasta: nuevosIntentos >= 3
                        ? new Date(Date.now() + 15 * 60 * 1000).toISOString()
                        : null
                })
                .eq('id', config.id);

            return {
                success: false,
                error: 'PIN incorrecto',
                intentos_restantes: 3 - nuevosIntentos
            };
        }

        // Generar hash de la firma
        const timestampFirma = new Date().toISOString();
        const hashInput = JSON.stringify(solicitud.contenido_completo) + timestampFirma + config.pin_hash;
        const firmaHash = crypto.createHash('sha256').update(hashInput).digest('hex');

        // Crear registro inmutable
        const { data: record, error: recordError } = await supabase
            .from('signature_records')
            .insert({
                request_id: solicitud.id,
                firmante_config_id: config.id,
                tipo_documento: solicitud.tipo_documento,
                documento_id: solicitud.documento_id,
                documento_tabla: solicitud.documento_tabla,
                firmante_rol: firmante_rol || solicitud.firmante_rol,
                firmante_nombre: firmante_nombre || config.nombre,
                firmante_telefono: firmante_telefono,
                firmante_canal: firmante_canal || solicitud.firmante_canal,
                pin_verificado: true,
                pin_verificado_en: timestampFirma,
                firma_hash: firmaHash,
                contenido_snapshot: solicitud.contenido_completo,
                contenido_hash: solicitud.contenido_hash,
                ip_address: contexto.ip || null,
                user_agent: contexto.dispositivo || null,
                ubicacion_lat: contexto.lat || null,
                ubicacion_lng: contexto.lng || null,
                firmado_en: timestampFirma,
                origen_canal: firmante_canal || 'whatsapp'
            })
            .select()
            .single();

        if (recordError) {
            if (recordError.code === '23505') {
                return { success: false, error: 'Este rol ya firmó este documento' };
            }
            throw recordError;
        }

        // Actualizar solicitud
        await supabase
            .from('signature_requests')
            .update({
                estado: 'firmada',
                signature_record_id: record.id
            })
            .eq('id', solicitud.id);

        // Actualizar estado de firma en turno (Motor D)
        await this.actualizarEstadoFirmaTurno(solicitud, 'signed', firmaHash, timestampFirma);

        // Resetear intentos PIN
        await supabase
            .from('firmas_config')
            .update({ pin_intentos_fallidos: 0, pin_bloqueado_hasta: null })
            .eq('id', config.id);

        // Notificar a Ulises
        await supabase.from('notificaciones').insert({
            tipo: 'firma_recibida',
            titulo: `Firma recibida — ${solicitud.contenido_completo?.equipo_modelo || 'Turno'}`,
            mensaje: `${firmante_nombre || config.nombre} firmó por ${firmante_canal || 'whatsapp'}`,
            turno_id: solicitud.documento_id,
            para_usuario: 'ulises'
        });

        return {
            success: true,
            firma_id: record.id,
            firma_hash: firmaHash,
            firmado_en: timestampFirma
        };
    }

    // ============================================================
    // MOTOR D: Actualizar estado de firma en turno
    // ============================================================

    static async actualizarEstadoFirmaTurno(solicitud, estado, hash = null, timestamp = null) {
        if (solicitud.documento_tabla !== 'turnos') return;

        const esResidente = solicitud.firmante_rol.includes('arrendatario');

        if (esResidente) {
            await supabase
                .from('turnos')
                .update({
                    firma_residente_status: estado,
                    firma_residente_hash: hash,
                    firma_residente_en: timestamp
                })
                .eq('id', solicitud.documento_id);
        } else {
            await supabase
                .from('turnos')
                .update({
                    firma_supervisor_status: estado,
                    firma_supervisor_hash: hash,
                    firma_supervisor_en: timestamp
                })
                .eq('id', solicitud.documento_id);
        }
    }

    // ============================================================
    // UTILIDADES
    // ============================================================

    static generarResumenWhatsApp(tipo, doc) {
        const montoFmt = doc.monto
            ? `$${Number(doc.monto).toLocaleString('es-MX')} MXN`
            : '';

        const templates = {
            turno_cierre:
                `IronSync — Confirmación requerida\n\n` +
                `${doc.equipo_modelo || ''} ${doc.equipo_serie || ''}\n` +
                `Operador: ${doc.operador_nombre || ''}\n` +
                `Fecha: ${doc.fecha || ''}\n` +
                `Horómetro: ${doc.horometro_inicio} → ${doc.horometro_fin}\n` +
                `Horas: ${doc.horas}h — ${montoFmt}\n\n` +
                `¿Confirma este turno?`,

            turno_excepcion:
                `IronSync — Excepción registrada\n\n` +
                `${doc.equipo_modelo || ''} ${doc.equipo_serie || ''}\n` +
                `Tipo: ${doc.excepcion_tipo || ''}\n` +
                `${doc.excepcion_descripcion || ''}\n\n` +
                `¿Confirma esta excepción?`,

            conciliacion:
                `IronSync — Conciliación lista\n\n` +
                `Período: ${doc.periodo_inicio} — ${doc.periodo_fin}\n` +
                `Total: ${montoFmt}\n\n` +
                `¿Confirma esta conciliación?`
        };

        return templates[tipo] || `IronSync — Solicitud de firma: ${tipo}`;
    }

    static calcularBackoff(intentos) {
        // 30s → 2min → 8min
        return Math.min(30000 * Math.pow(4, intentos - 1), 480000);
    }
}

module.exports = SignatureService;