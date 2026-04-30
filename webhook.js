require('dotenv').config();
const express = require('express');
const twilio = require('twilio');
const supabase = require('./lib/supabaseClient');
const { procesarInicioTurno, procesarFinTurno, procesarReporteHoras, procesarFoto, verificarZombies, procesarParo, procesarFalla, procesarReanuda, procesarSeleccionMenu, procesarTextoLibreParo, estaEnFlujoMenu, estaEsperandoConfirmacion, estaEsperandoHorometroCorregido, procesarConfirmacionHorometro, procesarHorometroCorregido, estaEsperandoNombreOperador, procesarNombreOperador } = require('./turnos');
const { requiresAuth, login, getOperador } = require('./services/authService');
const { procesarMensajeFirma } = require('./webhooks/whatsapp');
const signaturesRouter = require('./api/v1/signatures');
const { rutearMensaje } = require('./lib/router');
const { deTwilioAtelefono } = require('./lib/telefono');
const { registrarMensajeEntrante, marcarProcesado, marcarDuplicado, marcarFallido } = require('./lib/idempotency');
const { resolverEstadoOperador } = require('./lib/stateResolver');
const { iniciarCronJob } = require('./jobs/limpiarSesiones');

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
  process.exit(1);
});

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.get('/health', (req, res) => res.json({ status: 'ok', version: '1.0.14' }));
app.use('/api/v1/signatures', signaturesRouter);

app.use((req, res, next) => {
  const _safeBody = Object.assign({}, req.body); if (_safeBody.Body && /^\d{4,6}$/.test(_safeBody.Body.trim())) _safeBody.Body = '****'; if (_safeBody.Digits && /^\d{4,6}$/.test(_safeBody.Digits.trim())) _safeBody.Digits = '****'; console.log('REQUEST RECIBIDO:', req.method, req.path, _safeBody);
  next();
});

const cliente = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const NUMERO_TWILIO = process.env.TWILIO_PHONE_NUMBER;

// FIX 10: Zombie checker reactivado
setInterval(() => {
  try {
    verificarZombies(cliente, NUMERO_TWILIO);
  } catch (err) {
    console.error('Error en zombie checker:', err.message);
  }
}, 60 * 60 * 1000);
iniciarCronJob();

const pdfRoutes = require('./routes/pdf');
const verificarRoutes = require('./routes/verificar');
app.use('/api/v1/pdf', pdfRoutes);
app.use('/verificar', verificarRoutes);

let EQUIPO_ALIASES = [];

async function cargarEquipos() {
  try {
    const { data, error } = await supabase.from('equipos').select('alias');
    if (error) {
      console.error('Error cargando equipos:', error.message);
      return;
    }
    EQUIPO_ALIASES = data
      .filter(e => e.alias)
      .map(e => e.alias.toUpperCase())
      .sort((a, b) => b.length - a.length);
    console.log(EQUIPO_ALIASES.length + ' equipos cargados:', EQUIPO_ALIASES);
  } catch (err) {
    console.error('Error cargando equipos:', err.message);
  }
}

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
        return trigger + ' ' + alias + ' ' + contador + resto;
      }
    }
  }
  return body;
}

cargarEquipos();

