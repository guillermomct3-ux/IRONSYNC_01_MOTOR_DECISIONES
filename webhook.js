const express = require('express');
const twilio = require('twilio');
const fs = require('fs');
const path = require('path');
const { 
  procesarInicioTurno, 
  procesarFinTurno, 
  procesarReporteHoras, 
  procesarFoto,
  verificarZombies 
} = require('./turnos');

const app = express();
app.use(express.urlencoded({ extended: false }));

const ARCHIVO = path.join(__dirname, 'eventos.json');
const cliente = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const NUMERO_TWILIO = process.env.TWILIO_PHONE_NUMBER;

const SUPERVISORES = {
  '523338155867': 'Ulises'
};

function cargarEventos() {
  if (!fs.existsSync(ARCHIVO)) return [];
  const contenido = fs.readFileSync(ARCHIVO, 'utf8');
  try { return JSON.parse(contenido); } catch { return []; }
}

function guardarEventos(eventos) {
  fs.writeFileSync(ARCHIVO, JSON.stringify(eventos, null, 2));
}

setInterval(() => {
  verificarZombies(cliente, NUMERO_TWILIO);
}, 60 * 60 * 1000);

app.post('/webhook', async (req, res) => {
  const from = req.body.From;
  const bodyRaw = (req.body.Body || '').split('\n')[0].split('\r')[0].trim();
  const mediaUrl = req.body.MediaUrl0 || req.body.MediaUrl;
  const tieneMedia = !!mediaUrl;
  const bodyVacio = !bodyRaw || bodyRaw.trim() === '';

  const twiml = new twilio.twiml.MessagingResponse();
  let respuesta = '';

  console.log(`📩 ${from}: ${bodyRaw} | media: ${tieneMedia}`);

  try {
    // FOTO — detectar antes que cualquier otro comando
    if (tieneMedia && bodyVacio) {
      respuesta = procesarFoto(from, mediaUrl);
      twiml.message(respuesta);
      return res.type('text/xml').send(twiml.toString());
    }

    const texto = bodyRaw.toLowerCase();

    // PIN — 4 dígitos
    if (/^\d{4}$/.test(bodyRaw)) {
      const fromLimpio = from.replace('whatsapp:+', '');
      // Buscar operador en BD (authService ya maneja esto)
      // Por ahora respuesta simple
      respuesta = `✅ PIN recibido.`;
      twiml.message(respuesta);
      return res.type('text/xml').send(twiml.toString());
    }

    // INICIO
    if (texto.includes('inicio') || texto.includes('entro') || 
        texto.includes('llegue') || texto.includes('llegué')) {
      respuesta = await procesarInicioTurno(from, texto);

    // FIN
    } else if (texto.includes('fin') || texto.includes('salgo') || 
               texto.includes('termine') || texto.includes('terminé')) {
      respuesta = await procesarFinTurno(from, texto);

    // HORAS
    } else if (texto.includes('horas')) {
      respuesta = await procesarReporteHoras(from);

    // MENSAJE NO RECONOCIDO
    } else {
      respuesta = 'Mensaje recibido.\nManda INICIO [equipo] [horómetro] para comenzar.';
    }

  } catch (err) {
    console.error('❌ Error en webhook:', err.message);
    respuesta = 'Error interno. Intenta de nuevo.';
  }

  const eventos = cargarEventos();
  eventos.push({ 
    from, 
    body: bodyRaw, 
    timestamp: new Date().toISOString() 
  });
  guardarEventos(eventos);

  twiml.message(respuesta);
  res.type('text/xml');
  res.send(twiml.toString());
});

app.listen(3000, () => {
  console.log('🚀 IronSync Webhook corriendo en puerto 3000');
});