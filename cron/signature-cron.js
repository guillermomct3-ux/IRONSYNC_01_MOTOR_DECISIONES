// ============================================================
// IRONSYNC SIGN — Cron Job
// Archivo: cron/signature-cron.js
// Ejecutar cada 5 minutos
// ============================================================

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function ejecutarCron() {
    console.log(`[Signature Cron] Ejecutando: ${new Date().toISOString()}`);

    try {
        // 1. Expirar solicitudes vencidas
        const { data: expiradas } = await supabase
            .rpc('expirar_solicitudes_vencidas');

        if (expiradas && expiradas[0]) {
            console.log(`[Signature Cron] Expiradas: ${expiradas[0].expiradas_requests} solicitudes, ${expiradas[0].limpiadas_sessions} sesiones`);
        }

        // 2. Reintentar solicitudes pendientes con backoff
        const { data: paraReintentar } = await supabase
            .from('signature_requests')
            .select('*')
            .eq('estado', 'pendiente')
            .lt('intentos_envio', 3)
            .lte('proximo_reintento_en', new Date().toISOString())
            .limit(10);

        if (paraReintentar && paraReintentar.length > 0) {
            const SignatureService = require('../services/signature');

            for (const solicitud of paraReintentar) {
                try {
                    console.log(`[Signature Cron] Reintentando ${solicitud.id} (intento ${solicitud.intentos_envio + 1})`);
                    await SignatureService.enviarWhatsApp(solicitud);
                } catch (error) {
                    console.error(`[Signature Cron] Error reintentando ${solicitud.id}:`, error.message);
                }
            }
        }

        console.log(`[Signature Cron] Completado: ${new Date().toISOString()}`);

    } catch (error) {
        console.error('[Signature Cron] Error general:', error.message);
    }
}

// Ejecutar inmediatamente
ejecutarCron().catch(console.error);

// Ejecutar cada 5 minutos si se usa como módulo
const INTERVALO = 5 * 60 * 1000;
setInterval(ejecutarCron, INTERVALO);

module.exports = { ejecutarCron };