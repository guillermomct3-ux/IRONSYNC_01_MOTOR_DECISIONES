# IRONSYNC A — REBASELINE REPORT v1.0

## Metadata

| Campo | Valor |
|---|---|
| Documento | 04_REBASELINE_REPORT.md |
| Fecha | 2026-05-03 |
| Estado | BORRADOR — pendiente revisión Red Team |
| Repo | IRONSYNC_01_MOTOR_DECISIONES |
| Commit funcional de referencia | 142c971 |
| Commit documental base | 70cd552 |
| Autoría | Guillermo + Equipo IronSync |
| Propósito | Reconciliar PRD febrero, C0-C10 marzo, auditoría Qwen y repo real mayo antes de continuar ejecución técnica |

---

## 1. Dictamen ejecutivo

IronSync A no debe continuar con fixes, features ni limpieza de repo hasta reconciliar tres realidades:

1. **PRD febrero 2026**
   - IronSync A nació como memoria operativa de flotas pesadas.
   - WhatsApp-first.
   - Sin hardware.
   - Manuales OEM + RAG.
   - Gemelo Digital como núcleo estratégico.
   - GRIMM / El Inge como apoyo científico al mecánico.

2. **C0-C10 marzo 2026**
   - Logbook 2.0 como entrada por evidencia operativa.
   - OCR, QR, pHash, R-EVIDENCE, R-ASYNC.
   - Reglas frozen.
   - Dataset de regresión.
   - Gobernanza formal.

3. **Repo real mayo 2026**
   - Stack real: Node.js + Express + Twilio WhatsApp + Supabase + Railway + GitHub.
   - INICIO funciona.
   - FIN funciona.
   - PDF automático funciona / no bloquea FIN.
   - Persistencia dual JSON + Supabase sigue abierta.
   - La raíz del repo ya fue inventariada y evidencia deuda técnica alta.

Conclusión:
IronSync A es viable y ya tiene una vertical funcional, pero el repo está en estado **IS Logbook Lite / Sprint 0 funcional con deuda técnica alta**.

---

## 2. Hechos contrastados

| Hecho | Evidencia |
|---|---|
| INICIO funciona | Prueba real WhatsApp CAT336 |
| FIN funciona | Prueba real WhatsApp CAT336 |
| BUG-001 cerrado | empresaIdTurno corregido |
| PDF automático no bloquea FIN | Flujo real validado |
| Stack real operativo | Node.js + Express + Twilio + Supabase + Railway |
| GitHub ya es memoria oficial | /docs/context/ creado |
| Inventario raíz existe | 14_INVENTARIO_RAIZ_REPO.md |
| Persistencia dual sigue abierta | turnos_activos.json + Supabase |
| Scripts temporales existen | 58 TEMPORAL_FIX en raíz |
| .env existe local, no trackeado | verificación git ls-files .env vacía |

---

## 3. Interpretación

El repo actual no representa todavía el destino completo de IronSync A.

Debe clasificarse como:

IS Logbook Lite / Sprint 0 funcional

Esto significa:

- hay flujo real funcional;
- hay valor operativo probado;
- hay base técnica suficiente para hardening;
- pero no hay arquitectura final;
- no hay cumplimiento completo C6/C10;
- no hay limpieza controlada;
- no hay Master Baseline;
- no hay todavía IS Finanzas en código;
- no hay todavía Gemelo Digital completo en código.

---

## 4. Decisiones pendientes

| Decisión | Estado |
|---|---|
| Fuente única de verdad | Pendiente |
| Destino de turnos_activos.json | Pendiente |
| Destino de fix_*.js | Pendiente |
| Limpieza raíz repo | Pendiente |
| Master Baseline | Pendiente |
| PRD IS Finanzas | Pendiente |
| PRD IS Gemelo Digital | Pendiente |
| Criterios para salir de Logbook Lite | Propuestos, no frozen |

---

## 5. Diseño vs ejecución real

