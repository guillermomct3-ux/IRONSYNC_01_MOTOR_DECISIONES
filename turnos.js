const { dispararPDFAsync } = require("./lib/pdfAuto");
const fs = require('fs');
const path = require('path');
const validadores = require('./validadores');
const supabase = require('./lib/supabaseClient');
const {
  INICIO_OK, DOBLE_INICIO, FIN_OK, FIN_RANGO_INUSUAL,
  FIN_SIN_INICIO, HOROMETRO_FALTANTE, HOROMETRO_INVALIDO,
  HOROMETRO_MENOR, ZOMBIE_ALERTA, REPORTE_TURNO_ABIERTO, REPORTE_SIN_TURNO,
  PARO_MENU_TIPO, PARO_MENU_SUBTIPO_CLI, PARO_REGISTRADO,
  FALLA_SOLICITA_DESC, FALLA_REGISTRADA, REANUDA_OK,
  PARO_DOBLE, REANUDA_SIN_PARO, PARO_SIN_TURNO,
  FALLA_SIN_TURNO, REANUDA_SIN_TURNO, MENU_TIMEOUT, SELECCION_INVALIDA
} = require('./respuestas');

const ARCHIVO_TURNOS = path.join(__dirname, 'turnos_activos.json');

const SUPERVISORES = {
  '523338155867': 'Ulises'
};

// PERSISTENCIA

function cargarTurnos() {
  if (!fs.existsSync(ARCHIVO_TURNOS)) return [];
  try {
    const data = fs.readFileSync(ARCHIVO_TURNOS, 'utf8');
    console.log('JSON leido:', data);
    return JSON.parse(data);
  } catch (e) {
    console.error('turnos_activos.json corrupto. Creando respaldo.');
    fs.renameSync(ARCHIVO_TURNOS, ARCHIVO_TURNOS + '.corrupto');
    return [];
  }
}

function guardarTurnos(turnos) {
  fs.writeFileSync(ARCHIVO_TURNOS, JSON.stringify(turnos, null, 2));
  console.log('turnos_activos.json actualizado. Total turnos:', turnos.length);
}

// UTILIDADES

function obtenerTurnoActivo(turnos, from) {
  return turnos.find(t => t.from === from && t.estado === 'ABIERTO');
}

async function generarFolioSupabase(maquina, fecha) {
  const [yyyy, mm, dd] = fecha.split('-');
  const patron = 'IS-' + yyyy + '-' + mm + '-' + dd + '-' + maquina + '-';
  try {
    const { data: existentes, error } = await supabase
      .from('turnos').select('folio').like('folio', patron + '%');
    if (error) {
      console.error('Error consultando folios:', error.message);
      return patron + String(Date.now()).slice(-3);
    }
    const consecutivo = (existentes ? existentes.length : 0) + 1;
    return patron + String(consecutivo).padStart(3, '0');
  } catch (err) {
    console.error('Error generando folio:', err.message);
    return patron + String(Date.now()).slice(-3);
  }
}

function calcularAnomalias(turno) {
  const anomalias = [];
  if (turno.horometro_final && turno.horometro_inicial) {
    const horasHorometro = Math.round((turno.horometro_final - turno.horometro_inicial) * 10) / 10;
    const horasTiempo = turno.horas_turno || 0;
    const diff = Math.abs(horasHorometro - horasTiempo);
    if (diff > 1) {
      anomalias.push('Discrepancia: contador ' + horasHorometro + ' hrs vs tiempo ' + horasTiempo + ' hrs');
    }
  }
  if (turno.sin_foto_inicio) anomalias.push('Sin foto de contador de inicio');
  if (turno.sin_foto_fin) anomalias.push('Sin foto de contador de cierre');
  if (turno.horas_turno > 12) anomalias.push('Turno de ' + turno.horas_turno + ' hrs - requiere revision');
  if (turno.reportado_por) anomalias.push('Registrado por ' + turno.reportado_por + ' - operador: ' + (turno.operador_nombre || 'no declarado'));
  turno.tiene_anomalia = anomalias.length > 0;
  return anomalias;
}

