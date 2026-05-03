# IRONSYNC A — INVENTARIO RAÍZ DEL REPO

## Metadata

| Campo | Valor |
|-------|-------|
| Documento | 14_INVENTARIO_RAIZ_REPO.md |
| Fecha | 2026-05-03 |
| Commit inspeccionado | ff00b2c711dbc5125fea6718fd9eb496eda1d353 |
| Conteo archivos raíz | 93 |
| Conteo carpetas raíz | 15 |
| Alcance | Raíz del repositorio solamente |
| Autor | MiMo V2 |
| Estado | FROZEN v1.1 — Red Team aprobado |

## Propósito

Inventario factual de todos los archivos ubicados directamente en la raíz del repositorio IRONSYNC_01_MOTOR_DECISIONES.
Este documento alimenta:
- 04_REBASELINE_REPORT.md
- 05_MASTER_BASELINE.md
- Futura limpieza controlada

## ADVERTENCIA OBLIGATORIA

Este inventario NO autoriza limpieza. Ningún archivo puede moverse, borrarse o modificarse basándose únicamente en este documento. Toda limpieza requiere aprobación formal de Guillermo y debe ejecutarse en una fase posterior de Limpieza Controlada.

## Alcance

Este inventario cubre:
- Archivos ubicados directamente en la raíz del repo
- Carpetas ubicadas directamente en la raíz del repo (solo nombres, no contenido interno)

NO cubre todavía:
- Inventario detallado interno de /services
- Inventario detallado interno de /routes
- Inventario detallado interno de /docs
- Inventario detallado interno de /flows
- Inventario detallado interno de /lib
- Inventario detallado interno de /api
- Inventario detallado interno de /db
- Inventario detallado interno de /scripts
- Inventario detallado interno de /DECISIONES
- Inventario detallado interno de /ENGINE
- Inventario detallado interno de /SPECS
- Inventario detallado interno de /cron
- Inventario detallado interno de /jobs
- Inventario detallado interno de /webhooks
- Inventario detallado interno de /node_modules

Esos inventarios quedan para fase posterior si Guillermo los aprueba.

## Metodología de inspección

Datos obtenidos mediante comandos de solo lectura ejecutados en PowerShell local:
- git rev-parse HEAD → hash del commit
- (Get-ChildItem -File).Count → conteo archivos
- (Get-ChildItem -Directory).Count → conteo carpetas
- Get-ChildItem -File | Select-Object Name,Length,LastWriteTime → listado detallado
- Get-ChildItem -Directory | Select-Object Name,LastWriteTime → listado carpetas
- git ls-files .env → verificación tracking git de .env

Verificación de .env: git ls-files .env devolvió resultado vacío. Esto confirma que .env existe en disco pero NO está trackeado por git. El archivo .gitignore (23 bytes) está excluyéndolo correctamente.

---

## INVENTARIO DE ARCHIVOS — RAÍZ

### 1. CONFIGURACIÓN Y ENTORNO

| # | archivo | length | ultima_modificacion | clasificacion | estado | riesgo | accion_futura_sugerida | tocar_ahora |
|---|---------|--------|---------------------|---------------|--------|--------|----------------------|-------------|
| 1 | .env | 182 B | 04/04/2026 | CONFIG_LOCAL | Activo en disco, NO trackeado por git | Bajo | .gitignore lo excluye correctamente. Mantener como está. | NO |
| 2 | .gitignore | 23 B | 03/04/2026 | CONFIG_LOCAL | Activo | ALTO | Solo 23 bytes — verificar que excluya además JSONs locales, PDFs de prueba, archivos temporales | NO |
| 3 | package.json | 373 B | 30/04/2026 | PRODUCCION | Activo | Bajo | Mantener | NO |
| 4 | package-lock.json | 50895 B | 30/04/2026 | PRODUCCION | Activo | Bajo | Mantener | NO |

### 2. ARCHIVOS DE PRODUCCIÓN (código del sistema)

