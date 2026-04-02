const { processEvents } = require('./engine.js');
console.log("ENGINE PATH:", require.resolve('./engine.js'))
const fs = require('fs');

// =========================================================
// DATOS DE PRUEBA
// =========================================================
const eventos = [
    {
        evidence: { photo: "foto_009.jpg" },
        operator: { nombre: "ramon torres" },
        timestamp: "2026-03-25T11:15:00.000Z"
    },
    {
        evidence: { photo: "foto_009.jpg" },
        operator: { nombre: "ramon torres" },
        timestamp: "2026-03-25T11:15:00.000Z"
    },
    {
        evidence: { photo: "foto_009.jpg" },
        operator: { nombre: "ramon torres" },
        timestamp: "2026-03-25T11:15:00.000Z"
    },
    {
        evidence: { photo: null },
        operator: { nombre: "ramon torres" },
        timestamp: "2026-03-25T11:20:00.000Z"
    },
    {
        evidence: { photo: "foto_010.jpg" },
        operator: { nombre: "" },
        timestamp: "2026-03-25T11:25:00.000Z"
    }
];

// =========================================================
// PROCESAMIENTO (ÚNICA FUENTE DE VERDAD)
// =========================================================
const resultado = processEvents(eventos);

// =========================================================
// REPORTE
// =========================================================
const reporte = {
    resumen: resultado.resumen,
    cierre: resultado.cierre,
    anomalias: resultado.anomalias,
    detalles: resultado.detalles.map(d => ({
        event_id: d.event_id,
        occurred_at: d.timestamp?.iso || d.timestamp,
        operator_name: d.timeline_event?.operator_name,
        evidence: d.raw_input,
        pipeline_status: d.pipeline_status,
        es_cobrable: d.es_cobrable,
        motivo: d.motivo,
        recovery_deadline: d.recovery_deadline || null,
    }))
};

// Guardar archivo
fs.writeFileSync('reporte_turno.json', JSON.stringify(reporte, null, 2));

// Consola
console.log("\n===== RESUMEN =====");
console.log(JSON.stringify(reporte.resumen, null, 2));

console.log("\n===== CIERRE =====");
console.log(JSON.stringify(reporte.cierre, null, 2));

console.log("\n===== ANOMALÍAS =====");
console.log(JSON.stringify(reporte.anomalias, null, 2));

console.log("\n===== DETALLE =====");
reporte.detalles.forEach(d => {
    console.log(JSON.stringify(d, null, 2));
});

console.log("\n✅ Reporte generado: reporte_turno.json");
