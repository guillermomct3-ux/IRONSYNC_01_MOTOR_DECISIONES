# 22_PLAN_DEL_DIA_REPO_CLEANUP_FASE_1_63C

Proyecto: IronSync A
Fecha: 2026-05-04
Estado: PLAN_DEL_DIA / EJECUCION_BLOQUEADA
Documento base: docs/context/16_REPO_CLEANUP_PLAN.md
Documento evidencia: docs/context/21_PAQUETE_EVIDENCIA_CLASIFICACION_FINAL.md
Commit evidencia: b6d183c
Aprobacion: Guillermo — GO condicionado a la creacion de este archivo
Ejecutor autorizado: MiMo V2
Validacion externa: ChatGPT, DeepSeek, GLM5 — GO condicionado
Alcance: Fase 1 rediseñada — aislamiento controlado por lotes de 63 archivos C

---

## 1. Objetivo

Disenar el aislamiento controlado de los 63 archivos C resultantes del ajuste conservador consolidado.

Fase 1 no es eliminacion directa.

Fase 1 es:

- Mover scripts temporales confirmados de la raiz a docs/archive/repo_cleanup/fase_1/.
- Ejecutar por lotes de maximo 10 archivos.
- Validar antes y despues de cada lote.
- Generar commit separado por lote.
- Documentar rollback por lote.
- Crear archive_index.md con trazabilidad completa.

Este documento NO autoriza ejecucion de Fase 1.

---

## 2. Estado base

Ultimo estado documentado: 21_PAQUETE_EVIDENCIA_CLASIFICACION_FINAL.md

| Punto | Valor |
|---|---|
| Branch | main |
| Commit actual | b6d183c |
| Fase 0 | COMPLETADA |
| Fase 0b | COMPLETADA |
| Diagnostico 39 D | COMPLETADO |
| Mapa original MiMo V2 | A=7, B=15, C=66, D=0, D-Riesgo=0, DATA_LOCAL=4 |
| Mapa ajustado conservador | A=7, B=18, C=63, D=0, D-Riesgo=0, DATA_LOCAL=4 |
| Fase 1 | BLOQUEADA |
| DATA_LOCAL | BLOQUEADO hasta BUG-002 |

Archivos A intocables:

- .gitignore
- package.json
- package-lock.json
- turnos.js
- webhook.js
- respuestas.js
- validadores.js

---

## 3. Diferencia entre mapa MiMo y mapa conservador

MiMo V2 clasifico 66 archivos como C.

La validacion externa (ChatGPT, DeepSeek, GLM5) recomienda un ajuste conservador:

Reclasificar 3 archivos de C a B por valor historico/debug/integracion:

| # | Archivo | Clasificacion MiMo | Clasificacion ajustada | Razon del ajuste |
|---|---------|---------------------|------------------------|------------------|
| 1 | pdfReporteDiario.js | C | B | Placeholder 0 bytes posiblemente historico o evidencia de ruta PDF. Conservar por si tiene valor documental futuro. |
| 2 | ver_case.js | C | B | Script de verificacion/debug. Sin produccion activa, pero util como evidencia historica de debugging. |
| 3 | webhook_test.js | C | B | Fragmento de imports relacionados con webhook/turnos/auth/signatures. Sin logica ni exports, pero util como snapshot historico de integracion. |

Resultado del ajuste:

| Categoria | MiMo V2 | Ajuste conservador | Diferencia |
|---|---|---|---|
| A — Produccion | 7 | 7 | 0 |
| B — Historico | 15 | 18 | +3 |
| C — Candidato aislamiento | 66 | 63 | -3 |
| D — Investigar | 0 | 0 | 0 |
| D-Riesgo | 0 | 0 | 0 |
| DATA_LOCAL | 4 | 4 | 0 |

Los 3 archivos reclasificados a B NO entran en ningun lote de Fase 1.

---

## 4. Alcance permitido de Fase 1 futura

Fase 1 futura, si se aprueba, solo podra:

1. Aislar/archivar los 63 archivos C.
2. Ejecutar por lotes de maximo 10 archivos.
3. Validar antes y despues de cada lote.
4. Generar commit separado por lote.
5. Documentar rollback por lote.
6. Crear archive_index.md.

Fase 1 NO podra:

1. Eliminar archivos directamente.
2. Tocar A produccion.
3. Tocar B historico.
4. Tocar DATA_LOCAL.
5. Ejecutar git add ..
6. Ejecutar git rm masivo.
7. Ejecutar git clean.
8. Tocar turnos.js o webhook.js.
9. Hacer deploy.

---

## 5. Exclusiones absolutas

Fase 1 NO toca:

- A — Produccion / conservar: 7 archivos
- B — Historico / archivar: 18 archivos
- D — 0 archivos
- D-Riesgo — 0 archivos
- DATA_LOCAL — 4 archivos
- turnos.js
- webhook.js
- respuestas.js
- validadores.js
- package.json
- package-lock.json
- .gitignore
- Supabase
- .env
- JSONs operativos

---

## 6. DATA_LOCAL

Mantener bloqueados:

- bitacora.json
- eventos.json
- reporte_turno.json
- turnos_activos.json

Regla:

DATA_LOCAL BLOQUEADO hasta cierre formal de BUG-002.

---

## 7. Estrategia de aislamiento

No usar eliminacion directa como accion primaria.

Los 63 C deben moverse a carpeta de archivo controlado:

docs/archive/repo_cleanup/fase_1/

Estructura propuesta:

docs/archive/
docs/archive/repo_cleanup/
docs/archive/repo_cleanup/fase_1/
docs/archive/repo_cleanup/fase_1/archive_index.md

Todo archivo movido debe registrarse en archive_index.md.

Los archivos trackeados requieren git mv.
Los archivos untracked requieren mv manual o Move-Item en PowerShell.

---

## 8. archive_index.md obligatorio

Fase 1 futura debe crear un indice con los siguientes campos para cada archivo:

- archivo original (nombre exacto)
- clasificacion (C)
- origen (untracked / trackeado)
- razon de clasificacion
- lote (numero de lote)
- fecha de aislamiento
- commit base
- accion tomada (movido a docs/archive/repo_cleanup/fase_1/)
- prueba realizada (node --check, git status)
- resultado (exito / fallo)
- rollback (comando para revertir si aplica)

El indice debe crearse ANTES de mover archivos.
El indice debe actualizarse DESPUES de mover cada lote.
El indice debe ser commitado con cada lote.

---

## 9. Ejecucion por lotes

Condicion GLM5: No Big Bang.

Reglas:

- Maximo 10 archivos por lote.
- Ideal: 6 a 10 archivos por lote.
- Commit separado por lote.
- Prueba minima despues de cada lote.
- Si falla un lote, STOP tecnico.
- Guillermo aprueba entre lotes.

---

## 10. Lotes sugeridos

### Lote 1 — Artefactos terminales + PDFs prueba (5 archivos)

Archivos de bajo riesgo. Sin codigo. Sin dependencias.

| # | Archivo | Tipo | Origen |
|---|---------|------|--------|
| 1 | et --hard 87806e1 | Artefacto terminal | Untracked |
| 2 | h origin main --force | Artefacto terminal | Trackeado |
| 3 | how --stat HEAD more | Artefacto terminal | Trackeado |
| 4 | conciliacion_test.pdf | PDF prueba | Trackeado |
| 5 | conciliacion_v21.pdf | PDF prueba | Trackeado |

Commit sugerido: chore: archive terminal artifacts + test PDFs (Lote 1)

### Lote 2 — fix_*.js untracked batch 1 (10 archivos)

Scripts one-time untracked de bajo riesgo.

| # | Archivo | Origen |
|---|---------|--------|
| 6 | fix_clean.js | Untracked |
| 7 | fix_debug.js | Untracked |
| 8 | fix_final.js | Untracked |
| 9 | fix_idempotency.js | Untracked |
| 10 | fix_op_final.js | Untracked |
| 11 | fix_operador.js | Untracked |
| 12 | fix_override_antes.js | Untracked |
| 13 | fix_override_final.js | Untracked |
| 14 | fix_override_top.js | Untracked |
| 15 | fix_paro_natural.js | Untracked |

Commit sugerido: chore: archive untracked temp scripts batch 2 (Lote 2)

### Lote 3 — fix_*.js untracked batch 2 (10 archivos)

Scripts one-time untracked de bajo riesgo.

