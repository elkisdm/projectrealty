-- Agregar campos de metro más cercano a la tabla buildings
-- Estos campos almacenan el metro más cercano calculado desde building_nearby_amenities

ALTER TABLE public.buildings
ADD COLUMN IF NOT EXISTS metro_cercano_nombre TEXT,
ADD COLUMN IF NOT EXISTS metro_cercano_distancia INTEGER,
ADD COLUMN IF NOT EXISTS metro_cercano_tiempo INTEGER;

-- Comentarios para documentación
COMMENT ON COLUMN public.buildings.metro_cercano_nombre IS 'Nombre de la estación de metro más cercana';
COMMENT ON COLUMN public.buildings.metro_cercano_distancia IS 'Distancia al metro más cercano en metros';
COMMENT ON COLUMN public.buildings.metro_cercano_tiempo IS 'Tiempo caminando al metro más cercano en minutos';

-- Función para actualizar el metro más cercano automáticamente
CREATE OR REPLACE FUNCTION update_building_nearest_metro()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar el metro más cercano del edificio cuando se inserta/actualiza una amenidad de transporte
  UPDATE public.buildings b
  SET 
    metro_cercano_nombre = nearest_metro.name,
    metro_cercano_distancia = nearest_metro.distance_meters,
    metro_cercano_tiempo = nearest_metro.walking_time_minutes
  FROM (
    SELECT 
      building_id,
      name,
      distance_meters,
      walking_time_minutes
    FROM public.building_nearby_amenities
    WHERE building_id = NEW.building_id
      AND category = 'transporte'
      AND subcategory = 'metro'
    ORDER BY walking_time_minutes ASC, distance_meters ASC
    LIMIT 1
  ) nearest_metro
  WHERE b.id = NEW.building_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar automáticamente cuando se inserta/actualiza una amenidad de metro
DROP TRIGGER IF EXISTS trigger_update_nearest_metro ON public.building_nearby_amenities;
CREATE TRIGGER trigger_update_nearest_metro
  AFTER INSERT OR UPDATE ON public.building_nearby_amenities
  FOR EACH ROW
  WHEN (NEW.category = 'transporte' AND NEW.subcategory = 'metro')
  EXECUTE FUNCTION update_building_nearest_metro();

-- Actualizar todos los edificios existentes con sus metros más cercanos
UPDATE public.buildings b
SET 
  metro_cercano_nombre = nearest_metro.name,
  metro_cercano_distancia = nearest_metro.distance_meters,
  metro_cercano_tiempo = nearest_metro.walking_time_minutes
FROM (
  SELECT DISTINCT ON (building_id)
    building_id,
    name,
    distance_meters,
    walking_time_minutes
  FROM public.building_nearby_amenities
  WHERE category = 'transporte'
    AND subcategory = 'metro'
  ORDER BY building_id, walking_time_minutes ASC, distance_meters ASC
) nearest_metro
WHERE b.id = nearest_metro.building_id;
