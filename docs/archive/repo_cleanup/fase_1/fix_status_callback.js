const fs = require("fs");
let c = fs.readFileSync("webhook.js", "utf8");
let cambios = 0;

// 1. Ignorar status callbacks de Twilio (no son mensajes entrantes)
const oldFrom = "  const from = req.body.From || '';";

const newFrom = `  const from = req.body.From || '';

  // FIX: Ignorar status callbacks de Twilio (no son mensajes entrantes)
  const messageStatus = req.body.MessageStatus || req.body.SmsStatus || '';
  if (messageStatus && messageStatus !== 'received') {
    return res.type('text/xml').send(new twilio.twiml.MessagingResponse().toString());
  }`;

if (c.includes(oldFrom)) {
  c = c.replace(oldFrom, newFrom);
  console.log("FIX-STATUS: Status callbacks ignorados");
  cambios++;
}

// 2. Agregar log detallado del override
const oldOverrideLog = "      console.log('OVERRIDE_PARO_NATURAL', { from: telefonoNorm, body: body, time: new Date().toISOString() });";

const newOverrideLog = "      console.log('OVERRIDE_PARO_NATURAL', { from: telefonoNorm, body: body, esParo: esParoNaturalWH, esFalla: esFallaNaturalWH, time: new Date().toISOString() });";

if (c.includes(oldOverrideLog)) {
  c = c.replace(oldOverrideLog, newOverrideLog);
  console.log("FIX-STATUS: Log override actualizado");
  cambios++;
}

console.log("\\nTotal cambios: " + cambios);
fs.writeFileSync("webhook.js", c);
console.log("ARCHIVO GUARDADO");
