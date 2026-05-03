# IRONSYNC A — PERSISTENCIA UNICA DESIGN v1.0

## Metadata

| Campo | Valor |
|---|---|
| Documento | 12_PERSISTENCIA_UNICA_DESIGN.md |
| Fecha | 2026-05-03 |
| Estado | BORRADOR — pendiente revision final |
| Repo | IRONSYNC_01_MOTOR_DECISIONES |
| Bug/Riesgo | BUG-002 / R-PERSISTENCIA-DUAL |
| Basado en | 05_MASTER_BASELINE.md + 08_BUG_TRACKER.yaml + 09_RISK_REGISTER.yaml + 11_DEV_PIPELINE.md |
| Autoria | Guillermo + Equipo IronSync |
| Proposito | Disenar la arquitectura de persistencia unica para eliminar la dependencia dual JSON + Supabase |

---

## 1. Decision fundamental

La decision principal es:

- Supabase = fuente unica de verdad.
- JSON local = no autoritativo.

Esto significa:

- Supabase decide si un turno esta abierto o cerrado.
- Supabase decide si hay paro activo.
- Supabase decide el estado de eventos.
- JSON local no decide estado operativo.
- JSON local no debe recibir nuevas escrituras operativas.
- JSON local no debe usarse para cerrar, abrir, pausar o reanudar turnos.

---

## 2. Fuente de verdad oficial

La fuente oficial de verdad sera Supabase.

Debe contener, como minimo:

- turnos;
- eventos;
- operador;
- equipo;
- folio;
- estado del turno;
- horometro inicial;
- horometro final;
- timestamps;
- estado de paro;
- evidencia relacionada.

Regla:

Si no esta en Supabase, no esta confirmado operativamente.

---

## 3. Rol de Supabase

Supabase sera responsable de:

- crear turno;
- consultar turno activo;
- cerrar turno;
- registrar eventos;
- registrar paro;
- registrar reanudacion;
- consultar estado despues de reinicio;
- servir como base para PDF;
- permitir auditoria posterior.

Supabase debe ser consultado en cada decision critica.

Decisiones criticas:

- abrir turno;
- cerrar turno;
- registrar paro;
- reanudar;
- validar si ya hay turno activo;
- validar si FIN corresponde a turno existente.

---

## 4. Rol de JSON local

JSON local queda deprecado como fuente operativa.

Archivos afectados:

- turnos_activos.json
- bitacora.json
- eventos.json
- reporte_turno.json
- turnos_activos.json.corrupto

Rol permitido durante transicion:

Solo referencia historica / respaldo frio / evidencia de Sprint 0.

Rol prohibido:

- No abrir turnos.
- No cerrar turnos.
- No decidir estado.
- No alimentar PDF autoritativo.
- No resolver conflictos contra Supabase.

---

## 5. Que pasa con turnos_activos.json

turnos_activos.json es el archivo mas critico de la persistencia dual.

Decision:

turnos_activos.json debe dejar de participar en decisiones operativas.

Durante transicion:

- no se borra;
- no se mueve;
- no se limpia;
- no se usa como autoridad;
- puede quedar congelado como evidencia historica hasta fase de limpieza controlada.

Condicion futura:

Solo podra archivarse o eliminarse cuando:

- Supabase sea fuente unica operativa.
- No haya turnos activos dependientes de JSON.
- BUG-002 este cerrado.
- exista plan de limpieza aprobado.

---

## 6. Que pasa con bitacora.json, eventos.json y reporte_turno.json

Estos archivos tambien quedan deprecados como fuentes operativas.

Decision:

Supabase debe reemplazar su funcion operativa.

Durante transicion:

- no se borran;
- no se editan manualmente;
- no se usan para decisiones nuevas;
- quedan bajo control del futuro plan de limpieza.

Prioridad:

1. turnos_activos.json
2. eventos.json
3. bitacora.json
4. reporte_turno.json

---

## 7. Flujo INICIO

Flujo objetivo:

1. WhatsApp recibe mensaje INICIO.
2. Webhook valida entrada.
3. Sistema identifica operador.
4. Sistema identifica equipo.
5. Sistema consulta Supabase: existe turno activo para ese operador/equipo?
6. Si no existe turno activo: crea turno en Supabase.
7. Si existe turno activo: rechaza duplicado o informa turno ya abierto.
8. Respuesta al operador depende exclusivamente del resultado de Supabase.

Tabla de verdad:

| Estado Supabase | Accion | Respuesta |
|---|---|---|
| No hay turno activo | Crear turno | Turno abierto |
| Ya hay turno activo | No crear duplicado | Ya existe turno activo |
| Supabase timeout | No confirmar exito | Error controlado / reintentar |
| Supabase error | No confirmar exito | Avisar falla temporal |

