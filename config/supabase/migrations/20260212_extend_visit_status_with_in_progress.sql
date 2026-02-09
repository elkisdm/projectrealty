-- Migración: extiende estados de visita con in_progress
-- Fecha: 2026-02-12

ALTER TABLE public.visits
  DROP CONSTRAINT IF EXISTS visits_status_check;

ALTER TABLE public.visits
  ADD CONSTRAINT visits_status_check
  CHECK (status IN ('pending', 'confirmed', 'in_progress', 'canceled', 'no_show', 'completed'));
