import type { SearchFormInput } from "@/lib/validations/search";

/**
 * Maps Hero Cocktail form fields to URL query parameters
 * Handles both new field names (beds, priceMax, petFriendly, etc.) 
 * and legacy field names (dormitorios, precioMax, mascotas, etc.)
 * for backwards compatibility with /buscar page
 */
export function mapFormToQueryParams(data: SearchFormInput): URLSearchParams {
  const params = new URLSearchParams();

  // Search query
  if (data.q && data.q.trim()) {
    params.set("q", data.q.trim());
  }

  // Intent (new field)
  if (data.intent && data.intent !== "rent") {
    params.set("intent", data.intent);
  }

  // Comuna
  if (data.comuna) {
    params.set("comuna", data.comuna);
  }

  // Beds (prefer new field, fallback to legacy)
  const bedsValue = data.beds || data.dormitorios;
  if (bedsValue) {
    // Convert beds format if needed
    const bedsParam = Array.isArray(bedsValue) 
      ? bedsValue.join(",") 
      : bedsValue;
    params.set("beds", bedsParam);
    // Also set dormitorios for backwards compatibility
    params.set("dormitorios", bedsParam);
  }

  // Price min
  if (data.precioMin && data.precioMin.trim()) {
    params.set("precioMin", data.precioMin.trim());
  }

  // Price max (prefer new field, fallback to legacy)
  const priceMaxValue = data.priceMax || data.precioMax;
  if (priceMaxValue && priceMaxValue.trim()) {
    params.set("priceMax", priceMaxValue.trim());
    // Also set precioMax for backwards compatibility
    params.set("precioMax", priceMaxValue.trim());
  }

  // Move-in date (new field)
  if (data.moveIn) {
    params.set("moveIn", data.moveIn);
  }

  // Pet friendly (prefer new field, fallback to legacy)
  const petFriendlyValue = data.petFriendly || data.mascotas;
  if (petFriendlyValue === "true") {
    params.set("petFriendly", "1");
    params.set("mascotas", "true"); // Backwards compatibility
  }

  // Parking (prefer new field, fallback to legacy)
  const parkingValue = data.parking || data.estacionamiento;
  if (parkingValue === "true") {
    params.set("parking", "1");
    params.set("estacionamiento", "true"); // Backwards compatibility
  }

  // Storage (prefer new field, fallback to legacy)
  const storageValue = data.storage || data.bodega;
  if (storageValue === "true") {
    params.set("storage", "1");
    params.set("bodega", "true"); // Backwards compatibility
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
