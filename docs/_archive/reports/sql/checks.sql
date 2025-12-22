-- =====================================================
-- CONSULTAS DE VERIFICACIÓN DE CALIDAD DE DATOS
-- Hommie 0% Comisión - Auditoría de Datos
-- =====================================================

-- =====================================================
-- 1. VERIFICACIONES CRÍTICAS (HARD CHECKS)
-- =====================================================

-- 1.1 Precio desde solo con unidades disponibles
-- Verifica que el precioDesde se calcule correctamente
SELECT 
    b.id,
    b.slug,
    b.name,
    'Precio desde incorrecto' as issue,
    'CRÍTICA' as severity
FROM buildings b
JOIN LATERAL (
    SELECT MIN(u.price) AS min_precio_disponible
    FROM units u
    WHERE u.building_id = b.id AND u.disponible = true
) m ON true
WHERE b.precio_desde IS NOT NULL 
  AND b.precio_desde <> m.min_precio_disponible;

-- 1.2 Tipologías no normalizadas
-- Detecta tipologías que no siguen el formato canónico
SELECT DISTINCT 
    tipologia,
    COUNT(*) as count,
    'Tipología no normalizada' as issue,
    'CRÍTICA' as severity
FROM units
WHERE tipologia !~ '^(Studio|1D1B|2D1B|2D2B|3D2B)$'
GROUP BY tipologia
ORDER BY count DESC;

-- 1.3 Áreas con valores anómalos
-- Detecta áreas que están fuera del rango razonable
SELECT 
    id,
    building_id,
    tipologia,
    area_interior_m2,
    area_exterior_m2,
    'Área anómala' as issue,
    'CRÍTICA' as severity
FROM units
WHERE area_interior_m2 > 200 
   OR area_exterior_m2 > 50
   OR (area_interior_m2 IS NOT NULL AND area_interior_m2 < 20);

-- 1.4 Galerías incompletas
-- Verifica que todos los edificios tengan al menos 3 imágenes
SELECT 
    id,
    slug,
    name,
    array_length(gallery, 1) as image_count,
    'Galería incompleta' as issue,
    'CRÍTICA' as severity
FROM buildings
WHERE array_length(gallery, 1) < 3;

-- 1.5 Integridad referencial
-- Verifica que todas las unidades tengan un building válido
SELECT 
    u.id,
    u.building_id,
    'Building no existe' as issue,
    'CRÍTICA' as severity
FROM units u
LEFT JOIN buildings b ON u.building_id = b.id
WHERE b.id IS NULL;

-- =====================================================
-- 2. VERIFICACIONES MODERADAS (SOFT CHECKS)
-- =====================================================

-- 2.1 Comunas con códigos postales
-- Detecta comunas que incluyen códigos postales
SELECT DISTINCT 
    comuna,
    COUNT(*) as building_count,
    'Comuna con código postal' as issue,
    'MODERADA' as severity
FROM buildings
WHERE comuna ~ '^\d+'
GROUP BY comuna
ORDER BY building_count DESC;

-- 2.2 Amenities no mapeadas
-- Detecta amenities que no están en el catálogo interno
SELECT DISTINCT 
    unnest(amenities) as amenity,
    COUNT(*) as usage_count,
    'Amenity no mapeada' as issue,
    'MODERADA' as severity
FROM buildings
WHERE unnest(amenities) NOT IN (
    'piscina', 'gimnasio', 'quinchos', 'cowork', 'estacionamiento',
    'conserjeria', 'seguridad', 'areas_verdes', 'juegos_infantiles',
    'sala_eventos', 'sala_multiuso', 'lavanderia', 'bicicleteros'
)
GROUP BY amenity
ORDER BY usage_count DESC;

-- 2.3 Precios extremos
-- Detecta precios que están fuera del rango esperado
SELECT 
    id,
    building_id,
    tipologia,
    price,
    'Precio extremo' as issue,
    CASE 
        WHEN price < 100000 THEN 'Muy bajo'
        WHEN price > 100000000 THEN 'Muy alto'
    END as reason,
    'MODERADA' as severity
FROM units
WHERE price < 100000 OR price > 100000000;

-- 2.4 Campos opcionales vacíos
-- Identifica edificios con campos opcionales faltantes
SELECT 
    id,
    slug,
    name,
    CASE WHEN cover_image IS NULL THEN 'Sin imagen de portada' END as missing_cover,
    CASE WHEN badges IS NULL OR jsonb_array_length(badges) = 0 THEN 'Sin badges' END as missing_badges,
    CASE WHEN service_level IS NULL THEN 'Sin nivel de servicio' END as missing_service,
    'Campos opcionales vacíos' as issue,
    'MODERADA' as severity
