import { NextRequest, NextResponse } from "next/server";
import { getSupabaseProcessor } from "@/lib/supabase-data-processor";
import { createRateLimiter } from "@lib/rate-limit";
import { logger } from "@lib/logger";
import { SearchFiltersSchema, type BuildingsResponse } from "@/schemas/models";

const rateLimiter = createRateLimiter({ windowMs: 60_000, max: 60 });

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

function parseDormitoriosLegacyValue(token: string | undefined): number | undefined {
  if (!token) return undefined;
  const normalized = token.toLowerCase().trim();

  if (/^\d+$/.test(normalized)) {
    const value = Number(normalized);
    return Number.isFinite(value) ? value : undefined;
  }

  if (normalized.endsWith("+")) {
    const withoutPlus = normalized.slice(0, -1);
    if (/^\d+$/.test(withoutPlus)) return Number(withoutPlus);
  }

  return LEGACY_BEDS_TO_DORMITORIOS_MIN[normalized];
}

function parseDormitoriosMinFromLegacy(
  dormitoriosRaw: string | null,
  bedsRaw: string | null
): number | undefined {
  const dormitoriosCandidates = parseCsv(dormitoriosRaw)
    .map(parseDormitoriosLegacyValue)
    .filter((value): value is number => typeof value === "number");
  if (dormitoriosCandidates.length > 0) return Math.max(...dormitoriosCandidates);

  const bedsCandidates = parseCsv(bedsRaw)
    .map(parseDormitoriosLegacyValue)
    .filter((value): value is number => typeof value === "number");
  if (bedsCandidates.length > 0) return Math.max(...bedsCandidates);

  return undefined;
}

function parseLegacyDormitorios(
  dormitoriosRaw: string | null
): number | string | string[] | undefined {
  if (!dormitoriosRaw || !dormitoriosRaw.trim()) return undefined;
  const normalized = dormitoriosRaw.trim();

  if (normalized.includes(",")) {
    const values = parseCsv(normalized);
    return values.length > 0 ? values : undefined;
  }

  const parsed = Number(normalized);
  if (Number.isFinite(parsed) && normalized === String(parsed)) {
    return parsed;
  }

  return normalized;
}

export async function GET(request: NextRequest) {
  try {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "unknown";
    const rateLimitResult = await rateLimiter.check(ip);

    if (!rateLimitResult.ok) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retryAfter: rateLimitResult.retryAfter },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimitResult.retryAfter?.toString() || "60",
            "X-RateLimit-Limit": "60",
            "X-RateLimit-Window": "60",
          },
        }
      );
    }

    const { searchParams } = new URL(request.url);

    const operationRaw = searchParams.get("operation") || searchParams.get("intent");
    const comunaValues = parseCsv(searchParams.get("comuna"));
    const tiposValues = parseCsv(searchParams.get("tipos"));
    const legacyDormitorios = parseLegacyDormitorios(searchParams.get("dormitorios"));

    const queryParams = {
      q: searchParams.get("q")?.trim() || undefined,
      comuna: toSingleOrArray(comunaValues),
      operation: operationRaw || undefined,
      precioMin: parseNumber(searchParams.get("precioMin")),
      precioMax: parseNumber(searchParams.get("precioMax") || searchParams.get("priceMax")),
      dormitoriosMin:
        parseNumber(searchParams.get("dormitoriosMin")) ??
        parseDormitoriosMinFromLegacy(searchParams.get("dormitorios"), searchParams.get("beds")),
      tipos: toSingleOrArray(tiposValues),
      dormitorios: legacyDormitorios,
      estacionamiento: parseBoolean(searchParams.get("estacionamiento")),
      bodega: parseBoolean(searchParams.get("bodega")),
      mascotas: parseBoolean(searchParams.get("mascotas")),
      sort: searchParams.get("sort") || undefined,
      page: parseNumber(searchParams.get("page")),
      limit: parseNumber(searchParams.get("limit")),
    };

    const validation = SearchFiltersSchema.safeParse(queryParams);
    if (!validation.success) {
      logger.warn("Validación fallida en API buildings:", validation.error.errors);
      return NextResponse.json(
        {
          error: "Parámetros inválidos",
          details: validation.error.errors.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const filters = validation.data;
    const page = filters.page || 1;
    const limit = filters.limit || 12;

    const processor = await getSupabaseProcessor();
    const result = await processor.getUnits(
      {
        q: filters.q,
        comuna: filters.comuna,
        operation: filters.operation,
        precioMin: filters.precioMin,
        precioMax: filters.precioMax,
        dormitoriosMin: filters.dormitoriosMin,
        tipos: filters.tipos,
        dormitorios: filters.dormitorios,
        estacionamiento: filters.estacionamiento,
        bodega: filters.bodega,
        mascotas: filters.mascotas,
        sort: filters.sort,
      },
      page,
      limit
    );

    logger.log(
      `API buildings: ${result.units.length} unidades encontradas de ${result.total} total (página ${page})`
    );

    const response: BuildingsResponse = {
      units: result.units,
      total: result.total,
      hasMore: result.hasMore,
      page,
      limit,
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error("Error en API buildings:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
