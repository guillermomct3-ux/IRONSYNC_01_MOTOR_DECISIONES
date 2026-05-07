# ═══════════════════════════════════════════════════════════
# DOC 32 — PLAN LABORATORIO SINTETICO S01-S20
# Fecha: 2026-05-07
# Autor: MiMo V2
# Revisores: ChatGPT, Claude, Qwen
# Estado: DRAFT — Pendiente War Room GO/NO-GO
# ═══════════════════════════════════════════════════════════

## 1. OBJETIVO

Validar integracion INICIO/FIN en entorno controlado antes de cualquier
piloto o Lote 3 RELEVO.

El Laboratorio Sintetico S01-S20 es una serie de 20 tests secuenciales
que verifican el comportamiento del sistema IronSync con LOGBOOK_F04_ENABLED=true
en un entorno controlado, usando datos sinteticos, sin afectar produccion.

## 2. ALCANCE

### Incluido:
- F-04.1 INICIO directo con horometro
- F-04.1 INICIO sin horometro (sesion QR)
- F-04.1 FIN directo con horometro
- F-04.1 FIN sin horometro (sesion QR)
- Validacion horometro invalido
- Validacion horometro regresivo
- Validacion equipo inexistente
- Validacion operador no autorizado
- Validacion turno duplicado
- Verificacion legacy intacto
- Verificacion Supabase
- Verificacion remanentes excluidos

### No incluido:
- RELEVO (Lote 3 bloqueado)
- ZOMBIE
- FOTO
- PARO / FALLA / REANUDA
- HORAS
- PDF Reporte Diario
- Produccion real DPM
- Datos de clientes reales

## 3. ESTADO INICIAL REQUERIDO

Antes de iniciar S01, el sistema DEBE cumplir TODAS estas condiciones:

| # | Condicion | Verificacion |
|---|-----------|-------------|
| 1 | LOGBOOK_F04_ENABLED=false | Railway Variables |
| 2 | R1 documental completado | Doc 31 + migrations + YAML v3.1 en repo |
| 3 | Remanentes excluidos | 4 turnos anomalia excluidos de queries |
| 4 | Migrations versionadas | migrations/001 y 002 en repo |
| 5 | Legacy intacto | Ultimo test: "hola" responde legacy |
| 6 | DATA_LOCAL intacto | turnos_activos.json y eventos.json sin cambios |
| 7 | Supabase accesible | Query exitosa a tabla turnos |
| 8 | Railway logs accesibles | Poder ver logs en tiempo real |
| 9 | War Room aprobado | GO por >= 3/5 agentes |
| 10 | Rollback preparado | Flag OFF + git revert documentado |

## 4. DATASET SINTETICO

### Operador test:
- nombre: "OPERADOR_LAB"
- telefono: "[PENDIENTE: Guillermo asigna numero test]"
- empresa_id: "[PENDIENTE: UUID empresa test]"
- autorizado: true

### Maquinas test:
- equipo_1: "[PENDIENTE: ID maquina real o sintetico]"
- equipo_2: "[PENDIENTE: ID maquina real o sintetico]"
- equipo_inexistente: "EQUIPO_NO_EXISTE_999"

### Horometros:
- horometro_inicial_1: "[PENDIENTE: valor valido, ej: 1000]"
- horometro_final_1: "[PENDIENTE: valor > inicial, ej: 1005]"
- horometro_invalido: "-1"
- horometro_invalido_texto: "abc"
- horometro_cero: "0"
- horometro_regresivo: "[PENDIENTE: valor < inicial, ej: 999]"
- horometro_decimal_punto: "1000.5"
- horometro_decimal_coma: "1000,5"

### Folios:
- patron_esperado: "[PENDIENTE: patron folio IronSync, ej: CATXXX-YYYYMMDD-NNNN]"
- criterio: "Cada turno nuevo genera folio unico incremental"

