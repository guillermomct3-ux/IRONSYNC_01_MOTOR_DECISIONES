const fs = require("fs");
let c = fs.readFileSync("webhook.js", "utf8");
let cambios = 0;

// 1. Agregar requires de idempotency y stateResolver
const oldRequires = `const { deTwilioAtelefono } = require('./lib/telefono');`;

const newRequires = `const { deTwilioAtelefono } = require('./lib/telefono');
const { registrarMensajeEntrante, marcarProcesado, marcarDuplicado, marcarFallido } = require('./lib/idempotency');
const { resolverEstadoOperador } = require('./lib/stateResolver');`;

if (c.includes(oldRequires)) {
  c = c.replace(oldRequires, newRequires);
  console.log("UPG-13/14: Requires agregados");
  cambios++;
} else {
  console.log("UPG-13/14: patron requires no encontrado");
}

// 2. Agregar idempotencia despues de normalizar telefono
const oldFlow = `  // === NUEVO FLUJO ONBOARDING ===
  try {
    const telefonoNorm = deTwilioAtelefono(from);`;

const newFlow = `  // === NUEVO FLUJO ONBOARDING ===
  try {
    const telefonoNorm = deTwilioAtelefono(from);

    // UPG-13: Idempotencia — prevenir duplicados
    const messageSid = req.body.MessageSid || req.body.SmsMessageSid || null;
    const idResult = await registrarMensajeEntrante(messageSid, telefonoNorm, body, mediaUrl);
    if (idResult.duplicado) {
      console.log("DUPLICADO detectado:", idResult.razon);
      return res.type('text/xml').send(twiml.toString());
    }
    const incomingId = idResult.id;`;

if (c.includes(oldFlow)) {
  c = c.replace(oldFlow, newFlow);
  console.log("UPG-13: Idempotencia agregada al flujo");
  cambios++;
} else {
  console.log("UPG-13: patron flujo no encontrado");
}

// 3. Reemplazar busqueda manual de operador con stateResolver
const oldBusqueda = `    const tel10 = telefonoNorm ? telefonoNorm.slice(-10) : '';
    const { data: nuevoOp } = await supabase
      .from('usuarios')
      .select('id')
      .eq('rol', 'operador')
      .eq('activo', true)
      .ilike('telefono', '%' + tel10)
      .limit(1)
      .single();

    if (nuevoOp) {
      const respuestaNueva = await rutearMensaje(telefonoNorm, body, mediaUrl);
      twiml.message(respuestaNueva);
      return res.type('text/xml').send(twiml.toString());
    }`;

const newBusqueda = `    // UPG-14: stateResolver en vez de busqueda manual
    const estadoOp = await resolverEstadoOperador(telefonoNorm);
    if (estadoOp && estadoOp.operador) {
      const respuestaNueva = await rutearMensaje(telefonoNorm, body, mediaUrl);
      // UPG-13: marcar procesado
      if (incomingId) await marcarProcesado(incomingId, respuestaNueva);
      twiml.message(respuestaNueva);
      return res.type('text/xml').send(twiml.toString());
    }`;

if (c.includes(oldBusqueda)) {
  c = c.replace(oldBusqueda, newBusqueda);
  console.log("UPG-14: stateResolver reemplazo busqueda manual");
  cambios++;
} else {
  console.log("UPG-14: patron busqueda no encontrado");
}

// 4. Marcar procesado en las otras respuestas del flujo onboarding
const oldReturnAdmin = `      const respuestaNueva = await rutearMensaje(telefonoNorm, body, mediaUrl);
      twiml.message(respuestaNueva);
      return res.type('text/xml').send(twiml.toString());
    }

    const { data: nuevaEmpresa }`;

// Hay dos bloques iguales, reemplazamos el primero (admin)
const parts = c.split(oldReturnAdmin);
if (parts.length >= 2) {
  const fixedReturn = `      const respuestaNueva = await rutearMensaje(telefonoNorm, body, mediaUrl);
      if (incomingId) await marcarProcesado(incomingId, respuestaNueva);
      twiml.message(respuestaNueva);
      return res.type('text/xml').send(twiml.toString());
    }

    const { data: nuevaEmpresa }`;
  c = parts[0] + fixedReturn + parts.slice(1).join(oldReturnAdmin);
  console.log("UPG-13: marcarProcesado en respuesta admin");
  cambios++;
} else {
  console.log("UPG-13: patron return admin no encontrado");
}

// 5. Marcar procesado en la segunda respuesta (empresa)
const oldReturnEmpresa = `      const respuestaNueva = await rutearMensaje(telefonoNorm, body, mediaUrl);
      twiml.message(respuestaNueva);
      return res.type('text/xml').send(twiml.toString());
    }

    // UPG-14: stateResolver`;

const newReturnEmpresa = `      const respuestaNueva = await rutearMensaje(telefonoNorm, body, mediaUrl);
      if (incomingId) await marcarProcesado(incomingId, respuestaNueva);
      twiml.message(respuestaNueva);
      return res.type('text/xml').send(twiml.toString());
    }

    // UPG-14: stateResolver`;

if (c.includes(oldReturnEmpresa)) {
  c = c.replace(oldReturnEmpresa, newReturnEmpresa);
  console.log("UPG-13: marcarProcesado en respuesta empresa");
  cambios++;
} else {
  console.log("UPG-13: patron return empresa no encontrado");
}

console.log("\\nTotal cambios: " + cambios);
fs.writeFileSync("webhook.js", c);
console.log("ARCHIVO GUARDADO");
