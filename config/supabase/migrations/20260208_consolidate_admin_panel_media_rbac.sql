-- Migración: Consolidar panel admin v2 (publicación + media + auditoría)
-- Fecha: 2026-02-08
-- Descripción:
-- 1) Agrega publication_status a units
-- 2) Crea tablas unit_media y building_media
-- 3) Crea tabla admin_activity_log
-- 4) Define bucket admin-media y políticas RLS de storage

BEGIN;

-- ========================================
-- 1) Estado de publicación en unidades
-- ========================================
ALTER TABLE public.units
ADD COLUMN IF NOT EXISTS publication_status TEXT DEFAULT 'draft';

UPDATE public.units
SET publication_status = 'draft'
WHERE publication_status IS NULL OR publication_status = '';

ALTER TABLE public.units
ALTER COLUMN publication_status SET DEFAULT 'draft';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'units_publication_status_check'
  ) THEN
    ALTER TABLE public.units
      ADD CONSTRAINT units_publication_status_check
      CHECK (publication_status IN ('draft', 'published', 'archived'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_units_publication_status
  ON public.units (publication_status);

-- ========================================
-- 2) Catálogo de media (unidades / edificios)
-- ========================================
CREATE TABLE IF NOT EXISTS public.unit_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL, -- unit_id
  building_id TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  mime TEXT NOT NULL,
  size BIGINT NOT NULL CHECK (size > 0),
  bucket TEXT NOT NULL,
  path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  is_cover BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_unit_media_owner_type
  ON public.unit_media (owner_id, media_type);

CREATE INDEX IF NOT EXISTS idx_unit_media_building
  ON public.unit_media (building_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unit_media_bucket_path
  ON public.unit_media (bucket, path);

CREATE TABLE IF NOT EXISTS public.building_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL, -- building_id
  building_id TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  mime TEXT NOT NULL,
  size BIGINT NOT NULL CHECK (size > 0),
  bucket TEXT NOT NULL,
  path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  is_cover BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_building_media_owner_type
  ON public.building_media (owner_id, media_type);

CREATE INDEX IF NOT EXISTS idx_building_media_building
  ON public.building_media (building_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_building_media_bucket_path
  ON public.building_media (bucket, path);

ALTER TABLE public.unit_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.building_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read unit_media" ON public.unit_media;
CREATE POLICY "Public read unit_media"
  ON public.unit_media
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role manage unit_media" ON public.unit_media;
CREATE POLICY "Service role manage unit_media"
  ON public.unit_media
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Public read building_media" ON public.building_media;
CREATE POLICY "Public read building_media"
  ON public.building_media
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role manage building_media" ON public.building_media;
CREATE POLICY "Service role manage building_media"
  ON public.building_media
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ========================================
-- 3) Auditoría de actividad admin
-- ========================================
CREATE TABLE IF NOT EXISTS public.admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id TEXT,
  actor_email TEXT,
  actor_role TEXT,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_activity_created_at
  ON public.admin_activity_log (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_activity_actor_id
  ON public.admin_activity_log (actor_id);

CREATE INDEX IF NOT EXISTS idx_admin_activity_entity
  ON public.admin_activity_log (entity, entity_id);

ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manage admin_activity_log" ON public.admin_activity_log;
CREATE POLICY "Service role manage admin_activity_log"
  ON public.admin_activity_log
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ========================================
-- 4) Storage bucket admin-media (idempotente)
-- ========================================
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'admin-media',
    'admin-media',
    true,
    209715200, -- 200 MB
    ARRAY[
      'image/jpeg',
      'image/png',
      'image/webp',
      'video/mp4',
      'video/webm'
    ]
  )
  ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'No se pudo crear bucket admin-media. Créalo manualmente desde el Dashboard.';
END $$;

DROP POLICY IF EXISTS "Public Access for admin-media" ON storage.objects;
CREATE POLICY "Public Access for admin-media"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'admin-media');

DROP POLICY IF EXISTS "Service role can manage admin-media" ON storage.objects;
CREATE POLICY "Service role can manage admin-media"
  ON storage.objects
  FOR ALL
  USING (bucket_id = 'admin-media' AND auth.role() = 'service_role')
  WITH CHECK (bucket_id = 'admin-media' AND auth.role() = 'service_role');

COMMIT;