### Criterio exclusion remanentes:
- Los 4 turnos con tiene_anomalia=true NO deben aparecer en resultados
- Queries de verificacion SIEMPRE incluyen: WHERE tiene_anomalia = false

## 5. MATRIZ S01-S20

### Convenciones:
- tipo: FLUJO_POSITIVO | FLUJO_NEGATIVO | VALIDACION | REGRESION
- bloqueante: SI | NO
- Si un test bloqueante falla: STOP inmediato


### S01 — INICIO correcto con horometro
- tipo: FLUJO_POSITIVO
- precondicion: Operador test sin turno abierto, equipo_1 valido
- mensaje_whatsapp: "INICIO [equipo_1] [horometro_inicial_1]"
- resultado_whatsapp: Confirmacion turno abierto con folio nuevo
- resultado_supabase: INSERT en tabla turnos con estado=abierto, horometro_inicio=[horometro_inicial_1]
- criterio_pass: Folio creado + WhatsApp confirma + Supabase tiene registro
- riesgo_cubierto: Flujo basico INICIO funciona end-to-end
- bloqueante: SI

### S02 — INICIO sin horometro (sesion QR)
- tipo: FLUJO_POSITIVO
- precondicion: Operador test sin turno abierto, equipo_1 valido
- mensaje_whatsapp: "INICIO [equipo_1]"
- resultado_whatsapp: Solicitud de horometro via QR o respuesta directa
- resultado_supabase: Sesion QR activa con TTL 10min
- criterio_pass: Bot solicita horometro + sesion QR creada + no turno hasta confirmar
- riesgo_cubierto: Flujo sin horometro crea sesion correctamente
- bloqueante: NO

### S03 — Respuesta horometro despues de INICIO sin horometro
- tipo: FLUJO_POSITIVO
- precondicion: S02 completado, sesion QR activa
- mensaje_whatsapp: "[horometro_inicial_1]"
- resultado_whatsapp: Confirmacion turno abierto con folio nuevo
- resultado_supabase: INSERT en tabla turnos con horometro_inicio=[horometro_inicial_1]
- criterio_pass: Turno creado con horometro recibido + sesion QR cerrada
- riesgo_cubierto: Sesion QR completa ciclo INICIO
- bloqueante: NO

### S04 — INICIO con horometro invalido (negativo)
- tipo: FLUJO_NEGATIVO
- precondicion: Operador test sin turno abierto, equipo_1 valido
- mensaje_whatsapp: "INICIO [equipo_1] -1"
- resultado_whatsapp: Rechazo con mensaje de horometro invalido
- resultado_supabase: 0 INSERT (turno NO creado)
- criterio_pass: Mensaje de error claro + 0 escrituras Supabase
- riesgo_cubierto: Validacion horometro negativo rechazado
- bloqueante: NO

### S05 — INICIO decimal con punto
- tipo: VALIDACION
- precondicion: Operador test sin turno abierto, equipo_1 valido
- mensaje_whatsapp: "INICIO [equipo_1] 1000.5"
- resultado_whatsapp: Confirmacion turno abierto (decimal aceptado)
- resultado_supabase: INSERT con horometro_inicio=1000.5
- criterio_pass: Decimal punto aceptado + turno creado correctamente
- riesgo_cubierto: Parsing decimal punto funciona
- bloqueante: NO

### S06 — INICIO decimal con coma
- tipo: VALIDACION
- precondicion: Operador test sin turno abierto, equipo_1 valido
- mensaje_whatsapp: "INICIO [equipo_1] 1000,5"
- resultado_whatsapp: Confirmacion turno abierto (coma convertida a punto)
- resultado_supabase: INSERT con horometro_inicio=1000.5
- criterio_pass: Coma convertida a punto + turno creado correctamente
- riesgo_cubierto: Parsing decimal coma funciona
- bloqueante: NO

