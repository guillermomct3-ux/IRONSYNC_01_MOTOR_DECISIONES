# 19_PLAN_DEL_DIA_REPO_CLEANUP_FASE_0B_TRACKEADOS

Proyecto: IronSync A
Fecha: 2026-05-04
Estado: PLAN_DEL_DIA / EJECUCION_BLOQUEADA
Documento base: docs/context/16_REPO_CLEANUP_PLAN.md
Documento anterior: docs/context/18_PLAN_DEL_DIA_REPO_CLEANUP_FASE_1.md
Aprobacion: Guillermo — GO condicionado a la creacion de este archivo
Ejecutor autorizado: MiMo V2
Consolidador: ChatGPT
Alcance: Fase 0b — diagnostico de deuda tecnica trackeada en GitHub/repo

---

## 1. Objetivo

Diagnosticar deuda tecnica trackeada en GitHub/repo antes de cualquier limpieza.

Fase 0 solo diagnosticó los 41 archivos untracked locales. Pero existen 38+ archivos de deuda tecnica ya trackeados (commiteados) en el repo que no fueron cubiertos.

Fase 0b completa el mapa de limpieza.

Este documento NO autoriza ejecucion de Fase 0b.

---

## 2. Estado

Estado actual del repo:

| Punto | Valor |
|---|---|
| Branch | main |
| Up to date con origin | Si |
| Commit actual | f84d55a |
| Commit base | f84d55a |
| Fase 0 | COMPLETADA |
| Fase 1 | BLOQUEADA |
| STOP tecnico | ACTIVO |
| Archivos untracked diagnosticados | 41 |
| Archivos trackeados sin diagnosticar | 38+ |
| Archivos modificados/movidos/borrados | 0 |

Razon del STOP tecnico:

Fase 0 solo cubrió archivos untracked locales. Hay deuda tecnica real ya commiteada en el repo que no esta en nuestra clasificacion. El mapa de limpieza esta incompleto.

---

## 3. Base tecnica

Fase 0b debe basarse en git ls-files para listar todos los archivos trackeados en el repo.

Debe excluir los 41 archivos untracked ya diagnosticados en Fase 0.

Comando base sugerido:

git ls-files

Para filtrar solo la raiz (sin subcarpetas productivas):

git ls-files | findstr /V "/"

---

## 4. Clasificacion

Toda propuesta de archivo debe clasificarse asi, consistente con 16_REPO_CLEANUP_PLAN.md:

A — Produccion / conservar
Archivos esenciales para que IronSync funcione. A nunca se borra.

B — Historico / archivar
Archivos que no pertenecen a raiz pero pueden tener valor historico. B se archiva, no se elimina.

C — Candidato a aislamiento/archivo
Archivos claramente temporales, sin dependencia, sin valor documental. C solo puede aislarse con lista exacta, rollback, prueba minima, voto GO y aprobacion Guillermo.

D — Investigar antes de decidir
Archivos dudosos. D nunca se borra sin investigacion previa.

DATA_LOCAL — Bloqueado hasta cerrar BUG-002
Archivos de persistencia dual. No se tocan, no se mueven, no se borran.

---

## 5. Reglas especiales

### DATA_LOCAL bloqueado hasta BUG-002:

- bitacora.json
- eventos.json
- reporte_turno.json
- turnos_activos.json

Regla: No se tocan. No se mueven. No se borran. No se archivan. BLOQUEADO.

### respuestas.js y validadores.js:

- A si uso activo confirmado en codigo productivo.
- D si hay duda.
- Nunca C sin prueba fuerte.

Regla: Son archivos con nombre que sugiere posible uso productivo. Se investigan primero.

### fix_*.js trackeados:

- D hasta busqueda de dependencias.
- Si nombre es generico (fix1, fix3, etc.) Y no aparece referenciado en ningun archivo productivo Y su ultimo commit es anterior al commit de estabilizacion, se puede reclasificar de D a C con busqueda pasiva confirmada.

Regla: Todo fix trackeado es D hasta que se pruebe lo contrario.

### pdfReporteDiario.js:

- D hasta confirmar si es placeholder o archivo referenciado.

### Backups / documentos historicos:

- B — Historico / archivar.
- No eliminar.

### Archivos 0 bytes:

- D — Investigar.
- Podrian estar referenciados como placeholder.

