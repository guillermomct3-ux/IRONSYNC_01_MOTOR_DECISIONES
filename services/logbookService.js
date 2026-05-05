const supabase = require('../lib/supabaseClient');
const { variantesTelefono, parseHorometro } = require('../lib/logbookUtils');
const { getCached, setCached } = require('../lib/logbookCache');
const { normalizarE164 } = require('../lib/telefono');

if (String(process.env.LOGBOOK_F04_ENABLED || 'false').toLowerCase() === 'true') {
  if (!process.env.ULISES_TELEFONO) {
    console.warn('[LOGBOOK_CRITICAL] ULISES_TELEFONO no configurado.');
  }
  if (!process.env.TWILIO_PHONE_NUMBER) {
    console.warn('[LOGBOOK_CRITICAL] TWILIO_PHONE_NUMBER no configurado.');
  }
}

const ORIGEN = Object.freeze({
  QR: 'qr_legacy',
  MANUAL: 'manual',
  RELEVO_QR: 'relevo_qr',
  RELEVO_MANUAL: 'relevo_manual'
});

const ESTADO = Object.freeze({
  ABIERTO: 'ABIERTO',
  CERRADO: 'CERRADO',
  CERRADO_POR_RELEVO: 'CERRADO_POR_RELEVO',
  ANOMALIA_NO_CIERRE: 'ANOMALIA_NO_CIERRE'
});

const UMBRAL_RELEVO_MINUTOS = 120;

