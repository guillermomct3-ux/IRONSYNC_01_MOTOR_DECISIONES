const fs = require("fs");
let c = fs.readFileSync("flows/operador.js", "utf8");

const oldCode = 'async function activarCuenta(telefono, operador, msg) {\n  const pin = msg.replace(/\\D/g, "");';

const newCode = 'async function activarCuenta(telefono, operador, msg) {\n  const puedeIntentar = await verificarRateLimit("pin_op_" + telefono, 5, 15);\n  if (!puedeIntentar) {\n    return "Demasiados intentos. Espera 15 minutos.";\n  }\n  const pin = msg.replace(/\\D/g, "");';

if (c.includes(oldCode)) {
  c = c.replace(oldCode, newCode);
  console.log("FIX 3 APLICADO: Rate limiting en activarCuenta");
} else {
  console.log("FIX 3: NO SE PUDO APLICAR");
}

fs.writeFileSync("flows/operador.js", c);
console.log("ARCHIVO GUARDADO");
