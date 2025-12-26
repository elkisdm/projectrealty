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
 * - comuna?: string | string[] - Filtro por comuna (soporta multiselección con comas)
 * - precioMin?: number - Precio mínimo
 * - precioMax?: number - Precio máximo
 * - dormitorios?: number | string | string[] - Cantidad de dormitorios ("Estudio", "1", "2", "3" o número, soporta multiselección con comas)
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
    
    // Manejar dormitorios que puede ser string, array de strings, o número
    const dormitoriosParam = searchParams.get('dormitorios');
    let dormitorios: string | string[] | number | undefined = undefined;
    
    if (dormitoriosParam && dormitoriosParam.trim()) {
      const trimmed = dormitoriosParam.trim();
      // Si contiene comas, es un array
      if (trimmed.includes(',')) {
        const parts = trimmed.split(',').map(d => d.trim()).filter(d => d.length > 0);
        dormitorios = parts.length > 0 ? parts : undefined;
      } else {
        // Intentar parsear como número solo si es puramente numérico
        const parsed = parseInt(trimmed, 10);
        // Solo usar el número si el string original es exactamente el número parseado
        // Esto evita que "Estudio" se convierta en NaN
        if (!isNaN(parsed) && trimmed === parsed.toString()) {
          dormitorios = parsed;
        } else {
          // Es un string como "Estudio", "1", "2", "3"
          dormitorios = trimmed;
        }
      }
    }
    
    // Manejar comuna: puede ser string o array (comma-separated)
    const comunaParam = searchParams.get('comuna');
    let comuna: string | string[] | undefined = undefined;
    if (comunaParam && comunaParam.trim()) {
      const trimmed = comunaParam.trim();
      if (trimmed.includes(',')) {
        const parts = trimmed.split(',').map(c => c.trim()).filter(c => c.length > 0);
        comuna = parts.length > 0 ? parts : undefined;
      } else {
        comuna = trimmed;
      }
    }
    
    const queryParams = {
      q: searchParams.get('q')?.trim() || undefined,
      comuna,
      precioMin: searchParams.get('precioMin') ? parseInt(searchParams.get('precioMin') || '0', 10) : undefined,
      precioMax: searchParams.get('precioMax') ? parseInt(searchParams.get('precioMax') || '0', 10) : undefined,
      dormitorios,
      page: searchParams.get('page') ? parseInt(searchParams.get('page') || '1', 10) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit') || '12', 10) : undefined,
    };

    // Validar con Zod
    const validation = SearchFiltersSchema.safeParse(queryParams);
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
    const processor = await getSupabaseProcessor();
    const result = await processor.getUnits({
      comuna: filters.comuna,
      precioMin: filters.precioMin,
      precioMax: filters.precioMax,
      dormitorios: filters.dormitorios,
      q: filters.q,
    }, page, limit);

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
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}