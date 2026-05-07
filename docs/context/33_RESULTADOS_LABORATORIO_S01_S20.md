# Doc 33 -- Resultados Laboratorio Sintetico S01-S20

Fecha: 2026-05-07
Autor: Equipo IronSync
Estado: COMPLETADO

---

## 1. Datos de ejecucion

| Campo | Valor |
|-------|-------|
| Fecha | 2026-05-07 |
| Hora inicio | ~11:55 AM |
| Hora cierre | ~12:19 PM |
| Duracion total | ~24 minutos |
| Runner humano | Guillermo |
| Maquina principal | CAT336 |
| Maquina reserva | CAT320 (remanente excluido) |
| Horometro rango laboratorio | 5101 a 5145 |
| Nota horometro | Rango acumulado de los 5 turnos creados durante el laboratorio |
| Flag LOGBOOK_F04_ENABLED | ON temporal durante ~24 min |
| Flag al cierre | OFF |
| Codigo funcional | Sin cambios |
| DATA_LOCAL | Intacto |
| Legacy | Intacto |
| Lote 3 / RELEVO | Bloqueado |

---

## 2. Estado Cero

| Verificacion | Esperado | Real | Estado |
|--------------|----------|------|--------|
| EC-01: Turnos abiertos reales | 0 | 0 | PASS |
| EC-02: Turnos abiertos CAT336 | 0 | 0 | PASS |
| EC-03: Turnos abiertos CAT320 | 0 | 1 (remanente) | CONTROLADO |
| EC-04: Remanentes controlados | 4 | 4 | PASS |
| EC-05: LOGBOOK_F04_ENABLED | false | false | PASS |
| EC-06: Legacy responde | hola normal | Normal | PASS |
| EC-07: DATA_LOCAL intacto | Intacto | Intacto | PASS |

Hallazgo EC-04: 36 anomalias totales (4 ABIERTOS + 32 CERRADOS historicos).
Los 4 ABIERTOS son los remanentes controlados documentados.
Los 32 CERRADOS son datos historicos de testing anterior.
No bloquea laboratorio.

Hallazgo EC-03: CAT320 tiene turno abierto remanente.
Decision: Opcion B (solo CAT336 como maquina principal).

---

## 3. Resultados S01-S20

| # | Test | Tipo | Resultado |
|---|------|------|-----------|
| S01 | INICIO correcto con horometro | BLOQUEANTE | PASS |
| S02 | INICIO sin horometro (QR) | -- | SKIP (T02 Lote 1) |
| S03 | Respuesta horometro QR | -- | SKIP (T03 Lote 1) |
| S04 | INICIO horometro invalido | -- | SKIP (T06 Lote 1) |
| S05 | INICIO decimal punto | -- | SKIP (T05 Lote 1) |
| S06 | INICIO decimal coma | -- | SKIP (T06 Lote 1) |
| S07 | INICIO equipo inexistente | -- | PASS |
| S08 | INICIO operador no autorizado | -- | SKIP (T04 Lote 1) |
| S09 | INICIO turno duplicado | -- | PASS |
| S10 | Legacy flag OFF | -- | SKIP (EC-06 verificado) |
| S11 | FIN correcto con horometro | BLOQUEANTE | PASS |
| S12 | FIN sin horometro (QR) | -- | PASS |
| S13 | Respuesta horometro FIN QR | -- | PASS |
| S14 | FIN horometro invalido | -- | PASS |
| S15 | FIN sin turno abierto | BLOQUEANTE | PASS |
| S16 | FIN horometro menor | -- | PASS |
| S17 | Multiples ciclos secuenciales | -- | PASS |
| S18 | Remanentes excluidos | BLOQUEANTE | PASS |
| S19 | Legacy intacto | BLOQUEANTE | PASS |
| S20 | Verificacion final Supabase | BLOQUEANTE | PASS |

---

## 4. Resumen numerico

| Metrica | Valor |
|---------|-------|
| Total tests definidos | 20 |
| Tests ejecutados hoy | 13 |
| PASS ejecutados hoy | 13/13 |
| SKIP justificados | 7 |
| FAIL | 0 |
| Tests bloqueantes PASS | 6/6 |
| STOP ejecutados | 0 |
| Regresiones legacy | 0 |
| DATA_LOCAL modificado | 0 |
| Remanentes afectados | 0 |
| Duplicados Supabase | 0 |
| SQL fuera de plan | 0 |
| Turnos creados | 5 |
| Turnos cerrados | 5 |
| Flag OFF al cierre | Confirmado |

---

## 5. Justificacion de SKIP