function compactarEquipo(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function calcularHoras(inicio, fin) {
  if (typeof inicio !== 'number' || typeof fin !== 'number') return null;
  if (fin < inicio) return null;
  return Number((fin - inicio).toFixed(2));
}

function esMismoTelefono(a, b) {
  const va = new Set(variantesTelefono(a));
  return variantesTelefono(b).some(function(x) { return va.has(x); });
}

async function buscarOperadorPorTelefono(from) {
  const variantes = variantesTelefono(from);
  const { data, error } = await supabase
    .from('operadores')
    .select('*')
    .in('telefono', variantes)
    .eq('activo', true)
    .maybeSingle();
  if (error) {
    console.error('[LOGBOOK] Error buscando operador:', error.message);
    return null;
  }
  return data;
}

async function buscarUsuarioEmpresaFallback(from) {
  const variantes = variantesTelefono(from);
  const { data, error } = await supabase
    .from('usuarios')
    .select('empresa_id, nombre, telefono')
    .in('telefono', variantes)
    .maybeSingle();
  if (error) {
    console.error('[LOGBOOK] Error buscando usuario fallback:', error.message);
    return null;
  }
  return data;
}

async function resolverEquipo(alias) {
  if (!alias) return null;
  const buscado = String(alias).trim().toUpperCase();
  const buscadoCompact = compactarEquipo(buscado);
  const cached = getCached('equipo_' + buscadoCompact);
  if (cached !== null && cached !== undefined) return cached;

  const { data, error } = await supabase
    .from('equipos')
    .select('*');

  if (error) {
    console.error('[LOGBOOK] Error cargando equipos:', error.message);
    return null;
  }

  const equipos = data || [];
  const encontrado = equipos.find(function(eq) {
    const candidatos = [
      eq.alias, eq.nombre, eq.maquina, eq.equipo,
      eq.numero_serie, eq.serie, eq.eco, eq.economico, eq.modelo
    ];
    return candidatos.some(function(valor) {
      const normalizado = compactarEquipo(valor);
      if (!normalizado) return false;
      return (
        normalizado === buscadoCompact ||
        normalizado.includes(buscadoCompact) ||
        buscadoCompact.includes(normalizado)
      );
    });
  }) || null;

  setCached('equipo_' + buscadoCompact, encontrado);
  return encontrado;
}

async function buscarTurnoAbiertoPorMaquina(maquina) {
  const { data, error } = await supabase
    .from('turnos')
    .select('*')
    .eq('maquina', maquina)
    .eq('estado', ESTADO.ABIERTO)
    .order('inicio', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error('[LOGBOOK] Error buscando turno abierto maquina:', error.message);
    return null;
  }
  return data;
}

async function buscarTurnoAbiertoPropio(params) {
  const variantes = variantesTelefono(params.from);
  const { data, error } = await supabase
    .from('turnos')
    .select('*')
    .in('operador_telefono', variantes)
    .eq('maquina', params.maquina)
    .eq('estado', ESTADO.ABIERTO)
    .order('inicio', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error('[LOGBOOK] Error buscando turno propio:', error.message);
    return null;
  }
  return data;
}

async function buscarUltimoCierre(params) {
  let query = supabase
    .from('turnos')
    .select('horometro_fin, maquina, folio, fin')
    .eq('maquina', params.maquina)
    .in('estado', [ESTADO.CERRADO, ESTADO.CERRADO_POR_RELEVO])
    .not('horometro_fin', 'is', null)
    .order('fin', { ascending: false })
    .limit(1);
  if (params.empresaId) {
    query = query.eq('empresa_id', params.empresaId);
  }
  const { data, error } = await query.maybeSingle();
  if (error) {
    console.error('[LOGBOOK] Error buscando ultimo cierre:', error.message);
    return null;
  }
  return data;
}

async function validarOperacionBase(params) {
  const operador = await buscarOperadorPorTelefono(params.from);

  if (!operador) {
    return { ok: false, code: 'OPERADOR_NO_AUTORIZADO', telefono: params.from };
  }

  let empresaId = operador.empresa_id || null;

  if (!empresaId) {
    const usuarioFallback = await buscarUsuarioEmpresaFallback(params.from);
    empresaId = usuarioFallback ? usuarioFallback.empresa_id : null;
  }

  if (!empresaId && params.maquina) {
    const equipoParaEmpresa = await resolverEquipo(params.maquina);
    if (equipoParaEmpresa && equipoParaEmpresa.empresa_id) {
      empresaId = equipoParaEmpresa.empresa_id;
      console.log('[LOGBOOK] empresa_id obtenido de equipo:', empresaId);
    }
  }

  if (!empresaId) {
    empresaId = process.env.EMPRESA_ID_DEFAULT || null;
    if (empresaId) {
      console.warn('[LOGBOOK] empresa_id desde ENV DEFAULT:', empresaId);
    }
  }

  if (!empresaId || empresaId === 'null') {
    console.error('[LOGBOOK_CRITICAL] empresa_id NULL:', { telefono: params.from, operador_id: operador.id });
    return { ok: false, code: 'EMPRESA_ID_NULL_STOP', operador: operador, telefono: params.from };
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(empresaId)) {
    console.error('[LOGBOOK_CRITICAL] empresa_id formato invalido:', empresaId);
    return { ok: false, code: 'EMPRESA_ID_INVALIDO', operador: operador, telefono: params.from };
  }

  const equipo = await resolverEquipo(params.maquina);

  if (!equipo) {
    return { ok: false, code: 'EQUIPO_NO_ENCONTRADO', operador: operador, empresaId: empresaId, maquina: params.maquina, telefono: params.from };
  }

  if (params.requiereHorometro !== false && (params.horometro === null || params.horometro === undefined)) {
    return { ok: false, code: 'HOROMETRO_REQUERIDO', operador: operador, empresaId: empresaId, equipo: equipo, telefono: params.from };
  }

  if (params.requiereHorometro !== false && typeof params.horometro !== 'number') {
    return { ok: false, code: 'HOROMETRO_INVALIDO', operador: operador, empresaId: empresaId, equipo: equipo, telefono: params.from };
  }

  return { ok: true, operador: operador, empresaId: empresaId, equipo: equipo };
}

async function generarFolioBasico(maquina) {
  const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 9000 + 1000);
  return maquina + '-' + fecha + '-' + random;
}

