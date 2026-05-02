# IRONSYNC A — Protocolo de Arranque y Cierre de Sesion

## Proposito
Este archivo define el protocolo que toda AI debe seguir al iniciar y cerrar una sesion de trabajo en el repo IRONSYNC_01_MOTOR_DECISIONES.

---

## ARRANQUE — Obligatorio al inicio de cada sesion

### Paso 1: Leer contexto
La AI lee los archivos en /docs/context/ en este orden:
1. 00_LEER_PRIMERO.md
2. 01_ESTADO_ACTUAL.yaml

### Paso 2: Declarar contexto leido
La AI debe declarar explicitamente:
- Que archivos de /docs/context/ leyo
- Cual es el commit_estable_actual segun el YAML
- Quien fue el ultimo agente que trabajo

### Paso 3: Verificar estado del repo
La AI ejecuta git status y git log --oneline -5 para entender el estado actual.

### Paso 4: Confirmar modo de trabajo
Segun metodo_actual.prohibido en el YAML, la AI confirma que puede y que NO puede hacer en esta sesion.

---

## CIERRE — Obligatorio al final de cada sesion

### Paso 1: Actualizar agente_actual y ultima_sesion
Cambiar agente_actual a "ninguno — reposo entre chats"
Cambiar ultima_sesion a la fecha, nombre del agente y descripcion breve

### Paso 2: Actualizar commit_estable_actual si hubo commits
Si la sesion produjo commits, actualizar el hash en el YAML.

### Paso 3: Actualizar estado_funcional si cambio
Si algun componente cambio de estado durante la sesion, reflejarlo.

### Paso 4: Actualizar riesgos_abiertos si corresponde
Si se abrio, cerro o cambio el estado de un riesgo, reflejarlo.

### Paso 5: Commit y push
git add docs/context/01_ESTADO_ACTUAL.yaml
git commit con mensaje descriptivo
git push origin main

### Paso 6: Declarar sesion cerrada
La AI declara:
- Que se hizo
- Que quedo pendiente
- Cual es la siguiente accion segun el YAML

---

## REGLAS DEL PROTOCOLO

1. No se salta el arranque. Ni siquiera si ya se que hacer.
2. No se salta el cierre. Ni siquiera si fue solo una pregunta.
3. Si el agente no declara que leyo, el trabajo que produzca no es confiable.
4. Si el YAML no se actualiza al cerrar, el siguiente agente trabaja a ciegas.
5. Guillermo puede excepcionar cualquier regla con instruccion explicita.

---

## FORMATO DE DECLARACION DE ARRANQUE

CONTEXTO LEIDO:
- 00_LEER_PRIMERO.md: OK
- 01_ESTADO_ACTUAL.yaml: OK
- commit_estable_actual: HASH
- ultimo agente: NOMBRE — FECHA
- modo: lo que puedo hacer / lo que NO puedo hacer

## FORMATO DE DECLARACION DE CIERRE

SESION CERRADA:
- agente: NOMBRE
- fecha: AAAA-MM-DD
- se hizo: resumen
- quedo pendiente: lista
- siguiente accion: del YAML
- commit: HASH si aplica

---

## Version
v1.0 — 2026-05-03
