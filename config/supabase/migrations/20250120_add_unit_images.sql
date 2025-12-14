-- Migración: Agregar columnas de imágenes a la tabla units
-- Fecha: 2025-01-20
-- Descripción: Agrega columnas para almacenar URLs de imágenes de unidades

-- Agregar columnas de imágenes a units
ALTER TABLE public.units
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS images_tipologia TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS images_areas_comunes TEXT[] DEFAULT '{}';

-- Comentarios para documentación
COMMENT ON COLUMN public.units.images IS 'Array de URLs de imágenes del interior de la unidad';
COMMENT ON COLUMN public.units.images_tipologia IS 'Array de URLs de imágenes representativas de la tipología';
COMMENT ON COLUMN public.units.images_areas_comunes IS 'Array de URLs de imágenes de áreas comunes relacionadas';

-- Índice GIN para búsquedas eficientes en arrays (opcional, útil si buscas por URLs)
-- CREATE INDEX IF NOT EXISTS idx_units_images_gin ON public.units USING GIN (images);
