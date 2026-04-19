const RESPUESTAS = {
  INICIO_OK: (maquina, serie, horometro) =>
    `✅ Turno ABIERTO\n🚜 ${maquina} — ${serie}\n⏱ Horómetro inicial: ${horometro}\n\n📷 Manda foto del horómetro para mayor precisión.\nEnvía "fin horometro XXXX" al terminar.`,

  DOBLE_INICIO: (maquina, horometro) =>
    `⚠️ Ya tienes un turno ABIERTO.\n🚜 ${maquina} — Horómetro: ${horometro}\n\nEnvía "fin horometro XXXX" para cerrarlo primero.`,

  FIN_OK: (horas, acumulado) =>
    `✅ Turno CERRADO\n⏱ Horas turno: ${horas}\n📊 Acumulado hoy: ${acumulado} hrs`,

  FIN_RANGO_INUSUAL: (horas, acumulado, inicial, final) =>
    `✅ Turno CERRADO\n⏱ Horas turno: ${horas}\n📊 Acumulado hoy: ${acumulado} hrs\n\n⚠️ Ulises fue notificado: diferencia de ${horas} hrs es mayor a 24. Horómetro ${inicial} → ${final}.`,

  FIN_SIN_INICIO: () =>
    `⚠️ No tienes turno abierto.\nEnvía "inicio [máquina] serie [serie] horometro [número]" para comenzar.`,

  HOROMETRO_FALTANTE: () =>
    `❌ Falta el horómetro.\nEjemplo: "fin horometro 3278"`,

  HOROMETRO_INVALIDO: () =>
    `❌ El horómetro debe ser un número.\nEjemplo: "fin horometro 3278"`,

  HOROMETRO_MENOR: (final, inicial) =>
    `❌ El horómetro final (${final}) no puede ser menor al inicial (${inicial}).\nRevisa el número e intenta de nuevo.`,

  ZOMBIE_ALERTA: (maquina, horas) =>
    `🚨 ALERTA: Turno de ${maquina} lleva ${horas} horas abierto sin cerrar. Verificar con operador.`,

  REPORTE_TURNO_ABIERTO: (minutos, horometroInicial) =>
    `⏱ Turno en curso.\nHorómetro inicial: ${horometroInicial}\nTiempo transcurrido: ${minutos} minutos.`,

  REPORTE_SIN_TURNO: () =>
    `ℹ️ No tienes turno abierto hoy.\nEnvía "inicio [máquina] serie [serie] horometro [número]" para comenzar.`,
};

module.exports = RESPUESTAS;