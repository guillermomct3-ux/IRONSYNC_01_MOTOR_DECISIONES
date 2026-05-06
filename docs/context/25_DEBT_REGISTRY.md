# DOCUMENTO 25 — DEBT_REGISTRY

**Fecha:** 2026-05-05
**Estado:** DRAFT / PARA REVISION DEL EQUIPO
**Autor:** Guillermo (direccion) + MiMo V2 (redaccion)
**Clasificacion:** DOC
**Version:** 0.1

---

## 1. Proposito

Registro vivo de deuda tecnica, de producto y documental del sistema IRONSYNC.

Este documento es la fuente unica de verdad sobre deuda conocida. Todo item de deuda que exista en el sistema debe estar registrado aqui.

**Regla fundamental:**
> "Si no esta en DEBT_REGISTRY, no existe como deuda conocida. Si esta y es blocker, no se ejecuta feature dependiente."

---

## 2. Estructura de cada item de deuda

| Campo | Obligatorio | Descripcion |
|-------|-------------|-------------|
| ID | SI | Identificador unico (BUG-XXX, DEBT-XXX, DOC-XXX) |
| Titulo | SI | Nombre corto y descriptivo |
| Tipo | SI | TECNICA / PRODUCTO / DOCUMENTAL / ARQUITECTONICA |
| Severidad | SI | CRITICA / ALTA / MEDIA / BAJA |
| Estado | SI | ABIERTO / MITIGADO / RESUELTO / CERRADO |
| Owner | SI | Quien es responsable de resolverlo |
| Fecha deteccion | SI | Cuando se detecto |
| Fuente | SI | Quien o que lo detecto (agente, auditoria, campo) |
| Descripcion | SI | Que es la deuda, en detalle |
| Impacto | SI | Que afecta si no se resuelve |
| Blocker | SI / NO | ¿Bloquea alguna feature o fase? |
| Features bloqueadas | SI si blocker | Lista de features afectadas |
| Mitigacion | SI si blocker | Workaround aprobado (si existe) |
| Decision requerida | SI si abierto | Que decision se necesita para avanzar |
| Evidencia de cierre | SI para cerrar | Commit, documento o prueba que demuestra resolucion |
| Fecha cierre | SI para cerrar | Cuando se cerro |

---

## 3. Deuda inicial obligatoria

### DEBT-001 / BUG-002 / R-PERSISTENCIA-DUAL

| Campo | Valor |
|-------|-------|
| ID | DEBT-001 |
| Titulo | Persistencia dual JSON + Supabase |
| Tipo | TECNICA |
| Severidad | ALTA (residual/controlada) |
| Estado | MITIGADO |
| Owner | Guillermo |
| Fecha deteccion | 2026-05-04 |
| Fuente | Equipo IRONSYNC (auditorias multiples) |
| Descripcion | El sistema actualmente opera con persistencia dual: archivos JSON locales (DATA_LOCAL) y Supabase como base de datos remota. Ambas fuentes pueden contener datos de turnos, lo que genera riesgo de inconsistencia, duplicacion y confusion sobre cual es la fuente de verdad. |
| Impacto | - No se sabe con certeza donde viven los datos de turnos. - Riesgo de datos inconsistentes entre JSON y Supabase. - Bloquea disenio de IS Logbook v1.0 si no se define fuente de verdad. - Puede generar perdida de datos o duplicacion en campo. |
| Blocker | SI |
| Features bloqueadas | F-04 (QR resuelve contra fuente de verdad), F-05 (INICIO crea turno), F-06 (Eventos se asocian a turno), F-07 (FIN cierra turno), F-08 (PDF lee datos del turno), F-09 (Consolidacion acumula turnos) |
| Mitigacion | Opcion Pragmatica aprobada por equipo (Documento 27, seccion 5): Supabase = fuente operativa para nuevos turnos IS Logbook v1.0. DATA_LOCAL = legacy / read-only / fallback bloqueado. BUG-002 no se declara cerrado, se declara bloqueado con workaround. |
| Decision requerida | Aprobar formalmente la Opcion Pragmatica como mitigacion. Crear Plan del Dia especifico para implementacion de la opcion. |
| Evidencia de cierre | PENDIENTE |
| Fecha cierre | PENDIENTE |


---

### Mitigacion aprobada — Opcion Pragmatica (2026-05-05, 7/7 votos GO)

**Decision formal:**
- Supabase = fuente operativa unica para nuevos turnos IS Logbook v1.0.
- DATA_LOCAL / JSON legacy = read-only / fallback documentado.
- Ninguna nueva feature de Logbook escribe en JSON legacy.
- No habra sincronizacion bidireccional entre JSON y Supabase.

**Desbloqueo parcial:**
- F-04 a F-09 quedan desbloqueadas UNICAMENTE para preparar Plan del Dia.
- Cada feature seguira requiriendo: revision tecnica, DeepSeek Guardian, War Room GO/NO-GO.
- Codigo sigue NO autorizado sin War Room individual por feature.

