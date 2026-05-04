const fs = require("fs");
let c = fs.readFileSync("flows/operador.js", "utf8");
let cambios = 0;

// 1. Agregar interrupción de sesiones al inicio de continuarFlujo
// Buscar el inicio de la función continuarFlujo
const oldContinuar = 'async function continuarFlujo(telefono, session, msg, mediaUrl) {';
const idx = c.indexOf(oldContinuar);

if (idx > -1) {
  // Buscar la línea "const paso = session.paso;"
  const pasoIdx = c.indexOf("const paso = session.paso;", idx);
  if (pasoIdx > -1) {
    const fix = `
  // FIX SESION: Comandos prioritarios interrumpen sesiones no criticas
  const comandosPrioritarios = ['PARO', 'FALLA', 'FIN', 'REANUDA', 'TURNO', 'AYUDA', 'CANCELAR', 'PERFIL'];
  const upperMsg = msg.toUpperCase().trim();
  const esPrioritario = comandosPrioritarios.some(cmd => upperMsg === cmd || upperMsg.startsWith(cmd + ' '));

  // UPG-05: Detectar lenguaje natural de PARO
  const paroNaturalDetectado = buscarParoNatural(msg);

  if (esPrioritario || paroNaturalDetectado) {
    await clearSession(telefono);
    const op = await getOperadorByTelefono(telefono);
    if (op) {
      return await procesarComando(telefono, op, upperMsg, msg, mediaUrl);
    }
  }
`;
    c = c.substring(0, pasoIdx) + fix + "\n  " + c.substring(pasoIdx);
    console.log("FIX: Interrupcion de sesiones por comandos prioritarios");
    cambios++;
  }
}

// 2. Agregar case para texto en esperando_foto_inicio
const oldFotoCase = 'case "esperando_foto_inicio":';
const fotoIdx = c.indexOf(oldFotoCase);

if (fotoIdx > -1) {
  // Buscar el manejo actual de texto sin foto
  const oldTextoFoto = 'if (!mediaUrl && msg) {';
  const textoIdx = c.indexOf(oldTextoFoto, fotoIdx);

  if (textoIdx > -1) {
    // Reemplazar el bloque de texto sin foto
    const oldBloque = `if (!mediaUrl && msg) {
        if (upper === "el n\\u00famero que ves" || upper === "NO") {
          const op = await getOperadorByTelefono(telefono);
          return await abrirTurno(telefono, op,
            { id: datos.asignacion_id, equipos: { id: datos.equipo_id, alias: datos.equipo_alias, codigo: datos.equipo_codigo } },
            datos.horometro_inicio, null, true);
        }
        return "Eso no es una foto \\ud83d\\udcf7\\n\\nToma una foto del contador.\\nSi no puedes, manda el n\\u00famero que ves.";
      }`;

    const newBloque = `if (!mediaUrl && msg) {
        if (upper === "el n\\u00famero que ves" || upper === "NO") {
          const op = await getOperadorByTelefono(telefono);
          return await abrirTurno(telefono, op,
            { id: datos.asignacion_id, equipos: { id: datos.equipo_id, alias: datos.equipo_alias, codigo: datos.equipo_codigo } },
            datos.horometro_inicio, null, true);
        }
        // FIX: Si es un numero, tratarlo como horometro
        if (/^\\d+$/.test(msg.trim())) {
          const op = await getOperadorByTelefono(telefono);
          return await abrirTurno(telefono, op,
            { id: datos.asignacion_id, equipos: { id: datos.equipo_id, alias: datos.equipo_alias, codigo: datos.equipo_codigo } },
            parseInt(msg.trim()), null, true);
        }
        return "Manda foto del contador o el n\\u00famero que ves.";
      }`;

    if (c.includes(oldBloque)) {
      c = c.replace(oldBloque, newBloque);
      console.log("FIX: Manejo de numero en esperando_foto_inicio");
      cambios++;
    } else {
      console.log("FIX: patron bloque foto no encontrado");
    }
  }
}

// 3. Agregar comando CANCELAR en procesarComando
const oldAyuda = 'if (upper === "AYUDA" || upper === "HELP") {';
const ayudaIdx = c.indexOf(oldAyuda);

if (ayudaIdx > -1) {
  const cancelCmd = `  if (upper === "CANCELAR" || upper === "CANCEL") {
    await clearSession(telefono);
    return "Cancelado. Manda INICIO para empezar.";
  }

  `;
  c = c.substring(0, ayudaIdx) + cancelCmd + c.substring(ayudaIdx);
  console.log("FIX: Comando CANCELAR agregado a procesarComando");
  cambios++;
}

console.log("\\nTotal cambios: " + cambios);
fs.writeFileSync("flows/operador.js", c);
console.log("ARCHIVO GUARDADO");
