-- =============================================================================
-- Seed: Condominio Parque Mackenna + Unidad 305
-- Ejecutar en Supabase SQL Editor o con: psql ... -f seed-parque-mackenna.sql
-- =============================================================================
-- Nota: Si tu tabla buildings usa columnas "nombre" y "direccion" en vez de
-- "name" y "address", cambia esos nombres en el INSERT de buildings.
-- =============================================================================

-- 1) Edificio / Condominio
INSERT INTO public.buildings (
  id,
  slug,
  name,
  comuna,
  address,
  amenities,
  gallery,
  cover_image,
  badges,
  service_level
) VALUES (
  'bld-condominio-parque-mackenna',
  'condominio-parque-mackenna',
  'Condominio Parque Mackenna',
  'Macul',
  'Vicuña Mackenna 4192',
  ARRAY[
    'Accesos controlados y conserjería',
    'Ascensores',
    'Estacionamiento subterráneo y de visitas',
    'Bicicletero y bodega',
    'Piscina, gimnasio y lavandería',
    'Quinchos, sala de cine, sala de internet',
    'Salón de reuniones, lounge y sauna',
    'Terraza panorámica',
    'Áreas verdes, jardines y juegos infantiles',
    'Circuito cerrado de TV y portón eléctrico',
    'Excelente conectividad y transporte urbano cercano'
  ],
  ARRAY['/images/parque-mackenna.jpg'],
  NULL,
  '[]'::jsonb,
  NULL
)
ON CONFLICT (id) DO NOTHING;

-- 2) Unidad 305 (imágenes en public/images/parque-mackenna-305/)
INSERT INTO public.units (
  id,
  building_id,
  tipologia,
  m2,
  price,
  estacionamiento,
  bodega,
  disponible,
  bedrooms,
  bathrooms,
  images
) VALUES (
  'bld-condominio-parque-mackenna-305',
  'bld-condominio-parque-mackenna',
  '1D1B',
  30,
  410000,
  true,
  true,
  true,
  1,
  1,
  ARRAY[
    '/images/parque-mackenna-305/IMG_4922.jpg',
    '/images/parque-mackenna-305/IMG_4923.jpg',
    '/images/parque-mackenna-305/IMG_4924.jpg',
    '/images/parque-mackenna-305/IMG_4925.jpg',
    '/images/parque-mackenna-305/IMG_4926.jpg',
    '/images/parque-mackenna-305/IMG_4927.jpg',
    '/images/parque-mackenna-305/IMG_4928.jpg',
    '/images/parque-mackenna-305/IMG_4929.jpg',
    '/images/parque-mackenna-305/IMG_4930.jpg',
    '/images/parque-mackenna-305/IMG_4931.jpg',
    '/images/parque-mackenna-305/IMG_4932.jpg',
    '/images/parque-mackenna-305/IMG_4934.jpg'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- 3) Si la unidad 305 ya existía sin imágenes, actualizar con las URLs
UPDATE public.units
SET images = ARRAY[
  '/images/parque-mackenna-305/IMG_4922.jpg',
  '/images/parque-mackenna-305/IMG_4923.jpg',
  '/images/parque-mackenna-305/IMG_4924.jpg',
  '/images/parque-mackenna-305/IMG_4925.jpg',
  '/images/parque-mackenna-305/IMG_4926.jpg',
  '/images/parque-mackenna-305/IMG_4927.jpg',
  '/images/parque-mackenna-305/IMG_4928.jpg',
  '/images/parque-mackenna-305/IMG_4929.jpg',
  '/images/parque-mackenna-305/IMG_4930.jpg',
  '/images/parque-mackenna-305/IMG_4931.jpg',
  '/images/parque-mackenna-305/IMG_4932.jpg',
  '/images/parque-mackenna-305/IMG_4934.jpg'
]
WHERE id = 'bld-condominio-parque-mackenna-305';

-- =============================================================================
-- Imágenes copiadas a: public/images/parque-mackenna-305/ (12 JPG; HEIC excluido)
-- Si tu esquema tiene columnas extra (gastos_comunes, piso, amoblado, etc.),
-- añade aquí o en una migración. El schema base solo tiene las columnas arriba.
-- =============================================================================