| SKIP | Test | Justificacion |
|------|------|---------------|
| S02 | INICIO sin horometro | Validado en T02 Lote 1 |
| S03 | Respuesta horometro QR | Validado en T03 Lote 1 |
| S04 | INICIO horometro invalido | Validado en FIX-T06 Lote 1 |
| S05 | INICIO decimal punto | Validado en T05 Lote 1 |
| S06 | INICIO decimal coma | Validado en T06 Lote 1 |
| S08 | Operador no autorizado | Validado en T04 Lote 1 / requiere segundo telefono |
| S10 | Legacy flag OFF | Verificado en Estado Cero EC-06 |

---

## 6. Turnos creados por laboratorio

| Folio | Maquina | Horometro inicio | Horometro fin | Horas | Estado |
|-------|---------|------------------|---------------|-------|--------|
| CAT336-20260507-1659 | CAT336 | 5101 | 5110 | 9.00 | CERRADO |
| CAT336-20260507-9656 | CAT336 | 5111 | 5120 | 9.00 | CERRADO |
| CAT336-20260507-9923 | CAT336 | 5121.5 | 5130.1 | 8.60 | CERRADO |
| CAT336-20260507-8350 | CAT336 | 5136 | 5140 | 4.00 | CERRADO |
| CAT336-20260507-2866 | CAT336 | 5141 | 5145 | 4.00 | CERRADO |

Todos cerrados por: operador
Duplicados: 0

---

## 7. Hallazgos documentados

| # | Hallazgo | Severidad | Accion |
|---|----------|-----------|--------|
| 1 | Horometro debe ser mayor al ultimo registrado | INFO | Documentado |
| 2 | Horometro decimal punto funciona (5121.5) | INFO | Confirmado |
| 3 | Horometro decimal coma funciona | INFO | Validado por cobertura previa / no re-ejecutado en S01-S20 |
| 4 | Horas calculadas como enteros o 1 decimal | BAJA | DEBT-003, no bloqueante |
| 5 | 36 anomalias totales (no solo 4) | MEDIA | Actualizar YAML |
| 6 | CAT320 tiene turno abierto remanente | INFO | Controlado, Opcion B |

---

## 8. Anomalias totales

Total: 36 registros con tiene_anomalia = true

Desglose:
- 4 ABIERTOS (remanentes controlados):
  - CAT140H-20260506-9205
  - CAT320-20260506-9804
  - CAT740-20260506-5617
  - CATD8T-20260506-1435

- 32 CERRADOS (historicos testing):
  - IS-2026-04-26-CAT336-001
  - IS-2026-04-27-CAT336-001 a 011
  - IS-2026-04-28-CAT336-001 a 004
  - IS-2026-04-30-CAT336-002, 003
  - IS-2026-05-01-CAT140H, CAT320, CAT336 (varios)
  - IS-2026-05-02-CAT336-001
  - IS-2026-04-26-MAQUINA_INEXISTENTE-001

No interfirieron con el laboratorio S01-S20.
Para produccion piloto, deben permanecer excluidos/documentados
y revisarse en War Room.

---

## 9. Verificacion final Supabase

### Query 1: Turnos laboratorio
5 turnos creados, todos CERRADO, cerrado_por = operador.
0 turnos ABIERTOS inesperados.

### Query 2: Duplicados
0 duplicados.

### Query 3: Remanentes
4 remanentes intactos sin modificar.

### Query 4: Legacy post-lab
Bot responde menu normal con flag OFF.

---

## 10. Votacion post-lab

| Agente | Veredicto |
|--------|-----------|
| MiMo V2 | GO post-lab aceptado |
| ChatGPT | GO post-lab aceptado; NO-GO produccion piloto automatica |
| DeepSeek | GO post-lab aceptado |
| Grok | GO post-lab aceptado |
| Gemini | GO post-lab aceptado |
| Guillermo | Aprueba cierre documental, S21 y Qwen |

Decision:
Laboratorio S01-S20 aceptado como exitoso.
No autoriza produccion piloto automatica.
Siguiente paso: S21 + Qwen + War Room produccion piloto.

---

## 11. Conclusion

El Laboratorio Sintetico S01-S20 fue EXITOSO.

13/13 pruebas ejecutadas PASS.
0 FAIL.
0 STOP.
0 regresiones.
0 contaminacion.

El laboratorio NO autoriza produccion piloto automaticamente.
Siguiente paso: S21 (Jornada Virtual Completa) + Auditoria Qwen + War Room.

---

## 12. Proximos pasos

1. Doc 33 archivada (este documento)
2. YAML actualizado con resultados (patch separado)
3. Changelog actualizado (patch separado)
4. Doc 34 S21 creado
5. Qwen audita post-lab + S21
6. War Room produccion piloto

---

FIN DOC 33
