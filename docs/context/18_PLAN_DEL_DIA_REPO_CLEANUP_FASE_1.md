# 18_PLAN_DEL_DIA_REPO_CLEANUP_FASE_1

Proyecto: IronSync A
Fecha: 2026-05-04
Estado: PLAN_DEL_DIA / EJECUCION_BLOQUEADA
Documento base: docs/context/16_REPO_CLEANUP_PLAN.md
Documento anterior: docs/context/17_PLAN_DEL_DIA_REPO_CLEANUP_FASE_0_1.md
Aprobacion: Guillermo — GO condicionado a la creacion de este archivo
Ejecutor autorizado: MiMo V2
Consolidador: ChatGPT
Alcance: Fase 1 — aislamiento/archivado controlado de scripts temporales confirmados

---

## 1. Objetivo

Preparar Fase 1 como aislamiento/archivado controlado de scripts temporales confirmados.

Fase 1 NO es eliminacion directa.

Fase 1 es:

- Mover scripts temporales confirmados de la raiz a docs/archive/scripts_temp/.
- Crear un indice de archivo (archive_index.md) con trazabilidad completa.
- Ejecutar busquedas pasivas de dependencias antes de mover cada archivo.
- Confirmar que ningun archivo C tiene dependencia activa.
- Mantener rollback disponible en todo momento.

Este documento NO autoriza ejecucion de Fase 1.

---

## 2. Estado inicial

Estado confirmado por Fase 0 completada por MiMo V2:

| Punto | Valor |
|---|---|
| Branch | main |
| Up to date con origin | Si |
| Commit actual | 28e8d98 |
| Commit base | 28e8d982780f4f96a170f18274439274d9cc1955 |
| Fase 0 | COMPLETADA |
| Archivos staged | 0 |
| Archivos modified | 0 |
| Untracked totales | 41 |
| Archivos modificados/movidos/borrados | 0 |
| Ejecucion | BLOQUEADA |

Resultado clasificacion Fase 0 (consolidado):

| Categoria | Cantidad | Estado |
|---|---|---|
| A — Produccion / conservar | 0 | N/A |
| B — Historico / archivar | 2 | Excluido de Fase 1 |
| C — Candidato a aislamiento/archivo | 23 | Alcance de Fase 1 |
| D — Investigar antes de decidir | 16 | Excluido de Fase 1 |

Nota: fix_status_callback.js fue reclasificado de C a D por posible relacion con callbacks/status/Twilio/webhook.

---

## 3. Alcance

Este documento permite unicamente:

1. Disenar Fase 1.
2. Preparar lista exacta de los 23 archivos C.
3. Definir busquedas pasivas de dependencias.
4. Definir rollback.
5. Definir prueba minima.
6. Definir STOP tecnico.
7. Preparar votacion de ejecucion.

Este documento NO permite:

1. Ejecutar Fase 1.
2. Mover archivos.
3. Borrar archivos.
4. Archivar archivos.
5. Ejecutar git rm.
6. Ejecutar git add ..
7. Tocar DATA_LOCAL.
8. Tocar codigo productivo.
9. Hacer deploy.

---

## 4. Exclusiones

### 16 archivos D — NO entran a Fase 1

Estos archivos requieren investigacion en Fase 2:

| # | Archivo | Razon de exclusion |
|---|---|---|
| 1 | fix_deepseek_f1.js | Nombre sugiere integracion con DeepSeek |
| 2 | fix_empresaIdTurno.js | Relacion con BUG-001/BUG-002 |
| 3 | fix_move_override.js | Puede afectar logica de movimiento |
| 4 | fix_require_lazy.js | Puede afectar require/module loading |
| 5 | fix_router.js | Toca rutas (lista negra parcial) |
| 6 | fix_router_override.js | Toca rutas |
| 7 | fix_turnos_empresa.js | Toca logica empresa/turnos |
| 8 | fix_turnos_empresa2.js | Toca logica empresa/turnos |
| 9 | fix_twilio_client.js | Toca Twilio (lista negra parcial) |
| 10 | fix_webhook_legacy_override.js | Toca webhook (lista negra) |
| 11 | fix_webhook_legacy_v2.js | Toca webhook (lista negra) |
| 12 | fix_webhook_line.js | Toca webhook (lista negra) |
| 13 | fix_webhook_override.js | Toca webhook (lista negra) |
| 14 | fix_webhook_status.js | Toca webhook (lista negra) |
| 15 | fix_status_callback.js | Reclasificado C a D — posible relacion con callbacks/status/Twilio/webhook |
| 16 | fix_status2.js | Reclasificado — posible relacion con status/callbacks |

