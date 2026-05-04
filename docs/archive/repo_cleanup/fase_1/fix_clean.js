const fs = require("fs");
let lines = fs.readFileSync("webhook.js", "utf8").split("\n");
let cambios = 0;

// FIX 1: Linea 159 - quitar incomingId (no existe aun)
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("if (incomingId) await marcarProcesado(incomingId, respuestaOverride)")) {
    lines[i] = "      // incomingId se registra despues de idempotencia";
    console.log("FIX1: incomingId removido del override en linea " + (i+1));
    cambios++;
    break;
  }
}

// FIX 2: Quitar override duplicado en bloque nuevaEmpresa (linea ~197)
// Buscar el segundo OVERRIDE_PARO_NATURAL y su bloque
let foundFirst = false;
let removeStart = -1;
let removeEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("OVERRIDE_PARO_NATURAL")) {
    if (!foundFirst) {
      foundFirst = true;
      continue;
    }
    // Segundo override - marcar para remover
    removeStart = i - 3; // incluir las lineas de regex antes
    // Buscar el cierre del if block
    let braceCount = 0;
    for (let j = i - 3; j < lines.length; j++) {
      if (lines[j].includes("{")) braceCount++;
      if (lines[j].includes("}")) braceCount--;
      if (braceCount === 0) {
        removeEnd = j + 1;
        break;
      }
    }
    break;
  }
}

if (removeStart >= 0 && removeEnd >= 0) {
  console.log("FIX2: Removiendo override duplicado lineas " + (removeStart+1) + "-" + removeEnd);
  lines.splice(removeStart, removeEnd - removeStart);
  cambios++;
}

fs.writeFileSync("webhook.js", lines.join("\n"));
console.log("\\nTotal cambios: " + cambios);
console.log("Lineas finales: " + lines.length);
console.log("ARCHIVO GUARDADO");
