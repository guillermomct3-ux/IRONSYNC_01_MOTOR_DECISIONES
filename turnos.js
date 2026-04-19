const fs = require('fs');
const path = require('path');
const validadores = require('./validadores');
const RESPUESTAS = require('./respuestas');

const ARCHIVO_TURNOS = path.join(__dirname, 'turnos_activos.json');

function cargarTurnos() {
  if (!fs.existsSync(ARCHIVO_TURNOS)) return [];
  try {
    const data = fs.readFileSync(ARCHIVO_TURNOS, 'utf8');
    console.log('📋 JSON leído:', data);
    return JSON.parse(data);
  } catch (e) {
    console.error('⚠️ turnos_activos.json corrupto. Creando respaldo.');
    fs.renameSync(ARCHIVO_TURNOS, ARCHIVO_TURNOS + '.corrupto');
    return [];
  }
}

function guardarTurnos(turnos) {
  fs.writeFileSync(ARCHIVO_TURNOS, JSON.stringify(turnos, null, 2));
  console.log('📁 turnos_activos.json actualizado. Total turnos:', turnos.length);
}

async function procesarInicioTurno(from, texto) {
  console.log(`🚀 procesarInicioTurno iniciado para ${from} | texto: "${texto}"`);
  console.log('📁 Ruta archivo:', ARCHIVO_TURNOS);
  try {
    // FIX A6: validar que no hay múltiples comandos en una línea
    if (!validadores.validarEstructuraComando(texto)) {
      return 'Un mensaje, un comando.\nManda INICIO y FIN por separado.';
    }

    const turnos = cargarTurnos();
    console.log('📋 Turnos actuales:', turnos.length);

    const horometro = validadores.extraerHorometro(texto);
    const { maquina, serie } = validadores.extraerDatosMaquina(texto);

    // FIX A10: verificar que la máquina no tenga turno abierto
    if (validadores.existeTurnoAbiertoEquipo(turnos, maquina)) {
      return `⚠️ ${maquina} ya tiene turno abierto.\nHabla con Ulises.`;
    }

    if (validadores.tieneTurnoAbierto(turnos, from)) {
      const turnoActivo = validadores.obtenerTurnoAbierto(turnos, from);
      return RESPUESTAS.DOBLE_INICIO(turnoActivo.maquina, turnoActivo.horometro_inicial);
    }

    if (!horometro) {
      return RESPUESTAS.HOROMETRO_FALTANTE();
    }

    const hoy = new Date().toISOString().split('T')[0];

    const nuevoTurno = {
      from,
      estado: 'ABIERTO',
      fecha: hoy,
      maquina,
      serie,
      horometro_inicial: horometro,
      horometro_final: null,
      unidades_horometro: null,
      horas_turno: null,
      validado_por_diferencia: false,
      timestamp_inicio: new Date().toISOString(),
      timestamp_fin: null
    };

    turnos.push(nuevoTurno);
    guardarTurnos(turnos);
    console.log('✅ Turno creado:', JSON.stringify(nuevoTurno, null, 2));

    return RESPUESTAS.INICIO_OK(maquina, serie, horometro);

  } catch (error) {
    console.error('❌ Error dentro de procesarInicioTurno:', error.message);
    console.error('❌ Stack:', error.stack);
    throw error;
  }
}

async function procesarFinTurno(from, texto) {
  // FIX A6: validar que no hay múltiples comandos en una línea
  if (!validadores.validarEstructuraComando(texto)) {
    return 'Un mensaje, un comando.\nManda INICIO y FIN por separado.';
  }

  const turnos = cargarTurnos();

  if (!validadores.tieneTurnoAbierto(turnos, from)) {
    return RESPUESTAS.FIN_SIN_INICIO();
  }

  const horometroFinal = validadores.extraerHorometro(texto);

  if (horometroFinal === null) return RESPUESTAS.HOROMETRO_FALTANTE();
  if (isNaN(horometroFinal)) return RESPUESTAS.HOROMETRO_INVALIDO();

  const turno = validadores.obtenerTurnoAbierto(turnos, from);

  if (horometroFinal < turno.horometro_inicial) {
    return RESPUESTAS.HOROMETRO_MENOR(horometroFinal, turno.horometro_inicial);
  }

  // FIX A7: horómetro final igual al inicial
  if (horometroFinal === turno.horometro_inicial) {
    return `El horómetro final (${horometroFinal}) es igual al inicial (${turno.horometro_inicial}).\n¿Es correcto? Responde SÍ o NO.`;
  }

  const unidades = horometroFinal - turno.horometro_inicial;
  const horasTurno = Math.max(0, unidades);

  if (!validadores.esRangoRazonable(turno.horometro_inicial, horometroFinal)) {
    console.log('⚠️ Rango inusual detectado:', turno.horometro_inicial, '->', horometroFinal);
    turno.estado = 'CERRADO';
    turno.horometro_final = horometroFinal;
    turno.unidades_horometro = unidades;
    turno.horas_turno = horasTurno;
    turno.validado_por_diferencia = true;
    turno.timestamp_fin = new Date().toISOString();
    turno.alerta_rango = true;
    guardarTurnos(turnos);
    const turnosActualizados = cargarTurnos();
    const acumulado = validadores.calcularAcumuladoHoy(turnosActualizados, from);
    return RESPUESTAS.FIN_RANGO_INUSUAL(horasTurno, acumulado, turno.horometro_inicial, horometroFinal);
  }

  turno.estado = 'CERRADO';
  turno.horometro_final = horometroFinal;
  turno.unidades_horometro = unidades;
  turno.horas_turno = horasTurno;
  turno.validado_por_diferencia = true;
  turno.timestamp_fin = new Date().toISOString();

  guardarTurnos(turnos);

  const turnosActualizados = cargarTurnos();
  const acumulado = validadores.calcularAcumuladoHoy(turnosActualizados, from);
  return RESPUESTAS.FIN_OK(horasTurno, acumulado);
}

async function procesarReporteHoras(from) {
  const turnos = cargarTurnos();

  if (!validadores.tieneTurnoAbierto(turnos, from)) {
    return RESPUESTAS.REPORTE_SIN_TURNO();
  }

  const turno = validadores.obtenerTurnoAbierto(turnos, from);
  const ahora = new Date();
  const inicio = new Date(turno.timestamp_inicio);
  const minutos = Math.round((ahora - inicio) / 60000);

  return RESPUESTAS.REPORTE_TURNO_ABIERTO(minutos, turno.horometro_inicial);
}

function verificarZombies(twilioClient, numeroOrigen) {
  const turnos = cargarTurnos();
  turnos.forEach(turno => {
    if (turno.estado === 'ABIERTO' && validadores.esTurnoZombie(turno)) {
      const ahora = new Date();
      const inicio = new Date(turno.timestamp_inicio);
      const horas = Math.round((ahora - inicio) / (1000 * 60 * 60));
      const mensaje = RESPUESTAS.ZOMBIE_ALERTA(turno.maquina, horas);
      console.log('🚨 TURNO ZOMBIE DETECTADO:', mensaje);
      if (twilioClient && numeroOrigen) {
        twilioClient.messages.create({
          body: mensaje,
          from: numeroOrigen,
          to: turno.from
        });
      }
    }
  });
}

module.exports = {
  procesarInicioTurno,
  procesarFinTurno,
  procesarReporteHoras,
  verificarZombies
};