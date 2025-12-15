-- Migración: Agregar campos v2 a la tabla buildings
-- Fecha: 2025-01-25
-- Descripción: Agrega campos opcionales gc_mode, precio_desde, precio_hasta y featured
--              que son parte del schema v2 de Building

-- Agregar columna gc_mode (Gastos Comunes Mode)
-- Valores permitidos: 'MF' (Monto Fijo) o 'variable'
ALTER TABLE public.buildings 
  ADD COLUMN IF NOT EXISTS gc_mode TEXT CHECK (gc_mode IN ('MF', 'variable'));

-- Agregar columnas de precio
ALTER TABLE public.buildings 
  ADD COLUMN IF NOT EXISTS precio_desde INTEGER,
  ADD COLUMN IF NOT EXISTS precio_hasta INTEGER;

-- Agregar columna featured para destacar edificios
ALTER TABLE public.buildings 
  ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

-- Crear índices para mejorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_buildings_precio_desde ON public.buildings(precio_desde);
CREATE INDEX IF NOT EXISTS idx_buildings_featured ON public.buildings(featured);
CREATE INDEX IF NOT EXISTS idx_buildings_gc_mode ON public.buildings(gc_mode);

-- Comentarios para documentación
COMMENT ON COLUMN public.buildings.gc_mode IS 'Modo de gastos comunes: MF (Monto Fijo) o variable';
COMMENT ON COLUMN public.buildings.precio_desde IS 'Precio mínimo de las unidades disponibles';
COMMENT ON COLUMN public.buildings.precio_hasta IS 'Precio máximo de las unidades disponibles';
COMMENT ON COLUMN public.buildings.featured IS 'Indica si el edificio está destacado';

