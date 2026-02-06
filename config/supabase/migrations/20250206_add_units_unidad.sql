-- Add display unit code/number to units (for property page title e.g. "Departamento 305")
-- Run in Supabase SQL Editor if not using migration runner

ALTER TABLE public.units
  ADD COLUMN IF NOT EXISTS unidad TEXT;

COMMENT ON COLUMN public.units.unidad IS 'Código o número de unidad para mostrar en la ficha (ej: 305, A-101). Si NULL, la app puede derivar desde id.';
