const fs = require("fs");
let c = fs.readFileSync("webhook.js", "utf8");
let cambios = 0;

// Override ANTES del rutearMensaje en el bloque admin
const oldAdmin = `    if (nuevaEmpresa) {
      const respuestaNueva = await rutearMensaje(telefonoNorm, body, mediaUrl);
      if (incomingId) await marcarProcesado(incomingId, respuestaNueva);
      twiml.message(respuestaNueva);
      return res.type('text/xml').send(twiml.toString());
    }`;

const newAdmin = `    if (nuevaEmpresa) {
      // FIX FINAL: Override PARO/FALLA natural - bypass router para admin
      const esParoNaturalWH = /sin diesel|no hay diesel|falta diesel|sin combustible|sin gasolina|no hay material|sin material|se acabo el diesel/i.test(body);
      const esFallaNaturalWH = /\\b(falla|fall[oó]|fugando|fuga de|no arranca|no enciende|se descompuso|se rompi[oó])\\b/i.test(body);

      let respuestaNueva;
      if (esParoNaturalWH || esFallaNaturalWH) {
        console.log('OVERRIDE_PARO_NATURAL', { from: telefonoNorm, body: body });
        respuestaNueva = await handleOperadorMessage(telefonoNorm, body, mediaUrl);
      } else {
        respuestaNueva = await rutearMensaje(telefonoNorm, body, mediaUrl);
      }
      if (incomingId) await marcarProcesado(incomingId, respuestaNueva);
      twiml.message(respuestaNueva);
      return res.type('text/xml').send(twiml.toString());
    }`;

if (c.includes(oldAdmin)) {
  c = c.replace(oldAdmin, newAdmin);
  console.log("FIX-FINAL: Override PARO/FALLA en bloque admin");
  cambios++;
} else {
  console.log("FIX-FINAL: patron admin no encontrado");
}

console.log("\\nTotal cambios: " + cambios);
fs.writeFileSync("webhook.js", c);
console.log("ARCHIVO GUARDADO");
