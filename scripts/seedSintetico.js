// ============================================================
// IRONSYNC — Seed Sintético DPM v2.0
// Tarifas reales, sin descuento comida, E1-E10
// es_sintetico = true en todos los registros
// ============================================================

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const FECHA_INICIO = new Date('2026-03-15');
const FECHA_FIN = new Date('2026-04-30');

const EQUIPOS = [
    {
        id: '5ae93112-cfa4-4a84-a62d-27c046173ced',
        nombre: 'Camion Articulado Cat 740',
        tarifa: 600,
        horometro: 3200.0,
        fecha_entrada: new Date('2026-03-15'),
        mantenimiento: ['2026-03-28', '2026-04-18']
    },
    {
        id: '1bd18c6a-0a65-4030-84e9-193acb89a353',
        nombre: 'Cargador Frontal Cat 966M',
        tarifa: 800,
        horometro: 1850.0,
        fecha_entrada: new Date('2026-03-15'),
        mantenimiento: ['2026-03-25', '2026-04-15']
    },
    {
        id: '03844f57-6a68-4bba-a973-8e5c0398a4a5',
        nombre: 'Tractor Orugas Cat D8T',
        tarifa: 1200,
        horometro: 4100.0,
        fecha_entrada: new Date('2026-03-15'),
        mantenimiento: ['2026-04-01', '2026-04-22']
    },
    {
        id: '41951a93-8ac3-4e77-b3dd-7777e268c99e',
        nombre: 'Motoniveladora Cat 140H',
        tarifa: 1000,
        horometro: 2750.0,
        fecha_entrada: new Date('2026-03-15'),
        mantenimiento: ['2026-03-30', '2026-04-20']
    },
    {
        id: '655c8d06-4844-4a8a-96d5-ddd316f9702a',
        nombre: 'Excavadora Cat 320 GC',
        tarifa: 400,
        horometro: 950.0,
        fecha_entrada: new Date('2026-04-01'),
        mantenimiento: ['2026-04-16']
    }
];

const OPERADORES = [
    '+523338155867',
    '+523338155868',
    '+523338155869'
];

const DIAS_FESTIVOS = ['2026-04-02', '2026-04-03'];

function randomFloat(min, max) {
    return Math.round((min + Math.random() * (max - min)) * 10) / 10;
}

function generarTurnos() {
    const turnos = [];
    let fechaActual = new Date(FECHA_INICIO);

    while (fechaActual <= FECHA_FIN) {
        const fechaStr = fechaActual.toISOString().slice(0, 10);
        const esDomingo = fechaActual.getDay() === 0;
        const esFestivo = DIAS_FESTIVOS.includes(fechaStr);

        if (esDomingo || esFestivo) {
            fechaActual.setDate(fechaActual.getDate() + 1);
            continue;
        }

        for (const equipo of EQUIPOS) {
            if (fechaActual < equipo.fecha_entrada) continue;
            if (equipo.mantenimiento.includes(fechaStr)) continue;

            const rand = Math.random();
            let horas, observaciones, escenario;

            if (rand < 0.07) {
                // E2: Falla mecanica
                horas = randomFloat(2, 6);
                observaciones = 'Equipo detenido por falla mecanica.';
                escenario = 'E2';
            } else if (rand < 0.12) {
                // E5: Turno corto
                horas = randomFloat(4, 7);
                observaciones = 'Turno reducido por condiciones de obra.';
                escenario = 'E5';
            } else if (rand < 0.17) {
                // E9: Lluvia
                horas = randomFloat(3, 6);
                observaciones = 'Paro por lluvia intensa en obra.';
                escenario = 'E9';
            } else if (rand < 0.22) {
                // E10: Espera material
                horas = randomFloat(2, 5);
                observaciones = 'Equipo en espera por falta de material.';
                escenario = 'E10';
            } else {
                // E1: Turno normal
                horas = randomFloat(7.5, 8.5);
                observaciones = null;
                escenario = 'E1';
            }

            const horometro_inicio = Math.round(equipo.horometro * 10) / 10;
            const horometro_fin = Math.round((equipo.horometro + horas) * 10) / 10;
            equipo.horometro = horometro_fin;

            const operador = OPERADORES[Math.floor(Math.random() * OPERADORES.length)];
            const monto = Math.round(horas * equipo.tarifa * 100) / 100;
            const turno_tipo = Math.random() > 0.7 ? 'nocturno' : 'matutino';

            const inicio = new Date(fechaStr + 'T07:00:00');
            const fin = new Date(fechaStr + 'T' + (7 + horas).toFixed(0).padStart(2, '0') + ':00:00');

            turnos.push({
                equipo_id: equipo.id,
                maquina: equipo.nombre,
                operador_id: operador,
                fecha_turno: fechaStr,
                inicio: inicio.toISOString(),
                fin: fin.toISOString(),
                turno_tipo,
                horometro_inicio,
                horometro_fin,
                horas_turno: horas,
                tarifa_aplicada: equipo.tarifa,
                monto_calculado: monto,
                estado: 'CERRADO',
                observaciones,
                es_sintetico: true,
                origen_datos: 'seed_sintetico_v2',
                _escenario: escenario
            });
        }

        fechaActual.setDate(fechaActual.getDate() + 1);
    }

    return turnos;
}

