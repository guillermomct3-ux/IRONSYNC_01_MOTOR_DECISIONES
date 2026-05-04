const fs = require("fs");
let c = fs.readFileSync("services/pdfReporteDiario.js", "utf8");

const oldFirma = "async function generarPDFReporteDiario(folio) {";
const newFirma = "async function generarPDFReporteDiario(folio, datosOverride) {";
if (c.includes(oldFirma)) {
  c = c.replace(oldFirma, newFirma);
  console.log("OK: firma actualizada");
} else {
  console.log("WARN: firma no encontrada");
}

const markerValidacion = "if (turnoError || !turno) {";
const markerIdx = c.indexOf(markerValidacion);
if (markerIdx === -1) {
  console.log("ERROR: bloque validacion no encontrado");
  process.exit(1);
}

const throwBlock = c.indexOf("throw new Error", markerIdx);
const cierreThrow = c.indexOf("}", throwBlock);
const despuesThrow = c.indexOf("\n", cierreThrow) + 1;

const overrideBlock = `
  if (datosOverride) {
    if (datosOverride.horometroFinal !== null && datosOverride.horometroFinal !== undefined) {
      turno.horometro_fin = Number(datosOverride.horometroFinal);
    }
    if (datosOverride.horasHorometro !== null && datosOverride.horasHorometro !== undefined) {
      turno.horas_horometro = Number(datosOverride.horasHorometro);
    }
    if (datosOverride.timestampFin) {
      turno.fin = datosOverride.timestampFin;
    }
    console.log("[PDF_OVERRIDE_APLICADO]", { folio: folio });
  }

  if (datosOverride && turno.horometro_fin !== Number(datosOverride.horometroFinal)) {
    console.error("[PDF_OVERRIDE_WARNING]", {
      folio: folio,
      mensaje: "BD tiene horometro_fin diferente al override"
    });
  }
`;

c = c.substring(0, despuesThrow) + overrideBlock + c.substring(despuesThrow);
console.log("OK: override insertado DESPUES de validacion");

const oldCalc1 = "const horasHorometro = turno.horas_horometro ||";
const oldCalc2 = "    Math.round((horometroFin - horometroInicio) * 10) / 10;";

if (c.includes(oldCalc1) && c.includes(oldCalc2)) {
  const oldCalc = oldCalc1 + "\n" + oldCalc2;
  const newCalc = `var horasHorometroNum = Number(turno.horas_horometro);
  var horometroInicioNum = Number(turno.horometro_inicio);
  var horometroFinNum = Number(turno.horometro_fin);

  var horasHorometro = Number.isFinite(horasHorometroNum) ? horasHorometroNum : 0;

  if (
    Number.isFinite(horometroInicioNum) &&
    Number.isFinite(horometroFinNum) &&
    horometroFinNum >= horometroInicioNum
  ) {
    horasHorometro = Math.round((horometroFinNum - horometroInicioNum) * 10) / 10;
  }

  if (horasHorometro < 0) {
    console.error("[PDF_HORAS_NEGATIVAS]", { folio: folio, horas: horasHorometro });
    horasHorometro = 0;
  }`;
  c = c.replace(oldCalc, newCalc);
  console.log("OK: proteccion horas negativas aplicada");
} else {
  console.log("WARN: calculo horas no encontrado");
}

fs.writeFileSync("services/pdfReporteDiario.js", c, "utf8");
console.log("OK: pdfReporteDiario.js guardado");