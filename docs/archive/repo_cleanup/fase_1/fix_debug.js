const fs = require("fs");
let c = fs.readFileSync("lib/pdfAuto.js", "utf8");
const marker = "function getTwilioClient() {";
const log = `function getTwilioClient() {
  console.log("[PDF_AUTO_DEBUG]", {
    hasSid: !!process.env.TWILIO_ACCOUNT_SID,
    sidLength: (process.env.TWILIO_ACCOUNT_SID||"").length,
    hasToken: !!process.env.TWILIO_AUTH_TOKEN,
    tokenLength: (process.env.TWILIO_AUTH_TOKEN||"").length,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
    serviceKeyLength: (process.env.SUPABASE_SERVICE_KEY||"").length
  });`;
if (c.includes(marker)) {
  c = c.replace(marker, log);
  fs.writeFileSync("lib/pdfAuto.js", c, "utf8");
  console.log("OK: debug log agregado");
} else {
  console.log("ERROR: no encontro marker");
}
