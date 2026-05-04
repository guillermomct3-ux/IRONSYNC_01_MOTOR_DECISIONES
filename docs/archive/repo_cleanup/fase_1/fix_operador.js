const fs = require("fs");
let c = fs.readFileSync("flows/operador.js", "utf8");

// 1. Agregar import si no existe
if (!c.includes("pdfAuto")) {
  c = 'const { dispararPDFAsync } = require("../lib/pdfAuto");\n' + c;
  console.log("OK: import agregado");
} else {
  console.log("OK: import ya existia");
}

// 2. Buscar y reemplazar cerrarTurno
const inicio = c.indexOf("async function cerrarTurno(");
if (inicio === -1) {
  console.log("ERROR: no encontro cerrarTurno");
  process.exit(1);
}

// Encontrar la llave de cierre de la funcion
let profundidad = 0;
let enFuncion = false;
let fin = inicio;
for (let i = inicio; i < c.length; i++) {
  if (c[i] === "{") {
    profundidad++;
    enFuncion = true;
  }
  if (c[i] === "}") {
    profundidad--;
    if (enFuncion && profundidad === 0) {
      fin = i + 1;
      break;
    }
  }
}

const oldFn = c.substring(inicio, fin);
console.log("Funcion encontrada: " + oldFn.length + " caracteres");

const newFn = `async function cerrarTurno(telefono, datos, fotoUrl, sinFoto) {
  var horas = Math.round((datos.horometro_fin - datos.horometro_inicio) * 10) / 10;

  try {
    // Cerrar paro abierto (Grok fix R6: maybeSingle)
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
        .update({
          timestamp_fin: new Date().toISOString(),
          duracion_min: duracionMin
        })
        .eq("id", paroAbierto.data.id);
    }

    // Actualizar turno a cerrado
    await supabase.from("turnos").update({
      fin: new Date().toISOString(),
      horometro_fin: datos.horometro_fin,
      horas_horometro: horas,
      foto_fin_url: fotoUrl,
      sin_foto_fin: sinFoto,
      estado: "cerrado"
    }).eq("id", datos.turno_id);

    // Buscar datos del turno para PDF
    var turnoData = await supabase
      .from("turnos")
      .select("folio, empresa_id")
      .eq("id", datos.turno_id)
      .single();

    // Limpiar sesion
    await clearSession(telefono);

    // ChatGPT fix R1: "generandose" no "generado"
    var r = "\\u2705 Turno cerrado \\u00b7 " + horas + " hrs.";
    if (sinFoto) r += "\\n\\u26a0\\ufe0f Sin foto de cierre.";
    r += "\\n\\ud83d\\udc44 Reporte gener\\u00e1ndose...";

    // PDF AUTOMATICO (fire and forget)
    if (turnoData && turnoData.data && turnoData.data.folio) {
      dispararPDFAsync({
        turnoId: datos.turno_id,
        folio: turnoData.data.folio,
        empresaId: turnoData.data.empresa_id,
        telefonoOperador: telefono,
        horasHorometro: horas,
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
console.log("OK: archivo guardado");
