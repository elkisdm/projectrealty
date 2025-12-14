-- Migración: Agregar campos de Assetplan a la tabla units
-- Fecha: 2025-02-12
-- Descripción: Agrega columnas para soportar la importación completa del CSV de Assetplan

ALTER TABLE public.units
ADD COLUMN IF NOT EXISTS gc INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_mensual INTEGER GENERATED ALWAYS AS (price + gc) STORED,
ADD COLUMN IF NOT EXISTS orientacion TEXT,
ADD COLUMN IF NOT EXISTS m2_terraza NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS descuento_porcentaje NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS meses_descuento INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS garantia_meses INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS garantia_cuotas INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS rentas_necesarias NUMERIC DEFAULT 3,
ADD COLUMN IF NOT EXISTS pet_friendly BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS reajuste_meses INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS link_listing TEXT,
ADD COLUMN IF NOT EXISTS parking_optional BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS storage_optional BOOLEAN DEFAULT TRUE;

-- Comentarios para documentación
COMMENT ON COLUMN public.units.gc IS 'Gastos comunes estimados';
COMMENT ON COLUMN public.units.total_mensual IS 'Precio base + Gastos comunes (Calculado)';
COMMENT ON COLUMN public.units.orientacion IS 'Orientacion de la unidad (N, S, E, O, etc)';
COMMENT ON COLUMN public.units.m2_terraza IS 'Metros cuadrados de terraza';
COMMENT ON COLUMN public.units.pet_friendly IS 'Si acepta mascotas (booleano)';
