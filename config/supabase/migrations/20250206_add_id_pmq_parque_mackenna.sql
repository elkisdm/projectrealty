-- Convención de IDs Parque Mackenna (PMQ): PMQ edificio, PMQD departamentos, PMQE estacionamientos, PMQB bodegas
-- Almacenar en mayúsculas; comparación case-insensitive en app.

-- Edificios: código negocio (ej. PMQ)
ALTER TABLE public.buildings
  ADD COLUMN IF NOT EXISTS id_pmq TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_buildings_id_pmq ON public.buildings (UPPER(id_pmq)) WHERE id_pmq IS NOT NULL;

COMMENT ON COLUMN public.buildings.id_pmq IS 'Código negocio Parque Mackenna (ej. PMQ). Comparación case-insensitive.';

-- Unidades: código negocio (ej. PMQD305C)
ALTER TABLE public.units
  ADD COLUMN IF NOT EXISTS id_pmq TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_units_id_pmq ON public.units (UPPER(id_pmq)) WHERE id_pmq IS NOT NULL;

COMMENT ON COLUMN public.units.id_pmq IS 'Código negocio unidad (ej. PMQD305C). Comparación case-insensitive.';
