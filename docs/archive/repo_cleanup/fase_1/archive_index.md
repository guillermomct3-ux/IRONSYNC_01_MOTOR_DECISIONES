# archive_index.md

Proyecto: IronSync A
Estado: ACTIVO
Ultimo update: 2026-05-04
Commit base: ed87e70

---

## Lote 1 — 2026-05-04

Commit base: ed87e70
Archivos: 5
Resultado: EXITO

| # | Archivo original | Clasificacion | Origen | Razon | Accion | Commit base | Rollback | Prueba | Resultado |
|---|---|---|---|---|---|---|---|---|---|
| 1 | et --hard 87806e1 | C | Untracked | Artefacto terminal. Fragmento de comando git pegado accidentalmente en nombre de archivo. | Move-Item a docs/archive/repo_cleanup/fase_1/ | ed87e70 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 2 | h origin main --force | C | Trackeado | Artefacto terminal. Fragmento de comando git pegado accidentalmente en nombre de archivo. | git mv a docs/archive/repo_cleanup/fase_1/ | ed87e70 | git mv de vuelta a raiz | git status + node --check | EXITO |
| 3 | how --stat HEAD [U+F03C] more | C | Untracked | Artefacto terminal. Fragmento de comando git con caracter Unicode invisible (U+F03C) pegado accidentalmente. | Move-Item a docs/archive/repo_cleanup/fase_1/ (nombre exacto con U+F03C) | ed87e70 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 4 | conciliacion_test.pdf | C | Trackeado | PDF prueba de conciliacion. Sin referencias en codigo. | git mv a docs/archive/repo_cleanup/fase_1/ | ed87e70 | git mv de vuelta a raiz | git status + node --check | EXITO |
| 5 | conciliacion_v21.pdf | C | Trackeado | PDF prueba de conciliacion v21. Sin referencias en codigo. | git mv a docs/archive/repo_cleanup/fase_1/ | ed87e70 | git mv de vuelta a raiz | git status + node --check | EXITO |

### Pruebas Lote 1

| Prueba | Antes | Despues | Resultado |
|--------|-------|---------|-----------|
| node --check webhook.js | OK | OK | SIN REGRESION |
| node --check turnos.js | OK | OK | SIN REGRESION |
| git status DATA_LOCAL | Clean | Clean | SIN CAMBIO |
| git status produccion | Clean | Clean | SIN CAMBIO |

### Rollback Lote 1

Si se requiere revertir Lote 1:

- Archivo 1: Move-Item docs/archive/repo_cleanup/fase_1/et --hard 87806e1 de vuelta a raiz
- Archivo 2: git mv docs/archive/repo_cleanup/fase_1/h origin main --force de vuelta a raiz
- Archivo 3: Move-Item docs/archive/repo_cleanup/fase_1/[nombre con U+F03C] de vuelta a raiz
- Archivo 4: git mv docs/archive/repo_cleanup/fase_1/conciliacion_test.pdf de vuelta a raiz
- Archivo 5: git mv docs/archive/repo_cleanup/fase_1/conciliacion_v21.pdf de vuelta a raiz
- Commit: revert: undo Fase 1 Lote 1 - restore 5 files to root

### Correccion Lote 1 — 2026-05-04

Commit: 6c37a48
Razon: El archivo con caracter Unicode U+F03C no pudo ser staged con git add normal porque git interpreta corchetes como glob pattern. Se uso GIT_LITERAL_PATHSPECS=1 para forzar pathspecs literales.
Resultado: EXITO — rename confirmado 100% por git.

---

## Lote 2 — 2026-05-04

Commit base: ed0e819
Archivos: 10
Tipo: fix_*.js untracked — scripts one-time
Resultado: EXITO

