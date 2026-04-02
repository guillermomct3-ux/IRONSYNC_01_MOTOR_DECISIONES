const express = require("express");
const bodyParser = require("body-parser");

// IMPORTANTE: asegúrate que la ruta sea correcta
const { processEvents } = require("../ENGINE/engine_v1_FINAL_FROZEN");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// ------------------------
// VALIDACIÓN DE INPUT
// ------------------------
function validateInput(req) {
  const text = (req.body.Body || "").trim();
  const hasText = text.length > 0;
  const hasMedia = req.body.MediaUrl0 ? true : false;

  if (!hasText && !hasMedia) {
    return { valid: false, message: null };
  }

  if (hasMedia && !hasText) {
    return {
      valid: false,
      message:
        "Recibido ✓\n\n⚠️ Falta información\n→ Escribe el dato (ej: '3 viajes')",
    };
  }

  if (!hasMedia && hasText) {
    return {
      valid: false,
      message:
        "Recibido ✓\n\n⚠️ Falta foto\n→ Envíala junto con el texto",
    };
  }

  return { valid: true };
}

// ------------------------
// ADAPTADOR
// ------------------------
function adaptTwilioToEvent(req) {
  const foto = req.body.MediaUrl0 || "no_foto";

  const operador = (req.body.From || "sin_nombre")
    .replace("whatsapp:", "")
    .replace("+52", "")
    .trim();

  const timestamp = new Date().toISOString();

  return `${foto}|${operador}|${timestamp}`;
}

// ------------------------
// EXTRACTOR STATUS
// ------------------------
function extractStatus(result) {
  if (!result) return "NON_BILLABLE";

  return (
    result.pipeline_status ||
    (result.details &&
      result.details[0] &&
      result.details[0].pipeline_status) ||
    "NON_BILLABLE"
  );
}

// ------------------------
// RESPUESTA AL OPERADOR
// ------------------------
function formatResponse(result) {
  const status = extractStatus(result);

  if (status === "BILLABLE") {
    return "Recibido ✓\n\n✅ Registro válido";
  }

  if (status === "PROVISIONAL") {
    return "Recibido ✓\n\n⚠️ Falta información\n→ No borres la foto";
  }

  return "Recibido ✓\n\n❌ No se pudo procesar\n→ Reenvía foto + texto juntos";
}

// ------------------------
// LOGGING
// ------------------------
function logEvent(from, raw, result, response) {
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      from,
      raw,
      status: extractStatus(result),
      response,
    })
  );
}

// ------------------------
// WEBHOOK
// ------------------------
app.post("/webhook", (req, res) => {
  let message = "Recibido ✓";
  let result = null;
  let rawEvent = null;

  try {
    const validation = validateInput(req);

    if (!validation.valid) {
      message = validation.message || message;
    } else {
      rawEvent = adaptTwilioToEvent(req);

      const output = processEvents([rawEvent]);

      result = output[0];

      message = formatResponse(result);
    }

    logEvent(req.body.From, rawEvent, result, message);

  } catch (error) {
    console.error("Error interno:", error);
  }

  // 🔴 CRÍTICO — SIEMPRE 200
  res.status(200).send(`
    <Response>
      <Message>${message}</Message>
    </Response>
  `);
});

// ------------------------
app.listen(3000, () => {
  console.log("Webhook corriendo en puerto 3000");
});