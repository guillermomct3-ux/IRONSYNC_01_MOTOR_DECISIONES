const RESPUESTAS = {
  INICIO_OK: (maquina, serie, horometro, folio) =>
    `✅ Turno ABIERTO\n🚜 ${maquina} — ${serie}\n⏱ Número del contador: ${horometro}\n📋 Folio: ${folio}\n\n📷 Manda foto del contador para mayor precisión.\nEnvía "fin ${maquina} [número del contador]" al terminar.`,

  DOBLE_INICIO: (maquina, horometro) =>
    `⚠️ Ya tienes un turno ABIERTO.\n🚜 ${maquina} — Contador: ${horometro}\n\nEnvía "fin ${maquina} [número del contador]" para cerrarlo primero.`,

  FIN_OK: (horas, acumulado, folio) =>
    `✅ Turno CERRADO\n📋 Folio: ${folio}\n⏱ Horas turno: ${horas}\n📊 Acumulado hoy: ${acumulado} hrs\n\n📷 Manda foto del contador final.`,

  FIN_RANGO_INUSUAL: (horas, acumulado, inicial, final) =>
    `✅ Turno CERRADO\n⏱ Horas turno: ${horas}\n📊 Acumulado hoy: ${acumulado} hrs\n\n⚠️ Ulises fue notificado: diferencia de ${horas} hrs es mayor a 24. Contador ${inicial} → ${final}.\n\n📷 Manda foto del contador final.`,

  FIN_SIN_INICIO: () =>
    `⚠️ No tienes turno abierto.\nManda INICIO [equipo] [número del contador] para comenzar.`,

  HOROMETRO_FALTANTE: () =>
    `❌ Falta el número del contador.\nEjemplo: "INICIO CAT336 5678"`,

  HOROMETRO_INVALIDO: () =>
    `❌ El número del contador debe ser un número.\nEjemplo: "INICIO CAT336 5678"`,

  HOROMETRO_MENOR: (final, inicial) =>
    `❌ El contador final (${final}) no puede ser menor al inicial (${inicial}).\nRevisa el número e intenta de nuevo.`,

  ZOMBIE_ALERTA: (maquina, horas) =>
    `🚨 ALERTA: Turno de ${maquina} lleva ${horas} horas abierto sin cerrar. Verificar con operador.`,

  REPORTE_TURNO_ABIERTO: (minutos, horometroInicial) =>
    `⏱ Turno en curso.\nNúmero del contador inicial: ${horometroInicial}\nTiempo transcurrido: ${minutos} minutos.`,

  REPORTE_SIN_TURNO: () =>
    `ℹ️ No tienes turno abierto hoy.\nManda INICIO [equipo] [número del contador] para comenzar.`,

  SOLICITA_FOTO_INICIO: (maquina) =>
    `📷 Envía foto del contador de ${maquina} para vincularla al turno.`,

  SOLICITA_FOTO_FIN: (maquina) =>
    `📷 Envía foto del contador final de ${maquina} para cerrar con evidencia.`,
};

module.exports = RESPUESTAS;