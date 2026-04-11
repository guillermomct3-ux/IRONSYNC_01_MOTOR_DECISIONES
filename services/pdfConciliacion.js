// IRONSYNC SIGN — PDF Conciliacion v2.0
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const supabase = require('../lib/supabaseClient');

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

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { height } = page.getSize();

  page.drawText('IRONSYNC - CONCILIACION DE TURNO', {
    x: 50, y: height - 60,
    size: 18, font: fontBold,
    color: rgb(0.1, 0.1, 0.1)
  });

  page.drawText('DPM Construcciones / Mota Engil', {
    x: 50, y: height - 85,
    size: 12, font,
    color: rgb(0.3, 0.3, 0.3)
  });

  page.drawLine({
    start: { x: 50, y: height - 100 },
    end: { x: 562, y: height - 100 },
    thickness: 1, color: rgb(0.8, 0.8, 0.8)
  });

  const datos = [
    ['Turno ID:', turno.id],
    ['Operador:', operador ? operador.nombre : turno.operador_id],
    ['Equipo:', equipo ? equipo.nombre : turno.equipo_id],
    ['Inicio:', new Date(turno.inicio).toLocaleString('es-MX')],
    ['Fin:', turno.fin ? new Date(turno.fin).toLocaleString('es-MX') : 'En curso'],
    ['Horometro inicio:', turno.horometro_inicio ? turno.horometro_inicio + ' hrs' : 'N/A'],
    ['Horometro fin:', turno.horometro_fin ? turno.horometro_fin + ' hrs' : 'N/A'],
    ['Horas trabajadas:', turno.horas_trabajadas ? turno.horas_trabajadas + ' hrs' : 'N/A'],
  ];

  let y = height - 140;
  for (const [label, valor] of datos) {
    page.drawText(label, { x: 50, y, size: 11, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(String(valor), { x: 200, y, size: 11, font, color: rgb(0.1, 0.1, 0.1) });
    y -= 28;
  }

  y -= 20;
  page.drawLine({
    start: { x: 50, y },
    end: { x: 562, y },
    thickness: 1, color: rgb(0.8, 0.8, 0.8)
  });

  y -= 30;
  page.drawText('FIRMA DIGITAL DEL RESIDENTE', {
    x: 50, y, size: 13, font: fontBold, color: rgb(0.1, 0.1, 0.1)
  });

  y -= 25;
  page.drawText('Firmado por: ' + (firma.firmante_nombre || firma.firmante_telefono), {
    x: 50, y, size: 11, font, color: rgb(0.2, 0.2, 0.2)
  });

  y -= 20;
  page.drawText('Fecha firma: ' + new Date(firma.firmado_en).toLocaleString('es-MX'), {
    x: 50, y, size: 11, font, color: rgb(0.2, 0.2, 0.2)
  });

  y -= 20;
  page.drawText('Hash: ' + firma.firma_hash, {
    x: 50, y, size: 8, font, color: rgb(0.5, 0.5, 0.5)
  });

  page.drawText('Generado por IronSync - ' + new Date().toLocaleString('es-MX'), {
    x: 50, y: 40, size: 9, font, color: rgb(0.6, 0.6, 0.6)
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

module.exports = { generarPDFConciliacion };