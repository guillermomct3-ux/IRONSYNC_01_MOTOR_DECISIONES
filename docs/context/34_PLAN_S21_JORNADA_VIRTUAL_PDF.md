# Doc 34 -- Plan S21 Jornada Virtual Completa + PDF

Fecha: 2026-05-07
Autor: Equipo IronSync
Estado: PENDIENTE EJECUCION

---

## 1. Objetivo

Validar que un turno puede permanecer abierto durante una jornada
virtual larga (4-8 horas), que FIN funciona correctamente al cierre,
que el PDF Reporte Diario se genera automaticamente y se envia
por WhatsApp, y que el sistema permanece estable durante toda
la ventana.

---

## 2. Alcance

| Incluido | No incluido |
|----------|-------------|
| Turno largo 4-8 horas | Produccion piloto |
| PDF automatico post-FIN | Multiples operadores |
| Validacion Supabase | Lote 3 / RELEVO |
| Legacy intacto | Codigo nuevo |
| DATA_LOCAL intacto | SQL nuevo |
| Remanentes intactos | Feature flags permanentes |

---

## 3. Pre-S21

### 3.1 Documentacion (obligatorio antes de S21)

- [ ] Doc 33 archivada
- [ ] YAML actualizado con resultados S01-S20 (patch separado)
- [ ] Changelog actualizado (patch separado)
- [ ] Doc 34 creada (este documento)

### 3.2 Estado Cero S21

- [ ] LOGBOOK_F04_ENABLED = false confirmado
- [ ] 0 turnos abiertos reales (query)
- [ ] 4 remanentes intactos (query)
- [ ] DATA_LOCAL intacto
- [ ] Legacy responde hola
- [ ] PDF feature activa (ver docs/features/logbook/pdf_reporte_diario/)

### 3.3 Ventana

- [ ] Ventana controlada aprobada por Guillermo
- [ ] Guillermo disponible para activar/desactivar flag
- [ ] 4-8 horas disponibles para jornada pasiva

---

## 4. Ejecucion S21

### 4.1 Activacion

| Paso | Accion | Estado |
|------|--------|--------|
| 1 | Activar LOGBOOK_F04_ENABLED = true | [ ] |
| 2 | Esperar redeploy (~30-90 seg) | [ ] |
| 3 | Confirmar flag ON | [ ] |

### 4.2 INICIO

| Paso | Accion | Estado |
|------|--------|--------|
| 4 | Enviar: INICIO CAT336 [horometro] | [ ] |
| 5 | Confirmar turno ABIERTO en WhatsApp | [ ] |
| 6 | Confirmar turno ABIERTO en Supabase | [ ] |
| 7 | Guardar folio para validacion post | [ ] |
| 8 | Desactivar LOGBOOK_F04_ENABLED = false | [ ] |
| 9 | Confirmar flag OFF antes de jornada pasiva | [ ] |

### 4.3 Jornada pasiva (4-8 horas)

Flag permanece OFF durante toda la espera.

| Paso | Accion | Frecuencia | Estado |
|------|--------|------------|--------|
| 10 | Verificar legacy intacto (enviar hola) | 1 vez a mitad | [ ] |
| 11 | Verificar DATA_LOCAL intacto | 1 vez a mitad | [ ] |
| 12 | Verificar remanentes intactos (query) | 1 vez a mitad | [ ] |
| 13 | Verificar turno sigue ABIERTO en Supabase | 1 vez a mitad | [ ] |

### 4.4 FIN

| Paso | Accion | Estado |
|------|--------|--------|
| 14 | Activar LOGBOOK_F04_ENABLED = true | [ ] |
| 15 | Esperar redeploy (~30-90 seg) | [ ] |
| 16 | Confirmar flag ON | [ ] |
| 17 | Enviar: FIN CAT336 [horometro final] | [ ] |
| 18 | Confirmar turno CERRADO en WhatsApp | [ ] |
| 19 | Confirmar horas_turno correctas | [ ] |
| 20 | Confirmar PDF generado automaticamente | [ ] |
| 21 | Confirmar PDF enviado por WhatsApp | [ ] |
| 22 | Desactivar LOGBOOK_F04_ENABLED = false | [ ] |
| 23 | Confirmar flag OFF | [ ] |

---

## 5. Post-S21

| Paso | Accion | Estado |
|------|--------|--------|
| 24 | Enviar hola al bot (confirmar legacy) | [ ] |
| 25 | Query: turno S21 CERRADO, datos correctos | [ ] |
| 26 | Query: 0 duplicados | [ ] |
| 27 | Query: remanentes intactos | [ ] |
| 28 | Query: 0 turnos ABIERTOS inesperados | [ ] |
| 29 | DATA_LOCAL intacto | [ ] |
| 30 | Descargar PDF y guardar evidencia | [ ] |
| 31 | Documentar resultados S21 | [ ] |

---

## 6. Validaciones S21

| # | Validacion | Esperado | Real | Estado |
|---|-----------|----------|------|--------|
| S21-01 | Turno estable durante jornada larga | ABIERTO sin corrupcion | | [ ] |
| S21-02 | FIN funciona despues de horas | CERRADO correcto | | [ ] |
| S21-03 | horas_turno calculadas correctamente | Horas reales | | [ ] |
| S21-04 | PDF genera automaticamente post-FIN | PDF creado | | [ ] |
| S21-05 | PDF envia por WhatsApp | PDF recibido | | [ ] |
| S21-06 | PDF contenido correcto | Folio, maquina, horas OK | | [ ] |
| S21-07 | PDF tamano razonable | <1 MB | | [ ] |
| S21-08 | Legacy intacto durante toda la jornada | Menu normal | | [ ] |
| S21-09 | DATA_LOCAL no se toca | Intacto | | [ ] |
| S21-10 | Remanentes no se modifican | 4 intactos | | [ ] |

---

## 7. Criterios de exito

EXITOSO si:
- 10/10 validaciones PASS
- 0 regresiones legacy
- PDF genera y envia correctamente
- Flag OFF al cierre
- Turno CERRADO con datos correctos en Supabase

---

## 8. Criterios de falla

FALLIDO si:
- PDF no genera o no envia
- Turno se corrompe durante espera
- Legacy se rompe
- DATA_LOCAL se modifica
- Remanentes se modifican
- Flag no vuelve a OFF

---

## 9. Condiciones

| Condicion | Detalle |
|-----------|---------|
| Pre-requisito | No ejecutar S21 sin cierre documental S01-S20, YAML actualizado y ventana controlada aprobada |
| Ventana | 4-8 horas pasivas + 30 min activos |
| Flag ON | Solo durante INICIO (~5 min) y FIN (~5 min) |
| Flag OFF | Durante toda la jornada pasiva |
| Runner | Guillermo |
| Maquina | CAT336 |

---

## 10. Restricciones activas

- No produccion piloto
- No Lote 3 / RELEVO
- No codigo nuevo
- No SQL nuevo
- No DELETE
- LOGBOOK_F04_ENABLED = false durante jornada pasiva
- LOGBOOK_F04_ENABLED = true solo durante INICIO y FIN
- DATA_LOCAL no se toca
- Legacy se mantiene intacto
- docs/features/ no se toca

---

## 11. Secuencia completa

1. Doc 33 archivada (S01-S20)
2. YAML actualizado (patch separado)
3. Changelog actualizado (patch separado)
4. Doc 34 creada (S21) -- este documento
5. S21 ejecutado
6. Resultados S21 documentados
7. Qwen audita post-lab + S21
8. War Room produccion piloto

---

FIN DOC 34
