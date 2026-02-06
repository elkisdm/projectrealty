-- Asignar IDs PMQ a Parque Mackenna
-- Convención: PMQ edificio, PMQD departamentos, PMQE estacionamientos, PMQB bodegas
-- Código unidad "305-C" → 305C (sin guión). Id unidad = PMQD305C (válido mayúsculas/minúsculas).

-- 1) Edificio Parque Mackenna: id_pmq = PMQ
UPDATE public.buildings
SET id_pmq = 'PMQ'
WHERE id = 'bld-condominio-parque-mackenna'
   OR slug = 'bld-condominio-parque-mackenna';

-- 2) Unidad 305-C: id_pmq = PMQD305C, unidad = 305C
UPDATE public.units
SET id_pmq = 'PMQD305C',
    unidad = '305C'
WHERE id = 'bld-condominio-parque-mackenna-305';

-- Verificar
SELECT id, slug, id_pmq FROM public.buildings WHERE id_pmq = 'PMQ';
SELECT id, building_id, unidad, id_pmq FROM public.units WHERE id_pmq = 'PMQD305C';