function procesarFoto(from, imageUrl) {
  const turnos = cargarTurnos();
  const turno = turnos.find(t =>
    t.from === from && t.estado === 'ABIERTO' &&
    (t.estado_foto === 'esperando_foto_inicio' || t.estado_foto === 'esperando_foto_fin')
  );
  if (!turno) return 'No hay turno abierto esperando foto. Manda INICIO primero.';
  if (turno.estado_foto === 'esperando_foto_inicio') {
    turno.foto_inicio_url = imageUrl;
    turno.sin_foto_inicio = false;
    turno.estado_foto = null;
    guardarTurnos(turnos);
    if (turno.supabase_id) {
      supabase.from('turnos').update({ foto_inicio_url: imageUrl, sin_foto_inicio: false, estado_foto: null }).eq('id', turno.supabase_id).then(({ error }) => {
        if (error) console.error('Error Supabase foto inicio:', error.message);
      });
    }
    return 'Foto de inicio vinculada a ' + turno.maquina + '.\nPara cerrar manda FIN ' + turno.maquina + ' [numero del contador]';
  }
  if (turno.estado_foto === 'esperando_foto_fin') {
    turno.foto_fin_url = imageUrl;
    turno.sin_foto_fin = false;
    turno.estado_foto = null;
    guardarTurnos(turnos);
    if (turno.supabase_id) {
      supabase.from('turnos').update({ foto_fin_url: imageUrl, sin_foto_fin: false, estado_foto: null }).eq('id', turno.supabase_id).then(({ error }) => {
        if (error) console.error('Error Supabase foto fin:', error.message);
      });
    }
    return 'Foto de cierre vinculada a ' + turno.maquina + '.\nTurno completo con evidencia.';
  }
}

// INICIO / FIN / HORAS

async function buscarSerie(maquina) {
  try {
    const tokens = maquina.toLowerCase().match(/[a-z]+|\d+/g) || [];
    const { data: todos, error } = await supabase.from('equipos').select('nombre, numero_serie');
    if (error || !todos || todos.length === 0) return 'SIN-SERIE';
    const encontrado = todos.find(equipo => {
      const nombreLower = equipo.nombre.toLowerCase();
      return tokens.every(token => nombreLower.includes(token));
    });
    if (!encontrado) return 'SIN-SERIE';
    return encontrado.numero_serie || 'SIN-SERIE';
  } catch (err) {
    console.error('Error buscando serie:', err.message);
    return 'SIN-SERIE';
  }
}

async function buscarNombreOperador(from) {
  try {
    const telefonoLimpio = from.replace('whatsapp:', '');
    const { data: op, error } = await supabase
      .from('operadores').select('nombre, telefono').eq('telefono', telefonoLimpio).single();
    if (op && op.nombre) return op.nombre;
  } catch (e) {
    console.error('Error buscando operador:', e.message);
  }
  return null;
}

