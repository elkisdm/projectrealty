-- Migración: Columna slug en units
-- Fecha: 2026-02-10
-- Descripción: Permite persistir el slug de la unidad para URLs y identificación.
--              Si la columna no existe, el código admin ya deriva slug en lectura (mapper).

BEGIN;

ALTER TABLE public.units
  ADD COLUMN IF NOT EXISTS slug TEXT;

COMMENT ON COLUMN public.units.slug IS 'Slug para URL de la unidad (ej: edificio-305). Puede derivarse de building_id + unidad si NULL.';

COMMIT;
