const fs = require("fs");
let c = fs.readFileSync("lib/sesiones.js", "utf8");

const newFile = `const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const TTL_MINUTOS = 30;
const CACHE_TTL_MS = 30000;

// FIX 8: Cache local para reducir queries a Supabase
const cacheLocal = new Map();

function getCached(telefono) {
  const entry = cacheLocal.get(telefono);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    cacheLocal.delete(telefono);
    return null;
  }
  return entry.data;
}

function setCache(telefono, data) {
  if (data) {
    cacheLocal.set(telefono, { data, ts: Date.now() });
  } else {
    cacheLocal.delete(telefono);
  }
}

async function getSession(telefono) {
  const cached = getCached(telefono);
  if (cached !== undefined) {
    if (cached === null) return null;
    const updatedAt = new Date(cached.updated_at);
    const minutos = (Date.now() - updatedAt.getTime()) / 60000;
    if (minutos > TTL_MINUTOS) {
      await clearSession(telefono);
      return null;
    }
    return cached;
  }

  const { data } = await supabase
    .from("sesiones")
    .select("*")
    .eq("telefono", telefono)
    .single();

  if (!data) {
    setCache(telefono, null);
    return null;
  }

  const updatedAt = new Date(data.updated_at);
  const minutos = (Date.now() - updatedAt.getTime()) / 60000;

  if (minutos > TTL_MINUTOS) {
    await clearSession(telefono);
    return null;
  }

  setCache(telefono, data);
  return data;
}

async function saveSession(telefono, flujo, paso, datos) {
  const record = {
    telefono,
    flujo,
    paso,
    datos: datos || {},
    updated_at: new Date().toISOString()
  };
  await supabase
    .from("sesiones")
    .upsert(record, { onConflict: "telefono" });
  setCache(telefono, record);
}

async function clearSession(telefono) {
  await supabase
    .from("sesiones")
    .delete()
    .eq("telefono", telefono);
  setCache(telefono, null);
}

module.exports = { getSession, saveSession, clearSession };
`;

fs.writeFileSync("lib/sesiones.js", newFile);
console.log("FIX 8 APLICADO: Cache local de sesiones");
