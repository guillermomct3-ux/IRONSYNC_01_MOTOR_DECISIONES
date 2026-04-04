require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const validadores = require('./validadores');
const RESPUESTAS = require('./respuestas');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ── CARGAR TURNO ACTIVO ──────────────────────────────────────
async function cargarTurnoActivo(from) {
  const { data, error } = await supabase
    .from('turnos')
    .select('*')
    .eq('operador_id', from)
    .eq('estado', 'ABIERTO')
    .single();
  if (error && error.code !== 'PGRST116') {
    console.error('❌ Error cargarTurnoActivo:', error.message);
  }
  return data || null;
}

// ── INICIO DE TURNO ──────────────────────────────────────────
async function procesarInicioTurno(from, texto) {
  console.log(`🚀 procesarInicioTurno | from: ${from} | texto: "${texto}"`);

  const horometro = validadores.extraerHorometro(texto);
  const { maquina, serie } = validadores.extraerDatosMaquina(texto);

  const turnoActivo = await cargarTurnoActivo(from);

  if (turnoActivo) {
    return RESPUESTAS.DOBLE_INICIO(turnoActivo.maquina, turnoActivo.horometro_inicio);
  }

  if (!horometro) {
    return RESPUESTAS.HOROMETRO_FALTANTE();
  }

  const hoy = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('turnos')
    .insert({
      operador_id: from,
      estado: 'ABIERTO',
      fecha_turno: hoy,
      maquina: maquina,
      serie: serie,
      horometro_inicio: horometro,
      horometro_fin: null,
      horas_turno: null,
      inicio: new Date().toISOString(),
      fin: null
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error insertar turno:', error.message);
    throw error;
  }

  console.log('✅ Turno creado en Supabase:', data.id);
  return RESPUESTAS.INICIO_OK(maquina, serie, horometro);
}

// ── FIN DE TURNO ─────────────────────────────────────────────
async function procesarFinTurno(from, texto) {
  const turno = await cargarTurnoActivo(from);

  if (!turno) {
    return RESPUESTAS.FIN_SIN_INICIO();
  }

  const horometroFinal = validadores.extraerHorometro(texto);

  if (horometroFinal === null) return RESPUESTAS.HOROMETRO_FALTANTE();
  if (isNaN(horometroFinal)) return RESPUESTAS.HOROMETRO_INVALIDO();

  if (horometroFinal < turno.horometro_inicio) {
    return RESPUESTAS.HOROMETRO_MENOR(horometroFinal, turno.horometro_inicio);
  }

  const horas = parseFloat((horometroFinal - turno.horometro_inicio).toFixed(2));

  const { error } = await supabase
    .from('turnos')
    .update({
      estado: 'CERRADO',
      horometro_fin: horometroFinal,
      horas_turno: horas,
      fin: new Date().toISOString()
    })
    .eq('id', turno.id);

  if (error) {
    console.error('❌ Error cerrar turno:', error.message);
    throw error;
  }

  console.log('✅ Turno cerrado en Supabase:', turno.id);

  const acumulado = await calcularAcumuladoHoy(from);
  return RESPUESTAS.FIN_OK(horas, acumulado);
}

// ── REPORTE DE HORAS ─────────────────────────────────────────
async function procesarReporteHoras(from) {
  const turno = await cargarTurnoActivo(from);

  if (!turno) {
    return RESPUESTAS.REPORTE_SIN_TURNO();
  }

  const ahora = new Date();
  const inicio = new Date(turno.inicio);
  const minutos = Math.round((ahora - inicio) / 60000);

  return RESPUESTAS.REPORTE_TURNO_ABIERTO(minutos, turno.horometro_inicio);
}

// ── ACUMULADO DEL DÍA ────────────────────────────────────────
async function calcularAcumuladoHoy(from) {
  const hoy = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('turnos')
    .select('horas_turno')
    .eq('operador_id', from)
    .eq('estado', 'CERRADO')
    .eq('fecha_turno', hoy);

  if (error) return 0;
  return data.reduce((sum, t) => sum + (parseFloat(t.horas_turno) || 0), 0);
}

// ── ZOMBIES ──────────────────────────────────────────────────
async function verificarZombies(twilioClient, numeroOrigen) {
  const { data: turnos, error } = await supabase
    .from('turnos')
    .select('*')
    .eq('estado', 'ABIERTO');

  if (error || !turnos) return;

  turnos.forEach(turno => {
    if (validadores.esTurnoZombie(turno)) {
      const ahora = new Date();
      const inicio = new Date(turno.inicio);
      const horas = Math.round((ahora - inicio) / (1000 * 60 * 60));
      const mensaje = RESPUESTAS.ZOMBIE_ALERTA(turno.maquina, horas);
      console.log('🚨 ZOMBIE:', mensaje);
      if (twilioClient && numeroOrigen) {
        twilioClient.messages.create({
          body: mensaje,
          from: numeroOrigen,
          to: turno.operador_id
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