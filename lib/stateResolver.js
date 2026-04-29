const supabase = require('./supabaseClient');

async function getOperadorPorTelefono(telefono) {
  const { normalizarE164 } = require('./telefono');
  const telNorm = normalizarE164(telefono);

  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('rol', 'operador')
    .eq('activo', true)
    .eq('telefono', telNorm)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function getTurnoAbierto(operadorId) {
  const { data, error } = await supabase
    .from('turnos')
    .select('*')
    .eq('operador_id', operadorId)
    .eq('estado', 'abierto')
    .order('inicio', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function getEventoAbierto(turnoId) {
  const { data, error } = await supabase
    .from('turno_eventos')
    .select('*')
    .eq('turno_id', turnoId)
    .is('timestamp_fin', null)
    .order('timestamp_inicio', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function resolverEstadoOperador(telefono) {
  const operador = await getOperadorPorTelefono(telefono);

  if (!operador) {
    return { tipo: 'no_registrado' };
  }

  const turno = await getTurnoAbierto(operador.id);

  if (!turno) {
    return { tipo: 'sin_turno', operador };
  }

  const eventoAbierto = await getEventoAbierto(turno.id);

  if (eventoAbierto) {
    return {
      tipo: 'turno_con_evento_abierto',
      operador,
      turno,
      eventoAbierto
    };
  }

  return { tipo: 'turno_abierto', operador, turno };
}

module.exports = {
  resolverEstadoOperador,
  getOperadorPorTelefono,
  getTurnoAbierto,
  getEventoAbierto
};
