# IS LOGBOOK v1.0 — DISENO FUNCIONAL + SYNTHETIC FIELD LAB

**Fecha:** 2026-05-05
**Estado:** DRAFT / PARA REVISION DEL EQUIPO
**Autor:** Guillermo (direccion) + MiMo V2 (redaccion)
**Clasificacion:** DOC
**Autorizacion:** GO del equipo para crear como DRAFT

---

## 1. Contexto

| Dato | Valor |
|------|-------|
| Fase 1 Repo Cleanup | COMPLETADA (63/63 archivos C aislados) |
| BUG-002 | ABIERTO (persistencia dual JSON + Supabase) |
| DATA_LOCAL | BLOQUEADO (4 archivos intocados hasta BUG-002) |
| Fase 2 Repo Cleanup | BLOQUEADA |
| IS Logbook v1.0 | PENDIENTE de diseno e implementacion |
| IS Finanzas | FUTURA (depende de Logbook) |
| Documento 27 | DRAFT / NO autoriza codigo |

**Principios rectores:**

- No medimos progreso por dias; medimos features cerrados.
- Raiz ordenada no es arquitectura sana.
- FROZEN de diseno no es permiso de ejecucion.
- Logbook registra lo que paso en campo; Finanzas decide cuanto cuesta.
- Disenamos con libertad. Implementamos con rigor. Cerramos con evidencia.

---

## 2. Objetivo de IS Logbook v1.0

IS Logbook v1.0 es el modulo operativo que registra, documenta y consolida la actividad diaria de maquinas en campo.

**Flujo completo:**

QR → INICIO → jornada → eventos → FIN con foto → PDF → consolidacion operativa → Laboratorio Sintetico → FROZEN

**Lo que Logbook RESUELVE:**
- Registro digital de turnos operativos.
- Trazabilidad de horometros, eventos y evidencia fotografica.
- Generacion de PDF neutral como evidencia operativa.
- Consolidacion operativa como puente hacia IS Finanzas.

**Lo que Logbook NO RESUELVE:**
- BUG-002 (persistencia dual).
- Estabilidad arquitectonica completa.
- Tarifas, cobros, facturas.
- IS Finanzas.

---

## 3. Alcance / Fuera de alcance

### Incluye en IS Logbook v1.0

| Componente | Detalle |
|-----------|---------|
| QR por maquina | Token/machine_id/tenant_id estatico y durable |
| INICIO desde QR | Escanear → precargar → confirmar + horometro |
| Horometro inicial | Numerico (captura manual del operador) |
| Eventos de jornada | PARO, FALLA, REANUDA |
| FIN con foto | Horometro final + foto obligatoria |
| PDF Reporte Diario | Neutral, sin datos financieros |
| Consolidacion operativa | 200 horas / 30 dias (lo que ocurra primero) |
| Laboratorio Sintetico | 20 escenarios (S01-S20) |
| Puente hacia IS Finanzas | Consolidacion como entregable |
| Multi-tenancy | tenant_id en tablas core |

### Fuera de alcance (NO incluye)

| Componente | Razon |
|-----------|-------|
| Tarifas | Pertenece a IS Finanzas |
| Cobro | Pertenece a IS Finanzas |
| Factura | Pertenece a IS Finanzas |
| CFDI / SAT | Pertenece a IS Finanzas / Compliance |
| Aging | Pertenece a IS Finanzas |
| IS Finanzas completo | Modulo separado, futuro |
| Legal / Compliance | Fuera de v1.0 |
| Dashboard avanzado | Futuro |
| RAG / Manuales como feature core | Futuro (El Inge) |
| OCR horometro | Futuro |
| Firma residente digital completa | Futuro |
| App nativa | Futuro |
| Portal cliente | Futuro |
| Geolocalizacion | Futuro |

---

## 4. Features

### F-01 — Metodologia arquitectonica en piloto 30 dias

| Campo | Detalle |
|-------|---------|
| Dependencia | Ninguna |
| Estado | PENDIENTE |
| Clasificacion | DOC |
| Criterios de aceptacion | Docs 24, 25, 26 creados, votados y FROZEN. Piloto de 30 dias activo. |

