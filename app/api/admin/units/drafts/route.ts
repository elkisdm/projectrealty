import { NextRequest } from "next/server";
import { createRateLimiter } from "@lib/rate-limit";
import { AdminUnitDraftCreateSchema, adminError, adminOk } from "@lib/admin/contracts";
import { requireAdminSession } from "@lib/admin/guards";
import { createAdminUnitDraft } from "@lib/admin/repositories/units.repository";
import { logAdminActivity } from "@lib/admin/repositories/activity.repository";

export const dynamic = "force-dynamic";

const limiter = createRateLimiter({ windowMs: 60_000, max: 40 });

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
    const parsed = AdminUnitDraftCreateSchema.safeParse(body);

    if (!parsed.success) {
      return adminError("validation_error", "Payload inválido para crear borrador", {
        status: 400,
        details: parsed.error.errors,
      });
    }

    const created = await createAdminUnitDraft({
      buildingId: parsed.data.buildingId,
      step: parsed.data.step ?? "building",
      initialData: parsed.data.initialData,
    });

    await logAdminActivity({
      actorId: auth.session.user.id,
      actorEmail: auth.session.user.email,
      actorRole: auth.session.user.role,
      action: "unit.draft_create",
      entity: "unit",
      entityId: created.id,
      metadata: {
        buildingId: created.buildingId,
        step: parsed.data.step ?? "building",
      },
    });

    return adminOk(created, { status: 201 });
  } catch (error) {
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