app.post('/webhook', async (req, res) => {
  const from = req.body.From;
  let body = (req.body.Body || '').split('\n')[0].split('\r')[0].trim();

  // 1. Normalizar sinonimos
  if (/^(ya\s+lleg[ee]|arrancam|ya\s+llegam|empecem|aqui\s+estoy)/i.test(body)) {
    body = body.replace(/^(ya\s+lleg[ee]|arrancam|ya\s+llegam|empecem|aqui\s+estoy)\s*/i, 'inicio ');
  }
  if (/^(ya\s+termin[ee]|ya\s+acab[ee]|la\s+chamba|hasta\s+aqui|ya\s+salgo|terminamos)/i.test(body)) {
    body = body.replace(/^(ya\s+termin[ee]|ya\s+acab[ee]|la\s+chamba|hasta\s+aqui|ya\s+salgo|terminamos)\s*/i, 'fin ');
  }

  // 2. BUG 2 - Separar equipo pegado
  body = separarEquipoPegado(body);

  // 3. BUG 1 - Reordenar tokens
  const tokensBug1 = body.split(/\s+/);
  const triggerToken = tokensBug1.find(t => /^(inicio|fin)$/i.test(t));
  const numeroToken = tokensBug1.find(t => /^\d+([.,]\d+)?$/i.test(t));
  const equipoToken = tokensBug1.find(t => /^[A-Za-z]+\d/.test(t) && !/^(inicio|fin)$/i.test(t));
  if (triggerToken && equipoToken && numeroToken) {
    body = triggerToken + ' ' + equipoToken + ' ' + numeroToken;
  }

  // 4. Normalizar texto
  const texto = body.replace(/\n/g, ' ').replace(/\r/g, '').trim();
  const textoNorm = texto.toLowerCase();

  const mediaUrl = req.body.MediaUrl0 || req.body.MediaUrl;
  const tieneMedia = !!mediaUrl;
  const bodyVacio = !body || body.trim() === '';

  const _safeNorm = /^\d{4,6}$/.test(textoNorm) ? '****' : textoNorm; console.log('TEXTO NORMALIZADO:', _safeNorm);

  const twiml = new twilio.twiml.MessagingResponse();
  let respuesta = '';

  // === NUEVO FLUJO ONBOARDING ===
  try {
    const telefonoNorm = deTwilioAtelefono(from);

    // UPG-13: Idempotencia � prevenir duplicados
    const messageSid = req.body.MessageSid || req.body.SmsMessageSid || null;
    const idResult = await registrarMensajeEntrante(messageSid, telefonoNorm, body, mediaUrl);
    if (idResult.duplicado) {
      console.log("DUPLICADO detectado:", idResult.razon);
      return res.type('text/xml').send(twiml.toString());
    }
    const incomingId = idResult.id;
    const { getSession } = require('./lib/sesiones');
    const sesionNueva = await getSession(telefonoNorm);

    if (sesionNueva) {
      const respuestaNueva = await rutearMensaje(telefonoNorm, body, mediaUrl);
      if (incomingId) await marcarProcesado(incomingId, respuestaNueva);
      twiml.message(respuestaNueva);
      return res.type('text/xml').send(twiml.toString());
    }

    const { data: nuevaEmpresa } = await supabase
      .from('empresas')
      .select('id')
      .eq('admin_telefono', telefonoNorm)
      .limit(1)
      .single();

    if (nuevaEmpresa) {
      const respuestaNueva = await rutearMensaje(telefonoNorm, body, mediaUrl);
      if (incomingId) await marcarProcesado(incomingId, respuestaNueva);
      twiml.message(respuestaNueva);
      return res.type('text/xml').send(twiml.toString());
    }

    // UPG-14: stateResolver en vez de busqueda manual
    const estadoOp = await resolverEstadoOperador(telefonoNorm);
    if (estadoOp && estadoOp.operador) {
      const respuestaNueva = await rutearMensaje(telefonoNorm, body, mediaUrl);
      // UPG-13: marcar procesado
      if (incomingId) await marcarProcesado(incomingId, respuestaNueva);
      twiml.message(respuestaNueva);
      return res.type('text/xml').send(twiml.toString());
    }
  } catch (errNewFlow) {
    console.error('[New Flow Error]:', errNewFlow);
  }
  // === FIN NUEVO FLUJO ===


  try {
    // 0. Foto
    if (tieneMedia && bodyVacio) {
      respuesta = procesarFoto(from, mediaUrl);
      twiml.message(respuesta);
      return res.type('text/xml').send(twiml.toString());
    }

    // 1. Firma residente
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

    // 2. PIN � ANTES del auth check (fix v1.0.11)
    if (/^\d{4}$/.test(texto)) {
      const result = await login(from, texto);
      respuesta = result.success
        ? 'Listo ' + result.operador.nombre + ', ya puedes registrar tu turno.'
        : result.mensaje;
      twiml.message(respuesta);
      return res.type('text/xml').send(twiml.toString());
    }

    // 3. Auth � DESPUES del PIN
    const auth = await requiresAuth(from);
    if (auth.requiere) {
      if (auth.bloqueado) {
        respuesta = 'Tu acceso esta bloqueado temporalmente. Intenta mas tarde.';
      } else if (!auth.existe) {
        respuesta = 'Tu numero no esta registrado. Habla con tu supervisor.';
      } else {
        respuesta = 'Envia tu PIN de 4 digitos para comenzar.';
      }
      twiml.message(respuesta);
      return res.type('text/xml').send(twiml.toString());
    }

    // 4. CONFIRMACION HOROMETRO (SI/NO)
    if (estaEsperandoConfirmacion(from)) {
      const r = procesarConfirmacionHorometro(from, texto);
      if (r) {
        twiml.message(r);
        return res.type('text/xml').send(twiml.toString());
      }
    }

    // 5. HOROMETRO CORREGIDO
    if (estaEsperandoHorometroCorregido(from)) {
      const r = procesarHorometroCorregido(from, texto);
      if (r) {
        twiml.message(r);
        return res.type('text/xml').send(twiml.toString());
      }
    }

    // 6. MENU PARO ACTIVO
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
      respuesta = 'Opcion no valida. Responde con el numero de la opcion.';
      twiml.message(respuesta);
      return res.type('text/xml').send(twiml.toString());
    }

    // 6.5 FIX 11: Supervisor captura nombre de operador
    if (estaEsperandoNombreOperador(from)) {
      const r = procesarNombreOperador(from, texto);
      if (r) {
        twiml.message(r);
        return res.type('text/xml').send(twiml.toString());
      }
    }

    // 7. Comandos
    if (textoNorm === 'paro') {
      respuesta = procesarParo(null, from);
    } else if (textoNorm === 'falla') {
      respuesta = procesarFalla(null, from);
    } else if (textoNorm === 'reanuda') {
      respuesta = procesarReanuda(null, from);
    } else if (textoNorm.includes('inicio') || textoNorm.includes('entro') ||
               textoNorm.includes('llegue')) {
      respuesta = await procesarInicioTurno(from, textoNorm);
    } else if (textoNorm.includes('fin') || textoNorm.includes('salgo') ||
               textoNorm.includes('termine')) {
      respuesta = await procesarFinTurno(from, textoNorm);
    } else if (textoNorm.includes('horas')) {
      respuesta = await procesarReporteHoras(from, textoNorm);
    } else {
      const operador = await getOperador(from);
      respuesta = operador
        ? 'Hola ' + operador.nombre + '. Comandos: INICIO, FIN, PARO, FALLA, REANUDA, HORAS.'
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

  // FIX 8: Truncar mensajes largos (limite WhatsApp ~1600 chars)
  if (respuesta && respuesta.length > 1500) {
    respuesta = respuesta.substring(0, 1497) + '...';
  }

  twiml.message(respuesta);
  res.type('text/xml').send(twiml.toString());
});

app.listen(3000, () => {
  console.log('IronSync Webhook corriendo en puerto 3000');
});
