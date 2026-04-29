const fs = require("fs");
let c = fs.readFileSync("flows/operador.js", "utf8");

const oldCode = 'if (error) throw error;';

const newCode = 'if (error) {\n      if (error.code === "23505") {\n        return "Ya tienes un turno abierto. Cierraloo con FIN antes de abrir otro.";\n      }\n      throw error;\n    }';

if (c.includes(oldCode)) {
  c = c.replace(oldCode, newCode);
  console.log("FIX 1 APLICADO: Race condition turno atrapada");
} else {
  console.log("FIX 1: patron no encontrado");
}

fs.writeFileSync("flows/operador.js", c);
console.log("ARCHIVO GUARDADO");
