require('dotenv').config();
const express = require('express');
const twilio = require('twilio');
const supabase = require('./lib/supabaseClient');
const { procesarInicioTurno, procesarFinTurno, procesarReporteHoras, procesarFoto, verificarZombies } = require('./turnos');
const { requiresAuth, login, getOperador } = require('./services/authService');
const { procesarMensajeFirma } = require('./webhooks/whatsapp');
const signaturesRouter = require('./api/v1/signatures');

process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 UNHANDLED REJECTION:', reason);
  process.exit(1);
});

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.get('/health', (req, res) => res.json({ status: 'ok', version: '1.0.5' }));
app.use('/api/v1/signatures', signaturesRouter);

app.use((req, res, next) => {
  console.log('📨 REQUEST RECIBIDO:', req.method, req.path, req.body);
  next();
});

const cliente = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const NUMERO_TWILIO = process.env.TWILIO_PHONE_NUMBER;

setInterval(() => {
  verificarZombies(cliente, NUMERO_TWILIO);
}, 60 * 60 * 1000);

const pdfRoutes = require('./routes/pdf');
app.use('/api/v1/pdf', pdfRoutes);

app.post('/webhook', async (req, res) => {
  const from = req.body.From;
  const body = (req.body.Body || '').split('\n')[0].split('\r')[0].trim();
  const texto = body.replace(/\n/g, ' ').replace(/\r/g, '').trim();
  const textoNorm = texto.toLowerCase();

  // NUEVO: detectar foto de Twilio
  const mediaUrl = req.body.MediaUrl0 || req.body.MediaUrl;
  const tieneMedia = !!mediaUrl;
  const bodyVacio = !body || body.trim() === '';

  console.log('TEXTO NORMALIZADO:', textoNorm);

  const twiml = new twilio.twiml.MessagingResponse();
  let respuesta = '';

  try {
    // 0. ¿Es foto del horómetro?
    if (tieneMedia && bodyVacio) {
      respuesta = procesarFoto(from, mediaUrl);
      twiml.message(respuesta);
      return res.type('text/xml').send(twiml.toString());
    }

    // 1. ¿Es respuesta de firma del residente?
    const esFirmaResidente = await supabase
      .from('signature_requests')
      .select('id')
      .eq('firmante_telefono', from)
      .in('estado', ['pendiente', 'enviada', 'vista'])
      .single();

    if (esFirmaResidente.data) {
      const respuestaFirma = await procesarMensajeFirma(from, texto, 'text', req);
      twiml.message(respuestaFirma);
      return res.type('text/xml').send(twiml.toString());
    }

    // 2. ¿Es intento de PIN del operador?
    if (/^\d{4}$/.test(texto)) {
      const result = await login(from, texto);
      respuesta = result.success
        ? `✅ Listo ${result.operador.nombre}, ya puedes registrar tu turno.`
        : result.mensaje;
      twiml.message(respuesta);
      return res.type('text/xml').send(twiml.toString());
    }

    // 3. ¿Requiere autenticación?
    const auth = await requiresAuth(from);
    if (auth.requiere) {
      if (auth.bloqueado) {
        respuesta = '🔒 Tu acceso está bloqueado temporalmente. Intenta más tarde.';
      } else if (!auth.existe) {
        respuesta = '⚠️ Tu número no está registrado. Habla con tu supervisor.';
      } else {
        respuesta = '🔑 Envía tu PIN de 4 dígitos para comenzar.';
      }
      twiml.message(respuesta);
      return res.type('text/xml').send(twiml.toString());
    }

    // 4. Autenticado — procesar comando
    if (textoNorm.includes('inicio') || textoNorm.includes('entro') || 
        textoNorm.includes('llegue') || textoNorm.includes('llegué')) {
      respuesta = await procesarInicioTurno(from, textoNorm);
    } else if (textoNorm.includes('fin') || textoNorm.includes('salgo') || 
               textoNorm.includes('termine') || textoNorm.includes('terminé')) {
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

  try {
    await supabase.from('eventos').insert({
      tipo: 'mensaje_webhook',
      operador_id: from,
      payload: { mensaje: textoNorm },
      creado_en: new Date().toISOString()
    });
  } catch (err) {
    console.error('[Error Log Evento]:', err);
  }

  twiml.message(respuesta);
  res.type('text/xml').send(twiml.toString());
});

app.listen(3000, () => {
  console.log('IronSync Webhook corriendo en puerto 3000');
});