**Descripcion:** Crear los documentos de gobernanza arquitectonica antes de implementar cualquier codigo. Establecer los 6 pilares de rigor operativo. Ejecutar piloto de 30 dias para validar la metodologia.

**Documentos requeridos:**
- 24_RIGOR_OPERATIVO_IRONSYNC_v0_1.md
- 25_DEBT_REGISTRY.md
- 26_DEEPSEEK_GUARDIAN_PROMPT_v0_1.md

---

### F-02 — Fuente de verdad operativa para turnos

| Campo | Detalle |
|-------|---------|
| Dependencia | F-01 |
| Estado | PENDIENTE (BLOCKER) |
| Clasificacion | FEAT |
| Criterios de aceptacion | Decision documentada: JSON o Supabase. BUG-002 resuelto o bloqueado con workaround definido. |

**Descripcion:** Definir cual es la fuente de verdad para los turnos operativos. BUG-002 (persistencia dual JSON + Supabase) debe resolverse o bloquearse con un workaround claro antes de implementar Logbook.

**F-02 bloquea IMPLEMENTACION, no diseno.**

**Opciones:**

| Opcion | Descripcion | Ventaja | Desventaja |
|--------|-------------|---------|------------|
| A | Cerrar BUG-002 completo | Arquitectura limpia | Toma mas tiempo |
| B (RECOMENDADA) | Supabase = fuente operativa para nuevos turnos. DATA_LOCAL = legacy/fallback/bloqueado/read-only | Pragmatico, permite avanzar | Deuda residual en DATA_LOCAL |

**Opcion B detallada:**
- Nuevos turnos de IS Logbook v1.0 se crean en Supabase.
- DATA_LOCAL queda como read-only / fallback legacy.
- BUG-002 no se declara cerrado, se declara bloqueado con workaround.
- Se requiere plan propio para cerrar BUG-002 en el futuro.

---

### F-03 — Diseno IS Logbook v1.0

| Campo | Detalle |
|-------|---------|
| Dependencia | F-01, F-02 |
| Estado | PENDIENTE |
| Clasificacion | DOC |
| Criterios de aceptacion | Documento 27 completo, votado y FROZEN por el equipo. |

**Descripcion:** Este documento (Documento 27) es el diseno funcional completo de IS Logbook v1.0. Debe ser aprobado por el equipo antes de cualquier implementacion.

---

### F-03.5 — Multi-tenancy / Tenant Isolation

| Campo | Detalle |
|-------|---------|
| Dependencia | F-03 |
| Estado | PENDIENTE |
| Clasificacion | FEAT |
| Criterios de aceptacion | tenant_id en tablas core. QR con tenant_id. Validaciones scope por tenant. Retool/dashboard filtra por tenant. |

**Descripcion:** Incluir multi-tenancy desde el inicio para evitar refactor al segundo cliente.

**Requisitos:**
- tenant_id en tablas core de turnos y eventos.
- QR contiene tenant_id + machine_id/token.
- Validaciones de scope por tenant en todos los endpoints.
- Retool/dashboard filtra por tenant.
- No se permite acceso cross-tenant sin autorizacion explicita.

---

### F-04 — QR + machine_id / tenant_id

| Campo | Detalle |
|-------|---------|
| Dependencia | F-03, F-03.5 |
| Estado | PENDIENTE |
| Clasificacion | FEAT |
| Criterios de aceptacion | QR genera token. Sistema resuelve contra fuente de verdad. Prueba: escanear → identificar maquina + tenant. |

**Descripcion:** Generar codigos QR estaticos y durables por maquina.

**Especificaciones:**
- QR es estatico y durable (no caduca).
- Contiene: token / machine_id / tenant_id.
- NO contiene datos comerciales duros (tarifa, contrato, precio).
- Backend resuelve el contexto completo al escanear.
- Si la maquina cambia de asignacion, el QR no se reimprime.
- El QR es llave, no documento.

**Logistica QR fisica:**
- Fase inicial: QR provisional (impreso, pegado con proteccion).
- Fase futura: QR en placa metalica/industrial.
- Ambos usan el mismo formato de datos.

---

### F-05 — INICIO desde QR

| Campo | Detalle |
|-------|---------|
| Dependencia | F-04 |
| Estado | PENDIENTE |
| Clasificacion | FEAT |
| Criterios de aceptacion | Escanear → precargar → confirmar + horometro → turno creado en BD. |

