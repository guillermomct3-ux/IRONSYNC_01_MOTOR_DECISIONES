// ============================================================
// IRONSYNC SIGN — API Federada (Escenario B)
// Archivo: api/v1/signatures.js
// Handshake entre instancias con HMAC
// ============================================================

const express = require('express');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const SignatureService = require('../../services/signature');

const router = express.Router();
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// ============================================================
// GET /api/v1/signatures/health
// Health check para handshake entre instancias
// ============================================================

router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        instance: process.env.MY_INSTANCE_ID || 'ironsync-dpm',
        version: '1.0.4',
        timestamp: new Date().toISOString()
    });
});

// ============================================================
// GET /api/v1/signatures/verify/:token
// Verificación pública — sin autenticación
// Cualquiera puede verificar la integridad de una firma
// ============================================================

router.get('/verify/:token', async (req, res) => {
    try {
        const { token } = req.params;

        const { data: solicitud } = await supabase
            .from('signature_requests')
            .select('*')
            .eq('token_acceso', token)
            .single();

        if (!solicitud) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }

        const { data: firmas } = await supabase
            .from('signature_records')
            .select('firmante_nombre, firmante_rol, firmado_en, firma_hash, cadena_posicion, tipo_documento')
            .eq('documento_id', solicitud.documento_id)
            .eq('documento_tabla', solicitud.documento_tabla)
            .order('cadena_posicion', { ascending: true });

        res.status(200).json({
            status: solicitud.estado,
            documento: {
                tipo: solicitud.tipo_documento,
                contenido: solicitud.contenido_completo,
                hash: solicitud.contenido_hash
            },
            firmas: (firmas || []).map(f => ({
                firmante: f.firmante_nombre,
                rol: f.firmante_rol,
                firmado_en: f.firmado_en,
                hash: f.firma_hash,
                posicion: f.cadena_posicion
            })),
            total_firmas: (firmas || []).length
        });

    } catch (error) {
        console.error('Error verificando firma:', error);
        res.status(500).json({ error: 'Error interno' });
    }
});

// ============================================================
// POST /api/v1/signatures/request
// Recibe solicitud de firma de otra instancia IS (Escenario B)
// ============================================================

router.post('/request', async (req, res) => {
    try {
        const { tipo_documento, documento_id, contenido, contenido_hash, token, firmante } = req.body;

        if (!tipo_documento || !documento_id || !contenido || !token || !firmante) {
            return res.status(400).json({ error: 'Campos requeridos faltantes' });
        }

        // Verificar que el token no exista ya
        const { data: existente } = await supabase
            .from('signature_requests')
            .select('id')
            .eq('token_acceso', token)
            .single();

        if (existente) {
            return res.status(409).json({ error: 'Token ya existe' });
        }

        const contenidoResumen = SignatureService.generarResumenWhatsApp(tipo_documento, contenido);

        const { data: solicitud, error } = await supabase
            .from('signature_requests')
            .insert({
                tipo_documento,
                documento_id,
                documento_tabla: 'turnos',
                contenido_resumen: contenidoResumen,
                contenido_completo: contenido,
                contenido_hash: contenido_hash || crypto.createHash('sha256').update(JSON.stringify(contenido)).digest('hex'),
                token_acceso: token,
                firmante_rol: firmante.rol,
                firmante_nombre: firmante.nombre,
                firmante_telefono: firmante.telefono,
                firmante_canal: 'is_dashboard',
                solicitado_por: 'instancia_externa',
                resolver: 'whatsapp',
                estado: 'pendiente'
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            status: 'recibido',
            solicitud_id: solicitud.id,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error recibiendo solicitud:', error);
        res.status(500).json({ error: 'Error interno' });
    }
});

// ============================================================
// POST /api/v1/signatures/confirm
// Confirma firma desde otra instancia IS
// ============================================================

router.post('/confirm', async (req, res) => {
    try {
        const { token, firmante, contexto } = req.body;

        const { data: solicitud } = await supabase
            .from('signature_requests')
            .select('*')
            .eq('token_acceso', token)
            .single();

        if (!solicitud) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }

        const resultado = await SignatureService.registrarFirma({
            request_id: solicitud.id,
            firmante_nombre: firmante.nombre,
            firmante_rol: firmante.rol,
            firmante_telefono: solicitud.firmante_telefono,
            firmante_canal: 'api',
            contexto: contexto || {}
        });

        if (!resultado.success) {
            return res.status(400).json({ error: resultado.error });
        }

        res.status(200).json({
            status: 'firmado',
            firma_id: resultado.firma_id,
            firma_hash: resultado.firma_hash,
            firmado_en: resultado.firmado_en
        });

    } catch (error) {
        console.error('Error confirmando firma:', error);
        res.status(500).json({ error: 'Error interno' });
    }
});

// ============================================================
// POST /api/v1/signatures/reject
// Rechaza firma desde otra instancia IS
// ============================================================

router.post('/reject', async (req, res) => {
    try {
        const { token, motivo, firmante } = req.body;

        const { data: solicitud } = await supabase
            .from('signature_requests')
            .select('*')
            .eq('token_acceso', token)
            .single();

        if (!solicitud) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }

        await supabase
            .from('signature_requests')
            .update({
                estado: 'rechazada',
                motivo_rechazo: motivo
            })
            .eq('id', solicitud.id);

        // Notificar a Ulises
        await supabase.from('notificaciones').insert({
            tipo: 'firma_rechazada',
            titulo: `Firma rechazada por instancia externa`,
            mensaje: `Motivo: ${motivo}`,
            turno_id: solicitud.documento_id,
            para_usuario: 'ulises'
        });

        res.status(200).json({ status: 'rechazado' });

    } catch (error) {
        console.error('Error rechazando firma:', error);
        res.status(500).json({ error: 'Error interno' });
    }
});

module.exports = router;