async function procesarInicioTurno(from, texto) {
  console.log('procesarInicioTurno iniciado para ' + from + ' | texto: "' + texto + '"');
  try {
    if (!validadores.validarEstructuraComando(texto)) {
      return 'Un mensaje, un comando.\nManda INICIO y FIN por separado.';
    }

    const turnos = cargarTurnos();
    const horometro = validadores.extraerHorometro(texto);
    const { maquina } = validadores.extraerDatosMaquina(texto);

    if (validadores.tieneTurnoAbierto(turnos, from)) {
      const turnoActivo = validadores.obtenerTurnoAbierto(turnos, from);
      return DOBLE_INICIO(turnoActivo.maquina, turnoActivo.horometro_inicial);
    }

    if (!horometro) return HOROMETRO_FALTANTE();

    // FIX 7: Validar que la maquina existe en tabla equipos
    const { data: equipo, error: equipoError } = await supabase
      .from('equipos').select('alias').eq('alias', maquina).single();

    if (!equipo || equipoError) {
      return 'Equipo "' + maquina + '" no reconocido.\nHabla con Ulises.';
    }

    // FIX 16: Verificar turno abierto contra Supabase
    const { data: turnoExistente } = await supabase
      .from('turnos').select('folio, operador_telefono')
      .eq('maquina', maquina).eq('estado', 'ABIERTO').single();

    if (turnoExistente) {
      const esPropio = turnoExistente.operador_telefono === from;
      return esPropio
        ? 'Ya tienes turno abierto en ' + maquina + '.\nFolio: ' + turnoExistente.folio
        : maquina + ' tiene turno abierto por otro operador.\nHabla con Ulises.';
    }

    const serie = await buscarSerie(maquina);
    const hoy = new Date().toISOString().split('T')[0];
    const folio = await generarFolioSupabase(maquina, hoy);

    const esSupervisor = !!SUPERVISORES[from.replace('whatsapp:+', '')];

    let nombreOperador = esSupervisor ? SUPERVISORES[from.replace('whatsapp:+', '')] : null;
    if (!nombreOperador) {
      nombreOperador = await buscarNombreOperador(from);
    }

    const nuevoTurno = {
      from,
      estado: 'ABIERTO',
      fecha: hoy,
      folio,
      maquina,
      serie,
      empresa_id: null,
      horometro_inicial: horometro,
      horometro_final: null,
      unidades_horometro: null,
      horas_turno: null,
      validado_por_diferencia: false,
      timestamp_inicio: new Date().toISOString(),
      timestamp_fin: null,
      foto_inicio_url: null,
      foto_fin_url: null,
      sin_foto_inicio: true,
      sin_foto_fin: true,
      estado_foto: 'esperando_foto_inicio',
      reportado_por: nombreOperador || null,
      operador_nombre: nombreOperador || null,
      tiene_anomalia: false,
      paros: [],
      paro_activo: null,
      esperando_confirmacion_horometro: false,
      esperando_horometro_corregido: false,
      horometro_pendiente: null,
      esperando_nombre_operador: false,
      supabase_id: null
    };

    turnos.push(nuevoTurno);

    let turnoSupabaseData = null;
    // FIX: Buscar empresa_id del operador
    let empresaIdTurno = null;
    try {
      const { data: opData } = await supabase
        .from('operadores')
        .select('empresa_id')
        .eq('telefono', from.replace('whatsapp:', ''))
        .maybeSingle();
      if (opData && opData.empresa_id) empresaIdTurno = opData.empresa_id;
    } catch(e) {}
    if (!empresaIdTurno) {
      try {
        const { data: userData } = await supabase
          .from('usuarios')
          .select('empresa_id')
          .eq('telefono', from.replace('whatsapp:', ''))
          .maybeSingle();
        if (userData && userData.empresa_id) empresaIdTurno = userData.empresa_id;
      } catch(e) {}
    }
    console.log('[EMPRESA_ID_LOOKUP]', { from: from, empresaId: empresaIdTurno });
    nuevoTurno.empresa_id = empresaIdTurno;
    try {
      const { data: turnoSupabase, error: errorInsert } = await supabase
        .from('turnos')
        .insert({
          empresa_id: empresaIdTurno,
          operador_id: from,
          maquina: maquina,
          serie: serie,
          horometro_inicio: horometro,
          estado: 'ABIERTO',
          inicio: new Date().toISOString(),
          fecha_turno: hoy,
          folio: folio,
          operador_nombre: nombreOperador || null,
          operador_telefono: from,
          sin_foto_inicio: true,
          sin_foto_fin: true,
          estado_foto: 'esperando_foto_inicio',
          reportado_por: nombreOperador || null,
          tiene_anomalia: false,
          origen_datos: 'whatsapp'
        })
        .select('id, empresa_id')
        .single();

      if (errorInsert) {
        if (errorInsert.code === '23505') {
          return 'Ya hay un turno abierto en ' + maquina + '.\nCierra el turno actual antes de abrir otro.';
        }
        console.error('Error guardando turno en Supabase:', errorInsert.message);
        return 'Error al crear turno. Intenta de nuevo o habla con Ulises.';
      } else {
        nuevoTurno.supabase_id = turnoSupabase.id;
        nuevoTurno.empresa_id = turnoSupabase.empresa_id || empresaIdTurno;
        turnoSupabaseData = turnoSupabase;
        console.log('Turno guardado en Supabase:', turnoSupabase.id);
      }
    } catch (err) {
      console.error('Error Supabase inicio:', err.message);
    }

    // FIX 11: Supervisor abre turno â€” preguntar operador
    if (esSupervisor) {
      nuevoTurno.esperando_nombre_operador = true;
      guardarTurnos(turnos);
      if (nuevoTurno.supabase_id) {
        supabase.from('turnos').update({ esperando_nombre_operador: true }).eq('id', nuevoTurno.supabase_id).then(() => {});
      }
      return 'Turno ABIERTO - ' + maquina + '\nFolio: ' + folio + '\nQuien opero este equipo?\nResponde con el nombre del operador.';
    }

    guardarTurnos(turnos);
    console.log('Turno creado:', JSON.stringify(nuevoTurno, null, 2));

    return INICIO_OK(maquina, serie, horometro, folio);

  } catch (error) {
    console.error('Error en procesarInicioTurno:', error.message);
    throw error;
  }
}

