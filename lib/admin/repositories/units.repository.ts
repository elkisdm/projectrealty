import { randomUUID } from "crypto";
import type {
  AdminListMeta,
  AdminPublicationStatus,
  AdminUnitCreateSchema,
  AdminUnitRecord,
  AdminUnitsQuery,
} from "@lib/admin/contracts";
import {
  createAdminListMeta,
} from "@lib/admin/contracts";
import { getAdminDbClient } from "@lib/admin/repositories/client";
import { mapUnitRow } from "@lib/admin/repositories/mappers";
import { getTableColumns, pickKnownColumns } from "@lib/admin/repositories/table-columns";
import type { Unit } from "@schemas/models";

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

  if (sort === "price-asc") return { field: "price", direction: "asc" as const };
  if (sort === "price-desc") return { field: "price", direction: "desc" as const };

  return { field: sort, direction: "desc" as const };
}

function sortUnits(units: AdminUnitRecord[], sort: string | undefined) {
  const { field, direction } = parseSort(sort);

  const sorted = [...units].sort((a, b) => {
    const dir = direction === "asc" ? 1 : -1;

    if (field === "price") {
      return (a.price - b.price) * dir;
    }

    if (field === "tipology" || field === "typology" || field === "tipologia") {
      return a.tipologia.localeCompare(b.tipologia) * dir;
    }

    if (field === "building" || field === "building_name") {
      return a.buildingName.localeCompare(b.buildingName) * dir;
    }

    if (field === "status") {
      return a.publicationStatus.localeCompare(b.publicationStatus) * dir;
    }

    return a.id.localeCompare(b.id) * dir;
  });

  return sorted;
}

function toPublicationStatus(value: unknown): AdminPublicationStatus | undefined {
  if (value === "draft" || value === "published" || value === "archived") {
    return value;
  }

  return undefined;
}

function calculatePublicationCompleteness(unit: Partial<Unit>): {
  completeness: number;
  missing: string[];
} {
  const checks: Array<[boolean, string]> = [
    [Boolean(unit.slug), "slug"],
    [Boolean(unit.codigoUnidad), "codigoUnidad"],
    [Boolean(unit.buildingId), "buildingId"],
    [Boolean(unit.tipologia), "tipologia"],
    [typeof unit.price === "number" && unit.price > 0, "price"],
    [typeof unit.dormitorios === "number" && unit.dormitorios >= 0, "dormitorios"],
    [typeof unit.banos === "number" && unit.banos > 0, "banos"],
    [typeof unit.garantia === "number" && unit.garantia > 0, "garantia"],
    [Array.isArray(unit.images) && unit.images.length > 0, "images"],
  ];

  const passed = checks.filter(([ok]) => ok).length;
  const missing = checks.filter(([ok]) => !ok).map(([, field]) => field);

  return {
    completeness: Math.round((passed / checks.length) * 100),
    missing,
  };
}

async function fetchBuildingsMap() {
  const client = getAdminDbClient();
  const { data, error } = await client
    .from("buildings")
    .select("id, slug, name, comuna, address, is_active")
    .limit(5000);

  if (error) {
    throw new Error(`database_error: ${error.message}`);
  }

  const map = new Map<string, Record<string, unknown>>();
  (data || []).forEach((row) => {
    map.set(String((row as Record<string, unknown>).id), row as Record<string, unknown>);
  });

  return map;
}

async function fetchAllUnitsRaw() {
  const client = getAdminDbClient();
  const { data, error } = await client.from("units").select("*").limit(10000);

  if (error) {
    throw new Error(`database_error: ${error.message}`);
  }

  return (data || []) as Array<Record<string, unknown>>;
}

function mapUnits(rows: Array<Record<string, unknown>>, buildingsMap: Map<string, Record<string, unknown>>) {
  return rows.map((row) => {
    const buildingId = String(row.building_id ?? "");
    const building = buildingsMap.get(buildingId) || null;
    return mapUnitRow(row, building);
  });
}

