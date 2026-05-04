const fs = require("fs");
let lines = fs.readFileSync("flows/../webhook.js", "utf8").split("\n");

// Lineas 160-171 (0-indexed: 159-170) = bloque override PARO/FALLA
// Moverlo ANTES de la linea 153 (0-indexed: 152) = registrarMensajeEntrante

// Extraer bloque override (lineas 160 a 171)
const overrideBlock = lines.slice(159, 171);

// Lineas sin el override
const before = lines.slice(0, 159);  // hasta antes del override
const after = lines.slice(171);      // despues del override

// Reconstruir: antes + override + despues
// Pero insertar override despues de telefonoNorm (linea 149)
// y ANTES de registrarMensajeEntrante (linea 153)

const part1 = lines.slice(0, 150);    // hasta telefonoNorm inclusive
const part2 = lines.slice(150, 159);  // idempotencia + incomingId
const part3 = lines.slice(159, 171);  // override block
const part4 = lines.slice(171);       // resto

// Rebuild: part1 + override + part2 + part4
const newLines = [...part1, ...part3, ...part2, ...part4];

fs.writeFileSync("webhook.js", newLines.join("\n"));
console.log("Override movido ANTES de registrarMensajeEntrante");
console.log("Lineas: " + lines.length + " -> " + newLines.length);
