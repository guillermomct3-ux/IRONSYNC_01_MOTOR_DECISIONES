# IRONSYNC A — REPO CLEANUP PLAN v1.0

## Metadata

| Campo | Valor |
|---|---|
| Documento | 16_REPO_CLEANUP_PLAN.md |
| Fecha | 2026-05-04 |
| Estado | BORRADOR — pendiente revision final |
| Repo | IRONSYNC_01_MOTOR_DECISIONES |
| Commit documental base | 42d67f7 |
| Basado en | Auditoria Qwen + 14_INVENTARIO_RAIZ_REPO.md + 08_BUG_TRACKER.yaml + 09_RISK_REGISTER.yaml + 11_DEV_PIPELINE.md + 12_PERSISTENCIA_UNICA_DESIGN.md |
| Riesgos asociados | R-SCRIPTS-TEMP, R-RAIZ-DESORDENADA, R-DUMP-CODIGO, R-GIT-FORCE, R-VERSIONES-DUALES, R-ARCHIVOS-VACIOS |
| Bugs asociados | BUG-003, BUG-004, BUG-005 |
| Condicion critica | DATA_LOCAL bloqueado hasta cerrar BUG-002 / R-PERSISTENCIA-DUAL |
| Proposito | Definir un plan de limpieza controlada del repo sin autorizar ejecucion inmediata |

---

## 1. Dictamen ejecutivo

IronSync A tiene deuda tecnica visible en la raiz del repo:

- scripts temporales fix_*.js;
- backups sin destino claro;
- archivos historicos;
- PDFs de prueba;
- artefactos de terminal;
- dumps de codigo;
- archivos locales de datos;
- versiones duales de archivos criticos.

La auditoria externa de Qwen confirma que el proyecto es viable, pero que la organizacion del repo es el punto mas debil de la ejecucion actual.

Este documento define como limpiar el repo sin romper produccion.

Decision principal:

La limpieza empieza como diseno, no como borrado.

Este documento NO autoriza limpieza.

---

## 2. Objetivo

El objetivo del plan es reducir ruido operativo y riesgo de errores sin tocar codigo productivo ni archivos de persistencia critica.

Objetivos especificos:

- Separar produccion de basura operacional.
- Reducir riesgo de git add ..
- Reduccion de confusion de AIs y humanos al leer la raiz.
- Archivar evidencia historica sin perder trazabilidad.
- Mantener DATA_LOCAL bloqueado hasta cerrar BUG-002.
- Preparar una limpieza futura por fases, con Plan del Dia, aprobacion y validacion.

---

## 3. Alcance

Este plan cubre:

- archivos temporales;
- artefactos de terminal;
- PDFs de prueba;
- backups historicos;
- dumps de codigo;
- documentos de estado antiguos;
- archivos dudosos que requieren investigacion;
- archivos JSON locales solo como categoria bloqueada.

Este plan NO cubre:

- refactor de codigo;
- persistencia unica en codigo;
- deploy;
- migraciones Supabase;
- limpieza real;
- eliminacion inmediata;
- reestructura de carpetas productivas;
- cambios a Railway;
- cambios a Twilio;
- cambios a turnos.js;
- cambios a webhook.js.

---

## 4. Fuente de la auditoria

Fuentes utilizadas:

- 14_INVENTARIO_RAIZ_REPO.md
- 05_MASTER_BASELINE.md
- 08_BUG_TRACKER.yaml
- 09_RISK_REGISTER.yaml
- 11_DEV_PIPELINE.md
- 12_PERSISTENCIA_UNICA_DESIGN.md
- Auditoria externa Qwen
- Insights del Red Team

Hallazgo base:

El repo es funcional, pero la raiz contiene deuda tecnica alta.

---

## 5. Clasificacion oficial A/B/C/D

A partir de este plan, toda limpieza debe usar cuatro categorias.

### A — Produccion / conservar

Archivos esenciales para que IronSync funcione.

Regla:

No se tocan en limpieza.

Ejemplos:

- turnos.js
- webhook.js
- package.json
- package-lock.json
- .gitignore
- carpetas core como api/, lib/, routes/, services/, db/, jobs/

### B — Historico / archivar

Archivos que no deben estar en raiz, pero que deben conservarse por historia, auditoria, respaldo o trazabilidad.

Regla:

Se archivan, no se eliminan.

Ejemplos:

- backups de codigo;
- dumps historicos;
- documentos antiguos;
- estado vivo anterior;
- evidencia de fallos.