---

## 6. Comandos futuros permitidos para Fase 0b

Solo lectura:

- git ls-files
- git ls-files | findstr /V "/"
- git log --oneline -- [archivo]
- git log --oneline --all -- [archivo] (historial completo en todas las ramas)
- dir [archivo]
- type [archivo] | more
- findstr /S /I /M "[termino]" *.js

### Upgrade 3 — Comando adicional:

git log --oneline --all -- [archivo]

Este comando muestra el historial completo de un archivo en todas las ramas, no solo en main. Util para entender si un fix fue mergeado o si quedo como commit huerfano.

---

## 7. Comandos prohibidos

- git add
- git add .
- git rm
- git mv
- git clean
- del
- move
- ren
- copy con intencion de modificar repo
- npm install
- npm update
- deploy

---

## 8. Lista explicita de archivos trackeados a diagnosticar

### Upgrade 1 — Lista completa de los 38+ archivos trackeados

Estos archivos ya estan commiteados en el repo y NO fueron cubiertos por Fase 0.

### Scripts temporales fix_*.js trackeados (20 archivos):

| # | Archivo | Clasificacion preliminar | Ultimo commit |
|---|---------|--------------------------|---------------|
| 1 | fix1.js | D — Investigar | Apr 30 |
| 2 | fix3.js | D — Investigar | Apr 30 |
| 3 | fix4.js | D — Investigar | Apr 30 |
| 4 | fix5.js | D — Investigar | Apr 30 |
| 5 | fix6.js | D — Investigar | Apr 30 |
| 6 | fix8.js | D — Investigar | Apr 30 |
| 7 | fix9.js | D — Investigar | Apr 30 |
| 8 | fix11.js | D — Investigar | Apr 30 |
| 9 | fix12.js | D — Investigar | Apr 30 |
| 10 | fix_ayuda.js | D — Investigar | May 1 |
| 11 | fix_integrar.js | D — Investigar | May 1 |
| 12 | fix_ok.js | D — Investigar | Apr 30 |
| 13 | fix_status.js | D — Investigar | Apr 30 |
| 14 | fix_upg01.js | D — Investigar | Apr 30 |
| 15 | fix_upg05.js | D — Investigar | May 1 |
| 16 | fix_upg05b.js | D — Investigar | May 1 |
| 17 | fix_upg09.js | D — Investigar | May 1 |
| 18 | fix_upg13_14.js | D — Investigar | May 1 |
| 19 | fix_upg26_27.js | D — Investigar | Apr 30 |
| 20 | fix_upgrades.js | D — Investigar | Apr 30 |

Regla especial para nombres genericos (fix1, fix3, fix4, fix5, fix6, fix8, fix9, fix11, fix12):

Si un fix trackeado tiene nombre generico Y no aparece referenciado en ningun archivo productivo Y su ultimo commit es anterior al commit de estabilizacion, se puede reclasificar de D a C con busqueda pasiva confirmada.

### Archivos con posible uso productivo (2 archivos):

| # | Archivo | Clasificacion preliminar | Ultimo commit | Razon |
|---|---------|--------------------------|---------------|-------|
| 21 | respuestas.js | D — posible produccion | Apr 23 | Nombre sugiere uso activo. Verificar dependencias. |
| 22 | validadores.js | D — posible produccion | Apr 28 | Nombre sugiere uso activo. Verificar dependencias. |

Regla: A si uso activo confirmado. D si hay duda. Nunca C sin prueba fuerte.

### Archivos a investigar (3 archivos):

| # | Archivo | Clasificacion preliminar | Ultimo commit | Razon |
|---|---------|--------------------------|---------------|-------|
| 23 | pdfReporteDiario.js | D — placeholder o dependencia | Apr 28 | 0 bytes segun inventario. Verificar si es referenciado. |
| 24 | ver_case.js | D — proposito ambiguo | Apr 30 | Nombre no claro. Verificar contenido. |
| 25 | webhook_test.js | D — posible test | Apr 30 | Toca webhook. Lista negra parcial. |

### Backups / documentos historicos (7 archivos):