async function procesarFinTurno(from, texto) {
  if (!validadores.validarEstructuraComando(texto)) {
    return 'Un mensaje, un comando.\nManda INICIO y FIN por separado.';
  }

  const turnos = cargarTurnos();

  // FIX 18: Verificar turno abierto contra JSON local Y Supabase
  if (!validadores.tieneTurnoAbierto(turnos, from)) {
    const { data: turnoSupabase } = await supabase
      .from('turnos').select('*')
      .eq('operador_telefono', from).eq('estado', 'ABIERTO').single();

    if (!turnoSupabase) {
      return FIN_SIN_INICIO();
    }

    const turnoRecuperado = {
      from: from,
      estado: 'ABIERTO',
      fecha: turnoSupabase.fecha_turno,
      folio: turnoSupabase.folio,
      maquina: turnoSupabase.maquina,
      serie: turnoSupabase.serie || 'SIN-SERIE',
      empresa_id: turnoSupabase.empresa_id || null,
      horometro_inicial: turnoSupabase.horometro_inicio,
      horometro_final: null,
      unidades_horometro: null,
      horas_turno: null,
      validado_por_diferencia: false,
      timestamp_inicio: turnoSupabase.inicio,
      timestamp_fin: null,
      foto_inicio_url: turnoSupabase.foto_inicio_url || null,
      foto_fin_url: null,
      sin_foto_inicio: turnoSupabase.sin_foto_inicio !== false,
      sin_foto_fin: true,
      estado_foto: 'esperando_foto_fin',
      reportado_por: turnoSupabase.reportado_por || null,
      operador_nombre: turnoSupabase.operador_nombre || null,
      tiene_anomalia: false,
      paros: [],
      paro_activo: null,
      esperando_confirmacion_horometro: false,
      esperando_horometro_corregido: false,
      horometro_pendiente: null,
      esperando_nombre_operador: false,
      supabase_id: turnoSupabase.id
    };
    turnos.push(turnoRecuperado);
    guardarTurnos(turnos);
    console.log('Turno recuperado de Supabase:', turnoSupabase.folio);
  }

  const horometroFinal = validadores.extraerHorometro(texto);
  if (horometroFinal === null) return HOROMETRO_FALTANTE();
  if (isNaN(horometroFinal)) return HOROMETRO_INVALIDO();

  const turno = validadores.obtenerTurnoAbierto(turnos, from);

  if (horometroFinal < turno.horometro_inicial) {
    return HOROMETRO_MENOR(horometroFinal, turno.horometro_inicial);
  }

  if (horometroFinal === turno.horometro_inicial) {
    turno.esperando_confirmacion_horometro = true;
    turno.horometro_pendiente = horometroFinal;
    guardarTurnos(turnos);
    return 'El numero del contador final (' + horometroFinal + ') es igual al inicial (' + turno.horometro_inicial + ').\nEs correcto? Responde SI o NO.';
  }

  const unidades = horometroFinal - turno.horometro_inicial;
  const horasTurno = Math.round(Math.max(0, unidades) * 10) / 10;

  // FIX 3: Rechazar turnos mayores a 24 hrs
  if (horasTurno > 24) {
    return 'El turno reporta ' + horasTurno + ' hrs. Eso es mas de un dia.\nRevisa el numero del contador e intenta de nuevo.';
  }

  if (!validadores.esRangoRazonable(turno.horometro_inicial, horometroFinal)) {
    turno.estado = 'CERRADO';
    turno.horometro_final = horometroFinal;
    turno.unidades_horometro = unidades;
    turno.horas_turno = horasTurno;
    turno.validado_por_diferencia = true;
    turno.timestamp_fin = new Date().toISOString();
    turno.alerta_rango = true;
    turno.estado_foto = 'esperando_foto_fin';
    calcularAnomalias(turno);
    guardarTurnos(turnos);

    if (turno.supabase_id) {
      supabase.from('turnos').update({
        horometro_fin: horometroFinal, horas_horometro: horasTurno, horas_turno: horasTurno,
        estado: 'CERRADO', fin: new Date().toISOString(), tiene_anomalia: true, estado_foto: 'esperando_foto_fin'
      }).eq('id', turno.supabase_id).then(({ error }) => {
        if (error) console.error('Error Supabase fin inusual:', error.message);
        else console.log('Turno cerrado en Supabase (rango inusual):', turno.supabase_id);
      });
    }

    // PDF AUTOMATICO (fire and forget) - rango inusual
    dispararPDFAsync({
      turnoId: turno.supabase_id,
      folio: turno.folio,
      empresaId: turno.empresa_id || null,
      telefonoOperador: from,
      horasHorometro: horasTurno,
      horometroFinal: horometroFinal,
      timestampFin: new Date().toISOString(),
      equipoTexto: turno.maquina || "equipo"
    });

    const turnosActualizados = cargarTurnos();
    const acumulado = validadores.calcularAcumuladoHoy(turnosActualizados, from);
    return FIN_RANGO_INUSUAL(horasTurno, acumulado, turno.horometro_inicial, horometroFinal);
  }

  turno.estado = 'CERRADO';
  turno.horometro_final = horometroFinal;
  turno.unidades_horometro = unidades;
  turno.horas_turno = horasTurno;
  turno.validado_por_diferencia = true;
  turno.timestamp_fin = new Date().toISOString();
  turno.estado_foto = 'esperando_foto_fin';
  calcularAnomalias(turno);
  guardarTurnos(turnos);

  if (turno.supabase_id) {
    supabase.from('turnos').update({
      horometro_fin: horometroFinal, horas_horometro: horasTurno, horas_turno: horasTurno,
      estado: 'CERRADO', fin: new Date().toISOString(), tiene_anomalia: turno.tiene_anomalia, estado_foto: 'esperando_foto_fin'
    }).eq('id', turno.supabase_id).then(({ error }) => {
      if (error) console.error('Error Supabase fin:', error.message);
      else console.log('Turno cerrado en Supabase:', turno.supabase_id);
    });
  }

  // PDF AUTOMATICO (fire and forget)
  dispararPDFAsync({
    turnoId: turno.supabase_id,
    folio: turno.folio,
    empresaId: turno.empresa_id || null,
    telefonoOperador: from,
    horasHorometro: horasTurno,
    horometroFinal: horometroFinal,
    timestampFin: new Date().toISOString(),
    equipoTexto: turno.maquina || "equipo"
  });

  const turnosActualizados = cargarTurnos();
  const acumulado = validadores.calcularAcumuladoHoy(turnosActualizados, from);
  return FIN_OK(horasTurno, acumulado, turno.folio);
}

