import { supabaseAdmin } from '@/lib/supabase';
import { NearbyAmenitySchema, type NearbyAmenity } from '@/schemas/models';
import { logger } from '@/lib/logger';

/**
 * Estructura de datos agrupados por categoría y subcategoría
 */
export interface GroupedAmenities {
  transporte: {
    metro: NearbyAmenity[];
    paraderos: NearbyAmenity[];
  };
  educacion: {
    jardines_infantiles: NearbyAmenity[];
    colegios: NearbyAmenity[];
    universidades: NearbyAmenity[];
  };
  areas_verdes: {
    plazas: NearbyAmenity[];
  };
  comercios: {
    farmacias: NearbyAmenity[];
  };
  salud: {
    clinicas: NearbyAmenity[];
  };
}

/**
 * Obtiene las amenidades cercanas agrupadas por categoría y subcategoría
 * @param buildingId - ID del edificio
 * @returns Datos agrupados por categoría/subcategoría o null si no hay datos
 */
export async function getNearbyAmenitiesByBuildingId(
  buildingId: string
): Promise<GroupedAmenities | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('building_nearby_amenities')
      .select('*')
      .eq('building_id', buildingId)
      .order('category')
      .order('subcategory')
      .order('display_order');

    if (error) {
      const code = error && typeof error === 'object' && 'code' in error ? String((error as { code?: string }).code) : '';
      if (code === '42P01') {
        logger.warn(
          '[getNearbyAmenitiesByBuildingId] Tabla building_nearby_amenities no existe. ' +
          'Ejecutar config/supabase/migration-nearby-amenities.sql en Supabase y luego seed-parque-mackenna-amenities.sql si aplica.'
        );
      }
      logger.error('[getNearbyAmenitiesByBuildingId] Error fetching amenities:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      logger.log(`[getNearbyAmenitiesByBuildingId] No amenities found for building ${buildingId}`);
      return null;
    }

    // Validar y transformar datos
    const amenities: NearbyAmenity[] = [];
    for (const row of data) {
      try {
        const amenity = NearbyAmenitySchema.parse({
          id: row.id,
          buildingId: row.building_id,
          category: row.category,
          subcategory: row.subcategory || undefined,
          name: row.name,
          walkingTimeMinutes: row.walking_time_minutes,
          distanceMeters: row.distance_meters,
          icon: row.icon || undefined,
          metadata: row.metadata || undefined,
          displayOrder: row.display_order || 0,
        });
        amenities.push(amenity);
      } catch (parseError) {
        logger.warn('[getNearbyAmenitiesByBuildingId] Skipping invalid amenity:', {
          id: row.id,
          error: parseError,
        });
      }
    }

    // Agrupar por categoría y subcategoría
    const grouped: GroupedAmenities = {
      transporte: {
        metro: [],
        paraderos: [],
      },
      educacion: {
        jardines_infantiles: [],
        colegios: [],
        universidades: [],
      },
      areas_verdes: {
        plazas: [],
      },
      comercios: {
        farmacias: [],
      },
      salud: {
        clinicas: [],
      },
    };

    for (const amenity of amenities) {
      const category = amenity.category;
      const subcategory = amenity.subcategory;

      if (category === 'transporte') {
        if (subcategory === 'metro') {
          grouped.transporte.metro.push(amenity);
        } else if (subcategory === 'paraderos') {
          grouped.transporte.paraderos.push(amenity);
        }
      } else if (category === 'educacion') {
        if (subcategory === 'jardines_infantiles') {
          grouped.educacion.jardines_infantiles.push(amenity);
        } else if (subcategory === 'colegios') {
          grouped.educacion.colegios.push(amenity);
        } else if (subcategory === 'universidades') {
          grouped.educacion.universidades.push(amenity);
        }
      } else if (category === 'areas_verdes') {
        if (subcategory === 'plazas') {
          grouped.areas_verdes.plazas.push(amenity);
        }
      } else if (category === 'comercios') {
        if (subcategory === 'farmacias') {
          grouped.comercios.farmacias.push(amenity);
        }
      } else if (category === 'salud') {
        if (subcategory === 'clinicas') {
          grouped.salud.clinicas.push(amenity);
        }
      }
    }

    // Verificar que haya al menos una categoría con datos
    const hasData =
      grouped.transporte.metro.length > 0 ||
      grouped.transporte.paraderos.length > 0 ||
      grouped.educacion.jardines_infantiles.length > 0 ||
      grouped.educacion.colegios.length > 0 ||
      grouped.educacion.universidades.length > 0 ||
      grouped.areas_verdes.plazas.length > 0 ||
      grouped.comercios.farmacias.length > 0 ||
      grouped.salud.clinicas.length > 0;

    if (!hasData) {
      return null;
    }

    logger.log(`[getNearbyAmenitiesByBuildingId] Found ${amenities.length} amenities for building ${buildingId}`);
    return grouped;
  } catch (error) {
    logger.error('[getNearbyAmenitiesByBuildingId] Error:', error);
    throw error;
  }
}
