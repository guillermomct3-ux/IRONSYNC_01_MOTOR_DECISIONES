const LOGBOOK_RESPUESTAS = {
  pideHorometroInicio: function(maquina, ultimo) {
    return maquina + ' lista.\n' +
      (ultimo !== null && ultimo !== undefined
        ? 'Ultimo cierre: ' + ultimo + ' horas.\n'
        : 'Sin cierre previo registrado.\n') +
      'Manda el contador actual.';
  },

  inicioOk: function(turno) {
    return 'Turno ABIERTO\n' +
      turno.maquina + '\n' +
      'Contador: ' + turno.horometro_inicio + '\n' +
      'Folio: ' + turno.folio;
  },

  finOk: function(turno, horas) {
    return 'Turno CERRADO\n' +
      turno.maquina + '\n' +
      'Folio: ' + turno.folio + '\n' +
      turno.horometro_inicio + ' -> ' + turno.horometro_fin + ' = ' + horas + ' horas\n\n' +
      'Si tienes foto del contador, mandala por WhatsApp.';
  },

  relevoOk: function(turnoNuevo, horasAnterior) {
    return 'Relevo registrado\n' +
      turnoNuevo.maquina + '\n' +
      'Contador: ' + turnoNuevo.horometro_inicio + '\n' +
      'Tu folio: ' + turnoNuevo.folio + '\n' +
      'Turno anterior: ' + horasAnterior + ' horas (cerrado por relevo)\n\n' +
      'Ulises fue notificado.';
  },

  relevoTemprano: function(maquina, minutos) {
    return maquina + ' tiene turno abierto hace ' + minutos + ' minutos.\n' +
      'Confirmas relevo? Responde SI o NO.';
  },

  relevoParcial: function() {
    return 'Relevo parcial registrado.\n' +
      'El turno anterior fue cerrado, pero hubo problema al abrir el nuevo.\n' +
      'Ulises fue notificado.';
  },

  relevoBloqueadoPatron: function() {
    return 'Multiples relevos detectados en esta maquina.\n' +
      'Por seguridad, contacta a Ulises antes de continuar.';
  },

  operadorNoAutorizado: function() {
    return 'Tu numero no esta registrado. Habla con tu supervisor.';
  },

  empresaIdNullStop: function() {
    return 'ERROR CRITICO\n' +
      'Tu cuenta no tiene empresa asignada.\n' +
      'Contacta URGENTE con Ulises.\n' +
      'No podras iniciar turnos hasta resolverlo.';
  },

  empresaIdInvalido: function() {
    return 'Error de configuracion empresa.\nContacta con Ulises.';
  },

  equipoNoEncontrado: function(maquina) {
    return 'Equipo "' + maquina + '" no encontrado. Verifica o habla con Ulises.';
  },

  horometroInvalido: function() {
    return 'El contador debe ser un numero. Ejemplo: 5000 o 5000.5';
  },

  horometroMenor: function(actual, anterior) {
    return 'Contador menor al anterior.\n' +
      'Anterior: ' + anterior + '\n' +
      'Recibido: ' + actual + '\n' +
      'Verifica el contador.';
  },

  horometroRegresivo: function(actual, anterior, maquina) {
    return 'Contador retrocedio en ' + maquina + '.\n' +
      'Anterior: ' + anterior + '\n' +
      'Recibido: ' + actual + '\n' +
      'Esto no es posible. Habla con Ulises.';
  },

  turnoPropioYaAbierto: function(turno) {
    return 'Ya tienes turno abierto en ' + turno.maquina + '.\n' +
      'Folio: ' + turno.folio + '\n' +
      'Para cerrar: FIN ' + turno.maquina + ' [contador]';
  },

  finSinTurno: function() {
    return 'No encontre turno abierto para cerrar. Verifica maquina o habla con Ulises.';
  },

  turnoYaCerrado: function() {
    return 'El turno ya fue cerrado por otro operador. Intenta de nuevo.';
  },

  raceConditionRelevo: function() {
    return 'Otro operador cerro este turno simultaneamente. Intenta de nuevo.';
  },

  turnoAnteriorNoEncontrado: function() {
    return 'No se encontro el turno anterior. Intenta de nuevo o habla con Ulises.';
  },

  errorGeneral: function() {
    return 'Error procesando turno. Intenta de nuevo o habla con Ulises.';
  },

  sesionExpirada: function() {
    return 'Sesion expirada. Escanea el QR de nuevo o manda INICIO.';
  }
};

