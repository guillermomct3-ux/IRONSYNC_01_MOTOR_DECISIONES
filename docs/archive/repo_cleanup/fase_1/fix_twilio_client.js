const fs = require("fs");
let c = fs.readFileSync("lib/pdfAuto.js", "utf8");

const oldFn = `function getTwilioClient() {
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
}`;

const newFn = `function getTwilioClient() {
  var accountSid = process.env.TWILIO_ACCOUNT_SID;
  var apiKeySid = process.env.TWILIO_API_KEY_SID;
  var apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
  var authToken = process.env.TWILIO_AUTH_TOKEN;

  // Modo API Key (preferido)
  if (accountSid && apiKeySid && apiKeySecret) {
    console.log("[TWILIO_AUTH_MODE]", {
      mode: "api_key",
      accountSidLength: (accountSid || "").length,
      apiKeySidPrefix: (apiKeySid || "").slice(0, 2),
      apiKeySidLength: (apiKeySid || "").length,
      apiKeySecretLength: (apiKeySecret || "").length
    });
    return twilio(apiKeySid, apiKeySecret, { accountSid: accountSid });
  }

  // Fallback: Account SID + Auth Token
  console.log("[TWILIO_AUTH_MODE]", {
    mode: "account_token",
    accountSidLength: (accountSid || "").length,
    authTokenLength: (authToken || "").length
  });
  if (!accountSid || !authToken) {
    throw new Error("Faltan credenciales Twilio: usa API Key o Account SID + Auth Token");
  }
  return twilio(accountSid, authToken);
}`;

if (c.includes(oldFn)) {
  c = c.replace(oldFn, newFn);
  fs.writeFileSync("lib/pdfAuto.js", c, "utf8");
  console.log("OK: getTwilioClient reemplazado con modo dual");
} else {
  console.log("ERROR: no encontro getTwilioClient actual");
}
