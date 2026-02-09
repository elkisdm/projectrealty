import { generateSlug } from "@lib/utils/slug";
import type {
  AdminBuildingRecord,
  AdminPublicationStatus,
  AdminUnitRecord,
} from "@lib/admin/contracts";

function toStringOr(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return fallback;
}

function toNullableString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function toNumberOr(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function toBooleanOr(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const lowered = value.toLowerCase();
    if (["true", "1", "yes", "si"].includes(lowered)) return true;
    if (["false", "0", "no"].includes(lowered)) return false;
  }

  return fallback;
}

function toArrayOfStrings(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
}

function parsePublicationStatus(value: unknown): AdminPublicationStatus {
  if (value === "published" || value === "archived") {
    return value;
  }

  return "draft";
}

const validAvailabilityStatuses = new Set(["available", "reserved", "rented"]);

export function mapBuildingRow(row: Record<string, unknown>): AdminBuildingRecord {
  const id = toStringOr(row.id, "");
  const slug = toStringOr(row.slug, generateSlug(toStringOr(row.name ?? row.nombre, id || "edificio")));
  const name = toStringOr(row.name ?? row.nombre, id || "Edificio");
  const comuna = toStringOr(row.comuna, "Sin comuna");
  const address = toStringOr(row.address ?? row.direccion, "Dirección no informada");

  return {
    id,
    slug,
    name,
    comuna,
    address,
    amenities: toArrayOfStrings(row.amenities),
    gallery: toArrayOfStrings(row.gallery),
    coverImage: toNullableString(row.cover_image ?? row.coverImage),
    badges: Array.isArray(row.badges) ? row.badges : undefined,
    serviceLevel:
      row.service_level === "pro" || row.service_level === "standard"
        ? row.service_level
        : row.serviceLevel === "pro" || row.serviceLevel === "standard"
        ? row.serviceLevel
        : undefined,
    units: [],
    precio_desde: Number.isFinite(Number(row.precio_desde)) ? Number(row.precio_desde) : undefined,
    precio_hasta: Number.isFinite(Number(row.precio_hasta)) ? Number(row.precio_hasta) : undefined,
    gc_mode: row.gc_mode === "MF" || row.gc_mode === "variable" ? row.gc_mode : undefined,
    featured: typeof row.featured === "boolean" ? row.featured : undefined,
    hasAvailability: typeof row.has_availability === "boolean" ? row.has_availability : undefined,
    isActive: toBooleanOr(row.is_active, true),
  };
}

