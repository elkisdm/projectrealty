import { NextResponse } from "next/server";
import { z } from "zod";
import { BuildingSchema, UnitSchema, type Building, type Unit } from "@schemas/models";

export type AdminRole = "admin" | "editor" | "viewer";
export type AdminPublicationStatus = "draft" | "published" | "archived";
export type AdminMediaScope = "building" | "unit";
export type AdminMediaType = "image" | "video";

export interface AdminErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export interface AdminListMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

export interface AdminApiResponse<T, M = AdminListMeta | null> {
  success: boolean;
  data: T | null;
  meta: M;
  pagination?: M;
  error: AdminErrorPayload | null;
}

const optionalString = z.preprocess((value) => {
  if (value === null || value === undefined) return undefined;
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : undefined;
}, z.string().optional());

const optionalBoolean = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") return undefined;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const lowered = value.toLowerCase();
    if (["true", "1", "yes", "si"].includes(lowered)) return true;
    if (["false", "0", "no"].includes(lowered)) return false;
  }
  return value;
}, z.boolean().optional());

const optionalInt = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}, z.number().int().optional());

const positiveIntWithDefault = (defaultValue: number, { min = 1, max = 10_000 }: { min?: number; max?: number } = {}) =>
  z.preprocess((value) => {
    if (value === null || value === undefined || value === "") return defaultValue;
    const parsed = Number.parseInt(String(value), 10);
    return Number.isNaN(parsed) ? defaultValue : parsed;
  }, z.number().int().min(min).max(max));

export const AdminUnitsQuerySchema = z
  .object({
    search: optionalString,
    building_id: optionalString,
    typology: optionalString,
    disponible: optionalBoolean,
    status: z.enum(["draft", "published", "archived"]).optional(),
    price_min: optionalInt,
    price_max: optionalInt,
    page: positiveIntWithDefault(1),
    page_size: positiveIntWithDefault(50, { min: 1, max: 500 }),
    sort: optionalString,
  })
  .refine(
    (value) => {
      if (value.price_min === undefined || value.price_max === undefined) {
        return true;
      }
      return value.price_max >= value.price_min;
    },
    {
      message: "price_max debe ser mayor o igual a price_min",
      path: ["price_max"],
    }
  );

export type AdminUnitsQuery = z.infer<typeof AdminUnitsQuerySchema>;

export const AdminBuildingsQuerySchema = z.object({
  search: optionalString,
  city: optionalString,
  is_active: optionalBoolean,
  page: positiveIntWithDefault(1),
  page_size: positiveIntWithDefault(50, { min: 1, max: 500 }),
  sort: optionalString,
});

export type AdminBuildingsQuery = z.infer<typeof AdminBuildingsQuerySchema>;

export const AdminBuildingCreateSchema = z
  .object({
    id: z.string().min(1),
    slug: z.string().min(1),
    name: z.string().min(1),
    comuna: z.string().min(1),
    address: z.string().min(1),
    amenities: z.array(z.string()).optional(),
    gallery: z.array(z.string()).optional(),
    coverImage: z.string().optional(),
    badges: z.array(z.unknown()).optional(),
    serviceLevel: z.enum(["pro", "standard"]).optional(),
    precio_desde: z.number().int().positive().optional(),
    precio_hasta: z.number().int().positive().optional(),
    gc_mode: z.enum(["MF", "variable"]).optional(),
    featured: z.boolean().optional(),
    units: z.array(UnitSchema).optional(),
  })
  .passthrough();

export const AdminBuildingUpdateSchema = AdminBuildingCreateSchema.partial();

export const AdminUnitCreateSchema = UnitSchema.extend({
  publicationStatus: z.enum(["draft", "published", "archived"]).optional(),
  publication_status: z.enum(["draft", "published", "archived"]).optional(),
}).passthrough();

export const AdminUnitUpdateSchema = AdminUnitCreateSchema.partial();

export const AdminMediaUploadUrlSchema = z.object({
  buildingId: z.string().min(1),
  unitId: z.string().optional(),
  scope: z.enum(["building", "unit"]),
  mediaType: z.enum(["image", "video"]),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().int().positive(),
  isCover: z.boolean().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
});

export const AdminMediaConfirmSchema = z.object({
  buildingId: z.string().min(1),
  unitId: z.string().optional(),
  scope: z.enum(["building", "unit"]),
  mediaType: z.enum(["image", "video"]),
  bucket: z.string().min(1),
  path: z.string().min(1),
  token: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().int().positive(),
  isCover: z.boolean().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
});

export interface AdminMediaAsset {
  id: string;
  owner_id: string;
  building_id: string | null;
  media_type: AdminMediaType;
  mime: string;
  size: number;
  bucket: string;
  path: string;
  public_url: string;
  sort_order: number;
  is_cover: boolean;
  created_at: string;
  updated_at: string;
}

export type AdminBuildingRecord = Omit<Building, "units"> & {
  units: Unit[];
  isActive: boolean;
};

export type AdminUnitRecord = Unit & {
  buildingName: string;
  publicationStatus: AdminPublicationStatus;
};

export function parseAdminUnitsQuery(searchParams: URLSearchParams) {
  return AdminUnitsQuerySchema.safeParse({
    search: searchParams.get("search"),
    building_id: searchParams.get("building_id") ?? searchParams.get("buildingId"),
    typology: searchParams.get("typology") ?? searchParams.get("tipologia"),
    disponible: searchParams.get("disponible"),
    status: searchParams.get("status"),
    price_min: searchParams.get("price_min") ?? searchParams.get("minPrice"),
    price_max: searchParams.get("price_max") ?? searchParams.get("maxPrice"),
    page: searchParams.get("page"),
    page_size: searchParams.get("page_size") ?? searchParams.get("limit"),
    sort: searchParams.get("sort"),
  });
}

export function parseAdminBuildingsQuery(searchParams: URLSearchParams) {
  return AdminBuildingsQuerySchema.safeParse({
    search: searchParams.get("search"),
    city: searchParams.get("city") ?? searchParams.get("comuna"),
    is_active: searchParams.get("is_active"),
    page: searchParams.get("page"),
    page_size: searchParams.get("page_size") ?? searchParams.get("limit"),
    sort: searchParams.get("sort"),
  });
}

export function createAdminListMeta({
  page,
  pageSize,
  total,
}: {
  page: number;
  pageSize: number;
  total: number;
}): AdminListMeta {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    page,
    page_size: pageSize,
    total,
    total_pages: totalPages,
    has_next_page: page < totalPages,
    has_prev_page: page > 1,
  };
}

export function adminOk<T>(
  data: T,
  {
    meta = null,
    status = 200,
  }: {
    meta?: AdminListMeta | null;
    status?: number;
  } = {}
) {
  const body: AdminApiResponse<T> = {
    success: true,
    data,
    meta,
    error: null,
  };

  if (meta) {
    body.pagination = meta;
  }

  return NextResponse.json(body, { status });
}

export function adminError(
  code: string,
  message: string,
  {
    status,
    details,
  }: {
    status: number;
    details?: unknown;
  }
) {
  const body: AdminApiResponse<null, null> = {
    success: false,
    data: null,
    meta: null,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  };

  return NextResponse.json(body, { status });
}
