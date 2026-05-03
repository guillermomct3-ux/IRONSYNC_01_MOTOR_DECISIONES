# IRONSYNC A — DEV PIPELINE v1.0

## Metadata

| Campo | Valor |
|---|---|
| Documento | 11_DEV_PIPELINE.md |
| Fecha | 2026-05-03 |
| Estado | BORRADOR — pendiente revision final |
| Repo | IRONSYNC_01_MOTOR_DECISIONES |
| Commit documental base | b9f1a8c |
| Basado en | 05_MASTER_BASELINE.md + 08_BUG_TRACKER.yaml + 09_RISK_REGISTER.yaml |
| Autoria | Guillermo + Equipo IronSync |
| Proposito | Definir el flujo obligatorio para volver a ejecutar cambios tecnicos sin romper metodologia |

---

## 1. Proposito

Este documento define el pipeline oficial de desarrollo de IronSync A.

Su funcion es establecer como se vuelve a tocar codigo despues de haber creado:

- 05_MASTER_BASELINE.md
- 08_BUG_TRACKER.yaml
- 09_RISK_REGISTER.yaml

El Dev Pipeline existe para evitar que el equipo regrese a ejecucion reactiva.

Frase rectora:

El Bug Tracker dice que esta roto.
El Risk Register dice que puede rompernos.
El Dev Pipeline dice como volvemos a tocar codigo sin romper el proyecto.

---

## 2. Alcance

Este pipeline aplica a cualquier cambio tecnico que toque:

- codigo;
- configuracion;
- base de datos;
- Railway;
- Twilio;
- Supabase;
- rutas;
- webhooks;
- PDF;
- persistencia;
- limpieza de repo;
- scripts;
- estructura de carpetas.

Este documento NO autoriza ejecutar ningun cambio por si mismo.

Todo cambio tecnico necesita:

- Plan del Dia.
- ID de bug o riesgo asociado.
- aprobacion de Guillermo.
- ejecucion controlada.
- prueba minima.
- cierre documental.

---

## 3. Estado Ready to Execute

Una tarea tecnica solo puede pasar a estado READY_TO_EXECUTE si cumple todos estos puntos:

1. Existe un bug_id en 08_BUG_TRACKER.yaml o un risk_id en 09_RISK_REGISTER.yaml.
2. Hay Plan del Dia aprobado por Guillermo.
3. El alcance esta limitado a un objetivo unico.
4. Se identificaron archivos permitidos.
5. Se identificaron archivos prohibidos.
6. Se definio prueba minima.
7. Se definio rollback o respaldo.
8. MiMo V2 recibio contenido exacto o instrucciones quirurgicas.
9. git status fue revisado antes de tocar nada.
10. No hay desacuerdo mayor del Red Team.

Si falta cualquiera de estos puntos:

NO READY TO EXECUTE

---

## 4. Plan del Dia obligatorio

Todo trabajo tecnico inicia con Plan del Dia.

El Plan del Dia debe incluir:

- Fecha:
- Objetivo:
- Bug/Riesgo asociado:
- Archivo(s) permitido(s):
- Archivo(s) prohibido(s):
- Tipo de cambio:
- Prueba minima:
- Rollback:
- Criterio de exito:
- Criterio de STOP:
- Ejecutor:
- Aprobador:

Sin Plan del Dia aprobado, MiMo V2 no ejecuta.

Regla FROZEN:

El Plan del Dia es el unico disparador valido para autorizar comandos.

---

## 5. Flujo Bug Tracker -> Fix

Todo fix debe nacer de un bug registrado.

Regla:

Un bug.
Una causa.
Un fix.
Una prueba.
Un estado.

Flujo:

1. Seleccionar bug en 08_BUG_TRACKER.yaml.
2. Confirmar estado ABIERTO.
3. Confirmar causa raiz.
4. Definir fix propuesto.
5. Definir prueba minima.
6. Revisar riesgos asociados.
7. Aprobar Plan del Dia.
8. Ejecutar cambio.
9. Probar.
10. Actualizar estado del bug.

Estados permitidos:

- ABIERTO
- EN_PROGRESO
- BLOQUEADO
- CERRADO
- DESCARTADO

Un bug solo puede pasar a CERRADO si tiene:

- commit de fix;
- prueba minima documentada;
- validacion de Guillermo;
- actualizacion en 08_BUG_TRACKER.yaml.

---

## 6. Flujo Risk Register -> Diseno

Un riesgo no siempre genera un fix inmediato.

Si el trabajo nace de 09_RISK_REGISTER.yaml, primero debe definirse si el riesgo requiere:

- documento de diseno;
- auditoria;
- mitigacion sin codigo;
- fix tecnico;
- aceptacion temporal del riesgo.

