-- Migración: Calcular automáticamente bedrooms y bathrooms desde tipologia
-- Fecha: 2025-01-20
-- Descripción: Función y trigger para calcular automáticamente bedrooms y bathrooms
--              desde tipologia cuando se inserta o actualiza una unidad

-- Función para extraer número de dormitorios de la tipología
CREATE OR REPLACE FUNCTION extract_bedrooms_from_tipologia(tipologia TEXT)
RETURNS INTEGER AS $$
BEGIN
  IF tipologia IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Estudio/Studio = 0 dormitorios
  IF LOWER(tipologia) LIKE '%estudio%' OR LOWER(tipologia) LIKE '%studio%' THEN
    RETURN 0;
  END IF;
  
  -- Extraer número de formato XD (ej: "1D1B" -> 1, "2D2B" -> 2)
  IF tipologia ~ '^(\d+)D' THEN
    RETURN (regexp_match(tipologia, '^(\d+)D'))[1]::INTEGER;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para extraer número de baños de la tipología
CREATE OR REPLACE FUNCTION extract_bathrooms_from_tipologia(tipologia TEXT)
RETURNS INTEGER AS $$
BEGIN
  IF tipologia IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Extraer número de formato XB (ej: "1D1B" -> 1, "2D2B" -> 2)
  IF tipologia ~ '(\d+)B$' THEN
    RETURN (regexp_match(tipologia, '(\d+)B$'))[1]::INTEGER;
  END IF;
  
  -- Fallback: buscar patrones alternativos
  IF LOWER(tipologia) LIKE '%1b%' THEN
    RETURN 1;
  END IF;
  IF LOWER(tipologia) LIKE '%2b%' THEN
    RETURN 2;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función trigger que calcula bedrooms y bathrooms automáticamente
CREATE OR REPLACE FUNCTION auto_calculate_bedrooms_bathrooms()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo calcular si bedrooms o bathrooms son NULL o si tipologia cambió
  -- Esto permite sobrescribir manualmente si es necesario
  IF NEW.bedrooms IS NULL OR (OLD.tipologia IS DISTINCT FROM NEW.tipologia AND NEW.bedrooms IS NULL) THEN
    NEW.bedrooms := extract_bedrooms_from_tipologia(NEW.tipologia);
  END IF;
  
  IF NEW.bathrooms IS NULL OR (OLD.tipologia IS DISTINCT FROM NEW.tipologia AND NEW.bathrooms IS NULL) THEN
    NEW.bathrooms := extract_bathrooms_from_tipologia(NEW.tipologia);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger que se ejecuta antes de INSERT o UPDATE
DROP TRIGGER IF EXISTS trigger_auto_calculate_bedrooms_bathrooms ON public.units;
CREATE TRIGGER trigger_auto_calculate_bedrooms_bathrooms
  BEFORE INSERT OR UPDATE OF tipologia, bedrooms, bathrooms ON public.units
  FOR EACH ROW
  EXECUTE FUNCTION auto_calculate_bedrooms_bathrooms();

-- Actualizar registros existentes que tienen bedrooms o bathrooms NULL
UPDATE public.units
SET 
  bedrooms = CASE 
    WHEN bedrooms IS NULL THEN extract_bedrooms_from_tipologia(tipologia)
    ELSE bedrooms
  END,
  bathrooms = CASE 
    WHEN bathrooms IS NULL THEN extract_bathrooms_from_tipologia(tipologia)
    ELSE bathrooms
  END
WHERE bedrooms IS NULL OR bathrooms IS NULL;

-- Comentarios para documentación
COMMENT ON FUNCTION extract_bedrooms_from_tipologia(TEXT) IS 'Extrae el número de dormitorios de una tipología (ej: "1D1B" -> 1, "Studio" -> 0)';
COMMENT ON FUNCTION extract_bathrooms_from_tipologia(TEXT) IS 'Extrae el número de baños de una tipología (ej: "1D1B" -> 1, "2D2B" -> 2)';
COMMENT ON FUNCTION auto_calculate_bedrooms_bathrooms() IS 'Trigger function que calcula automáticamente bedrooms y bathrooms desde tipologia';
COMMENT ON TRIGGER trigger_auto_calculate_bedrooms_bathrooms ON public.units IS 'Trigger que calcula automáticamente bedrooms y bathrooms cuando se inserta o actualiza una unidad';

