# DOCUMENTO 24 — RIGOR OPERATIVO IRONSYNC v0.1

**Fecha:** 2026-05-05
**Estado:** DRAFT / PARA REVISION DEL EQUIPO
**Autor:** Guillermo (direccion) + MiMo V2 (redaccion)
**Clasificacion:** DOC
**Version:** 0.1

---

## 1. Frase rectora

> "Disenamos con libertad. Implementamos con rigor. Cerramos con evidencia."

Este documento define como IRONSYNC implementa, valida y cierra cada cambio en el sistema.

---

## 2. Proposito

Establecer reglas operativas que previenen contaminacion arquitectonica, deuda tecnica silenciosa y falsa estabilidad.

Este documento es la referencia obligatoria antes de:
- escribir codigo;
- crear un fix;
- agregar una feature;
- hacer commit;
- hacer deploy.

---

## 3. Clasificacion al nacer

Cada cambio se clasifica ANTES de escribir la primera linea de codigo.

| Tipo | Pregunta | Destino | Ejemplo |
|------|----------|---------|---------|
| FIX-T | ¿Workaround urgente y temporal? | Archivo con prefijo fix_TEMP_, comentario // REMOVE-WHEN, fecha de revision | fix_TEMP_paro_timeout.js |
| FIX-P | ¿Solucion arquitectonicamente limpia? | Merge a produccion con tests | Cambio directo en turnos.js |
| FIX-D | ¿Funciona pero deja patron riesgoso? | Registrar en Doc 25 DEBT_REGISTRY | Script que lee/escribe JSON directo |
| FEAT | ¿Funcionalidad nueva? | Branch propio, PR, review, War Room | Nuevo endpoint |
| DOC | ¿Solo cambia docs? | docs/context/ | CHANGELOG, planes |
| HOTFIX | ¿Emergencia en produccion? | Protocolo HOTFIX (seccion 12) | Fix critico en campo |

**Regla:** Si no puedes clasificarlo en 30 segundos, no lo escribas todavia. Necesitas pensar primero.

---

## 4. Las 3 Puertas

### Puerta 1 — Definicion y alcance (ANTES, 2 minutos)

1. ¿Que categoria es? (FIX-T / FIX-P / FIX-D / FEAT / DOC / HOTFIX)
2. ¿Toca archivos A (produccion) o DATA_LOCAL?
   - Si SI: STOP. Requiere Plan del Dia y aprobacion.
3. ¿Es reversible en 1 commit?
   - Si NO: redisena la solucion.
4. ¿Tiene relacion con BUG-002 o F-02?
   - Si SI: STOP. Requiere revision de Doc 25 DEBT_REGISTRY.

**Salida obligatoria:** Clasificacion documentada en commit message o CHANGELOG.

### Puerta 2 — Impacto y deuda tecnica (DURANTE)

1. Solo toca los archivos declarados en Puerta 1.
2. Si es FIX-T, incluye // REMOVE-WHEN y fecha de revision.
3. No mezclar fix con feature en el mismo commit.
4. ¿Genera deuda tecnica?
   - Si SI: registrar en Doc 25 DEBT_REGISTRY antes de commit.
5. ¿Afecta a algun feature de IS Logbook v1.0?
   - Si SI: verificar que no rompe dependencias F-01 a F-11.

### Puerta 3 — Evidencia y cierre (DESPUES, 30 segundos)

1. ¿El cambio resuelve el problema planteado?
2. ¿node --check pasa? (si aplica)
3. ¿git status muestra solo lo esperado?
4. ¿Se actualizo CHANGELOG?
5. ¿Se registro deuda en DEBT_REGISTRY si aplica?
6. ¿El commit es atomico y descriptivo?

**Si algo falla en Puerta 3:** Volver a Puerta 1.

---

## 5. Raiz sagrada

La raiz del repo es espacio de produccion. No es basurero.

### Reglas de raiz

