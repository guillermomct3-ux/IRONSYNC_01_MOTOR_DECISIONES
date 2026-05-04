const fs = require("fs");
let lines = fs.readFileSync("turnos.js", "utf8").split("\n");
let cambios = 0;

// FIX 1: Buscar empresa_id antes del insert (despues de buscarNombreOperador)
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("const nuevoTurno = {") && lines[i].includes("from,")) {
    // Insertar busqueda de empresa_id ANTES de nuevoTurno
    let indent = "    ";
    lines.splice(i, 0,
      indent + "// FIX: Buscar empresa_id del operador",
      indent + "let empresaIdTurno = null;",
      indent + "try {",
      indent + "  const { data: opData } = await supabase",
      indent + "    .from('operadores')",
      indent + "    .select('empresa_id')",
      indent + "    .eq('telefono', from.replace('whatsapp:', ''))",
      indent + "    .maybeSingle();",
      indent + "  if (opData && opData.empresa_id) {",
      indent + "    empresaIdTurno = opData.empresa_id;",
      indent + "  }",
      indent + "}",
      indent + "if (!empresaIdTurno) {",
      indent + "  try {",
      indent + "    const { data: userData } = await supabase",
      indent + "      .from('usuarios')",
      indent + "      .select('empresa_id')",
      indent + "      .eq('telefono', from.replace('whatsapp:', ''))",
      indent + "      .maybeSingle();",
      indent + "    if (userData && userData.empresa_id) {",
      indent + "      empresaIdTurno = userData.empresa_id;",
      indent + "    }",
      indent + "  } catch(e) {}",
      indent + "}",
      indent + "console.log('[EMPRESA_ID_LOOKUP]', { from: from, empresaId: empresaIdTurno });",
      ""
    );
    cambios++;
    console.log("OK: busqueda empresa_id agregada");
    break;
  }
}

// Recargar indices despues de insert
lines = lines.join("\n").split("\n");

// FIX 2: Agregar empresa_id al insert de Supabase
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes(".insert({") && i > 230 && i < 260) {
    for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
      if (lines[j].includes("operador_id: from,")) {
        let indent = lines[j].match(/^(\s*)/)[1];
        lines.splice(j, 0,
          indent + "empresa_id: empresaIdTurno,"
        );
        cambios++;
        console.log("OK: empresa_id agregado al insert");
        break;
      }
    }
    break;
  }
}

// Recargar indices
lines = lines.join("\n").split("\n");

// FIX 3: Reemplazar empresaId: null en payloads de dispararPDFAsync
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("empresaId: null,")) {
    lines[i] = lines[i].replace("empresaId: null,", "empresaId: empresaIdTurno,");
    cambios++;
    console.log("OK: empresaId null -> empresaIdTurno en linea " + (i + 1));
  }
}

if (cambios > 0) {
  fs.writeFileSync("turnos.js", lines.join("\n"), "utf8");
  console.log("OK: turnos.js guardado (" + cambios + " cambios)");
} else {
  console.log("WARN: no encontro patrones para corregir");
}