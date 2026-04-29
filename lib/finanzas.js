const supabase = require('./supabaseClient');

async function getTarifaEquipo(equipoId, empresaId) {
  const { data, error } = await supabase
    .from('tarifas')
    .select('precio_hora, moneda')
    .eq('equipo_id', equipoId)
    .eq('empresa_id', empresaId)
    .eq('activo', true)
    .maybeSingle();

  if (error) return null;
  return data;
}

async function getTarifasEmpresa(empresaId) {
  const { data, error } = await supabase
    .from('tarifas')
    .select('id, equipo_id, precio_hora, moneda, activo, equipos(codigo, alias)')
    .eq('empresa_id', empresaId)
    .eq('activo', true)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

async function upsertTarifa(empresaId, equipoId, precioHora, moneda) {
  moneda = moneda || 'MXN';

  // Buscar tarifa existente
  const { data: existente } = await supabase
    .from('tarifas')
    .select('id')
    .eq('empresa_id', empresaId)
    .eq('equipo_id', equipoId)
    .eq('activo', true)
    .maybeSingle();

  if (existente) {
    // Actualizar
    const { data, error } = await supabase
      .from('tarifas')
      .update({
        precio_hora: precioHora,
        moneda: moneda,
        updated_at: new Date().toISOString()
      })
      .eq('id', existente.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Insertar nueva
  const { data, error } = await supabase
    .from('tarifas')
    .insert({
      empresa_id: empresaId,
      equipo_id: equipoId,
      precio_hora: precioHora,
      moneda: moneda
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

module.exports = {
  getTarifaEquipo,
  getTarifasEmpresa,
  upsertTarifa
};
