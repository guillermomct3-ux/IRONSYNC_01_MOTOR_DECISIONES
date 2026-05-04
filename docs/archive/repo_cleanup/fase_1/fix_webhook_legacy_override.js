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
  // OVERRIDE LEGACY OPERADOR:
  // Comandos operativos saltan admin/onboarding y van directo a turnos.
  // Tolerancia a truncamiento: "NICIO"/"ICIO" -> "INICIO"
  const textoOperadorRaw = (textoNorm || "").trim();
  let textoOperador = textoOperadorRaw;
  let bodyOperador = body;

  if (/^(nicio|icio)\\b/i.test(textoOperadorRaw)) {
    textoOperador = textoOperadorRaw.replace(/^(nicio|icio)\\b/i, "inicio");
    bodyOperador = body.replace(/^\\s*(nicio|icio)\\b/i, "INICIO");
  }

  const esComandoLegacyOperador =
    /^(inicio|fin|paro|reanuda|falla|horas)\\b/i.test(textoOperador);

  if (esComandoLegacyOperador) {
    console.log("[WEBHOOK_LEGACY_OPERATOR_OVERRIDE]", {
      from: from,
      bodyOriginal: body,
      bodyOperador: bodyOperador,
      textoOperador: textoOperador
    });

    const { handleOperadorMessage } = require("./flows/operador");
    const respuestaOverride = await handleOperadorMessage(from, bodyOperador, mediaUrl);
    const twimlOverride = new twilio.twiml.MessagingResponse();
    twimlOverride.message(respuestaOverride);
    return res.type("text/xml").send(twimlOverride.toString());
  }
`;

c = c.replace(marker, marker + insert);

fs.writeFileSync("webhook.js", c, "utf8");
console.log("OK: override legacy operador insertado en webhook.js");