**Regla absoluta:**
- Cualquier escritura nueva a JSON legacy = STOP tecnico inmediato.

**Riesgos residuales aceptados:**
1. Desincronizacion de fallback: DATA_LOCAL puede quedar desactualizado respecto a Supabase.
2. Confusion de contexto: agentes futuros pueden confundir cual es la fuente de verdad si no leen docs/context.
3. Split-brain historico residual: datos viejos en JSON y datos nuevos en Supabase coexisten sin sincronizacion.

**Regla:** No declarar BUG-002 cerrado sin plan propio y evidencia de resolucion.

---

### DEBT-002 / DATA_LOCAL BLOQUEADO

| Campo | Valor |
|-------|-------|
| ID | DEBT-002 |
| Titulo | DATA_LOCAL bloqueado hasta resolucion de BUG-002 |
| Tipo | TECNICA |
| Severidad | ALTA |
| Estado | MITIGADO |
| Owner | Guillermo |
| Fecha deteccion | 2026-05-04 |
| Fuente | Equipo IRONSYNC (decision de gobernanza) |
| Descripcion | Los 4 archivos DATA_LOCAL (bitacora.json, eventos.json, reporte_turno.json, turnos_activos.json) estan bloqueados. No se pueden modificar hasta que BUG-002 se resuelva o se apruebe formalmente la mitigacion. |
| Impacto | - No se puede modificar DATA_LOCAL. - Cualquier cambio requiere autorizacion explicita. - Si IS Logbook v1.0 necesita escribir en DATA_LOCAL, debe resolverse primero. |
| Blocker | SI |
| Features bloqueadas | Cualquier feature que necesite leer/escribir en DATA_LOCAL directamente. |
| Mitigacion | Opcion Pragmatica: IS Logbook v1.0 escribe en Supabase, no en DATA_LOCAL. DATA_LOCAL queda como read-only. |
| Decision requerida | Confirmar que Opcion Pragmatica permite avanzar sin tocar DATA_LOCAL. |
| Evidencia de cierre | PENDIENTE |
| Fecha cierre | PENDIENTE |

---

## 4. Reglas del DEBT_REGISTRY

| Regla | Descripcion |
|-------|-------------|
| No cerrar sin evidencia | Un item solo se cierra con commit, documento o prueba que demuestre resolucion |
| No ignorar deuda critica | Items CRITICOS deben tener owner, fecha de revision y mitigacion |
| No abrir codigo con blocker sin mitigar | Si hay deuda blocker sin mitigacion aprobada, la feature dependiente no se ejecuta |
| Registrar al crear | Todo FIX-T o FIX-D se registra al momento de creacion |
| Revision quincenal | Guillermo revisa DEBT_REGISTRY cada 15 dias |
| Fecha de revision obligatoria | Todo FIX-T debe tener fecha de revision (maximo 30 dias) |
| Lo temporal no es permanente | Si un item llega a su fecha sin resolver, se convierte en issue prioritaria |

---

## 5. Tabla de deuda activa

| ID | Titulo | Severidad | Estado | Blocker | Owner | Fecha revision |
|----|--------|-----------|--------|--------|-------|----------------|
| DEBT-001 | Persistencia dual JSON + Supabase (BUG-002) | ALTA | MITIGADO | SI | Guillermo | PENDIENTE |
| DEBT-002 | DATA_LOCAL bloqueado | ALTA | ABIERTO | SI | Guillermo | PENDIENTE |

---

## 6. Tabla de deuda resuelta

| ID | Titulo | Resuelto por | Fecha | Commit | Evidencia |
|----|--------|-------------|-------|--------|-----------|
| (vacio) | — | — | — | — | — |



---

### DEBT-003 / F-12 — Migracion one-time turnos activos legacy

| Campo | Valor |
|-------|-------|
| ID | DEBT-003 |
| Titulo | Migracion one-time de turnos activos legacy a Supabase |
| Tipo | TECNICA |
| Severidad | MEDIA |
| Estado | PENDIENTE DE ANALISIS |
| Owner | Guillermo |
| Fecha deteccion | 2026-05-05 |
| Fuente | Equipo IRONSYNC (votacion Opcion Pragmatica) |
| Descripcion | Los turnos activos que existen en DATA_LOCAL (turnos_activos.json) necesitan migrarse a Supabase como parte del cierre definitivo de BUG-002. Esta migracion es one-time y solo aplica a turnos activos pendientes al momento de la transicion. |
| Impacto | Sin migracion, turnos activos legacy quedarian fuera de Supabase. No bloquea features nuevas pero si cierre definitivo de BUG-002. |
| Blocker | NO (no bloquea implementacion de features nuevas) |
| Features bloqueadas | Ninguna directamente. Requerido para cerrar BUG-002 definitivamente. |
| Mitigacion | No aplica todavia. |
| Decision requerida | Analisis de: cuantos turnos activos existen en JSON, formato de datos, mapping a schema Supabase, estrategia de migracion. |
| Evidencia de cierre | PENDIENTE |
| Fecha cierre | PENDIENTE |