| # | archivo | length | ultima_modificacion | clasificacion | estado | riesgo | accion_futura_sugerida | tocar_ahora |
|---|---------|--------|---------------------|---------------|--------|--------|----------------------|-------------|
| 5 | turnos.js | 30999 B | 02/05/2026 | PRODUCCION | Activo | CRÍTICO | Lógica core turnos — God Object junto con webhook.js. Separar en módulos | NO |
| 6 | webhook.js | 14357 B | 01/05/2026 | PRODUCCION | Activo | CRÍTICO | God Object — separar en routers + middleware | NO |
| 7 | respuestas.js | 4083 B | 22/04/2026 | PRODUCCION | Activo | Medio | Documentar función | NO |
| 8 | validadores.js | 3097 B | 27/04/2026 | PRODUCCION | Activo | Medio | Documentar función | NO |
| 9 | pdfReporteDiario.js | 0 B | 26/04/2026 | DESCONOCIDO/PLACEHOLDER | VACÍO | Medio | 0 bytes — sin contenido, sin prueba de uso. Candidato a eliminación en Fase de Limpieza Controlada, previa aprobación de Guillermo | NO |

### 3. ARCHIVOS DE RESPALDO Y BACKUP

| # | archivo | length | ultima_modificacion | clasificacion | estado | riesgo | accion_futura_sugerida | tocar_ahora |
|---|---------|--------|---------------------|---------------|--------|--------|----------------------|-------------|
| 10 | engine_backup_v1.0.js | 5409 B | 28/03/2026 | BACKUP | Inactivo | Medio | Candidato a mover a /legacy en Fase de Limpieza Controlada | NO |
| 11 | engine_backup_v1.txt | 2790 B | 27/03/2026 | BACKUP | Inactivo | Bajo | Candidato a mover a /legacy o eliminar en Fase de Limpieza Controlada | NO |
| 12 | webhook_anterior.js | 4722 B | 20/04/2026 | BACKUP | Inactivo | Medio | Candidato a mover a /legacy en Fase de Limpieza Controlada | NO |
| 13 | webhook_backup.js | 28586 B | 30/04/2026 | BACKUP | Inactivo | Medio | Candidato a mover a /legacy en Fase de Limpieza Controlada | NO |
| 14 | webhook_test.js | 589 B | 22/04/2026 | BACKUP | Inactivo | Bajo | Candidato a mover a /legacy o eliminar en Fase de Limpieza Controlada | NO |
| 15 | turnos_backup_pre_fix_empresaIdTurno.js | 31599 B | 01/05/2026 | BACKUP | Inactivo | Medio | Candidato a mover a /legacy en Fase de Limpieza Controlada | NO |

### 4. SCRIPTS TEMPORAL_FIX (fix_*.js) — 58 archivos

| # | archivo | length | ultima_modificacion | clasificacion | estado | riesgo | accion_futura_sugerida | tocar_ahora |
|---|---------|--------|---------------------|---------------|--------|--------|----------------------|-------------|
| 16 | fix1.js | 577 B | 29/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 17 | fix3.js | 737 B | 29/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 18 | fix4.js | 1229 B | 29/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 19 | fix5.js | 1427 B | 29/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 20 | fix6.js | 1004 B | 29/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 21 | fix8.js | 2205 B | 29/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 22 | fix9.js | 1661 B | 29/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 23 | fix11.js | 974 B | 29/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 24 | fix12.js | 873 B | 29/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 25 | fix_ayuda.js | 992 B | 30/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 26 | fix_clean.js | 1648 B | 30/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 27 | fix_debug.js | 752 B | 01/05/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 28 | fix_deepseek_f1.js | 3776 B | 30/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 29 | fix_empresaIdTurno.js | 3841 B | 02/05/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 30 | fix_final.js | 3032 B | 30/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 31 | fix_idempotency.js | 510 B | 01/05/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 32 | fix_integrar.js | 2296 B | 30/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 33 | fix_move_override.js | 1180 B | 30/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 34 | fix_ok.js | 1297 B | 29/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 35 | fix_operador.js | 3275 B | 01/05/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 36 | fix_op_final.js | 2960 B | 01/05/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 37 | fix_override_antes.js | 3225 B | 30/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 38 | fix_override_final.js | 1700 B | 30/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 39 | fix_override_top.js | 1623 B | 30/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 40 | fix_paro_natural.js | 1152 B | 30/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 41 | fix_paro_top.js | 1418 B | 30/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 42 | fix_pdfauto_final.js | 1178 B | 01/05/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 43 | fix_pdfauto_resilient.js | 3298 B | 01/05/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 44 | fix_pdf_reporte_final.js | 2838 B | 01/05/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 45 | fix_quitar_residente.js | 1296 B | 30/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 46 | fix_require_lazy.js | 1341 B | 30/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 47 | fix_residente.js | 1217 B | 30/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 48 | fix_router.js | 1965 B | 30/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 49 | fix_router_override.js | 981 B | 01/05/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 50 | fix_sesion_prioridad.js | 4055 B | 30/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 51 | fix_status.js | 1895 B | 29/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 52 | fix_status2.js | 793 B | 30/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 53 | fix_status_callback.js | 1342 B | 30/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 54 | fix_turnos_empresa.js | 2901 B | 01/05/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 55 | fix_turnos_empresa2.js | 2507 B | 01/05/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 56 | fix_turnos_final.js | 2979 B | 01/05/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 57 | fix_turnos_pdf.js | 1893 B | 01/05/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 58 | fix_turnos_simple.js | 1296 B | 01/05/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 59 | fix_twilio_client.js | 2033 B | 01/05/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 60 | fix_upg01.js | 1218 B | 29/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 61 | fix_upg05.js | 3442 B | 30/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 62 | fix_upg05b.js | 2055 B | 30/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 63 | fix_upg09.js | 5105 B | 30/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 64 | fix_upg13_14.js | 4776 B | 30/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 65 | fix_upg26_27.js | 4004 B | 29/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 66 | fix_upgrades.js | 3165 B | 29/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 67 | fix_verificar.js | 908 B | 30/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 68 | fix_version.js | 207 B | 30/04/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 69 | fix_webhook_legacy_override.js | 1662 B | 01/05/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 70 | fix_webhook_legacy_v2.js | 1967 B | 01/05/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 71 | fix_webhook_line.js | 1342 B | 01/05/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 72 | fix_webhook_override.js | 1243 B | 01/05/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |
| 73 | fix_webhook_status.js | 847 B | 01/05/2026 | TEMPORAL_FIX | Obsoleto | Medio | Candidato a mover a /legacy o eliminar | NO |