| # | Archivo original | Clasificacion | Origen | Razon | Accion | Commit base | Rollback | Prueba | Resultado |
|---|---|---|---|---|---|---|---|---|---|
| 1 | fix_clean.js | C | Untracked | Script temporal de limpieza. 0 referencias produccion. | Move-Item a fase_1/ | ed0e819 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 2 | fix_debug.js | C | Untracked | Script temporal de debug. 0 referencias produccion. | Move-Item a fase_1/ | ed0e819 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 3 | fix_final.js | C | Untracked | Script temporal generico. 0 referencias produccion. | Move-Item a fase_1/ | ed0e819 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 4 | fix_idempotency.js | C | Untracked | Script temporal idempotencia. 0 referencias produccion. | Move-Item a fase_1/ | ed0e819 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 5 | fix_op_final.js | C | Untracked | Script temporal operacional. 0 referencias produccion. | Move-Item a fase_1/ | ed0e819 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 6 | fix_operador.js | C | Untracked | Script temporal operador. 0 referencias produccion. | Move-Item a fase_1/ | ed0e819 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 7 | fix_override_antes.js | C | Untracked | Script temporal override. 0 referencias produccion. | Move-Item a fase_1/ | ed0e819 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 8 | fix_override_final.js | C | Untracked | Script temporal override. 0 referencias produccion. | Move-Item a fase_1/ | ed0e819 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 9 | fix_override_top.js | C | Untracked | Script temporal override. 0 referencias produccion. | Move-Item a fase_1/ | ed0e819 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 10 | fix_paro_natural.js | C | Untracked | Script temporal paro. 0 referencias produccion. | Move-Item a fase_1/ | ed0e819 | Move-Item de vuelta a raiz | git status + node --check | EXITO |

### Pruebas Lote 2

| Prueba | Antes | Despues | Resultado |
|--------|-------|---------|-----------|
| node --check webhook.js | OK | OK | SIN REGRESION |
| node --check turnos.js | OK | OK | SIN REGRESION |
| git status DATA_LOCAL | Clean | Clean | SIN CAMBIO |
| git status produccion | Clean | Clean | SIN CAMBIO |

### Rollback Lote 2

Si se requiere revertir Lote 2:

- Mover los 10 archivos de vuelta de docs/archive/repo_cleanup/fase_1/ a raiz.
- Commit: revert: undo Fase 1 Lote 2 - restore 10 fix scripts to root

---

## Lote 3 — 2026-05-04

Commit base: 8df83e2
Archivos: 10
Tipo: fix_*.js untracked — scripts one-time
Resultado: EXITO

| # | Archivo original | Clasificacion | Origen | Razon | Accion | Commit base | Rollback | Prueba | Resultado |
|---|---|---|---|---|---|---|---|---|---|
| 1 | fix_paro_top.js | C | Untracked | Script temporal paro. 0 referencias produccion. | Move-Item a fase_1/ | 8df83e2 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 2 | fix_pdf_reporte_final.js | C | Untracked | Parche one-time PDF reporte. 0 referencias produccion. | Move-Item a fase_1/ | 8df83e2 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 3 | fix_pdfauto_final.js | C | Untracked | Parche one-time PDF automatico. 0 referencias produccion. | Move-Item a fase_1/ | 8df83e2 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 4 | fix_pdfauto_resilient.js | C | Untracked | Parche one-time PDF resiliente. 0 referencias produccion. | Move-Item a fase_1/ | 8df83e2 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 5 | fix_quitar_residente.js | C | Untracked | Script temporal residente. 0 referencias produccion. | Move-Item a fase_1/ | 8df83e2 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 6 | fix_require_lazy.js | C | Untracked | Parche one-time lazy loading. 0 referencias produccion. | Move-Item a fase_1/ | 8df83e2 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 7 | fix_residente.js | C | Untracked | Script temporal residente. 0 referencias produccion. | Move-Item a fase_1/ | 8df83e2 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 8 | fix_sesion_prioridad.js | C | Untracked | Script temporal sesion. 0 referencias produccion. | Move-Item a fase_1/ | 8df83e2 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 9 | fix_turnos_final.js | C | Untracked | Script temporal turnos. 0 referencias produccion. | Move-Item a fase_1/ | 8df83e2 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 10 | fix_turnos_pdf.js | C | Untracked | Script temporal turnos PDF. 0 referencias produccion. | Move-Item a fase_1/ | 8df83e2 | Move-Item de vuelta a raiz | git status + node --check | EXITO |

### Pruebas Lote 3

