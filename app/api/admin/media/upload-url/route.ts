import { NextRequest } from "next/server";
import { createRateLimiter } from "@lib/rate-limit";
import { AdminMediaUploadUrlSchema, adminError, adminOk } from "@lib/admin/contracts";
import { createMediaUploadUrl } from "@lib/admin/repositories/media.repository";
import { requireAdminSession } from "@lib/admin/guards";

export const dynamic = "force-dynamic";

const limiter = createRateLimiter({ windowMs: 60_000, max: 60 });

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
    const parsed = AdminMediaUploadUrlSchema.safeParse(body);

    if (!parsed.success) {
      return adminError("validation_error", "Payload inválido para upload-url", {
        status: 400,
        details: parsed.error.errors,
      });
    }

    const upload = await createMediaUploadUrl(parsed.data);

    return adminOk(upload, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno del servidor";

    if (message.startsWith("validation_error:")) {
      return adminError("validation_error", message.replace("validation_error:", "").trim(), {
        status: 400,
      });
    }

    return adminError("internal_error", message, { status: 500 });
  }
}
