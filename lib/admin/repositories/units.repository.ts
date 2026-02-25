import { randomUUID } from "crypto";
import type {
  AdminListMeta,
  AdminPublicationStep,
  AdminPublicationStatus,
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

const publicationStepOrder: AdminPublicationStep[] = [
  "building",
  "type",
  "media",
  "details",
  "pricing",
  "amenities",
  "review",
];

const publicationStepSet = new Set<AdminPublicationStep>(publicationStepOrder);

function getStepNumber(step: AdminPublicationStep): number {
  return publicationStepOrder.indexOf(step) + 1;
}

function normalizeCompletedSteps(steps: string[]): AdminPublicationStep[] {
  const valid = steps.filter((item): item is AdminPublicationStep =>
    publicationStepSet.has(item as AdminPublicationStep)
  );
  const deduped = Array.from(new Set(valid));
  deduped.sort((a, b) => getStepNumber(a) - getStepNumber(b));
  return deduped;
}

function parseSort(sort: string | undefined): { field: string; ascending: boolean } {
  if (!sort) {
    return { field: "created_at", ascending: false };
  }

  if (sort.includes(":")) {
    const [rawField, rawDirection] = sort.split(":");
    const direction = rawDirection?.toLowerCase() === "asc";
    const field = rawField.trim();
    return {
      field:
        field === "tipology" || field === "typology"
          ? "tipologia"
          : field === "status"
          ? "publication_status"
          : field === "building" || field === "building_name"
          ? "building_id"
          : field,
      ascending: direction,
    };
  }

  if (sort === "price-asc") return { field: "price", ascending: true };
  if (sort === "price-desc") return { field: "price", ascending: false };
  if (sort === "tipology" || sort === "typology") return { field: "tipologia", ascending: true };
  if (sort === "status") return { field: "publication_status", ascending: false };

  return { field: sort, ascending: false };
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
  const publicationTitle =
    typeof unit.publicationTitle === "string"
      ? unit.publicationTitle
      : typeof unit.publication_title === "string"
      ? unit.publication_title
      : "";

  const garantia =
    typeof unit.garantia === "number"
      ? unit.garantia
      : typeof unit.guarantee_months === "number"
      ? unit.guarantee_months
      : Number.NaN;

  const price = typeof unit.price === "number" ? unit.price : Number.NaN;

  const checks: Array<[boolean, string]> = [
    [publicationTitle.trim().length > 0, "publication_title"],
    [Boolean(unit.slug), "slug"],
    [Boolean(unit.codigoUnidad), "codigoUnidad"],
    [Boolean(unit.buildingId), "buildingId"],
    [Boolean(unit.tipologia), "tipologia"],
    [Number.isFinite(price) && price > 0, "price"],
    [typeof unit.dormitorios === "number" && unit.dormitorios >= 0, "dormitorios"],
    [typeof unit.banos === "number" && unit.banos > 0, "banos"],
    [Number.isFinite(garantia) && garantia > 0, "garantia"],
    [
      Number.isFinite(price) && Number.isFinite(garantia) && price > 0 && garantia > 0,
      "price_garantia_coherence",
    ],
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
    .select("id, slug, name, comuna, address")
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

function mapUnits(rows: Array<Record<string, unknown>>, buildingsMap: Map<string, Record<string, unknown>>) {
  return rows.map((row) => {
    const buildingId = String(row.building_id ?? "");
    const building = buildingsMap.get(buildingId) || null;
    return mapUnitRow(row, building);
  });
}

async function fetchBuildingsByIds(buildingIds: string[]) {
  if (buildingIds.length === 0) {
    return new Map<string, Record<string, unknown>>();
  }

  const client = getAdminDbClient();
  const { data, error } = await client
    .from("buildings")
    .select("id, slug, name, comuna, address")
    .in("id", buildingIds);

  if (error) {
    throw new Error(`database_error: ${error.message}`);
  }

  const map = new Map<string, Record<string, unknown>>();
  (data || []).forEach((row) => {
    map.set(String((row as Record<string, unknown>).id), row as Record<string, unknown>);
  });
  return map;
}

export async function listAdminUnits(query: AdminUnitsQuery): Promise<{
  items: AdminUnitRecord[];
  meta: AdminListMeta;
}> {
  const client = getAdminDbClient();
  const columns = await getTableColumns("units");
  const page = query.page;
  const pageSize = query.page_size;
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const searchableClauses = [
    "id",
    "slug",
    "tipologia",
    "unidad",
    "codigo_unidad",
    "publication_title",
  ]
    .filter((field) => columns.has(field))
    .map((field) => `${field}.ilike.%${query.search || ""}%`);

  let buildingIdsFromSearch: string[] = [];
  if (query.search) {
    const { data: buildingRows, error: buildingSearchError } = await client
      .from("buildings")
      .select("id")
      .or(`name.ilike.%${query.search}%,slug.ilike.%${query.search}%`)
      .limit(200);
    if (buildingSearchError) {
      throw new Error(`database_error: ${buildingSearchError.message}`);
    }
    buildingIdsFromSearch = (buildingRows || [])
      .map((row) => String((row as Record<string, unknown>).id || ""))
      .filter(Boolean);
  }

  let unitsQuery = client.from("units").select("*", { count: "exact" });

  if (query.search) {
    const orClauses = [...searchableClauses];
    if (buildingIdsFromSearch.length > 0) {
      const quotedBuildingIds = buildingIdsFromSearch
        .map((value) => `"${value.replace(/"/g, "")}"`)
        .join(",");
      orClauses.push(`building_id.in.(${quotedBuildingIds})`);
    }
    if (orClauses.length > 0) {
      unitsQuery = unitsQuery.or(orClauses.join(","));
    }
  }

  if (query.building_id) {
    unitsQuery = unitsQuery.eq("building_id", query.building_id);
  }
  if (query.typology) {
    unitsQuery = unitsQuery.ilike("tipologia", query.typology);
  }
  if (query.disponible !== undefined && columns.has("disponible")) {
    unitsQuery = unitsQuery.eq("disponible", query.disponible);
  }
  if (query.status && columns.has("publication_status")) {
    unitsQuery = unitsQuery.eq("publication_status", query.status);
  }
  if (query.price_min !== undefined && columns.has("price")) {
    unitsQuery = unitsQuery.gte("price", query.price_min);
  }
  if (query.price_max !== undefined && columns.has("price")) {
    unitsQuery = unitsQuery.lte("price", query.price_max);
  }

  const parsedSort = parseSort(query.sort);
  const sortField = columns.has(parsedSort.field) ? parsedSort.field : "created_at";
  unitsQuery = unitsQuery.order(sortField, { ascending: parsedSort.ascending, nullsFirst: false });
  unitsQuery = unitsQuery.range(start, end);

  const { data: unitRows, error, count } = await unitsQuery;
  if (error) {
    throw new Error(`database_error: ${error.message}`);
  }

  const rawRows = (unitRows || []) as Array<Record<string, unknown>>;
  const buildingIds = Array.from(
    new Set(rawRows.map((row) => String(row.building_id || "")).filter(Boolean))
  );
  const buildingsMap = await fetchBuildingsByIds(buildingIds);
  const paginated = mapUnits(rawRows, buildingsMap);
  const total = count ?? 0;

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
  const client = getAdminDbClient();
  const { data, error } = await client.from("units").select("*").limit(10000);
  if (error) {
    throw new Error(`database_error: ${error.message}`);
  }
  const rows = (data || []) as Array<Record<string, unknown>>;
  const buildingsMap = await fetchBuildingsMap();
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
  const operationType =
    input.operationType === "rent" || input.operation_type === "rent" ? "rent" : "rent";
  const publicationTitle =
    typeof input.publicationTitle === "string"
      ? input.publicationTitle
      : typeof input.publication_title === "string"
      ? input.publication_title
      : undefined;
  const publicationDescription =
    typeof input.publicationDescription === "string"
      ? input.publicationDescription
      : typeof input.publication_description === "string"
      ? input.publication_description
      : undefined;
  const unitAmenities = Array.isArray(input.unitAmenities)
    ? input.unitAmenities
    : Array.isArray(input.unit_amenities)
    ? input.unit_amenities
    : undefined;
  const draftStep =
    typeof input.draftStep === "number"
      ? input.draftStep
      : typeof input.draft_step === "number"
      ? input.draft_step
      : undefined;
  const draftCompletedSteps = Array.isArray(input.draftCompletedSteps)
    ? input.draftCompletedSteps
    : Array.isArray(input.draft_completed_steps)
    ? input.draft_completed_steps
    : undefined;
  const draftLastSavedAt =
    typeof input.draftLastSavedAt === "string"
      ? input.draftLastSavedAt
      : typeof input.draft_last_saved_at === "string"
      ? input.draft_last_saved_at
      : undefined;
  const publishedAt =
    typeof input.publishedAt === "string"
      ? input.publishedAt
      : typeof input.published_at === "string"
      ? input.published_at
      : undefined;
  const archivedAt =
    typeof input.archivedAt === "string"
      ? input.archivedAt
      : typeof input.archived_at === "string"
      ? input.archived_at
      : undefined;

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
    operation_type: operationType,
    publication_title: publicationTitle,
    publication_description: publicationDescription,
    unit_amenities: unitAmenities,
    draft_step: draftStep,
    draft_completed_steps: draftCompletedSteps,
    draft_last_saved_at: draftLastSavedAt,
    publication_status: publicationStatus,
    published_at: publishedAt,
    archived_at: archivedAt,
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
  const now = new Date().toISOString();

  const payload = toUnitRowPayload(
    {
      ...input,
      operation_type: "rent",
      draft_step: input.draft_step ?? input.draftStep ?? 1,
      draft_completed_steps: input.draft_completed_steps ?? input.draftCompletedSteps ?? [],
      draft_last_saved_at: now,
      ...(publicationStatus === "published" ? { published_at: now } : {}),
      ...(publicationStatus === "archived" ? { archived_at: now } : {}),
    },
    buildingId
  );
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
  const now = new Date().toISOString();
  const statusChanged = current.publicationStatus !== requestedPublicationStatus;

  const payload = toUnitRowPayload(
    {
      ...nextUnit,
      ...(updates as Partial<Unit>),
      publicationStatus: requestedPublicationStatus,
      operation_type: "rent",
      ...(statusChanged && requestedPublicationStatus === "published" ? { published_at: now } : {}),
      ...(statusChanged && requestedPublicationStatus === "archived" ? { archived_at: now } : {}),
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

export async function createAdminUnitDraft({
  buildingId,
  step = "building",
  initialData,
}: {
  buildingId: string;
  step?: AdminPublicationStep;
  initialData?: Partial<Unit>;
}): Promise<AdminUnitRecord> {
  const now = new Date().toISOString();
  const stepNumber = getStepNumber(step);
  const unitId = initialData?.id || `draft-${randomUUID()}`;
  const codigoUnidad = initialData?.codigoUnidad || `DRAFT-${unitId.slice(-6).toUpperCase()}`;
  const slug = initialData?.slug || `${buildingId}-draft-${unitId.slice(-6)}`;
  const tipologia = initialData?.tipologia || "Studio";

  const payloadUnit: Partial<Unit> = {
    ...initialData,
    id: unitId,
    buildingId,
    codigoUnidad,
    slug,
    tipologia,
    price: typeof initialData?.price === "number" ? initialData.price : 0,
    disponible: initialData?.disponible ?? true,
    dormitorios: initialData?.dormitorios ?? 0,
    banos: initialData?.banos ?? 1,
    garantia: initialData?.garantia ?? 0,
    publicationStatus: "draft",
    operation_type: "rent",
    draft_step: stepNumber,
    draft_completed_steps: normalizeCompletedSteps([step]),
    draft_last_saved_at: now,
  };

  const client = getAdminDbClient();
  const columns = await getTableColumns("units");
  const rowPayload = toUnitRowPayload(payloadUnit, buildingId);
  const insertPayload = pickKnownColumns(rowPayload, columns);

  const { data, error } = await client.from("units").insert(insertPayload).select("*").single();

  if (error) {
    throw new Error(`database_error: ${error.message}`);
  }

  const buildingMap = await fetchBuildingsMap();
  const row = data as Record<string, unknown>;
  const rowBuildingId = String(row.building_id ?? buildingId);
  return mapUnitRow(row, buildingMap.get(rowBuildingId) || null);
}

export async function saveAdminUnitDraftStep({
  id,
  step,
  data,
  completedSteps,
}: {
  id: string;
  step: AdminPublicationStep;
  data?: Partial<Unit>;
  completedSteps?: AdminPublicationStep[];
}): Promise<AdminUnitRecord> {
  const current = await getAdminUnitById(id);
  if (!current) {
    throw new Error("not_found: Unidad no encontrada");
  }

  const nextCompleted = normalizeCompletedSteps([
    ...(current.draftCompletedSteps || current.draft_completed_steps || []),
    ...(completedSteps || []),
    step,
  ]);

  const payloadUnit: Partial<Unit> = {
    ...current,
    ...(data || {}),
    buildingId: (data?.buildingId || current.buildingId) as string,
    publicationStatus: "draft",
    operation_type: "rent",
    draft_step: getStepNumber(step),
    draft_completed_steps: nextCompleted,
    draft_last_saved_at: new Date().toISOString(),
  };

  const client = getAdminDbClient();
  const columns = await getTableColumns("units");

  const rowPayload = toUnitRowPayload(payloadUnit, payloadUnit.buildingId as string);
  delete rowPayload.id;
  delete rowPayload.building_id;

  const updatePayload = pickKnownColumns(rowPayload, columns);

  const { data: updated, error } = await client
    .from("units")
    .update(updatePayload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`database_error: ${error.message}`);
  }

  const buildingMap = await fetchBuildingsMap();
  const row = updated as Record<string, unknown>;
  const rowBuildingId = String(row.building_id ?? payloadUnit.buildingId);
  return mapUnitRow(row, buildingMap.get(rowBuildingId) || null);
}

export async function publishAdminUnit({
  id,
  status = "published",
}: {
  id: string;
  status?: "published" | "archived";
}): Promise<AdminUnitRecord> {
  const current = await getAdminUnitById(id);
  if (!current) {
    throw new Error("not_found: Unidad no encontrada");
  }

  if (status === "published") {
    const completeness = calculatePublicationCompleteness(current);
    if (completeness.completeness < 100) {
      throw new Error(
        `validation_error: No se puede publicar. Campos faltantes: ${completeness.missing.join(", ")}`
      );
    }
  }

  const now = new Date().toISOString();
  const payloadUnit: Partial<Unit> = {
    ...current,
    publicationStatus: status,
    operation_type: "rent",
    draft_last_saved_at: now,
    ...(status === "published" ? { published_at: now } : {}),
    ...(status === "archived" ? { archived_at: now } : {}),
  };

  const client = getAdminDbClient();
  const columns = await getTableColumns("units");
  const rowPayload = toUnitRowPayload(payloadUnit, current.buildingId);
  delete rowPayload.id;
  delete rowPayload.building_id;
  const updatePayload = pickKnownColumns(rowPayload, columns);

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
  const rowBuildingId = String(row.building_id ?? current.buildingId);
  return mapUnitRow(row, buildingMap.get(rowBuildingId) || null);
}

export async function archiveAdminUnit(id: string): Promise<AdminUnitRecord> {
  return publishAdminUnit({ id, status: "archived" });
}

export async function deleteAdminUnit(id: string): Promise<void> {
  const client = getAdminDbClient();
  const { error } = await client.from("units").delete().eq("id", id);

  if (error) {
    throw new Error(`database_error: ${error.message}`);
  }
}
