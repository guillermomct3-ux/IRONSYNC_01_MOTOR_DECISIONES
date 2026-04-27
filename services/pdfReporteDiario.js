const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// COLORES FROZEN
const NEGRO = rgb(0.1, 0.1, 0.1);
const BLANCO = rgb(1, 1, 1);
const ROJO_DPM = rgb(0.72, 0.11, 0.11);
const GRIS_TEXTO = rgb(0.29, 0.27, 0.25);
const GRIS_MUTED = rgb(0.54, 0.52, 0.49);
const GRIS_SUPERFICIE = rgb(0.94, 0.93, 0.92);
const GRIS_BORDE = rgb(0.85, 0.84, 0.82);
const VERDE = rgb(0.12, 0.42, 0.18);
const NARANJA = rgb(0.66, 0.36, 0);
const ROJO_EVENTO = rgb(0.72, 0.11, 0.11);
const NEGRO_BARRA = rgb(0.1, 0.1, 0.1);

// UTILIDADES

function formatearFecha(fechaISO) {
  if (!fechaISO) return '\u2014';
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const d = new Date(fechaISO);
  return d.getDate() + ' ' + meses[d.getMonth()] + ' ' + d.getFullYear();
}

function formatearHora(fechaISO) {
  if (!fechaISO) return '\u2014';
  const d = new Date(fechaISO);
  return String(d.getHours()).padStart(2, '0') + ':' +
         String(d.getMinutes()).padStart(2, '0');
}

function formatearTimestamp(fechaISO) {
  if (!fechaISO) return '\u2014';
  const d = new Date(fechaISO);
  return d.toLocaleDateString('es-MX') + ' \u00b7 ' +
         String(d.getHours()).padStart(2, '0') + ':' +
         String(d.getMinutes()).padStart(2, '0') + ':' +
         String(d.getSeconds()).padStart(2, '0');
}

function formatearDuracion(duracionMin) {
  if (!duracionMin) return '';
  if (duracionMin < 60) return duracionMin + ' min';
  const horas = Math.floor(duracionMin / 60);
  const mins = duracionMin % 60;
  return horas + 'h ' + mins + 'm';
}

function colorEvento(tipoEvento) {
  if (!tipoEvento) return GRIS_TEXTO;
  const tipo = tipoEvento.toUpperCase();
  if (tipo.includes('INICIO') || tipo.includes('REANUDA')) return VERDE;
  if (tipo.includes('PARO') || tipo.includes('FALLA')) return NARANJA;
  if (tipo.includes('FIN')) return ROJO_EVENTO;
  return GRIS_TEXTO;
}

function iconoEvento(tipoEvento) {
  if (!tipoEvento) return '?';
  const tipo = tipoEvento.toUpperCase();
  if (tipo.includes('INICIO')) return 'I';
  if (tipo.includes('PARO') || tipo.includes('FALLA')) return 'P';
  if (tipo.includes('REANUDA')) return 'R';
  if (tipo.includes('FIN')) return 'F';
  return '?';
}

function tipoEventoLegible(tipoEvento) {
  if (!tipoEvento) return 'EVENTO';
  const tipo = tipoEvento.toUpperCase();
  if (tipo === 'PARO_CLI') return 'PARO';
  if (tipo === 'PARO_ARR') return 'FALLA';
  if (tipo === 'PARO_PROG') return 'PARO PROGRAMADO';
  if (tipo === 'PARO_ZG') return 'PARO CLIMA';
  if (tipo === 'PARO_OTRO') return 'PARO';
  if (tipo === 'PARO_INDEFINIDO') return 'PARO';
  if (tipo === 'FALLA') return 'FALLA';
  return tipo;
}

function limpiarTelefono(telefono) {
  if (!telefono) return '\u2014';
  return telefono
    .replace('whatsapp:', '')
    .replace('+52', '+52 ');
}

// GENERADOR PDF