### 2 archivos B — NO entran a Fase 1

Estos archivos se archivan en Fase 3:

| # | Archivo | Razon de exclusion |
|---|---|---|
| 1 | turnos_backup_pre_fix_empresaIdTurno.js | Backup historico. Evidencia BUG-001. |
| 2 | webhook_backup.js | Backup historico. Evidencia webhook. |

### Zonas prohibidas

- DATA_LOCAL — BLOQUEADO hasta BUG-002
- turnos.js — intocable
- webhook.js — intocable
- JSONs operativos — intocables
- Supabase — intocable
- .env — intocable

---

## 5. Busqueda pasiva obligatoria

Antes de mover cualquier archivo C, MiMo V2 debe ejecutar busqueda pasiva de referencias.

### Archivos a buscar:

- turnos.js
- webhook.js
- index.js (si existe)
- package.json
- Archivos raiz relevantes

### Patron de busqueda:

Para cada archivo C, buscar:

1. Nombre completo del archivo (ej: fix_clean.js)
2. Nombre sin extension (ej: fix_clean)
3. Patron require('./fix_clean') o similar
4. Patron import de fix_clean

### Comandos sugeridos (solo lectura):

- Busqueda en turnos.js:
  findstr /i "fix_clean" turnos.js
- Busqueda en webhook.js:
  findstr /i "fix_clean" webhook.js
- Busqueda en package.json:
  findstr /i "fix_clean" package.json
- Busqueda general:
  findstr /i /s "fix_clean" *.js

### Regla:

Si un archivo C aparece referenciado en cualquier archivo productivo, pasa a D.
Si un archivo C genera duda, pasa a D.
Si un archivo C toca webhook/router/Twilio/turnos/require/callback/status, pasa a D.

---

## 6. Lista exacta de 23 archivos C — Candidatos a aislamiento/archivo

| # | Archivo | Clasificacion | Accion propuesta |
|---|---|---|---|
| 1 | "et --hard 87806e1" | C — artefacto terminal | Aislar a docs/archive/scripts_temp/ |
| 2 | fix_clean.js | C — script temporal | Aislar a docs/archive/scripts_temp/ |
| 3 | fix_debug.js | C — script temporal | Aislar a docs/archive/scripts_temp/ |
| 4 | fix_final.js | C — script temporal | Aislar a docs/archive/scripts_temp/ |
| 5 | fix_idempotency.js | C — script temporal | Aislar a docs/archive/scripts_temp/ |
| 6 | fix_op_final.js | C — script temporal | Aislar a docs/archive/scripts_temp/ |
| 7 | fix_operador.js | C — script temporal | Aislar a docs/archive/scripts_temp/ |
| 8 | fix_override_antes.js | C — script temporal | Aislar a docs/archive/scripts_temp/ |
| 9 | fix_override_final.js | C — script temporal | Aislar a docs/archive/scripts_temp/ |
| 10 | fix_override_top.js | C — script temporal | Aislar a docs/archive/scripts_temp/ |
| 11 | fix_paro_natural.js | C — script temporal | Aislar a docs/archive/scripts_temp/ |
| 12 | fix_paro_top.js | C — script temporal | Aislar a docs/archive/scripts_temp/ |
| 13 | fix_pdf_reporte_final.js | C — script temporal | Aislar a docs/archive/scripts_temp/ |
| 14 | fix_pdfauto_final.js | C — script temporal | Aislar a docs/archive/scripts_temp/ |
| 15 | fix_pdfauto_resilient.js | C — script temporal | Aislar a docs/archive/scripts_temp/ |
| 16 | fix_quitar_residente.js | C — script temporal | Aislar a docs/archive/scripts_temp/ |
| 17 | fix_residente.js | C — script temporal | Aislar a docs/archive/scripts_temp/ |
| 18 | fix_sesion_prioridad.js | C — script temporal | Aislar a docs/archive/scripts_temp/ |
| 19 | fix_turnos_final.js | C — script temporal | Aislar a docs/archive/scripts_temp/ |
| 20 | fix_turnos_pdf.js | C — script temporal | Aislar a docs/archive/scripts_temp/ |
| 21 | fix_turnos_simple.js | C — script temporal | Aislar a docs/archive/scripts_temp/ |
| 22 | fix_verificar.js | C — script temporal | Aislar a docs/archive/scripts_temp/ |
| 23 | fix_version.js | C — script temporal | Aislar a docs/archive/scripts_temp/ |

