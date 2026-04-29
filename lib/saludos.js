const refranes = [
  "Despacio que voy de prisa",
  "El que madruga, Dios lo ayuda... y el horometro tambien.",
  "Camaron que se duerme, se lo lleva la excavadora.",
  "No hay atajo que no tenga su barranco.",
  "Al que buen arbol se arrima, buena sombra lo cobija... y buena maquina, buen turno.",
  "Mas vale un contador bien leido que cien horas de discusion.",
  "El que parte y reparte, se queda con la mejor parte del turno.",
  "A cada quien su maquina y a cada maquina su operador.",
  "No dejes para manana lo que el horometro ya registro hoy.",
  "Pueblo chico, infierno grande... obra chica, trabajo grande.",
  "El que con tierra trabaja, tierra levanta.",
  "Agua que no has de beber, dejala correr... turno que no cierra, problema viene.",
  "Al mal tiempo, buena excavadora.",
  "Mas vale tarde que nunca... pero el turno abre a tiempo.",
  "El que siembra dieselazos, recoge paros."
];

const chistes = [
  "Yo Felipe y con tenis... y tu, como amaneciste?",
  "Sabe cuanto pesa una excavadora? Lo suficiente para no cargarla a mano.",
  "El operador y la CAT: inseparables desde las 7 AM.",
  "Mi jefa me pregunto que hago todo el dia. Le mande foto del horometro.",
  "La excavadora no miente. Tu tampoco, verdad?",
  "Dicen que el trabajo dignifica. Yo solo se que el horometro no para.",
  "Lunes otra vez? La maquina tampoco entiende de calendarios.",
  "El operador nuevo pregunto donde esta el freno. Le senale el horometro.",
  "La CAT tiene mas horas que yo de sueno.",
  "Mi otra familia es la excavadora: siempre ahi, siempre hambrienta de diesel."
];

const pensamientos = [
  "El buen operador no mira el reloj. Mira el horometro.",
  "Cada turno bien cerrado es una discusion que no tendras despues.",
  "La obra no espera, pero el registro si debe ser exacto.",
  "Mejor un numero bien anotado que mil palabras explicando.",
  "El que registra hoy, cobra sin pelear manana.",
  "La maquina trabaja. El horometro lo demuestra.",
  "No hay trabajo invisible si hay registro.",
  "Un turno sin foto es un turno que nadie vio.",
  "El tiempo que ahorras en anotar bien lo pierdes triplicado en aclaraciones.",
  "La honestidad del operador empieza en el horometro.",
  "Cada hora registrada es una hora que no se puede disputar.",
  "El campo no tiene testigos. El sistema si.",
  "Trabaja como si el contador estuviera mirando. Porque si esta.",
  "El buen turno se cierra solo cuando los numeros cuadran.",
  "No hay obra tan dura como la de andar aclarando horas despues."
];

const maquinaRef = [
  "La CAT arranco. El horometro tambien. Buen turno.",
  "Tu maquina ya esta caliente. Solo falta el numero del contador.",
  "El CAT336 no falla si tu no fallas. Listo?",
  "Hoy la maquina y tu van a hacer equipo. Como siempre.",
  "El horometro nunca miente, nunca descansa, nunca se equivoca.",
  "Tu CAT lleva mas horas encima que muchos. Cuidala bien.",
  "La maquina da lo que recibe. Dale un buen turno.",
  "Arrancar la CAT es facil. Registrar bien el turno tambien.",
  "El CAT y tu, jefe. Nadie mas necesita saber el resto.",
  "La maquina ya esta lista. Y el contador?"
];

const diasEspeciales = {
  1: [
    "Lunes de nuevo. La maquina no sabe que es lunes, pero tu si.",
    "Lunes: el horometro no descanso el fin de semana. Tu si, verdad?"
  ],
  5: [
    "Viernes, jefe. Un buen cierre de turno y la semana queda lista.",
    "Ultimo dia de la semana. El horometro tambien merece llegar bien al viernes."
  ]
};

const clima = {
  calor: [
    "Con este calor hasta la CAT suda. Hidratate tu tambien, jefe.",
    "Sol a todo lo que da. La maquina aguanta. Tu tambien."
  ],
  lluvia: [
    "Esta lloviendo, pero el turno no para. Cuidate ahi afuera.",
    "Con lluvia o sin ella, el horometro sigue corriendo."
  ]
};

const quincena = [
  "Hoy es quincena. El mejor motivador para cerrar bien el turno.",
  "Dia de cobro. Y para cobrar bien, hay que registrar bien."
];

const poolGeneral = [...refranes, ...chistes, ...pensamientos, ...maquinaRef];

function seleccionar(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getSaludoDelDia() {
  const hoy = new Date();
  const diaSemana = hoy.getDay();
  const diaMes = hoy.getDate();

  if (diaMes === 1 || diaMes === 15) return seleccionar(quincena);
  if (diasEspeciales[diaSemana]) return seleccionar(diasEspeciales[diaSemana]);

  const diaDelAnio = Math.floor(
    (hoy - new Date(hoy.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
  );
  return poolGeneral[diaDelAnio % poolGeneral.length];
}

function getMensajeInicioSimple(ultimoHorometro) {
  const saludo = getSaludoDelDia();
  const horometroFmt = Number(ultimoHorometro).toLocaleString("es-MX");
  return saludo + "\n\nUltimo contador: " + horometroFmt + " hrs.\nConfirmas? Manda OK o el numero nuevo.";
}

function getMensajeInicio(operadorNombre, equipoAlias, ultimoHorometro) {
  const saludo = getSaludoDelDia();
  const maquinaNombre = equipoAlias || "tu maquina";
  const horometroFmt = Number(ultimoHorometro).toLocaleString("es-MX");
  return saludo + "\n\nLa ultima vez dejaste la " + maquinaNombre + " en " + horometroFmt + " hrs.\nArrancamos con ese numero? Manda OK o el contador actual.";
}

function getSaludoClima(tipo) {
  if (tipo === "calor") return seleccionar(clima.calor);
  if (tipo === "lluvia") return seleccionar(clima.lluvia);
  return null;
}

module.exports = {
  getSaludoDelDia,
  getMensajeInicio,
  getMensajeInicioSimple,
  getSaludoClima,
  refranes,
  chistes,
  pensamientos,
  maquinaRef,
  diasEspeciales,
  clima,
  quincena,
  poolGeneral
};
