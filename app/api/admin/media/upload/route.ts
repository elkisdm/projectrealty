import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@lib/supabase";

export const dynamic = "force-dynamic";

const IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"]);

const UploadMetaSchema = z.object({
  buildingId: z.string().min(1),
  unitId: z.string().optional(),
  scope: z.enum(["unit", "building"]).default("unit"),
  mediaType: z.enum(["image", "video"]),
});

function sanitizePathSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getExtension(fileName: string, contentType: string): string {
  const byName = fileName.split(".").pop()?.toLowerCase();
  if (byName && /^[a-z0-9]+$/.test(byName)) {
    return byName;
  }

  if (contentType === "image/jpeg" || contentType === "image/jpg") return "jpg";
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  if (contentType === "image/gif") return "gif";
  if (contentType === "video/mp4") return "mp4";
  if (contentType === "video/webm") return "webm";
  if (contentType === "video/quicktime") return "mov";
  if (contentType === "video/x-msvideo") return "avi";

  return "bin";
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "validation_error", message: "El archivo es requerido" },
        { status: 400 }
      );
    }

    const parsed = UploadMetaSchema.safeParse({
      buildingId: formData.get("buildingId"),
      unitId: formData.get("unitId") || undefined,
      scope: formData.get("scope") || "unit",
      mediaType: formData.get("mediaType"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "validation_error", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { buildingId, unitId, scope, mediaType } = parsed.data;
    const contentType = file.type.toLowerCase();

    if (mediaType === "image") {
      if (!IMAGE_TYPES.has(contentType)) {
        return NextResponse.json(
          { error: "unsupported_type", message: "Formato de imagen no permitido" },
          { status: 400 }
        );
      }
      if (file.size > 15 * 1024 * 1024) {
        return NextResponse.json(
          { error: "file_too_large", message: "La imagen excede 15 MB" },
          { status: 400 }
        );
      }
    }

    if (mediaType === "video") {
      if (!VIDEO_TYPES.has(contentType)) {
        return NextResponse.json(
          { error: "unsupported_type", message: "Formato de video no permitido" },
          { status: 400 }
        );
      }
      if (file.size > 150 * 1024 * 1024) {
        return NextResponse.json(
          { error: "file_too_large", message: "El video excede 150 MB" },
          { status: 400 }
        );
      }
    }

    const bucket = scope === "building" ? "building-media" : "unit-media";
    const safeBuildingId = sanitizePathSegment(buildingId);
    const safeUnitId = sanitizePathSegment(unitId || "sin-unidad");
    const folder = mediaType === "video" ? "videos" : "images";
    const extension = getExtension(file.name, contentType);
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

    const objectPath =
      scope === "building"
        ? `${safeBuildingId}/${folder}/${uniqueName}`
        : `${safeBuildingId}/${safeUnitId}/${folder}/${uniqueName}`;

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(objectPath, fileBuffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        {
          error: "upload_failed",
          message: uploadError.message || "No se pudo subir el archivo",
        },
        { status: 500 }
      );
    }

    const { data: publicData } = supabaseAdmin.storage.from(bucket).getPublicUrl(objectPath);

    return NextResponse.json({
      success: true,
      data: {
        bucket,
        path: objectPath,
        url: publicData.publicUrl,
        mediaType,
        size: file.size,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "internal_error",
        message: error instanceof Error ? error.message : "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}
