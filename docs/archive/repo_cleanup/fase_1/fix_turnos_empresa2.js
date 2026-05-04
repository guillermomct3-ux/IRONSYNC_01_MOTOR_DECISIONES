const fs = require("fs");
let lines = fs.readFileSync("turnos.js", "utf8").split("\n");
let cambios = 0;

// Buscar "let turnoSupabaseData = null;" e insertar lookup DESPUES
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("let turnoSupabaseData = null;")) {
    let indent = "    ";
    lines.splice(i + 1, 0,
      indent + "// FIX: Buscar empresa_id del operador",
      indent + "let empresaIdTurno = null;",
      indent + "try {",
      indent + "  const { data: opData } = await supabase",
      indent + "    .from('operadores')",
      indent + "    .select('empresa_id')",
      indent + "    .eq('telefono', from.replace('whatsapp:', ''))",
      indent + "    .maybeSingle();",
      indent + "  if (opData && opData.empresa_id) empresaIdTurno = opData.empresa_id;",
      indent + "} catch(e) {}",
      indent + "if (!empresaIdTurno) {",
      indent + "  try {",
      indent + "    const { data: userData } = await supabase",
      indent + "      .from('usuarios')",
      indent + "      .select('empresa_id')",
      indent + "      .eq('telefono', from.replace('whatsapp:', ''))",
      indent + "      .maybeSingle();",
      indent + "    if (userData && userData.empresa_id) empresaIdTurno = userData.empresa_id;",
      indent + "  } catch(e) {}",
      indent + "}",
      indent + "console.log('[EMPRESA_ID_LOOKUP]', { from: from, empresaId: empresaIdTurno });"
    );
    cambios++;
    console.log("OK: lookup empresa_id insertado en linea ~" + (i + 2));
    break;
  }
}

// Recargar
lines = lines.join("\n").split("\n");

// FIX 2: Agregar empresa_id al insert
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("operador_id: from,") && !lines[i-1].includes("empresa_id:")) {
    let indent = lines[i].match(/^(\s*)/)[1];
    lines.splice(i, 0, indent + "empresa_id: empresaIdTurno,");
    cambios++;
    console.log("OK: empresa_id insertado en insert Supabase");
    break;
  }
}

// Recargar
lines = lines.join("\n").split("\n");

// FIX 3: Reemplazar empresaId: null en payloads
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("empresaId: null,")) {
    lines[i] = lines[i].replace("empresaId: null,", "empresaId: empresaIdTurno,");
    cambios++;
    console.log("OK: empresaId null reemplazado en linea " + (i + 1));
  }
}

if (cambios > 0) {
  fs.writeFileSync("turnos.js", lines.join("\n"), "utf8");
  console.log("OK: turnos.js guardado (" + cambios + " cambios)");
} else {
  console.log("WARN: no encontro patrones");
}