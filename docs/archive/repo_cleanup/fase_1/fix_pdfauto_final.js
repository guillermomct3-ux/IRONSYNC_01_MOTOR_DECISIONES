const fs = require("fs");
let c = fs.readFileSync("lib/pdfAuto.js", "utf8");

if (!c.includes("TWILIO_API_KEY_SID")) {
  console.log("WARN: modo dual no encontrado");
}

const markerGenerar = "var resultadoPDF = await generarPDFReporteDiario(folio);";
const newGenerar = `var horometroFinalNum = Number(payload.horometroFinal);
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

if (c.includes(markerGenerar)) {
  c = c.replace(markerGenerar, newGenerar);
  console.log("OK: skip + override agregados");
} else {
  console.log("WARN: no encontro marker generarPDFReporteDiario");
}

fs.writeFileSync("lib/pdfAuto.js", c, "utf8");
console.log("OK: pdfAuto.js guardado");