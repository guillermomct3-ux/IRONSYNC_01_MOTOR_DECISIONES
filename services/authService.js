const supabase = require('../lib/supabaseClient');
const crypto = require('crypto');

const SESSION_TTL_HOURS = 24;
const MAX_PIN_ATTEMPTS = 3;
const PIN_BLOCK_MINUTES = 15;

function normalizarTelefono(from) {
  return from.replace('whatsapp:', '');
}

function hashPin(pin) {
  return crypto.createHash('sha256').update(pin).digest('hex');
}

async function requiresAuth(from) {
  const telefono = normalizarTelefono(from);

  const { data, error } = await supabase
    .from('operadores')
    .select('last_auth_at, pin_attempts, pin_blocked_until')
    .eq('telefono', telefono)
    .single();

  if (error || !data) return { requiere: true, existe: false };

  if (data.pin_blocked_until && new Date(data.pin_blocked_until) > new Date()) {
    return { requiere: true, existe: true, bloqueado: true };
  }

  if (!data.last_auth_at) return { requiere: true, existe: true };

  const horas = (new Date() - new Date(data.last_auth_at)) / 36e5;
  return { requiere: horas >= SESSION_TTL_HOURS, existe: true };
}

async function login(from, pinInput) {
  const telefono = normalizarTelefono(from);

  const { data: operador, error } = await supabase
    .from('operadores')
    .select('*')
    .eq('telefono', telefono)
    .single();

  if (error || !operador) {
    return { success: false, mensaje: '⚠️ Tu número no está registrado. Habla con tu supervisor.' };
  }

  if (operador.pin_blocked_until && new Date(operador.pin_blocked_until) > new Date()) {
    const mins = Math.ceil((new Date(operador.pin_blocked_until) - new Date()) / 60000);
    return { success: false, mensaje: `🔒 Demasiados intentos. Espera ${mins} minutos.` };
  }

  if (operador.pin_hash !== hashPin(pinInput)) {
    const nuevosIntentos = (operador.pin_attempts || 0) + 1;

    if (nuevosIntentos >= MAX_PIN_ATTEMPTS) {
      const bloqueoHasta = new Date(Date.now() + PIN_BLOCK_MINUTES * 60 * 1000);
      await supabase
        .from('operadores')
        .update({ pin_attempts: nuevosIntentos, pin_blocked_until: bloqueoHasta.toISOString() })
        .eq('id', operador.id);
      return { success: false, mensaje: `🔒 PIN incorrecto 3 veces. Bloqueado por ${PIN_BLOCK_MINUTES} minutos.` };
    }

    await supabase
      .from('operadores')
      .update({ pin_attempts: nuevosIntentos })
      .eq('id', operador.id);

    return { success: false, mensaje: `🔒 PIN incorrecto. Intentos restantes: ${MAX_PIN_ATTEMPTS - nuevosIntentos}` };
  }

  await supabase
    .from('operadores')
    .update({ last_auth_at: new Date().toISOString(), pin_attempts: 0, pin_blocked_until: null })
    .eq('id', operador.id);

  return { success: true, operador };
}

async function getOperador(from) {
  const telefono = normalizarTelefono(from);
  const { data } = await supabase
    .from('operadores')
    .select('*')
    .eq('telefono', telefono)
    .single();
  return data || null;
}

module.exports = { requiresAuth, login, getOperador };