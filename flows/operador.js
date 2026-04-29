const { createClient } = require("@supabase/supabase-js");
const { getSession, saveSession, clearSession } = require("../lib/sesiones");
const { normalizarE164 } = require("../lib/telefono");
const { hashearPin } = require("../lib/adminAuth");
const { verificarRateLimit, registrarIntento } = require("../lib/rateLimit");
const mensajes = require("../lib/mensajes");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const TIPOS_PARO = {
  "1": { tipo: "PARO_CLI", motivo: "Diesel" },
  "2": { tipo: "PARO_CLI", motivo: "Espera cliente" },
  "3": { tipo: "PARO_ARR", motivo: "Falla mecanica" },
  "4": { tipo: "PARO_OTRO", motivo: "Otro" }
};

async function handleOperadorMessage(telefono, mensaje, mediaUrl) {
  const msg = (mensaje || "").trim();
  const upper = msg.toUpperCase();
  const session = await getSession(telefono);

  if (upper === "CANCELAR" || upper === "CANCEL") {
    if (session) {
      await clearSession(telefono);
      return "Cancelado.\n\nManda INICIO para turno\nManda AYUDA para opciones";
    }
    return "No hay nada que cancelar.\nManda INICIO para turno.";
  }

  if (session && session.flujo === "operador") {
    return await continuarFlujo(telefono, session, msg, mediaUrl);
  }

  const operador = await getOperadorByTelefono(telefono);

  if (!operador) {
    return mensajes.noRegistrado();
  }

  if (!operador.pin) {
    if (session && session.paso === "esperando_pin") {
      return await activarCuenta(telefono, operador, msg);
    }
    await saveSession(telefono, "operador", "esperando_pin", {
      operador_id: operador.id
    });
    return "Hola " + operador.nombre + ", te registraron en IronSync.\n\nPara activar tu cuenta manda tu PIN de 4 d\u00edgitos.\nEjemplo: 1234";
  }

  return await procesarComando(telefono, operador, upper, msg, mediaUrl);
}

async function getOperadorByTelefono(telefono) {
  const telNorm = normalizarE164(telefono);

  const { data } = await supabase
    .from("usuarios")
    .select("*")
    .eq("telefono", telNorm)
    .eq("rol", "operador")
    .eq("activo", true)
    .limit(1)
    .single();

  if (data) return data;

  const tel10 = telNorm ? telNorm.slice(-10) : "";
  const { data: fb } = await supabase
    .from("usuarios")
    .select("*")
    .eq("rol", "operador")
    .eq("activo", true)
    .ilike("telefono", "%" + tel10)
    .limit(1)
    .single();

  return fb || null;
}

async function getAsignacionesOperador(operadorId) {
  const { data } = await supabase
    .from("asignaciones")
    .select("*, equipos(*)")
    .eq("operador_id", operadorId)
    .eq("activa", true);
  return data || [];
}

async function getTurnoAbierto(operadorId) {
  const { data } = await supabase
    .from("turnos")
    .select("*")
    .eq("operador_id", operadorId)
    .eq("estado", "abierto")
    .order("inicio", { ascending: false })
    .limit(1);

  if (!data || data.length === 0) return null;

  const turno = data[0];
  await supabase
    .from("turnos")
    .update({ estado: "cerrado_auto", observaciones: "Turno duplicado cerrado" })
    .eq("operador_id", operadorId)
    .eq("estado", "abierto")
    .neq("id", turno.id);

  return turno;
}

async function getEquipoById(equipoId) {
  const { data } = await supabase
    .from("equipos")
    .select("*")
    .eq("id", equipoId)
    .single();
  return data;
}

async function generarFolio(codigo) {
  const fecha = new Date();
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, "0");
  const dd = String(fecha.getDate()).padStart(2, "0");
  const prefijo = "IS-" + yyyy + "-" + mm + "-" + dd + "-" + codigo;

  const { count } = await supabase
    .from("turnos")
    .select("*", { count: "exact", head: true })
    .like("folio", prefijo + "%");

  const num = String((count || 0) + 1).padStart(3, "0");
  return prefijo + "-" + num;
}

