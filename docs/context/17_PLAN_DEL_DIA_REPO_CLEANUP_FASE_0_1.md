# 17_PLAN_DEL_DIA_REPO_CLEANUP_FASE_0_1

Proyecto: IronSync A
Fecha: 2026-05-04
Estado: PLAN_DEL_DIA / EJECUCION_BLOQUEADA
Documento base: docs/context/16_REPO_CLEANUP_PLAN.md
Decision previa: 16_REPO_CLEANUP_PLAN.md queda ESTRATEGIA_FROZEN / EJECUCION_BLOQUEADA
Aprobacion: Guillermo — GO condicionado a la creacion de este archivo
Ejecutor autorizado: MiMo V2
Consolidador: ChatGPT
Alcance: Fase 0 / Fase 1 — preparacion y propuesta, sin ejecucion de limpieza

---

## 1. Objetivo del dia

Preparar el marco operativo para iniciar la limpieza controlada del repositorio IronSync A, limitado a:

- Fase 0 — Preparacion / diagnostico.
- Fase 1 — propuesta de basura segura.
- Validacion de rollback.
- Validacion de prueba minima.
- Identificacion explicita de archivos candidatos.
- Definicion de STOP tecnico.

Este documento NO autoriza ejecucion de limpieza.

---

## 2. Estado inicial confirmado

Estado reportado por MiMo V2 en sesion 2026-05-04:

| Punto | Valor |
|---|---|
| Branch | main |
| Up to date con origin | Si |
| Archivos staged | 0 |
| Archivos modified sin staged | 0 |
| Untracked conocidos | 40 |
| Ultimo commit estable | e8582df |
| Ultimo documento creado antes de este plan | 16_REPO_CLEANUP_PLAN.md |

Los 40 archivos untracked son conocidos y estan asociados a deuda ya documentada en:

- BUG-003 — scripts temporales fix_*.js en raiz.
- BUG-004 — raiz repo desordenada.
- BUG-005 — versiones duales webhook/backups.
- 16_REPO_CLEANUP_PLAN.md.

---

## 3. Estado de 16_REPO_CLEANUP_PLAN.md

docs/context/16_REPO_CLEANUP_PLAN.md queda declarado como:

ESTRATEGIA_FROZEN / EJECUCION_BLOQUEADA

Interpretacion oficial:

- Si autoriza planificar.
- No autoriza ejecutar.
- No autoriza borrar.
- No autoriza mover.
- No autoriza git rm.
- No autoriza git add ..
- No autoriza tocar codigo productivo.
- No autoriza tocar DATA_LOCAL.

---

## 4. Alcance permitido de este Plan del Dia

Este documento permite unicamente:

1. Confirmar estado del repo.
2. Identificar archivos candidatos a limpieza.
3. Clasificar archivos por riesgo.
4. Proponer Fase 0.
5. Proponer Fase 1.
6. Definir rollback.
7. Definir prueba minima.
8. Definir STOP tecnico.
9. Preparar una votacion futura de ejecucion.

Este documento NO permite:

1. Ejecutar limpieza.
2. Borrar archivos.
3. Mover archivos.
4. Archivar archivos.
5. Ejecutar git rm.
6. Ejecutar git add ..
7. Tocar DATA_LOCAL.
8. Tocar codigo productivo.
9. Hacer deploy.

---

## 5. Fase 0 — Preparacion

La Fase 0 debera ejecutarse en una aprobacion futura separada.

Actividades permitidas en Fase 0, cuando sea aprobada:

1. Confirmar repo limpio/controlado:
   git status
2. Confirmar ultimo commit:
   git log --oneline -5
3. Crear punto de rollback:
   git rev-parse HEAD
4. Opcionalmente crear rama de respaldo:
   git branch backup/pre-cleanup-2026-05-04
5. Listar archivos untracked exactos:
   git status --short