| # | Archivo | Clasificacion preliminar | Ultimo commit | Destino recomendado |
|---|---------|--------------------------|---------------|---------------------|
| 26 | webhook_anterior.js | B — archivar | Apr 30 | docs/archive/code_backups/ |
| 27 | engine_backup_v1.0.js | B — archivar | Apr 3 | docs/archive/code_backups/ |
| 28 | engine_backup_v1.txt | B — archivar | Apr 3 | docs/archive/code_snapshots/ |
| 29 | IS_ESTADO_VIVO.md | B — archivar | May 1 | docs/archive/old_state/ |
| 30 | IS_ESTADO_VIVO_v2_4.docx | B — archivar | Apr 4 | docs/archive/old_state/ |
| 31 | IS_SPRINT0_BASELINE..txt | B — archivar | Apr 3 | docs/archive/old_state/ |
| 32 | LEEME.txt | B — archivar | Apr 3 | docs/archive/old_state/ |

### PDFs de prueba (2 archivos):

| # | Archivo | Clasificacion preliminar | Ultimo commit |
|---|---------|--------------------------|---------------|
| 33 | conciliacion_test.pdf | C — candidato eliminar | Apr 12 |
| 34 | conciliacion_v21.pdf | C — candidato eliminar | Apr 30 |

### DATA_LOCAL — BLOQUEADO (4 archivos):

| # | Archivo | Clasificacion | Ultimo commit |
|---|---------|---------------|---------------|
| 35 | bitacora.json | DATA_LOCAL BLOQUEADO | Apr 3 |
| 36 | eventos.json | DATA_LOCAL BLOQUEADO | Apr 5 |
| 37 | reporte_turno.json | DATA_LOCAL BLOQUEADO | Apr 3 |
| 38 | turnos_activos.json | DATA_LOCAL BLOQUEADO | Apr 3 |

Regla: No se tocan. No se mueven. No se borran. No se archivan. BLOQUEADO hasta cerrar BUG-002.

---

## 9. Entregable futuro de Fase 0b

Cuando se autorice Fase 0b, MiMo V2 debera entregar:

1. Total de archivos trackeados en repo.
2. Archivos trackeados en raiz (sin subcarpetas productivas).
3. Clasificacion preliminar A/B/C/D/DATA_LOCAL.
4. Busqueda pasiva de dependencias para cada D.
5. Dependencias detectadas.
6. Riesgos detectados.
7. Recomendacion GO/NO-GO para integrar trackeados a Fase 1.
8. Confirmacion: 0 archivos modificados, movidos o borrados.

---

## 10. Siguiente decision

Despues de crear este documento, la siguiente decision NO es ejecutar Fase 0b.

La siguiente decision es:

GO / NO-GO para ejecutar Fase 0b — diagnostico trackeado.

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

## 11. Veredicto

19_PLAN_DEL_DIA_REPO_CLEANUP_FASE_0B_TRACKEADOS.md queda como:

PLAN_DEL_DIA / EJECUCION_BLOQUEADA

Autoriza preparar votacion de ejecucion de Fase 0b.
No autoriza ejecutar Fase 0b.
No autoriza ejecutar Fase 1.
No autoriza limpieza.

---

## 12. Frase rectora

Fase 0b completa el mapa. Fase 1 sigue bloqueada.

---

*Nota final: Este documento NO autoriza limpieza, codigo, fixes, deploy, mover archivos, borrar archivos ni tocar DATA_LOCAL.*

*19_PLAN_DEL_DIA_REPO_CLEANUP_FASE_0B_TRACKEADOS — IronSync A*
*Fecha: 2026-05-04*
*Estado: PLAN_DEL_DIA / EJECUCION_BLOQUEADA*
*Documento base: 16_REPO_CLEANUP_PLAN.md (ESTRATEGIA_FROZEN / EJECUCION_BLOQUEADA)*
*Documento anterior: 18_PLAN_DEL_DIA_REPO_CLEANUP_FASE_1.md*
*Commit base: f84d55a*
*STOP tecnico ACTIVO — mapa de limpieza incompleto sin Fase 0b*
*Archivos trackeados a diagnosticar: 38*
*Clasificacion: 20 fix D, 2 posible produccion D, 3 investigar D, 7 B archivar, 2 C candidato, 4 DATA_LOCAL bloqueado*
*Upgrades aplicados: lista explicita, regla fix genericos, comando git log --all*
*Frase rectora: Fase 0b completa el mapa. Fase 1 sigue bloqueada.*
