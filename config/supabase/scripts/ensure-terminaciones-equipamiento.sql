-- Configurar terminaciones y equipamiento (si no existen columnas o datos)
-- Ejecutar en Supabase SQL Editor. Es idempotente: se puede correr varias veces.

-- 1) Crear columnas si no existen
ALTER TABLE public.buildings
  ADD COLUMN IF NOT EXISTS terminaciones TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS equipamiento TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.buildings.terminaciones IS 'Lista de terminaciones del edificio (ej: Pisos flotantes, Ventanas DVH)';
COMMENT ON COLUMN public.buildings.equipamiento IS 'Lista de equipamiento del edificio (ej: Calefacción central, Agua caliente central)';

-- 2) Configurar datos para Condominio Parque Mackenna (por id o slug)
UPDATE public.buildings
SET
  terminaciones = ARRAY[
    'Ventanas: Termopanel en PVC',
    'Agua caliente: Termo eléctrico',
    'Cocina: Encimera vitrocerámica, cubierta de cuarzo',
    'Pisos cocina: Porcelanato / cerámica',
    'Pisos baños: Porcelanato',
    'Pisos estar: Porcelanato',
    'Pisos dormitorios: Porcelanato',
    'Baños: Cubierta porcelánica',
    'Terraza: Vidriada',
    'Chapa: Normal',
    'Conexión lavadora: Puede variar (Sí para unidad 305-C)',
    'Alarma: Sí'
  ],
  equipamiento = ARRAY[
    'Encimera vitrocerámica',
    'Campana',
    'Porta TV',
    'Horno eléctrico'
  ]
WHERE id = 'bld-condominio-parque-mackenna'
   OR slug = 'bld-condominio-parque-mackenna'
   OR slug = 'condominio-parque-mackenna';

-- 3) Verificar
SELECT id, name, slug,
       array_length(terminaciones, 1) AS num_terminaciones,
       array_length(equipamiento, 1) AS num_equipamiento,
       terminaciones,
       equipamiento
FROM public.buildings
WHERE id = 'bld-condominio-parque-mackenna'
   OR slug IN ('bld-condominio-parque-mackenna', 'condominio-parque-mackenna');
