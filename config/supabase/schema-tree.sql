-- ============================================
-- SCHEMA PARA ELKIS REALTOR TREE (Link-in-bio)
-- ============================================

-- Tabla de leads del tree
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flow text NOT NULL CHECK (flow IN ('rent', 'buy')),
  name text NOT NULL,
  whatsapp text NOT NULL,
  email text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer text,
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed', 'disqualified')),
  created_at timestamptz DEFAULT now()
);

-- Configurar RLS para leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Política para inserción pública (anon y authenticated pueden insertar)
CREATE POLICY "leads_insert" ON public.leads 
    FOR INSERT TO anon, authenticated 
    WITH CHECK (true);

-- Política para lectura solo para service_role (admin)
CREATE POLICY "leads_select" ON public.leads 
    FOR SELECT TO service_role 
    USING (true);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads (email);
CREATE INDEX IF NOT EXISTS idx_leads_flow ON public.leads (flow);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_utm_campaign ON public.leads (utm_campaign) WHERE utm_campaign IS NOT NULL;

-- Índice compuesto para consultas por flow y status
CREATE INDEX IF NOT EXISTS idx_leads_flow_status ON public.leads (flow, status);
