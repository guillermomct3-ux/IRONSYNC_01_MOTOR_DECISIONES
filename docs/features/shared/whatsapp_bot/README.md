# WhatsApp Bot

## Estado
IMPLEMENTADO

## Que es
Bot de WhatsApp via Twilio que recibe comandos de texto
y ejecuta acciones en IronSync.

## Para que sirve
Canal principal de comunicacion entre operadores y sistema.
Recibe INICIO, FIN, RELEVO, PARO, FALLA, etc.

## Modulos que lo usan
- logbook: INICIO/FIN/RELEVO via WhatsApp
- finanzas: consultas tarifas (futuro)
- gemelo_digital: consulta ficha maquina (futuro)

## Evidencia
- 2026-05-07: Laboratorio S01-S20, 13 pruebas via WhatsApp, todas PASS

## Archivos relacionados
- webhook.js (routing principal)
- respuestas_logbook.js (respuestas INICIO/FIN)
- services/logbookService.js (logica negocio)

## Commits relevantes
- 2e67a24: Freeze parcial F-04.1
