# 20_PLAN_DEL_DIA_REPO_CLEANUP_CLASIFICAR_D

Proyecto: IronSync A
Fecha: 2026-05-04
Estado: PLAN_DEL_DIA / EJECUCION_BLOQUEADA
Documento base: docs/context/16_REPO_CLEANUP_PLAN.md
Documento anterior: docs/context/19_PLAN_DEL_DIA_REPO_CLEANUP_FASE_0B_TRACKEADOS.md
Aprobacion: Guillermo + ChatGPT — GO condicionado a la creacion de este archivo
Ejecutor autorizado: MiMo V2
Alcance: Clasificacion definitiva de los 39 archivos D antes de cualquier limpieza

---

## 1. Objetivo

Reclasificar los 39 archivos D resultantes de Fase 0 + Fase 0b antes de ejecutar cualquier limpieza.

39 archivos D es demasiado para ejecutar Fase 1 con confianza.
Ejecutar Fase 1 solo con los 27 C actuales limpiaria parcialmente el repo y dejaria deuda ambigua.
La solucion es clasificar los 39 D primero, y despues ejecutar Fase 1 con el mapa completo.

Este documento NO autoriza ejecucion de diagnostico.

---

## 2. Estado

Estado actual del mapa de raiz:

| Punto | Valor |
|---|---|
| Branch | main |
| Commit actual | dc10ec8 |
| Fase 0 | COMPLETADA |
| Fase 0b | COMPLETADA |
| Mapa raiz completo | 92 archivos |
| Fase 1 | BLOQUEADA |
| DATA_LOCAL | BLOQUEADO hasta BUG-002 |

Clasificacion actual:

| Categoria | Cantidad | Estado |
|---|---|---|
| A — Produccion / conservar | 7 | Confirmado |
| B — Historico / archivar | 15 | Confirmado |
| C — Candidato a aislamiento | 27 | Confirmado |
| D — Investigar | 39 | PENDIENTE DE CLASIFICACION |
| DATA_LOCAL — Bloqueado | 4 | BLOQUEADO |

Archivos A confirmados (no tocar):

- .gitignore
- package.json
- package-lock.json
- turnos.js
- webhook.js
- respuestas.js (confirmado con 1 referencia en turnos.js:14)
- validadores.js (confirmado con 19 referencias en turnos.js)

---

## 3. Alcance

Este documento permite unicamente:

1. Disenar la fase de diagnostico de los 39 D.
2. Definir metodo de clasificacion por archivo.
3. Definir reglas de reclasificacion.
4. Definir STOP tecnico.
5. Definir entregable futuro.
6. Preparar votacion de ejecucion.

Este documento NO permite:

1. Ejecutar diagnostico.
2. Mover archivos.
3. Borrar archivos.
4. Archivar archivos.
5. Ejecutar git rm.
6. Ejecutar git mv.
7. Ejecutar git add ..
8. Tocar DATA_LOCAL.
9. Tocar codigo productivo.
10. Hacer deploy.

---

## 4. Clasificacion destino

Cada archivo D debera reclasificarse como:

A — Produccion / conservar
Si tiene dependencia activa en codigo productivo. A nunca se borra.

B — Historico / archivar
Si es backup, snapshot, evidencia historica o documento con valor pero sin uso activo. B se archiva, no se elimina.

C — Candidato a aislamiento/archivo
Si no tiene dependencia y es script temporal, artefacto o archivo inutil. C puede aislarse/archivarse con aprobacion.

D — Sigue investigando
Si hay duda persistente despues del diagnostico. D permanece hasta nueva informacion.

---

## 5. Reglas