**Descripcion:** Al escanear el QR, el sistema identifica la maquina y precarga los datos.

**Flujo:**
1. Operador escanea QR.
2. Sistema identifica: maquina, eco, serie, modelo, cliente/obra, tenant.
3. Sistema precarga datos.
4. Operador confirma datos.
5. Operador ingresa horometro inicial (numerico).
6. Sistema crea turno con estado ABIERTO.
7. Sistema valida que no haya turno abierto para esa maquina.

**Validaciones en INICIO:**
- QR valido y vigente.
- Maquina existe y pertenece al tenant.
- No existe turno abierto para esa maquina.
- Horometro inicial es numerico y positivo.
- Operador autenticado.

**Foto en INICIO:** NO obligatoria. Solo horometro numerico.

---

### F-06 — Eventos de jornada

| Campo | Detalle |
|-------|---------|
| Dependencia | F-05 |
| Estado | PENDIENTE |
| Clasificacion | FEAT |
| Criterios de aceptacion | PARO, FALLA, REANUDA con timestamp. Persistidos correctamente. |

**Descripcion:** Durante la jornada, el operador puede registrar eventos.

**Eventos minimos:**

| Evento | Descripcion | Datos que captura |
|--------|-------------|-------------------|
| PARO | La maquina se detiene (no es falla) | Timestamp, motivo (texto libre) |
| FALLA | La maquina presenta falla tecnica | Timestamp, descripcion (texto libre) |
| REANUDA | La maquina reanuda operacion | Timestamp |

**Reglas:**
- PARO y FALLA requieren REANUDA posterior.
- No puede haber REANUDA sin PARO o FALLA previo.
- Cada evento se persiste con timestamp exacto.
- El operador puede agregar texto libre como nota adjunta.

---

### F-07 — FIN con foto

| Campo | Detalle |
|-------|---------|
| Dependencia | F-06 |
| Estado | PENDIENTE |
| Clasificacion | FEAT |
| Criterios de aceptacion | Horometro final + foto. Validacion final >= inicial. Turno cerrado. |

**Descripcion:** El operador cierra el turno con horometro final y foto del horometro.

**Flujo:**
1. Operador indica FIN de turno.
2. Operador ingresa horometro final (numerico).
3. Operador captura foto del horometro.
4. Sistema valida: horometro final >= horometro inicial.
5. Si validacion OK: turno se cierra con estado CERRADO.
6. Si validacion FALLA: sistema rechaza y pide correccion.

**Decisiones de diseno:**

| Escenario | Decision |
|-----------|----------|
| Foto final faltante | PENDIENTE DE VOTACION: rechazo o flag sin_foto_fin con revision manual |
| Foto borrosa | PENDIENTE DE VOTACION: flag o rechazo |
| Horometro final < inicial | RECHAZO. Sistema pide correccion |
| Operador no cierra turno | Turno queda ABIERTO. Ver turno zombie |

**Mitigacion foto faltante:** Si Twilio falla o el operador no puede enviar foto, permitir cierre con flag sin_foto_fin=true y comentario obligatorio. Este turno requiere revision manual del admin antes de ir a consolidacion.

---

### F-08 — PDF Reporte Diario neutral

| Campo | Detalle |
|-------|---------|
| Dependencia | F-07 |
| Estado | PENDIENTE |
| Clasificacion | FEAT |
| Criterios de aceptacion | PDF neutral con folio, maquina, operador, horometros, horas, eventos. Sin datos financieros. |

**Descripcion:** Generar un PDF neutral de evidencia operativa por turno.

**Debe contener:**

| Campo | Detalle |
|-------|---------|
| Folio | Numero unico del turno |
| Fecha | Fecha del turno |
| Maquina | Eco, serie, modelo |
| Operador | Nombre/ID del operador |
| Horometro inicial | Valor numerico |
| Horometro final | Valor numerico |
| Horas totales | Calculo: horometro final - horometro inicial |
| Eventos cronologicos | PARO, FALLA, REANUDA con timestamps |
| Foto final | Anexo (si existe) |
| Observaciones | Texto libre del operador |
| Trazabilidad | tenant_id, machine_id, QR token |

**NO debe contener:**

