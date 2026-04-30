const c = require('fs').readFileSync('flows/operador.js', 'utf8');
const i = c.indexOf('case "esperando_horometro_inicio"');
if (i > -1) {
  console.log(JSON.stringify(c.substring(i, i+400)));
} else {
  console.log("NO ENCONTRADO");
  // Buscar variaciones
  const j = c.indexOf('esperando_horometro_inicio');
  console.log("Posición encontrada: " + j);
  if (j > -1) console.log(JSON.stringify(c.substring(j-50, j+200)));
}
