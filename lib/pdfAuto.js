// lib/pdfAuto.js
// IronSync — PDF automático al cerrar turno
// Consolidado: ChatGPT + Gemini + Grok + DeepSeek + GLM5
// Correcciones: ChatGPT (R1-R5) + Grok (R6) + GLM5 (R7)
// Versión: 1.0.0 — 1 Mayo 2026

const crypto = require("crypto");
const twilio = require("twilio");
const { createClient } = require("@supabase/supabase-js");
const supabase = require("./supabaseClient");
const { generarPDFReporteDiario } = require("../services/pdfReporteDiario");

// GLM5 fix: Cliente Service Role para uploads (R7)
const supabaseService = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ==========================================
// CONFIGURACIÓN
// ==========================================
var PDF_BUCKET = process.env.PDF_BUCKET || "pdfs_reportes";
var PDF_BASE_PATH = process.env.PDF_BASE_PATH || "reportes-diarios";
var PDF_TIMEOUT_MS = Number(process.env.PDF_TIMEOUT_MS || 10000);
var PDF_MAX_RETRIES = Number(process.env.PDF_MAX_RETRIES || 3);
var PDF_RETRY_DELAY_MS = Number(process.env.PDF_RETRY_DELAY_MS || 2000);

// ==========================================
// UTILIDADES
// ==========================================
function sleep(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

function withTimeout(promise, ms, label) {
  var timer;
  var timeout = new Promise(function (_, reject) {
    timer = setTimeout(function () {
      reject(new Error((label || "operation") + " timeout after " + ms + "ms"));
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(function () {
    clearTimeout(timer);
  });
}

function sha256Buffer(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

// ChatGPT fix: normalizarWhatsApp (R5)
function normalizarWhatsApp(numero) {
  if (!numero) return null;
  var limpio = String(numero).trim();
  if (limpio.startsWith("whatsapp:")) return limpio;
  if (limpio.startsWith("+")) return "whatsapp:" + limpio;
  return "whatsapp:+" + limpio.replace(/\D/g, "");
}

// ==========================================
// TWILIO
// ==========================================
function getTwilioClient() {
  console.log("[PDF_AUTO_DEBUG]", {
    hasSid: !!process.env.TWILIO_ACCOUNT_SID,
    sidLength: (process.env.TWILIO_ACCOUNT_SID||"").length,
    hasToken: !!process.env.TWILIO_AUTH_TOKEN,
    tokenLength: (process.env.TWILIO_AUTH_TOKEN||"").length,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
    serviceKeyLength: (process.env.SUPABASE_SERVICE_KEY||"").length
  });
  var sid = process.env.TWILIO_ACCOUNT_SID;
  var token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    throw new Error("Faltan TWILIO_ACCOUNT_SID o TWILIO_AUTH_TOKEN");
  }
  return twilio(sid, token);
}

function getTwilioFrom() {
  var raw =
    process.env.TWILIO_WHATSAPP_NUMBER ||
    process.env.TWILIO_PHONE_NUMBER ||
    process.env.TWILIO_FROM;
  if (!raw) {
    throw new Error("Falta TWILIO_PHONE_NUMBER o TWILIO_WHATSAPP_NUMBER");
  }
  return normalizarWhatsApp(raw);
}

// ==========================================
// EXTRAER BUFFER DEL PDF
// ==========================================
function extraerPdfBuffer(resultado) {
  if (!resultado) {
    throw new Error("generarPDFReporteDiario no devolvio resultado");
  }
  if (Buffer.isBuffer(resultado)) {
    return { pdfBuffer: resultado, dataHash: null };
  }
  if (resultado.pdfBuffer && Buffer.isBuffer(resultado.pdfBuffer)) {
    return {
      pdfBuffer: resultado.pdfBuffer,
      dataHash: resultado.dataHash || null
    };
  }
  throw new Error("Formato inesperado de generarPDFReporteDiario()");
}

// ==========================================
// SUPABASE STORAGE (GLM5 fix: usa supabaseService)
// ==========================================
async function asegurarBucketPDF() {
  var buckets = await supabaseService.storage.listBuckets();
  if (buckets.error) {
    throw new Error("No pude listar buckets: " + buckets.error.message);
  }
  var existe = (buckets.data || []).some(function (b) {
    return b.name === PDF_BUCKET;
  });
  if (existe) return true;

  console.log("[PDF_AUTO] Creando bucket: " + PDF_BUCKET);
  var resultado = await supabaseService.storage.createBucket(PDF_BUCKET, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ["application/pdf"]
  });
  if (resultado.error) {
    throw new Error("No pude crear bucket " + PDF_BUCKET + ": " + resultado.error.message);
  }
  console.log("[PDF_AUTO] Bucket creado: " + PDF_BUCKET);
  return true;
}

async function subirPDFStorage(pdfBuffer, folio) {
  if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
    throw new Error("pdfBuffer invalido");
  }
  if (!folio) {
    throw new Error("folio requerido para subir PDF");
  }

  await asegurarBucketPDF();

  var safeFolio = String(folio).replace(/[^a-zA-Z0-9-_]/g, "_");
  var timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  var path = PDF_BASE_PATH + "/" + safeFolio + "/" + timestamp + ".pdf";

  // GLM5 fix: supabaseService para uploads (R7)
  var upload = await supabaseService.storage
    .from(PDF_BUCKET)
    .upload(path, pdfBuffer, {
      contentType: "application/pdf",
      cacheControl: "3600",
      upsert: false
    });

  if (upload.error) {
    throw new Error("Error subiendo PDF: " + upload.error.message);
  }

  var urlData = supabaseService.storage
    .from(PDF_BUCKET)
    .getPublicUrl(path);

  if (!urlData || !urlData.data || !urlData.data.publicUrl) {
    throw new Error("No pude obtener publicUrl del PDF");
  }

  console.log("[PDF_AUTO] PDF subido: " + urlData.data.publicUrl);
  return urlData.data.publicUrl;
}

// ==========================================
// REGISTRAR HASH
// ==========================================
async function registrarHashPDF(turnoId, folio, sha256, storageUrl) {
  var payload = {
    folio: folio,
    sha256: sha256
  };
  if (turnoId) payload.turno_id = turnoId;
  if (storageUrl) payload.storage_url = storageUrl;

  var resultado = await supabase.from("pdf_hashes").insert(payload);
  if (resultado.error) {
    console.error("[PDF_AUTO_HASH_ERROR]", {
      folio: folio,
      code: resultado.error.code,
      message: resultado.error.message
    });
  }
}

// ==========================================
// ENVIAR PDF POR WHATSAPP (DeepSeek: fallback a link)
// ==========================================
async function enviarPDFWhatsApp(to, body, pdfUrl) {
  var client = getTwilioClient();
  var from = getTwilioFrom();
  var toWhatsApp = normalizarWhatsApp(to);

  if (!toWhatsApp) throw new Error("Destino WhatsApp invalido");
  if (!pdfUrl) throw new Error("pdfUrl requerido");

  var ultimoError = null;

  for (var intento = 1; intento <= PDF_MAX_RETRIES; intento++) {
    try {
      var result = await withTimeout(
        client.messages.create({
          from: from,
          to: toWhatsApp,
          body: body || "Reporte Diario IronSync",
          mediaUrl: [pdfUrl]
        }),
        PDF_TIMEOUT_MS,
        "Twilio PDF send"
      );

      console.log("[PDF_AUTO] Enviado a " + toWhatsApp + " (intento " + intento + ")");
      return { ok: true, sid: result.sid, intento: intento };

    } catch (error) {
      ultimoError = error;
      console.error("[PDF_AUTO_TWILIO_RETRY]", {
        to: toWhatsApp,
        intento: intento,
        error: error.message
      });

      if (intento < PDF_MAX_RETRIES) {
        await sleep(PDF_RETRY_DELAY_MS * intento);
      }
    }
  }

  // DeepSeek fix: Fallback a link si adjunto falla
  console.log("[PDF_AUTO] Fallback: enviando solo link a " + toWhatsApp);
  try {
    await withTimeout(
      client.messages.create({
        from: from,
        to: toWhatsApp,
        body: body + "\n\nNo se pudo adjuntar el PDF.\nDescargalo aqui:\n" + pdfUrl
      }),
      PDF_TIMEOUT_MS,
      "Twilio fallback"
    );
    return { ok: true, sid: null, intento: "fallback" };
  } catch (fallbackError) {
    console.error("[PDF_AUTO_FALLBACK_FAILED]", {
      to: toWhatsApp,
      error: fallbackError.message
    });
    throw ultimoError;
  }
}

// ==========================================
// BUSCAR ADMIN POR EMPRESA
// ==========================================
async function getAdminTelefonoByEmpresa(empresaId) {
  if (!empresaId) return null;

  var empresa = await supabase
    .from("empresas")
    .select("admin_telefono")
    .eq("id", empresaId)
    .maybeSingle();

  if (empresa.data && empresa.data.admin_telefono) {
    return empresa.data.admin_telefono;
  }

  var admin = await supabase
    .from("usuarios")
    .select("telefono")
    .eq("empresa_id", empresaId)
    .eq("rol", "admin")
    .eq("activo", true)
    .limit(1)
    .maybeSingle();

  return admin.data ? admin.data.telefono : null;
}

// ==========================================
// FUNCION PRINCIPAL: Generar y distribuir PDF
// ==========================================
async function generarYDistribuirPDFTurno(payload) {
  var turnoId = payload.turnoId;
  var folio = payload.folio;
  var empresaId = payload.empresaId;
  var telefonoOperador = payload.telefonoOperador;
  var horasHorometro = payload.horasHorometro;
  var equipoTexto = payload.equipoTexto;

  if (!folio) {
    throw new Error("No se puede generar PDF automatico sin folio");
  }

  console.log("[PDF_AUTO_START]", {
    turnoId: turnoId,
    folio: folio,
    empresaId: empresaId
  });

  // 1. Generar PDF
  var resultadoPDF = await generarPDFReporteDiario(folio);
  var extraido = extraerPdfBuffer(resultadoPDF);
  var pdfBuffer = extraido.pdfBuffer;
  var pdfHash = sha256Buffer(pdfBuffer);

  // 2. Subir a Supabase Storage
  var publicUrl = await subirPDFStorage(pdfBuffer, folio);

  // 3. Registrar hash
  await registrarHashPDF(turnoId, folio, pdfHash, publicUrl);

  // 4. Buscar admin
  var adminTelefono = await getAdminTelefonoByEmpresa(empresaId);

  // 5. Preparar mensajes (Grok: mensajes diferenciados)
  var equipo = equipoTexto || "equipo";
  var horas = horasHorometro != null ? String(horasHorometro) : "-";

  var bodyOperador =
    "Reporte listo - " + equipo + " - " + horas + " hrs\n" +
    "Folio: " + folio;

  var bodyAdmin =
    "Reporte Diario - " + equipo + "\n" +
    horas + " hrs - " + folio;

  // 6. Enviar a operador y admin (en paralelo)
  var envios = [];

  if (telefonoOperador) {
    envios.push(
      enviarPDFWhatsApp(telefonoOperador, bodyOperador, publicUrl)
        .catch(function (error) {
          console.error("[PDF_AUTO_SEND_OPERATOR_ERROR]", {
            folio: folio,
            error: error.message
          });
          return { ok: false, target: "operador", error: error.message };
        })
    );
  }

  // ChatGPT fix: comparacion normalizada (R5)
  if (
    adminTelefono &&
    normalizarWhatsApp(adminTelefono) !== normalizarWhatsApp(telefonoOperador)
  ) {
    envios.push(
      enviarPDFWhatsApp(adminTelefono, bodyAdmin, publicUrl)
        .catch(function (error) {
          console.error("[PDF_AUTO_SEND_ADMIN_ERROR]", {
            folio: folio,
            error: error.message
          });
          return { ok: false, target: "admin", error: error.message };
        })
    );
  }

  var resultados = await Promise.all(envios);

  console.log("[PDF_AUTO_DONE]", {
    folio: folio,
    pdfHash: pdfHash,
    storageUrl: publicUrl,
    resultados: resultados
  });

  return {
    ok: true,
    folio: folio,
    pdfHash: pdfHash,
    storageUrl: publicUrl,
    resultados: resultados
  };
}

// ==========================================
// FIRE AND FORGET: No bloquea FIN
// ==========================================
function dispararPDFAsync(payload) {
  setImmediate(function () {
    generarYDistribuirPDFTurno(payload).catch(function (error) {
      console.error("[PDF_AUTO_FATAL]", {
        folio: payload && payload.folio,
        turnoId: payload && payload.turnoId,
        error: error.message,
        stack: error.stack
      });
    });
  });
}

// ==========================================
// EXPORTS
// ==========================================
module.exports = {
  generarYDistribuirPDFTurno: generarYDistribuirPDFTurno,
  dispararPDFAsync: dispararPDFAsync,
  subirPDFStorage: subirPDFStorage,
  enviarPDFWhatsApp: enviarPDFWhatsApp
};
