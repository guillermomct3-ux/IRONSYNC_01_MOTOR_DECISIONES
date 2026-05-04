const fs = require("fs");

const file = "turnos.js";
let c = fs.readFileSync(file, "utf8");
let lines = c.split(/\r?\n/);

function fail(msg) {
  console.error("ERROR:", msg);
  process.exit(1);
}

// 1) Agregar empresa_id: null dentro de nuevoTurno, después de serie,
let idxNuevoTurno = lines.findIndex(l => l.includes("const nuevoTurno = {"));
if (idxNuevoTurno === -1) fail("No encontré const nuevoTurno");

let idxSerie = -1;
for (let i = idxNuevoTurno; i < Math.min(idxNuevoTurno + 30, lines.length); i++) {
  if (lines[i].trim() === "serie,") {
    idxSerie = i;
    break;
  }
}
if (idxSerie === -1) fail("No encontré serie, dentro de nuevoTurno");

let yaTieneEmpresaId = false;
for (let i = idxNuevoTurno; i < Math.min(idxNuevoTurno + 30, lines.length); i++) {
  if (lines[i].includes("empresa_id:")) yaTieneEmpresaId = true;
}

if (!yaTieneEmpresaId) {
  lines.splice(idxSerie + 1, 0, "      empresa_id: null,");
  console.log("OK: agregado empresa_id: null en nuevoTurno");
} else {
  console.log("SKIP: nuevoTurno ya tiene empresa_id");
}

c = lines.join("\n");

// 2) Propagar empresaIdTurno al objeto local antes del insert
if (!c.includes("nuevoTurno.empresa_id = empresaIdTurno;")) {
  const marker = "console.log('[EMPRESA_ID_LOOKUP]', { from: from, empresaId: empresaIdTurno });";
  const pos = c.indexOf(marker);
  if (pos === -1) fail("No encontré log EMPRESA_ID_LOOKUP");
  const insertPos = pos + marker.length;
  c = c.slice(0, insertPos) + "\n    nuevoTurno.empresa_id = empresaIdTurno;" + c.slice(insertPos);
  console.log("OK: agregado nuevoTurno.empresa_id = empresaIdTurno");
} else {
  console.log("SKIP: ya existe nuevoTurno.empresa_id = empresaIdTurno");
}

// 3) Cambiar .select('id') por .select('id, empresa_id')
if (!c.includes(".select('id, empresa_id')")) {
  const selectCount = (c.match(/\.select\('id'\)/g) || []).length;
  if (selectCount < 1) fail("No encontré .select('id')");
  c = c.replace(".select('id')", ".select('id, empresa_id')");
  console.log("OK: cambiado select id por id, empresa_id");
} else {
  console.log("SKIP: select id, empresa_id ya existe");
}

// 4) Guardar empresa_id devuelto por Supabase
if (!c.includes("nuevoTurno.empresa_id = turnoSupabase.empresa_id || empresaIdTurno;")) {
  const marker = "nuevoTurno.supabase_id = turnoSupabase.id;";
  const pos = c.indexOf(marker);
  if (pos === -1) fail("No encontré nuevoTurno.supabase_id = turnoSupabase.id");
  const insertPos = pos + marker.length;
  c = c.slice(0, insertPos) + "\n        nuevoTurno.empresa_id = turnoSupabase.empresa_id || empresaIdTurno;" + c.slice(insertPos);
  console.log("OK: agregado nuevoTurno.empresa_id desde Supabase");
} else {
  console.log("SKIP: ya existe asignación empresa_id desde Supabase");
}

// 5) Agregar empresa_id al turnoRecuperado
if (!c.includes("empresa_id: turnoSupabase.empresa_id || null,")) {
  const marker = "serie: turnoSupabase.serie || 'SIN-SERIE',";
  const pos = c.indexOf(marker);
  if (pos === -1) fail("No encontré serie en turnoRecuperado");
  const insertPos = pos + marker.length;
  c = c.slice(0, insertPos) + "\n      empresa_id: turnoSupabase.empresa_id || null," + c.slice(insertPos);
  console.log("OK: agregado empresa_id en turnoRecuperado");
} else {
  console.log("SKIP: turnoRecuperado ya tiene empresa_id");
}

// 6) Cambiar SOLO payloads de PDF automático, no el console.log
const beforeCount = (c.match(/empresaId: empresaIdTurno,/g) || []).length;
if (beforeCount !== 2) {
  fail("Se esperaban 2 ocurrencias exactas de empresaId: empresaIdTurno, encontradas: " + beforeCount);
}
c = c.replace(/empresaId: empresaIdTurno,/g, "empresaId: turno.empresa_id || null,");
console.log("OK: reemplazadas 2 ocurrencias empresaId en dispararPDFAsync");

fs.writeFileSync(file, c, "utf8");
console.log("FIX COMPLETADO: turnos.js actualizado");
