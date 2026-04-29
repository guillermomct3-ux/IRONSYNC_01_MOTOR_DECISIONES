const fs = require("fs");
let c = fs.readFileSync("lib/router.js", "utf8");

// FIX 11: Buscar operador por teléfono normalizado directo
const oldCode = '  const telNorm = normalizarE164(telefono);\n  const digits = telNorm ? telNorm.slice(-10) : "";\n\n  const { data: op } = await supabase\n    .from("usuarios")\n    .select("id")\n    .eq("rol", "operador")\n    .eq("activo", true)\n    .ilike("telefono", "%" + digits)\n    .limit(1)\n    .single();';

const newCode = '  const telNorm = normalizarE164(telefono);\n\n  const { data: op } = await supabase\n    .from("usuarios")\n    .select("id")\n    .eq("rol", "operador")\n    .eq("activo", true)\n    .eq("telefono", telNorm)\n    .limit(1)\n    .single();';

if (c.includes(oldCode)) {
  c = c.replace(oldCode, newCode);
  console.log("FIX 11 APLICADO: Ruteo operador optimizado");
} else {
  console.log("FIX 11: patron no encontrado");
}

fs.writeFileSync("lib/router.js", c);
console.log("ARCHIVO GUARDADO");
