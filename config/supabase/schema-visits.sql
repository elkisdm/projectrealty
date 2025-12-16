-- ============================================
-- SCHEMA PARA SISTEMA DE AGENDAMIENTO DE VISITAS
-- ============================================

-- Tabla de agentes (opcional, puede ser hardcoded)
-- Por ahora usamos agentes hardcoded en el código

-- Tabla de slots de visitas (horarios disponibles)
CREATE TABLE IF NOT EXISTS public.visit_slots (
    id TEXT PRIMARY KEY,
    listing_id TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('open', 'blocked', 'reserved', 'confirmed')),
    source TEXT NOT NULL CHECK (source IN ('owner', 'system')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de visitas agendadas
CREATE TABLE IF NOT EXISTS public.visits (
    id TEXT PRIMARY KEY,
    listing_id TEXT NOT NULL,
    slot_id TEXT NOT NULL REFERENCES public.visit_slots(id) ON DELETE RESTRICT,
    user_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'canceled', 'no_show', 'completed')),
    idempotency_key TEXT UNIQUE NOT NULL,
    agent_id TEXT NOT NULL DEFAULT 'agent_001',
    channel TEXT CHECK (channel IN ('web', 'whatsapp')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de datos de contacto de visitas (para guardar nombre, teléfono, email)
CREATE TABLE IF NOT EXISTS public.visit_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id TEXT NOT NULL REFERENCES public.visits(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(visit_id)
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_visit_slots_listing_id ON public.visit_slots(listing_id);
CREATE INDEX IF NOT EXISTS idx_visit_slots_status ON public.visit_slots(status);
CREATE INDEX IF NOT EXISTS idx_visit_slots_start_time ON public.visit_slots(start_time);
CREATE INDEX IF NOT EXISTS idx_visit_slots_listing_start ON public.visit_slots(listing_id, start_time);

CREATE INDEX IF NOT EXISTS idx_visits_listing_id ON public.visits(listing_id);
CREATE INDEX IF NOT EXISTS idx_visits_user_id ON public.visits(user_id);
CREATE INDEX IF NOT EXISTS idx_visits_status ON public.visits(status);
CREATE INDEX IF NOT EXISTS idx_visits_slot_id ON public.visits(slot_id);
CREATE INDEX IF NOT EXISTS idx_visits_idempotency_key ON public.visits(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_visits_created_at ON public.visits(created_at);

CREATE INDEX IF NOT EXISTS idx_visit_contacts_visit_id ON public.visit_contacts(visit_id);
CREATE INDEX IF NOT EXISTS idx_visit_contacts_phone ON public.visit_contacts(phone);
CREATE INDEX IF NOT EXISTS idx_visit_contacts_email ON public.visit_contacts(email) WHERE email IS NOT NULL;

-- Configurar RLS (Row Level Security)
ALTER TABLE public.visit_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_contacts ENABLE ROW LEVEL SECURITY;

-- Políticas para lectura pública (solo slots abiertos)
CREATE POLICY "Allow public read access to open slots" ON public.visit_slots
    FOR SELECT USING (status = 'open');

-- Políticas para lectura de visitas (solo service role para privacidad)
CREATE POLICY "Allow service role full access to visit_slots" ON public.visit_slots
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to visits" ON public.visits
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to visit_contacts" ON public.visit_contacts
    FOR ALL USING (auth.role() = 'service_role');

-- Política para inserción de visitas desde API (service role)
-- Las visitas se crean a través del API con service role

-- Función para actualizar updated_at automáticamente
CREATE TRIGGER update_visit_slots_updated_at 
    BEFORE UPDATE ON public.visit_slots 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visits_updated_at 
    BEFORE UPDATE ON public.visits 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar el status del slot cuando se crea/confirma una visita
CREATE OR REPLACE FUNCTION update_slot_status_on_visit()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'confirmed' OR NEW.status = 'pending' THEN
        UPDATE public.visit_slots
        SET status = 'confirmed',
            updated_at = NOW()
        WHERE id = NEW.slot_id AND status = 'open';
    ELSIF NEW.status = 'canceled' THEN
        UPDATE public.visit_slots
        SET status = 'open',
            updated_at = NOW()
        WHERE id = NEW.slot_id AND status = 'confirmed';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar slot al crear/actualizar visita
CREATE TRIGGER trigger_update_slot_on_visit
    AFTER INSERT OR UPDATE OF status ON public.visits
    FOR EACH ROW
    EXECUTE FUNCTION update_slot_status_on_visit();

