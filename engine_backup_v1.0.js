// ===== GENERADOR DE ID =====
function generateEventId() {
  const now = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `EVT-${now}-${random}`;
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

// ===== INTEGRITY GATE =====
function integrityGate(event) {
  const photo = event.evidence?.photo;

  if (!photo || photo.trim() === "") {
    return {
      evidence_status: "missing",
      recoverable: false
    };
  }

  const lower = photo.toLowerCase();

  if (
    lower.includes("test") ||
    lower.includes("blank") ||
    lower.includes("null")
  ) {
    return {
      evidence_status: "invalid_content",
      recoverable: false
    };
  }

  if (
    lower.includes("error") ||
    lower.includes("corrupt")
  ) {
    return {
      evidence_status: "invalid_technical",
      recoverable: true
    };
  }

  return {
    evidence_status: "valid",
    recoverable: true
  };
}

// ===== EVALUADOR PRINCIPAL =====
function evaluateEvent(event, contexto = {}) {
  const integrity = integrityGate(event);

  const timeline = contexto.timeline || [];

  const hasFoto =
    event &&
    event.evidence &&
    typeof event.evidence.photo === "string" &&
    event.evidence.photo.trim() !== "";

  const hasOperator =
    event &&
    event.operator &&
    typeof event.operator.nombre === "string" &&
    event.operator.nombre.trim() !== "";

  const timestampInfo = normalizeTimestamp(event.timestamp);

  const hasTimestamp = timestampInfo.valid;

  let classification = "";
  let pipeline_status = "";
  let stage = "";
  let es_cobrable = false;
  let motivo = "";

  // ===== REGLA 1: INCOMPLETOS =====
  if (!hasFoto || !hasOperator || !hasTimestamp) {
    classification = "INCOMPLETO";
    pipeline_status = "PROVISIONAL";
    stage = "RECEIVED";
    es_cobrable = false;

    if (!hasFoto) motivo = "SIN_FOTO";
    else if (!hasOperator) motivo = "SIN_OPERADOR";
    else motivo = "SIN_TIMESTAMP";
  } 
  else {
    // ===== REGLA 2: DUPLICADOS =====
    const operator = event.operator.nombre.trim().toLowerCase();

    const yaExiste = timeline.some(e =>
      e.operator_name === operator &&
      e.occurred_at === timestampInfo.iso
    );

    if (yaExiste) {
      classification = "OK";
      pipeline_status = "NON_BILLABLE";
      stage = "VALIDATED";
      es_cobrable = false;
      motivo = "DUPLICADO";
    } else {
      // ===== REGLA 3: EVENTO VÁLIDO =====
      classification = "OK";
      pipeline_status = "BILLABLE";
      stage = "VALIDATED";
      es_cobrable = true;
      motivo = "OK";
    }
  }

  const event_id = generateEventId();

  return {
    event_id,
    timestamp: timestampInfo,
    classification,
    pipeline_status,
    stage,
    es_cobrable,
    motivo,
    timeline_event: {
      event_id,
      occurred_at: timestampInfo.iso,
      operator_name: hasOperator
        ? event.operator.nombre.trim().toLowerCase()
        : "sin_nombre",
      has_photo: hasFoto
    }
  };
}

// ===== PROCESADOR =====
function processEvents(events) {
  let timeline = [];
  let resultados = [];

  for (let event of events) {
    const evaluado = evaluateEvent(event, { timeline });

    resultados.push(evaluado);

    if (evaluado.timeline_event.occurred_at) {
      timeline.push(evaluado.timeline_event);
    }
  }

  return {
    detalles: resultados,
    resumen: generarResumen(resultados),
    cierre: generarCierre(resultados),
    anomalias: generarAnomalias(resultados)
  };
}

// ===== RESUMEN =====
function generarResumen(eventos) {
  const resumen = {};

  eventos.forEach(e => {
    const op = e.timeline_event.operator_name;

    if (!resumen[op]) {
      resumen[op] = {
        total: 0,
        cobrables: 0,
        provisionales: 0,
        no_cobrables: 0
      };
    }

    resumen[op].total++;

    if (e.pipeline_status === "BILLABLE") resumen[op].cobrables++;
    else if (e.pipeline_status === "PROVISIONAL") resumen[op].provisionales++;
    else resumen[op].no_cobrables++;
  });

  return resumen;
}

// ===== CIERRE =====
function generarCierre(eventos) {
  const cierre = {};

  eventos.forEach(e => {
    const op = e.timeline_event.operator_name;

    if (!cierre[op]) {
      cierre[op] = {
        eventos_cobrables: 0,
        monto: 0
      };
    }

    if (e.pipeline_status === "BILLABLE") {
      cierre[op].eventos_cobrables++;
      cierre[op].monto += 100; // placeholder
    }
  });

  return cierre;
}

// ===== ANOMALÍAS =====
function generarAnomalias(eventos) {
  const anomalias = [];

  eventos.forEach(e => {
    if (e.motivo === "SIN_FOTO") {
      anomalias.push({
        tipo: "EVENTO_SIN_FOTO",
        operador: e.timeline_event.operator_name,
        occurred_at: e.timestamp.iso
      });
    }

    if (e.motivo === "SIN_OPERADOR") {
      anomalias.push({
        tipo: "EVENTO_SIN_OPERADOR",
        operador: "sin_nombre",
        occurred_at: e.timestamp.iso
      });
    }
  });

  return anomalias;
}

// ===== EXPORT =====
module.exports = {
  processEvents
};