| Prueba | Antes | Despues | Resultado |
|--------|-------|---------|-----------|
| node --check webhook.js | OK | OK | SIN REGRESION |
| node --check turnos.js | OK | OK | SIN REGRESION |
| git status DATA_LOCAL | Clean | Clean | SIN CAMBIO |
| git status produccion | Clean | Clean | SIN CAMBIO |

### Nota tecnica Lote 3

Doble verificacion de refs criticas encontro coincidencia de palabra residente en webhook.js (lineas 245-253). Analisis: es la feature firma digital residente, NO es referencia a fix_residente.js ni fix_quitar_residente.js. No es STOP tecnico.

### Rollback Lote 3

Si se requiere revertir Lote 3:

- Mover los 10 archivos de vuelta de docs/archive/repo_cleanup/fase_1/ a raiz.
- Commit: revert: undo Fase 1 Lote 3 - restore 10 fix scripts to root

---

## Lote 4 — 2026-05-04

Commit base: e8a9f69
Archivos: 10
Tipo: fix_*.js untracked — scripts one-time
Resultado: EXITO

| # | Archivo original | Clasificacion | Origen | Razon | Accion | Commit base | Rollback | Prueba | Resultado |
|---|---|---|---|---|---|---|---|---|---|
| 1 | fix_turnos_simple.js | C | Untracked | Script temporal turnos. 0 referencias produccion. | Move-Item a fase_1/ | e8a9f69 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 2 | fix_verificar.js | C | Untracked | Script temporal verificacion. 0 referencias produccion. | Move-Item a fase_1/ | e8a9f69 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 3 | fix_version.js | C | Untracked | Script temporal version. 0 referencias produccion. | Move-Item a fase_1/ | e8a9f69 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 4 | fix_deepseek_f1.js | C | Untracked | Parche one-time deteccion PARO natural DeepSeek. 0 referencias produccion. | Move-Item a fase_1/ | e8a9f69 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 5 | fix_empresaIdTurno.js | C | Untracked | Parche one-time buscar empresa_id antes de insert. 0 referencias produccion. | Move-Item a fase_1/ | e8a9f69 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 6 | fix_move_override.js | C | Untracked | Parche one-time mover bloque override PARO/FALLA. 0 referencias produccion. | Move-Item a fase_1/ | e8a9f69 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 7 | fix_router.js | C | Untracked | Parche one-time admin tambien puede ser operador. 0 referencias produccion. | Move-Item a fase_1/ | e8a9f69 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 8 | fix_router_override.js | C | Untracked | Parche one-time comandos operador siempre van a operador. 0 referencias produccion. | Move-Item a fase_1/ | e8a9f69 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 9 | fix_turnos_empresa.js | C | Untracked | Parche one-time buscar empresa_id antes del insert. 0 referencias produccion. | Move-Item a fase_1/ | e8a9f69 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 10 | fix_turnos_empresa2.js | C | Untracked | Parche one-time buscar empresa_id del operador. 0 referencias produccion. | Move-Item a fase_1/ | e8a9f69 | Move-Item de vuelta a raiz | git status + node --check | EXITO |

### Pruebas Lote 4

| Prueba | Antes | Despues | Resultado |
|--------|-------|---------|-----------|
| node --check webhook.js | OK | OK | SIN REGRESION |
| node --check turnos.js | OK | OK | SIN REGRESION |
| git status DATA_LOCAL | Clean | Clean | SIN CAMBIO |
| git status produccion | Clean | Clean | SIN CAMBIO |
| require('./fix_') | 0 | 0 | SIN DEPENDENCIA |

### Rollback Lote 4

Si se requiere revertir Lote 4:

- Mover los 10 archivos de vuelta de docs/archive/repo_cleanup/fase_1/ a raiz.
- Commit: revert: undo Fase 1 Lote 4 - restore 10 fix scripts to root

---

## Lote 5 — 2026-05-04

Commit base: 85940b0
Archivos: 3
Tipo: fix_*.js untracked — scripts one-time
Resultado: EXITO

