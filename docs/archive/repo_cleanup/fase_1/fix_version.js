const fs = require("fs");
let c = fs.readFileSync("webhook.js", "utf8");
c = c.replace("version: '1.0.14'", "version: '1.1.0-UPG05'");
fs.writeFileSync("webhook.js", c);
console.log("version actualizada");
