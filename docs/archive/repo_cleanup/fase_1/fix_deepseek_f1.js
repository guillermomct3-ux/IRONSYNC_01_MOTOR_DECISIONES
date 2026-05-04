const fs = require("fs");
let c = fs.readFileSync("flows/operador.js", "utf8");
let cambios = 0;

// 1. Reemplazar la detección actual de PARO natural por la versión de DeepSeek
const oldParoDetect = `  // UPG-05: Detectar lenguaje natural de PARO directo
  const paroDirecto = buscarParoNatural(msg);
  if (paroDirecto && !await getTurnoAbierto(operador.id)) {
    // No tiene turno abierto, ignorar
  } else if (paroDirecto) {
    const turno = await getTurnoAbierto(operador.id);
    if (turno) {
      return await registrarParo(telefono, { turno_id: turno.id, horometro_inicio: turno.horometro_inicio }, paroDirecto.tipo, paroDirecto.motivo);
    }
  }

  if (upper === "PARO") {`;

const newParoDetect = `  // FIX DeepSeek: Detectar lenguaje natural ANTES de comandos
  const esParoNatural = /^(sin|falta|se acabo|se termino|no hay)\\s+(diesel|material|combustible|aire|agua|aceite)/i.test(msg) || /sin diesel|no hay diesel|se quedo sin diesel|sin gasolina|sin combustible/i.test(msg);
  const esFallaNatural = /^(falla|se rompio|no sirve|fuga|truena|suena raro|no arranca|no enciende|se descompuso|se atoro|pinchazo|revent/i.test(msg);

  if (esParoNatural) {
    return await procesarParoNatural(telefono, operador, msg.trim());
  }
  if (esFallaNatural) {
    return await procesarFallaNatural(telefono, operador, msg.trim());
  }

  if (upper === "PARO") {`;

if (c.includes(oldParoDetect)) {
  c = c.replace(oldParoDetect, newParoDetect);
  console.log("FIX-DS1: Deteccion PARO/FALLA natural reemplazada");
  cambios++;
} else {
  console.log("FIX-DS1: patron PARO detect no encontrado");
}

// 2. Agregar funciones procesarParoNatural y procesarFallaNatural antes de module.exports
const oldExport = "module.exports = { handleOperadorMessage };";

const newFuncs = `// FIX DeepSeek: Procesar PARO en lenguaje natural sin menu
async function procesarParoNatural(telefono, operador, motivo) {
  const turno = await getTurnoAbierto(operador.id);
  if (!turno) {
    return "No tienes turno abierto. Manda INICIO primero.";
  }

  const { data: evento } = await supabase
    .from("turno_eventos")
    .insert({
      turno_id: turno.id,
      tipo_evento: "PARO_OTRO",
      motivo_reportado: motivo,
      timestamp_inicio: new Date().toISOString()
    })
    .select()
    .single();

  await saveSession(telefono, "operador", "esperando_reanuda", {
    turno_id: turno.id,
    horometro_inicio: turno.horometro_inicio,
    evento_inicio: new Date().toISOString(),
    evento_id: evento ? evento.id : null
  });

  return "\\u2705 Paro registrado \\u00b7 " + motivo + "\\nCuando la m\\u00e1quina arranque manda:\\nREANUDA";
}

async function procesarFallaNatural(telefono, operador, motivo) {
  const turno = await getTurnoAbierto(operador.id);
  if (!turno) {
    return "No tienes turno abierto. Manda INICIO primero.";
  }

  await supabase.from("turno_eventos").insert({
    turno_id: turno.id,
    tipo_evento: "FALLA",
    motivo_reportado: motivo,
    timestamp_inicio: new Date().toISOString()
  });

  await saveSession(telefono, "operador", "esperando_reanuda", {
    turno_id: turno.id,
    horometro_inicio: turno.horometro_inicio,
    evento_inicio: new Date().toISOString()
  });

  return "\\u26a0\\ufe0f Falla registrada \\u00b7 " + motivo + "\\nSe notific\\u00f3 al supervisor.\\nCuando la m\\u00e1quina arranque manda:\\nREANUDA";
}

module.exports = { handleOperadorMessage };`;

if (c.includes(oldExport)) {
  c = c.replace(oldExport, newFuncs);
  console.log("FIX-DS1: Funciones procesarParoNatural y procesarFallaNatural agregadas");
  cambios++;
} else {
  console.log("FIX-DS1: patron module.exports no encontrado");
}

console.log("\\nTotal cambios: " + cambios);
fs.writeFileSync("flows/operador.js", c);
console.log("ARCHIVO GUARDADO");
