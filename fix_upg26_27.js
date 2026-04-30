const fs = require("fs");
let c = fs.readFileSync("flows/operador.js", "utf8");
let cambios = 0;

// 1. Agregar require de saludos al inicio del archivo
if (!c.includes("require('../lib/saludos')")) {
  c = c.replace(
    "const supabase = require('../lib/supabaseClient');",
    "const supabase = require('../lib/supabaseClient');\nconst { getSaludoDelDia } = require('../lib/saludos');"
  );
  console.log("UPG-27: require saludos agregado");
  cambios++;
}

// 2. Reemplazar el mensaje cuando hay 1 sola máquina
//    ANTES: return (eq.alias || eq.codigo) + " · contador inicial.\nEjemplo: 5690";
//    DESPUÉS: saludo + último horómetro + "¿Confirmas? Manda OK o el número nuevo."
const old1 = 'return (eq.alias || eq.codigo) + " \\u00b7 contador inicial.\\nEjemplo: 5690";';

const new1 = `const saludo1 = getSaludoDelDia();
    const { data: ut1 } = await supabase.from('turnos').select('horometro_fin').eq('operador_id', operador.id).eq('equipo_id', eq.id).eq('estado', 'cerrado').order('fin', { ascending: false }).limit(1).maybeSingle();
    if (ut1 && ut1.horometro_fin) {
      return saludo1 + "\\n\\nLa última vez dejaste la " + (eq.alias || eq.codigo) + " en " + ut1.horometro_fin + " hrs.\\n¿Arrancamos con ese número? Manda OK o el contador actual.";
    }
    return saludo1 + "\\n\\n" + (eq.alias || eq.codigo) + " · contador inicial.\\nEjemplo: 5690";`;

if (c.includes(old1)) {
  c = c.replace(old1, new1);
  console.log("UPG-26/27: Horómetro prefill (1 máquina)");
  cambios++;
} else {
  console.log("UPG-26/27: patron 1 no encontrado");
}

// 3. Reemplazar el mensaje cuando hay múltiples máquinas (después de selección)
//    Buscar el patrón donde guarda la selección y pide horómetro
const old2 = 'return (sel.alias || sel.codigo) + " \\u00b7 contador inicial.\\nEjemplo: 5690";';

const new2 = `const saludo2 = getSaludoDelDia();
          const { data: ut2 } = await supabase.from('turnos').select('horometro_fin').eq('operador_id', operador.id).eq('equipo_id', sel.equipo_id).eq('estado', 'cerrado').order('fin', { ascending: false }).limit(1).maybeSingle();
          if (ut2 && ut2.horometro_fin) {
            return saludo2 + "\\n\\nLa última vez dejaste la " + (sel.alias || sel.codigo) + " en " + ut2.horometro_fin + " hrs.\\n¿Arrancamos con ese número? Manda OK o el contador actual.";
          }
          return saludo2 + "\\n\\n" + (sel.alias || sel.codigo) + " · contador inicial.\\nEjemplo: 5690";`;

if (c.includes(old2)) {
  c = c.replace(old2, new2);
  console.log("UPG-26/27: Horómetro prefill (múltiples máquinas)");
  cambios++;
} else {
  console.log("UPG-26/27: patron 2 no encontrado");
}

// 4. Manejar "OK" en esperando_horometro_inicio
//    Buscar el case y agregar lógica para OK
const oldCase = 'case "esperando_horometro_inicio":\n        const h = parseFloat(msg);';

const newCase = `case "esperando_horometro_inicio":
        if (upper === "OK") {
          const { data: utOk } = await supabase.from('turnos').select('horometro_fin').eq('operador_id', operador.id).eq('equipo_id', datos.equipo_id).eq('estado', 'cerrado').order('fin', { ascending: false }).limit(1).maybeSingle();
          if (utOk && utOk.horometro_fin) {
            datos.horometro_inicio = utOk.horometro_fin;
            await saveSession(telefono, "operador", "esperando_foto_inicio", datos);
            return "? Turno abierto · " + (datos.equipo_alias || datos.equipo_codigo) + " · " + utOk.horometro_fin + " hrs.\\n\\nToma foto del contador.\\nSi no puedes, manda el número que ves.";
          }
          return "No tengo un contador anterior.\\nManda el número del contador.\\nEjemplo: 5690";
        }
        const h = parseFloat(msg);`;

if (c.includes(oldCase)) {
  c = c.replace(oldCase, newCase);
  console.log("UPG-26: OK para aceptar horómetro prefill");
  cambios++;
} else {
  console.log("UPG-26/27: patron 3 no encontrado");
}

console.log("\\nTotal cambios: " + cambios);
fs.writeFileSync("flows/operador.js", c);
console.log("ARCHIVO GUARDADO");