| Campo prohibido | Razon |
|----------------|-------|
| Tarifa | IS Finanzas |
| Monto | IS Finanzas |
| Cobro | IS Finanzas |
| Factura | IS Finanzas |
| Simbolos monetarios | IS Finanzas |
| Condiciones de pago | IS Finanzas |

**Footer obligatorio:**
> "Evidencia operativa — No documento fiscal."

---

### F-09 — Consolidacion operativa 200h / 30d

| Campo | Detalle |
|-------|---------|
| Dependencia | F-08 |
| Estado | PENDIENTE |
| Clasificacion | FEAT |
| Criterios de aceptacion | Acumula y consolida al primer trigger. Generacion automatica. |

**Descripcion:** El sistema acumula jornadas de una misma maquina/tenant. Al cumplirse la primera condicion, genera una consolidacion operativa.

**Triggers:**

| Trigger | Condicion |
|---------|-----------|
| Horas | >= 200 horas acumuladas desde ultima consolidacion |
| Tiempo | >= 30 dias calendario desde ultima consolidacion |
| Regla | Se dispara el PRIMERO que ocurra |

**Contenido de la consolidacion:**

| Campo | Detalle |
|-------|---------|
| ID consolidacion | Unico |
| tenant_id | Tenant al que pertenece |
| machine_id | Maquina consolidada |
| Periodo inicio | Fecha del primer turno del periodo |
| Periodo fin | Fecha del ultimo turno del periodo |
| Horas totales | Suma de horas de todas las jornadas |
| Turnos incluidos | Lista de folios |
| Eventos resumen | Total PAROS, FALLAS, REANUDAS |
| Estado | verificado / no verificado |
| revisado_humanamente | true / false |

**Regla de revision humana:** La consolidacion requiere aprobacion humana antes de pasar a IS Finanzas. PENDIENTE DE VOTACION.

**Salida para IS Finanzas:** Contiene horas y eventos, NO contiene dinero.

---

### F-10 — Laboratorio Sintetico S01-S20

| Campo | Detalle |
|-------|---------|
| Dependencia | F-09 |
| Estado | PENDIENTE |
| Clasificacion | FEAT |
| Criterios de aceptacion | 20 escenarios ejecutados. 0 fallos criticos. Reporte de laboratorio. |

**Workspace Agent:**
- Ejecuta escenarios.
- Registra resultados.
- Genera reporte.
- NO decide producto.
- Opera sobre staging/dataset sintetico.
- NO opera sobre produccion.
- NO opera sobre DATA_LOCAL real.

---

### F-11 — IS Logbook v1.0 FROZEN

| Campo | Detalle |
|-------|---------|
| Dependencia | F-10 |
| Estado | PENDIENTE |
| Clasificacion | DOC |
| Criterios de aceptacion | F-01 a F-10 completadas. Documento de cierre. |

**Criterios para FROZEN:**
1. F-01 a F-10 completadas.
2. F-02 resuelta (fuente de verdad definida).
3. S01-S20 aprobados.
4. 0 fallos criticos.
5. PDF validado.
6. Consolidacion operativa validada.
7. DATA_LOCAL tratado segun F-02.
8. Finanzas no mezclado.
9. Documento de cierre creado.

---

## 5. F-02 / BUG-002

**Declaracion:** F-02 bloquea IMPLEMENTACION, no diseno.

**Opcion B (recomendada) detallada:**
- Nuevos turnos IS Logbook v1.0 se crean en Supabase.
- DATA_LOCAL queda como read-only / fallback legacy / bloqueado.
- BUG-002 no se declara cerrado.
- BUG-002 se declara bloqueado con workaround.
- Se requiere plan propio para cerrar BUG-002 en el futuro.
- DATA_LOCAL no se migra automaticamente.

**Regla:** No declarar BUG-002 cerrado sin plan propio.

---

## 6. Multi-tenancy / F-03.5

**Justificacion:** Incluir multi-tenancy desde el inicio evita refactor costoso al segundo cliente.

**Requisitos:**

| Requisito | Detalle |
|-----------|---------|
| tenant_id en tablas core | Turnos, eventos, consolidaciones |
| QR con tenant_id | Cada QR es unico por maquina + tenant |
| Validaciones scope por tenant | Ningun endpoint permite acceso cross-tenant |
| Retool/dashboard filtra por tenant | Cada tenant ve solo sus datos |
| Aislamiento de datos | Un tenant no puede ver datos de otro |

