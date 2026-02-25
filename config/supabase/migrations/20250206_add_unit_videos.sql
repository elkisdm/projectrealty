-- Migración: Agregar columna de videos a la tabla units
-- Fecha: 2025-02-06
-- Descripción: Agrega columna para almacenar URLs de videos asociados a una unidad

ALTER TABLE public.units
ADD COLUMN IF NOT EXISTS videos TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.units.videos IS 'Array de URLs de videos de la unidad';
