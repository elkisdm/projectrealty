import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createRateLimiter } from "@lib/rate-limit";
import { readAll } from "@lib/data";
import { updateUnit, deleteUnit } from "@lib/admin/data";
import { UnitSchema } from "@schemas/models";
import type { Unit } from "@schemas/models";

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

    // Buscar unidad
    const buildings = await readAll();
    let foundUnit: (Unit & { buildingId: string; buildingName: string }) | null =
      null;

    for (const building of buildings) {
      const unit = building.units.find((u) => u.id === id);
      if (unit) {
        foundUnit = {
          ...unit,
          buildingId: building.id,
          buildingName: building.name,
        };
        break;
      }
    }

    if (!foundUnit) {
      return NextResponse.json(
        { error: "not_found", message: "Unidad no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: foundUnit,
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
    const partialSchema = UnitSchema.partial();
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

    // Actualizar unidad
    const unit = await updateUnit(id, validation.data);

    return NextResponse.json({
      success: true,
      data: unit,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("no encontrada")) {
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

    // Eliminar unidad
    await deleteUnit(id);

    return NextResponse.json({
      success: true,
      message: "Unidad eliminada correctamente",
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("no encontrada")) {
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










