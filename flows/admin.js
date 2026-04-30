const { createClient } = require("@supabase/supabase-js");
const { getSession, saveSession, clearSession } = require("../lib/sesiones");
const { normalizarE164 } = require("../lib/telefono");
const { hashearPin, verificarPinAdmin } = require("../lib/adminAuth");
const { verificarRateLimit, registrarIntento } = require("../lib/rateLimit");
const mensajes = require("../lib/mensajes");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const TIPOS_MAQUINA = {
  "1": "Excavadora",
  "2": "Bulldozer",
  "3": "Cargador",
  "4": "Camion",
  "5": "Motoconformadora",
  "6": "Otro"
};

async function handleAdminMessage(telefono, mensaje, mediaUrl) {
  const msg = (mensaje || "").trim();
  const upper = msg.toUpperCase();

  if (mediaUrl && !msg) {
    return "Foto no necesaria aqu\u00ed.\n\n1. Registrar m\u00e1quina\n2. Registrar operador\n3. Ver estado\n4. Ayuda";
  }

  if (upper === "CANCELAR" || upper === "CANCEL") {
    await clearSession(telefono);
    return "Cancelado.\n\n1. Registrar m\u00e1quina\n2. Registrar operador\n3. Ver estado\n4. Ayuda";
  }

  const session = await getSession(telefono);
  const empresa = await getEmpresaByAdmin(telefono);

  if (!session && !empresa) {
    await saveSession(telefono, "admin_onboarding", "esperando_empresa_nombre", {});
    return "Hola, soy IronSync \ud83d\udcaa\n\nVamos a configurar tu empresa.\n\u00bfC\u00f3mo se llama tu empresa?";
  }

  if (!session && empresa) {
    return await handleAdminExistente(telefono, empresa, msg);
  }

  return await continuarFlujo(telefono, session, msg);
}

async function getEmpresaByAdmin(telefono) {
  const { data } = await supabase
    .from("empresas")
    .select("*")
    .eq("admin_telefono", telefono)
    .limit(1)
    .single();
  return data;
}

async function getEquiposByEmpresa(empresaId) {
  const { data } = await supabase
    .from("equipos")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("activo", true);
  return data || [];
}

async function getOperadoresByEmpresa(empresaId) {
  const { data } = await supabase
    .from("usuarios")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("rol", "operador")
    .eq("activo", true);
  return data || [];
}

async function handleAdminExistente(telefono, empresa, msg) {
  const upper = msg.toUpperCase();

  if (upper.includes("MAQUINA") || upper.includes("M\u00c1QUINA") || upper === "1") {
    await saveSession(telefono, "admin_auth", "esperando_pin_admin", {
      accion: "MAQUINA",
      empresa_id: empresa.id
    });
    return "Manda tu PIN de administrador.";
  }

  if (upper.includes("OPERADOR") || upper === "2") {
    await saveSession(telefono, "admin_auth", "esperando_pin_admin", {
      accion: "OPERADOR",
      empresa_id: empresa.id
    });
    return "Manda tu PIN de administrador.";
  }

  if (upper.includes("ESTADO") || upper.includes("VER") || upper === "3") {
    return await mostrarEstado(empresa.id);
  }

  if (upper.includes("AYUDA") || upper === "4") {
    return mostrarAyudaAdmin();
  }

  if (upper === "STATUS") {
    return await mostrarEstadoActivacion(empresa.id);
  }

  if (upper.includes("EDITAR") || upper === "5") {
    const equipos = await getEquiposByEmpresa(empresa.id);
    if (equipos.length === 0) return "No tienes maquinas registradas.";
    let lista = "Que maquina quieres editar?\n";
    equipos.forEach(function(eq, i) {
      lista += "\n" + (i + 1) + ". " + eq.alias + " (" + eq.codigo + ")";
    });
    await saveSession(telefono, "admin_editar", "esperando_seleccion_maquina", {
      empresa_id: empresa.id,
      equipos: equipos.map(function(e) { return { id: e.id, alias: e.alias, codigo: e.codigo, serie: e.serie, tipo: e.tipo }; })
    });
    return lista;
  }

  return "Hola " + empresa.admin_nombre + " \ud83d\udc4b\n\n\u00bfQu\u00e9 quieres hacer?\n\n1. Registrar m\u00e1quina\n2. Registrar operador\n3. Ver estado\n4. Ayuda\n5. Editar m\u00e1quina";
}

