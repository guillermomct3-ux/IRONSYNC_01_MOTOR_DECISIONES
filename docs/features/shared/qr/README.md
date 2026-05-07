# QR

## Estado
IMPLEMENTADO

## Que es
Capacidad de generar y leer codigos QR.
Usado para sesiones de WhatsApp (horometro sin dato previo).

## Para que sirve
Cuando operador envia INICIO sin horometro, sistema genera
sesion para que operador envie el dato despues.

## Modulos que lo usan
- logbook: sesiones QR INICIO/FIN
- gemelo_digital: QR fisico en maquina (futuro)

## Evidencia
- 2026-05-07: Laboratorio S01-S20 valido sesiones QR (S02, S03, S12, S13)

## Archivos relacionados
- lib/logbookCache.js (TTL sesiones)
- services/logbookService.js (logica QR)

## Commits relevantes
- 2e67a24: Freeze parcial F-04.1 incluye QR
