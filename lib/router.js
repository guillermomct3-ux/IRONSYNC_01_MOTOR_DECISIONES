const { createClient } = require("@supabase/supabase-js");
const { getSession } = require("./sesiones");
const { normalizarE164 } = require("./telefono");
const { handleAdminMessage } = require("../flows/admin");
const { handleOperadorMessage } = require("../flows/operador");
const mensajes = require("./mensajes");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function rutearMensaje(telefono, body, mediaUrl) {
  // FIX: Comandos operador siempre van a operador, ignorando sesion admin
  const _textoUpper = (body || '').trim().toUpperCase();
  if (/^(INICIO|FIN|PARO|REANUDA|FALLA|HORAS|PDF)\b/.test(_textoUpper)) {
    console.log('[ROUTER_OVERRIDE_OPERADOR]', { telefono, body: _textoUpper });
    return await handleOperadorMessage(telefono, body, mediaUrl);
  }

  const sesion = await getSession(telefono);

  if (sesion) {
    if (sesion.flujo === "admin_onboarding" || sesion.flujo === "admin_auth") {
      return await handleAdminMessage(telefono, body, mediaUrl);
    }
    if (sesion.flujo === "operador") {
      return await handleOperadorMessage(telefono, body, mediaUrl);
    }
  }

  const { data: empresa } = await supabase
    .from("empresas")
    .select("id")
    .eq("admin_telefono", telefono)
    .limit(1)
    .single();

  if (empresa) {
    return await handleAdminMessage(telefono, body, mediaUrl);
  }

  const telNorm = normalizarE164(telefono);

  const { data: op } = await supabase
    .from("usuarios")
    .select("id")
    .eq("rol", "operador")
    .eq("activo", true)
    .eq("telefono", telNorm)
    .limit(1)
    .single();

  if (op) {
    return await handleOperadorMessage(telefono, body, mediaUrl);
  }

  return mensajes.noRegistrado();
}

module.exports = { rutearMensaje };
