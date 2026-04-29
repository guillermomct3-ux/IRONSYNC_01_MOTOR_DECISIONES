const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const TTL_MINUTOS = 30;

async function getSession(telefono) {
  const { data } = await supabase
    .from("sesiones")
    .select("*")
    .eq("telefono", telefono)
    .single();

  if (!data) return null;

  const updatedAt = new Date(data.updated_at);
  const minutos = (Date.now() - updatedAt.getTime()) / 60000;

  if (minutos > TTL_MINUTOS) {
    await clearSession(telefono);
    return null;
  }

  return data;
}

async function saveSession(telefono, flujo, paso, datos) {
  await supabase
    .from("sesiones")
    .upsert({
      telefono,
      flujo,
      paso,
      datos: datos || {},
      updated_at: new Date().toISOString()
    }, { onConflict: "telefono" });
}

async function clearSession(telefono) {
  await supabase
    .from("sesiones")
    .delete()
    .eq("telefono", telefono);
}

module.exports = { getSession, saveSession, clearSession };