| Regla | Descripcion |
|-------|-------------|
| No scripts temporales | Ningun archivo fix_TEMP_*.js puede permanecer en raiz mas de 48 horas |
| No archivos sin clasificar | Todo archivo .js en raiz debe ser A (produccion) o B (historico) |
| No artifacts de terminal | Capturas de pantalla, logs exportados, outputs de comandos no van en raiz |
| No datos de prueba | JSON de prueba, CSV de prueba no van en raiz |
| No backups manuales | Los backups van en docs/archive/ o no van |

### Scan semanal de raiz

| Smell | Senal | Accion |
|-------|-------|--------|
| S1 | Archivo fix_*.js en raiz | Clasificar y aislar en 48h |
| S2 | Archivo sin clasificar en raiz | Clasificar inmediatamente |
| S3 | Commit mezclado (fix+feature+docs) | Dividir en commits atomicos |
| S4 | fix_TEMP_ sin // REMOVE-WHEN | Agregar fecha de revision |
| S5 | DATA_LOCAL modificado sin BUG-002 resuelto | STOP, investigar |

---

## 6. Prohibiciones absolutas

| Prohibido | Razon |
|-----------|-------|
| git add . | Solo archivos especificos |
| git rm sin autorizacion | Requiere aprobacion |
| git clean sin autorizacion | Requiere aprobacion |
| Scripts temporales en raiz | Van en docs/archive/ |
| Cleanup sin autorizacion | Requiere Plan del Dia |
| Commit mezclado | Un commit por cambio clasificado |
| Deploy sin War Room | Requiere GO/NO-GO |
| Codigo sin clasificacion | Pasar Puerta 1 primero |

---

## 7. Plan del Dia obligatorio

Antes de escribir codigo para cualquier feature o fix significativo, debe existir un Plan del Dia que contenga:

| Campo | Obligatorio |
|-------|-------------|
| Fecha | SI |
| Objetivo | SI |
| Alcance | SI |
| Archivos a modificar | SI |
| Archivos que NO se tocan | SI |
| Clasificacion del cambio | SI |
| Riesgos identificados | SI |
| Pruebas a ejecutar | SI |
| Rollback plan | SI |
| Criterio de exito | SI |
| STOP tecnico | SI |

**Sin Plan del Dia no se escribe codigo.**

---

## 8. War Room GO/NO-GO

Cada feature de IS Logbook v1.0 requiere un War Room antes de ejecucion.

### Flujo del War Room

1. MiMo V2 presenta propuesta tecnica.
2. Equipo itera propuesta.
3. Se detectan bugs probables y riesgos.
4. Se consulta Doc 25 DEBT_REGISTRY.
5. Se consulta Doc 26 DeepSeek Guardian.
6. Votacion GO/NO-GO.
7. Solo con GO se ejecuta la feature.

### Participantes del War Room

| Rol | Agente | Funcion |
|-----|--------|---------|
| Director | Guillermo | Decision final |
| Ejecutor | MiMo V2 | Propuesta tecnica |
| Consolidador | ChatGPT | Sintesis |
| Auditor tecnico | Claude | Edge cases |
| Analista riesgos | DeepSeek | Profundidad |
| Guardian | DeepSeek (Doc 26) | Contramedidas |
| Perspectiva | Grok | Cuestionamiento |
| Integracion | Gemini | Conectividad |
| Auditor arquitectonico | Qwen | Riesgos sistemicos |

---

## 9. Comunicacion anti-falsa-estabilidad

Cada logro tecnico debe acompanarse de:

### Formato obligatorio

Este logro RESUELVE:
- [lo que si resuelve]

Este logro NO RESUELVE:
- [lo que queda pendiente]