async function activarCuenta(telefono, operador, msg) {
  const pin = msg.replace(/\D/g, "");

  if (pin.length < 4 || pin.length > 6) {
    return "El PIN debe tener 4 a 6 d\u00edgitos.\nEjemplo: 1234";
  }

  const pinHash = await hashearPin(pin);

  await supabase
    .from("usuarios")
    .update({ pin: pinHash })
    .eq("id", operador.id);

  await clearSession(telefono);

  const asignaciones = await getAsignacionesOperador(operador.id);
  const maquina = asignaciones.length > 0 ? asignaciones[0].equipos : null;

  let respuesta = "\u2705 Cuenta activada.\n";
  if (maquina) {
    respuesta += "Tu m\u00e1quina: " + (maquina.alias || maquina.codigo);
    if (maquina.alias && maquina.codigo) {
      respuesta += " \u00b7 " + maquina.codigo;
    }
    respuesta += "\n";
  }
  respuesta += "\nPara iniciar turno manda: INICIO";
  return respuesta;
}

async function procesarComando(telefono, operador, upper, msg, mediaUrl) {
  if (upper === "INICIO" || upper.startsWith("INICIO ")) {
    return await cmdInicio(telefono, operador, upper);
  }
  if (upper === "FIN") {
    return await cmdFin(telefono, operador);
  }
  if (upper === "PARO") {
    return await cmdParo(telefono, operador);
  }
  if (upper === "FALLA") {
    return await cmdFalla(telefono, operador);
  }
  if (upper === "REANUDA") {
    return await cmdReanuda(telefono, operador);
  }
  if (upper === "TURNO" || upper === "STATUS") {
    return await cmdTurno(telefono, operador);
  }
  if (upper === "PERFIL") {
    return await cmdPerfil(operador);
  }
  if (upper === "PIN" || upper === "CAMBIAR PIN") {
    return await cmdCambiarPin(telefono, operador);
  }
  if (upper === "AYUDA" || upper === "HELP") {
    return cmdAyuda();
  }

  if (mediaUrl && !upper) {
    return "Foto recibida.\nSi quieres iniciar turno manda: INICIO";
  }

  return mensajes.noEntendi();
}

async function cmdInicio(telefono, operador, upper) {
  const turnoAbierto = await getTurnoAbierto(operador.id);

  if (turnoAbierto) {
    const session = await getSession(telefono);
    if (session && session.paso === "esperando_reanuda") {
      return "Tienes un paro abierto.\nManda REANUDA o FIN.";
    }

    const horas = ((Date.now() - new Date(turnoAbierto.inicio).getTime()) / 3600000).toFixed(1);

    await saveSession(telefono, "operador", "esperando_decision_turno", {
      turno_anterior: turnoAbierto
    });
    return "Turno abierto hace " + horas + " hrs.\n\n1. Cerrar y abrir nuevo\n2. Continuar actual\n3. Cerrar (FIN)";
  }

  const asignaciones = await getAsignacionesOperador(operador.id);
  if (asignaciones.length === 0) {
    return "No tienes m\u00e1quina asignada.\nHabla con tu jefe.";
  }

  const partes = upper.split(" ");
  if (partes.length >= 3) {
    const codigo = partes[1];
    const horometro = parseFloat(partes[2]);
    if (!isNaN(horometro)) {
      const asig = asignaciones.find(function(a) {
        return a.equipos && a.equipos.codigo === codigo;
      });
      if (asig) {
        return await abrirTurno(telefono, operador, asig, horometro, null, false);
      }
    }
  }

  if (asignaciones.length === 1) {
    const eq = asignaciones[0].equipos;
    await saveSession(telefono, "operador", "esperando_horometro_inicio", {
      asignacion_id: asignaciones[0].id,
      equipo_id: eq.id,
      equipo_alias: eq.alias,
      equipo_codigo: eq.codigo
    });
    return (eq.alias || eq.codigo) + " \u00b7 contador inicial.\nEjemplo: 5690";
  }

  let lista = "\u00bfQu\u00e9 m\u00e1quina?";
  asignaciones.forEach(function(a, i) {
    const eq = a.equipos;
    lista += "\n\n" + (i + 1) + ". " + (eq.alias || eq.codigo);
    if (eq.alias && eq.codigo) lista += " \u00b7 " + eq.codigo;
  });

  await saveSession(telefono, "operador", "esperando_seleccion_maquina", {
    asignaciones: asignaciones.map(function(a) {
      return { id: a.id, equipo_id: a.equipos.id, alias: a.equipos.alias, codigo: a.equipos.codigo };
    })
  });
  return lista;
}