| Área | Diseño C6/C10 | Ejecución real mayo | Desviación |
|---|---|---|---|
| Entrada operador | QR + foto/OCR | Texto INICIO/FIN + horómetro | Logbook Lite |
| Evidencia | Foto + pHash + OCR | Texto + PDF automático | Evidencia parcial |
| Persistencia | Supabase como autoridad formal | Supabase + JSON local | Riesgo split-brain |
| Validación admin | Approval explícito | Flujo automático parcial | Pendiente |
| PDF | Conciliación robusta | PDF automático funcional | Parcial |
| Testing | Dataset mínimo de regresión | Pruebas manuales WhatsApp | Pendiente |
| Gobernanza | Fases + freeze + DoD | En proceso de recuperación | Parcial |
| Contexto | Capas + metodología | /docs/context/ inicial | En mitigación |

---

## 6. Diagnóstico Qwen aplicado

Qwen validó:

- producto viable;
- stack suficiente para MVP;
- avance significativo;
- arquitectura frágil;
- ejecución reactiva;
- riesgo crítico: persistencia dual JSON + Supabase.

Acción derivada:

No continuar features ni limpieza hasta cerrar Rebaseline y Master Baseline.

Qwen no invalidó IronSync. Qwen confirmó que el producto tiene tracción, pero exige estabilización antes de crecer.

---

## 7. Inventario raíz aplicado

El inventario 14_INVENTARIO_RAIZ_REPO.md confirma:

| Métrica | Valor |
|---|---|
| Archivos raíz visibles localmente | 93 |
| Carpetas raíz visibles localmente | 15 |
| TEMPORAL_FIX | 58 |
| DATA_LOCAL | 5 |
| BACKUP | 6 |
| PDF_PRUEBA | 2 |
| DOCUMENTO_ESTADO | 8 |
| DESCONOCIDO / basura terminal | 3 |

Hallazgos clave:

- 58 archivos temporales representan 62.4% de la raíz.
- 5 archivos DATA_LOCAL confirman riesgo de persistencia dual.
- turnos_activos.json.corrupto confirma evidencia histórica de fallo de persistencia.
- IRONSYNC_CODIGO_COMPLETO.txt crea riesgo de segunda fuente de verdad.
- .gitignore de 23 bytes debe revisarse en fase posterior.
- .env existe en disco, pero no está trackeado por Git.
- El inventario no autoriza limpieza.

---

## 8. Riesgos activos

| ID | Riesgo | Estado | Acción |
|---|---|---|---|
| R-PERSISTENCIA-DUAL | JSON local + Supabase pueden crear split-brain | Abierto | Diseñar fuente única |
| R-CONTEXTO | AIs pierden contexto entre chats | En mitigación | /docs/context/ |
| R-SCRIPTS-TEMP | 58 fix_*.js pueden confundir ejecución | Abierto | Clasificación futura |
| R-RAIZ-DESORDENADA | 93 archivos raíz visibles localmente | Abierto | Limpieza controlada futura |
| R-DUMP-CODIGO | IRONSYNC_CODIGO_COMPLETO.txt puede crear segunda fuente de verdad | Abierto | Clasificar / archivar |
| R-GIT-FORCE | Artefactos de terminal sugieren comandos peligrosos guardados como archivos | Abierto | Fase limpieza controlada |
| R-VERSIONES-DUALES | Variantes de webhook.js sin destino claro | Abierto | Clasificación futura |

---

## 9. Mapa de dependencias del producto

IS Logbook
  genera evidencia operativa

IS Finanzas
  monetiza evidencia validada

IS Gemelo Digital
  acumula memoria técnica, operativa y financiera

El Inge / GRIMM
  interpreta manuales OEM + historial del activo

Verify
  bilateraliza validación arrendador / arrendatario

Orden de construcción:

1. Estabilizar IS Logbook.
2. Diseñar IS Finanzas.
3. Diseñar IS Gemelo Digital.
4. Recuperar El Inge / GRIMM como capa técnica RAG.
5. Diseñar Verify como capa bilateral futura.

---

## 10. Definition of Done — salida de Logbook Lite

IS Logbook Lite deja de ser provisional cuando cumple:

