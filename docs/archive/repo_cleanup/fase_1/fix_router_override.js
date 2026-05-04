const fs = require("fs");
let lines = fs.readFileSync("lib/router.js", "utf8").split("\n");
let cambios = 0;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("async function rutearMensaje(telefono, body, mediaUrl) {")) {
    lines.splice(i + 1, 0,
      "  // FIX: Comandos operador siempre van a operador, ignorando sesion admin",
      "  const _textoUpper = (body || '').trim().toUpperCase();",
      "  if (/^(INICIO|FIN|PARO|REANUDA|FALLA|HORAS|PDF)\\b/.test(_textoUpper)) {",
      "    console.log('[ROUTER_OVERRIDE_OPERADOR]', { telefono, body: _textoUpper });",
      "    return await handleOperadorMessage(telefono, body, mediaUrl);",
      "  }",
      ""
    );
    cambios++;
    console.log("OK: override operador insertado");
    break;
  }
}

if (cambios > 0) {
  fs.writeFileSync("lib/router.js", lines.join("\n"), "utf8");
  console.log("OK: router.js guardado (" + cambios + " cambios)");
} else {
  console.log("WARN: patron no encontrado");
}