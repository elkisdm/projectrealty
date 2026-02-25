import { NextRequest } from "next/server";
import { z } from "zod";
import { createRateLimiter } from "@lib/rate-limit";
import { adminError, adminOk } from "@lib/admin/contracts";
import { deleteMediaAssetById } from "@lib/admin/repositories/media.repository";
import { requireAdminSession } from "@lib/admin/guards";

export const dynamic = "force-dynamic";

const limiter = createRateLimiter({ windowMs: 60_000, max: 40 });

const ParamsSchema = z.object({
  id: z.string().min(1),
});

export async function DELETE(
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

    await deleteMediaAssetById(parsedParams.data.id);

    return adminOk({ id: parsedParams.data.id, deleted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno del servidor";

    if (message.startsWith("not_found:")) {
      return adminError("not_found", message.replace("not_found:", "").trim(), {
        status: 404,
      });
    }

    if (message.startsWith("storage_error:")) {
      return adminError("storage_error", message.replace("storage_error:", "").trim(), {
        status: 500,
      });
    }

    return adminError("internal_error", message, { status: 500 });
  }
}