### C — Candidato a eliminar

Archivos que parecen basura operacional sin valor historico ni productivo.

Regla:

Solo se eliminan despues de Plan del Dia, validacion y aprobacion.

Ejemplos:

- artefactos de terminal;
- PDFs de prueba sin referencia;
- archivos temporales claramente huerfanos;
- scripts de fix obsoletos confirmados como no dependientes.

### D — Investigar antes de decidir

Archivos cuyo destino no se puede decidir sin revisar dependencias.

Regla:

Si hay duda, es D.

Ejemplos:

- archivos 0 bytes que podrian estar referenciados;
- scripts de prueba;
- archivos con proposito ambiguo;
- archivos sin documentacion pero con posible dependencia.

---

## 6. Archivos prohibidos

No se tocan bajo ninguna circunstancia en una sesion de limpieza inicial:

- turnos.js
- webhook.js
- package.json
- package-lock.json
- .gitignore
- .env
- api/
- cron/
- db/
- jobs/
- lib/
- routes/
- scripts/
- services/
- webhooks/
- docs/context/
- docs/agents/

Tambien quedan prohibidos hasta cerrar BUG-002:

- turnos_activos.json
- bitacora.json
- eventos.json
- reporte_turno.json

Regla:

Si un archivo no esta explicitamente permitido en el Plan del Dia, no se toca.

---

## 7. DATA_LOCAL bloqueado

Archivos DATA_LOCAL:

- turnos_activos.json
- bitacora.json
- eventos.json
- reporte_turno.json

Estado:

BLOQUEADO

Razon:

Estos archivos estan relacionados con BUG-002 / R-PERSISTENCIA-DUAL.

No se mueven, no se borran, no se archivan y no se editan hasta que:

1. BUG-002 este cerrado.
2. Supabase sea fuente unica validada.
3. JSON no reciba nuevas escrituras operativas.
4. JSON no sea leido para decisiones operativas.
5. El sistema opere sin JSON durante periodo de validacion.
6. Guillermo apruebe Fase 4.

Regla:

DATA_LOCAL no se limpia antes de persistencia unica.

---

## 8. Archivos D — Investigar

Estos archivos deben investigarse antes de decidir:

| Archivo | Motivo | Validacion requerida | Decision posible |
|---|---|---|---|
| pdfReporteDiario.js | 0 bytes; puede ser placeholder o dependencia | Buscar referencias en repo | A/B/C |
| webhook_test.js | Puede tener logica de test | Buscar referencias y revisar contenido | B/C |
| ver_case.js | Proposito no claro | Buscar referencias y revisar contenido | B/C |
| cualquier fix_*.js con posible dependencia | Podria haber sido usado como parche temporal | Buscar referencias y revisar contenido si no es claramente huerfano | C/D |

Regla:

Ningun archivo D se elimina sin reclasificacion previa.

---

## 9. Archivos B — Historico / archivar

Archivos que deben conservarse como historia o evidencia:

| Archivo / patron | Clasificacion | Destino recomendado |
|---|---|---|
| turnos_activos.json.corrupto | B — evidencia historica | docs/archive/evidence/ |
| IRONSYNC_CODIGO_COMPLETO.txt | B — dump historico | docs/archive/code_snapshots/ |
| engine_backup_v1.0.js | B — backup codigo | docs/archive/code_backups/ |
| webhook_anterior.js | B — backup webhook | docs/archive/code_backups/ |
| webhook_backup.js | B — backup webhook | docs/archive/code_backups/ |
| IS_ESTADO_VIVO.md | B — estado historico | docs/archive/old_state/ |
| IS_ESTADO_VIVO_v2_4.docx | B — estado historico | docs/archive/old_state/ |
| IS_SPRINT0_BASELINE.txt | B — baseline historico | docs/archive/old_state/ |
| LEEME.txt | B — doc historico | docs/archive/old_state/ |
| *.docx historicos | B — specs historicas | docs/archive/old_specs/ |

Regla:

B se archiva, no se elimina.

---

## 10. Archivos C — Basura segura candidata

Candidatos de bajo riesgo, sujetos a Plan del Dia y validacion:

| Archivo / patron | Motivo | Accion futura propuesta |
|---|---|---|
| et --hard 87806e1 | artefacto de terminal | eliminar en fase aprobada |
| h origin main --force | artefacto de terminal | eliminar en fase aprobada |
| how --stat HEAD more | artefacto de terminal | eliminar en fase aprobada |
| conciliacion_test.pdf | PDF de prueba | archivar o eliminar segun validacion |
| conciliacion_v21.pdf | PDF de prueba | archivar o eliminar segun validacion |
| fix_*.js claramente huerfanos | scripts temporales | eliminar por fase aprobada |

