import type { AdminBuildingRecord, AdminBuildingsQuery, AdminListMeta } from "@lib/admin/contracts";
import { createAdminListMeta } from "@lib/admin/contracts";
import { getAdminDbClient } from "@lib/admin/repositories/client";
import { mapBuildingRow, mapUnitRow } from "@lib/admin/repositories/mappers";
import { getTableColumns, pickKnownColumns } from "@lib/admin/repositories/table-columns";
import type { Unit } from "@schemas/models";

export type BuildingCreateInput = {
  id: string;
  slug: string;
  name: string;
  comuna: string;
  address: string;
  amenities?: string[];
  gallery?: string[];
  coverImage?: string;
  units?: Unit[];
  badges?: unknown[];
  serviceLevel?: "pro" | "standard";
  precio_desde?: number;
  precio_hasta?: number;
  gc_mode?: "MF" | "variable";
  featured?: boolean;
  region?: string;
  descripcion?: string;
  conectividad?: unknown;
  metroCercano?: { nombre?: string; distancia?: number; tiempoCaminando?: number } | null;
  tipoProyecto?: string;
  administracion?: string;
  seguridadAccesos?: string[];
  estacionamientos?: unknown;
  bodegas?: unknown;
  serviciosEdificio?: string[];
  politicaMascotas?: unknown;
  requisitosArriendo?: unknown;
  infoContrato?: unknown;
  ocupacion?: unknown;
  terminaciones?: string[];
  equipamiento?: string[];
  [key: string]: unknown;
};

function parseSort(sort: string | undefined) {
  if (!sort) {
    return { field: "created_at", direction: "desc" as const };
  }

  if (sort.includes(":")) {
    const [field, direction] = sort.split(":");
    return {
      field: field.trim(),
      direction: direction?.toLowerCase() === "asc" ? "asc" : "desc",
    };
  }

  return {
    field: sort,
    direction: "desc" as const,
  };
}

function sortBuildings(buildings: AdminBuildingRecord[], sort: string | undefined) {
  const { field, direction } = parseSort(sort);
  const dir = direction === "asc" ? 1 : -1;

  return [...buildings].sort((a, b) => {
    if (field === "name") {
      return a.name.localeCompare(b.name) * dir;
    }

    if (field === "city" || field === "comuna") {
      return a.comuna.localeCompare(b.comuna) * dir;
    }

    if (field === "is_active") {
      return (Number(a.isActive) - Number(b.isActive)) * dir;
    }

    return a.id.localeCompare(b.id) * dir;
  });
}

async function fetchUnitsByBuildingIds(buildingIds: string[]) {
  if (buildingIds.length === 0) {
    return new Map<string, Unit[]>();
  }

  const client = getAdminDbClient();
  const { data, error } = await client
    .from("units")
    .select("*")
    .in("building_id", buildingIds)
    .limit(10000);

  if (error) {
    throw new Error(`database_error: ${error.message}`);
  }

  const grouped = new Map<string, Unit[]>();
  const rows = (data || []) as Array<Record<string, unknown>>;

  rows.forEach((row) => {
    const buildingId = String(row.building_id ?? "");
    const buildingStub = { id: buildingId, name: "", slug: buildingId };
    const mapped = mapUnitRow(row, buildingStub);
    const current = grouped.get(buildingId) ?? [];
    current.push(mapped);
    grouped.set(buildingId, current);
  });

  return grouped;
}

function toBuildingRowPayload(input: Partial<BuildingCreateInput>) {
  const payload: Record<string, unknown> = {
    id: input.id,
    slug: input.slug,
    name: input.name,
    comuna: input.comuna,
    address: input.address,
    amenities: input.amenities,
    gallery: input.gallery,
    cover_image: input.coverImage,
    badges: input.badges,
    service_level: input.serviceLevel,
    precio_desde: input.precio_desde,
    precio_hasta: input.precio_hasta,
    gc_mode: input.gc_mode,
    featured: input.featured,
    region: input.region,
    descripcion: input.descripcion,
    conectividad: input.conectividad,
    metro_cercano: input.metroCercano,
    metro_cercano_nombre: input.metroCercano?.nombre,
    metro_cercano_distancia: input.metroCercano?.distancia,
    metro_cercano_tiempo: input.metroCercano?.tiempoCaminando,
    tipo_proyecto: input.tipoProyecto,
    administracion: input.administracion,
    seguridad_accesos: input.seguridadAccesos,
    estacionamientos: input.estacionamientos,
    bodegas: input.bodegas,
    servicios_edificio: input.serviciosEdificio,
    politica_mascotas: input.politicaMascotas,
    requisitos_arriendo: input.requisitosArriendo,
    info_contrato: input.infoContrato,
    ocupacion: input.ocupacion,
    terminaciones: input.terminaciones,
    equipamiento: input.equipamiento,
    updated_at: new Date().toISOString(),
  };

  if (!payload.cover_image && Array.isArray(payload.gallery) && payload.gallery.length > 0) {
    payload.cover_image = payload.gallery[0];
  }

  return payload;
}

