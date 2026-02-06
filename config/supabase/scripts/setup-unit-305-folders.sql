-- Script SQL: Crear estructura de carpetas para unidad 305 de Parque Mackenna
-- Fecha: 2025-02-06
-- Descripción: Crea las carpetas images/ y videos/ para la unidad 305
-- Unit ID: bld-condominio-parque-mackenna-305
-- Building ID: bld-condominio-parque-mackenna

-- Crear carpeta images/ para unidad 305
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES (
  'unit-media',
  'bld-condominio-parque-mackenna/bld-condominio-parque-mackenna-305/images/.keep',
  NULL,
  jsonb_build_object(
    'created_by', 'migration',
    'purpose', 'folder_init',
    'building_id', 'bld-condominio-parque-mackenna',
    'unit_id', 'bld-condominio-parque-mackenna-305',
    'created_at', now()
  )
)
ON CONFLICT (bucket_id, name) DO NOTHING;

-- Crear carpeta videos/ para unidad 305
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES (
  'unit-media',
  'bld-condominio-parque-mackenna/bld-condominio-parque-mackenna-305/videos/.keep',
  NULL,
  jsonb_build_object(
    'created_by', 'migration',
    'purpose', 'folder_init',
    'building_id', 'bld-condominio-parque-mackenna',
    'unit_id', 'bld-condominio-parque-mackenna-305',
    'created_at', now()
  )
)
ON CONFLICT (bucket_id, name) DO NOTHING;

-- Verificar que las carpetas se crearon
SELECT 
  name,
  created_at,
  metadata->>'purpose' as purpose
FROM storage.objects
WHERE bucket_id = 'unit-media'
  AND name LIKE 'bld-condominio-parque-mackenna/bld-condominio-parque-mackenna-305/%'
ORDER BY name;