### S07 — INICIO equipo inexistente
- tipo: FLUJO_NEGATIVO
- precondicion: Operador test sin turno abierto
- mensaje_whatsapp: "INICIO EQUIPO_NO_EXISTE_999 [horometro_inicial_1]"
- resultado_whatsapp: Rechazo con mensaje equipo no encontrado
- resultado_supabase: 0 INSERT
- criterio_pass: Mensaje de error claro + 0 escrituras Supabase
- riesgo_cubierto: Equipo inexistente rechazado correctamente
- bloqueante: NO

### S08 — INICIO operador no autorizado
- tipo: FLUJO_NEGATIVO
- precondicion: Telefono NO registrado en sistema
- mensaje_whatsapp: "INICIO [equipo_1] [horometro_inicial_1]" (desde telefono no autorizado)
- resultado_whatsapp: Rechazo con mensaje no autorizado
- resultado_supabase: 0 INSERT
- criterio_pass: Mensaje de error claro + 0 escrituras Supabase
- riesgo_cubierto: Operador no autorizado rechazado
- bloqueante: NO

### S09 — INICIO duplicado / turno ya abierto
- tipo: FLUJO_NEGATIVO
- precondicion: Operador test CON turno abierto (post-S01)
- mensaje_whatsapp: "INICIO [equipo_1] [horometro_inicial_1]"
- resultado_whatsapp: Rechazo con mensaje turno ya abierto
- resultado_supabase: 0 INSERT adicional
- criterio_pass: Mensaje de error claro + no turno duplicado
- riesgo_cubierto: Deteccion turno duplicado
- bloqueante: NO

### S10 — Legacy con flag OFF antes de laboratorio
- tipo: REGRESION
- precondicion: LOGBOOK_F04_ENABLED=false (estado pre-laboratorio)
- mensaje_whatsapp: "hola"
- resultado_whatsapp: Respuesta legacy normal (menu o saludo)
- resultado_supabase: 0 escrituras logbook
- criterio_pass: Legacy responde normal + 0 interferencia logbook
- riesgo_cubierto: Legacy intacto antes de activar flag
- bloqueante: NO

### S11 — FIN correcto con horometro
- tipo: FLUJO_POSITIVO
- precondicion: Turno abierto en S01, LOGBOOK_F04_ENABLED=true
- mensaje_whatsapp: "FIN [equipo_1] [horometro_final_1]"
- resultado_whatsapp: Confirmacion turno cerrado con horas calculadas
- resultado_supabase: UPDATE turno SET estado=cerrado, horometro_fin=[horometro_final_1], cerrado_por=operador
- criterio_pass: Turno cerrado + horas calculadas + WhatsApp confirma + Supabase actualizado
- riesgo_cubierto: Flujo basico FIN funciona end-to-end
- bloqueante: SI

### S12 — FIN sin horometro (sesion QR)
- tipo: FLUJO_POSITIVO
- precondicion: Turno abierto activo, LOGBOOK_F04_ENABLED=true
- mensaje_whatsapp: "FIN [equipo_1]"
- resultado_whatsapp: Solicitud horometro FIN via QR o respuesta directa
- resultado_supabase: Sesion QR FIN activa con TTL 10min
- criterio_pass: Bot solicita horometro FIN + sesion QR creada
- riesgo_cubierto: Flujo FIN sin horometro crea sesion correctamente
- bloqueante: NO

### S13 — Respuesta horometro despues de FIN sin horometro
- tipo: FLUJO_POSITIVO
- precondicion: S12 completado, sesion QR FIN activa
- mensaje_whatsapp: "[horometro_final_1]"
- resultado_whatsapp: Confirmacion turno cerrado con horas
- resultado_supabase: UPDATE turno SET estado=cerrado, horometro_fin=[horometro_final_1]
- criterio_pass: Turno cerrado con horometro recibido + sesion QR cerrada
- riesgo_cubierto: Sesion QR FIN completa ciclo
- bloqueante: NO

