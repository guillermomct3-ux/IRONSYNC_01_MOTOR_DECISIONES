const fs = require("fs");
let c = fs.readFileSync("flows/operador.js", "utf8");
let cambios = 0;

// Fix case esperando_tipo_paro con texto exacto
const oldCase = `    case "esperando_tipo_paro":
      const tipoParo = TIPOS_PARO[msg];
      if (!tipoParo) {
        return "Responde 1, 2, 3 o 4:\\n1. Diesel\\n2. Espera cliente\\n3. Falla mecanica\\n4. Otro";
      }
      if (msg === "4") {
        await saveSession(telefono, "operador", "esperando_motivo_paro", datos);
        return "\\u00bfQu\\u00e9 pas\\u00f3? Descr\\u00edbelo en pocas palabras.";
      }
      return await registrarParo(telefono, datos, tipoParo.tipo, tipoParo.motivo);`;

const newCase = `    case "esperando_tipo_paro":
      // UPG-05: Primero intentar lenguaje natural
      const paroNatural = buscarParoNatural(msg);
      let tipoParo = null;
      if (paroNatural) {
        tipoParo = paroNatural;
      } else {
        tipoParo = TIPOS_PARO[msg];
      }
      if (!tipoParo) {
        // Si escribio algo no reconocido, tratarlo como OTRO
        return await registrarParo(telefono, datos, "PARO_OTRO", msg);
      }
      if (msg === "4") {
        await saveSession(telefono, "operador", "esperando_motivo_paro", datos);
        return "\\u00bfQu\\u00e9 pas\\u00f3? Descr\\u00edbelo en pocas palabras.";
      }
      return await registrarParo(telefono, datos, tipoParo.tipo, tipoParo.motivo);`;

if (c.includes(oldCase)) {
  c = c.replace(oldCase, newCase);
  console.log("UPG-05: Case esperando_tipo_paro actualizado");
  cambios++;
} else {
  console.log("UPG-05: patron case no encontrado - verificando...");
  // Debug: mostrar bytes del area
  const idx = c.indexOf('esperando_tipo_paro');
  if (idx > -1) {
    const snippet = c.substring(idx - 20, idx + 200);
    console.log("Encontrado en: " + snippet.substring(0, 100));
  } else {
    console.log("esperando_tipo_paro NO existe en el archivo");
  }
}

console.log("\\nTotal cambios: " + cambios);
if (cambios > 0) {
  fs.writeFileSync("flows/operador.js", c);
  console.log("ARCHIVO GUARDADO");
}
