-- ============================================
-- SCHEMA PARA FORMULARIO DE INVERSIÓN INMOBILIARIA
-- ============================================

-- Tabla de solicitudes de inversión
CREATE TABLE IF NOT EXISTS public.investment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL CHECK (position('@' in email) > 1),
  phone text,
  message text,
  source text DEFAULT 'links-page',
  created_at timestamptz DEFAULT now()
);

-- Configurar RLS para investment_requests
ALTER TABLE public.investment_requests ENABLE ROW LEVEL SECURITY;

-- Política para inserción en investment_requests
CREATE POLICY "investment_insert" ON public.investment_requests 
    FOR INSERT TO anon, authenticated 
    WITH CHECK (true);

-- Índice para email en investment_requests
CREATE INDEX IF NOT EXISTS idx_investment_requests_email ON public.investment_requests (email);

-- Índice para created_at para consultas ordenadas
CREATE INDEX IF NOT EXISTS idx_investment_requests_created_at ON public.investment_requests (created_at DESC);