**Esquema conceptual:**

turnos: id, tenant_id, machine_id, operador_id, horometro_inicial, horometro_final, estado, created_at

eventos: id, turno_id, tenant_id, tipo (PARO/FALLA/REANUDA), timestamp, descripcion

consolidaciones: id, tenant_id, machine_id, periodo_inicio, periodo_fin, horas_totales, estado, revisado_humanamente

---

## 7. QR

**Especificaciones:**

| Propiedad | Valor |
|-----------|-------|
| Tipo | Estatico y durable |
| Contiene | token / machine_id / tenant_id |
| NO contiene | Datos comerciales, tarifas, contratos |
| Resolucion | Backend resuelve contexto completo |
| Caducidad | No caduca (salvo baja de maquina) |
| Reimpresion | Solo si la maquina cambia de tenant |

**Logistica QR fisica:**

| Fase | Implementacion |
|------|---------------|
| Inicial | QR provisional (impreso, plastificado, pegado) |
| Futuro | QR en placa metalica/industrial |

**Seguridad:**
- QR es semilla, no llave completa.
- Operador debe estar autenticado.
- Sin autenticacion, el QR no funciona.

---

## 8. Flujo operativo completo

### 8.1 Inicio de dia del operador

1. Operador llega a la maquina.
2. Escanea QR con celular.
3. Sistema identifica: maquina, eco, serie, modelo, cliente/obra, tenant.
4. Sistema precarga datos.
5. Operador confirma datos.
6. Operador ingresa horometro inicial (numerico).
7. Sistema valida: sin turno abierto previo.
8. Sistema crea turno con estado ABIERTO.
9. Operador comienza jornada.

### 8.2 Jornada normal (sin incidentes)

1. Operador trabaja normalmente.
2. No registra eventos.
3. Al final del dia, procede a FIN.

### 8.3 Jornada con incidentes

1. Operador registra PARO (timestamp + motivo).
2. Operador registra REANUDA (timestamp).
3. Operador registra FALLA (timestamp + descripcion).
4. Operador registra REANUDA (timestamp).
5. Cada evento se persiste inmediatamente.
6. Al final del dia, procede a FIN.

### 8.4 Fin de jornada

1. Operador indica FIN de turno.
2. Operador ingresa horometro final (numerico).
3. Operador captura foto del horometro.
4. Sistema valida: horometro final >= horometro inicial.
5. Si OK: turno se cierra con estado CERRADO.
6. Si FALLA: sistema rechaza, pide correccion.
7. Sistema genera PDF Reporte Diario.

### 8.5 Consolidacion

1. Sistema acumula jornadas por maquina/tenant.
2. Al llegar a 200 horas O 30 dias (lo primero que ocurra):
   a. Sistema genera consolidacion operativa.
   b. Estado: no verificado.
   c. Admin revisa y marca como verificado.
   d. Consolidacion pasa a IS Finanzas (futuro).

---

## 9. PDF Reporte Diario

### Contenido obligatorio

| # | Campo | Ejemplo |
|---|-------|---------|
| 1 | Folio | TURN-2026-0505-001 |
| 2 | Fecha | 2026-05-05 |
| 3 | Maquina | Eco: EXC-001 / Serie: CAT-320-2024 / Modelo: CAT 320 |
| 4 | Operador | Juan Perez (OP-012) |
| 5 | Horometro inicial | 1,234.5 hrs |
| 6 | Horometro final | 1,242.3 hrs |
| 7 | Horas totales | 7.8 hrs |
| 8 | Eventos cronologicos | 10:15 PARO (lluvia) / 10:45 REANUDA / 14:00 FALLA (hidraulico) / 14:30 REANUDA |
| 9 | Foto final | Anexo (si existe) |
| 10 | Observaciones | Texto libre del operador |
| 11 | Trazabilidad | tenant_id, machine_id, QR token |

### Contenido PROHIBIDO

