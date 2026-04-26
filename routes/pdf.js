const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { generarPDFConciliacion } = require('../services/pdfConciliacion');
const { generarPDFReporteDiario } = require('../services/pdfReporteDiario');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function asegurarBuckets() {
    try {
        const { data: buckets } = await supabase.storage.listBuckets();
        const nombres = buckets?.map(b => b.name) || [];

        if (!nombres.includes('pdfs_conciliacion')) {
            await supabase.storage.createBucket('pdfs_conciliacion', {
                public: true,
                fileSizeLimit: 10485760
            });
            console.log('Bucket pdfs_conciliacion creado');
        }

        if (!nombres.includes('evidencia_fotos')) {
            await supabase.storage.createBucket('evidencia_fotos', {
                public: true,
                fileSizeLimit: 52428800
            });
            console.log('Bucket evidencia_fotos creado');
        }
    } catch (error) {
        console.error('Error asegurando buckets:', error);
    }
}

asegurarBuckets().catch(console.error);

function esUUIDValido(str) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
}

function generarFolio(turnoId) {
    const fecha = new Date();
    const yyyymmdd = fecha.toISOString().slice(0, 10).replace(/-/g, '');
    const hash = crypto
        .createHash('md5')
        .update(turnoId + Date.now().toString())
        .digest('hex')
        .substring(0, 6)
        .toUpperCase();
    return 'DPM-' + yyyymmdd + '-' + hash;
}

// CONCILIACION — POST por UUID
router.post('/generar/:turno_id', async (req, res) => {
    const { turno_id } = req.params;

    if (!esUUIDValido(turno_id)) {
        return res.status(400).json({
            error: 'Formato de turno_id invalido',
            mensaje: 'Se esperaba un UUID valido'
        });
    }

    try {
        const { data: turno, error: turnoError } = await supabase
            .from('turnos')
            .select('id, firma_residente_status')
            .eq('id', turno_id)
            .single();

        if (turnoError || !turno) {
            return res.status(404).json({
                error: 'Turno no encontrado',
                turno_id
            });
        }

        const pdfBuffer = await generarPDFConciliacion(turno_id);

        const folio = generarFolio(turno_id);
        const nombreArchivo = 'conciliacion_' + folio + '_' + Date.now() + '.pdf';

        const { data: upload, error: uploadError } = await supabase
            .storage
            .from('pdfs_conciliacion')
            .upload(nombreArchivo, pdfBuffer, {
                contentType: 'application/pdf',
                upsert: true
            });

        if (uploadError) {
            console.log('Upload fallo, devolviendo PDF directo:', uploadError.message);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="' + nombreArchivo + '"');
            return res.send(pdfBuffer);
        }

        const { data: urlData } = supabase
            .storage
            .from('pdfs_conciliacion')
            .getPublicUrl(nombreArchivo);

        console.log('PDF_GENERADO', JSON.stringify({
            turno_id,
            folio,
            archivo: nombreArchivo,
            timestamp: new Date().toISOString()
        }));

        return res.json({
            success: true,
            folio,
            archivo: nombreArchivo,
            url_descarga: urlData.publicUrl,
            turno_id
        });

    } catch (error) {
        console.error('Error generando PDF:', error);
        return res.status(500).json({
            error: 'Error interno generando PDF',
            detalle: error.message
        });
    }
});

// CONCILIACION — GET descargar por UUID
router.get('/descargar/:turno_id', async (req, res) => {
    const { turno_id } = req.params;

    if (!esUUIDValido(turno_id)) {
        return res.status(400).json({ error: 'Formato de turno_id invalido' });
    }

    try {
        const { data: archivos, error } = await supabase
            .storage
            .from('pdfs_conciliacion')
            .list('', {
                search: turno_id.substring(0, 8),
                limit: 1,
                sortBy: { column: 'created_at', order: 'desc' }
            });

        if (error || !archivos || archivos.length === 0) {
            return res.status(404).json({
                error: 'No hay PDF generado para este turno',
                turno_id
            });
        }

        const { data: archivo, error: downloadError } = await supabase
            .storage
            .from('pdfs_conciliacion')
            .download(archivos[0].name);

        if (downloadError) {
            return res.status(500).json({
                error: 'Error descargando PDF',
                detalle: downloadError.message
            });
        }

        const buffer = Buffer.from(await archivo.arrayBuffer());
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="' + archivos[0].name + '"');
        return res.send(buffer);

    } catch (error) {
        console.error('Error descargando PDF:', error);
        return res.status(500).json({
            error: 'Error interno',
            detalle: error.message
        });
    }
});

// REPORTE DIARIO — GET por folio
router.get('/reporte-diario/:folio', async (req, res) => {
    const { folio } = req.params;

    if (!folio || !folio.startsWith('IS-')) {
        return res.status(400).json({
            error: 'Formato de folio invalido',
            mensaje: 'Se esperaba un folio IS-YYYY-MM-DD-EQUIPO-XXX'
        });
    }

    try {
        const pdfBuffer = await generarPDFReporteDiario(folio);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="' + folio + '.pdf"');
        return res.send(pdfBuffer);

    } catch (error) {
        console.error('Error generando Reporte Diario:', error);
        return res.status(500).json({
            error: 'Error generando Reporte Diario',
            detalle: error.message
        });
    }
});

module.exports = router;
