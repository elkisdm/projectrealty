-- Migración: Políticas RLS para buckets de Storage (ejecutar DESPUÉS de crear buckets manualmente)
-- Fecha: 2025-02-06
-- Descripción: Crea políticas RLS para los buckets unit-media y building-media
--
-- ⚠️ PREREQUISITO: Los buckets deben existir antes de ejecutar este script
-- Crea los buckets manualmente desde Supabase Dashboard → Storage → New bucket
-- o ejecuta primero el script de creación de buckets con permisos de service_role

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
