-- Asegurar relación unidad PMQD305C ↔ edificio Parque Mackenna
-- Ejecutar en Supabase SQL Editor si /arriendo/departamento/macul/PMQD305C no muestra el edificio correcto.

-- 1) Edificio: asegurar slug (para que getBuildingBySlug lo encuentre por slug o por id)
UPDATE public.buildings
SET slug = COALESCE(NULLIF(TRIM(slug), ''), id)
WHERE id = 'bld-condominio-parque-mackenna';

-- 2) Unidad PMQD305C: vincular al edificio Parque Mackenna por building_id
UPDATE public.units
SET building_id = 'bld-condominio-parque-mackenna'
WHERE id_pmq = 'PMQD305C'
   OR UPPER(id_pmq) = 'PMQD305C'
   OR id = 'bld-condominio-parque-mackenna-305';

-- 3) Verificar relación
SELECT u.id AS unit_id, u.building_id, u.unidad, u.id_pmq,
       b.id AS building_id, b.name AS building_name, b.slug AS building_slug
FROM public.units u
LEFT JOIN public.buildings b ON b.id = u.building_id
WHERE u.id_pmq = 'PMQD305C' OR UPPER(u.id_pmq) = 'PMQD305C' OR u.id = 'bld-condominio-parque-mackenna-305';
