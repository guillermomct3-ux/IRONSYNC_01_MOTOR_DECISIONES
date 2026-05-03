# EXECUTION_BLOCKED - Synthetic Field Lab

## Estado

EJECUCION BLOQUEADA.

La existencia de esta carpeta no autoriza ejecucion de agentes.

## Bloqueo vigente

No se permite:

- configurar Workspace Agents;
- ejecutar simulaciones;
- conectar agentes a Supabase;
- conectar agentes a Twilio;
- conectar agentes a Railway;
- usar datos reales;
- crear scripts de automatizacion;
- permitir escritura en produccion;
- consumir AI Ops Budget;
- tocar variables .env;
- tocar webhook.js;
- tocar turnos.js.

## Condiciones de desbloqueo

Para ejecutar el primer agente deben cumplirse todas estas condiciones:

1. BUG-002 Persistencia Dual cerrado.
2. Supabase como fuente unica de verdad.
3. Staging environment funcional.
4. Staging DB aislada con fake data.
5. Webhooks de prueba separados.
6. Railway staging separado de produccion.
7. AI Ops Budget aprobado.
8. PASS/FAIL estructurado definido.
9. Permission policy aprobada.
10. Retirement policy aprobada.
11. Dev Pipeline extendido para agentes.
12. Autorizacion explicita de Guillermo.

## Primer agente futuro

operador_ramon_synthetic.md

## Primer suite futura

Synthetic Operator Lab S01-S07