async function procesarReporteHoras(from) {
  const turnos = cargarTurnos();
  if (!validadores.tieneTurnoAbierto(turnos, from)) {
    return REPORTE_SIN_TURNO();
  }
  const turno = validadores.obtenerTurnoAbierto(turnos, from);
  const ahora = new Date();
  const inicio = new Date(turno.timestamp_inicio);
  const minutos = Math.round((ahora - inicio) / 60000);
  return REPORTE_TURNO_ABIERTO(minutos, turno.horometro_inicial);
}

// CONFIRMACION HOROMETRO

function estaEsperandoConfirmacion(from) {
  const turnos = cargarTurnos();
  const turno = obtenerTurnoActivo(turnos, from);
  if (!turno) return false;
  return turno.esperando_confirmacion_horometro === true;
}

function estaEsperandoHorometroCorregido(from) {
  const turnos = cargarTurnos();
  const turno = obtenerTurnoActivo(turnos, from);
  if (!turno) return false;
  return turno.esperando_horometro_corregido === true;
}

function procesarConfirmacionHorometro(from, texto) {
  const textoNorm = texto.toLowerCase().trim();
  const turnos = cargarTurnos();
  const turno = obtenerTurnoActivo(turnos, from);
  if (!turno || !turno.esperando_confirmacion_horometro) return null;

  if (textoNorm === 'si' || textoNorm === 'sÃ­') {
    const horometroFinal = turno.horometro_pendiente;
    const unidades = horometroFinal - turno.horometro_inicial;
    const horasTurno = 0;

    turno.estado = 'CERRADO';
    turno.horometro_final = horometroFinal;
    turno.unidades_horometro = unidades;
    turno.horas_turno = horasTurno;
    turno.validado_por_diferencia = true;
    turno.timestamp_fin = new Date().toISOString();
    turno.estado_foto = 'esperando_foto_fin';
    turno.esperando_confirmacion_horometro = false;
    turno.horometro_pendiente = null;
    calcularAnomalias(turno);
    guardarTurnos(turnos);

    if (turno.supabase_id) {
      supabase.from('turnos').update({
        horometro_fin: horometroFinal, horas_horometro: 0, horas_turno: 0,
        estado: 'CERRADO', fin: new Date().toISOString(), tiene_anomalia: turno.tiene_anomalia, estado_foto: 'esperando_foto_fin'
      }).eq('id', turno.supabase_id).then(({ error }) => {
        if (error) console.error('Error Supabase confirmacion:', error.message);
        else console.log('Turno cerrado en Supabase (confirmacion):', turno.supabase_id);
      });
    }

    const turnosActualizados = cargarTurnos();
    const acumulado = validadores.calcularAcumuladoHoy(turnosActualizados, from);
    return FIN_OK(horasTurno, acumulado, turno.folio);
  }

  if (textoNorm === 'no') {
    turno.esperando_confirmacion_horometro = false;
    turno.esperando_horometro_corregido = true;
    guardarTurnos(turnos);
    return 'Envia el numero del contador correcto:';
  }

  return null;
}

