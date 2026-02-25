import { NextRequest } from "next/server";
import { z } from "zod";
import { createRateLimiter } from "@lib/rate-limit";
import { adminError, adminOk } from "@lib/admin/contracts";
import { requireAdminSession } from "@lib/admin/guards";
import { archiveAdminUnit } from "@lib/admin/repositories/units.repository";
import { logAdminActivity } from "@lib/admin/repositories/activity.repository";

export const dynamic = "force-dynamic";

const limiter = createRateLimiter({ windowMs: 60_000, max: 30 });

const ParamsSchema = z.object({
  id: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const params = await context.params;
    const parsedParams = ParamsSchema.safeParse(params);
    if (!parsedParams.success) {
      return adminError("invalid_params", "Parámetros inválidos", {
        status: 400,
        details: parsedParams.error.errors,
      });
    }

    const archived = await archiveAdminUnit(parsedParams.data.id);

    await logAdminActivity({
      actorId: auth.session.user.id,
      actorEmail: auth.session.user.email,
      actorRole: auth.session.user.role,
      action: "unit.archive",
      entity: "unit",
      entityId: archived.id,
      metadata: {
        status: archived.publicationStatus,
      },
    });

    return adminOk(archived);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno del servidor";

    if (message.startsWith("not_found:")) {
      return adminError("not_found", message.replace("not_found:", "").trim(), {
        status: 404,
      });
    }

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
