const fs = require("fs");
let c = fs.readFileSync("webhook.js", "utf8");
let cambios = 0;

// Override ANTES de sesionNueva - justo despues de incomingId
const oldSesion = `    const incomingId = idResult.id;
    const { getSession } = require('./lib/sesiones');
    const sesionNueva = await getSession(telefonoNorm);`;

const newSesion = `    const incomingId = idResult.id;

    // FIX FINAL: Override PARO/FALLA natural - ANTES de sesiones y router
    const esParoNaturalWH = /sin diesel|no hay diesel|falta diesel|sin combustible|sin gasolina|no hay material|sin material|se acabo el diesel/i.test(body);
    const esFallaNaturalWH = /\\b(falla|fall[oó]|fugando|fuga de|no arranca|no enciende|se descompuso|se rompi[oó])\\b/i.test(body);

    if (esParoNaturalWH || esFallaNaturalWH) {
      console.log('OVERRIDE_PARO_NATURAL', { from: telefonoNorm, body: body, time: new Date().toISOString() });
      const respuestaOverride = await handleOperadorMessage(telefonoNorm, body, mediaUrl);
      if (incomingId) await marcarProcesado(incomingId, respuestaOverride);
      twiml.message(respuestaOverride);
      return res.type('text/xml').send(twiml.toString());
    }

    const { getSession } = require('./lib/sesiones');
    const sesionNueva = await getSession(telefonoNorm);`;

if (c.includes(oldSesion)) {
  c = c.replace(oldSesion, newSesion);
  console.log("FIX-TOP: Override PARO/FALLA ANTES de sesionNueva");
  cambios++;
} else {
  console.log("FIX-TOP: patron incomingId no encontrado");
}

console.log("\\nTotal cambios: " + cambios);
fs.writeFileSync("webhook.js", c);
console.log("ARCHIVO GUARDADO");