| # | Archivo | Origen |
|---|---------|--------|
| 16 | fix_paro_top.js | Untracked |
| 17 | fix_pdf_reporte_final.js | Untracked |
| 18 | fix_pdfauto_final.js | Untracked |
| 19 | fix_pdfauto_resilient.js | Untracked |
| 20 | fix_quitar_residente.js | Untracked |
| 21 | fix_require_lazy.js | Untracked |
| 22 | fix_residente.js | Untracked |
| 23 | fix_sesion_prioridad.js | Untracked |
| 24 | fix_turnos_final.js | Untracked |
| 25 | fix_turnos_pdf.js | Untracked |

Commit sugerido: chore: archive untracked temp scripts batch 3 (Lote 3)

### Lote 4 — fix_*.js untracked batch 3 (10 archivos)

Scripts one-time untracked de bajo riesgo.

| # | Archivo | Origen |
|---|---------|--------|
| 26 | fix_turnos_simple.js | Untracked |
| 27 | fix_verificar.js | Untracked |
| 28 | fix_version.js | Untracked |
| 29 | fix_deepseek_f1.js | Untracked |
| 30 | fix_empresaIdTurno.js | Untracked |
| 31 | fix_move_override.js | Untracked |
| 32 | fix_router.js | Untracked |
| 33 | fix_router_override.js | Untracked |
| 34 | fix_turnos_empresa.js | Untracked |
| 35 | fix_turnos_empresa2.js | Untracked |

Commit sugerido: chore: archive untracked temp scripts batch 4 (Lote 4)

### Lote 5 — fix_*.js untracked batch 4 (3 archivos)

Ultimos scripts one-time untracked.

| # | Archivo | Origen |
|---|---------|--------|
| 36 | fix_twilio_client.js | Untracked |
| 37 | fix_webhook_legacy_override.js | Untracked |
| 38 | fix_webhook_legacy_v2.js | Untracked |

Commit sugerido: chore: archive untracked temp scripts batch 5 (Lote 5)

### Lote 6 — fix_*.js untracked batch 5 (7 archivos)

Ultimos scripts one-time untracked.

| # | Archivo | Origen |
|---|---------|--------|
| 39 | fix_webhook_line.js | Untracked |
| 40 | fix_webhook_override.js | Untracked |
| 41 | fix_webhook_status.js | Untracked |
| 42 | fix_status_callback.js | Untracked |
| 43 | fix_status2.js | Untracked |
| 44 | turnos_backup_pre_fix_empresaIdTurno.js | Untracked — NOTA: Este archivo es B, no C. Excluir de este lote. Ver nota abajo. |
| 45 | webhook_backup.js | Untracked — NOTA: Este archivo es B, no C. Excluir de este lote. Ver nota abajo. |

Correccion: turnos_backup_pre_fix_empresaIdTurno.js y webhook_backup.js son B (historico/archivar), NO C. Se excluyen de Fase 1.

Lote 6 corregido (5 archivos):

| # | Archivo | Origen |
|---|---------|--------|
| 39 | fix_webhook_line.js | Untracked |
| 40 | fix_webhook_override.js | Untracked |
| 41 | fix_webhook_status.js | Untracked |
| 42 | fix_status_callback.js | Untracked |
| 43 | fix_status2.js | Untracked |

Commit sugerido: chore: archive untracked temp scripts batch 6 (Lote 6)

### Lote 7 — fix_*.js trackeados genericos (9 archivos)

Scripts one-time trackeados. Requieren git mv.

| # | Archivo | Origen |
|---|---------|--------|
| 44 | fix1.js | Trackeado |
| 45 | fix3.js | Trackeado |
| 46 | fix4.js | Trackeado |
| 47 | fix5.js | Trackeado |
| 48 | fix6.js | Trackeado |
| 49 | fix8.js | Trackeado |
| 50 | fix9.js | Trackeado |
| 51 | fix11.js | Trackeado |
| 52 | fix12.js | Trackeado |

Commit sugerido: chore: archive tracked generic temp scripts (Lote 7)

### Lote 8 — fix_*.js trackeados con nombre (11 archivos)

Scripts one-time trackeados. Requieren git mv.

