const fs = require("fs");
let c = fs.readFileSync("webhook.js", "utf8");
let cambios = 0;

// 1. Quitar require de residente
const oldReq = "const { handleResidenteMessage } = require('./flows/residente');\n";
if (c.includes(oldReq)) {
  c = c.replace(oldReq, "");
  console.log("FIX: require residente removido");
  cambios++;
}

// 2. Quitar bloque de deteccion residente
const oldResidente = `    // UPG-12: Detectar residente
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

    // UPG-14: stateResolver`;

const newResidente = `    // UPG-14: stateResolver`;

if (c.includes(oldResidente)) {
  c = c.replace(oldResidente, newResidente);
  console.log("FIX: bloque residente removido del webhook");
  cambios++;
}

console.log("\\nTotal cambios: " + cambios);
fs.writeFileSync("webhook.js", c);
console.log("ARCHIVO GUARDADO");
