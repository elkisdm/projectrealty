import { BuildingSchema } from "@schemas/models";
import type { Building, Unit } from "@schemas/models";

type ListFilters = {
  comuna?: string;
  tipologia?: string;
  minPrice?: number;
  maxPrice?: number;
};

function calculatePrecioDesde(units: Unit[]): number | null {
  const disponibles = units.filter((u) => u.disponible);
  if (disponibles.length === 0) return null;
  return Math.min(...disponibles.map((u) => u.price));
}

function validateBuilding(raw: unknown): Building {
  const parsed = BuildingSchema.parse(raw);
  return parsed;
}

// Función para leer desde Supabase
async function readFromSupabase(): Promise<Building[]> {
  try {
    // Importar Supabase dinámicamente solo cuando se necesita
    const { supabase, supabaseAdmin } = await import("@lib/supabase");
    
    // Usar el cliente admin para evitar problemas de permisos
    const client = supabaseAdmin || supabase;
    
    if (!client) {
      throw new Error('No Supabase client available. Please configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    }
    
    // Obtener edificios con sus unidades usando la relación correcta
    const { data: buildingsData, error: buildingsError } = await client
      .from('buildings')
      .select(`
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
      `)
      .eq('provider', 'assetplan')
      .order('nombre')
      .limit(100);

    if (buildingsError) {
      throw new Error(`Error fetching buildings from Supabase: ${buildingsError.message}`);
    }

    if (!buildingsData || buildingsData.length === 0) {
      return [];
    }

    // Mantener edificios que al menos tengan unidades
    const buildingsWithUnits = buildingsData.filter((building: any) => {
      const units = building.units || [];
      return units.length > 0;
    });

    // Transformar los datos al formato esperado
    const buildings: Building[] = buildingsWithUnits.map((building: unknown) => {
      const b = building as any;
      return {
        id: b.id,
        slug: b.slug || `edificio-${b.id}`,
        name: b.nombre,
        comuna: b.comuna,
        address: b.direccion || 'Dirección no disponible',
        amenities: Array.isArray(b.amenities) && b.amenities.length > 0
          ? b.amenities
          : ['Piscina', 'Gimnasio'],
        gallery: Array.isArray(b.gallery) && b.gallery.length > 0
          ? b.gallery
          : [
              '/images/lascondes-cover.jpg',
              '/images/lascondes-1.jpg', 
              '/images/lascondes-2.jpg'
            ],
        coverImage: b.cover_image || b.coverImage || (Array.isArray(b.gallery) && b.gallery.length > 0 ? b.gallery[0] : '/images/lascondes-cover.jpg'),
        badges: [],
        serviceLevel: undefined,
        precio_desde: b.precio_desde,
        precio_hasta: b.precio_hasta,
        gc_mode: b.gc_mode,
        featured: b.featured,
        units: (b.units || []).map((unit: unknown) => {
          const u = unit as any;
          return {
            id: u.id,
            tipologia: u.tipologia || 'No especificada',
            m2: u.area_m2 || u.area_interior_m2 || 50,
            price: u.precio || u.price || 500000,
            estacionamiento: Boolean(u.parking_ids && u.parking_ids !== 'x'),
            bodega: Boolean(u.storage_ids && u.storage_ids !== 'x'),
            disponible: u.disponible || false,
            bedrooms: u.bedrooms || 1,
            bathrooms: u.bathrooms || 1,
            area_interior_m2: u.area_interior_m2,
            area_exterior_m2: u.area_exterior_m2,
            orientacion: u.orientacion,
            piso: u.piso,
            amoblado: u.amoblado,
            petFriendly: u.pet_friendly,
            parking_ids: u.parking_ids,
            storage_ids: u.storage_ids,
            parking_opcional: u.parking_opcional,
            storage_opcional: u.storage_opcional,
            guarantee_installments: u.guarantee_installments,
            guarantee_months: u.guarantee_months,
            rentas_necesarias: u.rentas_necesarias,
            renta_minima: u.renta_minima
          };
        })
      };
    });

    // Validar los edificios
    const validatedBuildings: Building[] = [];
    
    for (let i = 0; i < buildings.length; i++) {
      try {
        const validated = validateBuilding(buildings[i]);
        validatedBuildings.push(validated);
      } catch (error) {
        // Silenciosamente omitir edificios que no pasan validación
        console.warn(`Building ${i + 1} (${buildings[i].name}) failed validation, skipping`);
      }
    }
    
    return validatedBuildings;
  } catch (error) {
    console.error('Error reading from Supabase:', error);
    throw error;
  }
}

export async function readAll(): Promise<Building[]> {
  return await readFromSupabase();
}

export async function getAllBuildings(filters?: ListFilters, searchTerm?: string): Promise<(Building & { precioDesde: number | null })[]> {
  const all = await readAll();

  let list = all.map((b) => ({ ...b, precioDesde: calculatePrecioDesde(b.units) }));

  if (filters) {
    const { comuna, tipologia, minPrice, maxPrice } = filters;
    if (comuna && comuna !== "Todas") {
      list = list.filter((b) => b.comuna.toLowerCase() === comuna.toLowerCase());
    }
    if (tipologia && tipologia !== "Todas") {
      list = list.filter((b) => b.units.some((u) => u.tipologia.toLowerCase() === tipologia.toLowerCase()));
    }
    if (typeof minPrice === "number") {
      list = list.filter((b) => (b.precioDesde ?? Infinity) >= minPrice);
    }
    if (typeof maxPrice === "number") {
      list = list.filter((b) => (b.precioDesde ?? 0) <= maxPrice);
    }
  }

  return list;
}

export async function getBuildingBySlug(slug: string): Promise<(Building & { precioDesde: number | null }) | null> {
  const all = await readAll();
  const found = all.find((b) => b.slug === slug);
  if (!found) return null;
  return { ...found, precioDesde: calculatePrecioDesde(found.units) };
}

export async function getRelatedBuildings(slug: string, n = 3): Promise<(Building & { precioDesde: number | null })[]> {
      const all = await readAll();
  const current = all.find((b) => b.slug === slug);
  
  if (!current) {
    return [];
  }
    
    // Calcular precio desde para todas las propiedades
    const withPrecio = all
      .filter((b) => b.slug !== slug)
      .map((b) => ({ ...b, precioDesde: calculatePrecioDesde(b.units) }));

    // Función para calcular similitud entre propiedades
    const calculateSimilarity = (building: Building & { precioDesde: number | null }): number => {
      let score = 0;
      
      // Misma comuna (peso alto)
      if (building.comuna === current.comuna) {
        score += 50;
      }
      
      // Rango de precio similar (peso medio)
      const currentPrice = calculatePrecioDesde(current.units);
      if (currentPrice !== null && building.precioDesde !== null) {
        const priceDiff = Math.abs(building.precioDesde - currentPrice);
        const priceSimilarity = Math.max(0, 100 - (priceDiff / currentPrice) * 100);
        score += priceSimilarity * 0.3;
      }
      
      // Mismo nivel de servicio (peso medio)
      if (building.serviceLevel === current.serviceLevel) {
        score += 20;
      }
      
      // Tipologías similares (peso bajo)
      const currentTypologies = current.typologySummary?.map((t: any) => t.key) || [];
      const buildingTypologies = building.typologySummary?.map((t: any) => t.key) || [];
      const commonTypologies = currentTypologies.filter((t: string) => buildingTypologies.includes(t));
      score += commonTypologies.length * 5;
      
      // Disponibilidad (peso bajo)
      const availableUnits = building.units.filter((u: Unit) => u.disponible);
      if (availableUnits.length > 0) {
        score += 10;
      }
      
      return score;
    };

    // Ordenar por similitud y tomar las mejores
    const sortedBySimilarity = withPrecio
      .map(building => ({
        ...building,
        similarityScore: calculateSimilarity(building)
      }))
      .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, n)
      .map(({ similarityScore, ...building }) => building);

  return sortedBySimilarity;
}

// Función temporal mantenida para quotations API
export async function getUnitWithBuilding(unitId: string): Promise<{ unit: Unit; building: Building } | null> {
  try {
    const buildings = await readAll();

    for (const building of buildings) {
      const unit = building.units?.find((u: Unit) => u.id === unitId);
      if (unit) {
        return { unit, building };
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting unit with building:', error);
    throw error;
  }
}

export type { Building, Unit };
