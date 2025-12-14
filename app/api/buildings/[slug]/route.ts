import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseProcessor } from "@/lib/supabase-data-processor";
import { createRateLimiter } from "@lib/rate-limit";
import { logger } from "@lib/logger";
import type { UnitDetailResponse } from "@/schemas/models";

const ParamsSchema = z.object({ slug: z.string().min(1) });

// Rate limiter: 20 requests per minute per IP
const rateLimiter = createRateLimiter({ windowMs: 60_000, max: 20 });

/**
 * GET /api/buildings/[slug]
 * 
 * Retorna una unidad específica por slug según especificación MVP.
 * El slug identifica la unidad (no el edificio).
 * 
 * ⚠️ IMPORTANTE: El slug identifica una unidad específica, no un edificio.
 * 
 * Response:
 * {
 *   unit: Unit,
 *   building: Building,  // Contexto del edificio
 *   similarUnits?: Unit[]  // Unidades similares (opcional, hasta 6)
 * }
 * 
 * Test curl:
 * curl "http://localhost:3000/api/buildings/departamento-estudio-providencia-123"
 */
export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    // Rate limiting check
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "unknown";
    const rateLimitResult = await rateLimiter.check(ip);
    
    if (!rateLimitResult.ok) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retryAfter: rateLimitResult.retryAfter },
        { 
          status: 429,
          headers: {
            "Retry-After": rateLimitResult.retryAfter?.toString() || "60",
            "X-RateLimit-Limit": "20",
            "X-RateLimit-Window": "60"
          }
        }
      );
    }

    // Validar parámetros con Zod
    const params = await context.params;
    const parsed = ParamsSchema.safeParse(params);
    if (!parsed.success) {
      logger.warn('Validación fallida en API buildings/[slug]:', parsed.error.errors);
      return NextResponse.json(
        { 
          error: "Parámetros inválidos",
          details: parsed.error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    const { slug } = parsed.data;

    // Obtener unidad por slug usando el processor
    const processor = await getSupabaseProcessor();
    const result = await processor.getUnitBySlug(slug);

    if (!result) {
      // Log para debugging (sin exponer slug completo si contiene info sensible)
      logger.warn(`Unidad no encontrada para slug: ${slug.substring(0, 20)}...`);
      return NextResponse.json(
        { error: "Unidad no encontrada" },
        { status: 404 }
      );
    }

    // Log sin PII (solo confirmación de éxito)
    logger.log(`API buildings/[slug]: Unidad encontrada (ID: ${result.unit.id.substring(0, 8)}...)`);

    return NextResponse.json({
      unit: result.unit,
      building: result.building,
      ...(result.similarUnits && result.similarUnits.length > 0 && { similarUnits: result.similarUnits }),
    });
  } catch (error) {
    logger.error('Error en API buildings/[slug]:', error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}


