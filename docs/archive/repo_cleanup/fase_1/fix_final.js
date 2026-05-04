const fs = require("fs");
let c = fs.readFileSync("webhook.js", "utf8");
let cambios = 0;

// 1. Agregar require de handleOperadorMessage
const oldRouter = "const { rutearMensaje } = require('./lib/router');";
const newRouter = "const { rutearMensaje } = require('./lib/router');\nconst { handleOperadorMessage } = require('./flows/operador');";

if (c.includes(oldRouter)) {
  c = c.replace(oldRouter, newRouter);
  console.log("FIX-FINAL: require handleOperadorMessage");
  cambios++;
}

// 2. Agregar override ANTES del router en el bloque admin
const oldAdminRutear = `      // FIX CHATGPT: Override directo PARO/FALLA natural en webhook.js
      const esParoNaturalWH = /sin diesel|no hay diesel|falta diesel|sin combustible|sin gasolina|no hay material|sin material|se acabo el diesel/i.test(body);
      const esFallaNaturalWH = /se rompio|no sirve|fuga|no arranca|no enciende|se descompuso|se atoro|pinchazo|revent/i.test(body);

      let respuestaNueva;
      if (esParoNaturalWH || esFallaNaturalWH) {
        respuestaNueva = await handleOperadorMessage(telefonoNorm, body, mediaUrl);
      } else {
        respuestaNueva = await rutearMensaje(telefonoNorm, body, mediaUrl);
      }`;

const newAdminRutear = `      // FIX FINAL: Override PARO/FALLA natural - bypass router
      const esParoNaturalWH = /sin diesel|no hay diesel|falta diesel|sin combustible|sin gasolina|no hay material|sin material|se acabo el diesel/i.test(body);
      const esFallaNaturalWH = /\\b(falla|fall[oó]|fugando|fuga de|no arranca|no enciende|se descompuso|se rompi[oó])\\b/i.test(body);

      let respuestaNueva;
      if (esParoNaturalWH || esFallaNaturalWH) {
        console.log('OVERRIDE_PARO_NATURAL', { from: telefonoNorm, body: body, time: new Date().toISOString() });
        respuestaNueva = await handleOperadorMessage(telefonoNorm, body, mediaUrl);
      } else {
        respuestaNueva = await rutearMensaje(telefonoNorm, body, mediaUrl);
      }`;

if (c.includes(oldAdminRutear)) {
  c = c.replace(oldAdminRutear, newAdminRutear);
  console.log("FIX-FINAL: Override PARO/FALLA actualizado con regex Claude");
  cambios++;
} else {
  console.log("FIX-FINAL: patron override no encontrado - buscando alternativa");
}

// 3. Debug endpoint
const oldHealth = "app.get('/health', (req, res) => res.json({ status: 'ok', version: '1.1.0-UPG05' }));";

const newHealth = "app.get('/health', (req, res) => res.json({ status: 'ok', version: '1.1.0-UPG05-final' }));\n\napp.get('/debug/version', (req, res) => {\n  res.json({\n    ok: true,\n    version: '1.1.0-UPG05-final',\n    time: new Date().toISOString(),\n    pid: process.pid,\n    commit: process.env.RAILWAY_GIT_COMMIT_SHA || 'local',\n    uptime: Math.round(process.uptime()) + 's'\n  });\n});";

if (c.includes("app.get('/health'")) {
  c = c.replace(oldHealth, newHealth);
  console.log("FIX-FINAL: Debug endpoint + version actualizada");
  cambios++;
}

console.log("\\nTotal cambios: " + cambios);
fs.writeFileSync("webhook.js", c);
console.log("ARCHIVO GUARDADO");
