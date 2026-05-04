const fs = require("fs");
let lines = fs.readFileSync("webhook.js", "utf8").split("\n");
let cambios = 0;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("TEXTO NORMALIZADO") && lines[i].includes("_safeNorm")) {
    let indent = "  ";
    lines.splice(i + 1, 0,
      indent + "// OVERRIDE OPERADOR: comandos operativos ignoran sesion admin",
      indent + "if (/^(inicio|fin|paro|reanuda|falla|horas|pdf)\\b/i.test(texto)) {",
      indent + "  console.log('[WEBHOOK_OVERRIDE_OPERADOR]', { from, body });",
      indent + "  const { handleOperadorMessage } = require('./flows/operador');",
      indent + "  const respuestaOp = await handleOperadorMessage(from, body, mediaUrl);",
      indent + "  const twimlOp = new twilio.twiml.MessagingResponse();",
      indent + "  twimlOp.message(respuestaOp);",
      indent + "  return res.type('text/xml').send(twimlOp.toString());",
      indent + "}",
      ""
    );
    cambios++;
    console.log("OK: override operador insertado en linea ~" + (i + 2));
    break;
  }
}

if (cambios > 0) {
  fs.writeFileSync("webhook.js", lines.join("\n"), "utf8");
  console.log("OK: webhook.js guardado (" + cambios + " cambios)");
} else {
  console.log("WARN: patron no encontrado");
}