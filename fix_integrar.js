const fs = require("fs");
let c = fs.readFileSync("webhook.js", "utf8");
let cambios = 0;

// 1. Agregar require de verificar y residente
const oldPdf = "const pdfRoutes = require('./routes/pdf');";
const newPdf = "const pdfRoutes = require('./routes/pdf');\nconst verificarRoutes = require('./routes/verificar');\nconst { handleResidenteMessage } = require('./flows/residente');";

if (c.includes(oldPdf)) {
  c = c.replace(oldPdf, newPdf);
  console.log("INT-01: Requires verificar y residente agregados");
  cambios++;
} else {
  console.log("INT-01: patron pdfRoutes no encontrado");
}

// 2. Agregar app.use para verificar despues de pdf routes
const oldPdfUse = "app.use('/api/v1/pdf', pdfRoutes);";
const newPdfUse = "app.use('/api/v1/pdf', pdfRoutes);\napp.use('/verificar', verificarRoutes);";

if (c.includes(oldPdfUse)) {
  c = c.replace(oldPdfUse, newPdfUse);
  console.log("INT-02: Ruta verificar montada en /verificar");
  cambios++;
} else {
  console.log("INT-02: patron app.use pdf no encontrado");
}

// 3. Integrar residente.js en el ruteo - buscar donde se detecta operador
// y agregar deteccion de residente antes
const oldRuteo = `    // UPG-14: stateResolver en vez de busqueda manual
    const estadoOp = await resolverEstadoOperador(telefonoNorm);`;

const newRuteo = `    // UPG-12: Detectar residente
    const { data: residenteData } = await supabase
      .from('residentes')
      .select('id, nombre, telefono')
      .eq('telefono', telefonoNorm)
      .eq('activo', true)
      .limit(1)
      .single();

    if (residenteData) {
      const respuestaResidente = await handleResidenteMessage(telefonoNorm, body, mediaUrl);
      if (incomingId) await marcarProcesado(incomingId, respuestaResidente);
      twiml.message(respuestaResidente);
      return res.type('text/xml').send(twiml.toString());
    }

    // UPG-14: stateResolver en vez de busqueda manual
    const estadoOp = await resolverEstadoOperador(telefonoNorm);`;

if (c.includes(oldRuteo)) {
  c = c.replace(oldRuteo, newRuteo);
  console.log("INT-03: Deteccion residente integrada en webhook");
  cambios++;
} else {
  console.log("INT-03: patron stateResolver no encontrado");
}

console.log("\\nTotal cambios: " + cambios);
fs.writeFileSync("webhook.js", c);
console.log("ARCHIVO GUARDADO");