function respuestaLogbookDesdeResultado(resultado) {
  if (!resultado) return LOGBOOK_RESPUESTAS.errorGeneral();
  switch (resultado.code) {
    case 'INICIO_OK':
      return LOGBOOK_RESPUESTAS.inicioOk(resultado.turno);
    case 'FIN_OK':
      return LOGBOOK_RESPUESTAS.finOk(resultado.turno, resultado.horas);
    case 'RELEVO_OK':
      return LOGBOOK_RESPUESTAS.relevoOk(resultado.turnoNuevo, resultado.horasAnterior);
    case 'RELEVO_PARCIAL':
      return LOGBOOK_RESPUESTAS.relevoParcial();
    case 'RELEVO_TEMPRANO':
      return LOGBOOK_RESPUESTAS.relevoTemprano(
        resultado.maquina || resultado.turnoAnterior ? resultado.turnoAnterior.maquina : 'La maquina',
        resultado.minutos
      );
    case 'RELEVO_BLOQUEADO_PATRON':
      return LOGBOOK_RESPUESTAS.relevoBloqueadoPatron();
    case 'OPERADOR_NO_AUTORIZADO':
      return LOGBOOK_RESPUESTAS.operadorNoAutorizado();
    case 'EMPRESA_ID_NULL_STOP':
      return LOGBOOK_RESPUESTAS.empresaIdNullStop();
    case 'EMPRESA_ID_INVALIDO':
      return LOGBOOK_RESPUESTAS.empresaIdInvalido();
    case 'EQUIPO_NO_ENCONTRADO':
      return LOGBOOK_RESPUESTAS.equipoNoEncontrado(resultado.maquina || 'solicitado');
    case 'HOROMETRO_REQUERIDO':
    case 'HOROMETRO_INVALIDO':
      return LOGBOOK_RESPUESTAS.horometroInvalido();
    case 'HOROMETRO_MENOR':
      return LOGBOOK_RESPUESTAS.horometroMenor(resultado.horometro, resultado.anterior);
    case 'HOROMETRO_REGRESIVO':
      return LOGBOOK_RESPUESTAS.horometroRegresivo(
        resultado.horometro, resultado.anterior, resultado.maquina
      );
    case 'TURNO_PROPIO_YA_ABIERTO':
      return LOGBOOK_RESPUESTAS.turnoPropioYaAbierto(resultado.turno);
    case 'FIN_SIN_TURNO':
      return LOGBOOK_RESPUESTAS.finSinTurno();
    case 'TURNO_YA_CERRADO':
      return LOGBOOK_RESPUESTAS.turnoYaCerrado();
    case 'RACE_CONDITION_RELEVO':
      return LOGBOOK_RESPUESTAS.raceConditionRelevo();
    case 'TURNO_ANTERIOR_NO_ENCONTRADO':
      return LOGBOOK_RESPUESTAS.turnoAnteriorNoEncontrado();
    case 'ERROR_SUPABASE':
      return LOGBOOK_RESPUESTAS.errorGeneral();
    default:
      return LOGBOOK_RESPUESTAS.errorGeneral();
  }
}

module.exports = { LOGBOOK_RESPUESTAS: LOGBOOK_RESPUESTAS, respuestaLogbookDesdeResultado: respuestaLogbookDesdeResultado };
