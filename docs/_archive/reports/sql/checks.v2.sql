-- =====================================================
-- CONSULTAS DE VERIFICACIÓN DE CALIDAD DE DATOS v2
-- Hommie 0% Comisión - Auditoría de Datos con RECONCILE_NOTES
-- =====================================================

-- =====================================================
-- 1. VERIFICACIONES CRÍTICAS (HARD CHECKS) - Sección 5
-- =====================================================

-- 1.1 Precio desde = MIN(price) de publicables
-- Verifica que precioDesde sea igual al mínimo de unidades publicables
SELECT 
    b.id,
    b.slug,
    b.name,
    'Precio desde incorrecto' as issue,
    'CRÍTICA' as severity
FROM buildings b
JOIN LATERAL (
    SELECT MIN(u.price) AS min_precio_publicable
    FROM units u
    WHERE u.building_id = b.id 
      AND u.disponible = true 
      AND u.price > 1
) m ON true
WHERE b.precio_desde IS NOT NULL 
  AND b.precio_desde <> m.min_precio_publicable;

-- 1.2 Precio hasta = MAX(price) de publicables
-- Verifica que precioHasta sea igual al máximo de unidades publicables
SELECT 
    b.id,
    b.slug,
    b.name,
    'Precio hasta incorrecto' as issue,
    'CRÍTICA' as severity
FROM buildings b
JOIN LATERAL (
    SELECT MAX(u.price) AS max_precio_publicable
    FROM units u
    WHERE u.building_id = b.id 
      AND u.disponible = true 
      AND u.price > 1
) m ON true
WHERE b.precio_hasta IS NOT NULL 
  AND b.precio_hasta <> m.max_precio_publicable;

-- 1.3 Tipología canónica regex + mapeo público
-- Detecta tipologías que no siguen el formato canónico
SELECT DISTINCT 
    tipologia,
    COUNT(*) as count,
    'Tipología no canónica' as issue,
    'CRÍTICA' as severity
FROM units
WHERE tipologia !~ '^(Studio|1D1B|2D1B|2D2B|3D2B)$'
GROUP BY tipologia
ORDER BY count DESC;

-- 1.4 Áreas dentro de 20–200 (interior) y 0–50 (exterior) después de corrección
-- Detecta áreas que están fuera del rango razonable después de corrección cm²→m²
SELECT 
    id,
    building_id,
    tipologia,
    area_interior_m2,
    area_exterior_m2,
    'Área fuera de rango' as issue,
    'CRÍTICA' as severity
FROM units
WHERE area_interior_m2 < 20 
   OR area_interior_m2 > 200
   OR area_exterior_m2 < 0
   OR area_exterior_m2 > 50;

-- 1.5 Unicidad OP (id único de unidad)
-- Verifica que OP sea único
SELECT 
    id as OP,
    COUNT(*) as count,
    'OP duplicado' as issue,
    'CRÍTICA' as severity
FROM units
GROUP BY id
HAVING COUNT(*) > 1;

-- 1.6 Unicidad Condominio+Unidad para trazabilidad
-- Verifica que Condominio+Unidad sea único
SELECT 
    building_id,
    unit_number,
    COUNT(*) as count,
    'Condominio+Unidad duplicado' as issue,
    'CRÍTICA' as severity
FROM units
WHERE unit_number IS NOT NULL
GROUP BY building_id, unit_number
HAVING COUNT(*) > 1;

-- =====================================================
-- 2. VERIFICACIONES MODERADAS (SOFT CHECKS) - Sección 5
-- =====================================================

-- 2.1 Comunas con dígitos en cualquier posición
-- Detecta comunas que incluyen dígitos
SELECT DISTINCT 
    comuna,
    COUNT(*) as building_count,
    'Comuna con dígitos' as issue,
    'MODERADA' as severity
FROM buildings
WHERE comuna ~ '\d'
GROUP BY comuna
ORDER BY building_count DESC;

-- 2.2 Link Listing sin número de unidad
-- Detecta links que no contienen número de unidad
SELECT 
    id,
    link_listing,
    'Link sin número de unidad' as issue,
    'MODERADA' as severity
FROM units
WHERE link_listing IS NOT NULL 
  AND link_listing !~ '\d';

-- 2.3 GC Total con modo no coherente
-- Detecta modos de garantía no coherentes
SELECT 
    id,
    gc_mode,
    'Modo GC no coherente' as issue,
    'MODERADA' as severity
FROM buildings
WHERE gc_mode NOT IN ('MF', 'variable');

-- 2.4 Cuotas Garantía fuera de 1..12
-- Detecta cuotas de garantía fuera del rango válido
SELECT 
    id,
    building_id,
    guarantee_installments,
    'Cuotas garantía fuera de rango' as issue,
    'MODERADA' as severity
