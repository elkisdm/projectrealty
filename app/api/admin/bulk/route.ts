import { NextRequest } from "next/server";
import { z } from "zod";
import { createRateLimiter } from "@lib/rate-limit";
import {
  AdminBuildingCreateSchema,
  AdminBuildingUpdateSchema,
  AdminUnitCreateSchema,
  AdminUnitUpdateSchema,
  adminError,
  adminOk,
} from "@lib/admin/contracts";
import {
  createAdminBuilding,
  deleteAdminBuilding,
  updateAdminBuilding,
} from "@lib/admin/repositories/buildings.repository";
import {
  createAdminUnit,
  deleteAdminUnit,
  updateAdminUnit,
} from "@lib/admin/repositories/units.repository";
import { requireAdminSession } from "@lib/admin/guards";
import { logAdminActivity } from "@lib/admin/repositories/activity.repository";

export const dynamic = "force-dynamic";

const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });

const BulkOperationSchema = z.object({
  operation: z.enum(["create", "update", "delete", "import"]),
  entity: z.enum(["buildings", "units"]),
  ids: z.array(z.string().min(1)).optional(),
  data: z.array(z.unknown()).optional(),
});

function extractBuildingId(raw: Record<string, unknown>) {
  if (typeof raw.buildingId === "string" && raw.buildingId) {
    return raw.buildingId;
  }

  if (typeof raw.building_id === "string" && raw.building_id) {
    return raw.building_id;
  }

  return "";
}

export async function POST(request: NextRequest) {
  try {
    const ipHeader = request.headers.get("x-forwarded-for");
    const ip = ipHeader ? ipHeader.split(",")[0].trim() : "unknown";

    const rateLimitResult = await limiter.check(ip);
    if (!rateLimitResult.ok) {
      return adminError("rate_limited", "Demasiadas solicitudes", {
        status: 429,
        details: { retryAfter: rateLimitResult.retryAfter ?? 60 },
      });
    }

    const rawBody = await request.json();
    const parsed = BulkOperationSchema.safeParse(rawBody);

    if (!parsed.success) {
      return adminError("validation_error", "Payload inválido para operación bulk", {
        status: 400,
        details: parsed.error.errors,
      });
    }

    const requiresAdmin = parsed.data.operation === "delete";
    const auth = await requireAdminSession(request, requiresAdmin ? "admin" : "editor");
    if (auth.response) {
      return auth.response;
    }

    const { operation, entity, ids, data } = parsed.data;

    if (operation === "delete") {
      if (!ids || ids.length === 0) {
        return adminError("validation_error", "ids es requerido para delete", {
          status: 400,
        });
      }

      const results: Array<{ id: string; success: boolean }> = [];
      const errors: Array<{ id: string; error: string }> = [];

      for (const id of ids) {
        try {
          if (entity === "buildings") {
            await deleteAdminBuilding(id);
          } else {
            await deleteAdminUnit(id);
          }
          results.push({ id, success: true });

          await logAdminActivity({
            actorId: auth.session.user.id,
            actorEmail: auth.session.user.email,
            actorRole: auth.session.user.role,
            action: `${entity.slice(0, -1)}.delete`,
            entity: entity.slice(0, -1),
            entityId: id,
          });
        } catch (error) {
          errors.push({
            id,
            error: error instanceof Error ? error.message : "Error desconocido",
          });
        }
      }

      return adminOk({
        results,
        errors,
        summary: {
          total: ids.length,
          success: results.length,
          failed: errors.length,
        },
      });
    }

    if (!data || data.length === 0) {
      return adminError("validation_error", "data es requerido", {
        status: 400,
      });
    }

    const results: Array<{ id: string; success: boolean; data?: unknown }> = [];
    const errors: Array<{ item: unknown; error: string }> = [];

    for (const item of data) {
      const itemRecord = (item || {}) as Record<string, unknown>;

      try {
        if (entity === "buildings") {
          if (operation === "update") {
            const id = typeof itemRecord.id === "string" ? itemRecord.id : "";
            if (!id) {
              throw new Error("validation_error: id es requerido para update");
            }

            const payload = AdminBuildingUpdateSchema.parse(itemRecord);
            const updated = await updateAdminBuilding(id, payload);
            results.push({ id, success: true, data: updated });

            await logAdminActivity({
              actorId: auth.session.user.id,
              actorEmail: auth.session.user.email,
              actorRole: auth.session.user.role,
              action: "building.update",
              entity: "building",
              entityId: id,
            });
          } else {
            const payload = AdminBuildingCreateSchema.parse(itemRecord);
            const { units, ...buildingInput } = payload;
            const created = await createAdminBuilding({ ...buildingInput, units });
            results.push({ id: created.id, success: true, data: created });

            await logAdminActivity({
              actorId: auth.session.user.id,
              actorEmail: auth.session.user.email,
              actorRole: auth.session.user.role,
              action: "building.create",
              entity: "building",
              entityId: created.id,
              metadata: {
                via: "bulk",
              },
            });
          }
        } else {
          if (operation === "update") {
            const id = typeof itemRecord.id === "string" ? itemRecord.id : "";
            if (!id) {
              throw new Error("validation_error: id es requerido para update");
            }

            const payload = AdminUnitUpdateSchema.parse(itemRecord);
            const updated = await updateAdminUnit(id, payload);
            results.push({ id, success: true, data: updated });

            await logAdminActivity({
              actorId: auth.session.user.id,
              actorEmail: auth.session.user.email,
              actorRole: auth.session.user.role,
              action: "unit.update",
              entity: "unit",
              entityId: id,
              metadata: {
                via: "bulk",
              },
            });
          } else {
            const buildingId = extractBuildingId(itemRecord);
            if (!buildingId) {
              throw new Error("validation_error: buildingId es requerido para crear unidad");
            }

            const payload = AdminUnitCreateSchema.parse(itemRecord);
            const created = await createAdminUnit(payload, buildingId);
            results.push({ id: created.id, success: true, data: created });

            await logAdminActivity({
              actorId: auth.session.user.id,
              actorEmail: auth.session.user.email,
              actorRole: auth.session.user.role,
              action: "unit.create",
              entity: "unit",
              entityId: created.id,
              metadata: {
                via: "bulk",
                buildingId,
              },
            });
          }
        }
      } catch (error) {
        errors.push({
          item,
          error: error instanceof Error ? error.message : "Error desconocido",
        });
      }
    }

    return adminOk(
      {
        results,
        errors,
        summary: {
          total: data.length,
          success: results.length,
          failed: errors.length,
        },
      },
      { status: operation === "update" ? 200 : 201 }
    );
  } catch (error) {
    return adminError("internal_error", error instanceof Error ? error.message : "Error interno del servidor", {
      status: 500,
    });
  }
}