### 5. DATA_LOCAL (JSONs de estado local)

| # | archivo | length | ultima_modificacion | clasificacion | estado | riesgo | accion_futura_sugerida | tocar_ahora |
|---|---------|--------|---------------------|---------------|--------|--------|----------------------|-------------|
| 74 | bitacora.json | 2918 B | 26/03/2026 | DATA_LOCAL | Activo | ALTO | R-PERSISTENCIA-DUAL — migrar a Supabase | NO |
| 75 | eventos.json | 6529 B | 04/04/2026 | DATA_LOCAL | Activo | ALTO | R-PERSISTENCIA-DUAL — migrar a Supabase | NO |
| 76 | reporte_turno.json | 2328 B | 29/03/2026 | DATA_LOCAL | Activo | ALTO | R-PERSISTENCIA-DUAL — migrar a Supabase | NO |
| 77 | turnos_activos.json | 376 B | 02/04/2026 | DATA_LOCAL | Activo | CRÍTICO | R-PERSISTENCIA-DUAL — fuente de split-brain | NO |
| 78 | turnos_activos.json.corrupto | 7 B | 02/04/2026 | DATA_LOCAL | Corrupto | Medio | Evidencia de fallo de persistencia. Candidato a archivar o eliminar | NO |

### 6. PDF_PRUEBA

| # | archivo | length | ultima_modificacion | clasificacion | estado | riesgo | accion_futura_sugerida | tocar_ahora |
|---|---------|--------|---------------------|---------------|--------|--------|----------------------|-------------|
| 79 | conciliacion_test.pdf | 1814 B | 11/04/2026 | PDF_PRUEBA | Obsoleto | Bajo | Candidato a eliminar en Fase de Limpieza Controlada | NO |
| 80 | conciliacion_v21.pdf | 2374 B | 11/04/2026 | PDF_PRUEBA | Obsoleto | Bajo | Candidato a eliminar en Fase de Limpieza Controlada | NO |

### 7. DOCUMENTOS ANTIGUOS Y DE ESTADO