function procesarHorometroCorregido(from, texto) {
  const turnos = cargarTurnos();
  const turno = obtenerTurnoActivo(turnos, from);
  if (!turno || !turno.esperando_horometro_corregido) return null;

  const horometro = validadores.extraerHorometro(texto);
  if (horometro === null || isNaN(horometro)) {
    return 'Numero no valido. Envia solo el numero del contador:';
  }
  if (horometro < turno.horometro_inicial) {
    return HOROMETRO_MENOR(horometro, turno.horometro_inicial) + '\nEnvia el numero correcto:';
  }
  if (horometro === turno.horometro_inicial) {
    return 'El numero sigue siendo igual al inicial (' + turno.horometro_inicial + '). Envia un numero mayor:';
  }

  const unidades = horometro - turno.horometro_inicial;
  const horasTurno = Math.round(Math.max(0, unidades) * 10) / 10;

  turno.estado = 'CERRADO';
  turno.horometro_final = horometro;
  turno.unidades_horometro = unidades;
  turno.horas_turno = horasTurno;
  turno.validado_por_diferencia = true;
  turno.timestamp_fin = new Date().toISOString();
  turno.estado_foto = 'esperando_foto_fin';
  turno.esperando_horometro_corregido = false;
  calcularAnomalias(turno);
  guardarTurnos(turnos);

  if (turno.supabase_id) {
    supabase.from('turnos').update({
      horometro_fin: horometro, horas_horometro: horasTurno, horas_turno: horasTurno,
      estado: 'CERRADO', fin: new Date().toISOString(), tiene_anomalia: turno.tiene_anomalia, estado_foto: 'esperando_foto_fin'
    }).eq('id', turno.supabase_id).then(({ error }) => {
      if (error) console.error('Error Supabase horometro corregido:', error.message);
      else console.log('Turno cerrado en Supabase (corregido):', turno.supabase_id);
    });
  }

  const turnosActualizados = cargarTurnos();
  const acumulado = validadores.calcularAcumuladoHoy(turnosActualizados, from);
  return FIN_OK(horasTurno, acumulado, turno.folio);
}

// FIX 11: Capturar nombre de operador desde supervisor

function estaEsperandoNombreOperador(from) {
  const turnos = cargarTurnos();
  const turno = turnos.find(t => t.from === from && t.estado === 'ABIERTO' && t.esperando_nombre_operador === true);
  return !!turno;
}

function procesarNombreOperador(from, nombre) {
  const turnos = cargarTurnos();
  const turno = turnos.find(t => t.from === from && t.estado === 'ABIERTO' && t.esperando_nombre_operador === true);
  if (!turno) return null;

  turno.operador_nombre = nombre.trim();
  turno.esperando_nombre_operador = false;
  guardarTurnos(turnos);

  if (turno.supabase_id) {
    supabase.from('turnos').update({
      operador_nombre: nombre.trim(),
      esperando_nombre_operador: false
    }).eq('id', turno.supabase_id).then(() => {});
  }

  return 'Operador registrado: ' + nombre.trim() + '\nTurno ' + turno.maquina + ' asignado correctamente.';
}

// PARO / FALLA / REANUDA

function procesarParo(_, from) {
  const turnos = cargarTurnos();
  const turno = obtenerTurnoActivo(turnos, from);
  if (!turno) return PARO_SIN_TURNO;
  if (!turno.paros) turno.paros = [];
  if (turno.paro_activo && turno.paro_activo.estado !== null) {
    return PARO_DOBLE;
  }
  turno.paro_activo = {
    estado: 'esperando_tipo', tipo: null, subtipo: null, motivo: null,
    timestamp_inicio: new Date().toISOString(), timestamp_estado: new Date().toISOString()
  };
  guardarTurnos(turnos);
  return PARO_MENU_TIPO;
}

