const fs = require("fs");
let c = fs.readFileSync("webhook.js", "utf8");
let cambios = 0;

// Mover override ANTES de registrarMensajeEntrante
const oldBlock = `    const telefonoNorm = deTwilioAtelefono(from);

    // UPG-13: Idempotencia \u2014 prevenir duplicados
    const messageSid = req.body.MessageSid || req.body.SmsMessageSid || null;
    const idResult = await registrarMensajeEntrante(messageSid, telefonoNorm, body, mediaUrl);
    if (idResult.duplicado) {
      console.log("DUPLICADO detectado:", idResult.razon);
      return res.type('text/xml').send(twiml.toString());
    }
    const incomingId = idResult.id;

    // FIX FINAL: Override PARO/FALLA natural - ANTES de sesiones y router
    const esParoNaturalWH = /sin diesel|no hay diesel|falta diesel|sin combustible|sin gasolina|no hay material|sin material|se acabo el diesel/i.test(body);
    const esFallaNaturalWH = /\\b(falla|fall[o\u00f3]|fugando|fuga de|no arranca|no enciende|se descompuso|se rompi[o\u00f3])\\b/i.test(body);

    if (esParoNaturalWH || esFallaNaturalWH) {
      console.log('OVERRIDE_PARO_NATURAL', { from: telefonoNorm, body: body, esParo: esParoNaturalWH, esFalla: esFallaNaturalWH, time: new Date().toISOString() });
      const { handleOperadorMessage: handleOp } = require('./flows/operador');
      const respuestaOverride = await handleOp(telefonoNorm, body, mediaUrl);
      if (incomingId) await marcarProcesado(incomingId, respuestaOverride);
      twiml.message(respuestaOverride);
      return res.type('text/xml').send(twiml.toString());
    }`;

const newBlock = `    const telefonoNorm = deTwilioAtelefono(from);

    // FIX FINAL: Override PARO/FALLA natural - ANTES de todo
    const esParoNaturalWH = /sin diesel|no hay diesel|falta diesel|sin combustible|sin gasolina|no hay material|sin material|se acabo el diesel/i.test(body);
    const esFallaNaturalWH = /\\b(falla|fall[o\u00f3]|fugando|fuga de|no arranca|no enciende|se descompuso|se rompi[o\u00f3])\\b/i.test(body);

    if (esParoNaturalWH || esFallaNaturalWH) {
      console.log('OVERRIDE_PARO_NATURAL', { from: telefonoNorm, body: body, esParo: esParoNaturalWH, esFalla: esFallaNaturalWH, time: new Date().toISOString() });
      const { handleOperadorMessage: handleOp } = require('./flows/operador');
      const respuestaOverride = await handleOp(telefonoNorm || from, body, mediaUrl);
      twiml.message(respuestaOverride);
      return res.type('text/xml').send(twiml.toString());
    }

    // UPG-13: Idempotencia \u2014 prevenir duplicados
    const messageSid = req.body.MessageSid || req.body.SmsMessageSid || null;
    const idResult = await registrarMensajeEntrante(messageSid, telefonoNorm, body, mediaUrl);
    if (idResult.duplicado) {
      console.log("DUPLICADO detectado:", idResult.razon);
      return res.type('text/xml').send(twiml.toString());
    }
    const incomingId = idResult.id;`;

if (c.includes(oldBlock)) {
  c = c.replace(oldBlock, newBlock);
  console.log("FIX-ANTES: Override movido ANTES de registrarMensajeEntrante");
  cambios++;
} else {
  console.log("FIX-ANTES: patron no encontrado");
}

console.log("\\nTotal cambios: " + cambios);
fs.writeFileSync("webhook.js", c);
console.log("ARCHIVO GUARDADO");
