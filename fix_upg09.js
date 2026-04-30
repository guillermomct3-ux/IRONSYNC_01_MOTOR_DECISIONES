const fs = require("fs");
let c = fs.readFileSync("flows/admin.js", "utf8");
let cambios = 0;

// 1. Agregar comando EDITAR en handleAdminExistente
const oldStatus = `  if (upper === "STATUS") {
    return await mostrarEstadoActivacion(empresa.id);
  }`;

const newStatus = `  if (upper === "STATUS") {
    return await mostrarEstadoActivacion(empresa.id);
  }

  if (upper.includes("EDITAR") || upper === "5") {
    const equipos = await getEquiposByEmpresa(empresa.id);
    if (equipos.length === 0) return "No tienes maquinas registradas.";
    let lista = "Que maquina quieres editar?\\n";
    equipos.forEach(function(eq, i) {
      lista += "\\n" + (i + 1) + ". " + eq.alias + " (" + eq.codigo + ")";
    });
    await saveSession(telefono, "admin_editar", "esperando_seleccion_maquina", {
      empresa_id: empresa.id,
      equipos: equipos.map(function(e) { return { id: e.id, alias: e.alias, codigo: e.codigo, serie: e.serie, tipo: e.tipo }; })
    });
    return lista;
  }`;

if (c.includes(oldStatus)) {
  c = c.replace(oldStatus, newStatus);
  console.log("UPG-09: Comando EDITAR agregado al menu");
  cambios++;
} else {
  console.log("UPG-09: patron STATUS no encontrado");
}

// 2. Actualizar menu principal para incluir opcion 5
const oldMenu = 'return "Hola " + empresa.admin_nombre + " \\ud83d\\udc4b\\n\\n\\u00bfQu\\u00e9 quieres hacer?\\n\\n1. Registrar m\\u00e1quina\\n2. Registrar operador\\n3. Ver estado\\n4. Ayuda";';

const newMenu = 'return "Hola " + empresa.admin_nombre + " \\ud83d\\udc4b\\n\\n\\u00bfQu\\u00e9 quieres hacer?\\n\\n1. Registrar m\\u00e1quina\\n2. Registrar operador\\n3. Ver estado\\n4. Ayuda\\n5. Editar m\\u00e1quina";';

if (c.includes(oldMenu)) {
  c = c.replace(oldMenu, newMenu);
  console.log("UPG-09: Menu principal actualizado con opcion 5");
  cambios++;
} else {
  console.log("UPG-09: patron menu principal no encontrado");
}

// 3. Agregar funcion mostrarAyudaAdmin actualizada
const oldAyuda = 'function mostrarAyudaAdmin() {';

const newAyudaBefore = `async function cmdEditarSeleccion(telefono, datos, msg) {
  const idx = parseInt(msg) - 1;
  const eq = datos.equipos[idx];
  if (!eq) return "Elige un numero de la lista.";

  await saveSession(telefono, "admin_editar", "esperando_campo_editar", {
    empresa_id: datos.empresa_id,
    equipos: datos.equipos,
    editar_id: eq.id,
    editar_alias: eq.alias,
    editar_codigo: eq.codigo,
    editar_serie: eq.serie,
    editar_tipo: eq.tipo
  });
  return "Editando: " + eq.alias + " (" + eq.codigo + ")\\n\\nQue quieres cambiar?\\n\\n1. Alias (" + eq.alias + ")\\n2. Codigo (" + eq.codigo + ")\\n3. Serie (" + (eq.serie || "sin dato") + ")\\n4. Tipo (" + (eq.tipo || "sin dato") + ")";
}

async function cmdEditarCampo(telefono, datos, msg) {
  const campo = msg;
  if (campo === "1") {
    await saveSession(telefono, "admin_editar", "esperando_nuevo_valor", Object.assign({}, datos, { campo: "alias" }));
    return "Escribe el nuevo alias:";
  }
  if (campo === "2") {
    await saveSession(telefono, "admin_editar", "esperando_nuevo_valor", Object.assign({}, datos, { campo: "codigo" }));
    return "Escribe el nuevo codigo:";
  }
  if (campo === "3") {
    await saveSession(telefono, "admin_editar", "esperando_nuevo_valor", Object.assign({}, datos, { campo: "serie" }));
    return "Escribe la nueva serie:";
  }
  if (campo === "4") {
    await saveSession(telefono, "admin_editar", "esperando_nuevo_valor", Object.assign({}, datos, { campo: "tipo" }));
    return "Escribe el nuevo tipo (ej: Excavadora, Retroexcavadora, Bulldozer):";
  }
  return "Elige 1, 2, 3 o 4.";
}

async function cmdEditarGuardar(telefono, datos, valor) {
  const campo = datos.campo;
  const update = {};
  update[campo] = valor;
  const { error } = await supabase.from("equipos").update(update).eq("id", datos.editar_id);
  if (error) return "Error al guardar. Intenta de nuevo.";
  await clearSession(telefono);
  return "Maquina actualizada.\\n" + campo + " = " + valor + "\\n\\n1. Registrar maquina\\n2. Registrar operador\\n3. Ver estado\\n4. Ayuda\\n5. Editar maquina";
}

function mostrarAyudaAdmin() {`;

if (c.includes(oldAyuda)) {
  c = c.replace(oldAyuda, newAyudaBefore);
  console.log("UPG-09: Funciones editar agregadas");
  cambios++;
} else {
  console.log("UPG-09: patron mostrarAyudaAdmin no encontrado");
}

// 4. Agregar cases en continuarFlujo
const oldSwitch = '  switch (paso) {';

const newSwitch = `  switch (paso) {

    // UPG-09: Flujo EDITAR
    case "esperando_seleccion_maquina":
      return await cmdEditarSeleccion(telefono, datos, msg);

    case "esperando_campo_editar":
      return await cmdEditarCampo(telefono, datos, msg);

    case "esperando_nuevo_valor":
      return await cmdEditarGuardar(telefono, datos, msg);

`;

if (c.includes(oldSwitch)) {
  c = c.replace(oldSwitch, newSwitch);
  console.log("UPG-09: Cases editar agregados a continuarFlujo");
  cambios++;
} else {
  console.log("UPG-09: patron switch(paso) no encontrado");
}

console.log("\\nTotal cambios: " + cambios);
fs.writeFileSync("flows/admin.js", c);
console.log("ARCHIVO GUARDADO");
