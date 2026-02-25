import { NextRequest } from "next/server";
import { z } from "zod";
import { createRateLimiter } from "@lib/rate-limit";
import { adminError, adminOk } from "@lib/admin/contracts";
import { requireAdminSession } from "@lib/admin/guards";
import { logAdminActivity } from "@lib/admin/repositories/activity.repository";
import { getVisitRepository } from "@/lib/visits/repository";

export const dynamic = "force-dynamic";

const limiter = createRateLimiter({ windowMs: 60_000, max: 30 });

const ParamsSchema = z.object({
  id: z.string().min(1),
});

const BodySchema = z.object({
  status: z.enum(["pending", "confirmed", "in_progress", "completed", "canceled", "no_show"]),
  reason: z.string().trim().max(500).optional(),
});

export async function PATCH(
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

    const body = await request.json();
    const parsedBody = BodySchema.safeParse(body);
    if (!parsedBody.success) {
      return adminError("validation_error", "Payload inválido", {
        status: 400,
        details: parsedBody.error.errors,
      });
    }

    const repository = getVisitRepository();
    const result = await repository.updateVisitStatus({
      visitId: parsedParams.data.id,
      status: parsedBody.data.status,
      reason: parsedBody.data.reason,
      actorType: "admin",
      actorId: auth.session.user.id,
    });

    await logAdminActivity({
      actorId: auth.session.user.id,
      actorEmail: auth.session.user.email,
      actorRole: auth.session.user.role,
      action: "visit.status.update",
      entity: "visit",
      entityId: result.visit.id,
      metadata: {
        status: result.visit.status,
        reason: parsedBody.data.reason ?? null,
      },
    });

    return adminOk(result);
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    const message = error instanceof Error ? error.message : "Error interno del servidor";

    if (name === "VisitNotFoundError") {
      return adminError("not_found", message, { status: 404 });
    }

    if (name === "InvalidVisitTransitionError") {
      return adminError("invalid_transition", message, { status: 409 });
    }

    return adminError("internal_error", message, { status: 500 });
  }
}