| # | archivo | length | ultima_modificacion | clasificacion | estado | riesgo | accion_futura_sugerida | tocar_ahora |
|---|---------|--------|---------------------|---------------|--------|--------|----------------------|-------------|
| 81 | LEEME.txt | 584 B | 25/03/2026 | DOC_ANTIGUO | Antiguo | Bajo | Candidato a reemplazar por README.md | NO |
| 82 | IS_ESTADO_VIVO.md | 603 B | 30/04/2026 | DOCUMENTO_ESTADO | Antiguo | Medio | Candidato a archivar en /docs/history | NO |
| 83 | IS_ESTADO_VIVO_v2_4.docx | 12090 B | 02/04/2026 | DOCUMENTO_ESTADO | Antiguo | Medio | Candidato a archivar en /docs/history | NO |
| 84 | IS_SPRINT0_BASELINE..txt | 1025 B | 31/03/2026 | DOCUMENTO_ESTADO | Antiguo | Medio | Candidato a archivar en /docs/history | NO |
| 85 | IRONSYNC_CODIGO_COMPLETO.txt | 57812 B | 29/04/2026 | DOCUMENTO_ESTADO | Activo | Medio | 57KB — dump completo de código. Documentar propósito | NO |
| 86 | IRONSYNC_Infraestructura_Cloud.docx | 11089 B | 02/04/2026 | DOCUMENTO_ESTADO | Antiguo | Medio | Candidato a archivar en /docs/history | NO |
| 87 | IRONSYNC_SPRINT0_FROZEN.txt | 0 B | 01/04/2026 | DOCUMENTO_ESTADO | VACÍO | Bajo | 0 bytes — placeholder. Candidato a eliminar o completar | NO |
| 88 | IRONSYNC_Sprint1_BloqueA_FROZEN.docx | 13179 B | 02/04/2026 | DOCUMENTO_ESTADO | Antiguo | Medio | Candidato a archivar en /docs/history | NO |
| 89 | IRONSYNC_Stack_FROZEN.docx | 13203 B | 02/04/2026 | DOCUMENTO_ESTADO | Antiguo | Medio | Candidato a archivar en /docs/history | NO |

### 8. SCRIPT_VERIFICACION

| # | archivo | length | ultima_modificacion | clasificacion | estado | riesgo | accion_futura_sugerida | tocar_ahora |
|---|---------|--------|---------------------|---------------|--------|--------|----------------------|-------------|
| 90 | ver_case.js | 427 B | 29/04/2026 | SCRIPT_VERIFICACION | Inactivo | Bajo | Candidato a mover a /scripts | NO |

### 9. ARTEFACTOS DE TERMINAL (archivos accidentales)

| # | archivo | length | ultima_modificacion | clasificacion | estado | riesgo | accion_futura_sugerida | tocar_ahora |
|---|---------|--------|---------------------|---------------|--------|--------|----------------------|-------------|
| 91 | et --hard 87806e1 | 2553 B | 30/04/2026 | DESCONOCIDO | Basura | ALTO | Parece git reset --hard guardado como archivo. Candidato a eliminación en Fase de Limpieza Controlada | NO |
| 92 | h origin main --force | 390 B | 06/04/2026 | DESCONOCIDO | Basura | ALTO | Parece git push --force guardado como archivo. Candidato a eliminación en Fase de Limpieza Controlada | NO |
| 93 | how --stat HEAD more | 424 B | 05/04/2026 | DESCONOCIDO | Basura | Bajo | Parece git show --stat guardado como archivo. Candidato a eliminación en Fase de Limpieza Controlada | NO |

---

## INVENTARIO DE CARPETAS — RAÍZ

| # | carpeta | ultima_modificacion | notas |
|---|---------|---------------------|-------|
| 1 | api | 09/04/2026 | Inventario interno pendiente |
| 2 | cron | 09/04/2026 | Inventario interno pendiente |
| 3 | db | 28/04/2026 | Inventario interno pendiente |
| 4 | DECISIONES | 09/04/2026 | Inventario interno pendiente |
| 5 | docs | 02/05/2026 | Contiene /context. Inventario interno pendiente |
| 6 | ENGINE | 29/03/2026 | Inventario interno pendiente |
| 7 | flows | 01/05/2026 | Inventario interno pendiente |
| 8 | jobs | 28/04/2026 | Inventario interno pendiente |
| 9 | lib | 01/05/2026 | Inventario interno pendiente |
| 10 | node_modules | 30/04/2026 | Dependencias npm. No inventariar |
| 11 | routes | 29/04/2026 | Inventario interno pendiente |
| 12 | scripts | 11/04/2026 | Inventario interno pendiente |
| 13 | services | 26/04/2026 | Inventario interno pendiente |
| 14 | SPECS | 27/03/2026 | Inventario interno pendiente |
| 15 | webhooks | 09/04/2026 | Inventario interno pendiente |

---

## RESUMEN EJECUTIVO

