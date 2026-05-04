const fs = require("fs");
let c = fs.readFileSync("lib/pdfAuto.js", "utf8");

const oldBlock = `  // 1. Generar PDF
  var horometroFinalNum = Number(payload.horometroFinal);
  if (
    payload.horometroFinal === null ||
    payload.horometroFinal === undefined ||
    !Number.isFinite(horometroFinalNum)
  ) {
    console.log("[PDF_AUTO_SKIP]", {
      folio: folio,
      razon: "horometro_fin_invalido",
      valor: payload.horometroFinal
    });
    return { ok: false, skip: true, reason: "horometro_fin_invalido" };
  }

  var resultadoPDF = await generarPDFReporteDiario(folio, {
    horometroFinal: horometroFinalNum,
    horasHorometro: Number(payload.horasHorometro),
    timestampFin: payload.timestampFin || null
  });`;

const newBlock = `  // 1. Resolver datos definitivos (camelCase, snake_case, fallback DB)
  var horometroFinalRaw =
    payload.horometroFinal !== undefined ? payload.horometroFinal :
    payload.horometro_final !== undefined ? payload.horometro_final :
    payload.horometro_fin !== undefined ? payload.horometro_fin :
    null;

  var horasRaw =
    payload.horasHorometro !== undefined ? payload.horasHorometro :
    payload.horas_turno !== undefined ? payload.horas_turno :
    payload.horas_horometro !== undefined ? payload.horas_horometro :
    payload.unidades_horometro !== undefined ? payload.unidades_horometro :
    null;

  var timestampFinRaw =
    payload.timestampFin ||
    payload.timestamp_fin ||
    null;

  // Fallback: leer desde Supabase si payload incompleto
  if ((horometroFinalRaw === null || horometroFinalRaw === undefined) && turnoId) {
    var turnoFallback = await supabase
      .from("turnos")
      .select("horometro_fin, horas_horometro, horas_turno, fin")
      .eq("id", turnoId)
      .maybeSingle();

    if (turnoFallback && turnoFallback.data) {
      console.log("[PDF_AUTO_FALLBACK_DB]", {
        folio: folio,
        horometro_fin: turnoFallback.data.horometro_fin,
        horas: turnoFallback.data.horas_horometro
      });
      horometroFinalRaw = turnoFallback.data.horometro_fin;
      horasRaw = turnoFallback.data.horas_horometro !== null
        ? turnoFallback.data.horas_horometro
        : turnoFallback.data.horas_turno;
      timestampFinRaw = turnoFallback.data.fin || timestampFinRaw;
    }
    if (turnoFallback && turnoFallback.error) {
      console.error("[PDF_AUTO_FALLBACK_DB_ERROR]", turnoFallback.error.message);
    }
  }

  var horometroFinalNum = Number(horometroFinalRaw);
  var horasHorometroNum = Number(horasRaw);

  if (!Number.isFinite(horometroFinalNum)) {
    console.log("[PDF_AUTO_SKIP]", {
      folio: folio,
      razon: "horometro_fin_invalido",
      valor: horometroFinalRaw
    });
    return { ok: false, skip: true, reason: "horometro_fin_invalido" };
  }

  if (!Number.isFinite(horasHorometroNum)) { horasHorometroNum = 0; }

  var resultadoPDF = await generarPDFReporteDiario(folio, {
    horometroFinal: horometroFinalNum,
    horasHorometro: horasHorometroNum,
    timestampFin: timestampFinRaw
  });`;

if (c.includes(oldBlock)) {
  c = c.replace(oldBlock, newBlock);
  console.log("OK: bloque resiliente reemplazado");
} else {
  console.log("WARN: bloque no encontrado");
}

fs.writeFileSync("lib/pdfAuto.js", c, "utf8");
console.log("OK: pdfAuto.js guardado");