Riesgos criticos como R-PERSISTENCIA-DUAL no se corrigen directamente con codigo.

Primero requieren:

Diseno -> aprobacion -> Plan del Dia -> ejecucion tecnica

---

## 7. Flujo de aprobacion del equipo

### Tipos de cambio:

### Tipo A — Documental

Ejemplos:

- contexto;
- changelog;
- bug tracker;
- risk register;
- baseline.

Requiere:

- ChatGPT + Guillermo

MiMo V2 ejecuta si Guillermo aprueba.

### Tipo B — Fix tecnico menor

Ejemplos:

- bug aislado;
- un archivo;
- prueba clara.

Requiere:

- Plan del Dia
- ChatGPT
- MiMo V2
- Guillermo
- al menos 1 auditor adicional si toca produccion

### Tipo C — Cambio critico

Ejemplos:

- persistencia;
- webhook;
- Railway;
- Supabase;
- PDF automatico;
- turnos.js;
- limpieza repo;
- migraciones.

Requiere:

- Plan del Dia
- Red Team
- Guillermo
- prueba minima
- rollback
- STOP criteria

Si 2 AIs votan NO-GO, se disena el diseno.

---

## 8. Roles

### Guillermo

Rol:

- dueno del producto;
- aprobador final;
- veto absoluto;
- decide si se ejecuta, se itera o se detiene.

Guillermo no debe cargar con la memoria del proyecto. La memoria vive en GitHub.

### MiMo V2

Rol:

- unico escritor/ejecutor operativo cuando Guillermo autoriza;
- crea archivos;
- guia comandos;
- ejecuta commits/push bajo aprobacion;
- no decide alcance.

MiMo V2 no ejecuta si no existe Plan del Dia o paquete pegado.

### ChatGPT

Rol:

- lider de consolidacion;
- prepara paquetes para MiMo;
- audita coherencia;
- detecta contradicciones;
- mantiene alineacion entre documentos.

ChatGPT no debe saltar a codigo sin Plan del Dia.

### Claude

Rol:

- revision estrategica;
- consolidacion de gobernanza;
- seguridad metodologica;
- revision de contradicciones.

### DeepSeek

Rol:

- auditoria tecnica;
- edge cases;
- validacion de riesgos;
- criterios de prueba.

### Grok

Rol:

- operacion real;
- Railway;
- Twilio;
- Supabase;
- riesgo de infraestructura y produccion.

### Gemini

Rol:

- UX;
- grounding;
- consistencia del flujo;
- revision de ambiguedad operativa.

### GLM5

Rol:

- gobernanza documental;
- estructura;
- consistencia formal;
- deteccion de huecos.

---

## 9. Reglas de Git

Reglas obligatorias:

- NO git add .
- NO git push --force
- NO commits mezclados
- NO agregar fix_*.js sin autorizacion
- NO mover archivos sin fase aprobada
- NO borrar archivos sin fase aprobada

Regla de staging:

git add archivo_especifico

Ejemplos validos:

- git add docs/context/11_DEV_PIPELINE.md
- git add turnos.js
- git add webhook.js

Ejemplo prohibido:

- git add .

Antes de commit debe revisarse:

- git status

El commit solo procede si el status muestra unicamente los archivos autorizados.

---

## 10. Reglas de commit y push

Formato de commit:

- docs: [titulo]
- fix: [BUG-XXX] [titulo] - cerrado
- refactor: [titulo] - aprobado [votos]
- chore: [titulo]

Ejemplos:

- docs: add dev pipeline v1
- fix: BUG-002 persistencia dual - fase 1

Reglas:

- No hacer commit sin revision de git status.
- No hacer push sin revision posterior al commit.
- No mezclar documentacion con codigo.
- No mezclar fix con limpieza.
- No mezclar multiples bugs en un solo commit salvo aprobacion explicita.

Flujo push:

commit -> git status -> revision -> push

---

## 11. Prueba minima obligatoria

Cada cambio debe tener prueba minima segun tipo.

| Tipo de cambio | Prueba minima |
|---|---|
| Documentacion | archivo creado, git status, revision visual |
| Backend JS | node --check archivo.js + prueba funcional minima |
| Webhook | prueba controlada de payload / Twilio |
| Supabase | consulta o dry-run documentado |
| Railway | deploy observado sin crash |
| PDF | generacion de PDF sin bloquear flujo |
| Config | validacion sin exponer secretos |
| Limpieza repo | git status, inventario antes/despues, rollback claro |

Si la prueba minima falla:

- NO COMMIT
- NO PUSH
- STOP tecnico si aplica

---

## 12. STOP tecnico y rollback

