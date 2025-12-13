import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter } from "@lib/rate-limit";
import { logger } from "@lib/logger";

// Rate limiter: 20 requests per minute per IP
const rateLimiter = createRateLimiter({ windowMs: 60_000, max: 20 });

// Simulación de base de datos en memoria (en producción usar Supabase/DB)
let cuposDisponibles = 10;

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

    return NextResponse.json({
      cuposDisponibles,
      total: 10,
      porcentaje: Math.round((cuposDisponibles / 10) * 100),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Error obteniendo cupos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

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
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Window': '60'
          }
        }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === "decrementar" && cuposDisponibles > 0) {
      cuposDisponibles--;
      
      return NextResponse.json({
        success: true,
        cuposDisponibles,
        total: 10,
        porcentaje: Math.round((cuposDisponibles / 10) * 100),
        timestamp: new Date().toISOString(),
      });
    }

    if (action === "reset") {
      cuposDisponibles = 10;
      
      return NextResponse.json({
        success: true,
        cuposDisponibles,
        total: 10,
        porcentaje: 100,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { error: "Acción no válida" },
      { status: 400 }
    );
  } catch (error) {
    logger.error("Error actualizando cupos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}


