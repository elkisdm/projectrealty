-- Script rápido: Crear carpetas para una unidad específica
-- Copia y pega este script, reemplazando {building_id} y {unit_id}

-- Reemplaza estos valores:
-- {building_id} = ID del edificio (ej: 'bld-condominio-parque-mackenna')
-- {unit_id} = ID de la unidad (ej: 'unit-305')

-- Crear carpeta images/
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES (
  'unit-media',
  '{building_id}/{unit_id}/images/.keep',
  NULL, -- NULL para service_role, o auth.uid() para usuario autenticado
  '{"created_by": "migration", "purpose": "folder_init"}'::jsonb
)
ON CONFLICT (bucket_id, name) DO NOTHING;

-- Crear carpeta videos/
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES (
  'unit-media',
  '{building_id}/{unit_id}/videos/.keep',
  NULL,
  '{"created_by": "migration", "purpose": "folder_init"}'::jsonb
)
ON CONFLICT (bucket_id, name) DO NOTHING;

-- ============================================================================
-- EJEMPLO REAL: Unidad 305 de Parque Mackenna
-- ============================================================================

INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES (
  'unit-media',
  'bld-condominio-parque-mackenna/unit-305/images/.keep',
  NULL,
  '{"created_by": "migration", "purpose": "folder_init"}'::jsonb
)
ON CONFLICT (bucket_id, name) DO NOTHING;

INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES (
  'unit-media',
  'bld-condominio-parque-mackenna/unit-305/videos/.keep',
  NULL,
  '{"created_by": "migration", "purpose": "folder_init"}'::jsonb
)
ON CONFLICT (bucket_id, name) DO NOTHING;