Regla:

No se responde "Turno abierto" si Supabase no confirmo persistencia.

---

## 8. Flujo FIN

Flujo objetivo:

1. WhatsApp recibe mensaje FIN.
2. Webhook valida entrada.
3. Sistema identifica operador/equipo.
4. Sistema consulta Supabase: hay turno activo?
5. Si hay turno activo: valida horometro final, calcula horas, cierra turno en Supabase, registra evento FIN.
6. PDF se genera desde datos confirmados en Supabase.
7. Respuesta al operador depende del cierre confirmado.

Tabla de verdad:

| Estado Supabase | Accion | Respuesta |
|---|---|---|
| Turno activo existe | Cerrar turno | Turno cerrado |
| No hay turno activo | No cerrar | No hay turno abierto |
| Horometro invalido | No cerrar | Pedir correccion |
| Supabase timeout | No confirmar cierre | Error controlado / reintentar |
| Supabase error | No confirmar cierre | Avisar falla temporal |

Regla:

No se responde "Turno cerrado" si Supabase no confirmo cierre.

---

## 9. Flujo PARO / REANUDA

### Flujo PARO:

1. Recibir PARO.
2. Consultar turno activo en Supabase.
3. Validar que no exista paro activo.
4. Crear evento PARO en Supabase.
5. Actualizar estado de paro en Supabase.

### Flujo REANUDA:

1. Recibir REANUDA.
2. Consultar turno activo en Supabase.
3. Validar que exista paro activo.
4. Crear evento REANUDA en Supabase.
5. Cerrar paro activo en Supabase.

Tabla de verdad:

| Caso | Accion | Respuesta |
|---|---|---|
| Turno activo sin paro | Registrar PARO | Paro registrado |
| Turno activo con paro | No duplicar PARO | Ya hay paro activo |
| REANUDA sin paro activo | No reanudar | No hay paro activo |
| Supabase falla | No confirmar exito | Error controlado |

Regla:

PARO y REANUDA no dependen de JSON.

---

## 10. Reinicio Railway

Si Railway reinicia, el sistema no debe depender de archivos locales para recuperar estado.

Diseno:

- Al procesar cada mensaje, el estado se consulta en Supabase.
- No se requiere reconstruir memoria local para decisiones criticas.
- Si se requiere recuperacion al arranque: consultar turnos con estado ABIERTO / ACTIVO en Supabase.

Regla:

Railway puede perder memoria local sin perder estado operativo.

---

## 11. Falla de Supabase

Si Supabase falla, el sistema entra en modo degradado.

Modo degradado permitido:

- informar error;
- pedir reintento;
- avisar a supervisor;
- registrar log tecnico si aplica.

Modo degradado prohibido:

- confirmar INICIO sin persistencia;
- confirmar FIN sin persistencia;
- escribir en JSON como fuente alterna;
- generar verdad operativa desde logs;
- decir al operador que quedo registro si no quedo registrado.

Regla:

Sin Supabase no hay confirmacion operativa.

Mensaje recomendado:

No pude registrar la operacion por falla temporal del sistema.
Intenta de nuevo en unos minutos o avisa a Ulises.

---

## 12. Idempotencia

El sistema debe evitar duplicados por:

- reintentos de Twilio;
- doble mensaje del operador;
- latencia;
- refresh de webhook;
- timeout parcial.

Criterios:

- cada mensaje debe tener identificador o huella;
- cada turno debe tener folio unico;
- no puede haber dos turnos activos para mismo operador/equipo si la regla de negocio lo prohibe;
- FIN repetido no debe cerrar dos veces;
- PARO repetido no debe duplicar paro activo.

Resultado esperado:

Mismo evento repetido -> mismo resultado o rechazo controlado.

---

## 13. Concurrencia

El diseno debe contemplar que dos webhooks puedan golpear el mismo turno simultaneamente.

Casos:

- dos INICIO casi al mismo tiempo;
- FIN llega dos veces;
- PARO y FIN llegan muy juntos;
- REANUDA y FIN llegan muy juntos.

Regla:

Supabase debe ser la autoridad para resolver concurrencia.

Criterios:

- operaciones criticas deben validar estado actual antes de escribir;
- si el estado cambio, se rechaza o se responde con estado actual;
- no se permite que memoria local decida concurrencia;
- no se permite que JSON resuelva conflictos.

---

## 14. Criterios anti split-brain

Queda prohibido que dos fuentes decidan estado operativo.

Reglas:

