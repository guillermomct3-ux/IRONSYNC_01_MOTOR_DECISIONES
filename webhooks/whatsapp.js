// ============================================================
// IRONSYNC SIGN — WhatsApp Webhook Handler
// Archivo: webhooks/whatsapp.js
// Estado de conversación persistido en BD (no en memoria)
// ============================================================

const { createClient } = require('@supabase/supabase-js');
const SignatureService = require('../services/signature');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// ============================================================
// Función principal — procesar mensaje entrante
// ============================================================

async function procesarMensajeFirma(telefono, texto, tipoMensaje) {
    const textoUpper = (texto || '').trim().toUpperCase();

    // Buscar sesión activa en BD
    const { data: sesion } = await supabase
        .from('whatsapp_sessions')
        .select('*')
        .eq('telefono', telefono)
        .neq('estado', 'idle')
        .single();

    // Sin sesión activa — buscar solicitud pendiente
    if (!sesion) {
        return await manejarSinSesion(telefono, textoUpper);
    }

    // Verificar expiración de sesión
    if (new Date(sesion.expira_en) < new Date()) {
        await limpiarSesion(sesion);
        return 'Tu sesión expiró. Contacta a tu supervisor para reenviar la solicitud.';
    }

    // Procesar según estado de sesión
    switch (sesion.estado) {
        case 'esperando_si_no':
            return await procesarRespuestaSiNo(telefono, textoUpper, sesion);
        case 'esperando_pin':
            return await procesarPin(telefono, textoUpper, sesion);
        case 'esperando_motivo':
            return await procesarMotivoRechazo(telefono, texto, sesion);
        default:
            return 'Estado no reconocido. Contacta a tu supervisor.';
    }
}

// ============================================================
// Sin sesión activa — buscar solicitud pendiente
// ============================================================

