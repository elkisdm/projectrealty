import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createRateLimiter } from "@lib/rate-limit";
import { readAll } from "@lib/data";
import { createUnit } from "@lib/admin/data";
import { UnitSchema } from "@schemas/models";
import type { Unit } from "@schemas/models";

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
  buildingId: z.string().optional(),
  tipologia: z.string().optional(),
  disponible: z
    .string()
    .optional()
    .transform((val) => (val === "true" ? true : val === "false" ? false : undefined)),
  minPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  maxPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
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
      buildingId: searchParams.get("buildingId"),
      tipologia: searchParams.get("tipologia"),
      disponible: searchParams.get("disponible"),
      minPrice: searchParams.get("minPrice"),
      maxPrice: searchParams.get("maxPrice"),
    });

    // Obtener todos los edificios y extraer unidades
    const buildings = await readAll();
    let units: Array<Unit & { buildingId: string; buildingName: string }> = [];

    buildings.forEach((building) => {
      building.units.forEach((unit) => {
        units.push({
          ...unit,
          buildingId: building.id,
          buildingName: building.name,
        });
      });
    });

    // Aplicar filtros
    if (query.search) {
      const searchLower = String(query.search).toLowerCase();
      units = units.filter(
        (u) =>
          u.tipologia.toLowerCase().includes(searchLower) ||
          u.buildingName.toLowerCase().includes(searchLower)
      );
    }

    if (query.buildingId) {
      units = units.filter((u) => u.buildingId === query.buildingId);
    }

    if (query.tipologia) {
      const tipologiaFilter = String(query.tipologia);
      units = units.filter(
        (u) => u.tipologia.toLowerCase() === tipologiaFilter.toLowerCase()
      );
    }

    if (query.disponible !== undefined) {
      units = units.filter((u) => u.disponible === query.disponible);
    }

    if (query.minPrice !== undefined) {
      units = units.filter((u) => u.price >= query.minPrice!);
    }

    if (query.maxPrice !== undefined) {
      units = units.filter((u) => u.price <= query.maxPrice!);
    }

    // Paginación
    const total = units.length;
    const totalPages = Math.ceil(total / query.limit);
    const startIndex = (query.page - 1) * query.limit;
    const endIndex = startIndex + query.limit;
    const paginatedUnits = units.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedUnits,
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
    const { buildingId, ...unitData } = body;

    if (!buildingId || typeof buildingId !== "string") {
      return NextResponse.json(
        {
          error: "validation_error",
          message: "buildingId es requerido",
        },
        { status: 400 }
      );
    }

    const validation = UnitSchema.safeParse(unitData);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "validation_error",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    // Crear unidad
    const unit = await createUnit(validation.data, buildingId);

    return NextResponse.json(
      {
        success: true,
        data: unit,
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

