equire('dotenv').config();
const express = require('express');
const twilio = require('twilio');
const supabase = require('./lib/supabaseClient');
const {
  procesarInicioTurno, procesarFinTurno, procesarReporteHoras,
  procesarFoto, verificarZombies,
  procesarParo, procesarFalla, procesarReanuda,
  procesarSeleccionMenu, procesarTextoLibreParo,
  estaEnFlujoMenu
} = require('./turnos');
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
app.get('/health', (req, res) => res.json({ status: 'ok', version: '1.0.8' }));
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

// ✅ Cargar alias de equipos desde Supabase al arrancar
let EQUIPO_ALIASES = [];

async function cargarEquipos() {
  try {
    const { data, error } = await supabase.from('equipos').select('nombre');
    if (error) {
      console.error('❌ Error cargando equipos:', error.message);
      return;
    }
    EQUIPO_ALIASES = data
      .map(e => e.nombre.replace(/\s+/g, '').toUpperCase())
      .sort((a, b) => b.length - a.length);
    console.log(`✅ ${EQUIPO_ALIASES.length} equipos cargados:`, EQUIPO_ALIASES);
  } catch (err) {
    console.error('❌ Error cargando equipos:', err.message);
  }
}

// ✅ FIX BUG 2 v2 — Buscar alias conocido como prefijo
function separarEquipoPegado(body) {
  const match = body.match(/^(inicio|fin)\s+(\S+)/i);
  if (!match) return body;

  const trigger = match[1];
  const pegado = match[2].toUpperCase();
  const resto = body.slice(match[0].length);

  for (const alias of EQUIPO_ALIASES) {
    if (pegado.startsWith(alias) && pegado.length > alias.length) {
      const contador = pegado.slice(alias.length);
      if (/^\d+$/.test(contador)) {
        return `${trigger} ${alias} ${contador}${resto}`;
      }
    }
  }
  return body;
}

cargarEquipos();

app.post('/webhook', async (req, res) => {
  const from = req.body.From;

  let body = (req.body.Body || '').split('\n')[0].split('\r')[0].trim();

  // ✅ 1. Normalizar sinónimos (sin "listo")
  if (/^(ya\s+lleg[ée]|arrancam|ya\s+llegam|empecem|aqui\s+estoy)/i.test(body)) {
    body = body.replace(/^(ya\s+lleg[ée]|arrancam|ya\s+llegam|empecem|aqui\s+estoy)\s*/i, 'inicio ');
  }
  if (/^(ya\s+termin[ée]|ya\s+acab[ée]|la\s+chamba|hasta\s+aqui|ya\s+salgo|terminamos)/i.test(body)) {
    body = body.replace(/^(ya\s+termin[ée]|ya\s+acab[ée]|la\s+chamba|hasta\s+aqui|ya\s+salgo|terminamos)\s*/i, 'fin ');
  }

  // ✅ 2. FIX BUG 2 v2 — Separar equipo+contador pegados usando alias de Supabase
  body = separarEquipoPegado(body);

  // ✅ 3. FIX BUG 1 — Reordenar tokens si trigger está al final
  const tokensBug1 = body.split(/\s+/);
  const triggerToken = tokensBug1.find(t => /^(inicio|fin)$/i.test(t));
  const numeroToken = tokensBug1.find(t => /^\d+([.,]\d+)?$/.test(t));
  const equipoToken = tokensBug1.find(t => /^[A-Za-z]+\d+$/i.test(t) && !/^(inicio|fin)$/i.test(t));
  if (triggerToken && equipoToken && numeroToken) {
    body = `${triggerToken} ${equipoToken} ${numeroToken}`;
  }

  // ✅ 4. Normalizar texto
  const texto = body.replace(/\n/g, ' ').replace(/\r/g, '').trim();
  const textoNorm = texto.toLowerCase();

  // Detectar foto de Twilio
  const mediaUrl = req.body.MediaUrl0 || req.body.MediaUrl;
  const tieneMedia = !!mediaUrl;
  const bodyVacio = !body || body.trim() === '';

  console.log('TEXTO NORMALIZADO:', textoNorm);

  const twiml = new twilio.twiml.MessagingResponse();
  let respuesta = '';

  try {
    // 0. ¿Es foto?
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

    // 2. ¿Es PIN?
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

    // ✅ 4. ¿Está en flujo de menú PARO?
    if (estaEnFlujoMenu(null, from)) {
      if (/^[1-5]$/.test(texto.trim())) {
        respuesta = procesarSeleccionMenu(null, from, texto.trim());
        twiml.message(respuesta);
        return res.type('text/xml').send(twiml.toString());
      }

      const respuestaTexto = procesarTextoLibreParo(null, from, texto);
      if (respuestaTexto) {
        twiml.message(respuestaTexto);
        return res.type('text/xml').send(twiml.toString());
      }

      respuesta = 'Opción no válida. Responde con el número de la opción.';
      twiml.message(respuesta);
      return res.type('text/xml').send(twiml.toString());
    }

    // ✅ 5. Procesar comandos
    if (textoNorm === 'paro') {
      respuesta = procesarParo(null, from);
    } else if (textoNorm === 'falla') {
      respuesta = procesarFalla(null, from);
    } else if (textoNorm === 'reanuda') {
      respuesta = procesarReanuda(null, from);
    } else if (textoNorm.includes('inicio') || textoNorm.includes('entro') ||
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
        ? `Hola ${operador.nombre}. Comandos: INICIO, FIN, PARO, FALLA, REANUDA, HORAS.`
        : 'Comandos: INICIO, FIN, PARO, FALLA, REANUDA, HORAS.';
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
