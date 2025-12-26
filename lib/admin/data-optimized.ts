/**
 * Funciones optimizadas para queries de admin con filtrado a nivel de base de datos
 * 
 * Estas funciones intentan hacer el filtrado en Supabase cuando es posible,
 * en lugar de leer todo y filtrar en memoria.
 */

import { supabaseAdmin } from "@lib/supabase";
import type { Building } from "@schemas/models";
import { logger } from "@lib/logger";

interface AdminBuildingsQueryParams {
  search?: string;
  comuna?: string;
  page: number;
  limit: number;
}

interface AdminBuildingsResult {
  buildings: Building[];
  total: number;
}

/**
 * Obtiene edificios con filtrado optimizado a nivel de base de datos
 * 
 * Intenta usar queries de Supabase para filtrar antes de traer los datos,
 * lo cual es mucho más eficiente que leer todo y filtrar en memoria.
 */
export async function getAdminBuildingsOptimized(
  params: AdminBuildingsQueryParams
): Promise<AdminBuildingsResult> {
  try {
    // Si hay Supabase disponible, intentar filtrado a nivel de DB
    if (supabaseAdmin) {
      let query = supabaseAdmin
        .from("buildings")
        .select(
          `
          id,
          slug,
          nombre,
          comuna,
          direccion,
          precio_desde,
          precio_hasta,
          has_availability,
          units (
            id,
            tipologia,
            area_m2,
            area_interior_m2,
            area_exterior_m2,
            precio,
            disponible,
            bedrooms,
            bathrooms,
            orientacion,
            pet_friendly,
            gastos_comunes,
            status
          )
        `,
          { count: "exact" }
        )
        .eq("provider", "assetplan");

      // Aplicar filtros a nivel de base de datos
      if (params.comuna) {
        query = query.ilike("comuna", `%${params.comuna}%`);
      }

      if (params.search) {
        // Búsqueda en múltiples campos usando OR (Supabase permite esto)
        query = query.or(
          `nombre.ilike.%${params.search}%,slug.ilike.%${params.search}%,comuna.ilike.%${params.search}%,direccion.ilike.%${params.search}%`
        );
      }

      // Paginación a nivel de base de datos
      const from = (params.page - 1) * params.limit;
      const to = from + params.limit - 1;

      query = query.range(from, to).order("nombre");

      const { data, error, count } = await query;

      if (error) {
        logger.warn("Error en query optimizada, cayendo a fallback:", error);
        // Caer a método de fallback
        return getAdminBuildingsFallback(params);
      }

      if (!data || data.length === 0) {
        return { buildings: [], total: count || 0 };
      }

      // Transformar datos al formato Building (similar a lib/data.ts)
      const buildings: Building[] = data
        .filter((b: unknown) => {
          const building = b as { units?: unknown[] };
          return building.units && building.units.length > 0;
        })
        .map((b: unknown) => {
          const building = b as {
            id: string;
            slug: string;
            nombre: string;
            comuna: string;
            direccion: string;
            precio_desde?: number;
            precio_hasta?: number;
            has_availability?: boolean;
            units?: Array<{
              id: string;
              tipologia: string;
              area_m2?: number;
              area_interior_m2?: number;
              area_exterior_m2?: number;
              precio?: number;
              disponible?: boolean;
              bedrooms?: number;
              bathrooms?: number;
              orientacion?: string;
              pet_friendly?: boolean;
              gastos_comunes?: number;
              status?: string;
            }>;
          };

          return {
            id: building.id,
            slug: building.slug,
            name: building.nombre,
            comuna: building.comuna,
            address: building.direccion || "",
            units: (building.units || []).map((u) => ({
              id: u.id,
              tipologia: u.tipologia || "No especificada",
              m2: u.area_m2 || u.area_interior_m2 || 50,
              price: u.precio || 500000,
              disponible: u.disponible || false,
              bedrooms: u.bedrooms || 1,
              bathrooms: u.bathrooms || 1,
              area_interior_m2: u.area_interior_m2,
              area_exterior_m2: u.area_exterior_m2,
              orientacion: u.orientacion,
              petFriendly: u.pet_friendly,
              gastosComunes: u.gastos_comunes,
            })),
          } as Building;
        });

      return {
        buildings,
        total: count || 0,
      };
    }

    // Si no hay Supabase, usar método de fallback
    return getAdminBuildingsFallback(params);
  } catch (error) {
    logger.warn("Error en query optimizada, cayendo a fallback:", error);
    return getAdminBuildingsFallback(params);
  }
}

/**
 * Método de fallback que lee todo y filtra en memoria
 * 
 * Este método se usa cuando:
 * - No hay Supabase disponible
 * - La query optimizada falla
 * - Hay filtros complejos que no se pueden expresar fácilmente en Supabase
 */
async function getAdminBuildingsFallback(
  params: AdminBuildingsQueryParams
): Promise<AdminBuildingsResult> {
  // Importar dinámicamente para evitar dependencias circulares
  const { readAll } = await import("@lib/data");

  let buildings = await readAll();

  // Aplicar filtros en memoria
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    buildings = buildings.filter(
      (b) =>
        b.name.toLowerCase().includes(searchLower) ||
        b.slug.toLowerCase().includes(searchLower) ||
        b.comuna.toLowerCase().includes(searchLower) ||
        b.address.toLowerCase().includes(searchLower)
    );
  }

  if (params.comuna) {
    buildings = buildings.filter(
      (b) => b.comuna.toLowerCase() === params.comuna!.toLowerCase()
    );
  }

  const total = buildings.length;

  // Paginación
  const startIndex = (params.page - 1) * params.limit;
  const endIndex = startIndex + params.limit;
  const paginatedBuildings = buildings.slice(startIndex, endIndex);

  return {
    buildings: paginatedBuildings,
    total,
  };
}

