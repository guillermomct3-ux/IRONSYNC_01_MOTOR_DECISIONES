const fs = require("fs");
let c = fs.readFileSync("flows/operador.js", "utf8");

const oldCode = 'if (asig) {\n        return await abrirTurno(telefono, operador, asig, horometro, null, false);\n      }';

const newCode = 'if (asig) {\n        await saveSession(telefono, "operador", "esperando_foto_inicio", {\n          asignacion_id: asig.id,\n          equipo_id: asig.equipos.id,\n          equipo_alias: asig.equipos.alias,\n          equipo_codigo: asig.equipos.codigo,\n          horometro_inicio: horometro\n        });\n        return "Manda foto del contador.\\nSi no puedes, escribe: SIN FOTO";\n      }';

if (c.includes(oldCode)) {
  c = c.replace(oldCode, newCode);
  console.log("FIX 12 APLICADO: Flujo texto pide foto");
} else {
  console.log("FIX 12: patron no encontrado");
}

fs.writeFileSync("flows/operador.js", c);
console.log("ARCHIVO GUARDADO");