async function continuarFlujo(telefono, session, msg) {
  const paso = session.paso;
  const datos = session.datos || {};

  if (paso === "esperando_pin_admin") {
    const limite = await verificarRateLimit(telefono, "pin_admin");
    if (!limite.permitido) return limite.mensaje;

    const valido = await verificarPinAdmin(telefono, msg);
    await registrarIntento(telefono, "pin_admin", valido);

    if (!valido) {
      return "PIN incorrecto. Intenta de nuevo.";
    }

    const accion = datos.accion;
    if (accion === "MAQUINA") {
      await saveSession(telefono, "admin_onboarding", "esperando_maquina_alias", {
        empresa_id: datos.empresa_id
      });
      return "\u00bfC\u00f3mo se llama la m\u00e1quina? (ej: CAT336)";
    }
    if (accion === "OPERADOR") {
      await saveSession(telefono, "admin_onboarding", "esperando_operador_nombre", {
        empresa_id: datos.empresa_id
      });
      return "\u00bfC\u00f3mo se llama el operador?";
    }
  }

  switch (paso) {

    // UPG-09: Flujo EDITAR
    case "esperando_seleccion_maquina":
      return await cmdEditarSeleccion(telefono, datos, msg);

    case "esperando_campo_editar":
      return await cmdEditarCampo(telefono, datos, msg);

    case "esperando_nuevo_valor":
      return await cmdEditarGuardar(telefono, datos, msg);



    case "esperando_empresa_nombre":
      datos.empresa_nombre = msg;
      await saveSession(telefono, "admin_onboarding", "esperando_admin_nombre", datos);
      return "\u2705 " + msg + ".\n\u00bfCu\u00e1l es tu nombre?";

    case "esperando_admin_nombre":
      datos.admin_nombre = msg;
      await saveSession(telefono, "admin_onboarding", "confirmar_admin", datos);
      return "\u2705 " + msg + ".\n\u00bfConfirmas que eres el administrador?\n\n1. S\u00ed, confirmo\n2. Corregir nombre";

    case "confirmar_admin":
      if (msg === "1" || msg.toUpperCase() === "SI" || msg.toUpperCase() === "S\u00cd") {
        const existente = await getEmpresaByAdmin(telefono);
        if (existente) {
          await clearSession(telefono);
          return "Ya tienes una empresa: " + existente.nombre + "\nEscribe MAQUINA u OPERADOR.";
        }

        const { data: nuevaEmpresa } = await supabase
          .from("empresas")
          .insert({
            nombre: datos.empresa_nombre,
            admin_telefono: telefono,
            admin_nombre: datos.admin_nombre
          })
          .select()
          .single();

        if (!nuevaEmpresa) {
          return "Error al crear empresa. Intenta de nuevo.";
        }

        await supabase.from("usuarios").insert({
          empresa_id: nuevaEmpresa.id,
          nombre: datos.admin_nombre,
          telefono: telefono,
          rol: "admin"
        });

        await saveSession(telefono, "admin_onboarding", "esperando_admin_pin", {
          empresa_id: nuevaEmpresa.id
        });

        return "\u2705 Empresa configurada.\n\nCrea un PIN de administrador (4 d\u00edgitos).\nLo necesitar\u00e1s para hacer cambios.";
      }

      await saveSession(telefono, "admin_onboarding", "esperando_admin_nombre", datos);
      return "Ok, \u00bfCu\u00e1l es tu nombre?";

    case "esperando_admin_pin":
      const pinAdmin = msg.replace(/\D/g, "");
      if (pinAdmin.length < 4 || pinAdmin.length > 6) {
        return "El PIN debe tener 4 a 6 d\u00edgitos.";
      }
      const pinHash = await hashearPin(pinAdmin);
      await supabase
        .from("usuarios")
        .update({ pin: pinHash })
        .eq("telefono", telefono)
        .eq("rol", "admin");

      await saveSession(telefono, "admin_onboarding", "esperando_maquina_alias", {
        empresa_id: datos.empresa_id
      });
      return "\u2705 PIN guardado.\n\nRegistremos tu primera m\u00e1quina.\n\u00bfC\u00f3mo se llama? (ej: CAT336)";

    case "esperando_maquina_alias":
      datos.maquina_alias = msg;
      await saveSession(telefono, "admin_onboarding", "esperando_maquina_codigo", datos);
      return "\u2705 " + msg + ".\n\u00bfCu\u00e1l es el c\u00f3digo? (ej: CAT336)";

    case "esperando_maquina_codigo":
      datos.maquina_codigo = msg.toUpperCase();
      await saveSession(telefono, "admin_onboarding", "esperando_maquina_serie", datos);
      return "\u2705 " + msg.toUpperCase() + ".\n\u00bfCu\u00e1l es la serie?";

    case "esperando_maquina_serie":
      datos.maquina_serie = msg;
      await saveSession(telefono, "admin_onboarding", "esperando_maquina_tipo", datos);
      return "\u2705 " + msg + ".\n\u00bfQu\u00e9 tipo de m\u00e1quina es?\n\n1. Excavadora\n2. Bulldozer\n3. Cargador\n4. Cami\u00f3n\n5. Motoconformadora\n6. Otro";

    case "esperando_maquina_tipo":
      const tipo = TIPOS_MAQUINA[msg] || msg;
      datos.maquina_tipo = tipo;

      const { data: nuevoEquipo } = await supabase
        .from("equipos")
        .insert({
          empresa_id: datos.empresa_id,
          alias: datos.maquina_alias,
          codigo: datos.maquina_codigo,
          serie: datos.maquina_serie,
          tipo: tipo
        })
        .select()
        .single();

      if (!nuevoEquipo) {
        return "Error al guardar maquina. Intenta de nuevo.";
      }

      await saveSession(telefono, "admin_onboarding", "esperando_siguiente_accion", {
        empresa_id: datos.empresa_id
      });

      return "\u2705 " + datos.maquina_alias + " \u00b7 " + datos.maquina_codigo + " \u00b7 " + tipo + "\n\n\u00bfQu\u00e9 sigue?\n\n1. Registrar otra m\u00e1quina\n2. Registrar operador";

    case "esperando_siguiente_accion":
      if (msg === "1") {
        await saveSession(telefono, "admin_onboarding", "esperando_maquina_alias", {
          empresa_id: datos.empresa_id
        });
        return "\u00bfC\u00f3mo se llama la siguiente m\u00e1quina?";
      }
      if (msg === "2") {
        await saveSession(telefono, "admin_onboarding", "esperando_operador_nombre", {
          empresa_id: datos.empresa_id
        });
        return "\u00bfC\u00f3mo se llama el operador?";
      }
      return "Responde 1 o 2:\n1. Registrar m\u00e1quina\n2. Registrar operador";

    case "esperando_operador_nombre":
      datos.operador_nombre = msg;
      await saveSession(telefono, "admin_onboarding", "esperando_operador_telefono", datos);
      return "\u2705 " + msg + ".\n\u00bfCu\u00e1l es su tel\u00e9fono WhatsApp?\nEjemplo: 5539954872";

    case "esperando_operador_telefono":
      const telNormalizado = normalizarE164(msg);
      if (!telNormalizado) {
        return "Tel\u00e9fono no v\u00e1lido.\nEjemplo: 5539954872";
      }
      datos.operador_telefono = telNormalizado;

      const equipos = await getEquiposByEmpresa(datos.empresa_id);
      if (equipos.length === 0) {
        return "No tienes m\u00e1quinas registradas.\nPrimero registra una m\u00e1quina.";
      }

      let lista = "\u00bfA qu\u00e9 m\u00e1quina lo asignas?";
      equipos.forEach(function(eq, i) {
        lista += "\n\n" + (i + 1) + ". " + eq.alias + " (" + eq.codigo + ")";
      });

      datos.equipos_disponibles = equipos;
      await saveSession(telefono, "admin_onboarding", "esperando_operador_maquina", datos);
      return lista;

    case "esperando_operador_maquina":
      const idx = parseInt(msg) - 1;
      const equiposDisp = datos.equipos_disponibles || [];

      if (isNaN(idx) || idx < 0 || idx >= equiposDisp.length) {
        let lista2 = "Responde el n\u00famero de la m\u00e1quina:";
        equiposDisp.forEach(function(eq, i) {
          lista2 += "\n\n" + (i + 1) + ". " + eq.alias + " (" + eq.codigo + ")";
        });
        return lista2;
      }

      const equipoSeleccionado = equiposDisp[idx];

      await supabase
        .from("asignaciones")
        .update({ activa: false })
        .eq("equipo_id", equipoSeleccionado.id)
        .eq("activa", true);

      const { data: nuevoOperador } = await supabase
        .from("usuarios")
        .insert({
          empresa_id: datos.empresa_id,
          nombre: datos.operador_nombre,
          telefono: datos.operador_telefono,
          rol: "operador"
        })
        .select()
        .single();

      if (!nuevoOperador) {
        return "Error al crear operador. Intenta de nuevo.";
      }

      await supabase
        .from("asignaciones")
        .insert({
          empresa_id: datos.empresa_id,
          operador_id: nuevoOperador.id,
          equipo_id: equipoSeleccionado.id
        });

      await enviarWhatsApp(
        datos.operador_telefono,
        "Hola " + datos.operador_nombre + ", te registraron en IronSync.\n\nPara activar tu cuenta manda tu PIN de 4 d\u00edgitos.\nEjemplo: 1234"
      );

      await saveSession(telefono, "admin_onboarding", "esperando_otro_operador", {
        empresa_id: datos.empresa_id
      });

      return "\u2705 " + datos.operador_nombre + " \u2192 " + equipoSeleccionado.alias + "\n\n" + datos.operador_nombre + " recibi\u00f3 un mensaje para activar su cuenta.\n\n\u00bfOtro operador o terminar?\n1. Otro operador\n2. Terminar";

    case "esperando_otro_operador":
      if (msg === "1") {
        await saveSession(telefono, "admin_onboarding", "esperando_operador_nombre", {
          empresa_id: datos.empresa_id
        });
        return "\u00bfC\u00f3mo se llama el siguiente operador?";
      }
      if (msg === "2") {
        await clearSession(telefono);
        return await mostrarResumen(datos.empresa_id);
      }
      return "Responde 1 o 2:\n1. Otro operador\n2. Terminar";

    default:
      await clearSession(telefono);
      return mensajes.sesionExpirada();
  }
}

