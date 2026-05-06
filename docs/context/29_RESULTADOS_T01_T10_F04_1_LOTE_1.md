# DOCUMENTO 29 — RESULTADOS T01-T10 F-04.1 LOTE 1

**Fecha:** 2026-05-06
**Estado:** DRAFT / PARA REVISION DEL EQUIPO
**Autor:** Guillermo (operador humano) + MiMo V2 (ejecucion y documentacion)
**Clasificacion:** EVIDENCIA DE PRUEBAS
**Version:** 1.0

---

## 1. Contexto

El 6 de mayo de 2026, el equipo multiagente autorizo (War Room GO) una activacion
controlada de LOGBOOK_F04_ENABLED=true para ejecutar las pruebas T01-T10 del
feature F-04.1 Lote 1 (Logbook INICIO QR/manual).

### Secuencia

1. Checklist Supabase ejecutado (queries SELECT).
2. Hallazgo bloqueador: operadores.empresa_id no existia.
3. War Room DB prereq: GO para ALTER TABLE + UPDATE.
4. ALTER TABLE operadores ADD COLUMN empresa_id UUID ejecutado.
5. UPDATE operadores SET empresa_id para 4 operadores activos ejecutado.
6. Verificacion: 0 operadores activos sin empresa_id.
7. War Room activacion: GO para pruebas T01-T10.
8. LOGBOOK_F04_ENABLED=true activado en Railway.
9. Railway Ready confirmado.
10. Pruebas T01-T10 ejecutadas.
11. LOGBOOK_F04_ENABLED=false restaurado al finalizar.

### Participantes

- Guillermo: operador humano, envio mensajes WhatsApp, verifico Supabase.
- MiMo V2: coordinacion, documentacion, queries SELECT.

### Alcance autorizado

- F-04.1 Lote 1: INICIO QR/manual.
- Pruebas T01-T10 unicamente.
- Flag ON solo durante ventana controlada.

### Alcance NO autorizado

- Lote 2 (FIN, RELEVO, ZOMBIE, FOTO).
- Cambios de codigo.
- Supabase SQL adicional (excepto SELECT de verificacion).
- Modificar DATA_LOCAL.
- Dejar flag ON por inercia.

---

## 2. Resultado general

| Metrica | Cantidad |
|---------|----------|
| PASS | 7 |
| PASS PARCIAL | 1 |
| SKIP | 2 |
| FAIL | 0 |
| Total | 10 |

---

## 3. Tabla T01-T10

| Test | Mensaje WhatsApp | Resultado esperado | Resultado real | Estado | Observaciones |
|------|------------------|--------------------|----------------|--------|---------------|
| T01 | INICIO CAT336 5000 | Turno ABIERTO + Folio | Turno ABIERTO, Folio CAT336-20260506-1963 | PASS | Supabase verificado: empresa_id, origen_datos=manual, estado=ABIERTO |
| T02 | INICIO CAT966M | Pide contador | CAT966M lista. Sin cierre previo. Manda contador. | PASS | Sin turno creado en Supabase hasta recibir contador |
| T03 | 5000 (tras T02) | Turno ABIERTO + Folio | Turno ABIERTO, Folio CAT966M-20260506-4442 | PASS | Supabase verificado: origen_datos=qr_legacy, empresa_id correcto |
| T04 | INICIO CAT336 (numero ajeno) | No registrado | No testeable | SKIP | Requiere segundo telefono con numero no registrado en operadores |
| T05 | INICIO BATMAN9000 5000 | Equipo no encontrado | Equipo BATMAN9000 no encontrado | PASS | Mensaje exacto como esperado |
| T06 | INICIO CAT336 abc | Contador inválido | CAT336 lista. Ultimo cierre: 5901. Manda contador. | PASS PARCIAL | parseHorometro(abc) = null, sistema entra a flujo QR. Ver seccion 5 para discusion |
| T07 | INICIO CAT336 100 | Horómetro menor | Ya tienes turno abierto en CAT336 | SKIP | Turno ABIERTO de T01 bloquea test. Requiere FIN (Lote 2) como precondicion |
| T08 | INICIO CAT336 5100 (ya abierto) | Ya tienes turno abierto | Ya tienes turno abierto en CAT336, Folio CAT336-20260506-1963 | PASS | Supabase verificado: 1 solo turno ABIERTO, sin duplicado |
| T09 | INICIO CAT140H 5000.5 | Turno ABIERTO + decimal | Turno ABIERTO, Folio CAT140H-20260506-9205, Contador 5000.5 | PASS | Supabase verificado: horometro_inicio=5000.5, decimal preservado |
| T10 | hola | Legacy normal | Hola Guillermo, menu legacy intacto | PASS | Legacy routing funciona con flag ON |

