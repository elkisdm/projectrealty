-- Migración: Historial de estados de visitas
-- Fecha: 2026-02-11

CREATE TABLE IF NOT EXISTS public.visit_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id TEXT NOT NULL REFERENCES public.visits(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'status_changed', 'rescheduled')),
  from_status TEXT,
  to_status TEXT,
  from_slot_id TEXT,
  to_slot_id TEXT,
  reason TEXT,
  actor_type TEXT NOT NULL DEFAULT 'system' CHECK (actor_type IN ('system', 'user', 'admin')),
  actor_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visit_status_history_visit_id ON public.visit_status_history(visit_id);
CREATE INDEX IF NOT EXISTS idx_visit_status_history_created_at ON public.visit_status_history(created_at);
CREATE INDEX IF NOT EXISTS idx_visit_status_history_event_type ON public.visit_status_history(event_type);

ALTER TABLE public.visit_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service role full access to visit_status_history" ON public.visit_status_history;
CREATE POLICY "Allow service role full access to visit_status_history" ON public.visit_status_history
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
