import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createRateLimiter } from "@lib/rate-limit";
import {
  createBuilding,
  updateBuilding,
  deleteBuilding,
  createUnit,
  updateUnit,
  deleteUnit,
} from "@lib/admin/data";
import { BuildingSchema, UnitSchema } from "@schemas/models";
import type { Building, Unit } from "@schemas/models";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Rate limiting for admin endpoints (más restrictivo para operaciones en lote)
const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });

const BulkOperationSchema = z.object({
  operation: z.enum(["create", "update", "delete", "import"]),
  entity: z.enum(["buildings", "units"]),
  ids: z.array(z.string()).optional(),
  data: z.array(z.unknown()).optional(),
});

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
    const validation = BulkOperationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "validation_error",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { operation, entity, ids, data } = validation.data;

    // Operaciones de eliminación
    if (operation === "delete") {
      if (!ids || ids.length === 0) {
        return NextResponse.json(
          { error: "validation_error", message: "ids es requerido para delete" },
          { status: 400 }
        );
      }

      const results = [];
      const errors = [];

      for (const id of ids) {
        try {
          if (entity === "buildings") {
            await deleteBuilding(id);
          } else {
            await deleteUnit(id);
          }
          results.push({ id, success: true });
        } catch (error) {
          errors.push({
            id,
            error: error instanceof Error ? error.message : "Error desconocido",
          });
        }
      }

      return NextResponse.json({
        success: true,
        results,
        errors: errors.length > 0 ? errors : undefined,
        summary: {
          total: ids.length,
          success: results.length,
          failed: errors.length,
        },
      });
    }

    // Operaciones de actualización
    if (operation === "update") {
      if (!data || data.length === 0) {
        return NextResponse.json(
          { error: "validation_error", message: "data es requerido para update" },
          { status: 400 }
        );
      }

      const results = [];
      const errors = [];

      for (const item of data) {
        try {
          const itemData = item as { id: string } & Partial<Building | Unit>;
          if (!itemData.id) {
            errors.push({ item, error: "id es requerido" });
            continue;
          }

          if (entity === "buildings") {
            const validation = BuildingSchema.partial().safeParse(itemData);
            if (!validation.success) {
              errors.push({
                id: itemData.id,
                error: validation.error.errors[0]?.message || "Error de validación",
              });
              continue;
            }
            const updated = await updateBuilding(itemData.id, validation.data);
            results.push({ id: itemData.id, success: true, data: updated });
          } else {
            const validation = UnitSchema.partial().safeParse(itemData);
            if (!validation.success) {
              errors.push({
                id: itemData.id,
                error: validation.error.errors[0]?.message || "Error de validación",
              });
              continue;
            }
            const updated = await updateUnit(itemData.id, validation.data);
            results.push({ id: itemData.id, success: true, data: updated });
          }
        } catch (error) {
          errors.push({
            item,
            error: error instanceof Error ? error.message : "Error desconocido",
          });
        }
      }

      return NextResponse.json({
        success: true,
        results,
        errors: errors.length > 0 ? errors : undefined,
        summary: {
          total: data.length,
          success: results.length,
          failed: errors.length,
        },
      });
    }

    // Operaciones de creación/importación
    if (operation === "create" || operation === "import") {
      if (!data || data.length === 0) {
        return NextResponse.json(
          {
            error: "validation_error",
            message: "data es requerido para create/import",
          },
          { status: 400 }
        );
      }

      const results = [];
      const errors = [];

      for (const item of data) {
        try {
          if (entity === "buildings") {
            const validation = BuildingSchema.safeParse(item);
            if (!validation.success) {
              errors.push({
                item,
                error: validation.error.errors[0]?.message || "Error de validación",
              });
              continue;
            }
            const created = await createBuilding(validation.data);
            results.push({ id: created.id, success: true, data: created });
          } else {
            const itemData = item as Unit & { buildingId: string };
            if (!itemData.buildingId) {
              errors.push({
                item,
                error: "buildingId es requerido para unidades",
              });
              continue;
            }

            const { buildingId, ...unitData } = itemData;
            const validation = UnitSchema.safeParse(unitData);
            if (!validation.success) {
              errors.push({
                item,
                error: validation.error.errors[0]?.message || "Error de validación",
              });
              continue;
            }
            const created = await createUnit(validation.data, buildingId);
            results.push({ id: created.id, success: true, data: created });
          }
        } catch (error) {
          errors.push({
            item,
            error: error instanceof Error ? error.message : "Error desconocido",
          });
        }
      }

      return NextResponse.json(
        {
          success: true,
          results,
          errors: errors.length > 0 ? errors : undefined,
          summary: {
            total: data.length,
            success: results.length,
            failed: errors.length,
          },
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { error: "invalid_operation", message: "Operación no soportada" },
      { status: 400 }
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















