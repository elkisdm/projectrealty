import { NextRequest, NextResponse } from 'next/server';
import { getNearbyAmenitiesByBuildingId } from '@/lib/api/nearby-amenities';
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

    // Obtener amenidades
    const amenities = await getNearbyAmenitiesByBuildingId(buildingId);

    if (!amenities) {
      return NextResponse.json(
        { data: null, message: 'No se encontraron amenidades para este edificio' },
        { status: 200 }
      );
    }

    return NextResponse.json({ data: amenities }, { status: 200 });
  } catch (error) {
    logger.error('[API /nearby-amenities] Error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Error al obtener amenidades', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