FROM buildings
WHERE cover_image IS NULL 
   OR badges IS NULL 
   OR jsonb_array_length(badges) = 0
   OR service_level IS NULL;

-- =====================================================
-- 3. VERIFICACIONES DE CONSISTENCIA
-- =====================================================

-- 3.1 Disponibilidad vs hasAvailability
-- Verifica que hasAvailability sea consistente con unidades disponibles
SELECT 
    b.id,
    b.slug,
    b.name,
    b.has_availability,
    COUNT(u.id) FILTER (WHERE u.disponible = true) as available_units,
    'Inconsistencia en disponibilidad' as issue,
    'MODERADA' as severity
FROM buildings b
LEFT JOIN units u ON b.id = u.building_id
GROUP BY b.id, b.slug, b.name, b.has_availability
HAVING (b.has_availability IS TRUE AND COUNT(u.id) FILTER (WHERE u.disponible = true) = 0)
    OR (b.has_availability IS FALSE AND COUNT(u.id) FILTER (WHERE u.disponible = true) > 0);

-- 3.2 Duplicados de slug
-- Verifica que no haya slugs duplicados
SELECT 
    slug,
    COUNT(*) as count,
    'Slug duplicado' as issue,
    'CRÍTICA' as severity
FROM buildings
GROUP BY slug
HAVING COUNT(*) > 1;

-- 3.3 Unidades sin building_id
-- Verifica que todas las unidades tengan building_id
SELECT 
    id,
    tipologia,
    'Sin building_id' as issue,
    'CRÍTICA' as severity
FROM units
WHERE building_id IS NULL OR building_id = '';

-- =====================================================
-- 4. MÉTRICAS DE CALIDAD GENERAL
-- =====================================================

-- 4.1 Resumen de calidad por edificio
SELECT 
    b.id,
    b.slug,
    b.name,
    b.comuna,
    
    -- Métricas de completitud
    CASE WHEN b.cover_image IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN b.badges IS NOT NULL AND jsonb_array_length(b.badges) > 0 THEN 1 ELSE 0 END +
    CASE WHEN b.service_level IS NOT NULL THEN 1 ELSE 0 END as optional_fields_filled,
    
    -- Métricas de unidades
    COUNT(u.id) as total_units,
    COUNT(u.id) FILTER (WHERE u.disponible = true) as available_units,
    COUNT(u.id) FILTER (WHERE u.tipologia ~ '^(Studio|1D1B|2D1B|2D2B|3D2B)$') as normalized_typologies,
    
    -- Métricas de galería
    array_length(b.gallery, 1) as gallery_images,
    
    -- Score de calidad (0-100)
    ROUND(
        (
            -- Completitud básica (40%)
            (CASE WHEN b.name IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN b.comuna IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN b.address IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN array_length(b.gallery, 1) >= 3 THEN 1 ELSE 0 END) * 10 +
            
            -- Unidades disponibles (30%)
            CASE WHEN COUNT(u.id) FILTER (WHERE u.disponible = true) > 0 THEN 30 ELSE 0 END +
            
            -- Tipologías normalizadas (20%)
            CASE WHEN COUNT(u.id) > 0 THEN 
                (COUNT(u.id) FILTER (WHERE u.tipologia ~ '^(Studio|1D1B|2D1B|2D2B|3D2B)$')::float / COUNT(u.id) * 20)
            ELSE 0 END +
            
            -- Campos opcionales (10%)
            (CASE WHEN b.cover_image IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN b.badges IS NOT NULL AND jsonb_array_length(b.badges) > 0 THEN 1 ELSE 0 END +
             CASE WHEN b.service_level IS NOT NULL THEN 1 ELSE 0 END) * 3.33
        ), 1
    ) as quality_score
    
FROM buildings b
LEFT JOIN units u ON b.id = u.building_id
GROUP BY b.id, b.slug, b.name, b.comuna, b.cover_image, b.badges, b.service_level, b.gallery
ORDER BY quality_score ASC;

-- 4.2 Resumen general de calidad
SELECT 
    'RESUMEN GENERAL' as metric,
    COUNT(*) as total_buildings,
    COUNT(*) FILTER (WHERE array_length(gallery, 1) >= 3) as complete_galleries,
    COUNT(*) FILTER (WHERE has_availability IS TRUE) as with_availability,
    ROUND(AVG(quality_score), 1) as avg_quality_score