async function notificarUlises(tipo, datos) {
  try {
    const ULISES_TELEFONO = process.env.ULISES_TELEFONO;
    if (!ULISES_TELEFONO) {
      console.log('[LOGBOOK_NOTIFY] ULISES_TELEFONO no configurado. Skip.');
      return;
    }
    let mensaje = '';
    switch (tipo) {
      case 'RELEVO':
        mensaje = 'INFO RELEVO AUTOMATICO\nMaquina: ' + datos.maquina + '\nOperador anterior: ' + datos.operadorAnterior + '\nNuevo operador: ' + datos.operadorNuevo + '\nHorometro: ' + datos.horometro + '\nHoras turno anterior: ' + datos.horasTurnoAnterior;
        break;
      case 'RELEVO_PARCIAL':
        mensaje = 'ALERTA RELEVO PARCIAL\nMaquina: ' + datos.maquina + '\nOperador anterior: ' + datos.operadorAnterior + '\nNuevo operador: ' + datos.operadorNuevo + '\nHorometro: ' + datos.horometro + '\nProblema: turno anterior cerrado pero fallo apertura nueva.\nError: ' + datos.error + '\nRevision inmediata requerida.';
        break;
      case 'ZOMBIE':
        mensaje = 'ALERTA TURNO SIN CIERRE\nMaquina: ' + datos.maquina + '\nOperador: ' + datos.operador + '\nAbierto desde: ' + datos.inicio;
        break;
      case 'PATRON_SOSPECHOSO':
        mensaje = 'ALERTA PATRON SOSPECHOSO\nMaquina: ' + datos.maquina + '\nOperador: ' + datos.operador + '\nDetalle: ' + datos.mensaje;
        break;
      case 'HOROMETRO_REGRESIVO':
        mensaje = 'ALERTA CRITICA HOROMETRO\nMaquina: ' + datos.maquina + '\nAnterior: ' + datos.horometroAnterior + 'h\nNuevo: ' + datos.horometroNuevo + 'h\nHOROMETRO RETROCEDIO\nRevision URGENTE requerida.';
        break;
      case 'DIFERENCIA_HOROMETRO_ALTA':
        mensaje = 'ALERTA DIFERENCIA HOROMETRO\nMaquina: ' + datos.maquina + '\nDiferencia: ' + datos.diferencia + 'h\nAnterior: ' + datos.horometroAnterior + 'h\nNuevo: ' + datos.horometroNuevo + 'h\nVerificar si es correcto.';
        break;
      default:
        console.log('[LOGBOOK_NOTIFY] Tipo no soportado:', tipo);
        return;
    }
    const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await twilio.messages.create({
      body: mensaje,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: ULISES_TELEFONO
    });
    console.log('[LOGBOOK_NOTIFY] Notificacion enviada:', tipo);
  } catch (error) {
    console.error('[LOGBOOK_NOTIFY] Error:', error.message);
  }
}

async function marcarRelevoParcial(params) {
  try {
    const nota = 'RELEVO_PARCIAL | operador_nuevo=' + params.operadorNuevo + ' | maquina=' + params.maquina + ' | horometro=' + params.horometro + ' | error=' + params.error;
    const { error: updateError } = await supabase
      .from('turnos')
      .update({ tiene_anomalia: true, observaciones: nota })
      .eq('id', params.turnoAnteriorId);
    if (updateError) {
      console.error('[LOGBOOK_RELEVO_PARCIAL] Error marcando anomalia:', updateError.message);
    }
  } catch (err) {
    console.error('[LOGBOOK_RELEVO_PARCIAL] Error inesperado:', err.message);
  }
}

async function verificarPatronRelevoSospechoso(from, maquina) {
  try {
    const hace1Hora = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('turnos')
      .select('operador_telefono, inicio')
      .eq('maquina', maquina)
      .eq('estado', ESTADO.CERRADO_POR_RELEVO)
      .gte('fin', hace1Hora)
      .order('fin', { ascending: false })
      .limit(3);
    if (error || !data || data.length < 2) return false;
    const relevosDelOperador = data.filter(function(t) { return esMismoTelefono(t.operador_telefono, from); });
    return relevosDelOperador.length >= 2;
  } catch (err) {
    console.error('[LOGBOOK] Error verificando patron relevo:', err.message);
    return false;
  }
}