| # | Archivo original | Clasificacion | Origen | Razon | Accion | Commit base | Rollback | Prueba | Resultado |
|---|---|---|---|---|---|---|---|---|---|
| 1 | fix_twilio_client.js | C | Untracked | Parche one-time cliente Twilio. 0 referencias produccion. | Move-Item a fase_1/ | 85940b0 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 2 | fix_webhook_legacy_override.js | C | Untracked | Parche one-time override webhook legacy. 0 referencias produccion. | Move-Item a fase_1/ | 85940b0 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 3 | fix_webhook_legacy_v2.js | C | Untracked | Parche one-time webhook legacy v2. 0 referencias produccion. | Move-Item a fase_1/ | 85940b0 | Move-Item de vuelta a raiz | git status + node --check | EXITO |

### Pruebas Lote 5

| Prueba | Antes | Despues | Resultado |
|--------|-------|---------|-----------|
| node --check webhook.js | OK | OK | SIN REGRESION |
| node --check turnos.js | OK | OK | SIN REGRESION |
| git status DATA_LOCAL | Clean | Clean | SIN CAMBIO |
| git status produccion | Clean | Clean | SIN CAMBIO |
| require('./fix_') | 0 | 0 | SIN DEPENDENCIA |

### Nota tecnica Lote 5

Coincidencias sensibles en webhook.js: WEBHOOK_LEGACY_OPERATOR_OVERRIDE (linea 147) y LEGACY_OVERRIDE_ERROR (linea 164). Son strings de console.log/error dentro del codigo de produccion, NO referencias a los archivos C. No es STOP tecnico.

### Rollback Lote 5

Si se requiere revertir Lote 5:

- Mover los 3 archivos de vuelta de docs/archive/repo_cleanup/fase_1/ a raiz.
- Commit: revert: undo Fase 1 Lote 5 - restore 3 fix scripts to root

---

## Lote 6 — 2026-05-04

Commit base: c8894e1
Archivos: 5
Tipo: fix_*.js untracked — scripts one-time
Resultado: EXITO

| # | Archivo original | Clasificacion | Origen | Razon | Accion | Commit base | Rollback | Prueba | Resultado |
|---|---|---|---|---|---|---|---|---|---|
| 1 | fix_status2.js | C | Untracked | Parche one-time status. 0 referencias produccion. | Move-Item a fase_1/ | c8894e1 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 2 | fix_status_callback.js | C | Untracked | Parche one-time status callback. 0 referencias produccion. | Move-Item a fase_1/ | c8894e1 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 3 | fix_webhook_line.js | C | Untracked | Parche one-time webhook line. 0 referencias produccion. | Move-Item a fase_1/ | c8894e1 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 4 | fix_webhook_override.js | C | Untracked | Parche one-time webhook override. 0 referencias produccion. | Move-Item a fase_1/ | c8894e1 | Move-Item de vuelta a raiz | git status + node --check | EXITO |
| 5 | fix_webhook_status.js | C | Untracked | Parche one-time webhook status. 0 referencias produccion. | Move-Item a fase_1/ | c8894e1 | Move-Item de vuelta a raiz | git status + node --check | EXITO |

### Pruebas Lote 6

| Prueba | Antes | Despues | Resultado |
|--------|-------|---------|-----------|
| node --check webhook.js | OK | OK | SIN REGRESION |
| node --check turnos.js | OK | OK | SIN REGRESION |
| git status DATA_LOCAL | Clean | Clean | SIN CAMBIO |
| git status produccion | Clean | Clean | SIN CAMBIO |
| require('./fix_') | 0 | 0 | SIN DEPENDENCIA |

### Nota tecnica Lote 6

Lote 6 cierra los archivos untracked (C). Los Lotes 7 y 8 cambian de protocolo: usan git mv para archivos trackeados.
Archivos B excluidos confirmados: turnos_backup_pre_fix_empresaIdTurno.js y webhook_backup.js permanecen en raiz.

### Rollback Lote 6

Si se requiere revertir Lote 6:

- Mover los 5 archivos de vuelta de docs/archive/repo_cleanup/fase_1/ a raiz.
- Commit: revert: undo Fase 1 Lote 6 - restore 5 fix scripts to root

---

## Lote 7 — 2026-05-04

Commit base: 134c77f
Archivos: 9
Tipo: fix*.js trackeados — scripts one-time genericos
Protocolo: git mv (archivos trackeados)
Resultado: EXITO

