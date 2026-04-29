const bcrypt = require("bcrypt");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function hashearPin(pin) {
  return await bcrypt.hash(pin, 10);
}

async function verificarPinAdmin(telefono, pinIngresado) {
  const { data: admin } = await supabase
    .from("usuarios")
    .select("pin")
    .eq("telefono", telefono)
    .eq("rol", "admin")
    .single();

  if (!admin || !admin.pin) return false;
  return await bcrypt.compare(pinIngresado, admin.pin);
}

async function verificarPinOperador(operador, pinIngresado) {
  if (!operador || !operador.pin) return false;
  return await bcrypt.compare(pinIngresado, operador.pin);
}

module.exports = { hashearPin, verificarPinAdmin, verificarPinOperador };