---

## 4. Supabase — Turnos creados durante pruebas

### Turnos creados

| # | id | Folio | Maquina | Operador | Horometro | Estado | Origen datos | empresa_id | Creado en |
|---|-----|-------|---------|----------|-----------|--------|-------------|------------|-----------|
| 1 | 95805ab5 | CAT336-20260506-1963 | CAT336 | Guillermo | 5000 | ABIERTO | manual | b4feaa0f | 2026-05-06 17:28:01 |
| 2 | 275492fc | CAT966M-20260506-4442 | CAT966M | Guillermo | 7500 | ABIERTO | qr_legacy | b4feaa0f | 2026-05-06 17:31:05 |
| 3 | df2bd7e4 | CAT140H-20260506-9205 | CAT140H | Guillermo | 5000.5 | ABIERTO | manual | b4feaa0f | 2026-05-06 17:39:20 |

### Verificaciones por turno

**Turno 1 (CAT336-20260506-1963):**

| Campo | Valor esperado | Valor real | OK? |
|-------|---------------|------------|-----|
| maquina | CAT336 | CAT336 | SI |
| operador_nombre | Guillermo | Guillermo | SI |
| operador_telefono | +525539954872 | +525539954872 | SI |
| horometro_inicio | 5000 | 5000 | SI |
| estado | ABIERTO | ABIERTO | SI |
| origen_datos | manual | manual | SI |
| empresa_id | b4feaa0f-... | b4feaa0f-... | SI |
| sin_foto_inicio | true | true | SI |
| estado_foto | esperando_foto_inicio | esperando_foto_inicio | SI |
| tiene_anomalia | false | false | SI |

**Turno 2 (CAT966M-20260506-4442):**

| Campo | Valor esperado | Valor real | OK? |
|-------|---------------|------------|-----|
| maquina | CAT966M | CAT966M | SI |
| operador_nombre | Guillermo | Guillermo | SI |
| horometro_inicio | 7500 | 7500 | SI |
| estado | ABIERTO | ABIERTO | SI |
| origen_datos | qr_legacy | qr_legacy | SI |
| empresa_id | b4feaa0f-... | b4feaa0f-... | SI |
| sin_foto_inicio | true | true | SI |
| tiene_anomalia | false | false | SI |

**Turno 3 (CAT140H-20260506-9205):**

| Campo | Valor esperado | Valor real | OK? |
|-------|---------------|------------|-----|
| maquina | CAT140H | CAT140H | SI |
| operador_nombre | Guillermo | Guillermo | SI |
| horometro_inicio | 5000.5 | 5000.5 | SI |
| estado | ABIERTO | ABIERTO | SI |
| origen_datos | manual | manual | SI |
| empresa_id | b4feaa0f-... | b4feaa0f-... | SI |
| sin_foto_inicio | true | true | SI |
| tiene_anomalia | false | false | SI |

---

## 5. Hallazgo T06 - Horometro invalido

### Mensaje enviado

INICIO CAT336 abc

### Resultado esperado

El contador debe ser un numero. Ejemplo: 5000 o 5000.5

### Resultado real

CAT336 lista. Ultimo cierre: 5901 horas. Manda el contador actual.

### Comportamiento observado

La funcion parseHorometro("abc") retorna null. El sistema interpreta INICIO CAT336 como flujo QR sin contador y pide horometro al operador. No rechaza el mensaje.

### Discusion

Opcion A - Tratar como contador invalido (rechazo directo):
- Mensaje claro al operador: "abc no es un numero".
- Menos pasos para el operador.
- Requiere detectar intencion del operador (horometro vs QR).

Opcion B - Tratar como flujo QR / pide contador (comportamiento actual):
- Tolerante: si no entiende, pide aclaracion.
- No rechaza al operador, lo guia.
- Paso extra para el operador.

### Recomendacion pendiente del equipo

Decision requerida: T06 es bug o feature?
Si es bug: priorizar fix antes de activar flag en produccion.
Si es feature: documentar como comportamiento esperado y cerrar.

---

## 6. Tests SKIP

### T04 - Operador no registrado

