const fs = require("fs");
let c = fs.readFileSync("turnos.js", "utf8");

// 1. Agregar import si no existe
if (!c.includes("dispararPDFAsync")) {
  c = 'const { dispararPDFAsync } = require("./lib/pdfAuto");\n' + c;
  console.log("OK: import agregado en turnos.js");
} else {
  console.log("OK: import ya existia en turnos.js");
}

// 2. Fix path 1: Rango inusual - agregar despues del .then block
const marker1 = "else console.log('Turno cerrado en Supabase (rango inusual):', turno.supabase_id);\n      });\n    }";
const pdfCall1 = `else console.log('Turno cerrado en Supabase (rango inusual):', turno.supabase_id);
      });
    }

    // PDF AUTOMATICO (fire and forget) - rango inusual
    dispararPDFAsync({
      turnoId: turno.supabase_id,
      folio: turno.folio,
      empresaId: null,
      telefonoOperador: from,
      horasHorometro: horasTurno,
      equipoTexto: turno.maquina || "equipo"
    });`;

if (c.includes(marker1)) {
  c = c.replace(marker1, pdfCall1);
  console.log("OK: PDF auto agregado en rango inusual");
} else {
  console.log("WARN: no encontro marker rango inusual");
}

// 3. Fix path 2: Cierre normal - agregar despues del .then block
const marker2 = "else console.log('Turno cerrado en Supabase:', turno.supabase_id);\n    });\n  }";
const pdfCall2 = `else console.log('Turno cerrado en Supabase:', turno.supabase_id);
    });
  }

  // PDF AUTOMATICO (fire and forget)
  dispararPDFAsync({
    turnoId: turno.supabase_id,
    folio: turno.folio,
    empresaId: null,
    telefonoOperador: from,
    horasHorometro: horasTurno,
    equipoTexto: turno.maquina || "equipo"
  });`;

if (c.includes(marker2)) {
  c = c.replace(marker2, pdfCall2);
  console.log("OK: PDF auto agregado en cierre normal");
} else {
  console.log("WARN: no encontro marker cierre normal");
}

fs.writeFileSync("turnos.js", c, "utf8");
console.log("OK: turnos.js guardado");
