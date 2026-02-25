-- Migration: Crear tabla building_nearby_amenities
-- Ejecutar este archivo en Supabase SQL Editor ANTES de ejecutar seed-parque-mackenna-amenities.sql
-- Fecha: 2026-02-06

-- Crear tabla de amenidades cercanas a edificios
CREATE TABLE IF NOT EXISTS public.building_nearby_amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id TEXT NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('transporte', 'educacion', 'areas_verdes', 'comercios', 'salud')),
    subcategory TEXT, -- ej: 'metro', 'paraderos', 'jardines_infantiles', 'colegios', 'universidades', 'plazas', 'farmacias', 'clinicas'
    name TEXT NOT NULL,
    walking_time_minutes INTEGER NOT NULL CHECK (walking_time_minutes >= 0),
    distance_meters INTEGER NOT NULL CHECK (distance_meters >= 0),
    icon TEXT, -- opcional: nombre del icono de lucide-react
    metadata JSONB DEFAULT '{}', -- para datos adicionales (ej: línea de metro, tipo de comercio)
    display_order INTEGER DEFAULT 0, -- para ordenar dentro de subcategoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(building_id, category, subcategory, name) -- evitar duplicados
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_building_nearby_amenities_building_id ON public.building_nearby_amenities(building_id);
CREATE INDEX IF NOT EXISTS idx_building_nearby_amenities_category ON public.building_nearby_amenities(category);

-- Configurar RLS
ALTER TABLE public.building_nearby_amenities ENABLE ROW LEVEL SECURITY;

-- Política para lectura pública (idempotente)
DROP POLICY IF EXISTS "Allow public read access to nearby amenities" ON public.building_nearby_amenities;
CREATE POLICY "Allow public read access to nearby amenities" ON public.building_nearby_amenities
    FOR SELECT USING (true);

-- Política para escritura (solo service role) - idempotente
DROP POLICY IF EXISTS "Allow service role full access" ON public.building_nearby_amenities;
CREATE POLICY "Allow service role full access" ON public.building_nearby_amenities
    FOR ALL USING (auth.role() = 'service_role');

-- Trigger para actualizar updated_at (idempotente)
DROP TRIGGER IF EXISTS update_building_nearby_amenities_updated_at ON public.building_nearby_amenities;
CREATE TRIGGER update_building_nearby_amenities_updated_at 
    BEFORE UPDATE ON public.building_nearby_amenities 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
