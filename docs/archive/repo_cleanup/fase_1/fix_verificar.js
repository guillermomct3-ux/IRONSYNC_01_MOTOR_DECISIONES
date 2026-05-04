const fs = require("fs");
let c = fs.readFileSync("routes/verificar.js", "utf8");
let cambios = 0;

// 1. Agregar require de express.Router al inicio
const oldStart = "const crypto = require('crypto');";
const newStart = "const crypto = require('crypto');\nconst express = require('express');\nconst router = express.Router();";

if (c.includes(oldStart)) {
  c = c.replace(oldStart, newStart);
  console.log("FIX: express.Router agregado");
  cambios++;
}

// 2. Reemplazar module.exports por router
const oldExport = "module.exports = { verificarFolio };";
const newExport = "router.get('/:folio', verificarFolio);\nmodule.exports = router;";

if (c.includes(oldExport)) {
  c = c.replace(oldExport, newExport);
  console.log("FIX: exporta router en vez de objeto");
  cambios++;
}

console.log("\\nTotal cambios: " + cambios);
fs.writeFileSync("routes/verificar.js", c);
console.log("ARCHIVO GUARDADO");