6. Clasificar cada archivo como:
   A — produccion / conservar
   B — historico / archivar
   C — candidato a eliminar
   D — investigar antes de decidir
7. Preparar lista explicita de archivos candidatos C para Fase 1.

Fase 0 no debe modificar el repo salvo que Guillermo apruebe explicitamente crear documentacion adicional.

---

## 6. Fase 1 — Basura segura

La Fase 1 queda bloqueada hasta una votacion futura separada.

Para que Fase 1 pueda ejecutarse, se requiere:

1. Lista exacta de archivos C — candidatos a eliminar.
2. Clasificacion A/B/C/D.
3. Confirmacion de que ningun archivo toca zona prohibida.
4. Rollback explicito.
5. Prueba minima antes y despues.
6. Voto GO del equipo.
7. Aprobacion final de Guillermo.
8. Ejecucion exclusiva por MiMo V2.

Regla:

Si hay duda, el archivo NO entra a Fase 1.
Se reclasifica como D — INVESTIGAR.

Reglas derivadas de clasificacion:

- A nunca se borra.
- B se archiva, no se elimina.
- C solo puede eliminarse con lista exacta, rollback, prueba minima, voto GO y aprobacion Guillermo.
- D nunca se borra en Fase 1; se investiga.

---

## 7. Lista negra — Prohibido tocar

Queda prohibido tocar, mover, borrar o modificar:

- DATA_LOCAL/
- turnos.js
- webhook.js
- .env
- JSONs operativos
- Supabase
- Twilio Verify
- IS Finanzas
- Gemelo Digital
- rutas PDF productivas
- manuales tecnicos
- PDFs tecnicos
- datasets
- indices de grounding
- referencias M-772
- archivos vinculados a evidencia historica
- archivos vinculados a firmas digitales
- archivos vinculados a auditoria

Regla especial:

DATA_LOCAL permanece BLOQUEADO hasta cierre formal de BUG-002.

---

## 8. Regla de grounding / documentacion tecnica

Todo archivo que pueda funcionar como fuente de verdad, evidencia, manual tecnico, dataset, grounding o indice documental queda clasificado automaticamente como:

D — INVESTIGAR

No puede entrar en Fase 1.

Esto incluye, pero no se limita a:

- manuales tecnicos PDF;
- documentacion tecnica de maquinaria;
- documentos de grounding;
- indices;
- datasets;
- referencias M-772 o similares;
- documentacion vinculada a Gemelo Digital;
- evidencia historica de debugging;
- archivos vinculados a auditoria futura.

---

## 9. Reglas de git

Queda prohibido:

- git add .
- git rm
- git rm -r
- git clean
- git clean -fd
- git clean -xfd

Toda operacion futura debe ser especifica por archivo.

Regla de commits futuros:

- Maximo recomendado: 10-15 archivos por commit/fase.
- No mezclar categorias.
- No mezclar limpieza con codigo.
- No mezclar documentacion con eliminacion fisica.

Tipos de commit sugeridos para fases futuras:

- docs: freeze cleanup day plan
- chore: archive terminal artifacts
- chore: remove confirmed temporary scripts
- docs: update cleanup changelog

---

## 10. Rollback requerido

Antes de cualquier ejecucion futura debe existir rollback explicito.

Rollback base actual:

- commit_base: e8582df

Comando para confirmar commit:

- git rev-parse HEAD

Opcion de rama de respaldo:

- git branch backup/pre-cleanup-2026-05-04

Opcion de reversion dura si algo sale mal:

- git reset --hard e8582df

Nota:

git reset --hard solo debe usarse bajo STOP tecnico y con aprobacion explicita, porque puede descartar cambios locales.

---

## 11. Prueba minima antes/despues

Antes de cualquier ejecucion futura:

- git status
- node --check webhook.js

Si aplica:

- node webhook.js

Validacion funcional minima sugerida:

- INICIO/FIN simulado o staging funcional.

