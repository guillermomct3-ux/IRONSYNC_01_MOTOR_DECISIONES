const crypto = require("crypto");

function verificarTwilio(req) {
  if (process.env.NODE_ENV === "development") return true;

  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return true;

  const signature = req.headers["x-twilio-signature"];
  if (!signature) return true;

  const url = "https://" + req.headers.host + req.originalUrl;
  const params = req.body || {};
  let data = url;

  Object.keys(params).sort().forEach(function(key) {
    data += key + params[key];
  });

  const hmac = crypto.createHmac("sha1", authToken);
  hmac.update(data);
  const expected = hmac.digest("base64");

  return signature === expected;
}

module.exports = { verificarTwilio };
