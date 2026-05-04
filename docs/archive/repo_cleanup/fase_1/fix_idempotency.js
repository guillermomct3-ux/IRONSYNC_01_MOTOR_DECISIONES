const fs = require("fs");
let c = fs.readFileSync("webhook.js", "utf8");

const old = "await registrarMensajeEntrante(messageSid, telefonoNorm, body, mediaUrl);";
const fix = "await registrarMensajeEntrante({ messageSid: messageSid, telefono: telefonoNorm, body: body, mediaUrl: mediaUrl });";

if (c.includes(old)) {
  c = c.replace(old, fix);
  fs.writeFileSync("webhook.js", c, "utf8");
  console.log("OK: registrarMensajeEntrante corregido");
} else {
  console.log("ERROR: no encontro la llamada");
}
