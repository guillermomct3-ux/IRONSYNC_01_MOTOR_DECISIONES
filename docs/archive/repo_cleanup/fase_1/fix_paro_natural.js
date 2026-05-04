const fs = require("fs");
let c = fs.readFileSync("flows/operador.js", "utf8");
let cambios = 0;

// Agregar deteccion de lenguaje natural ANTES de los comandos
const oldParo = '  if (upper === "PARO") {\n    return await cmdParo(telefono, operador);\n  }';

const newParo = '  // UPG-05: Detectar lenguaje natural de PARO directo\n  const paroDirecto = buscarParoNatural(msg);\n  if (paroDirecto && !await getTurnoAbierto(operador.id)) {\n    // No tiene turno abierto, ignorar\n  } else if (paroDirecto) {\n    const turno = await getTurnoAbierto(operador.id);\n    if (turno) {\n      return await registrarParo(telefono, { turno_id: turno.id, horometro_inicio: turno.horometro_inicio }, paroDirecto.tipo, paroDirecto.motivo);\n    }\n  }\n\n  if (upper === "PARO") {\n    return await cmdParo(telefono, operador);\n  }';

if (c.includes(oldParo)) {
  c = c.replace(oldParo, newParo);
  console.log("UPG-05: Deteccion paro natural directo agregado");
  cambios++;
} else {
  console.log("UPG-05: patron PARO no encontrado");
}

console.log("\\nTotal cambios: " + cambios);
fs.writeFileSync("flows/operador.js", c);
console.log("ARCHIVO GUARDADO");
