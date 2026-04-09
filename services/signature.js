// ============================================================
// IRONSYNC SIGN — Signature Service v2.0
// Archivo: services/signature.js
// Actualizado para usar C1_VERSIONADO:
//   → crear_solicitud_firma_snapshot() en Supabase
//   → verificar_snapshot_vigente() en Supabase
//   → Firma apunta al snapshot exacto
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
// Usa función SQL crear_solicitud_firma_snapshot()
// El contenido viene del snapshot — no del turno vivo
// ============================================================

class SignatureService {

    static async crearSolicitud(params) {
        const {
            documento_id,
            firmante_telefono,
            firmante_nombre,
            solicitado_por = 'ulises'
        } = params;

        // Verificar que el teléfono está configurado
        const { data: config } = await supabase
            .from('firmas_config')
            .select('id, nombre')
            .eq('telefono', firmante_telefono)
            .eq('activo', true)
            .single();

        if (!config) {
            return {
                success: false,
                error: `Teléfono ${firmante_telefono} no configurado para firmar`
            };
        }

        // Usar función SQL que crea solicitud sobre snapshot más reciente
        const { data: requestId, error } = await supabase
            .rpc('crear_solicitud_firma_snapshot', {
                p_turno_id:          documento_id,
                p_firmante_telefono: firmante_telefono,
                p_firmante_nombre:   firmante_nombre || config.nombre,
                p_solicitado_por:    solicitado_por
            });

        if (error) {
            return { success: false, error: error.message };
        }

        // Obtener la solicitud creada para enviar por WhatsApp
        const { data: solicitud } = await supabase
            .from('signature_requests')
            .select('*')
            .eq('id', requestId)
            .single();

        if (!solicitud) {
            return { success: false, error: 'Solicitud creada pero no encontrada' };
        }

        // Enviar por WhatsApp
        await this.enviarWhatsApp(solicitud);

        return { success: true, solicitud };
    }

    // ============================================================
    // MOTOR B: Enviar por WhatsApp
    // El contenido_resumen ya viene formateado desde la función SQL
    // con mensaje de firma consciente
    // ============================================================