1. Supabase queda definida como fuente única de verdad o JSON queda formalmente degradado a cache no autoritativa.
2. INICIO / FIN / PARO / REANUDA tienen prueba mínima documentada.
3. PDF automático no bloquea cierre de turno en 10/10 pruebas.
4. Persistencia y cierre de turno sobreviven reinicio Railway al menos 1 vez.
5. Hay al menos 10 turnos completos INICIO->FIN sin error crítico.
6. Hay al menos 3 equipos distintos probados.
7. Hay al menos 2 operadores o teléfonos distintos probados.
8. Bug Tracker formal existe.
9. Dev Pipeline formal existe.
10. Raíz del repo está inventariada y la limpieza controlada tiene plan aprobado.
11. Primer turno real DPM queda validado o se documenta bloqueo.

---

## 11. Mapa de exclusiones — qué NO es IronSync A hoy

IronSync A hoy NO es:

- ERP completo.
- Sistema fiscal/SAT.
- Sistema legal/notarial formal.
- Telemetría OEM.
- GPS.
- Sensor IoT.
- App nativa.
- Reemplazo del mecánico.
- Garantía de disponibilidad del equipo.
- Sustituto del criterio técnico certificado.
- Sistema de mantenimiento completo todavía.
- IS Finanzas ejecutado en código todavía.
- Gemelo Digital completo ejecutado en código todavía.
- Verify bilateral ejecutado todavía.
- Cumplimiento completo C6/C10 todavía.

---

## 12. Qué se conserva

Se conserva:

- Stack Node.js + Express + Twilio + Supabase + Railway.
- Flujo INICIO.
- Flujo FIN.
- PDF automático.
- Commits estables.
- Context layer /docs/context/.
- Prueba real CAT336 5900 -> 5901.
- Gobernanza de MiMo V2 como único escritor de código.

---

## 13. Qué queda bajo revisión

Bajo revisión:

- turnos_activos.json.
- cargarTurnos().
- guardarTurnos().
- scripts fix_*.js.
- backups sueltos.
- JSONs sueltos en raíz.
- PDFs de prueba en raíz.
- documentos viejos fuera de /docs/context/.
- IRONSYNC_CODIGO_COMPLETO.txt.

No se depreca ejecutando.
Se depreca mediante inventario, clasificación y aprobación.

---

## 14. NO-GO explícito

Hasta cerrar Master Baseline:

- NO tocar turnos.js.
- NO tocar webhook.js.
- NO borrar fix_*.js.
- NO mover backups.
- NO limpiar JSONs.
- NO modificar PDF automático.
- NO abrir IS Finanzas en código.
- NO abrir Gemelo Digital en código.
- NO hacer git add .

---

## 15. Decisiones propuestas para congelar

| # | Decisión |
|---|---|
| D-034 | El repo actual se clasifica como IS Logbook Lite / Sprint 0 funcional. |
| D-035 | C6/C10 son destino arquitectónico, no descripción exacta del repo actual. |
| D-036 | Supabase será candidata a fuente única de verdad, pendiente de diseño formal. |
| D-037 | No se limpia raíz del repo sin inventario y clasificación A/B/C. |
| D-038 | Todo archivo temporal en raíz se considera deuda hasta clasificarlo. |
| D-039 | IS Finanzas no entra a código hasta estabilizar IS Logbook. |
| D-040 | IS Gemelo Digital no entra a código hasta definir modelo de eventos y activo. |

---

## 16. Criterio de salida del Rebaseline

Este reporte pasa de BORRADOR a ACEPTADO cuando Guillermo y el equipo confirmen:

- qué se conserva;
- qué se migra;
- qué se depreca;
- qué queda como desviación;
- qué se ejecuta primero.

Criterio de salida operativo:

El siguiente documento debe poder construirse sin ambigüedad: 05_MASTER_BASELINE.md

---

## 17. Próxima acción recomendada

Crear: 05_MASTER_BASELINE.md

Razón:

El Rebaseline diagnostica.
El Master Baseline decide.

Después del Master Baseline se define:

- arquitectura de persistencia única;
- limpieza controlada;
- Dev Pipeline;
- PRD IS Finanzas;
- PRD IS Gemelo Digital.

---

## 18. Voto

GO para revisión Red Team del Rebaseline.
NO-GO para ejecución técnica antes de aprobarlo.

---

*Rebaseline Report v1.0 — IronSync A*
*Commit funcional: 142c971 | Commit documental: 70cd552*
*93 archivos raíz. 15 carpetas. IS Logbook Lite / Sprint 0 funcional.*
*Este documento NO autoriza limpieza, features ni fixes.*