FROM units
WHERE guarantee_installments < 1 
   OR guarantee_installments > 12;

-- =====================================================
-- 3. VERIFICACIONES DE DISPONIBILIDAD PUBLICABLE
-- =====================================================

-- 3.1 Unidades no publicables con estado válido
-- Detecta unidades que deberían ser publicables pero no lo son
SELECT 
    id,
    building_id,
    estado,
    price as arriendo_total,
    disponible,
    'Estado válido pero no publicable' as issue,
    'MODERADA' as severity
FROM units
WHERE estado IN ('RE - Acondicionamiento', 'Lista para arrendar')
  AND price > 1
  AND disponible = false;

-- 3.2 Unidades publicables con estado inválido
-- Detecta unidades publicables con estado incorrecto
SELECT 
    id,
    building_id,
    estado,
    price as arriendo_total,
    disponible,
    'Publicable con estado inválido' as issue,
    'MODERADA' as severity
FROM units
WHERE disponible = true
  AND (estado NOT IN ('RE - Acondicionamiento', 'Lista para arrendar')
       OR price <= 1);

-- =====================================================
-- 4. VERIFICACIONES DE NORMALIZACIÓN
-- =====================================================

-- 4.1 Orientaciones no estándar
-- Detecta orientaciones fuera del dominio estricto
SELECT DISTINCT 
    orientation,
    COUNT(*) as count,
    'Orientación no estándar' as issue,
    'MODERADA' as severity
FROM units
WHERE orientation IS NOT NULL
  AND orientation NOT IN ('N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO')
GROUP BY orientation
ORDER BY count DESC;

-- 4.2 Meses de garantía fuera de {0,1,2}
-- Detecta meses de garantía inválidos
SELECT 
    id,
    building_id,
    guarantee_months,
    'Meses garantía inválidos' as issue,
    'MODERADA' as severity
FROM units
WHERE guarantee_months IS NOT NULL
  AND guarantee_months NOT IN (0, 1, 2);

-- 4.3 Parking/Storage IDs mal formateados
-- Detecta identificadores de parking/storage mal formateados
SELECT 
    id,
    building_id,
    parking_ids,
    'Parking IDs mal formateados' as issue,
    'MODERADA' as severity
FROM units
WHERE parking_ids IS NOT NULL
  AND parking_ids !~ '^(\d+\|)*\d+$'
  AND parking_ids != 'x';

SELECT 
    id,
    building_id,
    storage_ids,
    'Storage IDs mal formateados' as issue,
    'MODERADA' as severity
FROM units
WHERE storage_ids IS NOT NULL
  AND storage_ids !~ '^(\d+\|)*\d+$'
  AND storage_ids != 'x';

-- =====================================================
-- 5. VERIFICACIONES DE PRECIOS Y RENTAS
-- =====================================================

-- 5.1 Renta mínima calculada incorrectamente
-- Verifica que renta_minima = arriendo_total * rentas_necesarias
SELECT 
    id,
    building_id,
    price as arriendo_total,
    rentas_necesarias,
    renta_minima,
    (price * rentas_necesarias) as renta_minima_calculada,
    'Renta mínima incorrecta' as issue,
    'CRÍTICA' as severity
FROM units
WHERE renta_minima IS NOT NULL
  AND rentas_necesarias IS NOT NULL
  AND ABS(renta_minima - (price * rentas_necesarias)) > 0.01;

-- 5.2 Precios extremos (fuera de rango razonable)
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

-- =====================================================
-- 6. VERIFICACIONES DE TRAZABILIDAD
-- =====================================================

-- 6.1 Links de listing sin formato válido
-- Detecta links que no son URLs válidas
SELECT 
    id,
    building_id,
    link_listing,
    'Link listing inválido' as issue,
    'MODERADA' as severity
FROM units
WHERE link_listing IS NOT NULL
  AND link_listing !~ '^https?://';

-- 6.2 Unidades sin link de listing
-- Detecta unidades sin trazabilidad
SELECT 
    id,
    building_id,
    tipologia,
    'Sin link de listing' as issue,
    'MODERADA' as severity
FROM units
WHERE link_listing IS NULL;

-- =====================================================
-- 7. MÉTRICAS DE CALIDAD GENERAL v2
-- =====================================================

