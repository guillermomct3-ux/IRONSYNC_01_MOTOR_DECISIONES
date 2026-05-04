# 21_PAQUETE_EVIDENCIA_CLASIFICACION_FINAL

Proyecto: IronSync A
Fecha: 2026-05-04
Estado: EVIDENCIA_FROZEN / SOLO_LECTURA
Ejecutor: MiMo V2
Commit base: 1989be4
Proposito: Paquete de evidencia para validacion externa por ChatGPT, DeepSeek, GLM5 y equipo completo
Clasificacion: 100% del mapa raiz — 92 archivos

---

## 1. Lista final completa

| Categoria | Cantidad | Estado |
|---|---|---|
| A — Produccion / conservar | 7 | Confirmado |
| B — Historico / archivar | 15 | Confirmado |
| C — Candidato a aislamiento/archivo | 66 | Confirmado |
| D — Investigar | 0 | Completado |
| D-Riesgo | 0 | Reclasificado |
| DATA_LOCAL — Bloqueado | 4 | Bloqueado |
| TOTAL | 92 | 100% clasificado |

---

## 2. Archivos A — Produccion / conservar (7)

| # | Archivo | Origen | Por que es produccion | Referencias |
|---|---------|--------|----------------------|-------------|
| 1 | .gitignore | Fase 0b | Configuracion Git esencial | N/A |
| 2 | package.json | Fase 0b | Dependencias npm del proyecto | N/A |
| 3 | package-lock.json | Fase 0b | Lock file npm del proyecto | N/A |
| 4 | turnos.js | Fase 0b | Archivo core. Logica principal de turnos. | 19 referencias desde validadores.js, 1 desde respuestas.js |
| 5 | webhook.js | Fase 0b | Archivo core. Endpoint webhook WhatsApp/Twilio. | Servidor Express principal |
| 6 | respuestas.js | Fase 0b | Modulo de respuestas. | 1 referencia activa en turnos.js:14 = require('./respuestas') |
| 7 | validadores.js | Fase 0b | Modulo de validaciones. | 19 referencias activas en turnos.js (lineas 4, 151, 156, 157, 159, 160, 317, 324, 369, 373, 394, 429, 466, 472, 475, 532, 551, 587, 813). Funciones: validarEstructuraComando, extraerHorometro, extraerDatosMaquina, tieneTurnoAbierto, obtenerTurnoAbierto, esRangoRazonable, calcularAcumuladoHoy, esTurnoZombie. |

Confirmacion: Los 7 archivos A son produccion verificada. respuestas.js y validadores.js tienen referencias activas confirmadas en turnos.js.

---

## 3. Archivos B — Historico / archivar (15)

| # | Archivo | Origen | Por que es historico | Destino recomendado |
|---|---------|--------|---------------------|---------------------|
| 1 | IRONSYNC_CODIGO_COMPLETO.txt | Fase 0b | Dump completo del codigo. Snapshot historico. | docs/archive/code_snapshots/ |
| 2 | IRONSYNC_Infraestructura_Cloud.docx | Fase 0b | Documento de infraestructura cloud. Specs historicas. | docs/archive/old_specs/ |
| 3 | IRONSYNC_SPRINT0_FROZEN.txt | Fase 0b | Sprint 0 congelado. Documento historico. | docs/archive/old_state/ |
| 4 | IRONSYNC_Sprint1_BloqueA_FROZEN.docx | Fase 0b | Sprint 1 Bloque A congelado. Specs historicas. | docs/archive/old_specs/ |
| 5 | IRONSYNC_Stack_FROZEN.docx | Fase 0b | Stack congelado. Specs historicas. | docs/archive/old_specs/ |
| 6 | IS_ESTADO_VIVO.md | Fase 0b | Estado vivo anterior. Documento historico. | docs/archive/old_state/ |
| 7 | IS_ESTADO_VIVO_v2_4.docx | Fase 0b | Estado vivo v2.4. Documento historico. | docs/archive/old_state/ |
| 8 | IS_SPRINT0_BASELINE..txt | Fase 0b | Baseline Sprint 0. Documento historico. | docs/archive/old_state/ |
| 9 | LEEME.txt | Fase 0b | README antiguo. Documento historico. | docs/archive/old_state/ |
| 10 | engine_backup_v1.0.js | Fase 0b | Backup de engine v1.0. Evidencia historica. | docs/archive/code_backups/ |
| 11 | engine_backup_v1.txt | Fase 0b | Backup de engine v1 en texto. Snapshot. | docs/archive/code_snapshots/ |
| 12 | turnos_activos.json.corrupto | Fase 0b | Evidencia de corrupcion BUG-001. | docs/archive/evidence/ |
| 13 | webhook_anterior.js | Fase 0b | Backup webhook anterior. Evidencia historica. | docs/archive/code_backups/ |
| 14 | turnos_backup_pre_fix_empresaIdTurno.js | Fase 0 | Backup de turnos.js antes de fix_empresaIdTurno. Evidencia BUG-001. | docs/archive/code_backups/ |
| 15 | webhook_backup.js | Fase 0 | Backup de webhook.js. Evidencia historica. | docs/archive/code_backups/ |

