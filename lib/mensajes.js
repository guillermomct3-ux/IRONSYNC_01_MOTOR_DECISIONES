module.exports = {
  ok: function(msg) {
    return "\u2705 " + msg;
  },
  error: function(msg) {
    return "\u274c " + msg;
  },
  warn: function(msg) {
    return "\u26a0\ufe0f " + msg;
  },
  noEntendi: function() {
    return "No te entend\u00ed.\n\n" +
      "Manda INICIO para turno\n" +
      "Manda AYUDA para opciones\n" +
      "Manda CANCELAR para salir";
  },
  noRegistrado: function() {
    return "Tu n\u00famero no est\u00e1 registrado.\n" +
      "Habla con tu jefe.";
  },
  errorConexion: function() {
    return "Problema de conexi\u00f3n.\n" +
      "Intenta de nuevo en un momento.\n" +
      "Si persiste, contacta a Ulises.";
  },
  sesionExpirada: function() {
    return "La sesi\u00f3n expir\u00f3.\n" +
      "Manda INICIO para empezar de nuevo.";
  }
};