-- 7.1 Resumen de calidad por edificio con nuevas métricas
SELECT 
    b.id,
    b.slug,
    b.name,
    b.comuna,
    
    -- Métricas de disponibilidad publicable
    COUNT(u.id) as total_units,
    COUNT(u.id) FILTER (WHERE u.disponible = true AND u.price > 1) as publicable_units,
    COUNT(u.id) FILTER (WHERE u.estado IN ('RE - Acondicionamiento', 'Lista para arrendar')) as valid_state_units,
    
    -- Métricas de tipologías
    COUNT(u.id) FILTER (WHERE u.tipologia ~ '^(Studio|1D1B|2D1B|2D2B|3D2B)$') as canonical_typologies,
    
    -- Métricas de precios
    MIN(u.price) FILTER (WHERE u.disponible = true AND u.price > 1) as precio_desde_calculado,
    MAX(u.price) FILTER (WHERE u.disponible = true AND u.price > 1) as precio_hasta_calculado,
    
    -- Métricas de trazabilidad
    COUNT(u.id) FILTER (WHERE u.link_listing IS NOT NULL) as units_with_traceability,
    
    -- Score de calidad v2 (0-100)
    ROUND(
        (
            -- Disponibilidad publicable (30%)
            CASE WHEN COUNT(u.id) FILTER (WHERE u.disponible = true AND u.price > 1) > 0 THEN 30 ELSE 0 END +
            
            -- Tipologías canónicas (25%)
            CASE WHEN COUNT(u.id) > 0 THEN 
                (COUNT(u.id) FILTER (WHERE u.tipologia ~ '^(Studio|1D1B|2D1B|2D2B|3D2B)$')::float / COUNT(u.id) * 25)
            ELSE 0 END +
            
            -- Trazabilidad (20%)
            CASE WHEN COUNT(u.id) > 0 THEN 
                (COUNT(u.id) FILTER (WHERE u.link_listing IS NOT NULL)::float / COUNT(u.id) * 20)
            ELSE 0 END +
            
            -- Estados válidos (15%)
            CASE WHEN COUNT(u.id) > 0 THEN 
                (COUNT(u.id) FILTER (WHERE u.estado IN ('RE - Acondicionamiento', 'Lista para arrendar'))::float / COUNT(u.id) * 15)
            ELSE 0 END +
            
            -- Completitud básica (10%)
            (CASE WHEN b.name IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN b.comuna IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN b.address IS NOT NULL THEN 1 ELSE 0 END) * 3.33
        ), 1
    ) as quality_score_v2
    
FROM buildings b
LEFT JOIN units u ON b.id = u.building_id
GROUP BY b.id, b.slug, b.name, b.comuna, b.address
ORDER BY quality_score_v2 ASC;

-- 7.2 Resumen general de calidad v2
SELECT 
    'RESUMEN GENERAL v2' as metric,
    COUNT(*) as total_buildings,
    COUNT(*) FILTER (WHERE publicable_units > 0) as buildings_with_publicables,
    COUNT(*) FILTER (WHERE canonical_typology_percentage = 100) as buildings_with_canonical_typologies,
    COUNT(*) FILTER (WHERE traceability_percentage = 100) as buildings_with_full_traceability,
    ROUND(AVG(quality_score_v2), 1) as avg_quality_score_v2
FROM (
    SELECT 
        b.id,
        COUNT(u.id) FILTER (WHERE u.disponible = true AND u.price > 1) as publicable_units,
        CASE WHEN COUNT(u.id) > 0 THEN 
            (COUNT(u.id) FILTER (WHERE u.tipologia ~ '^(Studio|1D1B|2D1B|2D2B|3D2B)$')::float / COUNT(u.id) * 100)
        ELSE 0 END as canonical_typology_percentage,
        CASE WHEN COUNT(u.id) > 0 THEN 
            (COUNT(u.id) FILTER (WHERE u.link_listing IS NOT NULL)::float / COUNT(u.id) * 100)
        ELSE 0 END as traceability_percentage,
        ROUND(
            (
                CASE WHEN COUNT(u.id) FILTER (WHERE u.disponible = true AND u.price > 1) > 0 THEN 30 ELSE 0 END +
                CASE WHEN COUNT(u.id) > 0 THEN 
                    (COUNT(u.id) FILTER (WHERE u.tipologia ~ '^(Studio|1D1B|2D1B|2D2B|3D2B)$')::float / COUNT(u.id) * 25)
                ELSE 0 END +
                CASE WHEN COUNT(u.id) > 0 THEN 
                    (COUNT(u.id) FILTER (WHERE u.link_listing IS NOT NULL)::float / COUNT(u.id) * 20)
                ELSE 0 END +
                CASE WHEN COUNT(u.id) > 0 THEN 
                    (COUNT(u.id) FILTER (WHERE u.estado IN ('RE - Acondicionamiento', 'Lista para arrendar'))::float / COUNT(u.id) * 15)
                ELSE 0 END +
                (CASE WHEN b.name IS NOT NULL THEN 1 ELSE 0 END +
                 CASE WHEN b.comuna IS NOT NULL THEN 1 ELSE 0 END +
                 CASE WHEN b.address IS NOT NULL THEN 1 ELSE 0 END) * 3.33
            ), 1
        ) as quality_score_v2
    FROM buildings b
    LEFT JOIN units u ON b.id = u.building_id
    GROUP BY b.id, b.name, b.comuna, b.address
) quality_metrics_v2;

