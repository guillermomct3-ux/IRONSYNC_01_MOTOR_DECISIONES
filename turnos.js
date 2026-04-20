const fs = require('fs');
const path = require('path');
const validadores = require('./validadores');
const RESPUESTAS = require('./respuestas');
const supabase = require('./lib/supabaseClient');

const ARCHIVO_TURNOS = path.join(__dirname, 'turnos_activos.json');

const SUPERVISORES = {
  '523338155867': 'Ulises'
};

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

function generarFolio(maquina, fecha, turnos) {
  const [yyyy, mm, dd] = fecha.split('-');
  const consecutivo = turnos.filter(t =>
    t.maquina === maquina && t.fecha === fecha
  ).length + 1;
  return `IS-${yyyy}-${mm}-${dd}-${maquina}-${String(consecutivo).padStart(3, '0')}`;
}

function calcularAnomalias(turno) {
  const anomalias = [];

  if (turno.horometro_final && turno.horometro_inicial) {
    const horasHorometro = Math.round(
      (turno.horometro_final - turno.horometro_inicial) * 10) / 10;
    const horasTiempo = turno.horas_turno || 0;
    const diff = Math.abs(horasHorometro - horasTiempo);
    if (diff > 1) {
      anomalias.push(
        `⚠️ Discrepancia: horómetro ${horasHorometro} hrs vs tiempo ${horasTiempo} hrs`
      );
    }
  }

  if (turno.sin_foto_inicio) {
    anomalias.push('🔴 Sin foto de horómetro de inicio');
  }
  if (turno.sin_foto_fin) {
    anomalias.push('🔴 Sin foto de horómetro de cierre');
  }
  if (turno.horas_turno > 12) {
    anomalias.push(`⚠️ Turno de ${turno.horas_turno} hrs — requiere revisión`);
  }
  if (turno.reportado_por) {
    anomalias.push(
      `⚠️ Registrado por ${turno.reportado_por} — operador: ${turno.operador_nombre || 'no declarado'}`
    );
  }

  turno.tiene_anomalia = anomalias.length > 0;
  return anomalias;
}

function procesarFoto(from, imageUrl) {
  const turnos = cargarTurnos();
  const turno = turnos.find(t =>
    t.from === from &&
    (t.estado_foto === 'esperando_foto_inicio' ||
     t.estado_foto === 'esperando_foto_fin')
  );

  if (!turno) return 'No hay turno esperando foto. Manda INICIO primero.';

  if (turno.estado_foto === 'esperando_foto_inicio') {
    turno.foto_inicio_url = imageUrl;
    turno.sin_foto_inicio = false;
    turno.estado_foto = null;
    guardarTurnos(turnos);
    return `📷 Foto de inicio vinculada a ${turno.maquina}.\nPara cerrar manda FIN ${turno.maquina} [número del contador]`;
  }

  if (turno.estado_foto === 'esperando_foto_fin') {
    turno.foto_fin_url = imageUrl;
    turno.sin_foto_fin = false;
    turno.estado_foto = null;
    guardarTurnos(turnos);
    return `📷 Foto de cierre vinculada a ${turno.maquina}.\n✅ Turno completo con evidencia.`;
  }
}

// ✅ FIX Bug 2: buscar numero_serie en Supabase por nombre de equipo
// Estrategia: separar tokens y buscar cada uno individualmente
// "CAT336" → tokens ['cat', '336'] → busca nombres que contengan ambos
async function buscarSerie(maquina) {
  try {
    // Separar la máquina en tokens alfanuméricos
    // "CAT336" → ['cat', '336'] | "CAT 336" → ['cat', '336']
    const tokens = maquina.toLowerCase().match(/[a-z]+|\d+/g) || [];
    console.log(`🔍 Buscando equipo: "${maquina}" | tokens: ${tokens.join(', ')}`);

    const { data: todos, error } = await supabase
      .from('equipos')
      .select('nombre, numero_serie');

    if (error || !todos || todos.length === 0) {
      console.log(`⚠️ Error o tabla vacía: ${error?.message}`);
      return 'SIN-SERIE';
    }

    // Buscar el equipo cuyo nombre contenga todos los tokens
    const encontrado = todos.find(equipo => {
      const nombreLower = equipo.nombre.toLowerCase();
      return tokens.every(token => nombreLower.includes(token));
    });

    if (!encontrado) {
      console.log(`⚠️ Equipo no encontrado en Supabase: ${maquina}`);
      return 'SIN-SERIE';
    }

    console.log(`✅ Equipo encontrado: ${encontrado.nombre} — Serie: ${encontrado.numero_serie}`);
    return encontrado.numero_serie || 'SIN-SERIE';
  } catch (err) {
    console.error('❌ Error buscando serie en Supabase:', err.message);
    return 'SIN-SERIE';
  }
}

