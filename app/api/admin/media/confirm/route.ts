import { NextRequest } from "next/server";
import { z } from "zod";
import { createRateLimiter } from "@lib/rate-limit";
import { AdminMediaConfirmSchema, adminError, adminOk } from "@lib/admin/contracts";
import { confirmMediaUpload } from "@lib/admin/repositories/media.repository";
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

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return adminError("validation_error", "El archivo es requerido", { status: 400 });
    }

    const parsed = AdminMediaConfirmSchema.safeParse({
      buildingId: formData.get("buildingId"),
      unitId: formData.get("unitId") || undefined,
      scope: formData.get("scope"),
      mediaType: formData.get("mediaType"),
      bucket: formData.get("bucket"),
      path: formData.get("path"),
      token: formData.get("token"),
      mimeType: formData.get("mimeType") || file.type,
      size: Number(formData.get("size") || file.size),
      isCover: formData.get("isCover") === "true",
      sortOrder: formData.get("sortOrder") ? Number(formData.get("sortOrder")) : undefined,
    });

    if (!parsed.success) {
      return adminError("validation_error", "Payload inválido para confirmación", {
        status: 400,
        details: parsed.error.errors,
      });
    }

    const media = await confirmMediaUpload({
      ...parsed.data,
      file,
    });

    return adminOk(media, { status: 201 });
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

    if (message.startsWith("upload_failed:")) {
      return adminError("upload_failed", message.replace("upload_failed:", "").trim(), {
        status: 500,
      });
    }

    return adminError("internal_error", message, { status: 500 });
  }
}
