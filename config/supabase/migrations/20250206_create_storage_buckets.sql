-- Migración: Crear buckets de Storage para imágenes y videos de unidades
-- Fecha: 2025-02-06
-- Descripción: Crea buckets públicos para almacenar imágenes y videos de unidades y edificios
--
-- ⚠️ IMPORTANTE: Los buckets deben crearse manualmente desde el Dashboard o vía API
-- porque la tabla storage.buckets requiere permisos de propietario.
--
-- Pasos para crear buckets manualmente:
-- 1. Ve a Supabase Dashboard → Storage → New bucket
-- 2. Crea bucket 'unit-media' con estas configuraciones:
--    - Public: Sí
--    - File size limit: 100 MB
--    - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif, video/mp4, video/webm, video/quicktime, video/x-msvideo
-- 3. Crea bucket 'building-media' con estas configuraciones:
--    - Public: Sí
--    - File size limit: 50 MB
--    - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
--
-- Alternativamente, puedes crear los buckets usando la API de Supabase Storage
-- o ejecutar este script con permisos de service_role.

-- Intentar crear buckets (fallará silenciosamente si no tienes permisos)
-- Si falla, crea los buckets manualmente desde el Dashboard
DO $$
BEGIN
  -- Bucket para medios de unidades (imágenes y videos)
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'unit-media',
    'unit-media',
    true,
    104857600, -- 100 MB
    ARRAY[
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/x-msvideo'
    ]
  )
  ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'No se pudo crear bucket unit-media. Créalo manualmente desde el Dashboard.';
END $$;

DO $$
BEGIN
  -- Bucket para medios de edificios (galerías, cover images)
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'building-media',
    'building-media',
    true,
    52428800, -- 50 MB
    ARRAY[
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif'
    ]
  )
  ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'No se pudo crear bucket building-media. Créalo manualmente desde el Dashboard.';
END $$;

-- Políticas RLS para storage.objects en bucket unit-media
-- Permitir lectura pública (SELECT)
DROP POLICY IF EXISTS "Public Access for unit-media" ON storage.objects;
CREATE POLICY "Public Access for unit-media" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'unit-media');

-- Permitir inserción/actualización/eliminación solo para service_role (desde backend)
DROP POLICY IF EXISTS "Service role can manage unit-media" ON storage.objects;
CREATE POLICY "Service role can manage unit-media" ON storage.objects
  FOR ALL
  USING (bucket_id = 'unit-media' AND auth.role() = 'service_role')
  WITH CHECK (bucket_id = 'unit-media' AND auth.role() = 'service_role');

-- Políticas RLS para storage.objects en bucket building-media
-- Permitir lectura pública (SELECT)
DROP POLICY IF EXISTS "Public Access for building-media" ON storage.objects;
CREATE POLICY "Public Access for building-media" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'building-media');

-- Permitir inserción/actualización/eliminación solo para service_role (desde backend)
DROP POLICY IF EXISTS "Service role can manage building-media" ON storage.objects;
CREATE POLICY "Service role can manage building-media" ON storage.objects
  FOR ALL
  USING (bucket_id = 'building-media' AND auth.role() = 'service_role')
  WITH CHECK (bucket_id = 'building-media' AND auth.role() = 'service_role');

-- Nota: Los comentarios en storage.buckets requieren permisos de propietario
-- Si obtienes error de permisos, puedes omitir esta línea
-- COMMENT ON TABLE storage.buckets IS 'Buckets de Storage para medios de propiedades: unit-media (imágenes y videos de unidades), building-media (imágenes de edificios)';
