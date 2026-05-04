const fs = require("fs");
let c = fs.readFileSync("lib/router.js", "utf8");
let cambios = 0;

// Agregar logica: si es admin Y tiene turno abierto, comandos operacionales van a operador
const oldAdmin = '  if (empresa) {\n    return await handleAdminMessage(telefono, body, mediaUrl);\n  }';

const newAdmin = `  if (empresa) {
    // FIX: Admin tambien puede ser operador (Guillermo)
    // Si tiene turno abierto, comandos operacionales van a operador
    const upperBody = body.toUpperCase().trim();
    const esComandoOperador = /^(INICIO|FIN|PARO|FALLA|REANUDA|TURNO|PERFIL|PIN|CANCELAR|AYUDA)/i.test(upperBody);
    const esParoNatural = /sin diesel|no hay diesel|sin gasolina|sin combustible|falta diesel|se acabo|se rompio|no sirve|fuga|no arranca|no enciende|se descompuso/i.test(body);

    if (esComandoOperador || esParoNatural) {
      // Verificar si tiene turno abierto como operador
      const telNorm = normalizarE164(telefono);
      const { data: opData } = await supabase
        .from("usuarios")
        .select("id")
        .eq("rol", "operador")
        .eq("activo", true)
        .eq("telefono", telNorm)
        .limit(1)
        .single();

      if (opData) {
        const { data: turnoAbierto } = await supabase
          .from("turnos")
          .select("id")
          .eq("operador_id", opData.id)
          .eq("estado", "abierto")
          .limit(1)
          .single();

        if (turnoAbierto || esComandoOperador) {
          return await handleOperadorMessage(telefono, body, mediaUrl);
        }
      }
    }
    return await handleAdminMessage(telefono, body, mediaUrl);
  }`;

if (c.includes(oldAdmin)) {
  c = c.replace(oldAdmin, newAdmin);
  console.log("FIX-ROUTER: Admin con turno abierto va a operador");
  cambios++;
} else {
  console.log("FIX-ROUTER: patron if(empresa) no encontrado");
}

console.log("\\nTotal cambios: " + cambios);
fs.writeFileSync("lib/router.js", c);
console.log("ARCHIVO GUARDADO");