    static async enviarWhatsApp(solicitud) {
        const urlFirma = `${process.env.APP_URL}/f/${solicitud.token_acceso}`;

        const mensajeCompleto = solicitud.contenido_resumen +
            `\n\n🔗 Ver detalle: ${urlFirma}`;

        const response = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
            {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(
                        `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
                    ).toString('base64'),
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    From: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
                    To:   `whatsapp:${solicitud.firmante_telefono}`,
                    Body: mensajeCompleto
                })
            }
        );

        const result = await response.json();

        await supabase
            .from('signature_requests')
            .update({
                estado:           response.ok ? 'enviada' : 'error',
                intentos_envio:   solicitud.intentos_envio + 1,
                ultimo_envio_en:  new Date().toISOString(),
                ultimo_error:     response.ok ? null : JSON.stringify(result),
                proximo_reintento_en: response.ok
                    ? null
                    : new Date(Date.now() + this.calcularBackoff(solicitud.intentos_envio + 1)).toISOString()
            })
            .eq('id', solicitud.id);

        return result;
    }

    // ============================================================
    // MOTOR C: Registrar firma inmutable
    // Verifica snapshot vigente antes de registrar
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

        // Verificar que no fue invalidada por cambio post-cierre
        if (solicitud.invalidado_por_cambio) {
            return {
                success: false,
                error: 'Esta solicitud fue invalidada porque los datos del turno cambiaron. ' +
                       'Solicita una nueva firma a Ulises.'
            };
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

        // Verificar que el snapshot sigue siendo el más reciente
        // Protege contra cambios de último minuto
        const { data: snapshotVigente } = await supabase
            .rpc('verificar_snapshot_vigente', { p_request_id: request_id });

        if (snapshotVigente === false) {
            // Invalidar esta solicitud
            await supabase
                .from('signature_requests')
                .update({
                    estado:               'error',
                    invalidado_por_cambio: true,
                    ultimo_error:         'Turno modificado después de crear la solicitud.'
                })
                .eq('id', solicitud.id);

            return {
                success: false,
                error: 'Los datos del turno cambiaron después de que se envió esta solicitud. ' +
                       'Ulises debe crear una nueva solicitud.'
            };
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
                        ? new Date(Date.now() + calcularBloqueoMs(nuevosIntentos)).toISOString()
                        : null
                })
                .eq('id', config.id);

            return {
                success: false,
                error: 'PIN incorrecto',
                intentos_restantes: 3 - nuevosIntentos
            };
        }

        // Generar hash de la firma vinculado al snapshot
        const timestampFirma = new Date().toISOString();
        const hashInput = [
            solicitud.documento_id,
            solicitud.snapshot_id || '',
            solicitud.contenido_hash,
            timestampFirma,
            firmante_telefono
        ].join('|');

        const firmaHash = crypto
            .createHash('sha256')
            .update(hashInput)
            .digest('hex');

        // Crear registro inmutable apuntando al snapshot
        const { data: record, error: recordError } = await supabase
            .from('signature_records')
            .insert({
                request_id:        solicitud.id,
                firmante_config_id: config.id,
                snapshot_id:        solicitud.snapshot_id,
                snapshot_version:   solicitud.snapshot_version,
                snapshot_hash:      solicitud.contenido_hash,
                tipo_documento:     solicitud.tipo_documento,
                documento_id:       solicitud.documento_id,
                documento_tabla:    solicitud.documento_tabla,
                firmante_rol:       firmante_rol || solicitud.firmante_rol,
                firmante_nombre:    firmante_nombre || config.nombre,
                firmante_telefono:  firmante_telefono,
                firmante_canal:     firmante_canal || solicitud.firmante_canal,
                pin_verificado:     true,
                pin_verificado_en:  timestampFirma,
                firma_hash:         firmaHash,
                contenido_snapshot: solicitud.contenido_completo,
                contenido_hash:     solicitud.contenido_hash,
                ip_address:         contexto.ip || null,
                user_agent:         contexto.dispositivo || null,
                ubicacion_lat:      contexto.lat || null,
                ubicacion_lng:      contexto.lng || null,
                firmado_en:         timestampFirma,
                origen_canal:       firmante_canal || 'whatsapp'
            })
            .select()
            .single();

        if (recordError) {
            if (recordError.code === '23505') {
                return { success: false, error: 'Este rol ya firmó este documento' };
            }
            throw recordError;
        }

        // Marcar snapshot como firmado
        if (solicitud.snapshot_id) {
            await supabase
                .from('turno_snapshots')
                .update({
                    fue_firmado: true,
                    firmado_en:  timestampFirma
                })
                .eq('id', solicitud.snapshot_id);
        }

        // Actualizar solicitud
        await supabase
            .from('signature_requests')
            .update({
                estado:               'firmada',
                signature_record_id:  record.id
            })
            .eq('id', solicitud.id);

        // Actualizar estado de firma en turno
        await this.actualizarEstadoFirmaTurno(solicitud, 'signed', firmaHash, timestampFirma);

        // Resetear intentos PIN
        await supabase
            .from('firmas_config')
            .update({ pin_intentos_fallidos: 0, pin_bloqueado_hasta: null })
            .eq('id', config.id);

        // Notificar a Ulises
        await supabase.from('notificaciones').insert({
            tipo:      'firma_recibida',
            titulo:    `Firma recibida — ${solicitud.contenido_completo?.maquina || 'Turno'}`,
            mensaje:   `${firmante_nombre || config.nombre} firmó el turno. Snapshot v${solicitud.snapshot_version}.`,
            turno_id:  solicitud.documento_id,
            para_usuario: 'ulises'
        });

        return {
            success:     true,
            firma_id:    record.id,
            firma_hash:  firmaHash,
            firmado_en:  timestampFirma,
            snapshot_version: solicitud.snapshot_version
        };
    }

    // ============================================================
    // MOTOR D: Actualizar estado de firma en turno
    // ============================================================

    static async actualizarEstadoFirmaTurno(solicitud, estado, hash = null, timestamp = null) {
        if (solicitud.documento_tabla !== 'turnos') return;

        const esResidente = solicitud.firmante_rol?.includes('arrendatario');

        if (esResidente) {
            await supabase
                .from('turnos')
                .update({
                    firma_residente_status: estado,
                    firma_residente_hash:   hash,
                    firma_residente_en:     timestamp
                })
                .eq('id', solicitud.documento_id);
        } else {
            await supabase
                .from('turnos')
                .update({
                    firma_supervisor_status: estado,
                    firma_supervisor_hash:   hash,
                    firma_supervisor_en:     timestamp
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
                `Al responder SI y tu PIN confirmas que:\n` +
                `→ Revisaste estos datos\n` +
                `→ Coinciden con lo observado en campo\n` +
                `→ Autorizas el cobro de este monto a Mota\n\n` +
                `✅ Responde: SI\n` +
                `❌ Responde: NO`,

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
        return Math.min(30000 * Math.pow(4, intentos - 1), 480000);
    }
}

function calcularBloqueoMs(intentos) {
    if (intentos <= 3) return 15 * 60 * 1000;
    if (intentos <= 6) return 60 * 60 * 1000;
    if (intentos <= 9) return 6 * 60 * 60 * 1000;
    return 24 * 60 * 60 * 1000;
}

module.exports = SignatureService;