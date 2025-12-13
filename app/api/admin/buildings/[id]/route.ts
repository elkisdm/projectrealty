import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createRateLimiter } from "@lib/rate-limit";
import { readAll } from "@lib/data";
import { updateBuilding, deleteBuilding } from "@lib/admin/data";
import { BuildingSchema } from "@schemas/models";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Rate limiting for admin endpoints
const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });

const ParamsSchema = z.object({
  id: z.string().min(1),
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const params = await context.params;
    const parsed = ParamsSchema.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_params", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { id } = parsed.data;

    // Buscar edificio
    const buildings = await readAll();
    const building = buildings.find((b) => b.id === id);

    if (!building) {
      return NextResponse.json(
        { error: "not_found", message: "Edificio no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: building,
    });
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

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const params = await context.params;
    const parsed = ParamsSchema.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_params", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { id } = parsed.data;

    // Parsear y validar body (partial update)
    const body = await request.json();
    const partialSchema = BuildingSchema.partial();
    const validation = partialSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "validation_error",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    // Actualizar edificio
    const building = await updateBuilding(id, validation.data);

    return NextResponse.json({
      success: true,
      data: building,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("no encontrado")) {
      return NextResponse.json(
        { error: "not_found", message: error.message },
        { status: 404 }
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

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const params = await context.params;
    const parsed = ParamsSchema.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_params", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { id } = parsed.data;

    // Eliminar edificio
    await deleteBuilding(id);

    return NextResponse.json({
      success: true,
      message: "Edificio eliminado correctamente",
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("no encontrado")) {
      return NextResponse.json(
        { error: "not_found", message: error.message },
        { status: 404 }
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