async function mostrarEstado(empresaId) {
  const equipos = await getEquiposByEmpresa(empresaId);
  const operadores = await getOperadoresByEmpresa(empresaId);

  let estado = "\ud83d\udcca Estado actual:";
  estado += "\n\n\ud83d\ude9b M\u00e1quinas (" + equipos.length + "):";
  equipos.forEach(function(eq) {
    estado += "\n  \u2022 " + eq.alias + " (" + eq.codigo + ")";
  });
  estado += "\n\n\ud83d\udc77 Operadores (" + operadores.length + "):";
  operadores.forEach(function(op) {
    estado += "\n  \u2022 " + op.nombre;
  });
  return estado;
}

async function mostrarEstadoActivacion(empresaId) {
  const operadores = await getOperadoresByEmpresa(empresaId);

  let activos = 0;
  let pendientes = 0;

  let reporte = "Estado de activacion:\n";

  operadores.forEach(function(op) {
    const activo = op.pin && op.pin.length > 0;
    if (activo) {
      reporte += "\n? " + op.nombre + " - activo";
      activos++;
    } else {
      reporte += "\n? " + op.nombre + " - pendiente";
      pendientes++;
    }
  });

  reporte += "\n\n" + activos + " de " + operadores.length + " activos.";

  if (pendientes > 0) {
    reporte += "\n\nMandales un mensaje a los pendientes para que pongan su PIN.";
  }

  return reporte;
}