export async function listAdminUnits(query: AdminUnitsQuery): Promise<{
  items: AdminUnitRecord[];
  meta: AdminListMeta;
}> {
  const [rows, buildingsMap] = await Promise.all([fetchAllUnitsRaw(), fetchBuildingsMap()]);

  let units = mapUnits(rows, buildingsMap);

  if (query.search) {
    const search = query.search.toLowerCase();
    units = units.filter(
      (unit) =>
        unit.id.toLowerCase().includes(search) ||
        unit.tipologia.toLowerCase().includes(search) ||
        unit.buildingName.toLowerCase().includes(search) ||
        unit.codigoUnidad.toLowerCase().includes(search)
    );
  }

  if (query.building_id) {
    units = units.filter((unit) => unit.buildingId === query.building_id);
  }

  if (query.typology) {
    const typology = query.typology.toLowerCase();
    units = units.filter((unit) => unit.tipologia.toLowerCase() === typology);
  }

  if (query.disponible !== undefined) {
    units = units.filter((unit) => unit.disponible === query.disponible);
  }

  if (query.status) {
    units = units.filter((unit) => unit.publicationStatus === query.status);
  }

  if (query.price_min !== undefined) {
    units = units.filter((unit) => unit.price >= query.price_min!);
  }

  if (query.price_max !== undefined) {
    units = units.filter((unit) => unit.price <= query.price_max!);
  }

  units = sortUnits(units, query.sort);

  const total = units.length;
  const page = query.page;
  const pageSize = query.page_size;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginated = units.slice(start, end);

  return {
    items: paginated,
    meta: createAdminListMeta({
      page,
      pageSize,
      total,
    }),
  };
}

export async function getAllAdminUnitsSnapshot(): Promise<AdminUnitRecord[]> {
  const [rows, buildingsMap] = await Promise.all([fetchAllUnitsRaw(), fetchBuildingsMap()]);
  return mapUnits(rows, buildingsMap);
}

export async function getAdminUnitById(id: string): Promise<AdminUnitRecord | null> {
  const client = getAdminDbClient();
  const [unitResult, buildingMap] = await Promise.all([
    client.from("units").select("*").eq("id", id).maybeSingle(),
    fetchBuildingsMap(),
  ]);

  if (unitResult.error) {
    throw new Error(`database_error: ${unitResult.error.message}`);
  }

  if (!unitResult.data) {
    return null;
  }

  const row = unitResult.data as Record<string, unknown>;
  const buildingId = String(row.building_id ?? "");
  return mapUnitRow(row, buildingMap.get(buildingId) || null);
}

function toUnitRowPayload(input: Partial<Unit>, buildingId: string) {
  const publicationStatus =
    toPublicationStatus((input as Partial<Unit> & { publicationStatus?: unknown }).publicationStatus) ??
    toPublicationStatus((input as Partial<Unit> & { publication_status?: unknown }).publication_status);

  const bedrooms = typeof input.dormitorios === "number" ? input.dormitorios : input.bedrooms;
  const bathrooms = typeof input.banos === "number" ? input.banos : input.bathrooms;
  const gc = typeof input.gastoComun === "number" ? input.gastoComun : input.gastosComunes;

  const payload: Record<string, unknown> = {
    id: input.id ?? randomUUID(),
    building_id: buildingId,
    unidad: input.codigoUnidad,
    slug: input.slug,
    id_pmq: input.codigoInterno,
    tipologia: input.tipologia,
    m2: input.m2,
    price: input.price,
    gc,
    total_mensual: typeof input.price === "number" && typeof gc === "number" ? input.price + gc : undefined,
    orientacion: input.orientacion,
    m2_terraza: input.m2_terraza,
    descuento_porcentaje: input.descuento_porcentaje,
    meses_descuento: input.meses_descuento,
    garantia_meses: input.guarantee_months ?? input.garantia,
    garantia_cuotas: input.guarantee_installments,
    rentas_necesarias: input.rentas_necesarias,
    pet_friendly: input.petFriendly ?? input.pet_friendly,
    reajuste_meses: typeof input.reajuste === "string" ? Number.parseInt(input.reajuste, 10) : input.reajuste_meses,
    link_listing: input.link_listing,
    disponible: input.disponible,
    estacionamiento: input.estacionamiento,
    bodega: input.bodega,
    parking_optional: input.parking_opcional,
    storage_optional: input.storage_opcional,
    bedrooms,
    bathrooms,
    images_tipologia: input.imagesTipologia,
    images_areas_comunes: input.imagesAreasComunes,
    images: input.images,
    videos: input.videos,
    conexion_lavadora: input.conexion_lavadora,
    publication_status: publicationStatus,
    updated_at: new Date().toISOString(),
  };

  return payload;
}

