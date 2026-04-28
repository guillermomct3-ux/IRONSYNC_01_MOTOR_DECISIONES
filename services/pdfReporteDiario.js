const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

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

// FIX 13: Quitar espacio innecesario en telefono
function limpiarTelefono(telefono) {
  if (!telefono) return '\u2014';
  return telefono
    .replace('whatsapp:', '')
    .replace('+', '+');
}

// FIX 6: Calcular hash de datos
function calcularHashDatos(turno, eventos) {
  const datos = {
    folio: turno.folio,
    maquina: turno.maquina,
    serie: turno.serie,
    horometro_inicio: turno.horometro_inicio,
    horometro_fin: turno.horometro_fin,
    operador_telefono: turno.operador_telefono,
    operador_nombre: turno.operador_nombre,
    inicio: turno.inicio,
    fin: turno.fin,
    fecha_turno: turno.fecha_turno,
    eventos: (eventos || []).map(function(e) {
      return {
        tipo: e.tipo_evento,
        motivo: e.motivo,
        inicio: e.timestamp_inicio,
        fin: e.timestamp_fin,
        duracion: e.duracion_min,
        cobrable: e.es_cobrable
      };
    })
  };
  return crypto.createHash('sha256')
    .update(JSON.stringify(datos))
    .digest('hex');
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

  // FIX 6: Calcular hash de datos antes de generar PDF
  const dataHash = calcularHashDatos(turno, eventos);

  const horometroInicio = turno.horometro_inicio || 0;
  const horometroFin = turno.horometro_fin || 0;
  const horasHorometro = turno.horas_horometro ||
    Math.round((horometroFin - horometroInicio) * 10) / 10;

  const paros = (eventos || []).filter(function(e) {
    return e.tipo_evento && (
      e.tipo_evento.startsWith('PARO_') ||
      e.tipo_evento === 'FALLA'
    );
  });
  const totalParosMin = paros.reduce(function(sum, p) { return sum + (p.duracion_min || 0); }, 0);
  const totalParosHrs = Math.round((totalParosMin / 60) * 10) / 10;

  // FIX 12: Normalizar variable de operador
  const operadorRegistrado = !!turno.operador_nombre;
  const nombreOperador = operadorRegistrado
    ? turno.operador_nombre
    : limpiarTelefono(turno.operador_telefono);
  const opColorNombre = operadorRegistrado ? GRIS_TEXTO : ROJO_DPM;
  const opLabelEstado = operadorRegistrado ? '' : 'NO REGISTRADO EN SISTEMA';

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // FIX 5: Cambiar const a let para paginacion
  let page = pdfDoc.addPage([595.28, 841.89]);
  const PAGE_WIDTH = 595.28;
  const PAGE_HEIGHT = 841.89;

  const MARGIN_LEFT = 40;
  const MARGIN_RIGHT = PAGE_WIDTH - 40;
  const CONTENT_WIDTH = MARGIN_RIGHT - MARGIN_LEFT;
  let y = PAGE_HEIGHT - 40;

  function drawText(text, x, yPos, options) {
    if (!options) options = {};
    var f = options.bold ? fontBold : font;
    var size = options.size || 10;
    var color = options.color || GRIS_TEXTO;
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

  // FIX 5: Funcion de paginacion
  function checkPageBreak(neededSpace) {
    if (y - neededSpace < 60) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - 40;
      return true;
    }
    return false;
  }

  // SECCION 1: HEADER
  var HEADER_H = 60;
  drawRect(0, y - HEADER_H, PAGE_WIDTH, HEADER_H, NEGRO);

  drawRect(MARGIN_LEFT, y - 45, 36, 30, ROJO_DPM);
  drawText('IS', MARGIN_LEFT + 8, y - 35,
    { bold: true, size: 18, color: BLANCO });

  drawText('REPORTE DIARIO DE MAQUINARIA', MARGIN_LEFT + 48, y - 22,
    { bold: true, size: 16, color: BLANCO });
  drawText('Formato DPM No. 63452 \u2014 Digital', MARGIN_LEFT + 48, y - 38,
    { size: 9, color: BLANCO });
  drawText('IronSync \u00b7 Bitacora Digital', MARGIN_LEFT + 48, y - 50,
    { size: 8, color: BLANCO });

  var folioText = turno.folio || folio;
  var folioWidth = fontBold.widthOfTextAtSize(folioText, 12);
  drawText(folioText, MARGIN_RIGHT - folioWidth - 10, y - 22,
    { bold: true, size: 12, color: ROJO_DPM });

  y -= HEADER_H + 10;

  // SECCION 2: BARRA DE VALIDACION
  var BARRA_H = 24;
  drawRect(MARGIN_LEFT, y - BARRA_H, CONTENT_WIDTH, BARRA_H, GRIS_SUPERFICIE);
  drawText('Estado de Validacion', MARGIN_LEFT + 10, y - 16,
    { bold: true, size: 8, color: GRIS_MUTED });

  // FIX 9: firma_residente_status
  var estadoFirma = turno.firma_residente_status === 'firmado'
    ? 'Validado por residente'
    : 'Sin registro de firma';
  drawText(estadoFirma, MARGIN_RIGHT - 200, y - 16,
    { size: 9, color: GRIS_TEXTO });

  y -= BARRA_H + 10;

  // SECCION 3: DATOS GENERALES
  drawText('DATOS GENERALES', MARGIN_LEFT, y,
    { bold: true, size: 8, color: GRIS_MUTED });
  y -= 15;

  // FIX 3: Compania, FIX 4: Contrato, FIX 8: Lugar, FIX 1: QR eliminado
  var gridData = [
    ['Fecha', formatearFecha(turno.inicio || turno.fecha_turno)],
    ['Turno', formatearHora(turno.inicio) + ' \u2014 ' + formatearHora(turno.fin)],
    ['Lugar', turno.observaciones || '\u2014'],
    ['Compania', turno.cliente_nombre || '\u2014'],
    ['Contrato', turno.contrato_id || '\u2014'],
    ['Maquina', turno.maquina || '\u2014'],
    ['Serie', turno.serie || 'SIN-SERIE'],
  ];

  var cols = 3;
  var colWidth = CONTENT_WIDTH / cols;
  var cellH = 16;

  for (var i = 0; i < gridData.length; i++) {
    var col = i % cols;
    var row = Math.floor(i / cols);
    var cx = MARGIN_LEFT + (col * colWidth);
    var cy = y - (row * cellH);

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

  var gridRows = Math.ceil(gridData.length / cols);
  y -= (gridRows * cellH) + 10;

  drawLine(MARGIN_LEFT, y + 5, MARGIN_RIGHT, y + 5, GRIS_BORDE);
  y -= 5;

  // SECCION 4: OPERADOR
  drawText('OPERADOR', MARGIN_LEFT, y,
    { bold: true, size: 8, color: GRIS_MUTED });
  y -= 15;

  drawText('Nombre', MARGIN_LEFT + 5, y + 2,
    { bold: true, size: 7, color: GRIS_MUTED });
  drawText(nombreOperador,
    MARGIN_LEFT + 5, y - 10,
    { size: 10, color: opColorNombre });

  if (opLabelEstado) {
    drawText(opLabelEstado,
      MARGIN_LEFT + 5, y - 22,
      { size: 7, color: ROJO_DPM });
  }

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

  var halfWidth = CONTENT_WIDTH / 2;

  drawRect(MARGIN_LEFT, y - 40, halfWidth - 5, 40, GRIS_SUPERFICIE);
  drawText('Horometro Inicial', MARGIN_LEFT + 10, y - 12,
    { bold: true, size: 8, color: GRIS_MUTED });
  drawText(String(horometroInicio), MARGIN_LEFT + 10, y - 30,
    { bold: true, size: 18, color: GRIS_TEXTO });
  drawText(formatearHora(turno.inicio) + ' hrs', MARGIN_LEFT + 10, y - 38,
    { size: 8, color: GRIS_MUTED });

  var finalX = MARGIN_LEFT + halfWidth + 5;
  drawRect(finalX, y - 40, halfWidth - 5, 40, GRIS_SUPERFICIE);
  drawText('Horometro Final', finalX + 10, y - 12,
    { bold: true, size: 8, color: GRIS_MUTED });
  drawText(horometroFin ? String(horometroFin) : '\u2014', finalX + 10, y - 30,
    { bold: true, size: 18, color: GRIS_TEXTO });
  drawText(formatearHora(turno.fin) + ' hrs', finalX + 10, y - 38,
    { size: 8, color: GRIS_MUTED });

  // FIX: Texto neutral para fotos
  drawText(
    turno.foto_inicio_url
      ? 'Referencia foto en sistema'
      : 'Sin evidencia fotografica',
    MARGIN_LEFT + 10, y - 52, { size: 7, color: GRIS_MUTED });
  drawText(
    turno.foto_fin_url
      ? 'Referencia foto en sistema'
      : 'Sin evidencia fotografica',
    finalX + 10, y - 52, { size: 7, color: GRIS_MUTED });

  y -= 65;
  drawLine(MARGIN_LEFT, y + 5, MARGIN_RIGHT, y + 5, GRIS_BORDE);
  y -= 5;

  // SECCION 6: TIMELINE DE EVENTOS
  drawText('TIMELINE DE EVENTOS', MARGIN_LEFT, y,
    { bold: true, size: 8, color: GRIS_MUTED });
  y -= 15;

  // FIX 5: Paginacion - INICIO
  checkPageBreak(50);

  drawRect(MARGIN_LEFT + 5, y - 5, 16, 16, VERDE);
  drawText('I', MARGIN_LEFT + 10, y - 1,
    { bold: true, size: 10, color: BLANCO });
  drawText(formatearHora(turno.inicio), MARGIN_LEFT + 28, y,
    { bold: true, size: 10, color: GRIS_TEXTO });
  drawText('INICIO', MARGIN_LEFT + 75, y,
    { bold: true, size: 9, color: VERDE });
  // FIX 12: Usar nombreOperador normalizado
  drawText('Horometro: ' + horometroInicio + ' \u00b7 Operador: ' + nombreOperador,
    MARGIN_LEFT + 28, y - 14, { size: 8, color: GRIS_MUTED });

  y -= 30;

  var timelineLineX = MARGIN_LEFT + 13;
  var timelineStartY = y + 15;

  // FIX 5: Paginacion - PAROS
  for (var j = 0; j < paros.length; j++) {
    var evento = paros[j];

    checkPageBreak(50);

    var col2 = colorEvento(evento.tipo_evento);
    var icon = iconoEvento(evento.tipo_evento);
    var tipo = tipoEventoLegible(evento.tipo_evento);
    var duracionFmt = formatearDuracion(evento.duracion_min);

    drawRect(MARGIN_LEFT + 5, y - 5, 16, 16, NARANJA);
    drawText(icon, MARGIN_LEFT + 10, y - 1,
      { bold: true, size: 10, color: BLANCO });

    drawText(formatearHora(evento.timestamp_inicio), MARGIN_LEFT + 28, y,
      { bold: true, size: 10, color: GRIS_TEXTO });
    drawText(tipo, MARGIN_LEFT + 75, y,
      { bold: true, size: 9, color: col2 });

    var motivo = evento.motivo || 'Sin motivo especificado';
    drawText('Motivo reportado por operador: ' + motivo +
      (duracionFmt ? ' \u00b7 ' + duracionFmt : ''),
      MARGIN_LEFT + 28, y - 14, { size: 8, color: GRIS_MUTED });

    var evidenciaTexto = evento.foto_url
      ? 'Referencia foto en sistema'
      : 'Sin evidencia fotografica';
    drawText(evidenciaTexto, MARGIN_LEFT + 28, y - 26,
      { size: 7, color: GRIS_MUTED });

    y -= 38;
  }

  // FIX 5: Paginacion - FIN
  checkPageBreak(50);

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
  checkPageBreak(100);

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
  var parosDisplay = totalParosMin < 60
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

  var horasOperando = Math.round(
    (horasHorometro - totalParosHrs) * 10) / 10;
  var parosBarraFmt = totalParosMin < 60
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

  // SECCION 8: VALIDACION / FIRMAS
  checkPageBreak(100);

  drawText('VALIDACION', MARGIN_LEFT, y,
    { bold: true, size: 8, color: GRIS_MUTED });
  y -= 15;

  var firmaW = (CONTENT_WIDTH - 10) / 2;
  drawRect(MARGIN_LEFT, y - 70, firmaW, 70, GRIS_SUPERFICIE);
  drawText('OPERADOR', MARGIN_LEFT + 10, y - 12,
    { bold: true, size: 8, color: GRIS_MUTED });
  // FIX 12: Usar nombreOperador normalizado
  drawText(nombreOperador,
    MARGIN_LEFT + 10, y - 26,
    { bold: true, size: 11, color: opColorNombre });
  // FIX 2: "PIN validado" -> "Autenticado via WhatsApp"
  drawText('Autenticado via WhatsApp', MARGIN_LEFT + 10, y - 38,
    { size: 9, color: VERDE });
  // FIX 11: Timestamp -> "Turno iniciado:"
  drawText('Turno iniciado: ' + formatearTimestamp(turno.inicio),
    MARGIN_LEFT + 10, y - 50,
    { size: 8, color: GRIS_MUTED });
  drawText('Confirmo que estos hechos ocurrieron',
    MARGIN_LEFT + 10, y - 62,
    { size: 7, color: GRIS_MUTED });
  drawText('tal como los reporte',
    MARGIN_LEFT + 10, y - 70,
    { size: 7, color: GRIS_MUTED });

  var firma2X = MARGIN_LEFT + firmaW + 10;
  drawRect(firma2X, y - 70, firmaW, 70, GRIS_SUPERFICIE);
  drawText('RESIDENTE', firma2X + 10, y - 12,
    { bold: true, size: 8, color: GRIS_MUTED });
  // FIX 10: Residente -> "Pendiente de registro"
  drawText('Pendiente de registro', firma2X + 10, y - 26,
    { bold: true, size: 11, color: GRIS_TEXTO });
  drawText('Sin registro de firma', firma2X + 10, y - 38,
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
  checkPageBreak(60);

  drawLine(MARGIN_LEFT, y + 5, MARGIN_RIGHT, y + 5, GRIS_BORDE);

  drawText(folioText, MARGIN_LEFT, y - 5,
    { size: 8, color: GRIS_MUTED });
  drawText(
    'Generado: ' + formatearTimestamp(new Date().toISOString()) +
    ' \u00b7 IronSync',
    MARGIN_LEFT, y - 16, { size: 7, color: GRIS_MUTED });

  drawText('IRONSYNC', MARGIN_RIGHT - 70, y - 5,
    { bold: true, size: 10, color: GRIS_MUTED });

  // FIX 6: Dibujar hash SHA-256 en footer
  if (dataHash) {
    drawText('Hash: ' + dataHash.substring(0, 32),
      MARGIN_LEFT, y - 28, { size: 6, color: GRIS_MUTED });
    drawText('Verificacion: /api/v1/pdf/verificar/' + folioText,
      MARGIN_LEFT, y - 37, { size: 6, color: GRIS_MUTED });
    y -= 45;
  } else {
    y -= 30;
  }

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

  var pdfBytes = await pdfDoc.save();

  // FIX 6: Retornar PDF + hash de datos
  return {
    pdfBuffer: Buffer.from(pdfBytes),
    dataHash: dataHash
  };
}

module.exports = { generarPDFReporteDiario };