async function generarPDFReporteDiario(folio) {
  const { data: turnos, error: turnoError } = await supabase
    .from('turnos')
    .select('*')
    .eq('folio', folio)
    .order('inicio', { ascending: false })
    .limit(1);

  const turno = turnos && turnos.length > 0 ? turnos[0] : null;

  if (turnoError || !turno) {
    throw new Error('Turno no encontrado con folio: ' + folio);
  }

  const { data: eventos } = await supabase
    .from('turno_eventos')
    .select('*')
    .eq('turno_id', turno.id)
    .order('created_at', { ascending: true });

  const horometroInicio = turno.horometro_inicio || 0;
  const horometroFin = turno.horometro_fin || 0;
  const horasHorometro = turno.horas_horometro ||
    Math.round((horometroFin - horometroInicio) * 10) / 10;

  const paros = (eventos || []).filter(e =>
    e.tipo_evento && (
      e.tipo_evento.startsWith('PARO_') ||
      e.tipo_evento === 'FALLA'
    )
  );
  const totalParosMin = paros.reduce((sum, p) => sum + (p.duracion_min || 0), 0);
  const totalParosHrs = Math.round((totalParosMin / 60) * 10) / 10;

  const nombreOperador = turno.operador_nombre ||
    limpiarTelefono(turno.operador_telefono) || 'No registrado';

  // FIX 14: Variables de alerta visual para operador no registrado
  const operadorRegistrado = !!turno.operador_nombre;
  const opNombreDisplay = operadorRegistrado ? turno.operador_nombre : 'OPERADOR NO REGISTRADO';
  const opColorNombre = operadorRegistrado ? GRIS_TEXTO : ROJO_DPM;

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  const MARGIN_LEFT = 40;
  const MARGIN_RIGHT = width - 40;
  const CONTENT_WIDTH = MARGIN_RIGHT - MARGIN_LEFT;
  let y = height - 40;

  function drawText(text, x, yPos, options = {}) {
    const f = options.bold ? fontBold : font;
    const size = options.size || 10;
    const color = options.color || GRIS_TEXTO;
    page.drawText(String(text), {
      x: x,
      y: yPos,
      size: size,
      font: f,
      color: color,
    });
  }

  function drawRect(x, yPos, w, h, color) {
    page.drawRectangle({
      x: x,
      y: yPos,
      width: w,
      height: h,
      color: color,
    });
  }

  function drawLine(x1, y1, x2, y2, color) {
    page.drawLine({
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      thickness: 0.5,
      color: color || GRIS_BORDE,
    });
  }

  // SECCION 1: HEADER
  const HEADER_H = 60;
  drawRect(0, y - HEADER_H, width, HEADER_H, NEGRO);

  drawRect(MARGIN_LEFT, y - 45, 36, 30, ROJO_DPM);
  drawText('IS', MARGIN_LEFT + 8, y - 35,
    { bold: true, size: 18, color: BLANCO });

  drawText('REPORTE DIARIO DE MAQUINARIA', MARGIN_LEFT + 48, y - 22,
    { bold: true, size: 16, color: BLANCO });
  drawText('Formato DPM No. 63452 \u2014 Digital', MARGIN_LEFT + 48, y - 38,
    { size: 9, color: BLANCO });
  drawText('IronSync \u00b7 Bitacora Digital', MARGIN_LEFT + 48, y - 50,
    { size: 8, color: BLANCO });

  const folioText = turno.folio || folio;
  const folioWidth = fontBold.widthOfTextAtSize(folioText, 12);
  drawText(folioText, MARGIN_RIGHT - folioWidth - 10, y - 22,
    { bold: true, size: 12, color: ROJO_DPM });

  y -= HEADER_H + 10;

  // SECCION 2: BARRA DE VALIDACION
  const BARRA_H = 24;
  drawRect(MARGIN_LEFT, y - BARRA_H, CONTENT_WIDTH, BARRA_H, GRIS_SUPERFICIE);
  drawText('Estado de Validacion', MARGIN_LEFT + 10, y - 16,
    { bold: true, size: 8, color: GRIS_MUTED });
  const estadoFirma = turno.firma_residente_status === 'firmado'
    ? 'Validado por residente'
    : 'Residente: pendiente de firma';
  drawText(estadoFirma, MARGIN_RIGHT - 200, y - 16,
    { size: 9, color: GRIS_TEXTO });

  y -= BARRA_H + 10;

  // SECCION 3: DATOS GENERALES
  drawText('DATOS GENERALES', MARGIN_LEFT, y,
    { bold: true, size: 8, color: GRIS_MUTED });
  y -= 15;

  const gridData = [
    ['Fecha', formatearFecha(turno.inicio || turno.fecha_turno)],
    ['Turno', formatearHora(turno.inicio) + ' \u2014 ' + formatearHora(turno.fin)],
    ['Lugar', turno.observaciones || 'Registrado en campo'],
    ['Compania', 'Mota-Engil Mexico'],
    ['Contrato', turno.contrato_id || 'DPM-ME-2026-047'],
    ['Maquina', turno.maquina || '\u2014'],
    ['Serie', turno.serie || 'SIN-SERIE'],
    ['QR Equipo', 'Escaneado \u00b7 ' + formatearHora(turno.inicio)],
  ];

  const cols = 3;
  const colWidth = CONTENT_WIDTH / cols;
  const cellH = 16;

  for (let i = 0; i < gridData.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = MARGIN_LEFT + (col * colWidth);
    const cy = y - (row * cellH);

    if (row > 0 && col === 0) {
      drawLine(MARGIN_LEFT, cy + cellH, MARGIN_RIGHT, cy + cellH, GRIS_BORDE);
    }

    drawText(gridData[i][0], cx + 5, cy + 2,
      { bold: true, size: 7, color: GRIS_MUTED });
    drawText(gridData[i][1], cx + 5, cy - 10,
      { size: 9, color: GRIS_TEXTO });

    if (col < cols - 1) {
      drawLine(cx + colWidth, cy + cellH, cx + colWidth, cy - cellH + 8, GRIS_BORDE);
    }
  }

  const gridRows = Math.ceil(gridData.length / cols);
  y -= (gridRows * cellH) + 10;

  drawLine(MARGIN_LEFT, y + 5, MARGIN_RIGHT, y + 5, GRIS_BORDE);
  y -= 5;

  // SECCION 4: OPERADOR — FIX 14: color rojo si no registrado
  drawText('OPERADOR', MARGIN_LEFT, y,
    { bold: true, size: 8, color: GRIS_MUTED });
  y -= 15;

  drawText('Nombre', MARGIN_LEFT + 5, y + 2,
    { bold: true, size: 7, color: GRIS_MUTED });
  drawText(opNombreDisplay,
    MARGIN_LEFT + 5, y - 10,
    { size: 10, color: opColorNombre });

  drawText('Telefono', MARGIN_LEFT + colWidth + 5, y + 2,
    { bold: true, size: 7, color: GRIS_MUTED });
  drawText(limpiarTelefono(turno.operador_telefono),
    MARGIN_LEFT + colWidth + 5, y - 10,
    { size: 10, color: GRIS_TEXTO });

  y -= 25;
  drawLine(MARGIN_LEFT, y + 5, MARGIN_RIGHT, y + 5, GRIS_BORDE);
  y -= 5;

  // SECCION 5: HOROMETRO + EVIDENCIA
  drawText('HOROMETRO Y EVIDENCIA', MARGIN_LEFT, y,
    { bold: true, size: 8, color: GRIS_MUTED });
  y -= 15;

  const halfWidth = CONTENT_WIDTH / 2;

  drawRect(MARGIN_LEFT, y - 40, halfWidth - 5, 40, GRIS_SUPERFICIE);
  drawText('Horometro Inicial', MARGIN_LEFT + 10, y - 12,
    { bold: true, size: 8, color: GRIS_MUTED });
  drawText(String(horometroInicio), MARGIN_LEFT + 10, y - 30,
    { bold: true, size: 18, color: GRIS_TEXTO });
  drawText(formatearHora(turno.inicio) + ' hrs', MARGIN_LEFT + 10, y - 38,
    { size: 8, color: GRIS_MUTED });

  const finalX = MARGIN_LEFT + halfWidth + 5;
  drawRect(finalX, y - 40, halfWidth - 5, 40, GRIS_SUPERFICIE);
  drawText('Horometro Final', finalX + 10, y - 12,
    { bold: true, size: 8, color: GRIS_MUTED });
  drawText(horometroFin ? String(horometroFin) : '\u2014', finalX + 10, y - 30,
    { bold: true, size: 18, color: GRIS_TEXTO });
  drawText(formatearHora(turno.fin) + ' hrs', finalX + 10, y - 38,
    { size: 8, color: GRIS_MUTED });

  drawText(
    turno.foto_inicio_url
      ? 'Foto registrada en sistema'
      : 'Evidencia fotografica: no adjuntada',
    MARGIN_LEFT + 10, y - 52, { size: 7, color: GRIS_MUTED });
  drawText(
    turno.foto_fin_url
      ? 'Foto registrada en sistema'
      : 'Evidencia fotografica: no adjuntada',
    finalX + 10, y - 52, { size: 7, color: GRIS_MUTED });

  y -= 65;
  drawLine(MARGIN_LEFT, y + 5, MARGIN_RIGHT, y + 5, GRIS_BORDE);
  y -= 5;

  // SECCION 6: TIMELINE DE EVENTOS
  drawText('TIMELINE DE EVENTOS', MARGIN_LEFT, y,
    { bold: true, size: 8, color: GRIS_MUTED });
  y -= 15;

  drawRect(MARGIN_LEFT + 5, y - 5, 16, 16, VERDE);
  drawText('I', MARGIN_LEFT + 10, y - 1,
    { bold: true, size: 10, color: BLANCO });
  drawText(formatearHora(turno.inicio), MARGIN_LEFT + 28, y,
    { bold: true, size: 10, color: GRIS_TEXTO });
  drawText('INICIO', MARGIN_LEFT + 75, y,
    { bold: true, size: 9, color: VERDE });
  drawText('Horometro: ' + horometroInicio + ' \u00b7 Operador: ' + nombreOperador,
    MARGIN_LEFT + 28, y - 14, { size: 8, color: GRIS_MUTED });

  y -= 30;

  const timelineLineX = MARGIN_LEFT + 13;
  const timelineStartY = y + 15;

  for (const evento of paros) {
    const col = colorEvento(evento.tipo_evento);
    const icon = iconoEvento(evento.tipo_evento);
    const tipo = tipoEventoLegible(evento.tipo_evento);
    const duracionFmt = formatearDuracion(evento.duracion_min);

    drawRect(MARGIN_LEFT + 5, y - 5, 16, 16, NARANJA);
    drawText(icon, MARGIN_LEFT + 10, y - 1,
      { bold: true, size: 10, color: BLANCO });

    drawText(formatearHora(evento.timestamp_inicio), MARGIN_LEFT + 28, y,
      { bold: true, size: 10, color: GRIS_TEXTO });
    drawText(tipo, MARGIN_LEFT + 75, y,
      { bold: true, size: 9, color: col });

    const motivo = evento.motivo || 'Sin motivo especificado';
    drawText('Motivo reportado por operador: ' + motivo +
      (duracionFmt ? ' \u00b7 ' + duracionFmt : ''),
      MARGIN_LEFT + 28, y - 14, { size: 8, color: GRIS_MUTED });

    const evidenciaTexto = evento.foto_url
      ? 'Foto evidencia adjunta'
      : 'Evidencia fotografica: no adjuntada';
    drawText(evidenciaTexto, MARGIN_LEFT + 28, y - 26,
      { size: 7, color: GRIS_MUTED });

    y -= 38;
  }

  if (turno.fin) {
    drawRect(MARGIN_LEFT + 5, y - 5, 16, 16, ROJO_EVENTO);
    drawText('F', MARGIN_LEFT + 10, y - 1,
      { bold: true, size: 10, color: BLANCO });
    drawText(formatearHora(turno.fin), MARGIN_LEFT + 28, y,
      { bold: true, size: 10, color: GRIS_TEXTO });
    drawText('FIN', MARGIN_LEFT + 75, y,
      { bold: true, size: 9, color: ROJO_EVENTO });
    drawText('Horometro: ' + horometroFin,
      MARGIN_LEFT + 28, y - 14, { size: 8, color: GRIS_MUTED });
    y -= 30;
  }

  drawLine(timelineLineX, timelineStartY, timelineLineX, y + 15, GRIS_BORDE);

  y -= 5;
  drawLine(MARGIN_LEFT, y + 5, MARGIN_RIGHT, y + 5, GRIS_BORDE);
  y -= 5;

  // SECCION 7: RESUMEN DE HORAS
  drawText('RESUMEN DE HORAS', MARGIN_LEFT, y,
    { bold: true, size: 8, color: GRIS_MUTED });
  y -= 15;

  drawRect(MARGIN_LEFT, y - 35, halfWidth - 5, 35, GRIS_SUPERFICIE);
  drawText('Horometro (Total)', MARGIN_LEFT + 10, y - 10,
    { bold: true, size: 8, color: GRIS_MUTED });
  drawText(horasHorometro + ' hrs', MARGIN_LEFT + 10, y - 28,
    { bold: true, size: 16, color: VERDE });

  drawRect(finalX, y - 35, halfWidth - 5, 35, GRIS_SUPERFICIE);
  drawText('Paros registrados', finalX + 10, y - 10,
    { bold: true, size: 8, color: GRIS_MUTED });
  const parosDisplay = totalParosMin < 60
    ? totalParosMin + ' min'
    : totalParosHrs + ' hrs';
  drawText(parosDisplay, finalX + 10, y - 28,
    { bold: true, size: 16, color: NARANJA });

  y -= 45;

  drawRect(MARGIN_LEFT, y - 35, CONTENT_WIDTH, 35, NEGRO_BARRA);
  drawText('Total Registrado', MARGIN_LEFT + 10, y - 12,
    { bold: true, size: 8, color: BLANCO });
  drawText(horasHorometro + ' hrs', MARGIN_RIGHT - 100, y - 12,
    { bold: true, size: 18, color: BLANCO });

  const horasOperando = Math.round(
    (horasHorometro - totalParosHrs) * 10) / 10;
  const parosBarraFmt = totalParosMin < 60
    ? totalParosMin + ' min'
    : totalParosHrs + ' hrs';
  drawText(
    horasOperando + ' hrs operando \u00b7 ' +
    parosBarraFmt + ' paro (incluidas en horometro)',
    MARGIN_LEFT + 10, y - 28, { size: 8, color: BLANCO });

  y -= 45;

  drawText(
    'Paros registrados tal como fueron reportados. ' +
    'Clasificacion y negociacion entre las partes.',
    MARGIN_LEFT, y, { size: 7, color: GRIS_MUTED });

  y -= 15;
  drawLine(MARGIN_LEFT, y + 5, MARGIN_RIGHT, y + 5, GRIS_BORDE);
  y -= 5;

  // SECCION 8: VALIDACION / FIRMAS — FIX 14: color rojo si no registrado
  drawText('VALIDACION', MARGIN_LEFT, y,
    { bold: true, size: 8, color: GRIS_MUTED });
  y -= 15;

  const firmaW = (CONTENT_WIDTH - 10) / 2;
  drawRect(MARGIN_LEFT, y - 70, firmaW, 70, GRIS_SUPERFICIE);
  drawText('OPERADOR', MARGIN_LEFT + 10, y - 12,
    { bold: true, size: 8, color: GRIS_MUTED });
  drawText(opNombreDisplay,
    MARGIN_LEFT + 10, y - 26,
    { bold: true, size: 11, color: opColorNombre });
  drawText('PIN validado', MARGIN_LEFT + 10, y - 38,
    { size: 9, color: VERDE });
  drawText(formatearTimestamp(turno.inicio),
    MARGIN_LEFT + 10, y - 50,
    { size: 8, color: GRIS_MUTED });
  drawText('Confirmo que estos hechos ocurrieron',
    MARGIN_LEFT + 10, y - 62,
    { size: 7, color: GRIS_MUTED });
  drawText('tal como los reporte',
    MARGIN_LEFT + 10, y - 70,
    { size: 7, color: GRIS_MUTED });

  const firma2X = MARGIN_LEFT + firmaW + 10;
  drawRect(firma2X, y - 70, firmaW, 70, GRIS_SUPERFICIE);
  drawText('RESIDENTE', firma2X + 10, y - 12,
    { bold: true, size: 8, color: GRIS_MUTED });
  drawText('Ing. o Encargado', firma2X + 10, y - 26,
    { bold: true, size: 11, color: GRIS_TEXTO });
  drawText('Pendiente de firma', firma2X + 10, y - 38,
    { size: 9, color: GRIS_MUTED });
  drawText('\u2014', firma2X + 10, y - 50,
    { size: 8, color: GRIS_MUTED });
  drawText('Confirmo que estos hechos ocurrieron',
    firma2X + 10, y - 62,
    { size: 7, color: GRIS_MUTED });
  drawText('tal como los presencie',
    firma2X + 10, y - 70,
    { size: 7, color: GRIS_MUTED });

  y -= 80;

  drawRect(MARGIN_LEFT, y - 18, CONTENT_WIDTH, 18, GRIS_SUPERFICIE);
  drawText(
    'La firma valida los hechos registrados. ' +
    'No implica acuerdo sobre conceptos facturables.',
    MARGIN_LEFT + 10, y - 12, { size: 8, color: GRIS_MUTED });

  y -= 30;

  // SECCION 9: PIE DE PAGINA
  drawLine(MARGIN_LEFT, y + 5, MARGIN_RIGHT, y + 5, GRIS_BORDE);

  drawText(folioText, MARGIN_LEFT, y - 5,
    { size: 8, color: GRIS_MUTED });
  drawText(
    'Generado: ' + formatearTimestamp(new Date().toISOString()) +
    ' \u00b7 IronSync',
    MARGIN_LEFT, y - 16, { size: 7, color: GRIS_MUTED });

  drawText('IRONSYNC', MARGIN_RIGHT - 70, y - 5,
    { bold: true, size: 10, color: GRIS_MUTED });

  y -= 30;

  drawText(
    'Este documento registra hechos operativos tal como ' +
    'fueron reportados y presenciados.',
    MARGIN_LEFT, y, { size: 7, color: GRIS_MUTED });
  drawText(
    'IronSync no determina responsabilidades, no clasifica ' +
    'eventos para fines de cobro',
    MARGIN_LEFT, y - 10, { size: 7, color: GRIS_MUTED });
  drawText(
    'y no emite juicios sobre la operacion. Para disputas ' +
    'comerciales o legales, contacte a las partes involucradas.',
    MARGIN_LEFT, y - 20, { size: 7, color: GRIS_MUTED });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

module.exports = { generarPDFReporteDiario };