function validarTurnos(turnos) {
    const errores = [];

    for (let i = 0; i < turnos.length; i++) {
        const t = turnos[i];

        const montoEsperado = Math.round(t.horas_turno * t.tarifa_aplicada * 100) / 100;
        if (Math.abs(t.monto_calculado - montoEsperado) > 0.02) {
            errores.push(`Turno ${i} (${t.equipo_id}): monto incorrecto. Esperado: ${montoEsperado}, Actual: ${t.monto_calculado}`);
        }

        if (t.horometro_fin <= t.horometro_inicio) {
            errores.push(`Turno ${i}: horometro_fin (${t.horometro_fin}) <= inicio (${t.horometro_inicio})`);
        }

        if (t.horas_turno <= 0) {
            errores.push(`Turno ${i}: horas_turno invalidas (${t.horas_turno})`);
        }
    }

    return errores;
}

async function insertarDatos() {
    console.log('Generando turnos sinteticos v2.0...\n');
    const turnos = generarTurnos();
    console.log(`Total turnos generados: ${turnos.length}\n`);

    const conteo = {};
    turnos.forEach(t => {
        conteo[t._escenario] = (conteo[t._escenario] || 0) + 1;
    });
    console.log('Distribucion por escenario:');
    for (const [esc, count] of Object.entries(conteo).sort()) {
        console.log(`  ${esc}: ${count} turnos (${((count / turnos.length) * 100).toFixed(1)}%)`);
    }

    console.log('\nValidando datos...');
    const errores = validarTurnos(turnos);
    if (errores.length > 0) {
        console.error('\nERRORES DE VALIDACION:');
        errores.forEach(e => console.error(`  - ${e}`));
        console.error('\nAbortando. Corregir antes de insertar.');
        return;
    }
    console.log('Validacion OK. Sin errores.\n');

    const LOTE = 20;
    let insertados = 0;
    let erroresInsert = 0;

    for (let i = 0; i < turnos.length; i += LOTE) {
        const lote = turnos.slice(i, i + LOTE).map(t => {
            const { _escenario, ...datos } = t;
            return datos;
        });

        const { error } = await supabase.from('turnos').insert(lote);

        if (error) {
            console.error(`Error lote ${Math.floor(i / LOTE) + 1}:`, error.message);
            erroresInsert += lote.length;
        } else {
            insertados += lote.length;
            process.stdout.write(`\rInsertados: ${insertados}/${turnos.length}`);
        }

        await new Promise(r => setTimeout(r, 300));
    }

    console.log('\n\nRESULTADO FINAL');
    console.log('='.repeat(40));
    console.log(`Insertados: ${insertados}`);
    console.log(`Errores:    ${erroresInsert}`);

    console.log('\nResumen por equipo:');
    for (const equipo of EQUIPOS) {
        const turnosEquipo = turnos.filter(t => t.equipo_id === equipo.id);
        const horas = turnosEquipo.reduce((s, t) => s + t.horas_turno, 0);
        const monto = turnosEquipo.reduce((s, t) => s + t.monto_calculado, 0);
        console.log(`\n  ${equipo.nombre}`);
        console.log(`  Tarifa: $${equipo.tarifa}/hr`);
        console.log(`  Turnos: ${turnosEquipo.length}`);
        console.log(`  Horas:  ${horas.toFixed(1)}`);
        console.log(`  Monto:  $${monto.toLocaleString('es-MX')} MXN`);
    }

    const montoTotal = turnos.reduce((s, t) => s + t.monto_calculado, 0);
    const horasTotal = turnos.reduce((s, t) => s + t.horas_turno, 0);
    console.log('\n' + '='.repeat(40));
    console.log('FLOTA COMPLETA');
    console.log('='.repeat(40));
    console.log(`Horas totales: ${horasTotal.toFixed(1)}`);
    console.log(`Monto total:   $${montoTotal.toLocaleString('es-MX')} MXN`);
    console.log(`Periodo:       15 marzo - 30 abril 2026`);
}

insertarDatos().catch(console.error);