async function continuarFlujo(telefono, session, msg, mediaUrl) {
  const paso = session.paso;
  const datos = session.datos || {};
  const upper = msg.toUpperCase();

  switch (paso) {

    case "esperando_pin":
      return await activarCuenta(telefono, await getOperadorByTelefono(telefono), msg);

    case "esperando_decision_turno":
      if (msg === "1") {
        await supabase.from("turnos").update({
          fin: new Date().toISOString(),
          estado: "cerrado_manual",
          observaciones: "Cerrado para abrir nuevo"
        }).eq("id", datos.turno_anterior.id);

        const asignaciones = await getAsignacionesOperador(
          (await getOperadorByTelefono(telefono)).id
        );
        if (asignaciones.length === 1) {
          const eq = asignaciones[0].equipos;
          await saveSession(telefono, "operador", "esperando_horometro_inicio", {
            asignacion_id: asignaciones[0].id,
            equipo_id: eq.id, equipo_alias: eq.alias, equipo_codigo: eq.codigo
          });
          return "Turno anterior cerrado.\n\n" + (eq.alias || eq.codigo) + " \u00b7 contador actual.\nEjemplo: 5690";
        }
        await clearSession(telefono);
        return "Turno anterior cerrado.\nManda INICIO para abrir nuevo.";
      }
      if (msg === "2") {
        await clearSession(telefono);
        return "Contin\u00faa con tu turno actual.";
      }
      if (msg === "3") {
        return await cmdFin(telefono, await getOperadorByTelefono(telefono));
      }
      return "Responde 1, 2 o 3.";

    case "esperando_seleccion_maquina":
      const idx = parseInt(msg) - 1;
      const asignaciones = datos.asignaciones || [];
      if (isNaN(idx) || idx < 0 || idx >= asignaciones.length) {
        return "Responde el n\u00famero de la m\u00e1quina.";
      }
      const sel = asignaciones[idx];
      await saveSession(telefono, "operador", "esperando_horometro_inicio", {
        asignacion_id: sel.id, equipo_id: sel.equipo_id,
        equipo_alias: sel.alias, equipo_codigo: sel.codigo
      });
      return (sel.alias || sel.codigo) + " \u00b7 contador inicial.\nEjemplo: 5690";

    case "esperando_horometro_inicio":
      const h = parseFloat(msg);
      if (isNaN(h)) return "Manda solo el n\u00famero del contador.\nEjemplo: 5690";
      datos.horometro_inicio = h;
      await saveSession(telefono, "operador", "esperando_foto_inicio", datos);
      return "Manda foto del contador.\nSi no puedes, escribe: SIN FOTO";

    case "esperando_foto_inicio":
      if (!mediaUrl && msg) {
        if (upper === "SIN FOTO" || upper === "NO") {
          const op = await getOperadorByTelefono(telefono);
          return await abrirTurno(telefono, op,
            { id: datos.asignacion_id, equipos: { id: datos.equipo_id, alias: datos.equipo_alias, codigo: datos.equipo_codigo } },
            datos.horometro_inicio, null, true);
        }
        return "Eso no es una foto \ud83d\udcf7\n\nToma una foto del contador.\nSi no puedes, escribe: SIN FOTO";
      }
      if (!mediaUrl && !msg) {
        return "Esperando foto del contador.\nSi no puedes, escribe: SIN FOTO";
      }
      const opFoto = await getOperadorByTelefono(telefono);
      return await abrirTurno(telefono, opFoto,
        { id: datos.asignacion_id, equipos: { id: datos.equipo_id, alias: datos.equipo_alias, codigo: datos.equipo_codigo } },
        datos.horometro_inicio, mediaUrl, false);

    case "esperando_tipo_paro":
      const tipoParo = TIPOS_PARO[msg];
      if (!tipoParo) {
        return "Responde 1, 2, 3 o 4:\n1. Diesel\n2. Espera cliente\n3. Falla mecanica\n4. Otro";
      }
      if (msg === "4") {
        await saveSession(telefono, "operador", "esperando_motivo_paro", datos);
        return "\u00bfQu\u00e9 pas\u00f3? Descr\u00edbelo en pocas palabras.";
      }
      return await registrarParo(telefono, datos, tipoParo.tipo, tipoParo.motivo);

    case "esperando_motivo_paro":
      return await registrarParo(telefono, datos, "PARO_OTRO", msg);

    case "esperando_descripcion_falla":
      await supabase.from("turno_eventos").insert({
        turno_id: datos.turno_id,
        tipo_evento: "FALLA",
        motivo_reportado: msg,
        timestamp_inicio: new Date().toISOString()
      });
      await saveSession(telefono, "operador", "esperando_reanuda", {
        turno_id: datos.turno_id,
        horometro_inicio: datos.horometro_inicio,
        evento_inicio: new Date().toISOString()
      });
      return "\u2705 Falla registrada: " + msg + "\nManda REANUDA cuando sigas.";

    case "esperando_reanuda":
      if (upper === "REANUDA") {
        const inicioEvento = new Date(datos.evento_inicio);
        const duracion = Math.round((Date.now() - inicioEvento.getTime()) / 60000);

        await supabase.from("turno_eventos").update({
          timestamp_fin: new Date().toISOString(),
          duracion_min: duracion
        }).eq("turno_id", datos.turno_id).eq("timestamp_fin", null);

        await clearSession(telefono);
        return "\u2705 Reanudado \u00b7 Paro: " + duracion + " min.\nContin\u00faa trabajando.";
      }
      return "Manda REANUDA para continuar.\nManda FIN para cerrar turno.";

    case "esperando_horometro_fin":
      const hf = parseFloat(msg);
      if (isNaN(hf)) return "Manda solo el n\u00famero del contador.\nInicial: " + datos.horometro_inicio;
      if (hf < datos.horometro_inicio) {
        return "El contador final no puede ser menor que " + datos.horometro_inicio + ".";
      }
      datos.horometro_fin = hf;
      await saveSession(telefono, "operador", "esperando_foto_fin", datos);
      return "Manda foto del contador final.\nSi no puedes, escribe: SIN FOTO";

    case "esperando_foto_fin":
      if (!mediaUrl && msg) {
        if (upper === "SIN FOTO" || upper === "NO") {
          return await cerrarTurno(telefono, datos, null, true);
        }
        return "Eso no es una foto \ud83d\udcf7\nToma una foto del contador final.\nSi no puedes, escribe: SIN FOTO";
      }
      if (!mediaUrl && !msg) {
        return "Esperando foto del contador final.\nSi no puedes, escribe: SIN FOTO";
      }
      return await cerrarTurno(telefono, datos, mediaUrl, false);

    case "esperando_nuevo_pin":
      const np = msg.replace(/\D/g, "");
      if (np.length < 4 || np.length > 6) return "El PIN debe tener 4 a 6 d\u00edgitos.";
      const hash = await hashearPin(np);
      const operadorPin = await getOperadorByTelefono(telefono);
      await supabase.from("usuarios").update({ pin: hash }).eq("id", operadorPin.id);
      await clearSession(telefono);
      return "\u2705 PIN actualizado.\nPara iniciar turno manda: INICIO";

    default:
      await clearSession(telefono);
      return mensajes.sesionExpirada();
  }
}