FROM (
    SELECT 
        b.id,
        b.gallery,
        b.has_availability,
        ROUND(
            (
                (CASE WHEN b.name IS NOT NULL THEN 1 ELSE 0 END +
                 CASE WHEN b.comuna IS NOT NULL THEN 1 ELSE 0 END +
                 CASE WHEN b.address IS NOT NULL THEN 1 ELSE 0 END +
                 CASE WHEN array_length(b.gallery, 1) >= 3 THEN 1 ELSE 0 END) * 10 +
                CASE WHEN COUNT(u.id) FILTER (WHERE u.disponible = true) > 0 THEN 30 ELSE 0 END +
                CASE WHEN COUNT(u.id) > 0 THEN 
                    (COUNT(u.id) FILTER (WHERE u.tipologia ~ '^(Studio|1D1B|2D1B|2D2B|3D2B)$')::float / COUNT(u.id) * 20)
                ELSE 0 END +
                (CASE WHEN b.cover_image IS NOT NULL THEN 1 ELSE 0 END +
                 CASE WHEN b.badges IS NOT NULL AND jsonb_array_length(b.badges) > 0 THEN 1 ELSE 0 END +
                 CASE WHEN b.service_level IS NOT NULL THEN 1 ELSE 0 END) * 3.33
            ), 1
        ) as quality_score
    FROM buildings b
    LEFT JOIN units u ON b.id = u.building_id
    GROUP BY b.id, b.name, b.comuna, b.address, b.gallery, b.has_availability, b.cover_image, b.badges, b.service_level
) quality_metrics;

-- =====================================================
-- 5. CONSULTAS DE DIAGNÓSTICO ESPECÍFICO
-- =====================================================

-- 5.1 Análisis de tipologías por comuna
SELECT 
    b.comuna,
    u.tipologia,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY b.comuna), 1) as percentage
FROM buildings b
JOIN units u ON b.id = u.building_id
GROUP BY b.comuna, u.tipologia
ORDER BY b.comuna, count DESC;

-- 5.2 Análisis de precios por tipología
SELECT 
    tipologia,
    COUNT(*) as total_units,
    COUNT(*) FILTER (WHERE disponible = true) as available_units,
    ROUND(AVG(price), 0) as avg_price,
    MIN(price) as min_price,
    MAX(price) as max_price,
    ROUND(STDDEV(price), 0) as price_stddev
FROM units
GROUP BY tipologia
ORDER BY avg_price DESC;

-- 5.3 Detección de outliers de precio por tipología
SELECT 
    u.id,
    u.building_id,
    u.tipologia,
    u.price,
    u.price - avg_stats.avg_price as price_diff,
    ROUND((u.price - avg_stats.avg_price) / avg_stats.price_stddev, 2) as z_score,
    'Outlier de precio' as issue,
    'MODERADA' as severity
FROM units u
JOIN (
    SELECT 
        tipologia,
        AVG(price) as avg_price,
        STDDEV(price) as price_stddev
    FROM units
    GROUP BY tipologia
) avg_stats ON u.tipologia = avg_stats.tipologia
WHERE ABS((u.price - avg_stats.avg_price) / avg_stats.price_stddev) > 2
  AND avg_stats.price_stddev > 0;

-- =====================================================
-- 6. CONSULTAS DE LIMPIEZA (SOLO LECTURA)
-- =====================================================

-- 6.1 Lista de edificios que necesitan corrección de áreas
SELECT 
    b.id,
    b.slug,
    b.name,
    u.id as unit_id,
    u.tipologia,
    u.area_interior_m2 as current_interior,
    ROUND(u.area_interior_m2 / 100.0, 1) as corrected_interior,
    u.area_exterior_m2 as current_exterior,
    ROUND(u.area_exterior_m2 / 100.0, 1) as corrected_exterior
FROM buildings b
JOIN units u ON b.id = u.building_id
WHERE u.area_interior_m2 > 200 OR u.area_exterior_m2 > 50;

-- 6.2 Lista de tipologías para normalización
SELECT DISTINCT 
    tipologia,
    CASE 
        WHEN tipologia ~ '^[0-9]D[0-9]B$' THEN 'Ya normalizada'
        WHEN tipologia ~ '^[0-9]D/[0-9]B$' THEN 'Necesita normalización'
        WHEN tipologia ILIKE '%studio%' THEN 'Convertir a Studio'
        ELSE 'Formato desconocido'
    END as status
FROM units
ORDER BY tipologia;

-- 6.3 Lista de comunas para normalización
SELECT DISTINCT 
    comuna,
    CASE 
        WHEN comuna ~ '^\d+' THEN 'Necesita limpiar código postal'
        ELSE 'Formato correcto'
    END as status,
    CASE 
        WHEN comuna ~ '^\d+' THEN regexp_replace(comuna, '^\d+\s+', '')
        ELSE comuna
    END as cleaned_comuna
FROM buildings
ORDER BY comuna;
