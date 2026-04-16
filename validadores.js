function extraerHorometro(texto) {
  console.log('🔍 extraerHorometro recibió:', JSON.stringify(texto));
  const matchConPalabra = texto.match(/horometro\s+(\d+\.?\d*)/);
  if (matchConPalabra) return parseFloat(matchConPalabra[1]);
  const matchDirecto = texto.match(/(\d+\.?\d*)/);
  console.log('🔍 matchDirecto:', matchDirecto);
  return matchDirecto ? parseFloat(matchDirecto[1]) : null;
}

function extraerDatosMaquina(texto) {
  const matchSerie = texto.match(/serie\s+([a-zA-Z0-9-]+)/i);
  const serie = matchSerie ? matchSerie[1].toUpperCase() : 'SIN-SERIE';
  const maquina = texto
    .replace(/inicio/i, '')
    .replace(/serie\s+[a-zA-Z0-9-]+/i, '')
    .replace(/horometro\s+\d+\.?\d*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
  return {
    maquina: maquina || 'SIN-MAQUINA',
    serie: serie
  };
}

function tieneTurnoAbierto(turnos, from) {
  return turnos.some(t => t.from === from && t.estado === 'ABIERTO');
}

function obtenerTurnoAbierto(turnos, from) {
  return turnos.find(t => t.from === from && t.estado === 'ABIERTO');
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
  // FIX C2: umbral de 24 horas (antes era 20, inconsistente)
  return diff <= 24;
}

module.exports = {
  extraerHorometro,
  extraerDatosMaquina,
  tieneTurnoAbierto,
  obtenerTurnoAbierto,
  esTurnoZombie,
  calcularAcumuladoHoy,
  esRangoRazonable
};