| # | Campo prohibido | Razon |
|---|----------------|-------|
| 1 | Tarifa | IS Finanzas |
| 2 | Monto | IS Finanzas |
| 3 | Cobro | IS Finanzas |
| 4 | Factura | IS Finanzas |
| 5 | Simbolos monetarios ($, MXN) | IS Finanzas |
| 6 | Condiciones de pago | IS Finanzas |
| 7 | CFDI / datos fiscales | IS Finanzas / Compliance |

### Footer obligatorio

"Evidencia operativa — No documento fiscal."

---

## 10. Consolidacion operativa 200h / 30d

### Triggers

| Trigger | Condicion |
|---------|-----------|
| Horas | >= 200 horas acumuladas desde ultima consolidacion |
| Tiempo | >= 30 dias calendario desde ultima consolidacion |
| Regla | Se dispara el PRIMERO que ocurra |

### Contenido de consolidacion

| Campo | Detalle |
|-------|---------|
| ID consolidacion | Unico |
| tenant_id | Tenant al que pertenece |
| machine_id | Maquina consolidada |
| Periodo inicio | Fecha del primer turno del periodo |
| Periodo fin | Fecha del ultimo turno del periodo |
| Horas totales | Suma de horas de todas las jornadas |
| Turnos incluidos | Lista de folios |
| Eventos resumen | Total PAROS, FALLAS, REANUDAS |
| Estado | verificado / no verificado |
| revisado_humanamente | true / false |

### Regla de revision humana

| Estado | Significado |
|--------|-------------|
| no verificado | Sistema genero automaticamente |
| verificado | Admin reviso y aprobo |
| revisado_humanamente: true | Listo para consumir por IS Finanzas |
| revisado_humanamente: false | Bloqueado, requiere revision |

### Salida para IS Finanzas

Contiene: Horas, Eventos, Maquina, Operador, Tenant, Periodo.
NO contiene: Dinero, Tarifa, Cobro, Factura.

---

## 11. Frontera Logbook / Finanzas

| IS Logbook v1.0 | IS Finanzas |
|-----------------|-------------|
| Registra INICIO de turno | Calcula tarifa por hora |
| Registra FIN de turno | Calcula costo total |
| Captura horometros | Genera factura |
| Documenta PARO/FALLA/REANUDA | Aplica descargos por paro |
| Genera PDF Reporte Diario neutral | Genera PDF Factura |
| Consolida 200h/30d (operativo) | Consolida financiero (cobro) |
| Identifica maquina/operador/cliente | Identifica contrato/moneda/condiciones |
| **Folio** | **Factura** |
| **Horas** | **Pesos** |

**Regla fundamental:**
> "Logbook no sabe cuanto cuesta una hora."

---

## 12. Laboratorio Sintetico S01-S20

### Escenarios minimos obligatorios (S01-S10)

| # | Escenario | Tipo | Que valida |
|---|-----------|------|-----------|
| S01 | Turno completo sin incidentes | NORMAL | Flujo completo INICIO→FIN→PDF |
| S02 | Turno con PARO y REANUDA | NORMAL | Eventos documentados en PDF |
| S03 | Turno con FALLA | NORMAL | Falla documentada correctamente |
| S04 | INICIO sin horometro | ERROR | Sistema rechaza, pide horometro |
| S05 | FIN sin foto | ERROR | Sistema rechaza o marca flag |
| S06 | Horometro final < inicial | ERROR | Sistema rechaza, pide correccion |
| S07 | Doble INICIO sin FIN intermedio | ERROR | Sistema rechaza segundo INICIO |
| S08 | Doble FIN por latencia/reenvio WhatsApp | ERROR | Sistema detecta duplicado y rechaza |
| S09 | QR invalido o maquina inexistente | ERROR | Sistema rechaza, muestra error |
| S10 | Operador no autorizado | ERROR | Sistema rechaza, requiere autenticacion |

### Escenarios extendidos (S11-S20)

| # | Escenario | Tipo | Que valida |
|---|-----------|------|-----------|
| S11 | Maquina ya tiene turno abierto por otro operador | ERROR | Sistema rechaza, indica turno abierto |
| S12 | Turno zombie >24h abierto | FLUJO | Sistema alerta admin |
| S13 | Multiples PAROS en jornada | NORMAL | Todos documentados en PDF |
| S14 | PDF con 0 eventos | NORMAL | PDF limpio generado correctamente |
| S15 | Foto borrosa / ilegible | ERROR | Sistema marca flag o rechaza |
| S16 | Cliente disputa horas | FLUJO | PDF sirve como evidencia |
| S17 | Intento adversarial: horometro inflado | SEGURIDAD | Foto como verificacion cruzada |
| S18 | Consolidacion a 200 horas | FLUJO | Trigger automatico |
| S19 | Consolidacion a 30 dias | FLUJO | Trigger automatico |
| S20 | Evento periodo_consolidado listo para Finanzas | FLUJO | Consolidacion verificada, lista para consumir |