| Clasificación | Cantidad | % del total |
|---------------|----------|-------------|
| PRODUCCION | 5 | 5.4% |
| CONFIG_LOCAL | 2 | 2.2% |
| DESCONOCIDO/PLACEHOLDER | 1 | 1.1% |
| TEMPORAL_FIX | 58 | 62.4% |
| BACKUP | 6 | 6.5% |
| DATA_LOCAL | 5 | 5.4% |
| PDF_PRUEBA | 2 | 2.2% |
| DOCUMENTO_ESTADO | 8 | 8.6% |
| DOC_ANTIGUO | 1 | 1.1% |
| SCRIPT_VERIFICACION | 1 | 1.1% |
| DESCONOCIDO (basura) | 3 | 3.2% |
| **TOTAL** | **93** | **100%** |

---

## HALLAZGOS CRÍTICOS

1. 58 archivos TEMPORAL_FIX = 62.4% del repo raíz. Son deuda técnica pura. El repo tiene más basura que código.
2. Solo 5 archivos son PRODUCCIÓN real en raíz: turnos.js, webhook.js, respuestas.js, validadores.js, package.json/package-lock.json. Todo lo demás es código productivo dentro de subcarpetas.
3. 3 archivos de BASURA (artefactos de terminal): et --hard 87806e1, h origin main --force, how --stat HEAD more. Parecen comandos de git guardados accidentalmente como archivos.
4. .env existe en disco pero NO está trackeado por git — git ls-files .env devolvió vacío. .gitignore lo excluye correctamente. Riesgo R-ENV-EXPOSED reducido a BAJO.
5. 2 archivos VACÍOS (0 bytes): pdfReporteDiario.js e IRONSYNC_SPRINT0_FROZEN.txt. Placeholders sin contenido.
6. turnos_activos.json.corrupto (7 bytes) — evidencia de fallo de persistencia. El archivo corrupto sigue en el repo.
7. R-PERSISTENCIA-DUAL confirmado: 4 JSONs de datos locales coexisten con Supabase. turnos_activos.json es la fuente de split-brain.
8. IRONSYNC_CODIGO_COMPLETO.txt pesa 57KB — dump de código fuente en texto plano dentro del repo. Propósito no documentado.
9. Versiones duplicadas no claras: webhook.js vs webhook_anterior.js vs webhook_backup.js vs webhook_test.js. Sin documentación de cuál es la activa.
10. .gitignore = 23 bytes — extremadamente pequeño. Verificar que excluya JSONs locales, PDFs de prueba, archivos temporales.

---

## RIESGOS REGISTRADOS

| ID | Riesgo | Probabilidad | Impacto |
|----|--------|-------------|---------|
| R-PERSISTENCIA-DUAL | turnos_activos.json + Supabase crean split-brain | Alta | Crítico |
| R-ENV-EXPOSED | .env trackeado por git puede contener secrets | Baja (confirmado: .gitignore lo excluye) | Crítico |
| R-CONTEXTO | AIs pierden contexto entre chats si no leen /docs/context | Alta | Alto |
| R-SCRIPTS-TEMP | 58 fix_*.js confunden versiones y pueden ejecutarse por error | Alta | Alto |
| R-VERSIONES-DUALES | 4 versiones de webhook sin claridad de activa | Media | Alto |
| R-RAIZ-DEORDENADA | 93 archivos en raíz, 62% es basura | Alta | Alto |
| R-ARTEFACTOS-TERMINAL | 3 archivos basura de comandos git guardados como archivos | Media | Medio |
| R-ARCHIVOS-VACIOS | 2 archivos de 0 bytes sin propósito | Baja | Bajo |

---

## PRÓXIMA ACCIÓN

Después de auditoría de este inventario por el equipo:
1. Decidir destino de TEMPORAL_FIX (58 archivos) — candidatos a mover a /legacy
2. Decidir destino de DATA_LOCAL (5 JSONs) — migrar a Supabase
3. Decidir destino de PDF_PRUEBA (2 PDFs) — candidatos a eliminar
4. Decidir destino de DESCONOCIDO/basura (3 archivos) — candidatos a eliminar
5. Verificar .gitignore — qué excluye realmente más allá de .env
6. Alimentar 04_REBASELINE_REPORT.md con datos de este inventario

---

*Inventario hecho contra commit ff00b2c711dbc5125fea6718fd9eb496eda1d353.*
*Sin archivos movidos, borrados o modificados.*
*93 archivos raíz. 15 carpetas raíz.*
*Este inventario NO autoriza limpieza.*