async function abrirTurno(telefono, operador, asignacion, horometro, fotoUrl, sinFoto) {
  const equipo = asignacion.equipos || {};
  const folio = await generarFolio(equipo.codigo || "SIN");

  try {
    const { data: turno, error } = await supabase
      .from("turnos")
      .insert({
        empresa_id: operador.empresa_id,
        operador_id: operador.id,
        equipo_id: equipo.id,
        folio: folio,
        maquina: equipo.codigo,
        inicio: new Date().toISOString(),
        horometro_inicio: horometro,
        foto_inicio_url: fotoUrl,
        sin_foto_inicio: sinFoto,
        estado: "abierto",
        operador_telefono: operador.telefono,
        operador_nombre: operador.nombre,
        fecha_turno: new Date().toISOString().split("T")[0]
      })
      .select()
      .single();

    if (error) throw error;

    await clearSession(telefono);

    let r = "\u2705 Turno abierto \u00b7 " + (equipo.alias || equipo.codigo) + " \u00b7 " + horometro + " hrs.";
    if (sinFoto) r += "\n\u26a0\ufe0f Sin foto de inicio.";
    r += "\n\nAl terminar manda FIN.";
    return r;

  } catch (error) {
    console.error("ERROR_ABRIR_TURNO", error);
    return mensajes.errorConexion();
  }
}

