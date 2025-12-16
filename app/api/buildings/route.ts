import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseProcessor } from '@/lib/supabase-data-processor';
import { createRateLimiter } from '@lib/rate-limit';
import { logger } from '@lib/logger';
import { SearchFiltersSchema, type BuildingsResponse } from '@/schemas/models';

// Rate limiter: 20 requests per minute per IP
const rateLimiter = createRateLimiter({ windowMs: 60_000, max: 60 });

/**
 * GET /api/buildings
 * 
 * Retorna unidades (no edificios) con filtros y paginación según especificación MVP.
 * 
 * Query params:
 * - q?: string - Búsqueda por texto
 * - comuna?: string - Filtro por comuna
 * - precioMin?: number - Precio mínimo
 * - precioMax?: number - Precio máximo
 * - dormitorios?: number - Cantidad de dormitorios
 * - page?: number - Página (default: 1)
 * - limit?: number - Límite por página (default: 12, max: 100)
 * 
 * ⚠️ IMPORTANTE: banos NO se filtra según especificación MVP
 * 
 * Response:
 * {
 *   units: Unit[],
 *   total: number,
 *   hasMore: boolean,
 *   page: number,
 *   limit: number
 * }
 * 
 * Test curl:
 * curl "http://localhost:3000/api/buildings?comuna=Providencia&precioMin=500000&precioMax=1000000&dormitorios=2&page=1&limit=12"
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting check
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    const rateLimitResult = await rateLimiter.check(ip);
    
    if (!rateLimitResult.ok) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: rateLimitResult.retryAfter },
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Window': '60'
          }
        }
      );
    }

    // Obtener y validar query params con Zod
    const { searchParams } = new URL(request.url);
    
    // Comuna: soporta múltiples valores (separados por coma o múltiples parámetros)
    const comunaParam = searchParams.get('comuna');
    let comuna: string | string[] | undefined = undefined;
    if (comunaParam) {
      // Si viene separado por comas, dividir en array
      if (comunaParam.includes(',')) {
        comuna = comunaParam.split(',').map(c => c.trim()).filter(c => c.length > 0);
      } else {
        comuna = comunaParam;
      }
    }
    
    // Dormitorios: soporta múltiples valores (separados por coma)
    const dormitoriosParam = searchParams.get('dormitorios');
    let dormitorios: string | string[] | undefined = undefined;
    if (dormitoriosParam) {
      // Si viene separado por comas, dividir en array
      if (dormitoriosParam.includes(',')) {
        dormitorios = dormitoriosParam.split(',').map(d => d.trim()).filter(d => d.length > 0);
      } else {
        dormitorios = dormitoriosParam;
      }
    }
    
    // Convertir booleanos
    const estacionamientoParam = searchParams.get('estacionamiento');
    const estacionamiento = estacionamientoParam === 'true' ? true : estacionamientoParam === 'false' ? false : undefined;
    
    const bodegaParam = searchParams.get('bodega');
    const bodega = bodegaParam === 'true' ? true : bodegaParam === 'false' ? false : undefined;
    
    const mascotasParam = searchParams.get('mascotas');
    const mascotas = mascotasParam === 'true' ? true : mascotasParam === 'false' ? false : undefined;
    
    const precioMinParam = searchParams.get('precioMin');
    const precioMaxParam = searchParams.get('precioMax');
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    
    const queryParams = {
      q: searchParams.get('q') || undefined,
      comuna,
      precioMin: precioMinParam ? (() => {
        const parsed = parseInt(precioMinParam, 10);
        return isNaN(parsed) ? undefined : parsed;
      })() : undefined,
      precioMax: precioMaxParam ? (() => {
        const parsed = parseInt(precioMaxParam, 10);
        return isNaN(parsed) ? undefined : parsed;
      })() : undefined,
      dormitorios,
      estacionamiento,
      bodega,
      mascotas,
      page: pageParam ? (() => {
        const parsed = parseInt(pageParam, 10);
        return isNaN(parsed) ? undefined : parsed;
      })() : undefined,
      limit: limitParam ? (() => {
        const parsed = parseInt(limitParam, 10);
        return isNaN(parsed) ? undefined : parsed;
      })() : undefined,
    };

    // Validar con Zod
    // eslint-disable-next-line no-console -- Debug en tests
    if (process.env.NODE_ENV === 'test') {
      console.log('Query params before validation:', JSON.stringify(queryParams, null, 2));
    }
    const validation = SearchFiltersSchema.safeParse(queryParams);
    // eslint-disable-next-line no-console -- Debug en tests
    if (process.env.NODE_ENV === 'test') {
      console.log('Validation result:', validation.success, validation.error?.errors);
    }
    if (!validation.success) {
      logger.warn('Validación fallida en API buildings:', validation.error.errors);
      return NextResponse.json(
        { 
          error: 'Parámetros inválidos',
          details: validation.error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    const filters = validation.data;
    const page = filters.page || 1;
    const limit = filters.limit || 12;

    // Obtener unidades usando el processor
    let processor;
    try {
      processor = await getSupabaseProcessor();
    } catch (error) {
      // eslint-disable-next-line no-console -- Debug en tests
      if (process.env.NODE_ENV === 'test') {
        console.error('Error getting processor:', error);
      }
      throw error;
    }
    
    if (!processor || typeof processor.getUnits !== 'function') {
      const errorMsg = `Processor invalid: ${typeof processor}, getUnits: ${typeof processor?.getUnits}`;
      // eslint-disable-next-line no-console -- Debug en tests
      if (process.env.NODE_ENV === 'test') {
        console.error(errorMsg);
      }
      throw new Error(errorMsg);
    }
    
    const result = await processor.getUnits({
      comuna: filters.comuna,
      precioMin: filters.precioMin,
      precioMax: filters.precioMax,
      dormitorios: filters.dormitorios,
      q: filters.q,
    }, page, limit);

    // Validar que result tiene la estructura esperada
    if (!result || !result.units || !Array.isArray(result.units)) {
      const errorMsg = `Invalid result from getUnits: ${JSON.stringify(result)}`;
      // eslint-disable-next-line no-console -- Debug en tests
      if (process.env.NODE_ENV === 'test') {
        console.error(errorMsg);
      }
      throw new Error(errorMsg);
    }

    // Log sin PII (solo conteos y filtros, no datos de usuarios)
    logger.log(`API buildings: ${result.units.length} unidades encontradas de ${result.total} total (página ${page})`);

    const response: BuildingsResponse = {
      units: result.units,
      total: result.total,
      hasMore: result.hasMore,
      page,
      limit
    };

    return NextResponse.json(response);
    
  } catch (error) {
    logger.error('Error en API buildings:', error);
    // En desarrollo, incluir detalles del error para debugging
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    // eslint-disable-next-line no-console -- Debug en tests
    if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
      console.error('API buildings error:', errorMessage);
      console.error('Stack:', errorStack);
    }
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        ...((process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') && { details: errorMessage, stack: errorStack })
      },
      { status: 500 }
    );
  }
}