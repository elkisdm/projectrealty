import type { SearchFormInput } from "@/lib/validations/search";
import type { SearchFilters } from "@/types/search";
import { buildSearchParams } from "@/lib/search/query-params";

/**
 * Maps Hero Cocktail form fields to URL query parameters
 * Handles both new field names (beds, priceMax, petFriendly, etc.) 
 * and legacy field names (dormitorios, precioMax, mascotas, etc.)
 * for backwards compatibility with /buscar page
 */
export function mapFormToQueryParams(data: SearchFormInput): URLSearchParams {
  const parseNumber = (value?: string): number | undefined => {
    if (!value || !value.trim()) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const toDormitoriosMin = (value?: string): number | undefined => {
    if (!value) return undefined;
    const map: Record<string, number> = {
      studio: 0,
      Estudio: 0,
      "1": 1,
      "2": 2,
      "3": 3,
      "3plus": 3,
    };
    return map[value];
  };

  const dormitoriosMin = toDormitoriosMin(data.beds || data.dormitorios);
  const filters: SearchFilters = {
    q: data.q?.trim() || undefined,
    comuna: data.comuna || undefined,
    operation: "rent",
    precioMin: parseNumber(data.precioMin),
    precioMax: parseNumber(data.priceMax || data.precioMax),
    dormitoriosMin,
    estacionamiento: (data.parking || data.estacionamiento) === "true" ? true : undefined,
    bodega: (data.storage || data.bodega) === "true" ? true : undefined,
    mascotas: (data.petFriendly || data.mascotas) === "true" ? true : undefined,
    // Legacy fields that we keep in URL for backward compatibility
    dormitorios: data.dormitorios,
    beds: data.beds,
    priceMax: data.priceMax,
    moveIn: data.moveIn,
  };

  const params = buildSearchParams(filters);
  if (data.moveIn) {
    params.set("moveIn", data.moveIn);
  } else {
    params.delete("moveIn");
  }

  return params;
}

/**
 * Helper to format query params for display
 */
export function formatQueryParams(params: URLSearchParams): string {
  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}
