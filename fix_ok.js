const fs = require("fs");
let c = fs.readFileSync("flows/operador.js", "utf8");

const old = 'case "esperando_horometro_inicio":\n      const h = parseFloat(msg);';

const nuevo = 'case "esperando_horometro_inicio":\n      if (upper === "OK") {\n        const { data: utOk } = await supabase.from("turnos").select("horometro_fin").eq("operador_id", operador.id).eq("equipo_id", datos.equipo_id).eq("estado", "cerrado").order("fin", { ascending: false }).limit(1).maybeSingle();\n        if (utOk && utOk.horometro_fin) {\n          datos.horometro_inicio = utOk.horometro_fin;\n          await saveSession(telefono, "operador", "esperando_foto_inicio", datos);\n          return "\\u2705 Turno abierto \\u00b7 " + (datos.equipo_alias || datos.equipo_codigo) + " \\u00b7 " + utOk.horometro_fin + " hrs.\\n\\nToma foto del contador.\\nSi no puedes, manda el n\\u00famero que ves.";\n        }\n        return "No tengo un contador anterior.\\nManda el n\\u00famero del contador.\\nEjemplo: 5690";\n      }\n      const h = parseFloat(msg);';

if (c.includes(old)) {
  c = c.replace(old, nuevo);
  console.log("UPG-26: OK para aceptar horometro prefill APLICADO");
} else {
  console.log("UPG-26: patron no encontrado");
}

fs.writeFileSync("flows/operador.js", c);
console.log("ARCHIVO GUARDADO");
