import { NextRequest } from "next/server";
import { z } from "zod";
import { createRateLimiter } from "@lib/rate-limit";
import {
  AdminUnitCreateSchema,
  adminError,
  adminOk,
  parseAdminUnitsQuery,
} from "@lib/admin/contracts";
import { createAdminUnit, listAdminUnits } from "@lib/admin/repositories/units.repository";
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

    const parsedQuery = parseAdminUnitsQuery(request.nextUrl.searchParams);
    if (!parsedQuery.success) {
      return adminError("invalid_query", "Parámetros de búsqueda inválidos", {
        status: 400,
        details: parsedQuery.error.errors,
      });
    }

    const { items, meta } = await listAdminUnits(parsedQuery.data);
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

    const body = (await request.json()) as Record<string, unknown>;
    const buildingId =
      typeof body.buildingId === "string"
        ? body.buildingId
        : typeof body.building_id === "string"
        ? body.building_id
        : "";

    if (!buildingId) {
      return adminError("validation_error", "buildingId es requerido", { status: 400 });
    }

    const parsed = AdminUnitCreateSchema.safeParse(body);
    if (!parsed.success) {
      return adminError("validation_error", "Payload inválido para unidad", {
        status: 400,
        details: parsed.error.errors,
      });
    }

    const created = await createAdminUnit(parsed.data, buildingId);

    await logAdminActivity({
      actorId: auth.session.user.id,
      actorEmail: auth.session.user.email,
      actorRole: auth.session.user.role,
      action: "unit.create",
      entity: "unit",
      entityId: created.id,
      metadata: {
        buildingId,
        publicationStatus: created.publicationStatus,
      },
    });

    return adminOk(created, { status: 201 });
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
