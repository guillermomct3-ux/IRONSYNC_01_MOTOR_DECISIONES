const fs = require("fs");
let c = fs.readFileSync("flows/operador.js", "utf8");
let cambios = 0;

// Agregar deteccion de PARO/FALLA natural AL INICIO de handleOperadorMessage
// Antes del chequeo de sesion
const oldCancel = '  if (upper === "CANCELAR" || upper === "CANCEL") {';

const newTop = `  // FIX TOP: PARO/FALLA natural interrumpe CUALQUIER sesion
  const esParoNaturalTop = /sin diesel|no hay diesel|sin gasolina|sin combustible|sin material|falta diesel|se acabo el diesel|quedo sin diesel/i.test(msg);
  const esFallaNaturalTop = /se rompio|no sirve|fuga|truena|suena raro|no arranca|no enciende|se descompuso|se atoro|pinchazo|revent/i.test(msg);

  if (esParoNaturalTop || esFallaNaturalTop) {
    const op = await getOperadorByTelefono(telefono);
    if (op) {
      await clearSession(telefono);
      if (esParoNaturalTop) {
        return await procesarParoNatural(telefono, op, msg.trim());
      } else {
        return await procesarFallaNatural(telefono, op, msg.trim());
      }
    }
  }

  if (upper === "CANCELAR" || upper === "CANCEL") {`;

if (c.includes(oldCancel)) {
  c = c.replace(oldCancel, newTop);
  console.log("FIX-TOP: PARO/FALLA natural al inicio de handleOperadorMessage");
  cambios++;
} else {
  console.log("FIX-TOP: patron CANCELAR no encontrado");
}

console.log("\\nTotal cambios: " + cambios);
fs.writeFileSync("flows/operador.js", c);
console.log("ARCHIVO GUARDADO");
