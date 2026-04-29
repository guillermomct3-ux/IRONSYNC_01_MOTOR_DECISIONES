const crypto = require('crypto');
const supabase = require('./supabaseClient');

function hashMensaje(telefono, body, mediaUrl) {
  return crypto
    .createHash('sha256')
    .update([
      telefono || '',
      (body || '').trim().toLowerCase(),
      mediaUrl || ''
    ].join('|'))
    .digest('hex');
}

async function registrarMensajeEntrante({ messageSid, telefono, body, mediaUrl }) {
  const bodyHash = hashMensaje(telefono, body, mediaUrl);

  // 1. Si Twilio manda MessageSid, ese es el candado principal
  if (messageSid) {
    const { data: existente } = await supabase
      .from('incoming_messages')
      .select('*')
      .eq('message_sid', messageSid)
      .maybeSingle();

    if (existente) {
      return { duplicate: true, message: existente };
    }
  }

  // 2. Candado adicional por contenido en ventana corta
  const desde = new Date(Date.now() - 2 * 60 * 1000).toISOString();

  const { data: duplicadoReciente } = await supabase
    .from('incoming_messages')
    .select('*')
    .eq('telefono', telefono)
    .eq('body_hash', bodyHash)
    .gte('recibido_at', desde)
    .maybeSingle();

  if (duplicadoReciente) {
    return { duplicate: true, message: duplicadoReciente };
  }

  const { data, error } = await supabase
    .from('incoming_messages')
    .insert({
      message_sid: messageSid || null,
      telefono,
      body: body || '',
      media_url: mediaUrl || null,
      message_type: mediaUrl ? 'media' : 'text',
      body_hash: bodyHash,
      estado: 'received'
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { duplicate: true, message: null };
    }
    throw error;
  }

  return { duplicate: false, message: data };
}

async function marcarProcesado(messageId, respuesta) {
  if (!messageId) return;
  await supabase
    .from('incoming_messages')
    .update({ estado: 'processed', respuesta: respuesta || null })
    .eq('id', messageId);
}

async function marcarDuplicado(messageId, respuesta) {
  if (!messageId) return;
  await supabase
    .from('incoming_messages')
    .update({ estado: 'duplicate', respuesta: respuesta || null })
    .eq('id', messageId);
}

async function marcarFallido(messageId, error) {
  if (!messageId) return;
  await supabase
    .from('incoming_messages')
    .update({
      estado: 'failed',
      error: error ? String(error.message || error) : 'unknown'
    })
    .eq('id', messageId);
}

module.exports = {
  registrarMensajeEntrante,
  marcarProcesado,
  marcarDuplicado,
  marcarFallido
};