function procesarFalla(_, from) {
  const turnos = cargarTurnos();
  const turno = obtenerTurnoActivo(turnos, from);
  if (!turno) return FALLA_SIN_TURNO;
  if (!turno.paros) turno.paros = [];
  if (turno.paro_activo && turno.paro_activo.estado !== null) {
    return PARO_DOBLE;
  }
  turno.paro_activo = {
    estado: 'esperando_descripcion_falla', tipo: 'ARR', subtipo: null, motivo: null,
    timestamp_inicio: new Date().toISOString(), timestamp_estado: new Date().toISOString()
  };
  guardarTurnos(turnos);
  return FALLA_SOLICITA_DESC;
}

function procesarSeleccionMenu(_, from, seleccion) {
  const turnos = cargarTurnos();
  const turno = obtenerTurnoActivo(turnos, from);
  if (!turno || !turno.paro_activo) return SELECCION_INVALIDA;
  const paro = turno.paro_activo;
  const ahora = new Date();
  const ultimoEstado = new Date(paro.timestamp_estado);
  const minutosTranscurridos = (ahora - ultimoEstado) / (1000 * 60);
  if (minutosTranscurridos > 30) {
    turno.paro_activo = null;
    guardarTurnos(turnos);
    return MENU_TIMEOUT;
  }

  if (paro.estado === 'esperando_tipo') {
    const tipos = {
      '1': { codigo: 'PROG', nombre: 'Programado' },
      '2': { codigo: 'CLI', nombre: 'Cliente', sub: true },
      '3': { codigo: 'ARR', nombre: 'Falla del equipo', falla: true },
      '4': { codigo: 'ZG', nombre: 'Clima' },
      '5': { codigo: 'OTRO', nombre: 'Otro' }
    };
    const tipoSeleccionado = tipos[seleccion];
    if (!tipoSeleccionado) return SELECCION_INVALIDA;
    if (tipoSeleccionado.falla) {
      paro.estado = 'esperando_descripcion_falla';
      paro.tipo = 'ARR';
      paro.timestamp_estado = new Date().toISOString();
      guardarTurnos(turnos);
      return FALLA_SOLICITA_DESC;
    }
    if (tipoSeleccionado.sub) {
      paro.estado = 'esperando_subtipo';
      paro.tipo = tipoSeleccionado.codigo;
      paro.timestamp_estado = new Date().toISOString();
      guardarTurnos(turnos);
      return PARO_MENU_SUBTIPO_CLI;
    }
    paro.estado = 'activo';
    paro.tipo = tipoSeleccionado.codigo;
    paro.motivo = tipoSeleccionado.nombre;
    paro.timestamp_estado = new Date().toISOString();
    guardarTurnos(turnos);
    return PARO_REGISTRADO(tipoSeleccionado.nombre);
  }

  if (paro.estado === 'esperando_subtipo') {
    const subtipos = {
      '1': 'Falto diesel', '2': 'Falto material', '3': 'Me instruyeron parar', '4': null
    };
    if (seleccion === '4') {
      paro.estado = 'esperando_motivo_otro';
      paro.timestamp_estado = new Date().toISOString();
      guardarTurnos(turnos);
      return 'Describe brevemente que paso:';
    }
    const motivo = subtipos[seleccion];
    if (!motivo) return SELECCION_INVALIDA;
    paro.estado = 'activo';
    paro.motivo = motivo;
    paro.timestamp_estado = new Date().toISOString();
    guardarTurnos(turnos);
    return PARO_REGISTRADO(motivo);
  }

  return SELECCION_INVALIDA;
}

function procesarTextoLibreParo(_, from, texto) {
  const turnos = cargarTurnos();
  const turno = obtenerTurnoActivo(turnos, from);
  if (!turno || !turno.paro_activo) return null;
  const paro = turno.paro_activo;
  const ahora = new Date();
  const ultimoEstado = new Date(paro.timestamp_estado);
  const minutosTranscurridos = (ahora - ultimoEstado) / (1000 * 60);
  if (minutosTranscurridos > 30) {
    turno.paro_activo = null;
    guardarTurnos(turnos);
    return MENU_TIMEOUT;
  }
  if (paro.estado === 'esperando_descripcion_falla') {
    paro.estado = 'activo';
    paro.motivo = texto.trim();
    paro.timestamp_estado = new Date().toISOString();
    guardarTurnos(turnos);
    return FALLA_REGISTRADA(texto.trim());
  }
  if (paro.estado === 'esperando_motivo_otro') {
    paro.estado = 'activo';
    paro.motivo = texto.trim();
    paro.timestamp_estado = new Date().toISOString();
    guardarTurnos(turnos);
    return PARO_REGISTRADO(texto.trim());
  }
  return null;
}

