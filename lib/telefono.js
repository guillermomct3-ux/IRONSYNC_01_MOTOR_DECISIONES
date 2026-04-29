function normalizarE164(input) {
  if (!input) return null;

  let limpio = input
    .replace("whatsapp:", "")
    .replace(/[\s\-\(\)\.]/g, "")
    .trim();

  if (limpio.startsWith("+")) {
    if (limpio.startsWith("+521") && limpio.length === 14) {
      return "+52" + limpio.substring(4);
    }
    return limpio;
  }

  const digits = limpio.replace(/\D/g, "");

  if (digits.length === 10) {
    return "+52" + digits;
  }

  if (digits.length === 12 && digits.startsWith("52")) {
    return "+" + digits;
  }

  if (digits.length === 13 && digits.startsWith("521")) {
    return "+52" + digits.substring(3);
  }

  return "+52" + digits.slice(-10);
}

function compararTelefonos(tel1, tel2) {
  const a = normalizarE164(tel1);
  const b = normalizarE164(tel2);
  return a && b && a === b;
}

function ultimos10(telefono) {
  const e164 = normalizarE164(telefono);
  return e164 ? e164.slice(-10) : "";
}

function deTwilioAtelefono(from) {
  return normalizarE164(from);
}

module.exports = {
  normalizarE164,
  compararTelefonos,
  ultimos10,
  deTwilioAtelefono
};