### Criterio de aprobacion

| Nivel | Escenarios | Requisito |
|-------|-----------|-----------|
| Minimo por feature | S01-S10 | 0 fallos para avanzar a siguiente feature |
| Gate final FROZEN | S01-S20 | 0 fallos criticos para declarar FROZEN |

---

## 13. Workspace Agent

| Propiedad | Detalle |
|-----------|---------|
| Rol | Ejecutor de escenarios sinteticos |
| Ejecuta | S01-S20 |
| Registra | Resultados de cada escenario |
| Genera | Reporte de laboratorio |
| NO decide | Producto, features, prioridades |
| Opera sobre | Staging / dataset sintetico |
| NO opera sobre | Produccion |
| NO opera sobre | DATA_LOCAL real |

**Reporte de laboratorio:**

| Campo | Detalle |
|-------|---------|
| Fecha | Fecha de ejecucion |
| Escenarios ejecutados | S01-S20 |
| Resultado por escenario | PASS / FAIL / BLOCKED |
| Detalle de fallos | Descripcion + evidencia |
| Resumen | X/20 PASS, Y/20 FAIL, Z/20 BLOCKED |
| Veredicto | GO / NO-GO para FROZEN |

---

## 14. Riesgos y mitigaciones

| # | Riesgo | Nivel | Mitigacion |
|---|--------|-------|-----------|
| R1 | BUG-002 contamina Logbook | ALTO | Definir fuente de verdad (F-02) ANTES de implementar |
| R2 | QR spoofing / copia | MEDIO | Autenticacion de operador como requisito |
| R3 | Foto borrosa / ilegible | MEDIO | Flag + revision manual como fallback |
| R4 | Duplicados por latencia WhatsApp | MEDIO | Deteccion de duplicados en backend. Idempotencia |
| R5 | Consolidacion confundida con Finanzas | MEDIO | Documentacion explicita. Footer "No documento fiscal" |
| R6 | Laboratorio contaminando datos reales | ALTO | Workspace Agent opera sobre staging unicamente |
| R7 | Friccion del operador | MEDIO | Flujo simplificado. Maximo 3 pasos para INICIO, 3 para FIN |
| R8 | PDF no validado en campo | BAJO | Generar PDF de prueba en laboratorio antes de produccion |
| R9 | Latencia en envio/recepcion de fotos | MEDIO | Timeout + reintento. Cierre sin foto como fallback con flag |
| R10 | Turnos zombie (abiertos >24h) | MEDIO | Alerta a 24h. Cierre automatico a 48h |
| R11 | Drift entre Supabase y Retool | MEDIO | Validacion periodica de consistencia |
| R12 | Logistica de QR fisico | BAJO | Provisional primero. Placa industrial despues |
| R13 | Desfase de reloj | BAJO | Usar timestamp del servidor |
| R14 | Offline / mala senal en campo | MEDIO | FUTURO: cola local + sync |
| R15 | Multi-tenancy tardio | ALTO | Incluir desde F-03.5 |

---

## 15. Consideraciones futuras / condicionales

| # | Componente | Estado | Justificacion |
|---|-----------|--------|---------------|
| F-HIST | Migracion one-time de datos historicos | CONDICIONAL | Solo si F-02 lo exige |
| F-OFFLINE | Protocolo offline / mala senal | FUTURO | No core de v1.0 |
| F-RAG | RAG / Manuales / El Inge | FUTURO | No es feature de Logbook v1.0 |
| F-FIRMA | Firma residente digital completa | FUTURO | Requiere diseno legal |
| F-OCR | OCR de horometro | FUTURO | Automatizar lectura desde foto |
| F-DASHBOARD | Dashboard web de turnos | FUTURO | Visualizacion en navegador |
| F-CSV | Exportacion CSV/Excel | FUTURO | No necesario para v1.0 |
| F-MULTI | Multi-turno por maquina por dia | FUTURO | Actualmente un turno por maquina por dia |
| F-GEO | Geolocalizacion del operador | FUTURO | No es parte del flujo minimo viable |
| F-NOTIF | Notificaciones push | FUTURO | Alertas automaticas al admin |
| F-APP | App nativa | FUTURO | WhatsApp es el canal actual |
| F-PORTAL | Portal cliente | FUTURO | El cliente ve PDF, no portal |