function procesarReanuda(_, from) {
  const turnos = cargarTurnos();
  const turno = obtenerTurnoActivo(turnos, from);
  if (!turno) return REANUDA_SIN_TURNO;
  if (!turno.paro_activo || turno.paro_activo.estado === null) {
    return REANUDA_SIN_PARO;
  }
  const paro = turno.paro_activo;
  if (paro.estado !== 'activo') {
    return 'Tienes un paro pendiente de completar. Responde primero a la pregunta anterior.';
  }
  const inicio = new Date(paro.timestamp_inicio);
  const fin = new Date();
  const duracionMs = fin - inicio;
  const duracionMinutos = Math.round(duracionMs / (1000 * 60));
  const horas = Math.floor(duracionMinutos / 60);
  const minutos = duracionMinutos % 60;

  if (!turno.paros) turno.paros = [];
  turno.paros.push({
    tipo: paro.tipo, motivo: paro.motivo,
    timestamp_inicio: paro.timestamp_inicio, timestamp_fin: fin.toISOString(),
    duracion_minutos: duracionMinutos, duracion_horas: Math.round((duracionMinutos / 60) * 10) / 10
  });
  turno.paro_activo = null;
  guardarTurnos(turnos);

  if (turno.supabase_id) {
    const esCobrable = paro.tipo === 'CLI';
    supabase.from('turno_eventos').insert({
      turno_id: turno.supabase_id, tipo_evento: 'PARO_' + (paro.tipo || 'UNKNOWN'),
      motivo: paro.motivo, timestamp_inicio: paro.timestamp_inicio, timestamp_fin: fin.toISOString(),
      duracion_min: duracionMinutos, es_cobrable: esCobrable, clasificado_por: 'operador'
    }).then(({ error }) => {
      if (error) console.error('Error Supabase evento paro:', error.message);
      else console.log('Evento paro guardado en Supabase:', paro.tipo, paro.motivo);
    });
  }

  return REANUDA_OK(horas, minutos);
}

function tieneParoActivo(_, from) {
  const turnos = cargarTurnos();
  const turno = obtenerTurnoActivo(turnos, from);
  if (!turno || !turno.paro_activo) return false;
  return turno.paro_activo.estado !== null;
}

function estaEnFlujoMenu(_, from) {
  const turnos = cargarTurnos();
  const turno = obtenerTurnoActivo(turnos, from);
  if (!turno || !turno.paro_activo) return false;
  const estado = turno.paro_activo.estado;
  return estado === 'esperando_tipo' || estado === 'esperando_subtipo' ||
         estado === 'esperando_descripcion_falla' || estado === 'esperando_motivo_otro';
}

// ZOMBIES

function verificarZombies(twilioClient, numeroOrigen) {
  const turnos = cargarTurnos();
  turnos.forEach(turno => {
    if (turno.estado === 'ABIERTO' && validadores.esTurnoZombie(turno)) {
      const ahora = new Date();
      const inicio = new Date(turno.timestamp_inicio);
      const horas = Math.round((ahora - inicio) / (1000 * 60 * 60));
      const mensaje = ZOMBIE_ALERTA(turno.maquina, horas);
      console.log('TURNO ZOMBIE DETECTADO:', mensaje);
      if (twilioClient && numeroOrigen) {
        twilioClient.messages.create({
          body: mensaje, from: numeroOrigen, to: turno.from
        }).catch(err => {
          console.error('Error enviando alerta zombie:', err.message);
        });
      }
    }
  });
}

// EXPORTS

module.exports = {
  cargarTurnos,
  guardarTurnos,
  procesarInicioTurno,
  procesarFinTurno,
  procesarReporteHoras,
  procesarFoto,
  calcularAnomalias,
  verificarZombies,
  procesarParo,
  procesarFalla,
  procesarReanuda,
  procesarSeleccionMenu,
  procesarTextoLibreParo,
  tieneParoActivo,
  estaEnFlujoMenu,
  estaEsperandoConfirmacion,
  estaEsperandoHorometroCorregido,
  procesarConfirmacionHorometro,
  procesarHorometroCorregido,
  estaEsperandoNombreOperador,
  procesarNombreOperador
};