- Supabase gana siempre.
- JSON no compite.
- JSON no corrige a Supabase.
- JSON no se usa como respaldo activo.

Si hay diferencia entre JSON y Supabase:

- Supabase es verdad.
- JSON se considera historico/desactualizado.

---

## 15. Migracion / transicion sin downtime

Objetivo:

Pasar de persistencia dual a Supabase autoritativo sin romper turnos activos.

### Fase 1 — Diseno

- aprobar este documento;
- definir archivos afectados;
- definir prueba minima;
- definir rollback.

### Fase 2 — Preparacion

- identificar turnos abiertos en JSON;
- identificar turnos abiertos en Supabase;
- comparar diferencias;
- no modificar datos todavia.

### Fase 3 — Transicion controlada

- codigo futuro dejara de consultar JSON para decisiones;
- Supabase se vuelve fuente operativa;
- JSON queda congelado como referencia historica.

### Fase 4 — Validacion

- probar INICIO;
- probar FIN;
- probar PARO;
- probar REANUDA;
- probar reinicio Railway;
- probar timeout Supabase.

### Fase 5 — Cierre

- actualizar Bug Tracker;
- actualizar Risk Register;
- actualizar Changelog;
- documentar resultado.

Regla:

No se borra JSON durante la transicion.

---

## 16. Que NO cambia

Este diseno NO modifica:

- PDF automatico;
- IS Finanzas;
- IS Gemelo Digital;
- Verify;
- pricing;
- UI avanzada;
- flujo comercial;
- limpieza de repo;
- estructura de carpetas;
- deploy;
- Twilio configuration.

Tambien NO autoriza tocar:

- turnos.js;
- webhook.js;
- routes;
- services;
- archivos JSON;
- fix scripts.

---

## 17. Prueba minima

Antes de cerrar BUG-002 se deben validar, como minimo:

1. INICIO crea turno en Supabase.
2. FIN cierra turno en Supabase.
3. PARO registra evento en Supabase.
4. REANUDA registra evento en Supabase.
5. Reinicio Railway no pierde turnos activos.
6. Supabase timeout no confirma exito falso.
7. Reintento Twilio no duplica turno.
8. FIN duplicado no duplica cierre.
9. JSON no recibe nueva escritura operativa.
10. PDF usa datos confirmados en Supabase.

---

## 18. Rollback

Rollback debe estar definido antes de tocar codigo.

Opciones de rollback aceptables:

- revertir commit tecnico;
- restaurar archivo desde backup autorizado;
- detener deploy;
- volver al ultimo commit estable;
- pausar operacion y pedir reintento manual.

No se permite:

- parchear encima sin diagnostico;
- reactivar JSON de forma improvisada;
- borrar datos;
- manipular Supabase manualmente sin plan.

---

## 19. Criterios para cerrar BUG-002

BUG-002 puede cerrarse solo si:

1. no hay escrituras operativas nuevas a JSON;
2. no hay lecturas de JSON para decidir estado operativo;
3. INICIO depende de Supabase;
4. FIN depende de Supabase;
5. PARO / REANUDA dependen de Supabase;
6. Railway reinicia y recupera estado desde Supabase;
7. se completan al menos 10 turnos INICIO -> FIN sin divergencia;
8. se prueban al menos 3 equipos distintos;
9. se prueban al menos 2 operadores/telefonos distintos;
10. se observan 0 eventos split-brain;
11. Bug Tracker se actualiza;
12. Risk Register se actualiza;
13. Changelog se actualiza.

---

## 20. Condicion para pasar a codigo

Se puede pasar a codigo solo cuando:

1. este documento este aprobado;
2. este documento este pusheado;
3. Guillermo apruebe Plan del Dia;
4. el equipo vote GO;
5. archivos permitidos esten definidos;
6. archivos prohibidos esten definidos;
7. prueba minima este definida;
8. rollback este definido;
9. MiMo V2 tenga instrucciones exactas;
10. git status este limpio salvo untracked conocidos.

---

## 21. Voto

GO para revision final.
NO-GO para codigo antes de aprobar este diseno.

## Proxima accion

Despues de aprobar y pushear este documento:

Preparar Plan del Dia para ejecucion tecnica de BUG-002 / R-PERSISTENCIA-DUAL.

---

*Nota final: Este documento NO autoriza codigo, fixes, deploy, limpieza, migracion ni modificacion de archivos.*

*Persistencia Unica Design v1.0 — IronSync A*
*Bug/Riesgo: BUG-002 / R-PERSISTENCIA-DUAL*
*IS Logbook Lite / Sprint 0 funcional con deuda tecnica alta.*
