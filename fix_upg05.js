const fs = require("fs");
let c = fs.readFileSync("flows/operador.js", "utf8");
let cambios = 0;

// 1. Agregar mapa de lenguaje natural después de TIPOS_PARO
const oldTipos = `const TIPOS_PARO = {
  "1": { tipo: "PARO_CLI", motivo: "Diesel" },
  "2": { tipo: "PARO_CLI", motivo: "Espera cliente" },
  "3": { tipo: "PARO_ARR", motivo: "Falla mecanica" },
  "4": { tipo: "PARO_OTRO", motivo: "Otro" }
};`;

const newTipos = `const TIPOS_PARO = {
  "1": { tipo: "PARO_CLI", motivo: "Diesel" },
  "2": { tipo: "PARO_CLI", motivo: "Espera cliente" },
  "3": { tipo: "PARO_ARR", motivo: "Falla mecanica" },
  "4": { tipo: "PARO_OTRO", motivo: "Otro" }
};

// UPG-05: Lenguaje natural para PARO
const PARO_NATURAL = [
  { palabras: ["sin diesel", "no hay diesel", "diesel", "gasolina", "sin gasolina", "sin combustible"], tipo: "PARO_CLI", motivo: "Diesel" },
  { palabras: ["espera", "esperando", "cliente", "espera cliente", "no hay material", "me dijeron que pare", "pararon", "me pararon"], tipo: "PARO_CLI", motivo: "Espera cliente" },
  { palabras: ["falla", "se descompuso", "no jala", "fallo", "mecanica", "falla mecanica", "se atoro", "no enciende", "se calo", "se caló", "reventó", "revento", "pinchazo", "llanta"], tipo: "PARO_ARR", motivo: "Falla mecanica" }
];

function buscarParoNatural(texto) {
  const lower = texto.toLowerCase().trim();
  for (let i = 0; i < PARO_NATURAL.length; i++) {
    const grupo = PARO_NATURAL[i];
    for (let j = 0; j < grupo.palabras.length; j++) {
      if (lower.includes(grupo.palabras[j])) {
        return { tipo: grupo.tipo, motivo: grupo.motivo };
      }
    }
  }
  return null;
}`;

if (c.includes(oldTipos)) {
  c = c.replace(oldTipos, newTipos);
  console.log("UPG-05: Mapa PARO_NATURAL agregado");
  cambios++;
} else {
  console.log("UPG-05: patron TIPOS_PARO no encontrado");
}

// 2. Modificar el menú de PARO para decir que puede escribir con sus palabras
const oldMenu = 'return "\\u00bfQu\\u00e9 pas\\u00f3?\\n\\n1. Diesel\\n2. Espera cliente\\n3. Falla mecanica\\n4. Otro";';

const newMenu = 'return "\\u00bfQu\\u00e9 pas\\u00f3?\\n\\n1. Diesel\\n2. Espera cliente\\n3. Falla mecanica\\n4. Otro\\n\\nTambi\\u00e9n puedes escribirlo con tus palabras.";';

if (c.includes(oldMenu)) {
  c = c.replace(oldMenu, newMenu);
  console.log("UPG-05: Menu PARO actualizado");
  cambios++;
} else {
  console.log("UPG-05: patron menu PARO no encontrado");
}

// 3. Modificar case esperando_tipo_paro para aceptar lenguaje natural
const oldCase = `case "esperando_tipo_paro":
      const tipoParo = TIPOS_PARO[msg];
      if (!tipoParo) {
        return "Elige 1, 2, 3 o 4.";
      }`;

const newCase = `case "esperando_tipo_paro":
      // UPG-05: Primero intentar lenguaje natural
      const paroNatural = buscarParoNatural(msg);
      let tipoParo = null;
      if (paroNatural) {
        tipoParo = paroNatural;
      } else {
        tipoParo = TIPOS_PARO[msg];
      }
      if (!tipoParo) {
        // Si escribió algo que no es número ni palabra reconocida, tratarlo como OTRO
        tipoParo = { tipo: "PARO_OTRO", motivo: msg };
      }`;

if (c.includes(oldCase)) {
  c = c.replace(oldCase, newCase);
  console.log("UPG-05: Case esperando_tipo_paro actualizado");
  cambios++;
} else {
  console.log("UPG-05: patron case esperando_tipo_paro no encontrado");
}

console.log("\\nTotal cambios: " + cambios);
fs.writeFileSync("flows/operador.js", c);
console.log("ARCHIVO GUARDADO");
