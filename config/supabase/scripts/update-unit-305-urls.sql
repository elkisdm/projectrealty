-- ============================================================================
-- Script SQL: Actualizar URLs de imágenes y videos para unidad 305
-- Fecha: 2025-02-06
-- Unidad: bld-condominio-parque-mackenna-305
-- Project ID: lytgdrbdyvmvziypvumy
-- ============================================================================

-- Actualizar imágenes y videos de unidad 305
UPDATE units 
SET 
  images = ARRAY[
    'https://lytgdrbdyvmvziypvumy.supabase.co/storage/v1/object/public/unit-media/bld-condominio-parque-mackenna/bld-condominio-parque-mackenna-305/images/IMG_4920.jpg',
    'https://lytgdrbdyvmvziypvumy.supabase.co/storage/v1/object/public/unit-media/bld-condominio-parque-mackenna/bld-condominio-parque-mackenna-305/images/IMG_4922.jpg',
    'https://lytgdrbdyvmvziypvumy.supabase.co/storage/v1/object/public/unit-media/bld-condominio-parque-mackenna/bld-condominio-parque-mackenna-305/images/IMG_4923.jpg',
    'https://lytgdrbdyvmvziypvumy.supabase.co/storage/v1/object/public/unit-media/bld-condominio-parque-mackenna/bld-condominio-parque-mackenna-305/images/IMG_4924.jpg',
    'https://lytgdrbdyvmvziypvumy.supabase.co/storage/v1/object/public/unit-media/bld-condominio-parque-mackenna/bld-condominio-parque-mackenna-305/images/IMG_4925.jpg',
    'https://lytgdrbdyvmvziypvumy.supabase.co/storage/v1/object/public/unit-media/bld-condominio-parque-mackenna/bld-condominio-parque-mackenna-305/images/IMG_4926.jpg',
    'https://lytgdrbdyvmvziypvumy.supabase.co/storage/v1/object/public/unit-media/bld-condominio-parque-mackenna/bld-condominio-parque-mackenna-305/images/IMG_4927.jpg',
    'https://lytgdrbdyvmvziypvumy.supabase.co/storage/v1/object/public/unit-media/bld-condominio-parque-mackenna/bld-condominio-parque-mackenna-305/images/IMG_4928.jpg',
    'https://lytgdrbdyvmvziypvumy.supabase.co/storage/v1/object/public/unit-media/bld-condominio-parque-mackenna/bld-condominio-parque-mackenna-305/images/IMG_4929.jpg',
    'https://lytgdrbdyvmvziypvumy.supabase.co/storage/v1/object/public/unit-media/bld-condominio-parque-mackenna/bld-condominio-parque-mackenna-305/images/IMG_4930.jpg',
    'https://lytgdrbdyvmvziypvumy.supabase.co/storage/v1/object/public/unit-media/bld-condominio-parque-mackenna/bld-condominio-parque-mackenna-305/images/IMG_4931.jpg',
    'https://lytgdrbdyvmvziypvumy.supabase.co/storage/v1/object/public/unit-media/bld-condominio-parque-mackenna/bld-condominio-parque-mackenna-305/images/IMG_4932.jpg',
    'https://lytgdrbdyvmvziypvumy.supabase.co/storage/v1/object/public/unit-media/bld-condominio-parque-mackenna/bld-condominio-parque-mackenna-305/images/IMG_4934.jpg'
  ],
  videos = ARRAY[
    'https://lytgdrbdyvmvziypvumy.supabase.co/storage/v1/object/public/unit-media/bld-condominio-parque-mackenna/bld-condominio-parque-mackenna-305/videos/PQMK305.mp4'
  ]
WHERE id = 'bld-condominio-parque-mackenna-305';

-- Verificar que se actualizó correctamente
SELECT 
  id,
  building_id,
  tipologia,
  gc as gasto_comun,
  array_length(images, 1) as total_images,
  array_length(videos, 1) as total_videos,
  images[1] as first_image_url,
  images[array_length(images, 1)] as last_image_url,
  videos[1] as first_video_url
FROM units
WHERE id = 'bld-condominio-parque-mackenna-305';