Despues de cualquier ejecucion futura:

- git status
- node --check webhook.js

Y, si aplica:

- INICIO/FIN simulado o staging funcional.

Criterio de exito:

- Sin errores nuevos.
- Sin archivos productivos modificados.
- Sin cambios en DATA_LOCAL.
- Sin cambios en turnos.js.
- Sin cambios en webhook.js.
- Sin cambios en JSONs operativos.
- Repo controlado.
- Commit documental o de limpieza especifico.

---

## 12. STOP tecnico

Debe detenerse toda ejecucion si ocurre cualquiera de estos casos:

1. Aparece archivo no listado.
2. Un archivo candidato tiene dependencia oculta.
3. Una prueba minima falla.
4. node --check webhook.js falla.
5. git status muestra cambios inesperados.
6. Se involucra DATA_LOCAL.
7. Se involucra turnos.js.
8. Se involucra webhook.js.
9. Se involucra Supabase.
10. Se involucra .env.
11. Se detecta ambiguedad sobre si un archivo es evidencia.
12. El numero de archivos candidatos excede el limite aprobado.
13. Alguien propone usar git add ., git rm masivo o git clean.

Accion bajo STOP tecnico:

1. No continuar.
2. Reportar hallazgo.
3. No improvisar fix.
4. Volver a votacion.
5. Aplicar rollback solo si Guillermo lo autoriza.

---

## 13. Clasificacion A/B/C/D

Toda propuesta de archivo debe clasificarse asi, consistente con 16_REPO_CLEANUP_PLAN.md:

### A — Produccion / conservar

Archivos esenciales para que IronSync funcione.

Regla:

A nunca se borra.

Ejemplos:

- turnos.js
- webhook.js
- package.json
- package-lock.json
- .gitignore
- carpetas core como api/, lib/, routes/, services/, db/, jobs/

### B — Historico / archivar

Archivos que no pertenecen a raiz pero pueden tener valor historico, auditoria, respaldo o trazabilidad.

Regla:

B se archiva, no se elimina.

Ejemplos:

- backups antiguos
- evidencia de debugging
- versiones previas utiles
- capturas operativas
- logs relevantes
- dumps historicos

### C — Candidato a eliminar

Archivos claramente temporales, sin dependencia, sin valor documental y sin relacion con produccion.

Regla:

C solo puede eliminarse con lista exacta, rollback, prueba minima, voto GO y aprobacion Guillermo.

Ejemplos:

- artefactos terminales accidentales
- scripts temporales confirmados
- archivos generados por error
- copias claramente inutiles
- PDFs de prueba sin referencia

### D — Investigar antes de decidir

Archivos dudosos, potencialmente vinculados a operacion, evidencia, grounding, auditoria o documentacion tecnica.

Regla:

D nunca se borra en Fase 1.

Ejemplos:

- archivos 0 bytes que podrian estar referenciados
- scripts de prueba
- archivos con proposito ambiguo
- manuales tecnicos
- datasets
- indices de grounding

---

## 14. Riesgos vivos

### R-016 — Falsa sensacion de estabilidad

La limpieza del repo no resuelve BUG-002.

Mitigacion:

Recordar en cada cierre:
limpieza no es estabilidad arquitectonica.

### R-017 — Ejecucion prematura

Alguien puede interpretar FROZEN como permiso para ejecutar.

Mitigacion:

Etiqueta obligatoria:
ESTRATEGIA_FROZEN / EJECUCION_BLOQUEADA.

### R-018 — git rm masivo

Eliminar demasiados archivos en un commit reduce trazabilidad.

Mitigacion:

Maximo 10-15 archivos por commit/fase.

### R-019 — Perdida de evidencia

Eliminar archivos historicos puede afectar debugging futuro.

Mitigacion:

Si hay duda, archivar o investigar.
No borrar.

### R-020 — Validacion insuficiente

