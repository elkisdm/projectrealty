import { NextRequest, NextResponse } from "next/server";
import { QuotationInputSchema } from "@schemas/quotation";
import { getUnitWithBuilding } from "@lib/data";
import { computeQuotation } from "@lib/quotation";
import { createRateLimiter } from "@lib/rate-limit";
import { logger } from "@lib/logger";

// Rate limiter: 10 requests per minute per IP (same as booking)
const rateLimiter = createRateLimiter({ windowMs: 60_000, max: 10 });

export async function POST(request: NextRequest) {
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
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Window": "60"
          }
        }
      );
    }

    // Validar input con Zod
    const body = await request.json();
    const validatedInput = QuotationInputSchema.parse(body);

    // Obtener unidad y edificio
    const unitData = await getUnitWithBuilding(validatedInput.unitId);
    if (!unitData) {
      return NextResponse.json(
        { error: "Unit not found or not available" },
        { status: 404 }
      );
    }

    const { unit, building } = unitData;

    // Verificar disponibilidad
    if (!unit.disponible) {
      return NextResponse.json(
        { error: "Unit is not available for quotation" },
        { status: 400 }
      );
    }

    // Computar cotización
    const quotation = computeQuotation(
      unit,
      building,
      validatedInput.startDate,
      validatedInput.options
    );

    // Log sin PII
    logger.log(`Quotation computed for unit ${unit.id} in building ${building.id}`);

    return NextResponse.json(quotation, { status: 200 });

  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: "Invalid input data", details: error.message },
        { status: 400 }
      );
    }

    logger.error('Error computing quotation:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