- Si hay duda, permanece D.
- Si tiene dependencia activa en turnos.js, webhook.js u otro archivo productivo, pasa a A.
- Si es backup, snapshot o evidencia historica, pasa a B.
- Si no tiene dependencia y es script temporal o artefacto, pasa a C.
- Si es 0 bytes y sin referencias, puede pasar a C salvo que sea placeholder intencional.
- Si tiene contenido util pero no produccion, puede pasar a B.
- Si toca webhook/router/Twilio/turnos y tiene dependencia, pasa a A.
- Si toca webhook/router/Twilio/turnos y NO tiene dependencia, pasa a D hasta verificar mas.
- DATA_LOCAL queda fuera. No se toca.
- turnos.js y webhook.js no se modifican.
- respuestas.js y validadores.js ya son A. No se reabren.

---

## 6. Diagnostico futuro permitido

Solo lectura:

- dir [archivo]
- type [archivo] | Select-Object -First 20
- git log --oneline -- [archivo]
- git log --oneline -3 -- [archivo]
- Select-String -Path "turnos.js","webhook.js" -Pattern "[nombre_sin_extension]"
- Select-String -Path "*.js" -Pattern "[nombre_sin_extension]"
- Select-String -Path "*.js" -Pattern "[funcion_o_export_detectado]"

---

## 7. Diagnostico por archivo D

Para cada uno de los 39 archivos D, MiMo V2 debera completar:

| Campo | Descripcion |
|---|---|
| Archivo | Nombre exacto |
| Origen | Fase 0 (untracked) o Fase 0b (trackeado) |
| Tamano | dir [archivo] |
| Primeras lineas | type [archivo] | Select-Object -First 20 |
| Proposito probable | Inferido del contenido |
| Referencias en turnos.js | Si/No + linea si aplica |
| Referencias en webhook.js | Si/No + linea si aplica |
| Referencias en *.js | Si/No + archivo y linea si aplica |
| Ultimo commit | git log --oneline -3 -- [archivo] |
| Clasificacion nueva | A, B, C o D |
| Razon | Explicacion de la decision |
| Accion futura sugerida | Proteger, archivar, aislar o seguir investigando |

### Lista de los 39 archivos D a diagnosticar:

#### Grupo 1 — fix_*.js trackeados genericos (9 archivos):

| # | Archivo | Origen |
|---|---|---|
| 1 | fix1.js | Fase 0b |
| 2 | fix3.js | Fase 0b |
| 3 | fix4.js | Fase 0b |
| 4 | fix5.js | Fase 0b |
| 5 | fix6.js | Fase 0b |
| 6 | fix8.js | Fase 0b |
| 7 | fix9.js | Fase 0b |
| 8 | fix11.js | Fase 0b |
| 9 | fix12.js | Fase 0b |

Regla especial: Si nombre generico, sin dependencias, commit anterior a estabilizacion, puede pasar a C.

#### Grupo 2 — fix_*.js trackeados con nombre (11 archivos):

| # | Archivo | Origen |
|---|---|---|
| 10 | fix_ayuda.js | Fase 0b |
| 11 | fix_integrar.js | Fase 0b |
| 12 | fix_ok.js | Fase 0b |
| 13 | fix_status.js | Fase 0b |
| 14 | fix_upg01.js | Fase 0b |
| 15 | fix_upg05.js | Fase 0b |
| 16 | fix_upg05b.js | Fase 0b |
| 17 | fix_upg09.js | Fase 0b |
| 18 | fix_upg13_14.js | Fase 0b |
| 19 | fix_upg26_27.js | Fase 0b |
| 20 | fix_upgrades.js | Fase 0b |

#### Grupo 3 — Otros D trackeados (3 archivos):

| # | Archivo | Origen |
|---|---|---|
| 21 | pdfReporteDiario.js | Fase 0b |
| 22 | ver_case.js | Fase 0b |
| 23 | webhook_test.js | Fase 0b |

#### Grupo 4 — fix_*.js untracked (16 archivos):

