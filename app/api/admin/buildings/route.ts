import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createRateLimiter } from "@lib/rate-limit";
import { getAdminBuildingsOptimized } from "@lib/admin/data-optimized";
import { createBuilding } from "@lib/admin/data";
import { BuildingSchema } from "@schemas/models";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Rate limiting for admin endpoints
const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });

// Schema para query params de filtrado
const QuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 50)),
  search: z.string().optional(),
  comuna: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ipHeader = request.headers.get("x-forwarded-for");
    const ip = ipHeader ? ipHeader.split(",")[0].trim() : "unknown";

    const rateLimitResult = await limiter.check(ip);
    if (!rateLimitResult.ok) {
      return NextResponse.json(
        { error: "rate_limited" },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimitResult.retryAfter ?? 60) },
        }
      );
    }

    // Parsear query params
    const searchParams = request.nextUrl.searchParams;
    const query = QuerySchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search"),
      comuna: searchParams.get("comuna"),
    });

    // Obtener edificios con filtrado optimizado a nivel de base de datos
    const { buildings: paginatedBuildings, total } = await getAdminBuildingsOptimized({
      page: query.page,
      limit: query.limit,
      search: query.search,
      comuna: query.comuna,
    });

    const totalPages = Math.ceil(total / query.limit);

    return NextResponse.json({
      success: true,
      data: paginatedBuildings,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
        hasNextPage: query.page < totalPages,
        hasPrevPage: query.page > 1,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "invalid_query", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "internal_error",
        message:
          error instanceof Error ? error.message : "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ipHeader = request.headers.get("x-forwarded-for");
    const ip = ipHeader ? ipHeader.split(",")[0].trim() : "unknown";

    const rateLimitResult = await limiter.check(ip);
    if (!rateLimitResult.ok) {
      return NextResponse.json(
        { error: "rate_limited" },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimitResult.retryAfter ?? 60) },
        }
      );
    }

    // Parsear y validar body
    const body = await request.json();
    const validation = BuildingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "validation_error",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    // Crear edificio
    const building = await createBuilding(validation.data);

    return NextResponse.json(
      {
        success: true,
        data: building,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "internal_error",
        message:
          error instanceof Error ? error.message : "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

