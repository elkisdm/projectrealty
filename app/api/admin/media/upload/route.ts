import { NextRequest } from "next/server";
import { z } from "zod";
import { createRateLimiter } from "@lib/rate-limit";
import { adminError, adminOk } from "@lib/admin/contracts";
import {
  confirmMediaUpload,
  createMediaUploadUrl,
} from "@lib/admin/repositories/media.repository";
import { requireAdminSession } from "@lib/admin/guards";

export const dynamic = "force-dynamic";

const limiter = createRateLimiter({ windowMs: 60_000, max: 60 });

const UploadMetaSchema = z.object({
  buildingId: z.string().min(1),
  unitId: z.string().optional(),
  scope: z.enum(["unit", "building"]).default("unit"),
  mediaType: z.enum(["image", "video"]),
  isCover: z.boolean().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
});

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

    const parsed = UploadMetaSchema.safeParse({
      buildingId: formData.get("buildingId"),
      unitId: formData.get("unitId") || undefined,
      scope: formData.get("scope") || "unit",
      mediaType: formData.get("mediaType"),
      isCover: formData.get("isCover") === "true",
      sortOrder: formData.get("sortOrder") ? Number(formData.get("sortOrder")) : undefined,
    });

    if (!parsed.success) {
      return adminError("validation_error", "Payload inválido", {
        status: 400,
        details: parsed.error.errors,
      });
    }

    const upload = await createMediaUploadUrl({
      ...parsed.data,
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
    });

    const media = await confirmMediaUpload({
      ...parsed.data,
      mimeType: file.type,
      size: file.size,
      bucket: upload.bucket,
      path: upload.path,
      token: upload.token,
      file,
    });

    return adminOk(
      {
        id: media.id,
        bucket: media.bucket,
        path: media.path,
        url: media.public_url,
        mediaType: media.media_type,
        size: media.size,
        sortOrder: media.sort_order,
        isCover: media.is_cover,
      },
      { status: 201 }
    );
  } catch (error) {
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
