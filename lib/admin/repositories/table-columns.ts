import { getAdminDbClient } from "@lib/admin/repositories/client";

type SupportedTable =
  | "buildings"
  | "units"
  | "unit_media"
  | "building_media"
  | "admin_activity_log";

const defaultColumns: Record<SupportedTable, string[]> = {
  buildings: [
    "id",
    "slug",
    "name",
    "comuna",
    "address",
    "amenities",
    "gallery",
    "cover_image",
    "badges",
    "service_level",
    "precio_desde",
    "precio_hasta",
    "gc_mode",
    "featured",
    "region",
    "descripcion",
    "conectividad",
    "metro_cercano",
    "metro_cercano_nombre",
    "metro_cercano_distancia",
    "metro_cercano_tiempo",
    "tipo_proyecto",
    "administracion",
    "seguridad_accesos",
    "estacionamientos",
    "bodegas",
    "servicios_edificio",
    "politica_mascotas",
    "requisitos_arriendo",
    "info_contrato",
    "ocupacion",
    "terminaciones",
    "equipamiento",
    "id_pmq",
    "is_active",
    "updated_at",
    "created_at",
  ],
  units: [
    "id",
    "building_id",
    "unidad",
    "slug",
    "id_pmq",
    "tipologia",
    "m2",
    "price",
    "gc",
    "total_mensual",
    "orientacion",
    "m2_terraza",
    "descuento_porcentaje",
    "meses_descuento",
    "garantia_meses",
    "garantia_cuotas",
    "rentas_necesarias",
    "pet_friendly",
    "reajuste_meses",
    "link_listing",
    "disponible",
    "estacionamiento",
    "bodega",
    "parking_optional",
    "storage_optional",
    "bedrooms",
    "bathrooms",
    "images_tipologia",
    "images_areas_comunes",
    "images",
    "videos",
    "conexion_lavadora",
    "publication_status",
    "updated_at",
    "created_at",
  ],
  unit_media: [
    "id",
    "owner_id",
    "building_id",
    "media_type",
    "mime",
    "size",
    "bucket",
    "path",
    "public_url",
    "sort_order",
    "is_cover",
    "created_at",
    "updated_at",
  ],
  building_media: [
    "id",
    "owner_id",
    "building_id",
    "media_type",
    "mime",
    "size",
    "bucket",
    "path",
    "public_url",
    "sort_order",
    "is_cover",
    "created_at",
    "updated_at",
  ],
  admin_activity_log: [
    "id",
    "actor_id",
    "actor_email",
    "actor_role",
    "action",
    "entity",
    "entity_id",
    "metadata",
    "created_at",
  ],
};

const cache = new Map<SupportedTable, Set<string>>();

export async function getTableColumns(table: SupportedTable): Promise<Set<string>> {
  const cached = cache.get(table);
  if (cached) {
    return cached;
  }

  const client = getAdminDbClient();
  const { data, error } = await client.from(table).select("*").limit(1);

  if (error) {
    const fallback = new Set(defaultColumns[table]);
    cache.set(table, fallback);
    return fallback;
  }

  if (data && data.length > 0) {
    const discovered = new Set(Object.keys(data[0] as Record<string, unknown>));
    defaultColumns[table].forEach((column) => discovered.add(column));
    cache.set(table, discovered);
    return discovered;
  }

  const fallback = new Set(defaultColumns[table]);
  cache.set(table, fallback);
  return fallback;
}

export function pickKnownColumns(
  payload: Record<string, unknown>,
  columns: Set<string>
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(payload).filter(([key, value]) => columns.has(key) && value !== undefined)
  );
}
