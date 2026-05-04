const fs = require("fs");
let lines = fs.readFileSync("turnos.js", "utf8").split("\n");
let cambios = 0;

for (let i = 0; i < lines.length; i++) {
  // Buscar payloads de dispararPDFAsync que NO tengan horometroFinal
  if (lines[i].includes("dispararPDFAsync({")) {
    // Verificar si el bloque ya tiene horometroFinal
    let bloque = "";
    for (let j = i; j < Math.min(i + 12, lines.length); j++) {
      bloque += lines[j];
    }

    if (!bloque.includes("horometroFinal")) {
      // Buscar la linea "equipoTexto:" y agregar campos ANTES
      for (let j = i; j < Math.min(i + 12, lines.length); j++) {
        if (lines[j].includes("equipoTexto:")) {
          // Agregar horometroFinal y timestampFin antes de equipoTexto
          let indent = lines[j].match(/^(\s*)/)[1];
          lines.splice(j, 0,
            indent + "horometroFinal: horometroFinal,",
            indent + "timestampFin: new Date().toISOString(),"
          );
          cambios++;
          console.log("OK: campos agregados en linea ~" + (i + 1));
          break;
        }
      }
    }
  }
}

if (cambios > 0) {
  fs.writeFileSync("turnos.js", lines.join("\n"), "utf8");
  console.log("OK: turnos.js guardado (" + cambios + " cambios)");
} else {
  console.log("WARN: no encontro payloads para corregir");
}