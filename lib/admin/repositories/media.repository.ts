import { randomUUID } from "crypto";
import type {
  AdminMediaAsset,
  AdminMediaScope,
  AdminMediaType,
} from "@lib/admin/contracts";
import { getAdminDbClient } from "@lib/admin/repositories/client";
import { getTableColumns, pickKnownColumns } from "@lib/admin/repositories/table-columns";

const ADMIN_MEDIA_BUCKET = "admin-media";
const FALLBACK_BUCKETS: Record<AdminMediaScope, string> = {
  building: "building-media",
  unit: "unit-media",
};

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 200 * 1024 * 1024;

const IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const VIDEO_MIME_TYPES = new Set(["video/mp4", "video/webm"]);

function sanitizePathSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "na";
}

function getExtension(fileName: string, mimeType: string): string {
  const fromName = fileName.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) {
    return fromName;
  }

  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "video/mp4") return "mp4";
  if (mimeType === "video/webm") return "webm";

  return "bin";
}

function getMediaFolder(mediaType: AdminMediaType): string {
  return mediaType === "video" ? "videos" : "images";
}

function buildMediaPath({
  scope,
  buildingId,
  unitId,
  mediaType,
  mimeType,
  fileName,
  isCover,
}: {
  scope: AdminMediaScope;
  buildingId: string;
  unitId?: string;
  mediaType: AdminMediaType;
  mimeType: string;
  fileName: string;
  isCover?: boolean;
}) {
  const safeBuildingId = sanitizePathSegment(buildingId);
  const extension = getExtension(fileName, mimeType);
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;

  if (scope === "building") {
    const folder = isCover ? "cover" : "gallery";
    return `buildings/${safeBuildingId}/${folder}/${uniqueName}`;
  }

  const safeUnitId = sanitizePathSegment(unitId || "unit");
  return `buildings/${safeBuildingId}/units/${safeUnitId}/${getMediaFolder(mediaType)}/${uniqueName}`;
}

function assertFilePolicy({
  mediaType,
  mimeType,
  size,
}: {
  mediaType: AdminMediaType;
  mimeType: string;
  size: number;
}) {
  if (mediaType === "image") {
    if (!IMAGE_MIME_TYPES.has(mimeType)) {
      throw new Error("validation_error: Tipo de imagen no permitido");
    }

    if (size > MAX_IMAGE_SIZE) {
      throw new Error("validation_error: La imagen excede 10 MB");
    }

    return;
  }

  if (!VIDEO_MIME_TYPES.has(mimeType)) {
    throw new Error("validation_error: Tipo de video no permitido");
  }

  if (size > MAX_VIDEO_SIZE) {
    throw new Error("validation_error: El video excede 200 MB");
  }
}

function getMediaTable(scope: AdminMediaScope): "unit_media" | "building_media" {
  return scope === "unit" ? "unit_media" : "building_media";
}

async function assertUnitMediaLimit({
  unitId,
  mediaType,
}: {
  unitId?: string;
  mediaType: AdminMediaType;
}) {
  if (!unitId) {
    return;
  }

  const client = getAdminDbClient();

  let count = 0;

  try {
    const { count: tableCount, error } = await client
      .from("unit_media")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", unitId)
      .eq("media_type", mediaType);

    if (!error) {
      count = tableCount || 0;
    }
  } catch {
    // Si la tabla no existe aún, no bloqueamos el flujo.
    return;
  }

  if (mediaType === "image" && count >= 20) {
    throw new Error("validation_error: Una unidad no puede tener más de 20 imágenes");
  }

  if (mediaType === "video" && count >= 3) {
    throw new Error("validation_error: Una unidad no puede tener más de 3 videos");
  }
}

async function createSignedUploadInBucket({
  bucket,
  path,
}: {
  bucket: string;
  path: string;
}) {
  const client = getAdminDbClient();
  const { data, error } = await client.storage
    .from(bucket)
    .createSignedUploadUrl(path, { upsert: false });

  if (error || !data) {
    throw new Error(error?.message || "No se pudo crear URL firmada");
  }

  const { data: publicData } = client.storage.from(bucket).getPublicUrl(path);

  return {
    bucket,
    signedUrl: data.signedUrl,
    token: data.token,
    path: data.path,
    publicUrl: publicData.publicUrl,
  };
}