Regla:

Candidato a eliminar no significa eliminar ahora.

---

## 11. Destinos de archivo recomendados

Si se archiva, usar esta estructura:

- docs/archive/
- docs/archive/INDEX.md
- docs/archive/code_backups/
- docs/archive/code_snapshots/
- docs/archive/old_state/
- docs/archive/old_specs/
- docs/archive/test_pdfs/
- docs/archive/evidence/
- docs/archive/deprecated_data_local/

Todo archivo archivado debe registrarse en:

docs/archive/INDEX.md

El indice debe incluir:

- archivo original;
- destino;
- fecha;
- razon;
- commit de origen;
- si puede eliminarse en el futuro;
- relacion con bug/riesgo si aplica.

---

## 12. Fase 0 — Preparacion obligatoria

Antes de cualquier limpieza:

1. Confirmar git status.
2. Confirmar commit estable.
3. Confirmar Plan del Dia.
4. Confirmar archivos permitidos.
5. Confirmar archivos prohibidos.
6. Confirmar rollback.
7. Confirmar prueba minima.
8. Confirmar aprobacion Guillermo.
9. Confirmar voto del equipo si aplica.
10. Confirmar que MiMo V2 ejecutara solo lo aprobado.

Criterio de exito:

Fase 0 completada sin tocar archivos.

---

## 13. Fase 1 — Basura segura

Objetivo:

Eliminar o archivar unicamente basura segura de bajo riesgo.

Candidatos:

- artefactos de terminal;
- PDFs de prueba sin referencia;
- fix_*.js confirmados como huerfanos;
- archivos C sin dependencias.

Prohibido en Fase 1:

- tocar DATA_LOCAL;
- tocar codigo core;
- tocar docs/context;
- tocar carpetas productivas;
- tocar archivos D;
- hacer limpieza masiva.

Criterios de exito:

- Solo se tocan archivos listados en Plan del Dia.
- No hay cambios en turnos.js.
- No hay cambios en webhook.js.
- No hay cambios en DATA_LOCAL.
- git status muestra solo cambios esperados.
- Se actualiza Changelog si se ejecuta.

---

## 14. Fase 2 — Investigar D

Objetivo:

Reclasificar archivos D como A, B o C.

Archivos iniciales:

- pdfReporteDiario.js
- webhook_test.js
- ver_case.js
- cualquier fix_*.js con duda.

Validaciones:

- buscar referencias en repo;
- revisar contenido;
- revisar si package.json o algun require los usa;
- documentar decision.

Criterios de exito:

- Cada archivo D queda reclasificado.
- No se elimina ningun D sin pasar a C.
- La decision queda registrada en este plan o en inventario actualizado.

---

## 15. Fase 3 — Historicos B a archivar

Objetivo:

Mover archivos historicos fuera de la raiz sin eliminarlos.

Archivos candidatos:

- backups;
- dumps;
- documentos antiguos;
- estado vivo historico;
- specs antiguas;
- evidencia de fallos.

Prohibido:

- eliminar archivos B;
- tocar DATA_LOCAL;
- archivar sin indice;
- mover codigo productivo.

Criterios de exito:

- Archivos B movidos a docs/archive/.
- docs/archive/INDEX.md creado o actualizado.
- No hay perdidas de trazabilidad.
- No se toco produccion.
- No se toco DATA_LOCAL.

---

## 16. Fase 4 — DATA_LOCAL bloqueado

Objetivo futuro:

Archivar o deprecar JSONs locales despues de cerrar BUG-002.

Archivos:

- turnos_activos.json
- bitacora.json
- eventos.json
- reporte_turno.json

Estado actual:

BLOQUEADO

Condiciones de desbloqueo:

1. 12_PERSISTENCIA_UNICA_DESIGN.md aprobado.
2. Codigo migrado a Supabase como fuente unica.
3. BUG-002 cerrado.
4. 0 escrituras operativas nuevas a JSON.
5. 0 lecturas de JSON para decisiones operativas.
6. Validacion en produccion o staging aprobada.
7. Plan del Dia especifico para DATA_LOCAL.
8. Rollback definido.
9. Guillermo aprueba.

Regla:

DATA_LOCAL se limpia despues de persistencia, no antes.

---

## 17. Fase 5 — Validacion posterior

