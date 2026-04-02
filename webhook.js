const express = require('express');
const twilio = require('twilio');
const fs = require('fs');
const path = require('path');
const { procesarInicioTurno, procesarFinTurno, procesarReporteHoras, verificarZombies } = require('./turnos');

const app = express();
app.use(express.urlencoded({ extended: false }));

const ARCHIVO = path.join(__dirname, 'eventos.json');
const cliente = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const NUMERO_TWILIO = process.env.TWILIO_PHONE_NUMBER;

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
  const body = req.body.Body;
  const texto = body.replace(/\n/g, ' ').replace(/\r/g, '').toLowerCase().trim();

  console.log("TEXTO NORMALIZADO:", texto);

  let type = 'MENSAJE_LIBRE';
  let respuesta = '';

  if (texto.includes('inicio') || texto.includes('entro') || texto.includes('llegue') || texto.includes('llegué')) {
    type = 'INICIO_TURNO';
    console.log('✅ Detectado INICIO_TURNO. Llamando a procesarInicioTurno...');
    try {
      respuesta = await procesarInicioTurno(from, texto);
      console.log('✅ RESPUESTA GENERADA:', respuesta);
    } catch (err) {
      console.error('❌ ERROR EN procesarInicioTurno:', err.message);
      console.error('❌ Stack:', err.stack);
      respuesta = 'Error interno al procesar inicio de turno.';
    }

  } else if (texto.includes('fin') || texto.includes('salgo') || texto.includes('termine') || texto.includes('terminé')) {
    type = 'FIN_TURNO';
    respuesta = await procesarFinTurno(from, texto);

  } else if (texto.includes('horas')) {
    type = 'REPORTE_HORAS';
    respuesta = await procesarReporteHoras(from);

  } else if (texto.includes('aceite') || texto.includes('falla') || texto.includes('problema')) {
    type = 'CONSULTA_OPERATIVA';
    respuesta = 'Consulta operativa recibida. Ulises será notificado.';

  } else {
    respuesta = 'Mensaje recibido. Envía "inicio horometro XXXX" para comenzar tu turno.';
  }

  const eventos = cargarEventos();
  const evento = { from, body, timestamp: new Date().toISOString(), type };
  eventos.push(evento);
  guardarEventos(eventos);

  console.log('EVENTO RECIBIDO:', evento);

  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(respuesta);
  res.type('text/xml');
  res.send(twiml.toString());
});

app.listen(3000, () => {
  console.log('Webhook corriendo en puerto 3000');
});