| # | Archivo original | Clasificacion | Origen | Razon | Accion | Commit base | Rollback | Prueba | Resultado |
|---|---|---|---|---|---|---|---|---|---|
| 1 | fix1.js | C | Trackeado | Script one-time generico. 0 referencias produccion. | git mv a fase_1/ | 134c77f | git mv de vuelta a raiz | git status + node --check | EXITO |
| 2 | fix3.js | C | Trackeado | Script one-time generico. 0 referencias produccion. | git mv a fase_1/ | 134c77f | git mv de vuelta a raiz | git status + node --check | EXITO |
| 3 | fix4.js | C | Trackeado | Script one-time generico. 0 referencias produccion. | git mv a fase_1/ | 134c77f | git mv de vuelta a raiz | git status + node --check | EXITO |
| 4 | fix5.js | C | Trackeado | Script one-time generico. 0 referencias produccion. | git mv a fase_1/ | 134c77f | git mv de vuelta a raiz | git status + node --check | EXITO |
| 5 | fix6.js | C | Trackeado | Script one-time generico. 0 referencias produccion. | git mv a fase_1/ | 134c77f | git mv de vuelta a raiz | git status + node --check | EXITO |
| 6 | fix8.js | C | Trackeado | Script one-time generico. 0 referencias produccion. | git mv a fase_1/ | 134c77f | git mv de vuelta a raiz | git status + node --check | EXITO |
| 7 | fix9.js | C | Trackeado | Script one-time generico. 0 referencias produccion. | git mv a fase_1/ | 134c77f | git mv de vuelta a raiz | git status + node --check | EXITO |
| 8 | fix11.js | C | Trackeado | Script one-time generico. 0 referencias produccion. | git mv a fase_1/ | 134c77f | git mv de vuelta a raiz | git status + node --check | EXITO |
| 9 | fix12.js | C | Trackeado | Script one-time generico. 0 referencias produccion. | git mv a fase_1/ | 134c77f | git mv de vuelta a raiz | git status + node --check | EXITO |

### Pruebas Lote 7

| Prueba | Antes | Despues | Resultado |
|--------|-------|---------|-----------|
| node --check webhook.js | OK | OK | SIN REGRESION |
| node --check turnos.js | OK | OK | SIN REGRESION |
| git status DATA_LOCAL | Clean | Clean | SIN CAMBIO |
| git status produccion | Clean | Clean | SIN CAMBIO |
| require('./fix') | 0 | 0 | SIN DEPENDENCIA |

### Nota tecnica Lote 7

Primer lote con protocolo git mv para archivos trackeados. git mv deja los movimientos staged automaticamente. No requiere git add adicional para los archivos movidos.
Rollback antes de commit: git mv de vuelta a raiz. Rollback despues de commit: git revert o git mv de vuelta + commit.

### Rollback Lote 7

Si se requiere revertir Lote 7 antes de commit:

- git mv docs/archive/repo_cleanup/fase_1/fix1.js fix1.js (repetir para los 9)
- git reset HEAD docs/archive/repo_cleanup/fase_1/archive_index.md

Si se requiere revertir despues de commit:

- git revert <commit_hash>

---

## Lote 8 — 2026-05-04

Commit base: 905b434
Archivos: 11
Tipo: fix_*.js trackeados — scripts one-time con nombre
Protocolo: git mv (archivos trackeados)
Resultado: EXITO — CIERRE FASE 1

