const fs = require("fs");
let c = fs.readFileSync("flows/admin.js", "utf8");
let cambios = 0;

// 1. Agregar comando STATUS en handleAdminExistente
const oldMenu = 'if (upper.includes("AYUDA") || upper === "4") {\n    return mostrarAyudaAdmin();\n  }';

const newMenu = 'if (upper.includes("AYUDA") || upper === "4") {\n    return mostrarAyudaAdmin();\n  }\n\n  if (upper === "STATUS") {\n    return await mostrarEstadoActivacion(empresa.id);\n  }';

if (c.includes(oldMenu)) {
  c = c.replace(oldMenu, newMenu);
  console.log("UPG-03: Comando STATUS agregado al menu");
  cambios++;
} else {
  console.log("UPG-03: patron menu no encontrado");
}

// 2. Agregar funcion mostrarEstadoActivacion despues de mostrarEstado
const oldMostrar = 'async function mostrarResumen(empresaId) {';

const newFunc = 'async function mostrarEstadoActivacion(empresaId) {\n  const operadores = await getOperadoresByEmpresa(empresaId);\n\n  let activos = 0;\n  let pendientes = 0;\n\n  let reporte = "Estado de activacion:\\n";\n\n  operadores.forEach(function(op) {\n    const activo = op.pin && op.pin.length > 0;\n    if (activo) {\n      reporte += "\\n? " + op.nombre + " - activo";\n      activos++;\n    } else {\n      reporte += "\\n? " + op.nombre + " - pendiente";\n      pendientes++;\n    }\n  });\n\n  reporte += "\\n\\n" + activos + " de " + operadores.length + " activos.";\n\n  if (pendientes > 0) {\n    reporte += "\\n\\nMandales un mensaje a los pendientes para que pongan su PIN.";\n  }\n\n  return reporte;\n}\n\nasync function mostrarResumen(empresaId) {';

if (c.includes(oldMostrar)) {
  c = c.replace(oldMostrar, newFunc);
  console.log("UPG-03: Funcion mostrarEstadoActivacion agregada");
  cambios++;
} else {
  console.log("UPG-03: patron funcion no encontrado");
}

console.log("\\nTotal cambios: " + cambios);
fs.writeFileSync("flows/admin.js", c);
console.log("ARCHIVO GUARDADO");
