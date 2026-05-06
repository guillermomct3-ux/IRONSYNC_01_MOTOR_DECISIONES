-- ═══════════════════════════════════════════════════════════
-- Migration 001: Add operadores.empresa_id
-- Fecha ejecucion: 2026-05-06
-- Prerequisito: Lote 1 INICIO
-- Autor: Equipo IronSync
-- ═══════════════════════════════════════════════════════════

-- Contexto:
-- logbookService.js requiere empresa_id para validacion strict.
-- Sin esta columna, requests INICIO son bloqueados.

ALTER TABLE operadores
ADD COLUMN IF NOT EXISTS empresa_id UUID;

COMMENT ON COLUMN operadores.empresa_id IS
  'Empresa a la que pertenece el operador. Requerido para validacion logbook.';

-- ═══════════════════════════════════════════════════════════
-- Validacion post-ejecucion
-- ═══════════════════════════════════════════════════════════
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'operadores' AND column_name = 'empresa_id';
-- Esperado: empresa_id | uuid | YES

-- ═══════════════════════════════════════════════════════════
-- Rollback
-- ═══════════════════════════════════════════════════════════
-- ALTER TABLE operadores DROP COLUMN IF EXISTS empresa_id;
