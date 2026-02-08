import { NextRequest } from "next/server";
import { z } from "zod";
import { createRateLimiter } from "@lib/rate-limit";
import {
  AdminBuildingCreateSchema,
  adminError,
  adminOk,
  parseAdminBuildingsQuery,
} from "@lib/admin/contracts";
import {
  createAdminBuilding,
  deleteAdminBuilding,
  listAdminBuildings,
} from "@lib/admin/repositories/buildings.repository";
import { createAdminUnit } from "@lib/admin/repositories/units.repository";
import { requireAdminSession } from "@lib/admin/guards";
import { logAdminActivity } from "@lib/admin/repositories/activity.repository";

export const dynamic = "force-dynamic";

const limiter = createRateLimiter({ windowMs: 60_000, max: 30 });

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminSession(request, "viewer");
    if (auth.response) {
      return auth.response;
    }

    const ipHeader = request.headers.get("x-forwarded-for");
    const ip = ipHeader ? ipHeader.split(",")[0].trim() : "unknown";

    const rateLimitResult = await limiter.check(ip);
    if (!rateLimitResult.ok) {
      return adminError("rate_limited", "Demasiadas solicitudes", {
        status: 429,
        details: { retryAfter: rateLimitResult.retryAfter ?? 60 },
      });
    }

    const parsedQuery = parseAdminBuildingsQuery(request.nextUrl.searchParams);
    if (!parsedQuery.success) {
      return adminError("invalid_query", "Parámetros de búsqueda inválidos", {
        status: 400,
        details: parsedQuery.error.errors,
      });
    }

    const { items, meta } = await listAdminBuildings(parsedQuery.data);
    return adminOk(items, { meta });
  } catch (error) {
    return adminError("internal_error", error instanceof Error ? error.message : "Error interno del servidor", {
      status: 500,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminSession(request, "editor");
    if (auth.response) {
      return auth.response;
    }

    const ipHeader = request.headers.get("x-forwarded-for");
    const ip = ipHeader ? ipHeader.split(",")[0].trim() : "unknown";

    const rateLimitResult = await limiter.check(ip);
    if (!rateLimitResult.ok) {
      return adminError("rate_limited", "Demasiadas solicitudes", {
        status: 429,
        details: { retryAfter: rateLimitResult.retryAfter ?? 60 },
      });
    }

    const body = await request.json();
    const parsed = AdminBuildingCreateSchema.safeParse(body);

    if (!parsed.success) {
      return adminError("validation_error", "Payload inválido para edificio", {
        status: 400,
        details: parsed.error.errors,
      });
    }

    const { units, ...buildingInput } = parsed.data;

    const createdBuilding = await createAdminBuilding({
      ...buildingInput,
      units,
    });

    const createdUnits = [];

    try {
      if (Array.isArray(units) && units.length > 0) {
        for (const unit of units) {
          const createdUnit = await createAdminUnit(
            {
              ...unit,
              buildingId: createdBuilding.id,
            },
            createdBuilding.id
          );
          createdUnits.push(createdUnit);
        }
      }
    } catch (error) {
      await deleteAdminBuilding(createdBuilding.id);
      throw error;
    }

    await logAdminActivity({
      actorId: auth.session.user.id,
      actorEmail: auth.session.user.email,
      actorRole: auth.session.user.role,
      action: "building.create",
      entity: "building",
      entityId: createdBuilding.id,
      metadata: {
        unitsCreated: createdUnits.length,
      },
    });

    return adminOk(
      {
        ...createdBuilding,
        units: createdUnits,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return adminError("validation_error", "Payload inválido", {
        status: 400,
        details: error.errors,
      });
    }

    const message = error instanceof Error ? error.message : "Error interno del servidor";

    if (message.startsWith("validation_error:")) {
      return adminError("validation_error", message.replace("validation_error:", "").trim(), {
        status: 400,
      });
    }

    if (message.startsWith("database_error:")) {
      return adminError("database_error", message.replace("database_error:", "").trim(), {
        status: 500,
      });
    }

    return adminError("internal_error", message, { status: 500 });
  }
}
