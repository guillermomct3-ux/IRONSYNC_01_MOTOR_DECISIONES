const fs = require("fs");
let c = fs.readFileSync("webhook.js", "utf8");

// Fix 1: sanitizar REQUEST RECIBIDO
const old1 = "console.log('REQUEST RECIBIDO:', req.method, req.path, req.body);";
const new1 = [
  "const _safeBody = Object.assign({}, req.body);",
  "if (_safeBody.Body && /^\\d{4,6}$/.test(_safeBody.Body.trim())) _safeBody.Body = '****';",
  "if (_safeBody.Digits && /^\\d{4,6}$/.test(_safeBody.Digits.trim())) _safeBody.Digits = '****';",
  "console.log('REQUEST RECIBIDO:', req.method, req.path, _safeBody);"
].join(" ");

// Fix 2: sanitizar TEXTO NORMALIZADO
const old2 = "console.log('TEXTO NORMALIZADO:', textoNorm);";
const new2 = "const _safeNorm = /^\\d{4,6}$/.test(textoNorm) ? '****' : textoNorm; console.log('TEXTO NORMALIZADO:', _safeNorm);";

if (c.includes(old1)) {
  c = c.replace(old1, new1);
  console.log("FIX 1 APLICADO: REQUEST RECIBIDO sanitizado");
} else {
  console.log("FIX 1: patron no encontrado, revisar manualmente");
}

if (c.includes(old2)) {
  c = c.replace(old2, new2);
  console.log("FIX 2 APLICADO: TEXTO NORMALIZADO sanitizado");
} else {
  console.log("FIX 2: patron no encontrado, revisar manualmente");
}

fs.writeFileSync("webhook.js", c);
console.log("ARCHIVO GUARDADO");
