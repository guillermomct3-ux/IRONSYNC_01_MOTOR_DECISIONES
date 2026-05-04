const fs = require("fs");
let c = fs.readFileSync("webhook.js", "utf8");
let cambios = 0;

const oldFrom = "const from = req.body.From;";
const newFrom = `const from = req.body.From;

  // FIX: Ignorar status callbacks de Twilio (no son mensajes entrantes)
  const messageStatus = req.body.MessageStatus || req.body.SmsStatus || '';
  if (messageStatus && messageStatus !== 'received') {
    return res.type('text/xml').send(new twilio.twiml.MessagingResponse().toString());
  }`;

if (c.includes(oldFrom)) {
  c = c.replace(oldFrom, newFrom);
  console.log("FIX-STATUS2: Status callbacks ignorados");
  cambios++;
} else {
  console.log("FIX-STATUS2: patron no encontrado");
}

console.log("\\nTotal cambios: " + cambios);
fs.writeFileSync("webhook.js", c);
console.log("ARCHIVO GUARDADO");