export async function createAdminUnit(input: Unit, buildingId: string): Promise<AdminUnitRecord> {
  const publicationStatus =
    toPublicationStatus((input as Unit & { publicationStatus?: unknown }).publicationStatus) ?? "draft";

  if (publicationStatus === "published") {
    const completeness = calculatePublicationCompleteness(input);
    if (completeness.completeness < 100) {
      throw new Error(`validation_error: No se puede publicar. Campos faltantes: ${completeness.missing.join(", ")}`);
    }
  }

  const client = getAdminDbClient();
  const columns = await getTableColumns("units");

  const payload = toUnitRowPayload(input, buildingId);
  if (!columns.has("publication_status")) {
    delete payload.publication_status;
  }

  const insertPayload = pickKnownColumns(payload, columns);

  const { data, error } = await client.from("units").insert(insertPayload).select("*").single();

  if (error) {
    throw new Error(`database_error: ${error.message}`);
  }

  const buildingMap = await fetchBuildingsMap();
  return mapUnitRow(data as Record<string, unknown>, buildingMap.get(buildingId) || null);
}

export async function updateAdminUnit(
  id: string,
  updates: Partial<Unit>
): Promise<AdminUnitRecord> {
  const current = await getAdminUnitById(id);

  if (!current) {
    throw new Error("not_found: Unidad no encontrada");
  }

  const nextUnit: Unit = {
    ...current,
    ...updates,
    buildingId: updates.buildingId ?? current.buildingId,
    dormitorios: updates.dormitorios ?? current.dormitorios,
    banos: updates.banos ?? current.banos,
    garantia: updates.garantia ?? current.garantia,
    codigoUnidad: updates.codigoUnidad ?? current.codigoUnidad,
    slug: updates.slug ?? current.slug,
    tipologia: updates.tipologia ?? current.tipologia,
    price: updates.price ?? current.price,
    disponible: updates.disponible ?? current.disponible,
  };

  const requestedPublicationStatus =
    toPublicationStatus((updates as Partial<Unit> & { publicationStatus?: unknown }).publicationStatus) ??
    toPublicationStatus((updates as Partial<Unit> & { publication_status?: unknown }).publication_status) ??
    current.publicationStatus;

  if (requestedPublicationStatus === "published") {
    const completeness = calculatePublicationCompleteness(nextUnit);
    if (completeness.completeness < 100) {
      throw new Error(`validation_error: No se puede publicar. Campos faltantes: ${completeness.missing.join(", ")}`);
    }
  }

  const client = getAdminDbClient();
  const columns = await getTableColumns("units");

  const payload = toUnitRowPayload(
    {
      ...nextUnit,
      ...(updates as Partial<Unit>),
      publicationStatus: requestedPublicationStatus,
    },
    nextUnit.buildingId
  );

  delete payload.id;
  delete payload.building_id;

  if (!columns.has("publication_status")) {
    delete payload.publication_status;
  }

  const updatePayload = pickKnownColumns(payload, columns);

  const { data, error } = await client
    .from("units")
    .update(updatePayload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`database_error: ${error.message}`);
  }

  const buildingMap = await fetchBuildingsMap();
  const row = data as Record<string, unknown>;
  const buildingId = String(row.building_id ?? nextUnit.buildingId);
  return mapUnitRow(row, buildingMap.get(buildingId) || null);
}

export async function deleteAdminUnit(id: string): Promise<void> {
  const client = getAdminDbClient();
  const { error } = await client.from("units").delete().eq("id", id);

  if (error) {
    throw new Error(`database_error: ${error.message}`);
  }
}
