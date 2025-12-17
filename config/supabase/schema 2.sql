-- Crear tabla de edificios
CREATE TABLE IF NOT EXISTS public.buildings (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    comuna TEXT NOT NULL,
    address TEXT NOT NULL,
    amenities TEXT[] DEFAULT '{}',
    gallery TEXT[] DEFAULT '{}',
    cover_image TEXT,
    badges JSONB DEFAULT '[]',
    service_level TEXT CHECK (service_level IN ('pro', 'standard')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de unidades
CREATE TABLE IF NOT EXISTS public.units (
    id TEXT PRIMARY KEY,
    building_id TEXT NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
    tipologia TEXT NOT NULL,
    m2 INTEGER,
    price INTEGER NOT NULL,
    estacionamiento BOOLEAN DEFAULT FALSE,
    bodega BOOLEAN DEFAULT FALSE,
    disponible BOOLEAN DEFAULT TRUE,
    bedrooms INTEGER,
    bathrooms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_buildings_comuna ON public.buildings(comuna);
CREATE INDEX IF NOT EXISTS idx_buildings_slug ON public.buildings(slug);
CREATE INDEX IF NOT EXISTS idx_units_building_id ON public.units(building_id);
CREATE INDEX IF NOT EXISTS idx_units_disponible ON public.units(disponible);
CREATE INDEX IF NOT EXISTS idx_units_price ON public.units(price);
CREATE INDEX IF NOT EXISTS idx_units_tipologia ON public.units(tipologia);

-- Crear vista para filtros disponibles
CREATE OR REPLACE VIEW public.v_filters_available AS
SELECT DISTINCT
    b.comuna,
    u.tipologia
FROM public.buildings b
JOIN public.units u ON b.id = u.building_id
WHERE u.disponible = true;

-- Configurar RLS (Row Level Security)
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

-- Políticas para lectura pública
CREATE POLICY "Allow public read access to buildings" ON public.buildings
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to units" ON public.units
    FOR SELECT USING (true);

-- Políticas para escritura (solo service role)
CREATE POLICY "Allow service role full access to buildings" ON public.buildings
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to units" ON public.units
    FOR ALL USING (auth.role() = 'service_role');

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_buildings_updated_at 
    BEFORE UPDATE ON public.buildings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_units_updated_at 
    BEFORE UPDATE ON public.units 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Crear tabla de waitlist
CREATE TABLE IF NOT EXISTS public.waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL CHECK (position('@' in email) > 1),
  phone text,
  source text DEFAULT 'coming-soon',
  utm jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Configurar RLS para waitlist
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Política para inserción en waitlist
CREATE POLICY "wl_insert" ON public.waitlist 
    FOR INSERT TO anon, authenticated 
    WITH CHECK (true);

-- Índice para email en waitlist
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist (email);

-- Vista para completitud de datos de edificios
CREATE OR REPLACE VIEW public.v_building_completeness AS
SELECT 
    b.id,
    b.slug,
    b.name,
    b.comuna,
    b.address,
    
    -- Campos requeridos (7 total)
    CASE WHEN b.id IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN b.slug IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN b.name IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN b.comuna IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN b.address IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN b.amenities IS NOT NULL AND array_length(b.amenities, 1) > 0 THEN 1 ELSE 0 END +
    CASE WHEN b.gallery IS NOT NULL AND array_length(b.gallery, 1) >= 3 THEN 1 ELSE 0 END AS required_fields,
    
    -- Campos opcionales (3 total)
    CASE WHEN b.cover_image IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN b.badges IS NOT NULL AND jsonb_array_length(b.badges) > 0 THEN 1 ELSE 0 END +
    CASE WHEN b.service_level IS NOT NULL THEN 1 ELSE 0 END AS optional_fields,
    
    -- Total campos (10)
    10 AS total_fields,
    
    -- Porcentaje de completitud (ponderado: 70% requeridos + 30% opcionales)
    ROUND(
        (
            (CASE WHEN b.id IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN b.slug IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN b.name IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN b.comuna IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN b.address IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN b.amenities IS NOT NULL AND array_length(b.amenities, 1) > 0 THEN 1 ELSE 0 END +
             CASE WHEN b.gallery IS NOT NULL AND array_length(b.gallery, 1) >= 3 THEN 1 ELSE 0 END) * 0.7 +
            (CASE WHEN b.cover_image IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN b.badges IS NOT NULL AND jsonb_array_length(b.badges) > 0 THEN 1 ELSE 0 END +
             CASE WHEN b.service_level IS NOT NULL THEN 1 ELSE 0 END) * 0.3
        ) * 100, 1
    ) AS completeness_percentage,
    
    -- Detalles por campo
    CASE WHEN b.id IS NOT NULL THEN '✅' ELSE '❌' END AS id_status,
    CASE WHEN b.slug IS NOT NULL THEN '✅' ELSE '❌' END AS slug_status,
    CASE WHEN b.name IS NOT NULL THEN '✅' ELSE '❌' END AS name_status,
    CASE WHEN b.comuna IS NOT NULL THEN '✅' ELSE '❌' END AS comuna_status,
    CASE WHEN b.address IS NOT NULL THEN '✅' ELSE '❌' END AS address_status,
    CASE WHEN b.amenities IS NOT NULL AND array_length(b.amenities, 1) > 0 THEN '✅' ELSE '❌' END AS amenities_status,
    CASE WHEN b.gallery IS NOT NULL AND array_length(b.gallery, 1) >= 3 THEN '✅' ELSE '❌' END AS gallery_status,
    CASE WHEN b.cover_image IS NOT NULL THEN '✅' ELSE '❌' END AS cover_image_status,
    CASE WHEN b.badges IS NOT NULL AND jsonb_array_length(b.badges) > 0 THEN '✅' ELSE '❌' END AS badges_status,
    CASE WHEN b.service_level IS NOT NULL THEN '✅' ELSE '❌' END AS service_level_status,
    
    b.created_at,
    b.updated_at
FROM public.buildings b
ORDER BY completeness_percentage ASC, b.name;