async function mostrarResumen(empresaId) {
  const { data: empresa } = await supabase
    .from("empresas").select("*").eq("id", empresaId).single();
  const equipos = await getEquiposByEmpresa(empresaId);
  const operadores = await getOperadoresByEmpresa(empresaId);

  let resumen = "\u2705 Configuraci\u00f3n completa.\n\n\ud83c\udfe2 " + empresa.nombre;
  equipos.forEach(function(eq) {
    resumen += "\n\n\ud83d\ude9b " + eq.alias + " \u00b7 " + eq.tipo;
  });
  resumen += "\n";
  operadores.forEach(function(op) {
    resumen += "\n\ud83d\udc77 " + op.nombre;
  });
  resumen += "\n\nPara agregar m\u00e1s, escribe: MAQUINA u OPERADOR";
  return resumen;
}

async function cmdEditarSeleccion(telefono, datos, msg) {
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
  return "Editando: " + eq.alias + " (" + eq.codigo + ")\n\nQue quieres cambiar?\n\n1. Alias (" + eq.alias + ")\n2. Codigo (" + eq.codigo + ")\n3. Serie (" + (eq.serie || "sin dato") + ")\n4. Tipo (" + (eq.tipo || "sin dato") + ")";
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
  return "Maquina actualizada.\n" + campo + " = " + valor + "\n\n1. Registrar maquina\n2. Registrar operador\n3. Ver estado\n4. Ayuda\n5. Editar maquina";
}

function mostrarAyudaAdmin() {
  return "\ud83d\udcda Comandos:\n\n1. MAQUINA \u2192 Registrar m\u00e1quina\n2. OPERADOR \u2192 Registrar operador\n3. ESTADO \u2192 Ver configuraci\u00f3n\n4. AYUDA \u2192 Esta ayuda\n5. EDITAR \u2192 Editar m\u00e1quina\nSTATUS \u2192 Operadores activos/pendientes\nCANCELAR \u2192 Salir de flujo";
}

async function enviarWhatsApp(telefono, mensaje) {
  try {
    const twilio = require("twilio");
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: "whatsapp:" + telefono,
      body: mensaje
    });
    console.log("WHATSAPP_ENVIADO", telefono);
  } catch (error) {
    console.error("ERROR_WHATSAPP", { telefono, error: error.message });
  }
}

module.exports = { handleAdminMessage };
