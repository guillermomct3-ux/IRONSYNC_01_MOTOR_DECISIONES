-- ═══════════════════════════════════════════════════════════
-- Migration 002: Add turnos.cerrado_por
-- Fecha ejecucion: 2026-05-06
-- Prerequisito: Lote 2 FIN
-- Autor: Equipo IronSync
-- ═══════════════════════════════════════════════════════════

-- Contexto:
-- cerrarTurnoLogbook() actualiza cerrado_por = 'operador'.
-- Sin esta columna, UPDATE falla y requests FIN son bloqueados.

ALTER TABLE turnos
ADD COLUMN IF NOT EXISTS cerrado_por text;

COMMENT ON COLUMN turnos.cerrado_por IS
  'Quien cerro el turno: operador | operador_siguiente | supervisor | sistema';

-- Valores esperados:
-- 'operador'           → FIN normal por operador (Lote 2)
-- 'operador_siguiente' → RELEVO automatico (Lote 3)
-- 'supervisor'         → Cierre manual desde dashboard (futuro)
-- 'sistema'            → Zombie checker automatico (futuro)

-- ═══════════════════════════════════════════════════════════
-- Validacion post-ejecucion
-- ═══════════════════════════════════════════════════════════
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'turnos' AND column_name = 'cerrado_por';
-- Esperado: cerrado_por | text | YES

-- ═══════════════════════════════════════════════════════════
-- Rollback
-- ═══════════════════════════════════════════════════════════
-- ALTER TABLE turnos DROP COLUMN IF EXISTS cerrado_por;