async function procesarInicioTurno(from, texto) {
  console.log(`🚀 procesarInicioTurno iniciado para ${from} | texto: "${texto}"`);
  console.log('📁 Ruta archivo:', ARCHIVO_TURNOS);
  try {
    if (!validadores.validarEstructuraComando(texto)) {
      return 'Un mensaje, un comando.\nManda INICIO y FIN por separado.';
    }

    const turnos = cargarTurnos();
    console.log('📋 Turnos actuales:', turnos.length);

    const horometro = validadores.extraerHorometro(texto);
    const { maquina } = validadores.extraerDatosMaquina(texto);

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

    // ✅ Buscar serie real en Supabase
    const serie = await buscarSerie(maquina);

    const hoy = new Date().toISOString().split('T')[0];
    const folio = generarFolio(maquina, hoy, turnos);
    const esSupervisor = !!SUPERVISORES[from.replace('whatsapp:+', '')];

    const nuevoTurno = {
      from,
      estado: 'ABIERTO',
      fecha: hoy,
      folio,
      maquina,
      serie,
      horometro_inicial: horometro,
      horometro_final: null,
      unidades_horometro: null,
      horas_turno: null,
      validado_por_diferencia: false,
      timestamp_inicio: new Date().toISOString(),
      timestamp_fin: null,
      foto_inicio_url: null,
      foto_fin_url: null,
      sin_foto_inicio: true,
      sin_foto_fin: true,
      estado_foto: 'esperando_foto_inicio',
      reportado_por: esSupervisor ? SUPERVISORES[from.replace('whatsapp:+', '')] : null,
      operador_nombre: null,
      tiene_anomalia: false
    };

    turnos.push(nuevoTurno);
    guardarTurnos(turnos);
    console.log('✅ Turno creado:', JSON.stringify(nuevoTurno, null, 2));

    if (esSupervisor) {
      return `✅ Turno ABIERTO · ${maquina}\n📋 Folio: ${folio}\n¿Quién operó este equipo?\nResponde con el nombre del operador.`;
    }

    return RESPUESTAS.INICIO_OK(maquina, serie, horometro, folio);

  } catch (error) {
    console.error('❌ Error dentro de procesarInicioTurno:', error.message);
    console.error('❌ Stack:', error.stack);
    throw error;
  }
}

async function procesarFinTurno(from, texto) {
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

  if (horometroFinal === turno.horometro_inicial) {
    return `El número del contador final (${horometroFinal}) es igual al inicial (${turno.horometro_inicial}).\n¿Es correcto? Responde SÍ o NO.`;
  }

  const unidades = horometroFinal - turno.horometro_inicial;
  const horasTurno = Math.round(Math.max(0, unidades) * 10) / 10;

  if (!validadores.esRangoRazonable(turno.horometro_inicial, horometroFinal)) {
    console.log('⚠️ Rango inusual detectado:', turno.horometro_inicial, '->', horometroFinal);
    turno.estado = 'CERRADO';
    turno.horometro_final = horometroFinal;
    turno.unidades_horometro = unidades;
    turno.horas_turno = horasTurno;
    turno.validado_por_diferencia = true;
    turno.timestamp_fin = new Date().toISOString();
    turno.alerta_rango = true;
    turno.estado_foto = 'esperando_foto_fin';
    calcularAnomalias(turno);
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
  turno.estado_foto = 'esperando_foto_fin';
  calcularAnomalias(turno);

  guardarTurnos(turnos);

  const turnosActualizados = cargarTurnos();
  const acumulado = validadores.calcularAcumuladoHoy(turnosActualizados, from);
  return RESPUESTAS.FIN_OK(horasTurno, acumulado, turno.folio);
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
  procesarFoto,
  calcularAnomalias,
  verificarZombies
};