const fs = require("fs");
let c = fs.readFileSync("flows/operador.js", "utf8");
let cambios = 0;

// UPG-01: Activación con contexto
const oldAct1 = 'return "Cuenta activada.\\n\\nTu m\\u00e1quina: " + (maquina.alias || maquina.codigo)';
if (c.includes(oldAct1)) {
  c = c.replace(oldAct1,
    'return "? Cuenta activada.\\n\\n" + (maquina ? ("Tu máquina: " + (maquina.alias || maquina.codigo) + "\\n") : "") + "\\nPara empezar manda: INICIO"');
  console.log("UPG-01: Activación con contexto");
  cambios++;
}

// UPG-02: Eliminar "SIN FOTO" (dos ocurrencias)
const sinFoto1 = 'Si no puedes, escribe: SIN FOTO';
if (c.includes(sinFoto1)) {
  c = c.replaceAll(sinFoto1, 'Si no puedes, manda el número que ves.');
  console.log("UPG-02: Eliminar SIN FOTO");
  cambios++;
}

const sinFoto2 = 'Si no puedes, escribe: SIN FOTO';
if (c.includes(sinFoto2)) {
  c = c.replaceAll(sinFoto2, 'Si no puedes, manda el número que ves.');
  cambios++;
}

// UPG-04: Mensajes más humanos
const oldHorInv = '"El contador final no puede ser menor que el inicial (" +\n         datos.horometro_inicio + ").\\nIntenta de nuevo."';
const newHorInv = '"El número no se ve bien.\\nEl contador final no puede ser menor que el inicial (" +\n         datos.horometro_inicio + ").\\nRevísalo y mándalo otra vez."';
if (c.includes('"El contador final no puede ser menor')) {
  c = c.replace(
    /"El contador final no puede ser menor que el inicial $$" \+\s*datos\.horometro_inicio \+ "$$\.\\nIntenta de nuevo\."/,
    '"El número no se ve bien.\\nEl contador final no puede ser menor que el inicial (" + datos.horometro_inicio + ").\\nRevísalo y mándalo otra vez."'
  );
  console.log("UPG-04: Mensaje horómetro más humano");
  cambios++;
}

// UPG-04: "No te entendí" más humano
if (c.includes('return "No te entend')) {
  c = c.replace(
    /return "No te entend\\u00ed\..*?"/s,
    'return "No entendí.\\n\\nManda INICIO para abrir turno\\nManda AYUDA para opciones\\nManda FIN para cerrar turno"'
  );
  console.log("UPG-04: NoEntendi más humano");
  cambios++;
}

// UPG-04: "PIN debe tener" más humano
if (c.includes('El PIN debe tener')) {
  c = c.replace(
    /return "El PIN debe tener \d+ a \d+ d\\u00edgitos\.\\nEjemplo: \d+"/g,
    'return "Manda 4 números.\\nEjemplo: 3847"'
  );
  console.log("UPG-04: PIN más humano");
  cambios++;
}

// UPG-06: Siempre decir siguiente paso en turno abierto
if (c.includes('Al terminar manda FIN')) {
  c = c.replace(
    /Al terminar manda FIN/g,
    'Trabaja normal. Cuando termines manda:\\nFIN'
  );
  console.log("UPG-06: Siguiente paso claro");
  cambios++;
}

// UPG-06: REANUDA más claro
if (c.includes('Manda REANUDA cuando sigas')) {
  c = c.replace(
    /Manda REANUDA cuando sigas/g,
    'Cuando la máquina arranque manda:\\nREANUDA'
  );
  console.log("UPG-06: REANUDA más claro");
  cambios++;
}

// UPG-02: "SIN FOTO" en esperando_foto_fin
if (c.includes('SIN FOTO')) {
  c = c.replaceAll('SIN FOTO', 'el número que ves');
  console.log("UPG-02: Más referencias a SIN FOTO eliminadas");
  cambios++;
}

console.log("\\nTotal cambios: " + cambios);
console.log("Archivo guardado.");

fs.writeFileSync("flows/operador.js", c);
