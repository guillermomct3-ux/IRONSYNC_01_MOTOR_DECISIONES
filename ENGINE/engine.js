
// ============================================================
// IRONSYNC — ENGINE.JS
// Versión consolidada: D19 + D20 + D21
// Compatible con test.js actual
// ============================================================

// ===== GENERADOR DE ID =====
function generateEventId() {
  const now = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `EVT-${now}-${random}`;
}

// ===== NORMALIZADOR DE NOMBRE =====
function normalizeName(name) {
  if (!name || typeof name !== "string") return "sin_nombre";

  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// ===== NORMALIZADOR DE TIMESTAMP =====
function normalizeTimestamp(inputTimestamp) {
  const baseDate = inputTimestamp ? new Date(inputTimestamp) : new Date();

  if (isNaN(baseDate.getTime())) {
    return {
      raw: inputTimestamp || null,
      iso: null,
      unix_ms: null,
      valid: false
    };
  }

  return {
    raw: inputTimestamp || null,
    iso: baseDate.toISOString(),
    unix_ms: baseDate.getTime(),
    valid: true
  };
}

// ===== D21 — VALIDADOR DE RANGO TEMPORAL =====
// Ventana operativa del motor:
// - pasado máximo: 200 horas
// - futuro máximo: 5 minutos
function validateTemporalRange(timestampInfo, options = {}) {
  if (!timestampInfo.valid) {
    return { in_range: false, reason: "invalid_timestamp" };
  }

  const now = Date.now();
  const maxFutureMs = options.maxFutureMs || 5 * 60 * 1000;
  const maxPastMs = options.maxPastMs || 200 * 60 * 60 * 1000;

  if (timestampInfo.unix_ms > now + maxFutureMs) {
    return { in_range: false, reason: "future_timestamp" };
  }

  if (timestampInfo.unix_ms < now - maxPastMs) {
    return { in_range: false, reason: "stale_timestamp" };
  }

  return { in_range: true, reason: "ok" };
}

// ===== D19 — INTEGRITY GATE =====
function integrityGate(event) {
  const photo = event.evidence?.photo;

  if (!photo || typeof photo !== "string" || photo.trim() === "") {
    return { evidence_status: "missing", recoverable: false };
  }

  const lower = photo.toLowerCase();

  if (
    lower.includes("test") ||
    lower.includes("blank") ||
    lower.includes("null")
  ) {
    return { evidence_status: "invalid_content", recoverable: false };
  }

  if (
    lower.includes("error") ||
    lower.includes("corrupt")
  ) {
    return { evidence_status: "invalid_technical", recoverable: true };
  }

  return { evidence_status: "valid", recoverable: true };
}

// ===== D20 — CLAVE CANÓNICA PARA DUPLICADOS =====
function buildDuplicateKey(operatorName, iso) {
  return `${operatorName}|||${iso || "sin_timestamp"}`;
}

// ===== CLASSIFICATION CONSISTENTE =====
function deriveClassification(pipelineStatus) {
  if (pipelineStatus === "BILLABLE") return "OK";
  if (pipelineStatus === "PROVISIONAL") return "PENDIENTE";
  if (pipelineStatus === "NON_BILLABLE") return "RECHAZADO";
  return "DESCONOCIDO";
}

// ===== STAGE CONSISTENTE =====
function deriveStage(pipelineStatus) {
  if (pipelineStatus === "BILLABLE") return "PROCESSED";
  if (pipelineStatus === "PROVISIONAL") return "REVIEW";
  if (pipelineStatus === "NON_BILLABLE") return "DISCARDED";
  return "UNKNOWN";
}

// ===== RECOVERY DEADLINE =====
// Solo para PROVISIONAL recuperable.
// Se deja simple y explícito:
// - invalid_technical / evidencia recuperable: 48h
// - sin operador / sin timestamp: 24h
function computeRecoveryDeadline(pipelineStatus, reasonCode, occurredAt) {
  if (pipelineStatus !== "PROVISIONAL" || !occurredAt) {
    return null;
  }

  const base = new Date(occurredAt).getTime();
  if (isNaN(base)) return null;

  let hours = 24;

  if (reasonCode === "invalid_technical") {
    hours = 48;
  }

  return new Date(base + hours * 60 * 60 * 1000).toISOString();
}

// ===== EVALUADOR PRINCIPAL =====
function evaluateEvent(event, contexto = {}) {
  const event_id = generateEventId();
  const operator_name = normalizeName(event.operator?.nombre);
  const timestampInfo = normalizeTimestamp(event.timestamp);
  const temporal = validateTemporalRange(timestampInfo);
  const integrity = integrityGate(event);

  const evidence_status = integrity.evidence_status;
  const hasOperador = operator_name !== "sin_nombre";
  const hasTimestamp = timestampInfo.valid;
  const duplicateKey = buildDuplicateKey(operator_name, timestampInfo.iso);

  const seenKeys = contexto.seenKeys || new Set();
  const isDuplicate = seenKeys.has(duplicateKey);

  // Registrar la clave DESPUÉS del check:
  // primer evento pasa, subsecuentes quedan como duplicados.
  seenKeys.add(duplicateKey);

  let pipeline_status = "BILLABLE";
  let es_cobrable = true;
  let motivo = "OK";
  let reason_code = "valid";
  const anomalies = [];

  // =========================================================
  // PRECEDENCIA DE NEGOCIO
  // 1. missing evidence         -> NON_BILLABLE
  // 2. temporal invalid         -> NON_BILLABLE
  // 3. duplicate                -> NON_BILLABLE
  // 4. invalid evidence         -> PROVISIONAL
  // 5. incomplete data          -> PROVISIONAL
  // 6. valid                    -> BILLABLE
  // =========================================================

  // 1. Evidencia faltante
  if (evidence_status === "missing") {
    pipeline_status = "NON_BILLABLE";
    es_cobrable = false;
    motivo = "SIN_FOTO";
    reason_code = "missing_evidence";

    anomalies.push({
      event_id,
      code: "MISSING_EVIDENCE",
      severity: "critical"
    });
  }

  // 2. Ventana temporal inválida
  else if (!temporal.in_range) {
    pipeline_status = "NON_BILLABLE";
    es_cobrable = false;
    motivo = temporal.reason === "future_timestamp" ? "FECHA_FUTURA" : "FECHA_VENCIDA";
    reason_code = "temporal_invalid";

    anomalies.push({
      event_id,
      code: "TEMPORAL_RANGE",
      severity: "major"
    });
  }

  // 3. Duplicado
  else if (isDuplicate) {
    pipeline_status = "NON_BILLABLE";
    es_cobrable = false;
    motivo = "DUPLICADO";
    reason_code = "duplicate";

    anomalies.push({
      event_id,
      code: "DUPLICATE_EVENT",
      severity: "major"
    });
  }

  // 4. Evidencia presente pero inválida
  else if (
    evidence_status === "invalid_content" ||
    evidence_status === "invalid_technical"
  ) {
    pipeline_status = "PROVISIONAL";
    es_cobrable = false;
    motivo = "EVIDENCIA_INVALIDA";
    reason_code = evidence_status;

    anomalies.push({
      event_id,
      code: "INVALID_EVIDENCE",
      severity: "major"
    });
  }

  // 5. Datos incompletos
  else if (!hasOperador || !hasTimestamp) {
    pipeline_status = "PROVISIONAL";
    es_cobrable = false;

    if (!hasOperador) {
      motivo = "SIN_OPERADOR";
      reason_code = "incomplete_operator";
    } else {
      motivo = "SIN_TIMESTAMP";
      reason_code = "incomplete_timestamp";
    }

    anomalies.push({
      event_id,
      code: "INCOMPLETE_DATA",
      severity: "major"
    });
  }

  // 6. BILLABLE permanece tal cual

  const classification = deriveClassification(pipeline_status);
  const stage = deriveStage(pipeline_status);
  const recovery_deadline = computeRecoveryDeadline(
    pipeline_status,
    reason_code,
    timestampInfo.iso
  );

  const timeline_event = {
    event_id,
    occurred_at: timestampInfo.iso,
    operator_name,
    has_photo: evidence_status !== "missing",
    evidence_status,
    pipeline_status,
    es_cobrable,
    reason_code
  };

  return {
    event_id,
    timestamp: timestampInfo,
    classification,
    pipeline_status,
    stage,
    es_cobrable,
    motivo,
    reason_code,
    anomalies,
    timeline_event,
    recovery_deadline
  };
}

// ===== PROCESADOR =====
function processEvents(events) {
  const timeline = [];
  const seenKeys = new Set();
  const resultados = [];
  const resumen = {};
  const cierre = {};
  const anomalias = [];

  for (const e of events) {
    const result = evaluateEvent(e, { timeline, seenKeys });

    resultados.push(result);
    timeline.push(result.timeline_event);

    const op = result.timeline_event.operator_name;

    if (!resumen[op]) {
      resumen[op] = {
        total: 0,
        aprobados: 0,
        pendientes: 0,
        rechazados: 0
      };

      cierre[op] = {
        eventos_cobrables: 0,
        monto: 0
      };
    }

    resumen[op].total++;

    if (result.pipeline_status === "BILLABLE") {
      resumen[op].aprobados++;
      cierre[op].eventos_cobrables++;
      cierre[op].monto += 100; // placeholder actual
    } else if (result.pipeline_status === "PROVISIONAL") {
      resumen[op].pendientes++;
    } else {
      resumen[op].rechazados++;
    }

    if (result.anomalies?.length) {
      anomalias.push(...result.anomalies);
    }
  }

  return {
    resumen,
    cierre,
    anomalias,
    detalles: resultados
  };
}

module.exports = {
  evaluateEvent,
  processEvents
};