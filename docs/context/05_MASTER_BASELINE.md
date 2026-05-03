# IRONSYNC A — MASTER BASELINE v1.0

## Metadata

| Campo | Valor |
|---|---|
| Documento | 05_MASTER_BASELINE.md |
| Fecha | 2026-05-03 |
| Estado | BORRADOR — pendiente revision final |
| Repo | IRONSYNC_01_MOTOR_DECISIONES |
| Commit funcional de referencia | 142c971 |
| Commit documental base | b051b9c |
| Basado en | 04_REBASELINE_REPORT.md + 14_INVENTARIO_RAIZ_REPO.md |
| Autoria | Guillermo + Equipo IronSync |
| Proposito | Convertir el diagnostico del Rebaseline en fuente de verdad operativa para la siguiente fase de ejecucion |

---

## 1. Dictamen ejecutivo - que es IronSync A hoy

IronSync A es una plataforma WhatsApp-first, sin hardware, para convertir la operacion diaria de maquinaria pesada en memoria operativa, evidencia conciliable, control financiero y conocimiento tecnico acumulativo por equipo.

IronSync A no es solamente Logbook.

IronSync A se construye en capas:

1. IS Logbook
2. IS Finanzas
3. IS Gemelo Digital
4. El Inge / GRIMM
5. Verify

El estado actual del repo se clasifica oficialmente como:

IS Logbook Lite / Sprint 0 funcional con deuda tecnica alta

Esto significa:

- existe una vertical funcional real;
- INICIO funciona;
- FIN funciona;
- PDF automatico funciona / no bloquea FIN;
- Twilio WhatsApp funciona;
- Railway funciona;
- Supabase recibe datos;
- pero la arquitectura todavia no esta lista para escalar;
- persiste riesgo de fuente dual JSON + Supabase;
- la raiz del repo tiene deuda tecnica alta;
- IS Finanzas no esta ejecutado en codigo;
- IS Gemelo Digital no esta ejecutado completo en codigo;
- El Inge / GRIMM sigue como capa tecnica futura;
- Verify sigue como capa bilateral futura.

Este Master Baseline convierte el diagnostico del Rebaseline en fuente de verdad operativa.

---

## 2. Que es IS Logbook

IS Logbook es la puerta de entrada operativa y comercial de IronSync A.

Su funcion es capturar evidencia diaria de operacion para convertirla en conciliacion y cobro.

IS Logbook cubre:

- INICIO de turno;
- FIN de turno;
- horometro inicial;
- horometro final;
- fotos;
- paros;
- reanudaciones;
- reportes diarios;
- PDF;
- conciliacion;
- evidencia para cobro.

Estado actual:
IS Logbook Lite / Sprint 0 funcional

IS Logbook Lite ya prueba valor operativo, pero no representa todavia Logbook v1.0 completo.

Logbook v1.0 completo debera incorporar, cuando se apruebe su fase:

- persistencia unica;
- pruebas minimas;
- flujo PARO / REANUDA robusto;
- reglas documentadas de evidencia;
- PDF confiable;
- Dev Pipeline formal;
- Bug Tracker;
- Risk Register;
- criterios de salida verificables.

---

## 3. Que es IS Finanzas

IS Finanzas es la capa que convierte la evidencia operativa de IS Logbook en control financiero.

Su funcion es transformar horas, turnos, evidencia y conciliacion en:

- renta cobrable;
- deuda;
- pagos;
- aging;
- estado de cuenta;
- rentabilidad por equipo;
- rentabilidad por cliente;
- amortizacion real del activo;
- decision de conservar, vender o reemplazar equipo.

Relacion con Logbook:
IS Logbook prueba la operacion.
IS Finanzas calcula el dinero.

Estado actual:
Diseniado conceptualmente.
No ejecutado en codigo.

Regla FROZEN:
IS Finanzas no entra a codigo hasta estabilizar IS Logbook.

---

## 4. Que es IS Gemelo Digital

IS Gemelo Digital es la memoria tecnica, operativa y financiera acumulativa de cada equipo.

Se alimenta de:

- turnos;
- horometros;
- fotos;
- paros;
- fallas;
- reparaciones;
- mantenimientos;
- refacciones;
- costos;
- rentas;
- pagos;
- manuales OEM;
- historial real del activo.

Su funcion es permitir que cada equipo tenga una memoria propia util para operacion, mantenimiento, finanzas y toma de decisiones.

Estado actual:
Nucleo estrategico.
No ejecutado completo en codigo.

Regla FROZEN:
IS Gemelo Digital no entra a codigo hasta definir modelo de eventos y activo.

---

## 5. Que es El Inge / GRIMM

El Inge / GRIMM es la capa tecnica RAG de IronSync A.

Su funcion futura es interpretar manuales OEM y conectarlos con el historial real del equipo.

El Inge / GRIMM debe permitir:

- ingesta de manuales OEM;
- consulta tecnica por WhatsApp;
- interpretacion asistida por IA;
- apoyo cientifico al mecanico;
- vinculo entre manual, falla e historial real;
- mantenimiento preventivo basado en datos acumulados;
- reduccion de dependencia del conocimiento informal no documentado.

Estado actual:
Destino tecnico futuro.
No es prioridad inmediata de ejecucion.

El Inge / GRIMM no fue abandonado. Queda pospuesto hasta estabilizar Logbook y definir el modelo de memoria por activo.

---

## 6. Que es Verify

Verify sera la capa bilateral futura entre arrendador y arrendatario.

Su funcion sera permitir validacion compartida de evidencia, conciliaciones y reportes.

Verify podra cubrir:

- aceptacion o rechazo de evidencia;
- conciliacion bilateral;
- trazabilidad entre partes;
- reduccion de disputas;
- validacion cliente / proveedor;
- preparacion para flujos enterprise.

Estado actual:
Capa futura.
No ejecutada.

Verify no entra a codigo hasta que IS Logbook tenga evidencia confiable y flujo de conciliacion estable.

---

## 7. Estado del repo

El repo actual queda clasificado oficialmente como:

IS Logbook Lite / Sprint 0 funcional con deuda tecnica alta

Estado funcional confirmado:

| Area | Estado |
|---|---|
| INICIO | Funciona |
| FIN | Funciona |
| PDF automatico | Funciona / no bloquea FIN |
| Twilio WhatsApp | Funciona |
| Railway | Funciona |
| Supabase | Recibe datos |
| BUG-001 empresaIdTurno | Cerrado |
| Persistencia unica | Pendiente |
| Limpieza repo | Pendiente |
| Dev Pipeline formal | Pendiente |
| Bug Tracker formal | Pendiente |
| Risk Register formal | Pendiente |

El inventario raiz confirma deuda tecnica alta:

| Metrica | Valor |
|---|---|
| Archivos raiz visibles localmente | 93 |
| Carpetas raiz visibles localmente | 15 |
| TEMPORAL_FIX | 58 |
| DATA_LOCAL | 5 |
| BACKUP | 6 |
| PDF_PRUEBA | 2 |
| DOCUMENTO_ESTADO | 8 |
| DESCONOCIDO / artefactos terminal | 3 |

Interpretacion:

El repo funciona, pero todavia no esta ordenado.
El inventario NO autoriza limpieza.
La limpieza requiere fase posterior aprobada por Guillermo.

---

## 8. Stack vigente

Stack operativo vigente:

| Capa | Tecnologia |
|---|---|
| Backend | Node.js |
| HTTP | Express |
| Canal | Twilio WhatsApp |
| Base de datos | Supabase |
| Storage | Supabase Storage |
| Hosting | Railway |
| Control de versiones | GitHub |
| Memoria oficial | /docs/context |

Este stack se conserva para IS Logbook Lite.

No se decide cambio de stack en este Master Baseline.

Cualquier cambio futuro de stack requiere:

- justificacion tecnica;
- analisis de riesgo;
- revision Red Team;
- aprobacion de Guillermo;
- registro en /docs/context.

---

## 9. Decisiones FROZEN

### Decisiones originales vigentes

Las decisiones originales de gobernanza y contexto siguen vigentes como marco base:

- GitHub es la memoria oficial del proyecto.
- El chat es mesa de trabajo, no fuente de verdad.
- Toda AI debe leer el contexto oficial antes de responder.
- Toda AI debe declarar que archivos leyo.
- Guillermo decide y tiene veto.
- MiMo V2 ejecuta cambios aprobados.
- No se usa git add ..
- No se toca codigo sin Plan del Dia.
- No se hace deploy sin prueba minima.
- No se limpian archivos sin fase aprobada.
- Estado Vivo operativo vive en 01_ESTADO_ACTUAL.yaml.
- 13_CHANGELOG.md registra cambios relevantes.
- Rebaseline diagnostica.
- Master Baseline decide.
- Inventario no autoriza limpieza.
- Toda sesion relevante debe cerrar con actualizacion documental.

### D-034 — Clasificacion del repo actual

El repo actual se clasifica como:
IS Logbook Lite / Sprint 0 funcional con deuda tecnica alta

Estado: FROZEN

### D-035 — C6/C10 como destino arquitectonico

C6/C10 son destino arquitectonico de Logbook robusto, no descripcion exacta del repo actual.

Estado: FROZEN

### D-036 — Supabase como candidata a fuente unica

Supabase sera la candidata principal a fuente unica de verdad, pendiente de diseno formal de persistencia.

Estado: FROZEN

### D-037 — No limpieza sin fase aprobada

No se limpia la raiz del repo sin inventario, clasificacion A/B/C y fase posterior aprobada por Guillermo.

Estado: FROZEN

### D-038 — Archivos temporales como deuda

Todo archivo temporal en raiz se considera deuda tecnica hasta clasificarlo.

Estado: FROZEN

### D-039 — IS Finanzas despues de Logbook

IS Finanzas no entra a codigo hasta estabilizar IS Logbook.