async function iniciarTurnoLogbook(params) {
  console.log('[LOGBOOK_INICIO]', { from: params.from, maquina: params.maquina, horometro: params.horometro, canal: params.canal });

  const validacion = await validarOperacionBase({
    from: params.from, maquina: params.maquina, horometro: params.horometro, requiereHorometro: true
  });
  if (!validacion.ok) return validacion;

  const operador = validacion.operador;
  const empresaId = validacion.empresaId;
  const equipo = validacion.equipo;

  const turnoPropio = await buscarTurnoAbiertoPropio({ from: params.from, maquina: params.maquina });
  if (turnoPropio) {
    return { ok: false, code: 'TURNO_PROPIO_YA_ABIERTO', turno: turnoPropio };
  }

  const turnoAbiertoMaquina = await buscarTurnoAbiertoPorMaquina(params.maquina);
  if (turnoAbiertoMaquina && !esMismoTelefono(turnoAbiertoMaquina.operador_telefono, params.from)) {
    return procesarRelevoLogbook({
      from: params.from, maquina: params.maquina, horometro: params.horometro, canal: params.canal,
      turnoAnterior: turnoAbiertoMaquina, operador: operador, empresaId: empresaId, equipo: equipo
    });
  }

  const ultimoCierre = await buscarUltimoCierre({ maquina: params.maquina, empresaId: empresaId });
  const ultimoHorometro = ultimoCierre ? ultimoCierre.horometro_fin : null;
  if (typeof ultimoHorometro === 'number' && params.horometro < ultimoHorometro) {
    return { ok: false, code: 'HOROMETRO_MENOR', horometro: params.horometro, anterior: ultimoHorometro };
  }

  const hoy = new Date().toISOString().split('T')[0];
  const folio = await generarFolioBasico(params.maquina);

  const payload = {
    empresa_id: empresaId,
    equipo_id: equipo.id || null,
    operador_nombre: operador.nombre || null,
    operador_telefono: normalizarE164(params.from) || params.from,
    maquina: params.maquina,
    serie: equipo.numero_serie || equipo.serie || 'SIN-SERIE',
    horometro_inicio: params.horometro,
    estado: ESTADO.ABIERTO,
    inicio: new Date().toISOString(),
    fecha_turno: hoy,
    folio: folio,
    origen_datos: params.canal,
    sin_foto_inicio: true,
    sin_foto_fin: true,
    estado_foto: 'esperando_foto_inicio',
    tiene_anomalia: false
  };

  const { data, error } = await supabase
    .from('turnos')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    console.error('[LOGBOOK_INICIO] Error Supabase:', error.message);
    return { ok: false, code: 'ERROR_SUPABASE', error: error.message };
  }

  console.log('[LOGBOOK_INICIO] Turno creado:', data.id, data.folio);
  return { ok: true, code: 'INICIO_OK', turno: data };
}

async function cerrarTurnoLogbook(params) {
  console.log('[LOGBOOK_FIN]', { from: params.from, maquina: params.maquina, horometro: params.horometro, canal: params.canal });

  const validacion = await validarOperacionBase({
    from: params.from, maquina: params.maquina, horometro: params.horometro, requiereHorometro: true
  });
  if (!validacion.ok) return validacion;

  const turno = await buscarTurnoAbiertoPropio({ from: params.from, maquina: params.maquina });
  if (!turno) return { ok: false, code: 'FIN_SIN_TURNO' };

  if (params.horometro < turno.horometro_inicio) {
    return { ok: false, code: 'HOROMETRO_MENOR', horometro: params.horometro, anterior: turno.horometro_inicio };
  }

  const horas = calcularHoras(turno.horometro_inicio, params.horometro);

  const { data, error } = await supabase
    .from('turnos')
    .update({
      horometro_fin: params.horometro,
      horas_turno: horas,
      estado: ESTADO.CERRADO,
      fin: new Date().toISOString(),
      cerrado_por: 'operador',
      origen_datos: params.canal
    })
    .eq('id', turno.id)
    .select('*')
    .single();

  if (error) {
    console.error('[LOGBOOK_FIN] Error Supabase:', error.message);
    return { ok: false, code: 'ERROR_SUPABASE', error: error.message };
  }

  console.log('[LOGBOOK_FIN] Turno cerrado:', data.id, data.folio, horas + 'h');
  return { ok: true, code: 'FIN_OK', turno: data, horas: horas, turnoId: data.id, folio: data.folio };
}

