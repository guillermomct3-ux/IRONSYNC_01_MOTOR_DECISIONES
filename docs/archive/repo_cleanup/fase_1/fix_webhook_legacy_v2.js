const fs = require("fs");
let c = fs.readFileSync("webhook.js", "utf8");

const marker = "console.log('TEXTO NORMALIZADO:', _safeNorm);";

if (!c.includes(marker)) {
  console.log("ERROR: marker no encontrado");
  process.exit(1);
}

if (c.includes("[WEBHOOK_LEGACY_OPERATOR_OVERRIDE]")) {
  console.log("OK: override ya existe");
  process.exit(0);
}

const insert = `
  // OVERRIDE LEGACY OPERADOR - usa funciones ya importadas (sin require dinamico)
  const textoOpRaw = (textoNorm || "").trim();
  let textoOp = textoOpRaw;
  let bodyOp = body;

  if (/^(nicio|icio)\\b/i.test(textoOpRaw)) {
    textoOp = textoOpRaw.replace(/^(nicio|icio)\\b/i, "inicio");
    bodyOp = body.replace(/^\\s*(nicio|icio)\\b/i, "INICIO");
  }

  if (/^(inicio|fin|paro|reanuda|falla|horas)\\b/i.test(textoOp)) {
    console.log("[WEBHOOK_LEGACY_OPERATOR_OVERRIDE]", { from, bodyOriginal: body, bodyOp, textoOp });
    let respOp = "";
    try {
      if (/^inicio\\b/i.test(textoOp)) {
        respOp = await procesarInicioTurno(from, bodyOp);
      } else if (/^fin\\b/i.test(textoOp)) {
        respOp = await procesarFinTurno(from, bodyOp);
      } else if (/^paro\\b/i.test(textoOp)) {
        respOp = procesarParo(null, from);
      } else if (/^falla\\b/i.test(textoOp)) {
        respOp = procesarFalla(null, from);
      } else if (/^reanuda\\b/i.test(textoOp)) {
        respOp = procesarReanuda(null, from);
      } else if (/^horas\\b/i.test(textoOp)) {
        respOp = await procesarReporteHoras(from, bodyOp);
      }
    } catch (e) {
      console.error("[LEGACY_OVERRIDE_ERROR]", e.message);
      respOp = "Error procesando comando. Intenta de nuevo.";
    }
    const twimlOp = new twilio.twiml.MessagingResponse();
    twimlOp.message(respOp);
    return res.type("text/xml").send(twimlOp.toString());
  }
`;

c = c.replace(marker, marker + insert);

fs.writeFileSync("webhook.js", c, "utf8");
console.log("OK: override legacy (sin require dinamico) insertado");