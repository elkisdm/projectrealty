import { NextRequest } from "next/server";
import { z } from "zod";
import { createRateLimiter } from "@lib/rate-limit";
import {
  AdminUnitDraftPatchSchema,
  adminError,
  adminOk,
} from "@lib/admin/contracts";
import { requireAdminSession } from "@lib/admin/guards";
import {
  getAdminUnitById,
  saveAdminUnitDraftStep,
} from "@lib/admin/repositories/units.repository";
import { logAdminActivity } from "@lib/admin/repositories/activity.repository";

export const dynamic = "force-dynamic";

const limiter = createRateLimiter({ windowMs: 60_000, max: 60 });

const ParamsSchema = z.object({
  id: z.string().min(1),
});

async function checkRateLimit(request: NextRequest) {
  const ipHeader = request.headers.get("x-forwarded-for");
  const ip = ipHeader ? ipHeader.split(",")[0].trim() : "unknown";
  const rateLimitResult = await limiter.check(ip);

  if (!rateLimitResult.ok) {
    return adminError("rate_limited", "Demasiadas solicitudes", {
      status: 429,
      details: { retryAfter: rateLimitResult.retryAfter ?? 60 },
    });
  }

  return null;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminSession(request, "viewer");
    if (auth.response) {
      return auth.response;
    }

    const rateLimitResponse = await checkRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const params = await context.params;
    const parsedParams = ParamsSchema.safeParse(params);
    if (!parsedParams.success) {
      return adminError("invalid_params", "Parámetros inválidos", {
        status: 400,
        details: parsedParams.error.errors,
      });
    }

    const unit = await getAdminUnitById(parsedParams.data.id);
    if (!unit) {
      return adminError("not_found", "Unidad no encontrada", { status: 404 });
    }

    return adminOk(unit);
  } catch (error) {
    return adminError(
      "internal_error",
      error instanceof Error ? error.message : "Error interno del servidor",
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminSession(request, "editor");
    if (auth.response) {
      return auth.response;
    }

    const rateLimitResponse = await checkRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
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
    const parsedBody = AdminUnitDraftPatchSchema.safeParse(body);
    if (!parsedBody.success) {
      return adminError("validation_error", "Payload inválido para borrador", {
        status: 400,
        details: parsedBody.error.errors,
      });
    }

    const updated = await saveAdminUnitDraftStep({
      id: parsedParams.data.id,
      step: parsedBody.data.step,
      data: parsedBody.data.data,
      completedSteps: parsedBody.data.completedSteps,
    });

    await logAdminActivity({
      actorId: auth.session.user.id,
      actorEmail: auth.session.user.email,
      actorRole: auth.session.user.role,
      action: "unit.draft_save",
      entity: "unit",
      entityId: updated.id,
      metadata: {
        step: parsedBody.data.step,
        completedSteps: parsedBody.data.completedSteps || [],
      },
    });

    return adminOk(updated);
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
