const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const MAX_INTENTOS = 5;
const BLOQUEO_MINUTOS = 15;

async function verificarRateLimit(telefono, accion) {
  const clave = telefono + ":" + accion;

  const { data } = await supabase
    .from("rate_limits")
    .select("*")
    .eq("clave", clave)
    .single();

  if (!data) return { permitido: true };

  if (data.intentos >= MAX_INTENTOS) {
    const hasta = new Date(data.ultimo_intento);
    hasta.setMinutes(hasta.getMinutes() + BLOQUEO_MINUTOS);

    if (new Date() < hasta) {
      const min = Math.ceil((hasta - new Date()) / 60000);
      return {
        permitido: false,
        mensaje: "Demasiados intentos.\nEspera " + min + " minutos."
      };
    }

    await supabase.from("rate_limits").delete().eq("clave", clave);
    return { permitido: true };
  }

  return { permitido: true };
}

async function registrarIntento(telefono, accion, exitoso) {
  const clave = telefono + ":" + accion;

  if (exitoso) {
    await supabase.from("rate_limits").delete().eq("clave", clave);
    return;
  }

  const { data } = await supabase
    .from("rate_limits")
    .select("intentos")
    .eq("clave", clave)
    .single();

  if (data) {
    await supabase
      .from("rate_limits")
      .update({
        intentos: data.intentos + 1,
        ultimo_intento: new Date().toISOString()
      })
      .eq("clave", clave);
  } else {
    await supabase
      .from("rate_limits")
      .insert({
        clave: clave,
        intentos: 1,
        ultimo_intento: new Date().toISOString()
      });
  }
}

module.exports = { verificarRateLimit, registrarIntento };
