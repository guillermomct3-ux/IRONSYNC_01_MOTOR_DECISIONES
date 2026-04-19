function extraerHorometro(texto) {
  console.log('🔍 extraerHorometro recibió:', JSON.stringify(texto));
  const textoLimpio = texto.replace(/,/g, '');

  const matchConPalabra = textoLimpio.match(/horometro\s+(\d+\.?\d*)/i);
  if (matchConPalabra) {
    const valor = parseFloat(matchConPalabra[1]);
    if (valor > 999999 || valor < 0) return null;
    return valor;
  }

  const todosLosNumeros = [...textoLimpio.matchAll(/(?:^|\s)(\d+\.?\d*)(?:\s|$)/g)];
  if (todosLosNumeros.length > 0) {
    const valor = parseFloat(todosLosNumeros[todosLosNumeros.length - 1][1]);
    if (valor > 999999 || valor < 0) return null;
    return valor;
  }

  return null;
}

function extraerDatosMaquina(texto) {
  const matchSerie = texto.match(/serie\s+([a-zA-Z0-9-]+)/i);
  const serie = matchSerie ? matchSerie[1].toUpperCase() : 'SIN-SERIE';

  let limpio = texto.replace(/[^\w\s-]/g, '');
  limpio = limpio.replace(/horometro\s+\d+\.?\d*/i, '');

  if (!/horometro/i.test(texto)) {
    limpio = limpio.replace(/\s+\d+\.?\d*\s*$/, ' ');
  }

  const maquina = limpio
    .replace(/inicio/i, '')
    .replace(/fin/i, '')
    .replace(/serie\s+[a-zA-Z0-9-]+/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();

  return {
    maquina: maquina || 'SIN-MAQUINA',
    serie: serie
  };
}

function validarEstructuraComando(mensaje) {
  const comandos = ['INICIO', 'FIN', 'PARO', 'REANUDA', 'COMIDA'];
  let conteo = 0;
  for (const cmd of comandos) {
    const regex = new RegExp(`\\b${cmd}\\b`, 'gi');
    const matches = mensaje.match(regex);
    if (matches) conteo += matches.length;
  }
  return conteo <= 1;
}

function tieneTurnoAbierto(turnos, from) {
  return turnos.some(t => t.from === from && t.estado === 'ABIERTO');
}

function obtenerTurnoAbierto(turnos, from) {
  return turnos.find(t => t.from === from && t.estado === 'ABIERTO');
}

function existeTurnoAbiertoEquipo(turnos, maquina) {
  return turnos.some(t =>
    t.maquina === maquina && t.estado === 'ABIERTO'
  );
}

function esTurnoZombie(turno) {
  const ahora = new Date();
  const inicio = new Date(turno.timestamp_inicio);
  const horasTranscurridas = (ahora - inicio) / (1000 * 60 * 60);
  return horasTranscurridas > 16;
}

function calcularAcumuladoHoy(turnos, from) {
  const hoy = new Date().toISOString().split('T')[0];
  const turnosCerradosHoy = turnos.filter(t =>
    t.from === from &&
    t.estado === 'CERRADO' &&
    t.fecha === hoy
  );
  return turnosCerradosHoy.reduce((sum, t) => sum + (t.horas_turno || 0), 0);
}

function esRangoRazonable(inicial, final) {
  const diff = final - inicial;
  if (diff < 0) return false;
  return diff <= 24;
}

module.exports = {
  extraerHorometro,
  extraerDatosMaquina,
  validarEstructuraComando,
  tieneTurnoAbierto,
  obtenerTurnoAbierto,
  existeTurnoAbiertoEquipo,
  esTurnoZombie,
  calcularAcumuladoHoy,
  esRangoRazonable
};