async function procesarRelevoLogbook(params) {
  console.log('[LOGBOOK_RELEVO]', { from: params.from, maquina: params.maquina, horometro: params.horometro, turnoAnteriorId: params.turnoAnterior.id, confirmado: params.confirmado });

  if (!params.confirmado) {
    const esSospechoso = await verificarPatronRelevoSospechoso(params.from, params.maquina);
    if (esSospechoso) {
      console.warn('[LOGBOOK_RELEVO] Patron sospechoso:', { from: params.from, maquina: params.maquina });
      await notificarUlises('PATRON_SOSPECHOSO', {
        maquina: params.maquina, operador: params.operador.nombre || params.from,
        mensaje: '2+ relevos en 1 hora por mismo operador'
      });
      return { ok: false, code: 'RELEVO_BLOQUEADO_PATRON', maquina: params.maquina };
    }
  }

  const inicioAnterior = new Date(params.turnoAnterior.inicio);
  const minutosTranscurridos = Math.floor((Date.now() - inicioAnterior.getTime()) / 60000);

  if (!params.confirmado && minutosTranscurridos < UMBRAL_RELEVO_MINUTOS) {
    return {
      ok: false, code: 'RELEVO_TEMPRANO',
      minutos: minutosTranscurridos, requiereConfirmacion: true,
      turnoAnterior: params.turnoAnterior, operador: params.operador, empresaId: params.empresaId, equipo: params.equipo,
      maquina: params.maquina, horometro: params.horometro, canal: params.canal
    };
  }

  if (params.horometro < params.turnoAnterior.horometro_inicio) {
    await notificarUlises('HOROMETRO_REGRESIVO', {
      maquina: params.maquina,
      operadorAnterior: params.turnoAnterior.operador_nombre || params.turnoAnterior.operador_telefono,
      operadorNuevo: params.operador.nombre || params.from,
      horometroAnterior: params.turnoAnterior.horometro_inicio,
      horometroNuevo: params.horometro
    });
    return { ok: false, code: 'HOROMETRO_REGRESIVO', horometro: params.horometro, anterior: params.turnoAnterior.horometro_inicio, maquina: params.maquina };
  }

  const horasAnterior = calcularHoras(params.turnoAnterior.horometro_inicio, params.horometro);
  const origenRelevo = params.canal === ORIGEN.QR || params.canal === 'qr_legacy' ? ORIGEN.RELEVO_QR : ORIGEN.RELEVO_MANUAL;

  const diferencia = params.horometro - params.turnoAnterior.horometro_inicio;
  if (diferencia > 50) {
    await notificarUlises('DIFERENCIA_HOROMETRO_ALTA', {
      maquina: params.maquina,
      operadorAnterior: params.turnoAnterior.operador_nombre || params.turnoAnterior.operador_telefono,
      operadorNuevo: params.operador.nombre || params.from,
      diferencia: diferencia,
      horometroAnterior: params.turnoAnterior.horometro_inicio,
      horometroNuevo: params.horometro
    });
  }

  const { data: turnoVerificado, error: errorVerificacion } = await supabase
    .from('turnos')
    .select('id, estado, operador_telefono')
    .eq('id', params.turnoAnterior.id)
    .single();

  if (errorVerificacion || !turnoVerificado) {
    return { ok: false, code: 'TURNO_ANTERIOR_NO_ENCONTRADO' };
  }

  if (turnoVerificado.estado !== ESTADO.ABIERTO) {
    return { ok: false, code: 'TURNO_YA_CERRADO' };
  }

  const { data: turnoCerrado, error: errorCierre } = await supabase
    .from('turnos')
    .update({
      horometro_fin: params.horometro,
      horas_turno: horasAnterior,
      estado: ESTADO.CERRADO_POR_RELEVO,
      fin: new Date().toISOString(),
      cerrado_por: 'operador_siguiente',
      origen_datos: origenRelevo
    })
    .eq('id', params.turnoAnterior.id)
    .eq('estado', ESTADO.ABIERTO)
    .select('*')
    .single();

  if (errorCierre || !turnoCerrado) {
    console.warn('[LOGBOOK_RELEVO] Race condition:', params.turnoAnterior.id);
    return { ok: false, code: 'RACE_CONDITION_RELEVO' };
  }

  const hoy = new Date().toISOString().split('T')[0];
  const folio = await generarFolioBasico(params.maquina);

  const { data: turnoNuevo, error: errorApertura } = await supabase
    .from('turnos')
    .insert({
      empresa_id: params.empresaId,
      equipo_id: params.equipo.id || null,
      operador_nombre: params.operador.nombre || null,
      operador_telefono: normalizarE164(params.from) || params.from,
      maquina: params.maquina,
      serie: params.equipo.numero_serie || params.equipo.serie || 'SIN-SERIE',
      horometro_inicio: params.horometro,
      estado: ESTADO.ABIERTO,
      inicio: new Date().toISOString(),
      fecha_turno: hoy,
      folio: folio,
      origen_datos: params.canal,
      sin_foto_inicio: true,
      sin_foto_fin: true,
      estado_foto: 'esperando_foto_inicio',
      tiene_anomalia: false
    })
    .select('*')
    .single();

  if (errorApertura) {
    console.error('[LOGBOOK_RELEVO] Error apertura:', errorApertura.message);
    await marcarRelevoParcial({
      turnoAnteriorId: params.turnoAnterior.id, operadorNuevo: params.from,
      maquina: params.maquina, horometro: params.horometro, error: errorApertura.message
    });
    await notificarUlises('RELEVO_PARCIAL', {
      maquina: params.maquina,
      operadorAnterior: params.turnoAnterior.operador_nombre || params.turnoAnterior.operador_telefono,
      operadorNuevo: params.operador.nombre || params.from,
      horometro: params.horometro, error: errorApertura.message
    });
    return { ok: false, code: 'RELEVO_PARCIAL', error: errorApertura.message };
  }

  await notificarUlises('RELEVO', {
    maquina: params.maquina,
    operadorAnterior: params.turnoAnterior.operador_nombre || params.turnoAnterior.operador_telefono,
    operadorNuevo: params.operador.nombre || params.from,
    horometro: params.horometro, horasTurnoAnterior: horasAnterior
  });

  console.log('[LOGBOOK_RELEVO] Completo:', turnoNuevo.id, turnoNuevo.folio);
  return {
    ok: true, code: 'RELEVO_OK',
    turnoAnterior: turnoCerrado, turnoNuevo: turnoNuevo, horasAnterior: horasAnterior,
    turnoId: turnoNuevo.id, folio: turnoNuevo.folio
  };
}

module.exports = {
  ORIGEN: ORIGEN,
  ESTADO: ESTADO,
  parseHorometro: parseHorometro,
  resolverEquipo: resolverEquipo,
  buscarOperadorPorTelefono: buscarOperadorPorTelefono,
  buscarTurnoAbiertoPorMaquina: buscarTurnoAbiertoPorMaquina,
  buscarTurnoAbiertoPropio: buscarTurnoAbiertoPropio,
  buscarUltimoCierre: buscarUltimoCierre,
  validarOperacionBase: validarOperacionBase,
  iniciarTurnoLogbook: iniciarTurnoLogbook,
  cerrarTurnoLogbook: cerrarTurnoLogbook,
  procesarRelevoLogbook: procesarRelevoLogbook,
  notificarUlises: notificarUlises,
  marcarRelevoParcial: marcarRelevoParcial
};
