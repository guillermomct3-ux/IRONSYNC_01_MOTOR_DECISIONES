const fs = require("fs");
let c = fs.readFileSync("webhook.js", "utf8");

const marker = "app.post('/webhook', async (req, res) => {\n  const from = req.body.From;";
const newBlock = "app.post('/webhook', async (req, res) => {\n  // FIX: Ignorar callbacks de status de Twilio\n  if (req.body.MessageStatus && !req.body.Body) {\n    console.log('[TWILIO_STATUS_CALLBACK]', {\n      status: req.body.MessageStatus,\n      sid: req.body.MessageSid,\n      to: req.body.To,\n      from: req.body.From\n    });\n    return res.status(200).send('');\n  }\n\n  const from = req.body.From;";

if (c.includes(marker)) {
  c = c.replace(marker, newBlock);
  console.log("OK: filtro Twilio status callbacks agregado");
} else {
  console.log("WARN: marker no encontrado");
}

fs.writeFileSync("webhook.js", c, "utf8");
console.log("OK: webhook.js guardado");