Despues de cualquier fase ejecutada:

1. Revisar git status.
2. Confirmar que solo se tocaron archivos autorizados.
3. Confirmar que turnos.js no cambio.
4. Confirmar que webhook.js no cambio.
5. Confirmar que DATA_LOCAL no cambio, salvo Fase 4 futura.
6. Validar que el repo sigue coherente.
7. Actualizar 14_INVENTARIO_RAIZ_REPO.md.
8. Actualizar 08_BUG_TRACKER.yaml si aplica.
9. Actualizar 09_RISK_REGISTER.yaml si aplica.
10. Actualizar 13_CHANGELOG.md.
11. Commit por fase, no commit masivo.
12. Revision antes de push.

---

## 18. STOP tecnico

Se activa STOP si ocurre cualquiera de estos casos:

1. Aparece cambio no autorizado.
2. Se intenta git add ..
3. Se toca turnos.js.
4. Se toca webhook.js.
5. Se toca DATA_LOCAL antes de BUG-002.
6. Se borra archivo B.
7. Se elimina archivo D sin investigacion.
8. git status muestra archivos inesperados.
9. Hay desacuerdo del equipo.
10. Guillermo no aprueba.

Durante STOP:

- NO continuar.
- NO improvisar.
- NO limpiar mas.
- NO commit.
- NO push.

---

## 19. Rollback

Toda fase debe tener rollback antes de ejecutarse.

Opciones de rollback:

- revertir commit;
- restaurar archivo movido;
- recuperar desde docs/archive/;
- cancelar fase antes de commit;
- detener ejecucion y volver al ultimo commit estable.

No se permite:

- rollback improvisado;
- borrar para arreglar;
- mover mas archivos durante rollback;
- mezclar rollback con nueva limpieza.

---

## 20. Riesgos del plan

### R-013 — Limpieza cosmica sin resolver split-brain

Riesgo:

La raiz se ve limpia, pero BUG-002 sigue abierto.

Mitigacion:

No declarar sistema estable hasta cerrar BUG-002.

### R-014 — Perdida de evidencia de debugging

Riesgo:

Eliminar archivos que explican fallos historicos.

Mitigacion:

Archivar B y evidencia. No eliminar en primera fase.

### R-015 — Contaminacion del historial Git

Riesgo:

Mover o eliminar demasiados archivos en un solo commit.

Mitigacion:

Commits por fase. No commit masivo.

---

## 21. Criterios de exito generales

La limpieza sera exitosa si:

1. No se toca codigo productivo.
2. No se toca DATA_LOCAL antes de BUG-002.
3. La raiz reduce ruido operacional.
4. Los archivos B quedan archivados con indice.
5. Los archivos C se eliminan solo con autorizacion.
6. Los archivos D se investigan antes de decidir.
7. No se pierde evidencia historica.
8. No se rompe el flujo INICIO / FIN.
9. Se actualizan inventario, changelog, bugs y riesgos.
10. Cada fase queda en commit separado.

---

## 22. Condicion para ejecutar

Antes de ejecutar cualquier fase se requiere:

1. Este documento FROZEN.
2. Plan del Dia especifico.
3. Lista de archivos permitidos.
4. Lista de archivos prohibidos.
5. Prueba minima.
6. Rollback.
7. git status.
8. Aprobacion Guillermo.
9. Votacion GO del equipo si aplica.
10. MiMo V2 ejecutando solo instrucciones exactas.

---

## 23. Voto

GO para revision final.
NO-GO para ejecucion de limpieza inmediata.

## Proxima accion

Despues de aprobar y pushear este documento:

Convocar votacion del equipo para FROZEN de 16_REPO_CLEANUP_PLAN.md.

Despues, si Guillermo aprueba:

Crear Plan del Dia especifico para Fase 0 / Fase 1.

---

*Nota final: Este documento NO autoriza limpieza, codigo, fixes, deploy, mover archivos, borrar archivos ni tocar DATA_LOCAL.*

*Repo Cleanup Plan v1.0 — IronSync A*
*Commit documental base: 42d67f7*
*Riesgos: R-SCRIPTS-TEMP, R-RAIZ-DESORDENADA, R-DUMP-CODIGO, R-GIT-FORCE, R-VERSIONES-DUALES, R-ARCHIVOS-VACIOS*
*Bugs: BUG-003, BUG-004, BUG-005*
*DATA_LOCAL BLOQUEADO hasta cerrar BUG-002 / R-PERSISTENCIA-DUAL.*
