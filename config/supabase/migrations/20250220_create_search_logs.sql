-- Crear tabla para registrar búsquedas de usuarios
-- Sin PII (Personally Identifiable Information) según especificación
CREATE TABLE IF NOT EXISTS public.search_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Búsqueda por texto (sin PII)
    query_text TEXT,
    -- Filtros aplicados (JSONB para flexibilidad)
    filters JSONB DEFAULT '{}',
    -- Resultados de la búsqueda
    results_count INTEGER DEFAULT 0,
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- IP hasheada para análisis agregado (no PII)
    ip_hash TEXT,
    -- User agent (sin información personal)
    user_agent TEXT
);

-- Índices para análisis y consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON public.search_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_logs_query_text ON public.search_logs(query_text);
CREATE INDEX IF NOT EXISTS idx_search_logs_filters ON public.search_logs USING GIN(filters);
CREATE INDEX IF NOT EXISTS idx_search_logs_results_count ON public.search_logs(results_count);

-- RLS: Solo inserción pública, lectura solo con service_role
ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;

-- Política: Cualquiera puede insertar búsquedas (sin PII)
CREATE POLICY "Allow public insert to search_logs" ON public.search_logs
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Política: Solo service_role puede leer (para análisis)
CREATE POLICY "Allow service_role read to search_logs" ON public.search_logs
    FOR SELECT
    TO service_role
    USING (true);

-- Comentarios para documentación
COMMENT ON TABLE public.search_logs IS 'Registro de búsquedas de usuarios sin PII para análisis';
COMMENT ON COLUMN public.search_logs.query_text IS 'Texto de búsqueda ingresado por el usuario';
COMMENT ON COLUMN public.search_logs.filters IS 'Filtros aplicados en formato JSON: {comuna, dormitorios, precioMin, precioMax, estacionamiento, bodega, mascotas}';
COMMENT ON COLUMN public.search_logs.results_count IS 'Cantidad de resultados encontrados';
COMMENT ON COLUMN public.search_logs.ip_hash IS 'Hash SHA256 de la IP para análisis agregado (no PII)';
COMMENT ON COLUMN public.search_logs.user_agent IS 'User agent del navegador (sin información personal)';

