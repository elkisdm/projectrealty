-- Asignar conexión a lavadora a la unidad 305-C (Parque Mackenna)
-- El edificio tiene "Conexión lavadora: Puede variar (Sí para unidad 305-C)"; esta unidad tiene Sí.

UPDATE public.units
SET conexion_lavadora = true
WHERE id = 'bld-condominio-parque-mackenna-305'
   OR (building_id = 'bld-condominio-parque-mackenna' AND (unidad = '305C' OR id_pmq = 'PMQD305C'));

-- Verificar
SELECT id, building_id, unidad, id_pmq, conexion_lavadora
FROM public.units
WHERE building_id = 'bld-condominio-parque-mackenna';