| # | Archivo | Origen |
|---|---------|--------|
| 53 | fix_ayuda.js | Trackeado |
| 54 | fix_integrar.js | Trackeado |
| 55 | fix_ok.js | Trackeado |
| 56 | fix_status.js | Trackeado |
| 57 | fix_upg01.js | Trackeado |
| 58 | fix_upg05.js | Trackeado |
| 59 | fix_upg05b.js | Trackeado |
| 60 | fix_upg09.js | Trackeado |
| 61 | fix_upg13_14.js | Trackeado |
| 62 | fix_upg26_27.js | Trackeado |
| 63 | fix_upgrades.js | Trackeado |

Commit sugerido: chore: archive tracked named temp scripts (Lote 8)

### Resumen de lotes

| Lote | Archivos | Tipo | Commit |
|---|---|---|---|
| 1 | 5 | Artefactos + PDFs | chore: archive terminal artifacts + test PDFs |
| 2 | 10 | Untracked batch 2 | chore: archive untracked temp scripts batch 2 |
| 3 | 10 | Untracked batch 3 | chore: archive untracked temp scripts batch 3 |
| 4 | 10 | Untracked batch 4 | chore: archive untracked temp scripts batch 4 |
| 5 | 3 | Untracked batch 5 | chore: archive untracked temp scripts batch 5 |
| 6 | 5 | Untracked batch 6 | chore: archive untracked temp scripts batch 6 |
| 7 | 9 | Trackeados genericos | chore: archive tracked generic temp scripts |
| 8 | 11 | Trackeados con nombre | chore: archive tracked named temp scripts |
| TOTAL | 63 | | 8 commits |

Nota: Los 3 archivos reclasificados a B (pdfReporteDiario.js, ver_case.js, webhook_test.js) NO entran en ningun lote de Fase 1. Se archivan en Fase 3 con los demas B.

---

## 11. Validacion antes de cada lote

Antes de mover cualquier lote:

1. git status
2. Busqueda de referencias para cada archivo del lote en todo el repo:
   Select-String -Path "turnos.js","webhook.js","package.json" -Pattern "[nombre_sin_extension]"
3. Confirmar que ningun archivo del lote esta en A/B/DATA_LOCAL.
4. Confirmar que ningun archivo del lote aparece referenciado en package.json, turnos.js, webhook.js, routes, lib, services, scripts o documentacion critica.

---

## 12. Comandos futuros permitidos para validacion

Solo lectura:

- git status
- git log --oneline -5
- git log --oneline -- [archivo]
- Select-String -Path "turnos.js","webhook.js","package.json" -Pattern "[nombre_sin_extension]"
- Select-String -Path "*.js" -Pattern "[nombre_sin_extension]"
- dir [archivo]
- Get-Content [archivo] -First 20

---

## 13. Comandos futuros de ejecucion

No escribir comandos destructivos todavia como autorizacion.
El documento describe que una ejecucion futura requiere comandos especificos por archivo, nunca masivos.

Para archivos untracked:

- Move-Item "[archivo]" "docs/archive/repo_cleanup/fase_1/"

Para archivos trackeados:

- git mv "[archivo]" "docs/archive/repo_cleanup/fase_1/"

Prohibido:

- git add .
- git rm masivo
- git clean
- del
- erase
- move masivo
- ren masivo

Regla: Cada archivo se mueve individualmente o en lote aprobado.

---

## 14. Rollback

Definir rollback por lote:

Antes de cada lote:

1. Confirmar commit base:
   git rev-parse HEAD
2. Guardar lista de archivos movidos del lote.
3. Confirmar que rollback es posible.

Si algo falla durante un lote:

1. Detener inmediatamente.
2. Reportar al equipo.
3. No intentar arreglar.
4. Si Guillermo autoriza, revertir:
   - Para untracked: devolver archivos a raiz.
   - Para trackeados: git mv de vuelta a raiz.
   - Si es necesario: git reset --hard [commit_base]
5. Verificar que el repo volvio al estado anterior.
6. Documentar el incidente.

Responsable rollback: MiMo V2.
Aprobacion rollback: Guillermo.

---

## 15. Prueba minima por lote

Despues de cada lote futuro:

