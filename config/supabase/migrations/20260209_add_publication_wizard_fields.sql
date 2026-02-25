-- Migración: Campos de wizard de publicación para unidades
-- Fecha: 2026-02-09
-- Descripción:
--   1) Agrega metadatos de publicación orientados a wizard
--   2) Agrega columnas de control de draft/pasos
--   3) Agrega timestamps de ciclo de publicación

BEGIN;

ALTER TABLE public.units
  ADD COLUMN IF NOT EXISTS operation_type TEXT DEFAULT 'rent',
  ADD COLUMN IF NOT EXISTS publication_title TEXT,
  ADD COLUMN IF NOT EXISTS publication_description TEXT,
  ADD COLUMN IF NOT EXISTS unit_amenities TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS draft_step SMALLINT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS draft_completed_steps TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS draft_last_saved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

UPDATE public.units
SET operation_type = 'rent'
WHERE operation_type IS NULL OR operation_type = '';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'units_operation_type_check'
  ) THEN
    ALTER TABLE public.units
      ADD CONSTRAINT units_operation_type_check
      CHECK (operation_type IN ('rent'));
  END IF;
END $$;

ALTER TABLE public.units
  ALTER COLUMN operation_type SET DEFAULT 'rent';

UPDATE public.units
SET draft_step = 1
WHERE draft_step IS NULL OR draft_step < 1;

ALTER TABLE public.units
  ALTER COLUMN draft_step SET DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_units_draft_step
  ON public.units (draft_step);

CREATE INDEX IF NOT EXISTS idx_units_status_updated
  ON public.units (publication_status, updated_at DESC);

COMMIT;
