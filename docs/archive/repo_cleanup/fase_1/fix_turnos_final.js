const fs = require("fs");
let c = fs.readFileSync("turnos.js", "utf8");

// PATH 1: Rango inusual
const oldPath1 = `}).eq('id', turno.supabase_id).then(({ error }) => {
        if (error) console.error('Error Supabase fin inusual:', error.message);
        else console.log('Turno cerrado en Supabase (rango inusual):', turno.supabase_id);
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

const newPath1 = `}).eq('id', turno.supabase_id).select('empresa_id').single();

    if (updateResult1 && updateResult1.error) {
      console.error('Error Supabase fin inusual:', updateResult1.error.message);
    } else {
      console.log('Turno cerrado en Supabase (rango inusual):', turno.supabase_id);
      dispararPDFAsync({
        turnoId: turno.supabase_id,
        folio: turno.folio,
        empresaId: (updateResult1 && updateResult1.data) ? updateResult1.data.empresa_id : null,
        telefonoOperador: from,
        horasHorometro: horasTurno,
        horometroFinal: horometroFinal,
        timestampFin: new Date().toISOString(),
        equipoTexto: turno.maquina || "equipo"
      });
    }`;

if (c.includes(oldPath1)) {
  c = c.replace(oldPath1, newPath1);
  console.log("OK: PATH 1 (rango inusual) corregido");
} else {
  console.log("WARN: PATH 1 no encontrado");
}

// PATH 2: Cierre normal
const oldPath2 = `}).eq('id', turno.supabase_id).then(({ error }) => {
      if (error) console.error('Error Supabase fin:', error.message);
      else console.log('Turno cerrado en Supabase:', turno.supabase_id);
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

const newPath2 = `}).eq('id', turno.supabase_id).select('empresa_id').single();

    if (updateResult2 && updateResult2.error) {
      console.error('Error Supabase fin:', updateResult2.error.message);
    } else {
      console.log('Turno cerrado en Supabase:', turno.supabase_id);
      dispararPDFAsync({
        turnoId: turno.supabase_id,
        folio: turno.folio,
        empresaId: (updateResult2 && updateResult2.data) ? updateResult2.data.empresa_id : null,
        telefonoOperador: from,
        horasHorometro: horasTurno,
        horometroFinal: horometroFinal,
        timestampFin: new Date().toISOString(),
        equipoTexto: turno.maquina || "equipo"
      });
    }`;

if (c.includes(oldPath2)) {
  c = c.replace(oldPath2, newPath2);
  console.log("OK: PATH 2 (cierre normal) corregido");
} else {
  console.log("WARN: PATH 2 no encontrado");
}

fs.writeFileSync("turnos.js", c, "utf8");
console.log("OK: turnos.js guardado");