import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { createRateLimiter } from '@lib/rate-limit';
import { logger } from '@lib/logger';
import { z } from 'zod';

// Rate limiter: 30 requests per minute per IP (más permisivo para búsquedas)
const rateLimiter = createRateLimiter({ windowMs: 60_000, max: 30 });

// Schema de validación para logs de búsqueda
const SearchLogSchema = z.object({
  query_text: z.string().max(200).optional(),
  filters: z.object({
    comuna: z.string().optional(),
    dormitorios: z.string().optional(),
    precioMin: z.number().optional(),
    precioMax: z.number().optional(),
    estacionamiento: z.boolean().optional(),
    bodega: z.boolean().optional(),
    mascotas: z.boolean().optional(),
  }).optional(),
  results_count: z.number().int().nonnegative().default(0),
});

/**
 * POST /api/search-logs
 * 
 * Registra búsquedas de usuarios en la base de datos para análisis.
 * No almacena PII (Personally Identifiable Information).
 * 
 * Body:
 * {
 *   query_text?: string - Texto de búsqueda
 *   filters?: object - Filtros aplicados
 *   results_count: number - Cantidad de resultados encontrados
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   id: string (UUID del log creado)
 * }
 */
export async function POST(request: NextRequest) {
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
            'X-RateLimit-Limit': '30',
            'X-RateLimit-Window': '60'
          }
        }
      );
    }

    // Validar body con Zod
    const body = await request.json();
    const validation = SearchLogSchema.safeParse(body);
    
    if (!validation.success) {
      logger.warn('Validación fallida en search-logs:', validation.error.errors);
      return NextResponse.json(
        { 
          error: 'Datos inválidos',
          details: validation.error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    const searchData = validation.data;

    // Hashear IP para análisis agregado (no PII)
    const ipHash = createHash('sha256').update(ip).digest('hex').substring(0, 16);
    
    // Obtener user agent (sin información personal)
    const userAgent = request.headers.get('user-agent') || undefined;

    // Insertar en Supabase usando cliente admin para asegurar permisos
    const { supabaseAdmin } = await import('@lib/supabase');
    const { data, error } = await supabaseAdmin
      .from('search_logs')
      .insert({
        query_text: searchData.query_text || null,
        filters: searchData.filters || {},
        results_count: searchData.results_count,
        ip_hash: ipHash,
        user_agent: userAgent,
      })
      .select('id')
      .single();

    if (error) {
      logger.error('Error insertando search log:', error);
      // No exponer detalles del error al cliente
      return NextResponse.json(
        { error: 'Error interno del servidor' },
        { status: 500 }
      );
    }

    // Log sin PII
    logger.log(`Search log registrado: ${data.id}`, {
      results_count: searchData.results_count,
      has_query: !!searchData.query_text,
      filters_count: Object.keys(searchData.filters || {}).length,
    });

    return NextResponse.json({
      success: true,
      id: data.id,
    }, { status: 201 });

  } catch (error) {
    logger.error('Error en API search-logs:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET para verificar que el endpoint funciona (solo para desarrollo)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Search logs endpoint',
    method: 'POST',
    description: 'Registra búsquedas de usuarios para análisis',
  });
}