-- =====================================================
-- 8. CONSULTAS DE DIAGNÓSTICO ESPECÍFICO v2
-- =====================================================

-- 8.1 Análisis de disponibilidad por estado
SELECT 
    estado,
    COUNT(*) as total_units,
    COUNT(*) FILTER (WHERE disponible = true) as available_units,
    COUNT(*) FILTER (WHERE price > 1) as units_with_valid_price,
    COUNT(*) FILTER (WHERE disponible = true AND price > 1) as publicable_units,
    ROUND(COUNT(*) FILTER (WHERE disponible = true AND price > 1) * 100.0 / COUNT(*), 1) as publicable_percentage
FROM units
GROUP BY estado
ORDER BY total_units DESC;

-- 8.2 Análisis de precios por tipología (solo publicables)
SELECT 
    tipologia,
    COUNT(*) FILTER (WHERE disponible = true AND price > 1) as publicable_units,
    ROUND(AVG(price) FILTER (WHERE disponible = true AND price > 1), 0) as avg_price_publicable,
    MIN(price) FILTER (WHERE disponible = true AND price > 1) as min_price_publicable,
    MAX(price) FILTER (WHERE disponible = true AND price > 1) as max_price_publicable,
    ROUND(STDDEV(price) FILTER (WHERE disponible = true AND price > 1), 0) as price_stddev_publicable
FROM units
GROUP BY tipologia
HAVING COUNT(*) FILTER (WHERE disponible = true AND price > 1) > 0
ORDER BY avg_price_publicable DESC;

-- 8.3 Análisis de orientaciones por comuna
SELECT 
    b.comuna,
    u.orientation,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY b.comuna), 1) as percentage
FROM buildings b
JOIN units u ON b.id = u.building_id
WHERE u.orientation IS NOT NULL
GROUP BY b.comuna, u.orientation
ORDER BY b.comuna, count DESC;

-- =====================================================
-- 9. CONSULTAS DE LIMPIEZA v2 (SOLO LECTURA)
-- =====================================================

-- 9.1 Lista de unidades que necesitan corrección de estado
SELECT 
    b.id as building_id,
    b.slug,
    b.name,
    u.id as unit_id,
    u.estado,
    u.price as arriendo_total,
    u.disponible,
    CASE 
        WHEN u.estado IN ('RE - Acondicionamiento', 'Lista para arrendar') AND u.price > 1 THEN 'Debería ser publicable'
        WHEN u.disponible = true AND (u.estado NOT IN ('RE - Acondicionamiento', 'Lista para arrendar') OR u.price <= 1) THEN 'Publicable con estado inválido'
        ELSE 'Estado correcto'
    END as correction_needed
FROM buildings b
JOIN units u ON b.id = u.building_id
WHERE (u.estado IN ('RE - Acondicionamiento', 'Lista para arrendar') AND u.price > 1 AND u.disponible = false)
   OR (u.disponible = true AND (u.estado NOT IN ('RE - Acondicionamiento', 'Lista para arrendar') OR u.price <= 1));

-- 9.2 Lista de tipologías para normalización
SELECT DISTINCT 
    tipologia,
    CASE 
        WHEN tipologia ~ '^(Studio|1D1B|2D1B|2D2B|3D2B)$' THEN 'Ya canónica'
        WHEN tipologia ~ '^[0-9]D[0-9]B$' THEN 'Necesita normalización'
        WHEN tipologia ILIKE '%studio%' THEN 'Convertir a Studio'
        ELSE 'Formato desconocido'
    END as status,
    COUNT(*) as count
FROM units
GROUP BY tipologia
ORDER BY count DESC;

-- 9.3 Lista de comunas para normalización extendida
SELECT DISTINCT 
    comuna,
    CASE 
        WHEN comuna ~ '\d' THEN 'Necesita limpiar dígitos'
        WHEN comuna ~ ' - ' THEN 'Necesita limpiar duplicados'
        ELSE 'Formato correcto'
    END as status,
    CASE 
        WHEN comuna ~ '\d' THEN regexp_replace(comuna, '\b\d{3,}\b', '', 'g')
        WHEN comuna ~ ' - ' THEN split_part(comuna, ' - ', 1)
        ELSE comuna
    END as cleaned_comuna,
    COUNT(*) as building_count
FROM buildings
GROUP BY comuna
ORDER BY building_count DESC;
