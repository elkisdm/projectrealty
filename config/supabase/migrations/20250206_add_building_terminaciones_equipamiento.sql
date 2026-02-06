-- Añadir terminaciones y equipamiento al edificio (para pestaña Características)
-- Ejecutar en Supabase SQL Editor

ALTER TABLE public.buildings
  ADD COLUMN IF NOT EXISTS terminaciones TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS equipamiento TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.buildings.terminaciones IS 'Lista de terminaciones del edificio (ej: Pisos flotantes, Ventanas DVH)';
COMMENT ON COLUMN public.buildings.equipamiento IS 'Lista de equipamiento del edificio (ej: Calefacción central, Agua caliente central)';
