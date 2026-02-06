-- Terminaciones y equipamiento del Condominio Parque Mackenna
-- Los datos viven en la tabla public.buildings, columnas terminaciones (TEXT[]) y equipamiento (TEXT[]).
-- Se muestran en la ficha de la propiedad, pestaña "Características" (PropertyAmenitiesTab).
--
-- Ejecutar en Supabase SQL Editor después de la migración 20250206_add_building_terminaciones_equipamiento.sql

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
   OR slug = 'bld-condominio-parque-mackenna';

-- Verificar
SELECT id, name, terminaciones, equipamiento
FROM public.buildings
WHERE id = 'bld-condominio-parque-mackenna';
