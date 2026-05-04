const fs = require("fs");
let c = fs.readFileSync("flows/operador.js", "utf8");

// UPG-01: Activación con contexto
const old = 'respuesta = "\\u2705 Cuenta activada.\\n";\n  if (maquina) {\n    respuesta += "Tu m\\u00e1quina: " + (maquina.alias || maquina.codigo);\n    if (maquina.alias && maquina.codigo) {\n      respuesta += " \\u00b7 " + maquina.codigo;\n    }\n    respuesta += "\\n";\n  }\n  respuesta += "\\nPara iniciar turno manda: INICIO";';

const nuevo = 'respuesta = "Cuenta activada.\\n";\n  if (maquina) {\n    respuesta += "Tu máquina: " + (maquina.alias || maquina.codigo);\n    if (maquina.alias && maquina.codigo) {\n      respuesta += " · " + maquina.codigo;\n    }\n    respuesta += "\\n";\n  }\n  respuesta += "\\nPara empezar manda:\\nINICIO";';

if (c.includes(old)) {
  c = c.replace(old, nuevo);
  console.log("UPG-01 APLICADO: Activación con contexto");
} else {
  console.log("UPG-01: patron no encontrado, buscando variación...");
  // Buscar variación
  const i = c.indexOf("Cuenta activada");
  if (i > -1) {
    console.log("Contexto actual:");
    console.log(JSON.stringify(c.substring(i, i+300)));
  }
}

fs.writeFileSync("flows/operador.js", c);
console.log("ARCHIVO GUARDADO");