async function cmdParo(telefono, operador) {
  const turno = await getTurnoAbierto(operador.id);
  if (!turno) return "No tienes turno abierto.";

  await saveSession(telefono, "operador", "esperando_tipo_paro", {
    turno_id: turno.id,
    horometro_inicio: turno.horometro_inicio
  });
  return "\u00bfQu\u00e9 pas\u00f3?\n\n1. Diesel\n2. Espera cliente\n3. Falla mecanica\n4. Otro";
}

async function registrarParo(telefono, datos, tipoEvento, motivo) {
  await supabase.from("turno_eventos").insert({
    turno_id: datos.turno_id,
    tipo_evento: tipoEvento,
    motivo_reportado: motivo,
    timestamp_inicio: new Date().toISOString()
  });
  await saveSession(telefono, "operador", "esperando_reanuda", {
    turno_id: datos.turno_id,
    horometro_inicio: datos.horometro_inicio,
    evento_inicio: new Date().toISOString()
  });
  return "\u2705 Paro registrado \u00b7 " + motivo + "\nManda REANUDA cuando sigas.";
}

async function cmdFalla(telefono, operador) {
  const turno = await getTurnoAbierto(operador.id);
  if (!turno) return "No tienes turno abierto.";

  await saveSession(telefono, "operador", "esperando_descripcion_falla", {
    turno_id: turno.id,
    horometro_inicio: turno.horometro_inicio
  });
  return "Describe la falla en pocas palabras.\nEjemplo: fuga de aceite";
}

async function cmdReanuda(telefono, operador) {
  const session = await getSession(telefono);
  if (session && session.paso === "esperando_reanuda") {
    const datos = session.datos;
    const duracion = Math.round((Date.now() - new Date(datos.evento_inicio).getTime()) / 60000);

    await supabase.from("turno_eventos").update({
      timestamp_fin: new Date().toISOString(),
      duracion_min: duracion
    }).eq("turno_id", datos.turno_id).eq("timestamp_fin", null);

    await clearSession(telefono);
    return "\u2705 Reanudado \u00b7 Paro: " + duracion + " min.\nContin\u00faa trabajando.";
  }
  return "No tienes paro registrado.\nSi necesitas reportar un paro manda: PARO";
}

