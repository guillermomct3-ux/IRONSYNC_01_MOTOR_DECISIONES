# IRONSYNC A — CHANGELOG DE CONTEXTO

## 2026-05-03 — Context Layer Init

### Estado
Se crea la primera capa mínima de contexto oficial en GitHub.

### Archivos creados
- docs/context/00_LEER_PRIMERO.md
- docs/context/01_ESTADO_ACTUAL.yaml
- docs/context/10_PROTOCOLO_ARRANQUE_CIERRE.md
- docs/context/INSTRUCCION_ARRANQUE.txt

### Decisión
GitHub queda establecido como memoria oficial del proyecto.
El chat queda como mesa de trabajo, no como fuente de verdad.

### Estado técnico registrado
- commit_estable_actual: 142c971
- INICIO: funciona
- FIN: funciona
- PDF automático: funciona / no bloquea FIN
- Stack real: Node.js + Express + Twilio WhatsApp + Supabase + Railway + GitHub

### Riesgos abiertos
- R-PERSISTENCIA-DUAL: turnos_activos.json + Supabase pueden crear split-brain.
- R-CONTEXTO: AIs pierden contexto entre chats si no leen /docs/context.
- R-SCRIPTS-TEMP: fix*.js y backups no trackeados en raíz local.

### Próxima acción
Crear IRONSYNC_REBASELINE_REPORT_v1.0 para reconciliar:
- PRD febrero
- C0-C10 marzo
- repo real mayo