Regla: Si cualquiera de estos 23 archivos pasa busqueda pasiva y genera duda, se reclasifica como D y se excluye de Fase 1.

---

## 7. Accion propuesta

No eliminar directamente.

Aislar/archivar en:

docs/archive/scripts_temp/

Estructura:

docs/archive/
docs/archive/scripts_temp/
docs/archive/scripts_temp/archive_index.md

Todo archivo movido debe registrarse en archive_index.md.

---

## 8. Indice obligatorio

Crear docs/archive/scripts_temp/archive_index.md con el siguiente formato:

Para cada archivo movido:

- archivo original (nombre exacto)
- clasificacion (C)
- razon de clasificacion
- fecha de aislamiento
- commit base (28e8d98)
- accion ejecutada (movido a docs/archive/scripts_temp/)
- validacion (busqueda pasiva: sin referencias encontradas)
- relacion con bug/riesgo si aplica

El indice debe crearse ANTES de mover archivos.
El indice debe actualizarse DESPUES de mover cada archivo.
El indice debe ser el ultimo archivo commitado en la fase.

---

## 9. Rollback

Antes de ejecutar Fase 1 debe existir rollback explicito.

Rollback base actual:

- commit_base: 28e8d98
- commit_base_hash: 28e8d982780f4f96a170f18274439274d9cc1955

Comando para confirmar commit:

- git rev-parse HEAD

Opcion de rama de respaldo:

- git branch backup/pre-phase1-2026-05-04

Opcion de reversion si algo sale mal:

- git reset --hard 28e8d98

Nota:

git reset --hard solo debe usarse bajo STOP tecnico y con aprobacion explicita de Guillermo.

Procedimiento de rollback:

1. Detener ejecucion inmediatamente.
2. Reportar el problema al equipo.
3. No intentar arreglar.
4. Si Guillermo autoriza:
   git reset --hard 28e8d98
5. Verificar que el repo volvio al estado anterior.
6. Documentar el incidente.

---

## 10. Prueba minima antes/despues

### Antes de ejecutar Fase 1:

1. git status
2. git log --oneline -5
3. node --check webhook.js
4. Si aplica: INICIO/FIN simulado o staging funcional

### Despues de ejecutar Fase 1:

1. git status
2. git log --oneline -5
3. node --check webhook.js
4. Si aplica: INICIO/FIN simulado o staging funcional

### Criterio de exito:

- Sin errores nuevos.
- Sin archivos productivos modificados.
- Sin cambios en DATA_LOCAL.
- Sin cambios en turnos.js.
- Sin cambios en webhook.js.
- Sin cambios en JSONs operativos.
- Repo controlado.
- Commit de aislamiento especifico.
- archive_index.md creado y completo.
- Raiz reducida en 23 archivos.

### Criterio de fallo:

- node --check webhook.js falla.
- git status muestra archivos modificados no esperados.
- Aparece referencia a un archivo C en codigo productivo.
- DATA_LOCAL aparece involucrado.

---

## 11. STOP tecnico

Debe detenerse toda ejecucion si ocurre cualquiera de estos casos:

1. Aparece referencia activa a un archivo C en codigo productivo.
2. Aparece archivo no listado.
3. Un archivo candidato tiene posible dependencia oculta.
4. Una prueba minima falla.
5. node --check webhook.js falla.
6. git status muestra cambios inesperados.
7. Se involucra DATA_LOCAL.
8. Se involucra turnos.js.
9. Se involucra webhook.js.
10. Se involucra Supabase.
11. Se involucra .env.
12. Se detecta ambiguedad sobre si un archivo es evidencia.
13. El numero de archivos candidatos excede el limite aprobado (maximo 15 por commit).
14. Alguien propone borrar en vez de archivar.
15. Alguien propone git add ., git rm masivo o git clean.

Accion bajo STOP tecnico:

1. No continuar.
2. Reportar hallazgo.
3. No improvisar fix.
4. Volver a votacion.
5. Aplicar rollback solo si Guillermo lo autoriza.

---

## 12. Limite de ejecucion

Maximo 10-15 archivos por commit futuro.

Con 23 archivos C, esto implica:

- Opcion A: Un solo commit de 23 archivos si el equipo aprueba excepcion.
- Opcion B: Dos commits (12 + 11) para mayor seguridad.
- Opcion C: Tres commits (8 + 8 + 7) para maximo control.

Recomendacion MiMo V2: Opcion B (dos commits de 12 y 11).

Regla: No mezclar categorias en un mismo commit.
Regla: No mezclar aislamiento con documentacion.
Regla: archive_index.md va en el ultimo commit.

---

## 13. Cierre futuro

Despues de ejecutar Fase 1, actualizar:

1. docs/context/13_CHANGELOG.md — entrada documental
2. docs/context/14_INVENTARIO_RAIZ_REPO.md — actualizar conteo de archivos
3. docs/context/01_ESTADO_ACTUAL.yaml — si aplica
4. docs/context/08_BUG_TRACKER.yaml — BUG-003 parcialmente resuelto
5. docs/context/09_RISK_REGISTER.yaml — R-SCRIPTS-TEMP parcialmente mitigado

---

## 14. Siguiente decision

Despues de crear este documento, la siguiente decision NO es ejecutar Fase 1.

La siguiente decision es:

GO / NO-GO para ejecutar Fase 1 — aislamiento controlado.

Formato:

- ChatGPT — GO / NO-GO
- MiMo V2 — GO / NO-GO
- Claude — GO / NO-GO
- DeepSeek — GO / NO-GO
- Gemini — GO / NO-GO
- Grok — GO / NO-GO
- GLM5 — GO / NO-GO
- Qwen — GO / NO-GO
- Guillermo — APROBACION FINAL / VETO

---

## 15. Veredicto

18_PLAN_DEL_DIA_REPO_CLEANUP_FASE_1.md queda como:

PLAN_DEL_DIA / EJECUCION_BLOQUEADA

Autoriza preparar votacion de ejecucion de Fase 1.
No autoriza ejecutar Fase 1.
No autoriza mover archivos.
No autoriza borrar archivos.
No autoriza archivar archivos.

---

## 16. Frase rectora

La limpieza empieza como diseno, no como borrado.

---

*Nota final: Este documento NO autoriza limpieza, codigo, fixes, deploy, mover archivos, borrar archivos ni tocar DATA_LOCAL.*

*18_PLAN_DEL_DIA_REPO_CLEANUP_FASE_1 — IronSync A*
*Fecha: 2026-05-04*
*Estado: PLAN_DEL_DIA / EJECUCION_BLOQUEADA*
*Documento base: 16_REPO_CLEANUP_PLAN.md (ESTRATEGIA_FROZEN / EJECUCION_BLOQUEADA)*
*Documento anterior: 17_PLAN_DEL_DIA_REPO_CLEANUP_FASE_0_1.md*
*Commit base: 28e8d98*
*Clasificacion consolidada: A=0, B=2, C=23, D=16*
*fix_status_callback.js reclasificado de C a D*
*Accion propuesta: aislar 23 archivos C a docs/archive/scripts_temp/*
*No eliminar. Archivar.*
*Frase rectora: La limpieza empieza como diseno, no como borrado.*