export async function createMediaUploadUrl({
  buildingId,
  unitId,
  scope,
  mediaType,
  fileName,
  mimeType,
  size,
  isCover,
}: {
  buildingId: string;
  unitId?: string;
  scope: AdminMediaScope;
  mediaType: AdminMediaType;
  fileName: string;
  mimeType: string;
  size: number;
  isCover?: boolean;
}) {
  assertFilePolicy({ mediaType, mimeType, size });

  if (scope === "unit" && !unitId) {
    throw new Error("validation_error: unitId es requerido para scope=unit");
  }

  await assertUnitMediaLimit({ unitId, mediaType });

  const path = buildMediaPath({
    scope,
    buildingId,
    unitId,
    mediaType,
    mimeType,
    fileName,
    isCover,
  });

  try {
    return await createSignedUploadInBucket({ bucket: ADMIN_MEDIA_BUCKET, path });
  } catch {
    return createSignedUploadInBucket({
      bucket: FALLBACK_BUCKETS[scope],
      path,
    });
  }
}

export async function confirmMediaUpload({
  buildingId,
  unitId,
  scope,
  mediaType,
  mimeType,
  size,
  bucket,
  path,
  token,
  file,
  isCover,
  sortOrder,
}: {
  buildingId: string;
  unitId?: string;
  scope: AdminMediaScope;
  mediaType: AdminMediaType;
  mimeType: string;
  size: number;
  bucket: string;
  path: string;
  token: string;
  file: File;
  isCover?: boolean;
  sortOrder?: number;
}): Promise<AdminMediaAsset> {
  assertFilePolicy({ mediaType, mimeType, size });

  if (scope === "unit" && !unitId) {
    throw new Error("validation_error: unitId es requerido para scope=unit");
  }

  await assertUnitMediaLimit({ unitId, mediaType });

  const client = getAdminDbClient();

  const { error: uploadError } = await client.storage
    .from(bucket)
    .uploadToSignedUrl(path, token, file, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`upload_failed: ${uploadError.message}`);
  }

  const { data: publicData } = client.storage.from(bucket).getPublicUrl(path);
  const ownerId = scope === "unit" ? unitId! : buildingId;

  const payload: Record<string, unknown> = {
    owner_id: ownerId,
    building_id: buildingId,
    media_type: mediaType,
    mime: mimeType,
    size,
    bucket,
    path,
    public_url: publicData.publicUrl,
    sort_order: sortOrder ?? 0,
    is_cover: Boolean(isCover),
  };

  const table = getMediaTable(scope);

  try {
    const columns = await getTableColumns(table);
    const insertPayload = pickKnownColumns(payload, columns);

    const { data, error } = await client
      .from(table)
      .insert(insertPayload)
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Error guardando metadata de media");
    }

    return {
      id: String((data as Record<string, unknown>).id),
      owner_id: String((data as Record<string, unknown>).owner_id),
      building_id: ((data as Record<string, unknown>).building_id as string | null) ?? null,
      media_type: ((data as Record<string, unknown>).media_type as AdminMediaType) || mediaType,
      mime: String((data as Record<string, unknown>).mime),
      size: Number((data as Record<string, unknown>).size),
      bucket: String((data as Record<string, unknown>).bucket),
      path: String((data as Record<string, unknown>).path),
      public_url: String((data as Record<string, unknown>).public_url),
      sort_order: Number((data as Record<string, unknown>).sort_order ?? 0),
      is_cover: Boolean((data as Record<string, unknown>).is_cover),
      created_at: String((data as Record<string, unknown>).created_at),
      updated_at: String((data as Record<string, unknown>).updated_at),
    };
  } catch {
    const now = new Date().toISOString();

    return {
      id: randomUUID(),
      owner_id: ownerId,
      building_id: buildingId,
      media_type: mediaType,
      mime: mimeType,
      size,
      bucket,
      path,
      public_url: publicData.publicUrl,
      sort_order: sortOrder ?? 0,
      is_cover: Boolean(isCover),
      created_at: now,
      updated_at: now,
    };
  }
}

export async function deleteMediaAssetById(id: string): Promise<void> {
  const client = getAdminDbClient();

  const lookupOrder: Array<"unit_media" | "building_media"> = [
    "unit_media",
    "building_media",
  ];

  for (const table of lookupOrder) {
    try {
      const { data, error } = await client
        .from(table)
        .select("id, bucket, path")
        .eq("id", id)
        .maybeSingle();

      if (error || !data) {
        continue;
      }

      const row = data as Record<string, unknown>;
      const bucket = String(row.bucket);
      const path = String(row.path);

      const removeStorageResult = await client.storage.from(bucket).remove([path]);
      if (removeStorageResult.error) {
        throw new Error(`storage_error: ${removeStorageResult.error.message}`);
      }

      const deleteResult = await client.from(table).delete().eq("id", id);
      if (deleteResult.error) {
        throw new Error(`database_error: ${deleteResult.error.message}`);
      }

      return;
    } catch {
      continue;
    }
  }

  throw new Error("not_found: Recurso de media no encontrado");
}
