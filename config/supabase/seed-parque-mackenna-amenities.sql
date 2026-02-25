-- Insertar amenidades cercanas para Condominio Parque Mackenna
-- Building ID: bld-condominio-parque-mackenna
-- Operado por Elkis Realtor
--
-- IMPORTANTE: Ejecutar primero migration-nearby-amenities.sql para crear la tabla
-- Si la tabla ya existe, este script es seguro de ejecutar múltiples veces (usa ON CONFLICT DO NOTHING)

-- TRANSPORTE: Metro
INSERT INTO public.building_nearby_amenities (building_id, category, subcategory, name, walking_time_minutes, distance_meters, display_order)
VALUES
  ('bld-condominio-parque-mackenna', 'transporte', 'metro', 'Camino Agrícola', 2, 189, 1),
  ('bld-condominio-parque-mackenna', 'transporte', 'metro', 'Carlos Valdovinos', 10, 810, 2),
  ('bld-condominio-parque-mackenna', 'transporte', 'metro', 'San Joaquín', 10, 753, 3)
ON CONFLICT (building_id, category, subcategory, name) DO NOTHING;

-- TRANSPORTE: Paraderos
INSERT INTO public.building_nearby_amenities (building_id, category, subcategory, name, walking_time_minutes, distance_meters, display_order)
VALUES
  ('bld-condominio-parque-mackenna', 'transporte', 'paraderos', 'Vicuña Mackenna / Escuela Agricola', 2, 190, 1),
  ('bld-condominio-parque-mackenna', 'transporte', 'paraderos', '(M) Agricola', 3, 224, 2),
  ('bld-condominio-parque-mackenna', 'transporte', 'paraderos', 'Vicuña Mackenna / Presidente Salvador Allende', 5, 420, 3),
  ('bld-condominio-parque-mackenna', 'transporte', 'paraderos', 'Los Pellines / Escuela Agricola', 5, 392, 4),
  ('bld-condominio-parque-mackenna', 'transporte', 'paraderos', 'Arturo Prat / Escuela Agricola', 5, 360, 5)
ON CONFLICT (building_id, category, subcategory, name) DO NOTHING;

-- EDUCACIÓN: Jardines infantiles
INSERT INTO public.building_nearby_amenities (building_id, category, subcategory, name, walking_time_minutes, distance_meters, display_order)
VALUES
  ('bld-condominio-parque-mackenna', 'educacion', 'jardines_infantiles', 'Jardín Infantil El Pinar', 11, 867, 1),
  ('bld-condominio-parque-mackenna', 'educacion', 'jardines_infantiles', 'Escuela De Parvulos Mi Primera Aventura', 11, 880, 2),
  ('bld-condominio-parque-mackenna', 'educacion', 'jardines_infantiles', 'Casita Feliz', 12, 925, 3),
  ('bld-condominio-parque-mackenna', 'educacion', 'jardines_infantiles', 'Escuela De Parvulos La Casita Feliz', 13, 997, 4)
ON CONFLICT (building_id, category, subcategory, name) DO NOTHING;

-- EDUCACIÓN: Colegios
INSERT INTO public.building_nearby_amenities (building_id, category, subcategory, name, walking_time_minutes, distance_meters, display_order)
VALUES
  ('bld-condominio-parque-mackenna', 'educacion', 'colegios', 'Liceo Espiritu Santo', 5, 382, 1),
  ('bld-condominio-parque-mackenna', 'educacion', 'colegios', 'Liceo Industrial del Verbo Divino', 5, 419, 2),
  ('bld-condominio-parque-mackenna', 'educacion', 'colegios', 'Escuela Industrial El Pinar', 6, 462, 3),
  ('bld-condominio-parque-mackenna', 'educacion', 'colegios', 'Centro Educacional Santa Monica', 11, 855, 4),
  ('bld-condominio-parque-mackenna', 'educacion', 'colegios', 'Escuela Basica Y Especial Ciudad De Fran', 12, 971, 5)
ON CONFLICT (building_id, category, subcategory, name) DO NOTHING;

-- EDUCACIÓN: Universidades
INSERT INTO public.building_nearby_amenities (building_id, category, subcategory, name, walking_time_minutes, distance_meters, display_order)
VALUES
  ('bld-condominio-parque-mackenna', 'educacion', 'universidades', 'Inacap Santiago Sur', 4, 301, 1),
  ('bld-condominio-parque-mackenna', 'educacion', 'universidades', 'Pontificia Universidad Católica de Chile (Campus San Joaquín)', 8, 599, 2),
  ('bld-condominio-parque-mackenna', 'educacion', 'universidades', 'Universidad Técnica Federico Santa María, Campus Santiago San Joaquin', 10, 799, 3),
  ('bld-condominio-parque-mackenna', 'educacion', 'universidades', 'Facultad de Economía y Administración', 11, 836, 4)
ON CONFLICT (building_id, category, subcategory, name) DO NOTHING;

-- ÁREAS VERDES: Plazas
INSERT INTO public.building_nearby_amenities (building_id, category, subcategory, name, walking_time_minutes, distance_meters, display_order)
VALUES
  ('bld-condominio-parque-mackenna', 'areas_verdes', 'plazas', 'Paque Central Avenida Marathon', 9, 666, 1),
  ('bld-condominio-parque-mackenna', 'areas_verdes', 'plazas', 'Plaza Brunelleschi', 10, 795, 2),
  ('bld-condominio-parque-mackenna', 'areas_verdes', 'plazas', 'Plaza El Pinar', 11, 830, 3)
ON CONFLICT (building_id, category, subcategory, name) DO NOTHING;

-- COMERCIOS: Farmacias
INSERT INTO public.building_nearby_amenities (building_id, category, subcategory, name, walking_time_minutes, distance_meters, display_order)
VALUES
  ('bld-condominio-parque-mackenna', 'comercios', 'farmacias', 'Farmacias Ahumada', 2, 190, 1),
  ('bld-condominio-parque-mackenna', 'comercios', 'farmacias', 'Damyfar', 3, 246, 2)
ON CONFLICT (building_id, category, subcategory, name) DO NOTHING;

-- SALUD: Clínicas
INSERT INTO public.building_nearby_amenities (building_id, category, subcategory, name, walking_time_minutes, distance_meters, display_order)
VALUES
  ('bld-condominio-parque-mackenna', 'salud', 'clinicas', 'Centro Médico UC San Joaquín', 8, 605, 1)
ON CONFLICT (building_id, category, subcategory, name) DO NOTHING;
