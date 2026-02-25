import { NextRequest, NextResponse } from 'next/server';
import { getNearbyAmenitiesByBuildingId } from '@/lib/api/nearby-amenities';
import { isSupabaseConfigured } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const BuildingIdSchema = z.object({
  buildingId: z.string().min(1),
});

/**
 * GET /api/nearby-amenities?buildingId=xxx
 * Obtiene las amenidades cercanas agrupadas por categoría para un edificio
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const buildingId = searchParams.get('buildingId');

    if (!buildingId) {
      return NextResponse.json(
        { error: 'buildingId es requerido' },
        { status: 400 }
      );
    }

    // Validar buildingId
    const validation = BuildingIdSchema.safeParse({ buildingId });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'buildingId inválido', details: validation.error.errors },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured) {
      logger.warn('[API /nearby-amenities] SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configurados; no se puede consultar building_nearby_amenities');
      return NextResponse.json(
        { data: null, message: 'No se encontraron amenidades para este edificio' },
        { status: 200 }
      );
    }

    // Obtener amenidades (si falla la tabla/query, devolver 200 con data null para no romper la UI)
    let amenities = null;
    try {
      amenities = await getNearbyAmenitiesByBuildingId(buildingId);
    } catch (err) {
      logger.error('[API /nearby-amenities] Error fetching amenities:', err);
      return NextResponse.json(
        { data: null, message: 'No se encontraron amenidades para este edificio' },
        { status: 200 }
      );
    }

    if (!amenities) {
      return NextResponse.json(
        { data: null, message: 'No se encontraron amenidades para este edificio' },
        { status: 200 }
      );
    }

    return NextResponse.json({ data: amenities }, { status: 200 });
  } catch (error) {
    logger.error('[API /nearby-amenities] Error:', error);
    return NextResponse.json(
      { data: null, message: 'No se encontraron amenidades para este edificio' },
      { status: 200 }
    );
  }
}
