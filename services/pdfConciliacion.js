const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function generarPDFConciliacion(turnoId) {
    const { data: turno, error: turnoError } = await supabase
        .from('turnos')
        .select('*')
        .eq('id', turnoId)
        .single();

    if (turnoError || !turno) throw new Error('Turno no encontrado');

    const { data: firma } = await supabase
        .from('signature_records')
        .select('*')
        .eq('documento_id', turnoId)
        .single();

    if (!firma) throw new Error('El turno no tiene firma del residente');

    const { data: operador } = await supabase
        .from('operadores')
        .select('*')
        .eq('telefono', turno.operador_id)
        .single();

    const { data: equipo } = await supabase
        .from('equipos')
        .select('*')
        .eq('id', turno.equipo_id)
        .single();

    let nombre_contrato = 'DPM-MOTA-2026';
    if (turno.contrato_id) {
        const { data: contrato } = await supabase
            .from('contratos')
            .select('nombre')
            .eq('id', turno.contrato_id)
            .single();
        if (contrato?.nombre) nombre_contrato = contrato.nombre;
    }

    const pdfDoc = await PDFDocument.create();
    pdfDoc.setTitle('Conciliacion IronSync');
    pdfDoc.setAuthor('IronSync A');
    pdfDoc.setSubject('Reporte Diario de Maquinaria');
    pdfDoc.setProducer('IronSync Sign v2.1');
    pdfDoc.setCreationDate(new Date());

    const page = pdfDoc.addPage([612, 792]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    const { height } = page.getSize();

    const gris = rgb(0.5, 0.5, 0.5);
    const negro = rgb(0.1, 0.1, 0.1);
    const oscuro = rgb(0.2, 0.2, 0.2);
    const verde = rgb(0.1, 0.6, 0.2);

    page.drawText('IRONSYNC - CONCILIACION DE TURNO', {
        x: 50, y: height - 55,
        size: 18, font: fontBold, color: negro
    });

    page.drawText('DPM Construcciones / Mota Engil', {
        x: 50, y: height - 78,
        size: 12, font, color: rgb(0.3, 0.3, 0.3)
    });

    const turnoIdCorto = turnoId.substring(0, 8).toUpperCase();
    page.drawText('ID: IS-' + turnoIdCorto, {
        x: 400, y: height - 55,
        size: 11, font: fontBold, color: negro
    });

    page.drawText(
        turno.fecha_turno
            ? new Date(turno.fecha_turno).toLocaleDateString('es-MX')
            : new Date().toLocaleDateString('es-MX'),
        { x: 400, y: height - 72, size: 10, font, color: gris }
    );

    page.drawLine({
        start: { x: 50, y: height - 95 },
        end: { x: 562, y: height - 95 },
        thickness: 1.5, color: negro
    });

    const horasTurno = turno.horas_turno || 0;
    const tarifaHora = turno.tarifa_aplicada || 0;
    const montoCalculado = horasTurno * tarifaHora;

    const datos = [
        ['Operador:', operador ? operador.nombre : turno.operador_id],
        ['Equipo:', equipo ? equipo.nombre : (turno.maquina || 'N/A')],
        ['Obra / Proyecto:', nombre_contrato],
        ['Fecha turno:', turno.fecha_turno
            ? new Date(turno.fecha_turno).toLocaleDateString('es-MX')
            : 'N/A'],
        ['Horometro inicio:', turno.horometro_inicio != null ? turno.horometro_inicio + ' hrs' : 'N/A'],
        ['Horometro fin:', turno.horometro_fin != null ? turno.horometro_fin + ' hrs' : 'N/A'],
        ['Horas trabajadas:', horasTurno > 0 ? horasTurno + ' hrs' : 'N/A'],
        ['Tarifa por hora:', tarifaHora > 0 ? '$' + tarifaHora.toFixed(2) + ' MXN' : 'Ver contrato'],
        ['Monto estimado:', montoCalculado > 0 ? '$' + montoCalculado.toFixed(2) + ' MXN' : 'Ver contrato'],
    ];

    let y = height - 130;
    for (const [label, valor] of datos) {
        page.drawText(label, { x: 50, y, size: 11, font: fontBold, color: oscuro });
        page.drawText(String(valor), { x: 220, y, size: 11, font, color: negro });
        y -= 27;
    }

    if (turno.evidencia_foto_url) {
        try {
            const fotoBuffer = await descargarFoto(turno.evidencia_foto_url);
            if (fotoBuffer) {
                let imagen = null;
                try { imagen = await pdfDoc.embedJpg(fotoBuffer); } catch {}
                if (!imagen) {
                    try { imagen = await pdfDoc.embedPng(fotoBuffer); } catch {}
                }
                if (imagen) {
                    const maxWidth = 180, maxHeight = 130;
                    const scale = Math.min(maxWidth / imagen.width, maxHeight / imagen.height);
                    y -= 10;
                    page.drawText('Evidencia fotografica:', { x: 50, y, size: 10, font: fontBold, color: oscuro });
                    y -= (imagen.height * scale) + 10;
                    page.drawImage(imagen, { x: 50, y, width: imagen.width * scale, height: imagen.height * scale });
                    y -= 15;
                }
            }
        } catch {}
    }

    y -= 15;
    page.drawLine({
        start: { x: 50, y }, end: { x: 562, y },
        thickness: 1, color: rgb(0.7, 0.7, 0.7)
    });

    y -= 25;
    page.drawText('VALIDACION DIGITAL DEL RESIDENTE', {
        x: 50, y, size: 13, font: fontBold, color: negro
    });

    y -= 20;
    page.drawText('Turno validado digitalmente mediante IronSync Sign.', {
        x: 50, y, size: 10, font, color: gris
    });

    y -= 25;
    page.drawText('FIRMADO POR:', {
        x: 50, y, size: 10, font: fontBold, color: verde
    });

    y -= 18;
    page.drawText(firma.firmante_nombre || firma.firmante_telefono, {
        x: 50, y, size: 14, font: fontBold, color: negro
    });

    y -= 18;
    page.drawText('Residente — Mota Engil', {
        x: 50, y, size: 10, font, color: gris
    });

    y -= 18;
    page.drawText('Fecha: ' + new Date(firma.firmado_en).toLocaleString('es-MX', {
        timeZone: 'America/Mexico_City'
    }), { x: 50, y, size: 10, font, color: oscuro });

    y -= 18;
    const hashCorto = firma.firma_hash ? firma.firma_hash.substring(0, 40) + '...' : 'N/A';
    page.drawText('Hash: ' + hashCorto, { x: 50, y, size: 8, font, color: gris });

    if (turno.snapshot_cierre_hash) {
        y -= 14;
        page.drawText('Snapshot: ' + turno.snapshot_cierre_hash.substring(0, 40) + '...', {
            x: 50, y, size: 8, font, color: gris
        });
    }

    page.drawLine({
        start: { x: 50, y: 70 }, end: { x: 562, y: 70 },
        thickness: 0.5, color: rgb(0.8, 0.8, 0.8)
    });

    page.drawText(
        'Este documento es evidencia operativa entre DPM Construcciones y Mota Engil.',
        { x: 50, y: 55, size: 7, font, color: gris }
    );

    page.drawText(
        'La firma digital confirma la revision y aprobacion de los datos segun contrato vigente.',
        { x: 50, y: 44, size: 7, font, color: gris }
    );

    page.drawText(
        'Generado por IronSync Sign v2.1 — ' + new Date().toLocaleString('es-MX', {
            timeZone: 'America/Mexico_City'
        }),
        { x: 50, y: 33, size: 7, font: fontItalic, color: gris }
    );

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
}

async function descargarFoto(url) {
    try {
        if (url.includes('api.twilio.com')) {
            const auth = Buffer.from(
                process.env.TWILIO_ACCOUNT_SID + ':' + process.env.TWILIO_AUTH_TOKEN
            ).toString('base64');
            const response = await fetch(url, { headers: { 'Authorization': 'Basic ' + auth } });
            if (!response.ok) return null;
            return Buffer.from(await response.arrayBuffer());
        }
        const response = await fetch(url);
        if (!response.ok) return null;
        return Buffer.from(await response.arrayBuffer());
    } catch {
        return null;
    }
}

module.exports = { generarPDFConciliacion };
