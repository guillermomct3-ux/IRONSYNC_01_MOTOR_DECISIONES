const fs = require("fs");
let c = fs.readFileSync("flows/admin.js", "utf8");
let cambios = 0;

const oldAyuda = 'return "\\ud83d\\udcda Comandos:\\n\\nMAQUINA \\u2192 Registrar m\\u00e1quina\\nOPERADOR \\u2192 Registrar operador\\nESTADO \\u2192 Ver configuraci\\u00f3n\\nCANCELAR \\u2192 Salir de flujo\\nAYUDA \\u2192 Esta ayuda";';

const newAyuda = 'return "\\ud83d\\udcda Comandos:\\n\\n1. MAQUINA \\u2192 Registrar m\\u00e1quina\\n2. OPERADOR \\u2192 Registrar operador\\n3. ESTADO \\u2192 Ver configuraci\\u00f3n\\n4. AYUDA \\u2192 Esta ayuda\\n5. EDITAR \\u2192 Editar m\\u00e1quina\\nSTATUS \\u2192 Operadores activos/pendientes\\nCANCELAR \\u2192 Salir de flujo";';

if (c.includes(oldAyuda)) {
  c = c.replace(oldAyuda, newAyuda);
  console.log("Ayuda admin actualizada con EDITAR y STATUS");
  cambios++;
} else {
  console.log("Patron ayuda no encontrado");
}

console.log("\\nTotal cambios: " + cambios);
fs.writeFileSync("flows/admin.js", c);
console.log("ARCHIVO GUARDADO");