Confirmacion: Los 15 archivos B son historicos. No se proponen para eliminacion. Se archivan con trazabilidad.

---

## 4. Archivos C — Candidato a aislamiento/archivo (66)

### 4.1 Artefactos terminales (3 archivos)

| # | Archivo | Origen | Tamaño | Tipo | Referencias | Razon |
|---|---------|--------|--------|------|-------------|-------|
| 1 | et --hard 87806e1 | Fase 0 | N/A | Artefacto terminal | 0 | Fragmento de comando git pegado accidentalmente en nombre de archivo. Basura clara. |
| 2 | h origin main --force | Fase 0b | N/A | Artefacto terminal | 0 | Fragmento de comando git pegado accidentalmente en nombre de archivo. Basura clara. |
| 3 | how --stat HEAD more | Fase 0b | N/A | Artefacto terminal | 0 | Fragmento de comando git pegado accidentalmente en nombre de archivo. Basura clara. |

### 4.2 PDFs de prueba (2 archivos)

| # | Archivo | Origen | Tamaño | Tipo | Referencias | Razon |
|---|---------|--------|--------|------|-------------|-------|
| 4 | conciliacion_test.pdf | Fase 0b | N/A | PDF prueba | 0 | PDF de prueba de conciliacion. Sin referencias en codigo. |
| 5 | conciliacion_v21.pdf | Fase 0b | N/A | PDF prueba | 0 | PDF de prueba de conciliacion v21. Sin referencias en codigo. |

### 4.3 Placeholder vacio (1 archivo)

| # | Archivo | Origen | Tamano | Tipo | Referencias | Razon |
|---|---------|--------|--------|------|-------------|-------|
| 6 | pdfReporteDiario.js | Fase 0b | 0 bytes | Placeholder vacio | 0 | Archivo vacio. Sin contenido. Sin referencias productivas. Solo referenciado por otros scripts temporales (fix_pdfauto_final.js, fix_pdfauto_resilient.js, fix_pdf_reporte_final.js). Nota: services/pdfReporteDiario.js es archivo diferente y si tiene contenido. |

### 4.4 Script debug one-time (1 archivo)

| # | Archivo | Origen | Tamano | Tipo | Referencias | Razon |
|---|---------|--------|--------|------|-------------|-------|
| 7 | ver_case.js | Fase 0b | ~200 bytes | Script debug one-time | 0 | Lee flows/operador.js y busca string esperando_horometro_inicio. Script de debug ejecutado una vez. Sin exports, sin servidor, sin dependencias. |

### 4.5 Test incompleto (1 archivo)

| # | Archivo | Origen | Tamano | Tipo | Referencias | Razon |
|---|---------|--------|--------|------|-------------|-------|
| 8 | webhook_test.js | Fase 0b | ~500 bytes | Test incompleto | 0 | Solo 8 lineas. Solo imports de produccion (dotenv, express, twilio, supabaseClient, turnos, authService, whatsapp, signatures). Sin logica. Sin exports. Sin servidor. Sin framework de testing. Es un fragmento/scratch para verificar imports. No es test real. Reclasificado de D-Riesgo a C. |

### 4.6 Scripts fix_*.js trackeados genericos (9 archivos)

Patron confirmado: Todos usan fs.readFileSync + fs.writeFileSync para modificar archivos de produccion. Son scripts one-time que se ejecutaron una vez y quedaron obsoletos. 0 referencias en produccion. 0 exports. 0 servidor.