| # | Archivo | Origen |
|---|---|---|
| 24 | fix_deepseek_f1.js | Fase 0 |
| 25 | fix_empresaIdTurno.js | Fase 0 |
| 26 | fix_move_override.js | Fase 0 |
| 27 | fix_require_lazy.js | Fase 0 |
| 28 | fix_router.js | Fase 0 |
| 29 | fix_router_override.js | Fase 0 |
| 30 | fix_turnos_empresa.js | Fase 0 |
| 31 | fix_turnos_empresa2.js | Fase 0 |
| 32 | fix_twilio_client.js | Fase 0 |
| 33 | fix_webhook_legacy_override.js | Fase 0 |
| 34 | fix_webhook_legacy_v2.js | Fase 0 |
| 35 | fix_webhook_line.js | Fase 0 |
| 36 | fix_webhook_override.js | Fase 0 |
| 37 | fix_webhook_status.js | Fase 0 |
| 38 | fix_status_callback.js | Fase 0 |
| 39 | fix_status2.js | Fase 0 |

Total: 39 archivos D.

---

## 8. STOP tecnico

Debe detenerse toda ejecucion si ocurre cualquiera de estos casos:

1. Aparece dependencia activa inesperada en un archivo D.
2. Aparece relacion con webhook/router/turnos/Twilio que no estaba documentada.
3. Aparece DATA_LOCAL involucrado.
4. Aparece contenido sensible.
5. Hay duda persistente sobre proposito despues de diagnosticar.
6. Alguien propone borrar/mover antes de terminar clasificacion.
7. Alguien propone git add ., git rm o git clean.
8. git status muestra cambios inesperados.

Accion bajo STOP tecnico:

1. No continuar.
2. Reportar hallazgo.
3. No improvisar.
4. Volver a votacion.
5. Archivo permanece D hasta nueva decision.

---

## 9. Entregable futuro

Cuando se autorice el diagnostico, MiMo V2 debera entregar:

Tabla de los 39 D con:

1. Archivo (nombre exacto).
2. Origen (Fase 0 o Fase 0b).
3. Tamano (bytes).
4. Referencias encontradas (turnos.js, webhook.js, *.js).
5. Ultimo commit.
6. Clasificacion nueva (A, B, C o D).
7. Razon de clasificacion.
8. Accion futura sugerida.

Mas:

- Total reclasificados como A.
- Total reclasificados como B.
- Total reclasificados como C.
- Total que permanecen D.
- Mapa actualizado post-clasificacion.
- Recomendacion GO/NO-GO para ejecutar Fase 1 con mapa completo.
- Confirmacion: 0 archivos modificados, movidos o borrados.

---

## 10. Siguiente decision

Despues de crear este documento, la siguiente decision NO es ejecutar el diagnostico.

La siguiente decision es:

GO / NO-GO para ejecutar diagnostico de clasificacion D.

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

## 11. Veredicto

20_PLAN_DEL_DIA_REPO_CLEANUP_CLASIFICAR_D.md queda como:

PLAN_DEL_DIA / EJECUCION_BLOQUEADA

Autoriza preparar votacion de diagnostico de los 39 D.
No autoriza ejecutar diagnostico.
No autoriza ejecutar Fase 1.
No autoriza limpieza.

---

## 12. Frase rectora

Primero clasificamos los D. Despues disenamos la limpieza.

---

*Nota final: Este documento NO autoriza limpieza, codigo, fixes, deploy, mover archivos, borrar archivos ni tocar DATA_LOCAL.*

*20_PLAN_DEL_DIA_REPO_CLEANUP_CLASIFICAR_D — IronSync A*
*Fecha: 2026-05-04*
*Estado: PLAN_DEL_DIA / EJECUCION_BLOQUEADA*
*Documento base: 16_REPO_CLEANUP_PLAN.md (ESTRATEGIA_FROZEN / EJECUCION_BLOQUEADA)*
*Documento anterior: 19_PLAN_DEL_DIA_REPO_CLEANUP_FASE_0B_TRACKEADOS.md*
*Commit base: dc10ec8*
*Archivos D a clasificar: 39*
*Clasificacion actual: A=7, B=15, C=27, D=39, DATA_LOCAL=4*
*Objetivo: reducir D a minimo antes de ejecutar Fase 1*
*Frase rectora: Primero clasificamos los D. Despues disenamos la limpieza.*
