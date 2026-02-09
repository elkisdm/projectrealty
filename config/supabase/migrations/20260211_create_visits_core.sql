-- Migración: Core de agendamiento de visitas
-- Fecha: 2026-02-11
-- Descripción:
--   - Tablas: visit_slots, visits, visit_contacts
--   - Índices para lookup por listing/user/idempotency
--   - RLS y políticas base
--   - Triggers para updated_at

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.visit_slots (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'blocked', 'reserved', 'confirmed')),
  source TEXT NOT NULL CHECK (source IN ('owner', 'system')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.visit_slots
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.visits (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL,
  slot_id TEXT NOT NULL REFERENCES public.visit_slots(id) ON DELETE RESTRICT,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'canceled', 'no_show', 'completed')),
  idempotency_key TEXT NOT NULL UNIQUE,
  agent_id TEXT NOT NULL DEFAULT 'agent_001',
  channel TEXT CHECK (channel IN ('web', 'whatsapp')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.visits
  ADD COLUMN IF NOT EXISTS channel TEXT;

ALTER TABLE public.visits
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.visit_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id TEXT NOT NULL UNIQUE REFERENCES public.visits(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visit_slots_listing_id ON public.visit_slots(listing_id);
CREATE INDEX IF NOT EXISTS idx_visit_slots_status ON public.visit_slots(status);
CREATE INDEX IF NOT EXISTS idx_visit_slots_start_time ON public.visit_slots(start_time);
CREATE INDEX IF NOT EXISTS idx_visit_slots_listing_start ON public.visit_slots(listing_id, start_time);

CREATE INDEX IF NOT EXISTS idx_visits_listing_id ON public.visits(listing_id);
CREATE INDEX IF NOT EXISTS idx_visits_user_id ON public.visits(user_id);
CREATE INDEX IF NOT EXISTS idx_visits_status ON public.visits(status);
CREATE INDEX IF NOT EXISTS idx_visits_slot_id ON public.visits(slot_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_visits_idempotency_key ON public.visits(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_visits_created_at ON public.visits(created_at);

CREATE INDEX IF NOT EXISTS idx_visit_contacts_visit_id ON public.visit_contacts(visit_id);
CREATE INDEX IF NOT EXISTS idx_visit_contacts_phone ON public.visit_contacts(phone);
CREATE INDEX IF NOT EXISTS idx_visit_contacts_email ON public.visit_contacts(email) WHERE email IS NOT NULL;

ALTER TABLE public.visit_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to open slots" ON public.visit_slots;
CREATE POLICY "Allow public read access to open slots" ON public.visit_slots
  FOR SELECT
  USING (status = 'open');

DROP POLICY IF EXISTS "Allow service role full access to visit_slots" ON public.visit_slots;
CREATE POLICY "Allow service role full access to visit_slots" ON public.visit_slots
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow service role full access to visits" ON public.visits;
CREATE POLICY "Allow service role full access to visits" ON public.visits
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow service role full access to visit_contacts" ON public.visit_contacts;
CREATE POLICY "Allow service role full access to visit_contacts" ON public.visit_contacts
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP TRIGGER IF EXISTS update_visit_slots_updated_at ON public.visit_slots;
CREATE TRIGGER update_visit_slots_updated_at
  BEFORE UPDATE ON public.visit_slots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_visits_updated_at ON public.visits;
CREATE TRIGGER update_visits_updated_at
  BEFORE UPDATE ON public.visits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

