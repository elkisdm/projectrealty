-- Add per-unit conexión a lavadora (building has "Puede variar", unit has Sí/No)
-- Run in Supabase SQL Editor if not using migration runner

ALTER TABLE public.units
  ADD COLUMN IF NOT EXISTS conexion_lavadora BOOLEAN;

COMMENT ON COLUMN public.units.conexion_lavadora IS 'Conexión a lavadora en esta unidad: true = Sí, false = No, NULL = no definido / puede variar (usa texto del edificio).';