async function manejarSinSesion(telefono, texto) {
    const { data: solicitud } = await supabase
        .from('signature_requests')
        .select('*')
        .eq('firmante_telefono', telefono)
        .in('estado', ['pendiente', 'enviada'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (!solicitud) {
        return 'No tienes solicitudes de firma pendientes.';
    }

    if (texto === 'SI' || texto === 'SÍ' || texto === 'YES') {
        return await procesarConfirmacion(telefono, solicitud);
    } else if (texto === 'NO') {
        return await iniciarRechazo(telefono, solicitud);
    } else {
        // Reenviar solicitud
        return `${solicitud.contenido_resumen}\n\n✅ Responde: SI\n❌ Responde: NO`;
    }
}

// ============================================================
// Procesar confirmación (SI)
// ============================================================

async function procesarConfirmacion(telefono, solicitud) {
    // Marcar como vista
    await supabase
        .from('signature_requests')
        .update({ estado: 'vista' })
        .eq('id', solicitud.id);

    // Crear sesión esperando PIN
    await supabase
        .from('whatsapp_sessions')
        .upsert({
            telefono,
            estado: 'esperando_pin',
            request_id: solicitud.id,
            intentos_pin: 0,
            expira_en: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        }, { onConflict: 'telefono' });

    return '🔐 Ingresa tu PIN de 4 dígitos para confirmar la firma.\n\n⏱ Tienes 5 minutos.';
}

// ============================================================
// Iniciar rechazo (NO)
// ============================================================

async function iniciarRechazo(telefono, solicitud) {
    await supabase
        .from('whatsapp_sessions')
        .upsert({
            telefono,
            estado: 'esperando_motivo',
            request_id: solicitud.id,
            expira_en: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        }, { onConflict: 'telefono' });

    return '¿Cuál es el motivo del rechazo?\n\nEscribe brevemente por qué no confirmas este turno.';
}

// ============================================================
// Procesar respuesta SI/NO por texto
// ============================================================

async function procesarRespuestaSiNo(telefono, texto, sesion) {
    const { data: solicitud } = await supabase
        .from('signature_requests')
        .select('*')
        .eq('id', sesion.request_id)
        .single();

    if (!solicitud) {
        await limpiarSesion(sesion);
        return 'Solicitud no encontrada. Contacta a tu supervisor.';
    }

    if (texto === 'SI' || texto === 'SÍ' || texto === 'YES') {
        return await procesarConfirmacion(telefono, solicitud);
    } else if (texto === 'NO') {
        return await iniciarRechazo(telefono, solicitud);
    } else {
        return 'Por favor responde:\n✅ SI — para confirmar\n❌ NO — para rechazar';
    }
}

// ============================================================
// Procesar PIN
// ============================================================

async function procesarPin(telefono, texto, sesion) {
    const pin = texto.replace(/\D/g, '');

    if (pin.length !== 4) {
        return 'El PIN debe ser de 4 dígitos numéricos. Intenta de nuevo.';
    }

    const resultado = await SignatureService.registrarFirma({
        request_id: sesion.request_id,
        pin_raw: pin,
        firmante_telefono: telefono,
        firmante_canal: 'whatsapp'
    });

    if (resultado.success) {
        await limpiarSesion(sesion);

        const { data: solicitud } = await supabase
            .from('signature_requests')
            .select('contenido_completo')
            .eq('id', sesion.request_id)
            .single();

        const doc = solicitud?.contenido_completo || {};
        const montoFmt = doc.monto
            ? `$${Number(doc.monto).toLocaleString('es-MX')} MXN`
            : '';

        return `✅ FIRMADO — ${new Date().toLocaleDateString('es-MX')}\n\n` +
            `${doc.equipo_modelo || ''} ${doc.equipo_serie || ''}\n` +
            `${doc.horas || ''}h — ${montoFmt}\n\n` +
            `Firma: #${resultado.firma_hash.substring(0, 8)}...\n\n` +
            `Registro listo para conciliación.`;

    } else {
        if (resultado.error === 'PIN incorrecto') {
            const intentosRestantes = resultado.intentos_restantes;

            if (intentosRestantes <= 0) {
                await limpiarSesion(sesion);
                return '🔒 PIN bloqueado por 15 minutos. Contacta a tu supervisor.';
            }

            await supabase
                .from('whatsapp_sessions')
                .update({ intentos_pin: sesion.intentos_pin + 1 })
                .eq('id', sesion.id);

            return `❌ PIN incorrecto. ${intentosRestantes} intento${intentosRestantes > 1 ? 's' : ''} restante${intentosRestantes > 1 ? 's' : ''}.`;

        } else if (resultado.error === 'Solicitud expirada') {
            await limpiarSesion(sesion);
            return '⏰ Esta solicitud expiró. Contacta a tu supervisor para reenviarla.';

        } else {
            await limpiarSesion(sesion);
            return `❌ Error: ${resultado.error}. Contacta a tu supervisor.`;
        }
    }
}

// ============================================================
// Procesar motivo de rechazo
// ============================================================

async function procesarMotivoRechazo(telefono, texto, sesion) {
    if (!texto || texto.length < 5) {
        return 'Por favor describe el motivo (mínimo 5 caracteres).';
    }

    const { data: solicitud } = await supabase
        .from('signature_requests')
        .select('*')
        .eq('id', sesion.request_id)
        .single();

    if (!solicitud) {
        await limpiarSesion(sesion);
        return 'Solicitud no encontrada.';
    }

    // Actualizar solicitud como rechazada
    await supabase
        .from('signature_requests')
        .update({
            estado: 'rechazada',
            motivo_rechazo: texto
        })
        .eq('id', solicitud.id);

    // Actualizar estado del turno
    if (solicitud.documento_tabla === 'turnos') {
        const esResidente = solicitud.firmante_rol.includes('arrendatario');
        if (esResidente) {
            await supabase
                .from('turnos')
                .update({ firma_residente_status: 'rejected' })
                .eq('id', solicitud.documento_id);
        }
    }

    // Notificar a Ulises
    await supabase.from('notificaciones').insert({
        tipo: 'firma_rechazada',
        titulo: `Firma rechazada — ${solicitud.contenido_completo?.equipo_modelo || 'Turno'}`,
        mensaje: `Motivo: ${texto}`,
        turno_id: solicitud.documento_id,
        para_usuario: 'ulises'
    });

    await limpiarSesion(sesion);

    return `❌ Rechazo registrado.\nMotivo: ${texto}\n\nEl supervisor será notificado.`;
}

// ============================================================
// Limpiar sesión
// ============================================================

async function limpiarSesion(sesion) {
    await supabase
        .from('whatsapp_sessions')
        .update({
            estado: 'idle',
            request_id: null,
            intentos_pin: 0,
            metadata: '{}',
            expira_en: new Date().toISOString()
        })
        .eq('id', sesion.id);
}

module.exports = { procesarMensajeFirma };