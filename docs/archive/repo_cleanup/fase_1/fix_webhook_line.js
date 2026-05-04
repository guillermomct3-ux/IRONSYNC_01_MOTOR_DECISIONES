const fs = require("fs");
let lines = fs.readFileSync("webhook.js", "utf8").split("\n");
let cambios = 0;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("app.post('/webhook'") && lines[i].includes("async")) {
    // Encontrar la linea "const from = req.body.From;"
    for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
      if (lines[j].includes("const from = req.body.From")) {
        let indent = "  ";
        lines.splice(j, 0,
          indent + "// FIX: Ignorar callbacks de status de Twilio",
          indent + "if (req.body.MessageStatus && !req.body.Body) {",
          indent + "  console.log('[TWILIO_STATUS_CALLBACK]', {",
          indent + "    status: req.body.MessageStatus,",
          indent + "    sid: req.body.MessageSid,",
          indent + "    to: req.body.To,",
          indent + "    from: req.body.From",
          indent + "  });",
          indent + "  return res.status(200).send('');",
          indent + "}",
          ""
        );
        cambios++;
        console.log("OK: filtro Twilio agregado en linea ~" + (j + 1));
        break;
      }
    }
  }
}

if (cambios > 0) {
  fs.writeFileSync("webhook.js", lines.join("\n"), "utf8");
  console.log("OK: webhook.js guardado (" + cambios + " cambios)");
} else {
  console.log("WARN: no encontro patron para insertar");
}