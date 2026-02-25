-- Script SQL: Crear estructura de carpetas para una unidad en Storage
-- Fecha: 2025-02-06
-- Descripción: Crea la estructura de carpetas (images/ y videos/) para una unidad específica
--
-- ⚠️ IMPORTANTE: 
-- 1. Los buckets 'unit-media' y 'building-media' deben existir antes de ejecutar este script
-- 2. Este script crea objetos placeholder para inicializar las carpetas
-- 3. Reemplaza {building_id} y {unit_id} con los valores reales antes de ejecutar

-- ============================================================================
-- EJEMPLO: Crear estructura para unidad 305 del edificio Parque Mackenna
-- ============================================================================

-- Estructura para unit-media/{building_id}/{unit_id}/images/
-- Esto crea la carpeta 'images' dentro de la unidad
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES (
  'unit-media',
  'bld-condominio-parque-mackenna/unit-305/images/.keep',
  auth.uid(), -- Usa el usuario actual, o NULL para service_role
  '{"created_by": "migration", "purpose": "folder_init"}'::jsonb
)
ON CONFLICT (bucket_id, name) DO NOTHING;

-- Estructura para unit-media/{building_id}/{unit_id}/videos/
-- Esto crea la carpeta 'videos' dentro de la unidad
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES (
  'unit-media',
  'bld-condominio-parque-mackenna/unit-305/videos/.keep',
  auth.uid(),
  '{"created_by": "migration", "purpose": "folder_init"}'::jsonb
)
ON CONFLICT (bucket_id, name) DO NOTHING;

-- ============================================================================
-- PLANTILLA REUTILIZABLE: Reemplaza estos valores según tu unidad
-- ============================================================================

-- Función helper para crear estructura de carpetas de una unidad
CREATE OR REPLACE FUNCTION create_unit_storage_folders(
  p_building_id TEXT,
  p_unit_id TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Crear carpeta images/
  INSERT INTO storage.objects (bucket_id, name, owner, metadata)
  VALUES (
    'unit-media',
    p_building_id || '/' || p_unit_id || '/images/.keep',
    auth.uid(),
    jsonb_build_object(
      'created_by', 'migration',
      'purpose', 'folder_init',
      'building_id', p_building_id,
      'unit_id', p_unit_id,
      'created_at', now()
    )
  )
  ON CONFLICT (bucket_id, name) DO NOTHING;

  -- Crear carpeta videos/
  INSERT INTO storage.objects (bucket_id, name, owner, metadata)
  VALUES (
    'unit-media',
    p_building_id || '/' || p_unit_id || '/videos/.keep',
    auth.uid(),
    jsonb_build_object(
      'created_by', 'migration',
      'purpose', 'folder_init',
      'building_id', p_building_id,
      'unit_id', p_unit_id,
      'created_at', now()
    )
  )
  ON CONFLICT (bucket_id, name) DO NOTHING;

  RAISE NOTICE 'Estructura de carpetas creada para unidad: %/%', p_building_id, p_unit_id;
END;
$$;

-- ============================================================================
-- USO DE LA FUNCIÓN: Ejemplos para diferentes unidades
-- ============================================================================

-- Ejemplo 1: Unidad 305 de Parque Mackenna
SELECT create_unit_storage_folders('bld-condominio-parque-mackenna', 'unit-305');

-- Ejemplo 2: Otra unidad (reemplaza con tus valores)
-- SELECT create_unit_storage_folders('bld-otro-edificio', 'unit-123');

-- ============================================================================
-- CREAR ESTRUCTURA PARA MÚLTIPLES UNIDADES (batch)
-- ============================================================================

-- Crear estructura para todas las unidades de un edificio específico
CREATE OR REPLACE FUNCTION create_building_units_folders(p_building_id TEXT)
RETURNS TABLE(unit_id TEXT, status TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  unit_record RECORD;
BEGIN
  FOR unit_record IN 
    SELECT id FROM units WHERE building_id = p_building_id
  LOOP
    BEGIN
      PERFORM create_unit_storage_folders(p_building_id, unit_record.id);
      unit_id := unit_record.id;
      status := 'created';
      RETURN NEXT;
    EXCEPTION
      WHEN OTHERS THEN
        unit_id := unit_record.id;
        status := 'error: ' || SQLERRM;
        RETURN NEXT;
    END;
  END LOOP;
END;
$$;

-- Ejemplo: Crear carpetas para todas las unidades de Parque Mackenna
-- SELECT * FROM create_building_units_folders('bld-condominio-parque-mackenna');

-- ============================================================================
-- NOTAS:
-- ============================================================================
-- 1. Los archivos .keep son invisibles y solo sirven para inicializar carpetas
-- 2. Puedes eliminarlos después de subir archivos reales si quieres
-- 3. Las carpetas aparecerán en el Dashboard de Storage automáticamente
-- 4. Si usas service_role, reemplaza auth.uid() con NULL o un UUID específico
-- 5. Para ejecutar con service_role, usa: SET ROLE service_role; antes del script
