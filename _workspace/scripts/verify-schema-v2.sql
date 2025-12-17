-- Verificación de esquema actualizado para Supabase
-- Ejecuta este SQL en tu Dashboard de Supabase para asegurar que los campos están actualizados

-- 1. Verificar tabla buildings tiene los campos requeridos
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'buildings' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar tabla units tiene los campos requeridos  
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'units' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Si faltan campos, ejecutar estas migraciones:

-- Para buildings - agregar campos v2
ALTER TABLE public.buildings 
  ADD COLUMN IF NOT EXISTS precio_desde INTEGER,
  ADD COLUMN IF NOT EXISTS precio_hasta INTEGER,
  ADD COLUMN IF NOT EXISTS gc_mode TEXT CHECK (gc_mode IN ('MF', 'variable')),
  ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

-- Para units - agregar campos extendidos
ALTER TABLE public.units
  ADD COLUMN IF NOT EXISTS area_interior_m2 DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS area_exterior_m2 DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS orientacion TEXT CHECK (orientacion IN ('N','NE','E','SE','S','SO','O','NO')),
  ADD COLUMN IF NOT EXISTS piso INTEGER,
  ADD COLUMN IF NOT EXISTS amoblado BOOLEAN,
  ADD COLUMN IF NOT EXISTS pet_friendly BOOLEAN,
  ADD COLUMN IF NOT EXISTS parking_ids TEXT,
  ADD COLUMN IF NOT EXISTS storage_ids TEXT,
  ADD COLUMN IF NOT EXISTS parking_opcional BOOLEAN,
  ADD COLUMN IF NOT EXISTS storage_opcional BOOLEAN,
  ADD COLUMN IF NOT EXISTS guarantee_installments INTEGER CHECK (guarantee_installments BETWEEN 1 AND 12),
  ADD COLUMN IF NOT EXISTS guarantee_months INTEGER CHECK (guarantee_months BETWEEN 0 AND 2),
  ADD COLUMN IF NOT EXISTS rentas_necesarias DECIMAL(3,2),
  ADD COLUMN IF NOT EXISTS renta_minima INTEGER,
  ADD COLUMN IF NOT EXISTS link_listing TEXT;

-- 4. Verificar índices existen
CREATE INDEX IF NOT EXISTS idx_buildings_precio_desde ON public.buildings(precio_desde);
CREATE INDEX IF NOT EXISTS idx_buildings_featured ON public.buildings(featured);
CREATE INDEX IF NOT EXISTS idx_units_guarantee_installments ON public.units(guarantee_installments);

-- 5. Verificar RLS policies existen
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('buildings', 'units');