Riesgo principal pendiente:
- [el riesgo #1 que sigue abierto]

### Ejemplo

Este logro RESUELVE:
- Organizacion de raiz del repo.
- Trazabilidad de archivos candidatos.
- Rollback documentado.

Este logro NO RESUELVE:
- BUG-002 (persistencia dual JSON + Supabase).
- Estabilidad arquitectonica.
- Deuda tecnica acumulada.

Riesgo principal pendiente:
- BUG-002 sigue siendo el riesgo #1 del sistema.

---

## 10. HOTFIX controlado

Si la operacion en campo se detiene y necesitas actuar YA:

### Protocolo

1. Aplica el fix minimo viable (solo lo indispensable para reanudar operacion).
2. Inmediatamente despues crea docs/context/emergency_fix_YYYYMMDD.md con:
   - Hora del fix.
   - Archivos tocados.
   - Que se hizo.
   - Por que se hizo.
   - Que falta para cerrar correctamente.
3. Bloquea siguiente feature hasta que este fix sea revisado.
4. Registrar en Doc 25 DEBT_REGISTRY.

**Regla:** Nunca uses "emergencia" como excusa para saltar la trazabilidad. La prisa justifica la simplicidad, no la opacidad.

---

## 11. Relacion con Doc 25 DEBT_REGISTRY

| Situacion | Accion |
|-----------|--------|
| Se crea FIX-T | Registrar en DEBT_REGISTRY con fecha de revision |
| Se crea FIX-D | Registrar en DEBT_REGISTRY con patron riesgoso |
| Item llega a fecha de revision sin resolver | Se convierte en issue prioritaria |
| DEBT_REGISTRY tiene blocker no mitigado | No se ejecuta feature dependiente |

---

## 12. Relacion con Doc 26 DeepSeek Guardian

| Situacion | Accion |
|-----------|--------|
| Antes de War Room | Consultar Guardian para contramedidas |
| Guardian vota NO-GO | No se ejecuta sin resolver objecion |
| Guardian detecta deuda blocker | Se consulta DEBT_REGISTRY |
| Guardian requiere pruebas adicionales | Se agregan al Plan del Dia |

---

## 13. Reglas de bloqueo

| Condicion | Bloquea |
|-----------|---------|
| F-02 abierto (sin opcion pragmatica aprobada) | Implementacion de F-04 a F-09 |
| DATA_LOCAL bloqueado | Cualquier cambio en bitacora.json, eventos.json, reporte_turno.json, turnos_activos.json |
| Fase 2 Repo Cleanup bloqueada | Cualquier accion de cleanup |
| Produccion intocable sin Plan del Dia | Cualquier cambio en archivos A |
| DEBT_REGISTRY tiene blocker sin mitigar | Feature dependiente |
| War Room NO-GO | Feature rechazada |
| DeepSeek Guardian NO-GO | Feature bloqueada hasta resolver objecion |

---

## 14. Ciclo de salud arquitectonica

| Frecuencia | Actividad | Responsable | Tiempo |
|------------|-----------|-------------|--------|
| Cada commit | Clasificar + 3 Puertas | Quien escribe | 3 min |
| Semanal | Scan de smells S1-S5 | MiMo V2 | 5 min |
| Quincenal | Revisar DEBT_REGISTRY | Guillermo | 15 min |
| Mensual | Auditoria arquitectonica | Qwen o Claude | 30 min |
| Por release | Verificar que ningun A fue tocado | Equipo | 20 min |

---

## 15. Criterios para pasar Doc 24 a FROZEN

| # | Criterio | Estado |
|---|----------|--------|
| 1 | Equipo revisa DRAFT | PENDIENTE |
| 2 | Votacion GO/NO-GO | PENDIENTE |
| 3 | 6 pilares validados | PENDIENTE |
| 4 | 3 Puertas probadas en al menos 1 commit | PENDIENTE |
| 5 | Scan de smells ejecutado al menos 1 vez | PENDIENTE |
| 6 | DEBT_REGISTRY (Doc 25) creado y poblado | PENDIENTE |
| 7 | DeepSeek Guardian (Doc 26) creado | PENDIENTE |
| 8 | Sin objeciones mayores del equipo | PENDIENTE |

---

## 16. Estado del documento

| Campo | Valor |
|-------|-------|
| Estado | DRAFT |
| Version | 0.1 |
| Fecha | 2026-05-05 |
| Siguiente paso | Revision del equipo |
| FROZEN autoriza | Solo metodologia aprobada. NO autoriza codigo directamente. |

---

*"Disenamos con libertad. Implementamos con rigor. Cerramos con evidencia."*
