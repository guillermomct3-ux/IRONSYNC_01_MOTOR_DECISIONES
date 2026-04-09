require('dotenv').config();
const express = require('express');
const twilio = require('twilio');
const supabase = require('./lib/supabaseClient');
const { procesarInicioTurno, procesarFinTurno, procesarReporteHoras, verificarZombies } = require('./turnos');
const { requiresAuth, login, getOperador } = require('./services/authService');
const { procesarMensajeFirma } = require('./webhooks/whatsapp');
const signaturesRouter = require('./api/v1/signatures');
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/api/v1/signatures', signaturesRouter);
const cliente = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const NUMERO_TWILIO = process.env.TWILIO_PHONE_NUMBER;

setInterval(() => {
  verificarZombies(cliente, NUMERO_TWILIO);
}, 60 * 60 * 1000);

app.post('/webhook', async (req, res) => {
  const from = req.body.From;
  const body = req.body.Body;
  const texto = body.replace(/\n/g, ' ').replace(/\r/g, '').trim();
  const textoNorm = texto.toLowerCase();

  console.log("TEXTO NORMALIZADO:", textoNorm);

  const twiml = new twilio.twiml.MessagingResponse();
  let respuesta = '';

  try {
    // 0. ¿Es respuesta de firma del residente? (SI/NO o PIN)
    const esFirmaResidente = await supabase
      .from('signature_requests')
      .select('id')
      .eq('firmante_telefono', from)
      .in('estado', ['pendiente', 'enviada', 'vista'])
      .single();

    if (esFirmaResidente.data) {
      const respuestaFirma = await procesarMensajeFirma(from, texto, 'text');
      twiml.message(respuestaFirma);
      return res.type('text/xml').send(twiml.toString());
    }// 1. ¿Es intento de PIN?
    if (/^\d{4}$/.test(texto)) {
      const result = await login(from, texto);
      respuesta = result.success
        ? `✅ Listo ${result.operador.nombre}, ya puedes registrar tu turno.`
        : result.mensaje;
      twiml.message(respuesta);
      return res.type('text/xml').send(twiml.toString());
    }

    // 2. ¿Requiere autenticación?
    const auth = await requiresAuth(from);
    if (auth.requiere) {
      if (auth.bloqueado) {
        respuesta = '🔒 Tu acceso está bloqueado temporalmente. Intenta más tarde.';
      } else if (!auth.existe) {
        respuesta = '⚠️ Tu número no está registrado. Habla con tu supervisor.';
      } else {
        respuesta = '🔒 Envía tu PIN de 4 dígitos para comenzar.';
      }
      twiml.message(respuesta);
      return res.type('text/xml').send(twiml.toString());
    }

    // 3. Autenticado — procesar comando
    if (textoNorm.includes('inicio') || textoNorm.includes('entro') || textoNorm.includes('llegue') || textoNorm.includes('llegué')) {
      respuesta = await procesarInicioTurno(from, textoNorm);
    } else if (textoNorm.includes('fin') || textoNorm.includes('salgo') || textoNorm.includes('termine') || textoNorm.includes('terminé')) {
      respuesta = await procesarFinTurno(from, textoNorm);
    } else if (textoNorm.includes('horas')) {
      respuesta = await procesarReporteHoras(from, textoNorm);
    } else {
      const operador = await getOperador(from);
      respuesta = operador
        ? `Hola ${operador.nombre}. Comandos: INICIO [horómetro], FIN [horómetro], HORAS.`
        : 'Comandos: INICIO [horómetro], FIN [horómetro], HORAS.';
    }

  } catch (err) {
    console.error('[Webhook Error]:', err);
    respuesta = 'Error interno. Intenta de nuevo.';
  }

  // Log asíncrono a Supabase — no bloquea respuesta (R-ASYNC)
  supabase.from('eventos').insert({
    tipo: 'mensaje_webhook',
    operador_id: from,
    payload: { mensaje: textoNorm },
    creado_en: new Date().toISOString()
  }).catch(err => console.error('[Error Log Evento]:', err));

  twiml.message(respuesta);
  res.type('text/xml').send(twiml.toString());
});

app.listen(3000, () => {
  console.log('IronSync Webhook corriendo en puerto 3000');
});