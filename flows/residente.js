// ============================================================
// flows/residente.js
// Flujo completo para residente: disputas, revocaci�n de PIN
// ============================================================
const { saveSession, getSession, clearSession } = require('../lib/sesiones');
const supabase = require('../lib/supabaseClient');
// bcrypt se carga lazy para evitar crash si falta el modulo

async function handleResidenteMessage(telefono, mensaje, mediaUrl) {
  const msg = (mensaje || '').trim().toUpperCase();
  const session = await getSession(telefono);

  // --- COMANDO REVOCAR PIN ---------------------------------
  if (msg === 'REVOCAR PIN') {
    await saveSession(telefono, 'residente', 'esperando_pin_actual', {
      accion: 'revocar'
    });
    return 'Para revocar tu PIN actual, primero ingresa el PIN que usas ahora.';
  }

  // --- COMANDO DISPUTAR ------------------------------------
  if (msg.startsWith('DISPUTAR ')) {
    const folio = msg.split(' ')[1];
    if (!folio) {
      return 'Formato: DISPUTAR IS-XXXXX';
    }

    const { data: turno } = await supabase
      .from('turnos')
      .select('id, folio')
      .eq('folio', folio)
      .maybeSingle();

    if (!turno) {
      return 'No se encontro el turno con folio ' + folio + '.';
    }

    await saveSession(telefono, 'residente', 'esperando_motivo_disputa', {
      folio: folio,
      turno_id: turno.id
    });
    return 'Explica brevemente por que rechazas este turno (max 200 caracteres):';
  }

  // --- FLUJO DE SESI�N -------------------------------------
  if (session && session.rol === 'residente') {

    // Esperando motivo de disputa
    if (session.paso === 'esperando_motivo_disputa') {
      const motivo = mensaje.trim().slice(0, 200);

      await supabase.from('disputas').insert({
        turno_id: session.datos.turno_id,
        folio: session.datos.folio,
        residente_telefono: telefono,
        motivo: motivo,
        estado: 'pendiente'
      });

      await clearSession(telefono);
      return 'Disputa registrada.\nEl contratista ha sido notificado.\nMotivo: "' + motivo + '"';
    }

    // Esperando PIN actual para revocar
    if (session.paso === 'esperando_pin_actual') {
      const { data: residente } = await supabase
        .from('residentes')
        .select('pin_hash')
        .eq('telefono', telefono)
        .maybeSingle();

      if (!residente) {
        await clearSession(telefono);
        return 'No se encontro tu registro. Contacta a Mota-Engil.';
      }

      const valido = await require('bcryptjs').compare(mensaje, residente.pin_hash);
      if (!valido) {
        await clearSession(telefono);
        return 'PIN incorrecto. Operacion cancelada.';
      }

      await saveSession(telefono, 'residente', 'esperando_nuevo_pin', {});
      return 'PIN correcto.\nEscribe tu NUEVO PIN de 4 digitos:';
    }

    // Esperando nuevo PIN
    if (session.paso === 'esperando_nuevo_pin') {
      const nuevoPin = mensaje.trim();
      if (!/^\d{4,6}$/.test(nuevoPin)) {
        return 'El PIN debe tener 4 a 6 digitos. Intenta otra vez.';
      }

      const nuevoHash = await require('bcryptjs').hash(nuevoPin, 12);
      await supabase
        .from('residentes')
        .update({ pin_hash: nuevoHash })
        .eq('telefono', telefono);

      await clearSession(telefono);
      return 'PIN actualizado correctamente.';
    }
  }

  return 'Comando no reconocido.\n\nPuedes usar:\n- DISPUTAR IS-XXXXX\n- REVOCAR PIN';
}

module.exports = { handleResidenteMessage };