Limpiar sin probar puede ocultar dano.

Mitigacion:

Prueba minima obligatoria antes/despues.

---

## 15. Relacion con BUG-002

BUG-002 — Persistencia dual JSON + Supabase sigue siendo el riesgo critico principal.

Este Plan del Dia:

- NO cierra BUG-002.
- NO estabiliza arquitectura.
- NO convierte Supabase automaticamente en fuente unica.
- NO autoriza tocar DATA_LOCAL.

La prioridad tecnica general sigue siendo:

1. BUG-002 — Persistencia unica Supabase
2. Staging funcional minimo
3. Limpieza controlada Fases 0-3
4. Fase 4 DATA_LOCAL solo despues de cerrar BUG-002

---

## 16. Entregable de Fase 0 futura

Cuando se autorice Fase 0, MiMo V2 debera entregar:

1. git status inicial.
2. git log --oneline -5.
3. commit_base confirmado.
4. listado exacto de los 40 untracked.
5. clasificacion preliminar A/B/C/D.
6. archivos excluidos automaticamente.
7. candidatos potenciales a Fase 1 (solo C — candidatos a eliminar).
8. riesgos detectados.
9. recomendacion GO/NO-GO para preparar Fase 1.

---

## 17. Entregable de Fase 1 futura

Cuando se autorice Fase 1, MiMo V2 debera entregar antes de ejecutar:

1. Lista exacta de archivos C — candidatos a eliminar.
2. Razon por archivo.
3. Confirmacion de no dependencia.
4. Confirmacion de no zona prohibida.
5. Rollback point.
6. Prueba minima pre-ejecucion.
7. Comandos exactos.
8. Prueba minima post-ejecucion.
9. Commit propuesto.

---

## 18. Siguiente decision requerida

Despues de crear este documento, la siguiente decision NO es limpiar.

La siguiente decision es:

GO / NO-GO para ejecutar Fase 0 — diagnostico controlado.

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

## 19. Cierre esperado de esta accion documental

Esta accion documental debe cerrar con:

- git status
- git log --oneline -5

Resultado esperado:

- Un nuevo archivo: docs/context/17_PLAN_DEL_DIA_REPO_CLEANUP_FASE_0_1.md
- Actualizacion de 13_CHANGELOG.md si aplica
- Actualizacion de 01_ESTADO_ACTUAL.yaml si aplica
- Commit documental individual
- Cero ejecucion de limpieza
- Cero cambios en codigo productivo
- Cero cambios en DATA_LOCAL

---

## 20. Veredicto

17_PLAN_DEL_DIA_REPO_CLEANUP_FASE_0_1.md queda como:

PLAN_DEL_DIA / EJECUCION_BLOQUEADA

Autoriza preparar votacion futura de Fase 0.
No autoriza ejecutar Fase 0.
No autoriza ejecutar Fase 1.
No autoriza limpieza.

---

## 21. Frase rectora

La limpieza empieza como diseno, no como borrado.

---

*Nota final: Este documento NO autoriza limpieza, codigo, fixes, deploy, mover archivos, borrar archivos ni tocar DATA_LOCAL.*

*17_PLAN_DEL_DIA_REPO_CLEANUP_FASE_0_1 — IronSync A*
*Fecha: 2026-05-04*
*Estado: PLAN_DEL_DIA / EJECUCION_BLOQUEADA*
*Documento base: 16_REPO_CLEANUP_PLAN.md (ESTRATEGIA_FROZEN / EJECUCION_BLOQUEADA)*
*Commit base: e8582df*
*Prioridad tecnica: #1 BUG-002 > #2 Staging > #3 Limpieza Fases 0-3 > #4 Fase 4 DATA_LOCAL*
*Clasificacion consistente con 16: A=Produccion, B=Historico, C=CandidatoEliminar, D=Investigar*
*Frase rectora: La limpieza empieza como diseno, no como borrado.*
