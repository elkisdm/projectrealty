import { NextRequest, NextResponse } from "next/server";
import { LANDING_BUILDINGS_MOCK } from "@/lib/arrienda-sin-comision-mocks";
import { createRateLimiter } from "@lib/rate-limit";

// Rate limiter: 20 requests per minute per IP
const rateLimiter = createRateLimiter({ windowMs: 60_000, max: 20 });

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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    // Usar solo los datos mock de Home Amengual
    const buildings = LANDING_BUILDINGS_MOCK;
    const total = buildings.length;

    return NextResponse.json({
      success: true,
      buildings,
      pagination: {
        page,
        limit,
        total,
        hasMore: false, // Solo tenemos 1 edificio
        totalPages: 1
      }
    });

  } catch (error) {
    console.error("Error en API arrienda-sin-comision:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Error interno del servidor",
        buildings: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          hasMore: false,
          totalPages: 0
        }
      },
      { status: 500 }
    );
  }
}