**Regla:** F-12 NO autoriza scripts de migracion. NO autoriza tocar DATA_LOCAL. Solo autoriza analisis previo.

---

## 7. Relacion con Doc 24 (Rigor Operativo)

| Situacion en Doc 24 | Accion en Doc 25 |
|---------------------|-----------------|
| Se crea FIX-T | Registrar nuevo item con fecha de revision |
| Se crea FIX-D | Registrar nuevo item con patron riesgoso |
| Puerta 1 detecta relacion con BUG-002 | Consultar DEBT-001 |
| Puerta 2 genera deuda | Registrar antes de commit |
| Item llega a fecha de revision | Convertir en issue prioritaria |

---

## 8. Relacion con Doc 27 (Diseno IS Logbook v1.0)

| Feature Doc 27 | Deuda relacionada | Impacto |
|---------------|-------------------|---------|
| F-02 | DEBT-001 (BUG-002) | Blocker de implementacion |
| F-04 a F-09 | DEBT-001 + DEBT-002 | Bloqueadas hasta mitigacion aprobada |
| F-03.5 | Ninguna directa | Multi-tenancy es diseno |

---

## 9. Relacion con Doc 26 (DeepSeek Guardian)

| Situacion | Accion |
|-----------|--------|
| Guardian detecta deuda nueva | Registrar en DEBT_REGISTRY |
| Guardian vota NO-GO por deuda | Verificar que deuda esta registrada |
| Guardian requiere mitigacion | Actualizar item con mitigacion propuesta |

---

## 10. Criterios para pasar Doc 25 a FROZEN

| # | Criterio | Estado |
|---|----------|--------|
| 1 | Equipo revisa DRAFT | PENDIENTE |
| 2 | Votacion GO/NO-GO | PENDIENTE |
| 3 | DEBT-001 y DEBT-002 registrados correctamente | PENDIENTE |
| 4 | Estructura de campos validada por equipo | PENDIENTE |
| 5 | Reglas validadas por equipo | PENDIENTE |
| 6 | Integracion con Doc 24 verificada | PENDIENTE |
| 7 | Integracion con Doc 27 verificada | PENDIENTE |

---

## 11. Estado del documento

| Campo | Valor |
|-------|-------|
| Estado | DRAFT |
| Version | 0.1 |
| Fecha | 2026-05-05 |
| Siguiente paso | Revision del equipo |
| FROZEN autoriza | Solo registro de deuda formalizado. NO autoriza codigo. |

---

*"Si no esta en DEBT_REGISTRY, no existe como deuda conocida."*

---

### DEBT-004 / INCIDENTE-GOV-001 — Deploy F-04.1 Lote 1 sin War Room

| Campo | Valor |
|-------|-------|
| ID | DEBT-004 |
| Titulo | Deploy F-04.1 Lote 1 sin War Room multiagente |
| Tipo | ARQUITECTONICA |
| Severidad | ALTA |
| Estado | ABIERTO |
| Owner | MiMo V2 + Guillermo |
| Fecha deteccion | 2026-05-05 |
| Fuente | ChatGPT (auditoria post-deploy) |
| Descripcion | El commit 3c346f9 fue implementado y deployado sin War Room multiagente, sin code review, sin Dev Pipeline, sin DeepSeek Guardian. Se rompio el protocolo de gobernanza definido en Docs 24/25/26/27. |
| Impacto | Gobernanza rota. Codigo en produccion sin revision multiagente. Codigo dormido de Lote 2/3 incluido sin autorizacion. |
| Blocker | SI |
| Features bloqueadas | Lote 2, activacion de LOGBOOK_F04_ENABLED, cualquier cambio funcional sobre Lote 1 |
| Mitigacion | Cuarentena tecnica: flag OFF, no Lote 2, no activar flag, solo documentacion. Documento 28 creado. |
| Decision requerida | Auditoria post-deploy del commit 3c346f9 por equipo multiagente. Decision MANTENER/REVERTIR. |
| Evidencia de cierre | PENDIENTE |
| Fecha cierre | PENDIENTE |

---

## 5b. Tabla de deuda activa actualizada (post INCIDENTE-GOV-001)

| ID | Titulo | Severidad | Estado | Blocker | Owner | Fecha revision |
|----|--------|-----------|--------|--------|-------|----------------|
| DEBT-001 | Persistencia dual JSON + Supabase (BUG-002) | ALTA | MITIGADO | SI | Guillermo | PENDIENTE |
| DEBT-002 | DATA_LOCAL bloqueado | ALTA | ABIERTO | SI | Guillermo | PENDIENTE |
| DEBT-003 | Migracion one-time turnos activos legacy | MEDIA | PENDIENTE DE ANALISIS | NO | Guillermo | PENDIENTE |
| DEBT-004 | Deploy F-04.1 Lote 1 sin War Room (INCIDENTE-GOV-001) | ALTA | ABIERTO | SI | MiMo V2 + Guillermo | PENDIENTE |
