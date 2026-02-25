import type { SearchFilters } from "@/types/search";

const LEGACY_BEDS_TO_DORMITORIOS_MIN: Record<string, number> = {
  studio: 0,
  estudio: 0,
  "1": 1,
  "1d": 1,
  "1d1b": 1,
  "2": 2,
  "2d": 2,
  "2d1b": 2,
  "2d2b": 2,
  "3": 3,
  "3+": 3,
  "3plus": 3,
  "3d": 3,
  "3d2b": 3,
  "4": 4,
  "4+": 4,
};

function parseNumber(value: string | null): number | undefined {
  if (!value || !value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseBoolean(value: string | null): boolean | undefined {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

function parseCsv(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function toSingleOrArray(values: string[]): string | string[] | undefined {
  if (values.length === 0) return undefined;
  return values.length === 1 ? values[0] : values;
}

function parseDormitoriosMinToken(token: string | undefined): number | undefined {
  if (!token) return undefined;
  const normalized = token.toLowerCase().trim();

  if (/^\d+$/.test(normalized)) {
    const value = Number(normalized);
    return Number.isFinite(value) ? value : undefined;
  }

  if (normalized.endsWith("+")) {
    const withoutPlus = normalized.slice(0, -1);
    if (/^\d+$/.test(withoutPlus)) {
      return Number(withoutPlus);
    }
  }

  return LEGACY_BEDS_TO_DORMITORIOS_MIN[normalized];
}

function parseDormitoriosMinFromLegacy(
  dormitorios: string | null,
  beds: string | null
): number | undefined {
  const dormitoriosCandidates = parseCsv(dormitorios)
    .map(parseDormitoriosMinToken)
    .filter((value): value is number => typeof value === "number");

  if (dormitoriosCandidates.length > 0) {
    return Math.max(...dormitoriosCandidates);
  }

  const bedsCandidates = parseCsv(beds)
    .map(parseDormitoriosMinToken)
    .filter((value): value is number => typeof value === "number");

  if (bedsCandidates.length > 0) {
    return Math.max(...bedsCandidates);
  }

  return undefined;
}

function dormitoriosMinToLegacyDormitorios(min: number | undefined): string | undefined {
  if (typeof min !== "number") return undefined;
  if (min <= 0) return "Estudio";
  if (min >= 4) return "4";
  return String(min);
}

export function parseSearchFiltersFromSearchParams(
  params: URLSearchParams
): SearchFilters {
  const operationRaw = params.get("operation") || params.get("intent");
  const operation = operationRaw === "rent" ? "rent" : undefined;

  const comunaValues = parseCsv(params.get("comuna"));
  const tiposValues = parseCsv(params.get("tipos"));

  const dormitoriosMin =
    parseNumber(params.get("dormitoriosMin")) ??
    parseDormitoriosMinFromLegacy(params.get("dormitorios"), params.get("beds"));

  const precioMax = parseNumber(params.get("precioMax") || params.get("priceMax"));

  return {
    q: params.get("q")?.trim() || undefined,
    comuna: toSingleOrArray(comunaValues),
    operation,
    precioMin: parseNumber(params.get("precioMin")),
    precioMax,
    dormitoriosMin,
    tipos: toSingleOrArray(tiposValues),
    estacionamiento: parseBoolean(params.get("estacionamiento")),
    bodega: parseBoolean(params.get("bodega")),
    mascotas: parseBoolean(params.get("mascotas")),

    // Legacy compatibility fields
    dormitorios: toSingleOrArray(parseCsv(params.get("dormitorios"))) as SearchFilters["dormitorios"],
    beds: toSingleOrArray(parseCsv(params.get("beds"))),
    priceMax: params.get("priceMax") || undefined,
    moveIn: params.get("moveIn") || undefined,
  };
}

function writeCsvParam(params: URLSearchParams, key: string, value: string | string[] | undefined): void {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    params.delete(key);
    return;
  }

  const serialized = Array.isArray(value) ? value.join(",") : value;
  params.set(key, serialized);
}

export function applySearchFiltersToSearchParams(
  params: URLSearchParams,
  filters: Partial<SearchFilters>
): URLSearchParams {
  if (filters.q !== undefined) {
    const value = filters.q?.trim();
    if (value) params.set("q", value);
    else params.delete("q");
  }

  if (filters.comuna !== undefined) {
    writeCsvParam(params, "comuna", filters.comuna);
  }

  if (filters.operation !== undefined) {
    if (filters.operation) {
      params.set("operation", filters.operation);
      params.set("intent", filters.operation);
    } else {
      params.delete("operation");
      params.delete("intent");
    }
  }

  if (filters.precioMin !== undefined) {
    if (typeof filters.precioMin === "number") params.set("precioMin", String(filters.precioMin));
    else params.delete("precioMin");
  }

  if (filters.precioMax !== undefined) {
    if (typeof filters.precioMax === "number") {
      params.set("precioMax", String(filters.precioMax));
      params.set("priceMax", String(filters.precioMax));
    } else {
      params.delete("precioMax");
      params.delete("priceMax");
    }
  }

  if (filters.dormitoriosMin !== undefined) {
    if (typeof filters.dormitoriosMin === "number") {
      params.set("dormitoriosMin", String(filters.dormitoriosMin));
      const legacyDormitorio = dormitoriosMinToLegacyDormitorios(filters.dormitoriosMin);
      if (legacyDormitorio) params.set("dormitorios", legacyDormitorio);
      else params.delete("dormitorios");
    } else {
      params.delete("dormitoriosMin");
      params.delete("dormitorios");
    }
  }

  if (filters.tipos !== undefined) {
    writeCsvParam(params, "tipos", filters.tipos);
  }

  if (filters.estacionamiento !== undefined) {
    if (typeof filters.estacionamiento === "boolean") {
      params.set("estacionamiento", String(filters.estacionamiento));
    } else {
      params.delete("estacionamiento");
    }
  }

  if (filters.bodega !== undefined) {
    if (typeof filters.bodega === "boolean") {
      params.set("bodega", String(filters.bodega));
    } else {
      params.delete("bodega");
    }
  }

  if (filters.mascotas !== undefined) {
    if (typeof filters.mascotas === "boolean") {
      params.set("mascotas", String(filters.mascotas));
    } else {
      params.delete("mascotas");
    }
  }

  return params;
}

export function buildSearchParams(filters: Partial<SearchFilters>): URLSearchParams {
  return applySearchFiltersToSearchParams(new URLSearchParams(), filters);
}

export function areSearchFiltersEqual(a: Partial<SearchFilters>, b: Partial<SearchFilters>): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
