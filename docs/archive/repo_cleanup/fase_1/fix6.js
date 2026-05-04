const fs = require("fs");
let c = fs.readFileSync("flows/operador.js", "utf8");

const oldCode = 'async function registrarParo(telefono, datos, tipoEvento, motivo) {\n  await supabase.from("turno_eventos").insert({';

const newCode = 'async function registrarParo(telefono, datos, tipoEvento, motivo) {\n  // FIX 6: Validar turno existe y pertenece al operador\n  const { data: turnoValido } = await supabase\n    .from("turnos")\n    .select("id, operador_id, estado")\n    .eq("id", datos.turno_id)\n    .eq("estado", "abierto")\n    .limit(1)\n    .single();\n\n  if (!turnoValido) {\n    await clearSession(telefono);\n    return "Turno no valido. Manda INICIO para empezar.";\n  }\n\n  await supabase.from("turno_eventos").insert({';

if (c.includes(oldCode)) {
  c = c.replace(oldCode, newCode);
  console.log("FIX 6 APLICADO: Validar turno_id en registrarParo");
} else {
  console.log("FIX 6: patron no encontrado");
}

fs.writeFileSync("flows/operador.js", c);
console.log("ARCHIVO GUARDADO");
