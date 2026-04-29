const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function limpiarSesionesExpiradas() {
  const fechaLimite = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();

  await supabase
    .from("sesiones")
    .delete()
    .lt("updated_at", fechaLimite);

  console.log("SESIONES_LIMPIADAS", new Date().toISOString());
}

function iniciarCronJob() {
  limpiarSesionesExpiradas();
  setInterval(limpiarSesionesExpiradas, 30 * 60 * 1000);
  console.log("CRON_SESIONES_INICIADO");
}

module.exports = { iniciarCronJob };
