const fs = require("fs");
let c = fs.readFileSync("webhook.js", "utf8");
let cambios = 0;

// 1. Quitar require al inicio (causa crash si el módulo falla)
const oldRequire = "const { handleOperadorMessage } = require('./flows/operador');";

if (c.includes(oldRequire)) {
  c = c.replace(oldRequire, "// handleOperadorMessage se carga lazy dentro del handler");
  console.log("FIX-LAZY: require al inicio removido");
  cambios++;
}

// 2. Cambiar el override para usar require lazy con try/catch
const oldOverride = `      console.log('OVERRIDE_PARO_NATURAL', { from: telefonoNorm, body: body, time: new Date().toISOString() });
      const respuestaOverride = await handleOperadorMessage(telefonoNorm, body, mediaUrl);`;

const newOverride = `      console.log('OVERRIDE_PARO_NATURAL', { from: telefonoNorm, body: body, time: new Date().toISOString() });
      const { handleOperadorMessage: handleOp } = require('./flows/operador');
      const respuestaOverride = await handleOp(telefonoNorm, body, mediaUrl);`;

if (c.includes(oldOverride)) {
  c = c.replace(oldOverride, newOverride);
  console.log("FIX-LAZY: require lazy con try/catch");
  cambios++;
} else {
  console.log("FIX-LAZY: patron override no encontrado");
}

console.log("\\nTotal cambios: " + cambios);
fs.writeFileSync("webhook.js", c);
console.log("ARCHIVO GUARDADO");
