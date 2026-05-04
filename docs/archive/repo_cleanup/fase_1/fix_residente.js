const fs = require("fs");
let c = fs.readFileSync("flows/residente.js", "utf8");
let cambios = 0;

// 1. Reemplazar require global por lazy require
const oldRequire = "const bcrypt = require('bcryptjs');";
const newRequire = "// bcrypt se carga lazy para evitar crash si falta el modulo";

if (c.includes(oldRequire)) {
  c = c.replace(oldRequire, newRequire);
  console.log("FIX: require global de bcrypt removido");
  cambios++;
} else {
  console.log("FIX: patron require bcrypt no encontrado");
}

// 2. Agregar lazy require antes de cada uso de bcrypt
// Buscar "bcrypt.hash" y "bcrypt.compare" y agregar require local
const oldHash = "bcrypt.hash(";
const newHash = "require('bcryptjs').hash(";

while (c.includes(oldHash)) {
  c = c.replace(oldHash, newHash);
  cambios++;
  console.log("FIX: bcrypt.hash -> require('bcryptjs').hash");
}

const oldCompare = "bcrypt.compare(";
const newCompare = "require('bcryptjs').compare(";

while (c.includes(oldCompare)) {
  c = c.replace(oldCompare, newCompare);
  cambios++;
  console.log("FIX: bcrypt.compare -> require('bcryptjs').compare");
}

console.log("\\nTotal cambios: " + cambios);
fs.writeFileSync("flows/residente.js", c);
console.log("ARCHIVO GUARDADO");