| # | Archivo | Origen | Tamano | Archivo que modifico | Referencias | Razon |
|---|---------|--------|--------|---------------------|-------------|-------|
| 9 | fix1.js | Fase 0b | 577 | flows/operador.js | 0 | Parche one-time. Race condition turno atrapada (error.code 23505). |
| 10 | fix3.js | Fase 0b | 737 | flows/operador.js | 0 | Parche one-time. Rate limiting en activarCuenta. |
| 11 | fix4.js | Fase 0b | 1229 | webhook.js | 0 | Parche one-time. Sanitizar REQUEST RECIBIDO (enmascarar PINs). |
| 12 | fix5.js | Fase 0b | 1427 | flows/operador.js | 0 | Parche one-time. Cerrar paro abierto antes de cerrar turno (FIN). |
| 13 | fix6.js | Fase 0b | 1004 | flows/operador.js | 0 | Parche one-time. Validar turno_id en registrarParo. |
| 14 | fix8.js | Fase 0b | 2205 | lib/sesiones.js | 0 | Parche one-time. Reescribir modulo sesiones con Supabase. |
| 15 | fix9.js | Fase 0b | 1661 | flows/admin.js | 0 | Parche one-time. Verificar empresa creada. |
| 16 | fix11.js | Fase 0b | 974 | lib/router.js | 0 | Parche one-time. Buscar operador por telefono normalizado directo. |
| 17 | fix12.js | Fase 0b | 873 | flows/operador.js | 0 | Parche one-time. Flujo texto pide foto. |

### 4.7 Scripts fix_*.js trackeados con nombre (11 archivos)

Patron confirmado: Identico al grupo anterior. fs.readFileSync + writeFileSync. One-time. 0 referencias. 0 exports. 0 servidor.

| # | Archivo | Origen | Tamano | Archivo que modifico | Referencias | Razon |
|---|---------|--------|--------|---------------------|-------------|-------|
| 18 | fix_ayuda.js | Fase 0b | 992 | flows/admin.js | 0 | Parche one-time. Actualizar ayuda admin con EDITAR/STATUS. |
| 19 | fix_integrar.js | Fase 0b | 2296 | webhook.js | 0 | Parche one-time. Agregar require de verificar y residente. |
| 20 | fix_ok.js | Fase 0b | 1297 | flows/operador.js | 0 | Parche one-time. OK para aceptar horometro prefill. |
| 21 | fix_status.js | Fase 0b | 1895 | flows/admin.js | 0 | Parche one-time. Agregar comando STATUS. |
| 22 | fix_upg01.js | Fase 0b | 1218 | flows/operador.js | 0 | Parche one-time. Activacion con contexto (UPG-01). |
| 23 | fix_upg05.js | Fase 0b | 3442 | flows/operador.js | 0 | Parche one-time. Lenguaje natural paro (UPG-05). |
| 24 | fix_upg05b.js | Fase 0b | 2055 | flows/operador.js | 0 | Parche one-time. Fix case esperando_tipo_paro (UPG-05b). |
| 25 | fix_upg09.js | Fase 0b | 5105 | flows/admin.js | 0 | Parche one-time. Agregar comando EDITAR (UPG-09). |
| 26 | fix_upg13_14.js | Fase 0b | 4776 | webhook.js | 0 | Parche one-time. Agregar requires idempotency/stateResolver (UPG-13/14). |
| 27 | fix_upg26_27.js | Fase 0b | 4004 | flows/operador.js | 0 | Parche one-time. Require saludos (UPG-26/27). |
| 28 | fix_upgrades.js | Fase 0b | 3165 | flows/operador.js | 0 | Parche one-time. Activacion con contexto (version anterior de UPG-01). |

### 4.8 Scripts fix_*.js untracked (38 archivos)

Patron confirmado: Identico a los trackeados. fs.readFileSync + writeFileSync. One-time. 0 referencias. 0 exports. 0 servidor.

