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
