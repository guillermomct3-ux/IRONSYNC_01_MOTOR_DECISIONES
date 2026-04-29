const fs = require("fs");
let c = fs.readFileSync("flows/operador.js", "utf8");

const oldCode = 'async function cerrarTurno(telefono, datos, fotoUrl, sinFoto) {\n  const horas = Math.round((datos.horometro_fin - datos.horometro_inicio) * 10) / 10;\n\n  try {\n    await supabase.from("turnos").update(';

const newCode = 'async function cerrarTurno(telefono, datos, fotoUrl, sinFoto) {\n  const horas = Math.round((datos.horometro_fin - datos.horometro_inicio) * 10) / 10;\n\n  try {\n    // FIX 5: Cerrar paro abierto antes de cerrar turno\n    const { data: paroAbierto } = await supabase\n      .from("turno_eventos")\n      .select("id, timestamp_inicio")\n      .eq("turno_id", datos.turno_id)\n      .is("timestamp_fin", null)\n      .limit(1)\n      .single();\n\n    if (paroAbierto) {\n      const duracionMin = Math.round((Date.now() - new Date(paroAbierto.timestamp_inicio).getTime()) / 60000);\n      await supabase\n        .from("turno_eventos")\n        .update({\n          timestamp_fin: new Date().toISOString(),\n          duracion_min: duracionMin\n        })\n        .eq("id", paroAbierto.id);\n    }\n\n    await supabase.from("turnos").update(';

if (c.includes(oldCode)) {
  c = c.replace(oldCode, newCode);
  console.log("FIX 5 APLICADO: Cerrar paro antes de FIN");
} else {
  console.log("FIX 5: patron no encontrado");
}

fs.writeFileSync("flows/operador.js", c);
console.log("ARCHIVO GUARDADO");