### S14 — FIN con horometro invalido
- tipo: FLUJO_NEGATIVO
- precondicion: Turno abierto activo
- mensaje_whatsapp: "FIN [equipo_1] -1"
- resultado_whatsapp: Rechazo con mensaje horometro invalido
- resultado_supabase: Turno permanece abierto (0 UPDATE)
- criterio_pass: Mensaje de error claro + turno NO cerrado
- riesgo_cubierto: Validacion horometro FIN invalido
- bloqueante: NO

### S15 — FIN sin turno abierto
- tipo: FLUJO_NEGATIVO
- precondicion: Operador test SIN turno abierto para equipo_1
- mensaje_whatsapp: "FIN [equipo_1] [horometro_final_1]"
- resultado_whatsapp: Rechazo con mensaje no tiene turno abierto
- resultado_supabase: 0 UPDATE (no hay turno que cerrar)
- criterio_pass: Mensaje de error claro + 0 escrituras Supabase
- riesgo_cubierto: FIN sin turno abierto rechazado
- bloqueante: SI

### S16 — FIN con horometro menor al inicio
- tipo: FLUJO_NEGATIVO
- precondicion: Turno abierto con horometro_inicio=[horometro_inicial_1]
- mensaje_whatsapp: "FIN [equipo_1] [horometro_regresivo]"
- resultado_whatsapp: Rechazo con mensaje horometro menor al inicio
- resultado_supabase: Turno permanece abierto (0 UPDATE)
- criterio_pass: Mensaje de error claro + turno NO cerrado + horas NO calculadas
- riesgo_cubierto: Horometro regresivo rechazado
- bloqueante: NO

### S17 — Multiples maquinas secuenciales
- tipo: VALIDACION
- precondicion: Operador test, equipo_1 y equipo_2 validos
- mensaje_whatsapp: Secuencia: "INICIO [equipo_1] [h_inicio]" -> "FIN [equipo_1] [h_fin]" -> "INICIO [equipo_2] [h_inicio]" -> "FIN [equipo_2] [h_fin]"
- resultado_whatsapp: 4 mensajes de confirmacion correctos
- resultado_supabase: 2 turnos creados y cerrados correctamente
- criterio_pass: 2 ciclos completos sin interferencia entre equipos
- riesgo_cubierto: Multiples equipos mismo operador sin colision
- bloqueante: NO

### S18 — Remanentes controlados excluidos
- tipo: VALIDACION
- precondicion: Post-laboratorio, remanentes existen en Supabase
- query_verificacion: "SELECT COUNT(*) FROM turnos WHERE tiene_anomalia = true"
- resultado_esperado: 4 turnos anomalia presentes pero excluidos de metricas
- criterio_pass: Remanentes existen + NO contaminan resultados + NO aparecen en queries laboratorio
- riesgo_cubierto: Exclusion remanentes funciona correctamente
- bloqueante: SI

### S19 — Legacy intacto durante laboratorio
- tipo: REGRESION
- precondicion: LOGBOOK_F04_ENABLED=true (durante laboratorio)
- mensaje_whatsapp: "[comando legacy, ej: PARO]"
- resultado_whatsapp: Respuesta legacy normal (no logbook)
- resultado_supabase: 0 escrituras logbook para este mensaje
- criterio_pass: Legacy responde normal + logbook no interfiere con comandos legacy
- riesgo_cubierto: Coexistencia legacy + logbook sin regresion
- bloqueante: SI

### S20 — Verificacion final Supabase
- tipo: VALIDACION
- precondicion: Todos los tests S01-S19 completados, flag OFF
- query_verificacion: "SELECT * FROM turnos WHERE creado_en >= [fecha_laboratorio] AND tiene_anomalia = false"
- resultado_esperado: Turnos creados por S01-S17 presentes, turnos anomalia excluidos
- criterio_pass: Turnos correctos + 0 duplicados + 0 contaminacion + remanentes intactos
- riesgo_cubierto: Integridad datos post-laboratorio
- bloqueante: SI