export function mapUnitRow(
  row: Record<string, unknown>,
  buildingRow?: Record<string, unknown> | null
): AdminUnitRecord {
  const buildingId = toStringOr(row.building_id ?? row.buildingId, "");
  const buildingSlug = toStringOr(buildingRow?.slug, generateSlug(toStringOr(buildingId, "building")));
  const buildingName = toStringOr(buildingRow?.name ?? buildingRow?.nombre, "Sin edificio");

  const codigoUnidad =
    toNullableString(row.codigo_unidad) ??
    toNullableString(row.codigoUnidad) ??
    toNullableString(row.unidad) ??
    toStringOr(row.id, "unidad").split("-").at(-1) ??
    "unidad";

  const dormitorios = Math.max(
    0,
    Math.trunc(toNumberOr(row.dormitorios ?? row.bedrooms, 0))
  );

  const banos = Math.max(1, Math.trunc(toNumberOr(row.banos ?? row.bathrooms, 1)));

  const price = Math.max(0, Math.trunc(toNumberOr(row.price ?? row.precio, 0)));
  const garantia = Math.max(1, Math.trunc(toNumberOr(row.garantia ?? price, 1)));

  const slugFallback = `${buildingSlug}-${generateSlug(codigoUnidad)}`;

  const mappedStatus = toNullableString(row.status);
  const status = mappedStatus && validAvailabilityStatuses.has(mappedStatus)
    ? (mappedStatus as "available" | "reserved" | "rented")
    : undefined;

  const gastoComun = (() => {
    const value = toNumberOr(row.gasto_comun ?? row.gastos_comunes ?? row.gc, Number.NaN);
    return Number.isFinite(value) ? Math.trunc(value) : undefined;
  })();

  const m2 = (() => {
    const value = toNumberOr(row.m2 ?? row.area_m2, Number.NaN);
    return Number.isFinite(value) ? value : undefined;
  })();

  const draftStep = (() => {
    const value = Number(row.draft_step);
    if (!Number.isFinite(value)) return undefined;
    const normalized = Math.max(1, Math.trunc(value));
    return normalized <= 7 ? normalized : 7;
  })();

  const draftCompletedSteps = toArrayOfStrings(row.draft_completed_steps);

  return {
    id: toStringOr(row.id, ""),
    slug: toStringOr(row.slug, slugFallback),
    tipologia: toStringOr(row.tipologia, "Studio"),
    price,
    disponible: toBooleanOr(row.disponible, true),
    codigoUnidad,
    buildingId,
    dormitorios,
    banos,
    garantia,
    gastoComun,
    gastosComunes: gastoComun,
    m2,
    piso: Number.isFinite(Number(row.piso)) ? Number(row.piso) : undefined,
    vista: toNullableString(row.vista),
    images: toArrayOfStrings(row.images),
    videos: toArrayOfStrings(row.videos),
    amoblado: typeof row.amoblado === "boolean" ? row.amoblado : undefined,
    estacionamiento: typeof row.estacionamiento === "boolean" ? row.estacionamiento : undefined,
    bodega: typeof row.bodega === "boolean" ? row.bodega : undefined,
    pet_friendly:
      typeof row.pet_friendly === "boolean"
        ? row.pet_friendly
        : typeof row.petFriendly === "boolean"
        ? row.petFriendly
        : undefined,
    bedrooms: dormitorios,
    bathrooms: banos,
    status,
    publicationStatus: parsePublicationStatus(row.publication_status),
    publication_status: parsePublicationStatus(row.publication_status),
    operationType:
      row.operation_type === "rent" || row.operationType === "rent" ? "rent" : undefined,
    operation_type:
      row.operation_type === "rent" || row.operationType === "rent" ? "rent" : undefined,
    publicationTitle: toNullableString(row.publication_title ?? row.publicationTitle),
    publication_title: toNullableString(row.publication_title ?? row.publicationTitle),
    publicationDescription: toNullableString(
      row.publication_description ?? row.publicationDescription
    ),
    publication_description: toNullableString(
      row.publication_description ?? row.publicationDescription
    ),
    unitAmenities: toArrayOfStrings(row.unit_amenities ?? row.unitAmenities),
    unit_amenities: toArrayOfStrings(row.unit_amenities ?? row.unitAmenities),
    draftStep,
    draft_step: draftStep,
    draftCompletedSteps,
    draft_completed_steps: draftCompletedSteps,
    draftLastSavedAt: toNullableString(row.draft_last_saved_at ?? row.draftLastSavedAt),
    draft_last_saved_at: toNullableString(row.draft_last_saved_at ?? row.draftLastSavedAt),
    publishedAt: toNullableString(row.published_at ?? row.publishedAt),
    published_at: toNullableString(row.published_at ?? row.publishedAt),
    archivedAt: toNullableString(row.archived_at ?? row.archivedAt),
    archived_at: toNullableString(row.archived_at ?? row.archivedAt),
    buildingName,
    area_interior_m2: Number.isFinite(Number(row.area_interior_m2))
      ? Number(row.area_interior_m2)
      : undefined,
    area_exterior_m2: Number.isFinite(Number(row.area_exterior_m2))
      ? Number(row.area_exterior_m2)
      : undefined,
    orientacion: toNullableString(row.orientacion),
    petFriendly:
      typeof row.pet_friendly === "boolean"
        ? row.pet_friendly
        : typeof row.petFriendly === "boolean"
        ? row.petFriendly
        : undefined,
    parking_ids: typeof row.parking_ids === "string" ? row.parking_ids : null,
    storage_ids: typeof row.storage_ids === "string" ? row.storage_ids : null,
    parking_opcional:
      typeof row.parking_opcional === "boolean"
        ? row.parking_opcional
        : typeof row.parking_optional === "boolean"
        ? row.parking_optional
        : undefined,
    storage_opcional:
      typeof row.storage_opcional === "boolean"
        ? row.storage_opcional
        : typeof row.storage_optional === "boolean"
        ? row.storage_optional
        : undefined,
    guarantee_installments: Number.isFinite(Number(row.guarantee_installments))
      ? Number(row.guarantee_installments)
      : undefined,
    guarantee_months: Number.isFinite(Number(row.guarantee_months))
      ? Number(row.guarantee_months)
      : undefined,
    rentas_necesarias: Number.isFinite(Number(row.rentas_necesarias))
      ? Number(row.rentas_necesarias)
      : undefined,
    renta_minima: Number.isFinite(Number(row.renta_minima))
      ? Number(row.renta_minima)
      : undefined,
    link_listing: toNullableString(row.link_listing),
    conexion_lavadora:
      typeof row.conexion_lavadora === "boolean" ? row.conexion_lavadora : undefined,
  };
}