export async function listAdminBuildings(query: AdminBuildingsQuery): Promise<{
  items: AdminBuildingRecord[];
  meta: AdminListMeta;
}> {
  const client = getAdminDbClient();
  const { data, error } = await client.from("buildings").select("*").limit(5000);

  if (error) {
    throw new Error(`database_error: ${error.message}`);
  }

  let buildings = ((data || []) as Array<Record<string, unknown>>).map((row) => mapBuildingRow(row));

  if (query.search) {
    const search = query.search.toLowerCase();
    buildings = buildings.filter(
      (building) =>
        building.name.toLowerCase().includes(search) ||
        building.slug.toLowerCase().includes(search) ||
        building.comuna.toLowerCase().includes(search) ||
        building.address.toLowerCase().includes(search)
    );
  }

  if (query.city) {
    const city = query.city.toLowerCase();
    buildings = buildings.filter((building) => building.comuna.toLowerCase().includes(city));
  }

  if (query.is_active !== undefined) {
    buildings = buildings.filter((building) => building.isActive === query.is_active);
  }

  buildings = sortBuildings(buildings, query.sort);

  const total = buildings.length;
  const page = query.page;
  const pageSize = query.page_size;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginated = buildings.slice(start, end);

  const unitsByBuildingId = await fetchUnitsByBuildingIds(paginated.map((building) => building.id));
  const enriched = paginated.map((building) => ({
    ...building,
    units: unitsByBuildingId.get(building.id) ?? [],
  }));

  return {
    items: enriched,
    meta: createAdminListMeta({ page, pageSize, total }),
  };
}

export async function getAllAdminBuildingsSnapshot(): Promise<AdminBuildingRecord[]> {
  const client = getAdminDbClient();
  const { data, error } = await client.from("buildings").select("*").limit(10000);

  if (error) {
    throw new Error(`database_error: ${error.message}`);
  }

  const baseBuildings = ((data || []) as Array<Record<string, unknown>>).map((row) =>
    mapBuildingRow(row)
  );
  const unitsByBuildingId = await fetchUnitsByBuildingIds(baseBuildings.map((building) => building.id));

  return baseBuildings.map((building) => ({
    ...building,
    units: unitsByBuildingId.get(building.id) ?? [],
  }));
}

export async function getAdminBuildingById(id: string): Promise<AdminBuildingRecord | null> {
  const client = getAdminDbClient();
  const { data, error } = await client
    .from("buildings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`database_error: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const mapped = mapBuildingRow(data as Record<string, unknown>);
  const unitsByBuildingId = await fetchUnitsByBuildingIds([id]);

  return {
    ...mapped,
    units: unitsByBuildingId.get(id) ?? [],
  };
}

export async function createAdminBuilding(input: BuildingCreateInput): Promise<AdminBuildingRecord> {
  const client = getAdminDbClient();
  const columns = await getTableColumns("buildings");
  const payload = pickKnownColumns(toBuildingRowPayload(input), columns);

  const { data, error } = await client.from("buildings").insert(payload).select("*").single();

  if (error) {
    throw new Error(`database_error: ${error.message}`);
  }

  const mapped = mapBuildingRow(data as Record<string, unknown>);

  return {
    ...mapped,
    units: [],
  };
}

export async function updateAdminBuilding(
  id: string,
  updates: Partial<BuildingCreateInput>
): Promise<AdminBuildingRecord> {
  const client = getAdminDbClient();
  const columns = await getTableColumns("buildings");
  const payload = pickKnownColumns(toBuildingRowPayload(updates), columns);

  delete payload.id;

  const { data, error } = await client
    .from("buildings")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`database_error: ${error.message}`);
  }

  const mapped = mapBuildingRow(data as Record<string, unknown>);
  const unitsByBuildingId = await fetchUnitsByBuildingIds([id]);

  return {
    ...mapped,
    units: unitsByBuildingId.get(id) ?? [],
  };
}

export async function deleteAdminBuilding(id: string): Promise<void> {
  const client = getAdminDbClient();

  const deleteUnitsResult = await client.from("units").delete().eq("building_id", id);
  if (deleteUnitsResult.error) {
    throw new Error(`database_error: ${deleteUnitsResult.error.message}`);
  }

  const deleteBuildingResult = await client.from("buildings").delete().eq("id", id);
  if (deleteBuildingResult.error) {
    throw new Error(`database_error: ${deleteBuildingResult.error.message}`);
  }
}