async function cmdFin(telefono, operador) {
  const turno = await getTurnoAbierto(operador.id);
  if (!turno) return "No tienes turno abierto.";

  await saveSession(telefono, "operador", "esperando_horometro_fin", {
    turno_id: turno.id,
    horometro_inicio: turno.horometro_inicio,
    equipo_id: turno.equipo_id
  });
  return "Contador final.\nInicial: " + turno.horometro_inicio + "\nManda el n\u00famero actual.";
}

async function cerrarTurno(telefono, datos, fotoUrl, sinFoto) {
  const horas = Math.round((datos.horometro_fin - datos.horometro_inicio) * 10) / 10;

  try {
    await supabase.from("turnos").update({
      fin: new Date().toISOString(),
      horometro_fin: datos.horometro_fin,
      horas_horometro: horas,
      foto_fin_url: fotoUrl,
      sin_foto_fin: sinFoto,
      estado: "cerrado"
    }).eq("id", datos.turno_id);

    await clearSession(telefono);

    let r = "\u2705 Turno cerrado \u00b7 " + horas + " hrs.";
    if (sinFoto) r += "\n\u26a0\ufe0f Sin foto de cierre.";
    r += "\nReporte listo.";
    return r;

  } catch (error) {
    console.error("ERROR_CERRAR_TURNO", error);
    return mensajes.errorConexion();
  }
}

async function cmdTurno(telefono, operador) {
  const turno = await getTurnoAbierto(operador.id);
  if (!turno) return "\u2705 Sin turno abierto.\nManda INICIO para abrir uno.";

  const equipo = await getEquipoById(turno.equipo_id);
  const horas = ((Date.now() - new Date(turno.inicio).getTime()) / 3600000).toFixed(1);

  let r = "\ud83d\ude9b Turno abierto\n\n";
  r += "M\u00e1quina: " + (equipo ? (equipo.alias || equipo.codigo) : "N/A") + "\n";
  r += "Hor\u00f3metro: " + turno.horometro_inicio + " hrs\n";
  r += "Abierto hace: " + horas + " hrs\n";
  r += "Folio: " + turno.folio;

  const session = await getSession(telefono);
  if (session && session.paso === "esperando_reanuda") {
    r += "\n\n\u26a0\ufe0f Paro activo.\nManda REANUDA o FIN.";
  } else {
    r += "\n\nManda PARO, FIN o AYUDA.";
  }
  return r;
}

async function cmdPerfil(operador) {
  const asignaciones = await getAsignacionesOperador(operador.id);
  const turno = await getTurnoAbierto(operador.id);

  let p = "\ud83d\udc64 " + operador.nombre;
  asignaciones.forEach(function(a) {
    const eq = a.equipos;
    p += "\n\n\ud83d\ude9b " + (eq.alias || eq.codigo);
    if (eq.alias && eq.codigo) p += " \u00b7 " + eq.codigo;
  });

  if (turno) {
    const hrs = ((Date.now() - new Date(turno.inicio).getTime()) / 3600000).toFixed(1);
    p += "\n\n\u26a1 Turno abierto hace " + hrs + " hrs";
  } else {
    p += "\n\n\u2705 Sin turno abierto";
  }
  return p;
}

async function cmdCambiarPin(telefono, operador) {
  await saveSession(telefono, "operador", "esperando_nuevo_pin", {
    operador_id: operador.id
  });
  return "Manda tu nuevo PIN de 4 a 6 d\u00edgitos.\nEjemplo: 5678";
}

function cmdAyuda() {
  return "\ud83d\udcda Comandos:\n\nINICIO \u2192 Abrir turno\nPARO \u2192 Reportar paro\nFALLA \u2192 Reportar falla\nREANUDA \u2192 Continuar\nFIN \u2192 Cerrar turno\nTURNO \u2192 Ver turno actual\nPERFIL \u2192 Tu informaci\u00f3n\nPIN \u2192 Cambiar PIN\nCANCELAR \u2192 Salir de flujo\nAYUDA \u2192 Esta ayuda";
}

module.exports = { handleOperadorMessage };