1. git status
2. node --check webhook.js
3. node --check turnos.js
4. Si aplica: prueba minima INICIO/FIN simulada o staging funcional
5. Validar que no cambio DATA_LOCAL
6. Validar que no cambio A produccion

Criterio de exito:

- Sin errores nuevos.
- Sin archivos productivos modificados.
- Sin cambios en DATA_LOCAL.
- Sin cambios en turnos.js.
- Sin cambios en webhook.js.
- Sin cambios en JSONs operativos.
- Repo controlado.
- Commit de aislamiento especifico.

Criterio de fallo:

- node --check webhook.js falla.
- node --check turnos.js falla.
- git status muestra archivos modificados no esperados.
- Aparece referencia a un archivo C en codigo productivo.
- DATA_LOCAL aparece involucrado.

---

## 16. STOP tecnico

Debe detenerse toda ejecucion si ocurre cualquiera de estos casos:

1. Aparece referencia activa de un archivo C en codigo productivo.
2. Un archivo del lote parece B o A.
3. Aparece DATA_LOCAL involucrado.
4. Aparece contenido sensible.
5. falla node --check webhook.js.
6. falla node --check turnos.js.
7. git status muestra cambios inesperados.
8. Se propone git add ..
9. Se propone git rm masivo.
10. Se propone mover mas de 10 archivos sin aprobacion.
11. Hay duda sobre cualquier archivo.
12. Alguien propone borrar en vez de archivar.

Accion bajo STOP tecnico:

1. No continuar.
2. Reportar hallazgo.
3. No improvisar fix.
4. Volver a votacion.
5. Aplicar rollback solo si Guillermo lo autoriza.

---

## 17. Actualizaciones documentales posteriores a Fase 1 futura

Despues de ejecutar Fase 1 en el futuro, actualizar:

1. docs/context/13_CHANGELOG.md — entrada documental por lote.
2. docs/context/14_INVENTARIO_RAIZ_REPO.md — actualizar conteo de archivos.
3. docs/context/01_ESTADO_ACTUAL.yaml — si aplica.
4. docs/context/08_BUG_TRACKER.yaml — BUG-003 parcialmente resuelto.
5. docs/context/09_RISK_REGISTER.yaml — R-SCRIPTS-TEMP parcialmente mitigado.
6. docs/archive/repo_cleanup/fase_1/archive_index.md — indice completo.

---

## 18. Siguiente decision

Despues de crear este documento, la siguiente decision NO es ejecutar Fase 1.

La siguiente decision es:

GO / NO-GO para ejecutar Fase 1 — Lote 1.

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

## 19. Veredicto

22_PLAN_DEL_DIA_REPO_CLEANUP_FASE_1_63C.md queda como:

PLAN_DEL_DIA / EJECUCION_BLOQUEADA

Autoriza preparar votacion de ejecucion de Fase 1 Lote 1.
No autoriza ejecutar Fase 1.
No autoriza mover archivos.
No autoriza borrar archivos.
No autoriza archivar archivos.

---

## 20. Frase rectora

Fase 1 no borra: aislara por lotes, prueba y documenta.

---

*Nota final: Este documento NO autoriza limpieza, codigo, fixes, deploy, mover archivos, borrar archivos ni tocar DATA_LOCAL.*

*22_PLAN_DEL_DIA_REPO_CLEANUP_FASE_1_63C — IronSync A*
*Fecha: 2026-05-04*
*Estado: PLAN_DEL_DIA / EJECUCION_BLOQUEADA*
*Documento base: 16_REPO_CLEANUP_PLAN.md (ESTRATEGIA_FROZEN / EJECUCION_BLOQUEADA)*
*Documento evidencia: 21_PAQUETE_EVIDENCIA_CLASIFICACION_FINAL.md*
*Commit evidencia: b6d183c*
*Validacion externa: ChatGPT, DeepSeek, GLM5 — GO condicionado*
*Ajuste conservador: 3 archivos C reclasificados a B (pdfReporteDiario.js, ver_case.js, webhook_test.js)*
*Mapa ajustado: A=7, B=18, C=63, D=0, D-Riesgo=0, DATA_LOCAL=4*
*Lotes: 8 lotes de 5-11 archivos cada uno*
*Total archivos a aislar: 63*
*Frase rectora: Fase 1 no borra: aislara por lotes, prueba y documenta.*
