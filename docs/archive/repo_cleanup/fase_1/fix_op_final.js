const fs = require("fs");
let c = fs.readFileSync("flows/operador.js", "utf8");

if (!c.includes("dispararPDFAsync")) {
  console.log("ERROR: falta import de dispararPDFAsync");
  process.exit(1);
}
console.log("OK: import dispararPDFAsync existe");

const inicio = c.indexOf("async function cerrarTurno(");
if (inicio === -1) {
  console.log("ERROR: no encontro cerrarTurno");
  process.exit(1);
}

let profundidad = 0;
let enFuncion = false;
let fin = inicio;
for (let i = inicio; i < c.length; i++) {
  if (c[i] === "{") { profundidad++; enFuncion = true; }
  if (c[i] === "}") { profundidad--; if (enFuncion && profundidad === 0) { fin = i + 1; break; } }
}

console.log("Funcion actual: " + (fin - inicio) + " caracteres");

const newFn = `async function cerrarTurno(telefono, datos, fotoUrl, sinFoto) {
  var horas = Math.round((datos.horometro_fin - datos.horometro_inicio) * 10) / 10;
  var timestampFin = new Date().toISOString();

  try {
    var paroAbierto = await supabase
      .from("turno_eventos")
      .select("id, timestamp_inicio")
      .eq("turno_id", datos.turno_id)
      .is("timestamp_fin", null)
      .limit(1)
      .maybeSingle();

    if (paroAbierto && paroAbierto.data) {
      var duracionMin = Math.round(
        (Date.now() - new Date(paroAbierto.data.timestamp_inicio).getTime()) / 60000
      );
      await supabase
        .from("turno_eventos")
        .update({ timestamp_fin: timestampFin, duracion_min: duracionMin })
        .eq("id", paroAbierto.data.id);
    }

    var updateResult = await supabase
      .from("turnos")
      .update({
        fin: timestampFin,
        horometro_fin: datos.horometro_fin,
        horas_horometro: horas,
        foto_fin_url: fotoUrl,
        sin_foto_fin: sinFoto,
        estado: "cerrado"
      })
      .eq("id", datos.turno_id)
      .select("folio, empresa_id")
      .single();

    if (updateResult.error) {
      console.error("ERROR_UPDATE_TURNO", updateResult.error);
      return mensajes.errorConexion();
    }

    var turnoCerrado = updateResult.data;
    await clearSession(telefono);

    var r = "\\u2705 Turno cerrado \\u00b7 " + horas + " hrs.";
    if (sinFoto) r += "\\n\\u26a0\\ufe0f Sin foto de cierre.";
    r += "\\nReporte gener\\u00e1ndose...";

    if (turnoCerrado && turnoCerrado.folio) {
      dispararPDFAsync({
        turnoId: datos.turno_id,
        folio: turnoCerrado.folio,
        empresaId: turnoCerrado.empresa_id,
        telefonoOperador: telefono,
        horasHorometro: horas,
        horometroFinal: datos.horometro_fin,
        timestampFin: timestampFin,
        equipoTexto: datos.equipo_alias || datos.equipo_codigo || "equipo"
      });
    }

    return r;

  } catch (error) {
    console.error("ERROR_CERRAR_TURNO", error);
    return mensajes.errorConexion();
  }
}`;

c = c.substring(0, inicio) + newFn + c.substring(fin);
fs.writeFileSync("flows/operador.js", c, "utf8");
console.log("OK: cerrarTurno reemplazada");