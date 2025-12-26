-- Script idempotente para crear tabla waitlist
-- Ejecutar: psql -h your-host -U your-user -d your-db -f scripts/setup-waitlist.sql

-- Crear tabla waitlist si no existe
CREATE TABLE IF NOT EXISTS public.waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- No crear policy abierta ya que usamos service role para inserts
-- Las políticas se manejan a nivel de aplicación con SUPABASE_SERVICE_ROLE_KEY

-- Crear índice para email (opcional, para performance)
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist (email);

-- Crear índice para created_at (opcional, para analytics)
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON public.waitlist (created_at);

-- Verificar que la tabla existe
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'waitlist'
ORDER BY ordinal_position;