| # | Archivo original | Clasificacion | Origen | Razon | Accion | Commit base | Rollback | Prueba | Resultado |
|---|---|---|---|---|---|---|---|---|---|
| 1 | fix_ayuda.js | C | Trackeado | Script one-time ayuda. 0 referencias produccion. | git mv a fase_1/ | 905b434 | git mv de vuelta a raiz | git status + node --check | EXITO |
| 2 | fix_integrar.js | C | Trackeado | Script one-time integracion. 0 referencias produccion. | git mv a fase_1/ | 905b434 | git mv de vuelta a raiz | git status + node --check | EXITO |
| 3 | fix_ok.js | C | Trackeado | Script one-time ok. 0 referencias produccion. | git mv a fase_1/ | 905b434 | git mv de vuelta a raiz | git status + node --check | EXITO |
| 4 | fix_status.js | C | Trackeado | Script one-time status. 0 referencias produccion. | git mv a fase_1/ | 905b434 | git mv de vuelta a raiz | git status + node --check | EXITO |
| 5 | fix_upg01.js | C | Trackeado | Script one-time upgrade 01. 0 referencias produccion. | git mv a fase_1/ | 905b434 | git mv de vuelta a raiz | git status + node --check | EXITO |
| 6 | fix_upg05.js | C | Trackeado | Script one-time upgrade 05. 0 referencias produccion. | git mv a fase_1/ | 905b434 | git mv de vuelta a raiz | git status + node --check | EXITO |
| 7 | fix_upg05b.js | C | Trackeado | Script one-time upgrade 05b. 0 referencias produccion. | git mv a fase_1/ | 905b434 | git mv de vuelta a raiz | git status + node --check | EXITO |
| 8 | fix_upg09.js | C | Trackeado | Script one-time upgrade 09. 0 referencias produccion. | git mv a fase_1/ | 905b434 | git mv de vuelta a raiz | git status + node --check | EXITO |
| 9 | fix_upg13_14.js | C | Trackeado | Script one-time upgrade 13-14. 0 referencias produccion. | git mv a fase_1/ | 905b434 | git mv de vuelta a raiz | git status + node --check | EXITO |
| 10 | fix_upg26_27.js | C | Trackeado | Script one-time upgrade 26-27. 0 referencias produccion. | git mv a fase_1/ | 905b434 | git mv de vuelta a raiz | git status + node --check | EXITO |
| 11 | fix_upgrades.js | C | Trackeado | Script one-time upgrades. 0 referencias produccion. | git mv a fase_1/ | 905b434 | git mv de vuelta a raiz | git status + node --check | EXITO |

### Pruebas Lote 8

| Prueba | Antes | Despues | Resultado |
|--------|-------|---------|-----------|
| node --check webhook.js | OK | OK | SIN REGRESION |
| node --check turnos.js | OK | OK | SIN REGRESION |
| git status DATA_LOCAL | Clean | Clean | SIN CAMBIO |
| git status produccion | Clean | Clean | SIN CAMBIO |
| require('./fix') | 0 | 0 | SIN DEPENDENCIA |

### Nota tecnica Lote 8

Lote 8 cierra Fase 1 del plan 22_PLAN_DEL_DIA_REPO_CLEANUP_FASE_1_63C.md.
Total de archivos C aislados: 63/63.
Lotes 1-6 usaron Move-Item (archivos untracked).
Lotes 7-8 usaron git mv (archivos trackeados).
Protocolo git mv validado exitosamente en Lotes 7 y 8.

### Resumen Fase 1

| Lote | Archivos | Tipo | Protocolo | Estado |
|------|----------|------|-----------|--------|
| 1 | 5 | Untracked | Move-Item | EXITO |
| 2 | 10 | Untracked | Move-Item | EXITO |
| 3 | 10 | Untracked | Move-Item | EXITO |
| 4 | 10 | Untracked | Move-Item | EXITO |
| 5 | 3 | Untracked | Move-Item | EXITO |
| 6 | 5 | Untracked | Move-Item | EXITO |
| 7 | 9 | Trackeado | git mv | EXITO |
| 8 | 11 | Trackeado | git mv | EXITO |
| **Total** | **63** | | | **FASE 1 COMPLETADA** |

### Rollback Lote 8

Si se requiere revertir Lote 8 antes de commit:

- git mv docs/archive/repo_cleanup/fase_1/fix_ayuda.js fix_ayuda.js (repetir para los 11)

Si se requiere revertir despues de commit:

- git revert <commit_hash>

### Estado post-Fase 1

- A Produccion: 7 archivos (intocados)
- B Historico: 18 archivos (intocados, 2 backups untracked excluidos)
- C Aislados: 63/63 (todos en docs/archive/repo_cleanup/fase_1/)
- D: 0
- D-Riesgo: 0
- DATA_LOCAL: 4 archivos (intocados)
- Fase 1: COMPLETADA
- Fase 2: BLOQUEADA hasta autorizacion