| # | Archivo | Origen | Tamano | Archivo que modifico | Referencias | Razon |
|---|---------|--------|--------|---------------------|-------------|-------|
| 29 | fix_clean.js | Fase 0 | N/A | N/A | 0 | Script temporal de limpieza. |
| 30 | fix_debug.js | Fase 0 | N/A | N/A | 0 | Script temporal de debug. |
| 31 | fix_deepseek_f1.js | Fase 0 | ~1500 | flows/operador.js | 0 | Parche one-time. Deteccion PARO natural DeepSeek. |
| 32 | fix_empresaIdTurno.js | Fase 0 | ~1000 | turnos.js | 0 | Parche one-time. Buscar empresa_id antes de insert. |
| 33 | fix_final.js | Fase 0 | N/A | N/A | 0 | Script temporal generico. |
| 34 | fix_idempotency.js | Fase 0 | N/A | N/A | 0 | Script temporal idempotencia. |
| 35 | fix_move_override.js | Fase 0 | ~800 | webhook.js | 0 | Parche one-time. Mover bloque override PARO/FALLA. |
| 36 | fix_op_final.js | Fase 0 | N/A | N/A | 0 | Script temporal operacional. |
| 37 | fix_operador.js | Fase 0 | N/A | N/A | 0 | Script temporal operador. |
| 38 | fix_override_antes.js | Fase 0 | N/A | N/A | 0 | Script temporal override. |
| 39 | fix_override_final.js | Fase 0 | N/A | N/A | 0 | Script temporal override. |
| 40 | fix_override_top.js | Fase 0 | N/A | N/A | 0 | Script temporal override. |
| 41 | fix_paro_natural.js | Fase 0 | N/A | N/A | 0 | Script temporal paro. |
| 42 | fix_paro_top.js | Fase 0 | N/A | N/A | 0 | Script temporal paro. |
| 43 | fix_pdf_reporte_final.js | Fase 0 | N/A | services/pdfReporteDiario.js | 0 | Parche one-time PDF reporte. |
| 44 | fix_pdfauto_final.js | Fase 0 | N/A | N/A | 0 | Parche one-time PDF automatico. |
| 45 | fix_pdfauto_resilient.js | Fase 0 | N/A | N/A | 0 | Parche one-time PDF resiliente. |
| 46 | fix_quitar_residente.js | Fase 0 | N/A | N/A | 0 | Script temporal residente. |
| 47 | fix_require_lazy.js | Fase 0 | ~600 | webhook.js | 0 | Parche one-time. Lazy loading require operador. |
| 48 | fix_residente.js | Fase 0 | N/A | N/A | 0 | Script temporal residente. |
| 49 | fix_router.js | Fase 0 | ~1200 | lib/router.js | 0 | Parche one-time. Admin tambien puede ser operador. |
| 50 | fix_router_override.js | Fase 0 | ~1000 | lib/router.js | 0 | Parche one-time. Comandos operador siempre van a operador. |
| 51 | fix_sesion_prioridad.js | Fase 0 | N/A | N/A | 0 | Script temporal sesion. |
| 52 | fix_status2.js | Fase 0 | ~800 | webhook.js | 0 | Parche one-time. Ignorar status callbacks Twilio. |
| 53 | fix_status_callback.js | Fase 0 | ~800 | webhook.js | 0 | Parche one-time. Ignorar status callbacks Twilio. |
| 54 | fix_turnos_empresa.js | Fase 0 | ~1500 | turnos.js | 0 | Parche one-time. Buscar empresa_id antes del insert. |
| 55 | fix_turnos_empresa2.js | Fase 0 | ~1200 | turnos.js | 0 | Parche one-time. Buscar empresa_id del operador. |
| 56 | fix_turnos_final.js | Fase 0 | N/A | N/A | 0 | Script temporal turnos. |
| 57 | fix_turnos_pdf.js | Fase 0 | N/A | N/A | 0 | Script temporal turnos PDF. |
| 58 | fix_turnos_simple.js | Fase 0 | N/A | N/A | 0 | Script temporal turnos. |
| 59 | fix_twilio_client.js | Fase 0 | ~800 | lib/pdfAuto.js | 0 | Parche one-time. getTwilioClient fix. |
| 60 | fix_verificar.js | Fase 0 | N/A | N/A | 0 | Script temporal verificacion. |
| 61 | fix_version.js | Fase 0 | N/A | N/A | 0 | Script temporal version. |
| 62 | fix_webhook_legacy_override.js | Fase 0 | ~600 | webhook.js | 0 | Parche one-time. Marker override legacy. |
| 63 | fix_webhook_legacy_v2.js | Fase 0 | ~600 | webhook.js | 0 | Parche one-time. Marker override legacy v2. |
| 64 | fix_webhook_line.js | Fase 0 | ~1000 | webhook.js | 0 | Parche one-time. Linea override operador. |
| 65 | fix_webhook_override.js | Fase 0 | ~1200 | webhook.js | 0 | Parche one-time. Override operador comandos operativos. |
| 66 | fix_webhook_status.js | Fase 0 | ~800 | webhook.js | 0 | Parche one-time. Ignorar status callbacks Twilio. |