- Test: T04
- Descripcion: Operador no registrado intenta INICIO
- Resultado esperado: Tu numero no esta registrado. Habla con tu supervisor.
- Estado: SKIP
- Razon: Requiere segundo telefono con numero no registrado en tabla operadores
- Codigo relevante: logbookService.js - validarOperacionBase()
- Mitigacion: El codigo existe y retorna OPERADOR_NO_AUTORIZADO. Validar en produccion cuando ocurra.

### T07 - Horometro menor al ultimo cierre

- Test: T07
- Descripcion: Operador intenta INICIO con horometro menor al ultimo cierre
- Resultado esperado: Contador menor al anterior. Anterior: 5901. Recibido: 100. Verifica.
- Estado: SKIP
- Razon: Requiere turno cerrado previo en CAT336. Turno de T01 sigue ABIERTO. Cerrar requiere FIN (Lote 2), no autorizado.
- Codigo relevante: logbookService.js - buscarUltimoCierre()
- Mitigacion: Se testeara cuando Lote 2 este activo y se pueda cerrar turnos.

### Impacto de los SKIP

| Test | Riesgo si no se testea | Prioridad sugerida |
|------|----------------------|-------------------|
| T04 | Bajo. Codigo existe y es straightforward. | Testear en produccion con numero ajeno. |
| T07 | Medio. Horometro menor puede causar datos corruptos si no se bloquea. | Testear al activar Lote 2. |

---

## 7. Estado final del flag

| Verificacion | Estado |
|-------------|--------|
| LOGBOOK_F04_ENABLED en Railway | false |
| Railway deploy posterior a flag OFF | Ready |
| Legacy WhatsApp funciona | SI |
| Logbook dormido | SI |
| Turnos de prueba permanecen en Supabase | SI (estado ABIERTO, sin cerrar) |

### Nota sobre turnos de prueba

Los 3 turnos creados durante pruebas permanecen ABIERTOS en Supabase:

| Folio | Maquina | Estado |
|-------|---------|--------|
| CAT336-20260506-1963 | CAT336 | ABIERTO |
| CAT966M-20260506-4442 | CAT966M | ABIERTO |
| CAT140H-20260506-9205 | CAT140H | ABIERTO |

Decision requerida: Cerrar estos turnos cuando Lote 2 este activo?
Opcional: marcar como turnos de prueba en observaciones.

---

## 8. Estado final del sistema

| Verificacion | Estado |
|-------------|--------|
| Legacy WhatsApp funciona | SI |
| DATA_LOCAL tocado | NO |
| webhook.js modificado | NO |
| lib/ modificado | NO |
| services/ modificado | NO |
| Supabase SQL adicional ejecutado | NO (solo SELECT de verificacion) |
| Deploy nuevo durante pruebas | NO |
| Lote 2 | BLOQUEADO |
| Codigo nuevo | NO |
| Flag | OFF |

---

## 9. Preguntas para el equipo

### P1 - T06 es bug o feature?

Contexto: INICIO CAT336 abc entra al flujo QR en vez de rechazar.
Opcion A: Bug. Debe rechazar con "contador invalido".
Opcion B: Feature. Tolerante, pide aclaracion.
Decision requerida del equipo.

### P2 - Priorizamos T04 con segundo telefono?

Contexto: No pudimos testear operador no registrado.
Opciones: a) Pedir segundo telefono para pruebas futuras. b) Validar en produccion. c) Crear operador de prueba con numero conocido.
Decision requerida del equipo.

### P3 - Como preparamos T07 sin adelantar Lote 2?

Contexto: T07 requiere turno cerrado previo. Cerrar requiere FIN (Lote 2).
Opciones: a) Esperar a Lote 2. b) Insertar turno cerrado directamente en Supabase para testing. c) Skip definitivo.
Decision requerida del equipo.

### P4 - Cuando convocar War Room de decision post-test?

Contexto: Resultados listos. Equipo necesita decidir siguiente paso.
Opciones: a) Ahora. b) Siguiente sesion. c) Despues de fix T06 si es bug.
Decision requerida del equipo.

---

## 10. Estado del documento

| Campo | Valor |
|-------|-------|
| Estado | DRAFT |
| Version | 1.0 |
| Fecha | 2026-05-06 |
| Siguiente paso | Revision del equipo |
| Autoriza | Solo documentacion. NO autoriza codigo, flag, ni Lote 2. |
