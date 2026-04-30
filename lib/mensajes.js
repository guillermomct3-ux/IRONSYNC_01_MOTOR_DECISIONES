module.exports = {
  ok: function(msg) {
    return "? " + msg;
  },
  error: function(msg) {
    return "? " + msg;
  },
  warn: function(msg) {
    return "?? " + msg;
  },
  noEntendi: function() {
    return "No entendí.\n\n" +
      "Manda INICIO para abrir turno\n" +
      "Manda AYUDA para opciones\n" +
      "Manda FIN para cerrar turno";
  },
  noRegistrado: function() {
    return "Tu número no está registrado.\n" +
      "Habla con tu jefe para que te dé de alta.";
  },
  errorConexion: function() {
    return "Algo falló.\n" +
      "Intenta otra vez en un momento.\n" +
      "Si no funciona, habla con tu jefe.";
  },
  sesionExpirada: function() {
    return "Se perdió la conversación.\n" +
      "Manda INICIO para empezar de nuevo.";
  },
  horometroInvalido: function() {
    return "El número no se ve bien.\n" +
      "Revísalo y mándalo otra vez.\n" +
      "Ejemplo: 5690";
  },
  pinInvalido: function() {
    return "Manda 4 números.\n" +
      "Ejemplo: 3847";
  },
  telefonoInvalido: function() {
    return "El número no se ve bien.\n" +
      "Ejemplo: 5539954872";
  },
  demasadosIntentos: function() {
    return "Espera 15 minutos e intenta otra vez.";
  },
  sinFoto: function() {
    return "Toma foto del contador con tu celular.\n" +
      "Si no puedes, manda el número que ves.";
  }
};