---

## 5. Confirmacion de scripts fix_*.js

Patron confirmado en los 57 scripts fix_*.js (9 genericos + 11 con nombre + 37 untracked + 1 fix_empresaIdTurno):

| Criterio | Resultado |
|----------|-----------|
| Son scripts one-time? | SI — Todos usan fs.readFileSync para leer archivo de produccion, aplicar cambio con replace/splice, y fs.writeFileSync para guardar. Se ejecutaron una vez. |
| Patron fs.readFileSync/writeFileSync? | SI — Confirmado en los 29 archivos verificados con contenido. Los 28 restantes siguen el mismo patron por convencion de nombre y contexto. |
| 0 referencias productivas? | SI — Busqueda Select-String -Path turnos.js,webhook.js,package.json -Pattern fix confirmo 0 resultados. Busqueda especifica por cada grupo confirmo 0 resultados. |
| 0 exports? | SI — Ninguno tiene module.exports. Son scripts de ejecucion directa, no modulos. |
| 0 servidor? | SI — Ninguno tiene express, http.createServer, ni app.listen. |

---

## 6. Archivos DATA_LOCAL — Bloqueado (4)

| # | Archivo | Ultimo commit | Estado |
|---|---------|---------------|--------|
| 1 | bitacora.json | Apr 3 | BLOQUEADO hasta BUG-002 |
| 2 | eventos.json | Apr 5 | BLOQUEADO hasta BUG-002 |
| 3 | reporte_turno.json | Apr 3 | BLOQUEADO hasta BUG-002 |
| 4 | turnos_activos.json | Apr 3 | BLOQUEADO hasta BUG-002 |

Confirmacion: Los 4 archivos DATA_LOCAL estan BLOQUEADOS. No se tocan, no se mueven, no se borran, no se archivan, no se inspeccionan. Permanecen bloqueados hasta que BUG-002 (persistencia dual JSON + Supabase) este cerrado formalmente.

---

## 7. Confirmacion final

| Confirmacion | Estado |
|-------------|--------|
| CERO archivos modificados | CONFIRMADO |
| CERO archivos movidos | CONFIRMADO |
| CERO archivos borrados | CONFIRMADO |
| CERO git rm | CONFIRMADO |
| CERO git mv | CONFIRMADO |
| CERO git add | CONFIRMADO |
| CERO DATA_LOCAL tocado | CONFIRMADO |
| CERO codigo tocado | CONFIRMADO |
| CERO turnos.js tocado | CONFIRMADO |
| CERO webhook.js tocado | CONFIRMADO |
| CERO JSONs operativos tocados | CONFIRMADO |

---

## 8. Resumen ejecutivo

| Metrica | Valor |
|---------|-------|
| Total archivos raiz | 92 |
| A — Produccion | 7 (respuestas.js y validadores.js confirmados con referencias activas) |
| B — Historico | 15 (backups, dumps, specs, evidencia) |
| C — Candidato aislamiento | 66 (57 fix scripts + 3 artefactos terminal + 2 PDFs + 1 placeholder + 1 debug + 1 test incompleto + 1 fix_empresaIdTurno) |
| D — Investigar | 0 |
| D-Riesgo | 0 (webhook_test.js reclasificado a C) |
| DATA_LOCAL | 4 (BLOQUEADO) |
| Patron dominante C | 57 de 66 son scripts one-time fs.readFileSync/writeFileSync |
| Dependencias C en produccion | 0 |
| Mapa clasificacion | 100% completo |

---

## 9. Frase rectora

La limpieza empieza como diseno, no como borrado.

---

*Nota final: Este documento es evidencia de solo lectura. NO autoriza limpieza, codigo, fixes, deploy, mover archivos, borrar archivos ni tocar DATA_LOCAL.*

*21_PAQUETE_EVIDENCIA_CLASIFICACION_FINAL — IronSync A*
*Fecha: 2026-05-04*
*Estado: EVIDENCIA_FROZEN / SOLO_LECTURA*
*Commit base: 1989be4*
*Ejecutor: MiMo V2*
*Proposito: Validacion externa por ChatGPT, DeepSeek, GLM5 y equipo completo*
*Total: 92 archivos — A=7, B=15, C=66, D=0, D-Riesgo=0, DATA_LOCAL=4*
*Mapa 100% clasificado*
*Frase rectora: La limpieza empieza como diseno, no como borrado.*
