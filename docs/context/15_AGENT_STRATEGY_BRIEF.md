# 15_AGENT_STRATEGY_BRIEF.md

## Metadata

- Documento: 15_AGENT_STRATEGY_BRIEF
- Fecha: 2026-05-03
- Estado: APPROVED_CONCEPTUAL
- Ejecucion: BLOCKED
- Condicion de desbloqueo: Persistencia unica + staging funcional
- Owner: Guillermo
- Tipo: Vision estrategica / diseno futuro
- No es ejecucion tecnica

## 1. Decision oficial

El equipo aprueba conceptualmente el Synthetic Field Lab como vision estrategica futura de IronSync.

La ejecucion queda bloqueada hasta que IronSync tenga:

1. BUG-002 Persistencia Dual cerrado.
2. Persistencia unica implementada.
3. Supabase como fuente unica de verdad.
4. Staging environment funcional.
5. Staging DB aislada con fake data.
6. Webhooks de prueba separados de produccion.
7. AI Ops Budget aprobado.
8. PASS/FAIL estructurado definido.
9. Dev Pipeline extendido para agentes.
10. Autorizacion explicita de Guillermo.

## 2. Razon de documentarlo ahora

La vision del Synthetic Field Lab surgio de manera organica durante el diseno de IronSync.

Se documenta ahora para preservar el insight estrategico, no para ejecutarlo inmediatamente.

Documentar ahora evita perdida de contexto.

Ejecutaria ahora generaria ruido tecnico por persistencia dual, ausencia de staging y riesgo de contaminacion de produccion.

## 3. Timing oficial

DOCUMENTAR AHORA.

DISENAR EN MODO PASIVO.

EJECUTAR DESPUES DE PERSISTENCIA UNICA + STAGING FUNCIONAL.

## 4. Modalidad A - Synthetic Field Lab

Uso futuro de agentes como usuarios sinteticos para probar IronSync antes de que el campo real lo rompa.

Ejemplos futuros:

- operador_ramon_synthetic.md
- operador_adversarial.md
- ulises_admin_reviewer.md
- cliente_mota_dispute.md
- auditor_d28.md

Objetivo:

- probar INICIO / FIN;
- probar PIN;
- probar horometros;
- probar fotos faltantes;
- probar duplicados;
- probar errores humanos;
- probar disputas;
- probar PDFs;
- probar reglas PASS/FAIL.

---

## 5. Modalidad B - Operational Improvement Loop

Uso futuro de agentes para diagnosticar automejoras durante operacion real.

Regla obligatoria:

agent-recommended / human-approved / gate-controlled

Los agentes podran recomendar mejoras, pero no podran modificar produccion, codigo, reglas de cobro, PDFs ni datos historicos sin aprobacion humana y gate formal.

## 6. Primer agente futuro recomendado

Primer agente:

operador_ramon_synthetic.md

Primer suite:

Synthetic Operator Lab S01-S07

Expansion posterior:

S08-S13

## 7. Ruta futura de motores

Ruta oficial:

1. Manual Markdown.
2. Workspace Agents.
3. LangGraph / CrewAI.

## 8. No hacer bajo ninguna circunstancia

- No ejecutar agentes contra produccion.
- No conectar agentes a Supabase produccion.
- No conectar agentes a Twilio real.
- No conectar agentes a Railway produccion.
- No usar datos reales en staging.
- No permitir agentes modificando codigo.
- No permitir agentes modificando base de datos.
- No ejecutar antes de cerrar BUG-002.
- No gastar AI Ops Budget sin aprobacion.
- No crear scripts dentro de /docs/agents/.
- No mezclar usuarios sinteticos con operadores reales.
- No usar Computer Use para tocar repo o produccion.

## 9. Estado final

GO - documentacion.

GO - diseno pasivo.

NO-GO - ejecucion tecnica.

Synthetic Field Lab queda aprobado conceptualmente y bloqueado operativamente.