---

## 16. Gobernanza posterior al diseno

### Flujo obligatorio

1. Documento 27 se crea como DRAFT.
2. Equipo revisa.
3. Equipo vota GO/NO-GO.
4. Si hay GO → Documento 27 se marca FROZEN.
5. FROZEN de Documento 27 NO autoriza implementacion.
6. Antes de codigo deben crearse: 24_RIGOR_OPERATIVO_IRONSYNC_v0_1.md, 25_DEBT_REGISTRY.md, 26_DEEPSEEK_GUARDIAN_PROMPT_v0_1.md.
7. MiMo V2 presenta propuesta tecnica de codigo por feature.
8. Equipo itera propuesta tecnica.
9. Se detectan bugs probables y riesgos.
10. Se ejecuta War Room GO/NO-GO.
11. Se solicita auditoria externa si aplica.
12. Solo entonces se ejecuta la feature aprobada.
13. Cada feature se ejecuta, prueba, documenta y congela individualmente.

### Secuencia completa

Documento 27 DRAFT → Ronda de upgrades del equipo → Votacion equipo → Documento 27 FROZEN → Crear docs 24, 25, 26 → Resolver F-02 → Propuesta tecnica por feature → Iteracion equipo → War Room GO/NO-GO → Auditoria externa si aplica → Ejecucion por feature → Prueba + Documentacion + FROZEN → Siguiente feature → Laboratorio Sintetico (S01-S20) → IS Logbook v1.0 FROZEN.

### Regla fundamental

> "FROZEN de diseno no es permiso de ejecucion; es permiso para preparar ejecucion con rigor."

---

## 17. Criterios de aceptacion para FROZEN IS Logbook v1.0

| # | Criterio | Estado |
|---|----------|--------|
| 1 | F-01 a F-10 completadas | PENDIENTE |
| 2 | F-02 resuelta (fuente de verdad definida) | PENDIENTE |
| 3 | S01-S20 aprobados | PENDIENTE |
| 4 | 0 fallos criticos en laboratorio | PENDIENTE |
| 5 | PDF validado | PENDIENTE |
| 6 | Consolidacion operativa validada | PENDIENTE |
| 7 | DATA_LOCAL tratado segun F-02 | PENDIENTE |
| 8 | Finanzas no mezclado con Logbook | PENDIENTE |
| 9 | Documento de cierre creado | PENDIENTE |

---

## 18. Decisiones pendientes

| # | Decision | Opciones | Recomendacion |
|---|----------|----------|---------------|
| D1 | F-02 opcion final | A) Cerrar BUG-002 / B) Supabase + DATA_LOCAL read-only | B (pragmatica) |
| D2 | Foto final faltante | Rechazo / Flag con revision manual | Flag con revision manual |
| D3 | Foto borrosa | Flag / Rechazo | Flag |
| D4 | Turno zombie | Cierre automatico / Alerta | Alerta a 24h + cierre automatico a 48h |
| D5 | Consolidacion requiere aprobacion humana antes de Finanzas | Si / No | Si (recomendado) |
| D6 | QR fisico provisional vs placas | Provisional / Placa industrial | Provisional primero, placa despues |

---

## 19. Estado del documento

| Campo | Valor |
|-------|-------|
| Estado | DRAFT |
| Version | 1.0 |
| Fecha | 2026-05-05 |
| Autor | Guillermo (direccion) + MiMo V2 (redaccion) |
| Siguiente paso | Ronda de upgrades del equipo |
| Despues de upgrades | Votacion GO/NO-GO para FROZEN |
| FROZEN autoriza | Solo diseno aprobado. NO autoriza codigo. |

---

*"Disenamos con libertad. Implementamos con rigor. Cerramos con evidencia."*