### STOP tecnico

Se activa STOP si ocurre cualquiera de estos casos:

1. Dos deploys fallidos consecutivos.
2. Prueba minima falla.
3. git status muestra archivos no autorizados.
4. Aparece cambio inesperado en turnos.js o webhook.js.
5. Se toca codigo sin Plan del Dia.
6. Se intenta git add ..
7. El mismo bug reaparece 3 veces.
8. Railway crashea por cambio reciente.
9. Supabase muestra inconsistencia de datos.
10. Dos AIs votan NO-GO en cambio critico.

### Durante STOP tecnico

Reglas:

- NO nuevos fixes.
- NO parches encima.
- NO deploy.
- NO limpieza.
- NO cambio de alcance.

Acciones permitidas:

- detener ejecucion;
- identificar ultimo cambio;
- revisar git status;
- revisar commit;
- definir rollback;
- documentar causa;
- pedir revision Red Team;
- reanudar solo con nuevo Plan del Dia.

### Rollback

Rollback debe definirse antes de ejecutar cambios tecnicos.

Puede ser:

- restaurar archivo desde backup autorizado;
- revertir commit;
- deshacer modificacion local antes de commit;
- detener deploy;
- volver al ultimo commit estable.

Ningun rollback se ejecuta sin aprobacion de Guillermo.

---

## 13. Cierre documental

Toda sesion relevante debe cerrar actualizando, segun aplique:

- 01_ESTADO_ACTUAL.yaml
- 13_CHANGELOG.md
- 08_BUG_TRACKER.yaml
- 09_RISK_REGISTER.yaml

Debe registrarse:

- que se hizo;
- que commit quedo;
- que bug cambio de estado;
- que riesgo cambio de estado;
- que sigue;
- que quedo prohibido;
- si hubo desviacion metodologica.

Una tarea no se considera cerrada hasta que:

- el cambio esta probado;
- el commit esta pusheado;
- el bug/riesgo se actualizo;
- el changelog refleja el cambio;
- el siguiente paso queda claro.

---

## 14. Ejemplo completo de flujo

Ejemplo: resolver BUG-002.

Flujo correcto:

1. Revisar 08_BUG_TRACKER.yaml.
2. Confirmar BUG-002 como ABIERTO.
3. Revisar R-PERSISTENCIA-DUAL en 09_RISK_REGISTER.yaml.
4. Crear Plan del Dia.
5. Definir alcance.
6. Definir archivos permitidos.
7. Definir archivos prohibidos.
8. Definir prueba minima.
9. Definir rollback.
10. Recibir aprobacion.
11. MiMo V2 ejecuta.
12. Se prueba.
13. Se revisa git status.
14. Se hace git add especifico.
15. Se hace commit.
16. Se revisa status.
17. Se hace push.
18. Se actualiza Bug Tracker.
19. Se actualiza Changelog.
20. Se actualiza Estado Actual.

---

## 15. Anti-patrones prohibidos

Queda prohibido:

- Codigo por ansiedad.
- Fix sin bug_id.
- Fix sin prueba.
- Fix sin rollback.
- Commit mezclado.
- git add .
- Push sin revision.
- Deploy sin prueba.
- Limpiar repo porque se ve feo.
- Mover archivos sin inventario.
- Borrar archivos sin fase aprobada.
- Abrir Finanzas en codigo antes de estabilizar Logbook.
- Abrir Gemelo Digital en codigo antes de modelo de eventos.

---

## 16. Criterio para volver a codigo

IronSync puede volver a codigo solo cuando:

1. 11_DEV_PIPELINE.md este aprobado y pusheado.
2. 01_ESTADO_ACTUAL.yaml este actualizado.
3. 13_CHANGELOG.md registre el pipeline.
4. Exista Plan del Dia.
5. El trabajo este asociado a un bug o riesgo.
6. MiMo V2 tenga instrucciones exactas.
7. Guillermo apruebe ejecucion.

---

## Voto

GO para revision final.
NO-GO para ejecucion tecnica antes de aprobar este Dev Pipeline.

## Proxima accion

Despues de aprobar y pushear este documento:

Actualizar 01_ESTADO_ACTUAL.yaml
Actualizar 13_CHANGELOG.md

Despues, el siguiente trabajo tecnico-documental recomendado es:

Disenar arquitectura de persistencia unica para BUG-002 / R-PERSISTENCIA-DUAL.

---

*Nota final: Este documento NO autoriza codigo, fixes, deploy ni limpieza.*

*Dev Pipeline v1.0 — IronSync A*
*Commit documental base: b9f1a8c*
*IS Logbook Lite / Sprint 0 funcional con deuda tecnica alta.*