Estado: FROZEN

### D-040 — Gemelo Digital despues de modelo de eventos

IS Gemelo Digital no entra a codigo hasta definir modelo de eventos y activo.

Estado: FROZEN

### D-041 — MiMo V2 trabaja con paquete pegado

MiMo V2 no requiere acceso directo al repo; Guillermo debe pegarle paquete minimo de arranque y contenido exacto antes de ejecucion.

Estado: FROZEN

---

## 10. Riesgos que gobiernan la ejecucion

| ID | Riesgo | Estado | Decision baseline |
|---|---|---|---|
| R-PERSISTENCIA-DUAL | JSON local + Supabase pueden crear split-brain | Abierto | Primer riesgo tecnico a disenar |
| R-CONTEXTO | AIs pierden contexto entre chats | En mitigacion | GitHub /docs/context es memoria oficial |
| R-SCRIPTS-TEMP | 58 fix_*.js pueden confundir ejecucion | Abierto | No borrar; clasificar en fase posterior |
| R-RAIZ-DESORDENADA | 93 archivos raiz visibles localmente | Abierto | Limpieza controlada futura |
| R-DUMP-CODIGO | IRONSYNC_CODIGO_COMPLETO.txt puede crear segunda fuente de verdad | Abierto | Clasificar / archivar |
| R-GIT-FORCE | Artefactos terminal sugieren comandos peligrosos guardados como archivos | Abierto | Fase limpieza controlada |
| R-VERSIONES-DUALES | Variantes de webhook.js sin destino claro | Abierto | Clasificacion futura |

Regla:
Ningun riesgo activo se resuelve por impulso.
Todo riesgo se resuelve mediante documento, plan, aprobacion y ejecucion controlada.

---

## 11. Criterios para salir de IS Logbook Lite

IS Logbook Lite deja de ser provisional cuando cumple:

1. Supabase queda definida como fuente unica de verdad o JSON queda formalmente degradado a cache no autoritativa.
2. INICIO / FIN / PARO / REANUDA tienen prueba minima documentada.
3. PDF automatico no bloquea cierre de turno en 10/10 pruebas.
4. Persistencia y cierre de turno sobreviven reinicio Railway al menos 1 vez.
5. Hay al menos 10 turnos completos INICIO -> FIN sin error critico.
6. Hay al menos 3 equipos distintos probados.
7. Hay al menos 2 operadores o telefonos distintos probados.
8. Hay 0 eventos split-brain observados durante prueba controlada.
9. Tasa de error critico en FIN menor a 1% durante prueba controlada.
10. Bug Tracker formal existe.
11. Risk Register formal existe.
12. Dev Pipeline formal existe.
13. Raiz del repo esta inventariada y la limpieza controlada tiene plan aprobado.
14. Primer turno real DPM queda validado en produccion con Paco o se documenta bloqueo.

El cumplimiento de estos criterios debe reflejarse en:
01_ESTADO_ACTUAL.yaml

---

## 12. Que se ejecuta despues del Master Baseline

Despues de aprobar este Master Baseline, el orden recomendado es:

1. Crear 08_BUG_TRACKER.yaml.
2. Crear 09_RISK_REGISTER.yaml.
3. Crear 11_DEV_PIPELINE.md.
4. Disenar arquitectura de persistencia unica.
5. Disenar plan de limpieza controlada del repo.
6. Crear 02_PRODUCTO_MAPA.md.
7. Crear PRD IS Finanzas.
8. Crear PRD IS Gemelo Digital.
9. Ejecutar fase tecnica de persistencia unica.
10. Ejecutar limpieza controlada del repo.

Guillermo puede modificar este orden por urgencia operativa, siempre que la desviacion quede documentada.

La proxima accion inmediata recomendada es:
08_BUG_TRACKER.yaml

Razon:
Antes de volver a codigo, el equipo necesita registrar bugs abiertos/cerrados con estructura:
un bug,
una causa,
un fix,
una prueba.

Bug minimo inicial:

- BUG-001 — empresaIdTurno fuera de scope en FIN — CERRADO.
- BUG-002 — Persistencia dual JSON + Supabase — ABIERTO.
- BUG-003 — Scripts temporales / fix_*.js en raiz — ABIERTO.
- BUG-004 — Raiz repo desordenada — ABIERTO.
- BUG-005 — Versiones duales webhook/backups — ABIERTO.

---

## Voto

GO para revision Red Team.
NO-GO para ejecucion tecnica antes de aprobar este Master Baseline.

## Proxima accion

Crear y revisar:
docs/context/08_BUG_TRACKER.yaml

Solo despues de que 05_MASTER_BASELINE.md quede aprobado, commiteado y pusheado.

---

*Nota final: Este documento NO autoriza limpieza, features ni fixes.*

*Master Baseline v1.0 — IronSync A*
*Commit funcional: 142c971 | Commit documental: b051b9c*
*IS Logbook Lite / Sprint 0 funcional con deuda tecnica alta.*
