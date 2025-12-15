import { BuildingSchema } from "@schemas/models";
import type { Building, Unit, TypologySummary, PromotionBadge } from "@schemas/models";
import { logger } from "./logger";
import { normalizeUnit } from "./utils/unit";

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
    // Usar left join para incluir edificios aunque no tengan unidades cargadas
    const { data: buildingsData, error: buildingsError } = await client
      .from('buildings')
      .select(`
        id,
        slug,
        name,
        comuna,
        address,
        amenities,
        gallery,
        cover_image,
        badges,
        service_level,
        gc_mode,
        units!left (
          id,
          tipologia,
          m2,
          price,
          disponible,
          estacionamiento,
          bodega,
          bedrooms,
          bathrooms,
          pet_friendly,
          images_tipologia,
          images_areas_comunes,
          images
        )
      `)
      .order('name')
      .limit(100);

    if (buildingsError) {
      throw new Error(`Error fetching buildings from Supabase: ${buildingsError.message}`);
    }

    if (!buildingsData || buildingsData.length === 0) {
      return [];
    }

    // Mantener edificios que al menos tengan unidades
    const buildingsWithUnits = buildingsData.filter((building: unknown): building is { units?: unknown[] } => {
      if (typeof building !== 'object' || building === null) return false;
      const b = building as { units?: unknown[] };
      const units = b.units || [];
      return Array.isArray(units) && units.length > 0;
    });

    // Transformar los datos al formato esperado
    const buildings: Building[] = buildingsWithUnits.map((building: unknown) => {
      const b = building as {
        id: string;
        slug?: string;
        name: string;
        comuna: string;
        address?: string;
        amenities?: string[];
        gallery?: string[];
        cover_image?: string;
        badges?: unknown[];
        service_level?: string;
        gc_mode?: 'MF' | 'variable';
        units?: Array<{
          id: string;
          tipologia?: string;
          m2?: number;
          price?: number;
          disponible?: boolean;
          estacionamiento?: boolean;
          bodega?: boolean;
          bedrooms?: number;
          bathrooms?: number;
        }>;
      };
      
      // Calcular precio_desde y precio_hasta desde las unidades
      const availableUnits = (b.units || []).filter(u => u.disponible);
      const prices = availableUnits.map(u => u.price || 0).filter(p => p > 0);
      const precio_desde = prices.length > 0 ? Math.min(...prices) : undefined;
      const precio_hasta = prices.length > 0 ? Math.max(...prices) : undefined;
      
      // Asegurar que amenities tenga al menos 1 elemento
      const amenities = Array.isArray(b.amenities) && b.amenities.length > 0
        ? b.amenities
        : ['Áreas comunes'];
      
      // Asegurar que gallery tenga al menos 1 elemento
      let gallery: string[];
      if (Array.isArray(b.gallery) && b.gallery.length > 0) {
        gallery = b.gallery;
      } else {
        // No hay gallery, usar cover_image o default
        gallery = b.cover_image
          ? [b.cover_image]
          : ['/images/default-building.jpg'];
      }
      
      return {
        id: b.id,
        slug: b.slug || `edificio-${b.id}`,
        name: b.name,
        comuna: b.comuna && b.comuna.trim() ? b.comuna.trim() : 'Santiago', // Fallback a Santiago si está vacío
        address: b.address || 'Dirección no disponible',
        amenities,
        gallery,
        coverImage: b.cover_image || gallery[0],
        badges: Array.isArray(b.badges) ? (b.badges as PromotionBadge[]) : [],
        serviceLevel: (b.service_level === 'pro' || b.service_level === 'standard') ? b.service_level : undefined,
        precio_desde,
        precio_hasta,
        gc_mode: (b.gc_mode === 'MF' || b.gc_mode === 'variable') ? b.gc_mode : undefined,
        featured: false,
        units: (b.units || []).map((unit: unknown) => {
          const u = unit as {
            id: string;
            tipologia?: string;
            m2?: number;
            price?: number;
            disponible?: boolean;
            estacionamiento?: boolean;
            bodega?: boolean;
            bedrooms?: number;
            bathrooms?: number;
            pet_friendly?: boolean;
            images_tipologia?: string[]; // Campo desde Supabase (snake_case)
            images_areas_comunes?: string[]; // Campo desde Supabase (snake_case)
            images?: string[];
          };
          
          // Usar helper para crear Unit completo
          return normalizeUnit(
            {
              id: u.id,
              tipologia: u.tipologia || 'Studio',
              m2: u.m2,
              price: u.price,
              disponible: u.disponible ?? true, // Default a true si no está definido
              estacionamiento: u.estacionamiento ?? false,
              bodega: u.bodega ?? false,
              bedrooms: u.bedrooms ?? (u.tipologia === 'Studio' ? 0 : 1), // Default según tipología
              bathrooms: u.bathrooms ?? 1, // Default a 1
              pet_friendly: u.pet_friendly !== undefined ? u.pet_friendly : false, // Mapear pet_friendly desde Supabase
              imagesTipologia: u.images_tipologia, // Mapear desde snake_case a camelCase
              imagesAreasComunes: u.images_areas_comunes, // Mapear desde snake_case a camelCase
              images: u.images,
            },
            b.id,
            b.slug || `edificio-${b.id}`
          );
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
        // Log detallado del error de validación
        if (error && typeof error === 'object' && 'issues' in error) {
          const zodError = error as { issues: Array<{ path: string[]; message: string }> };
          const errorDetails = zodError.issues.map(issue => 
            `${issue.path.join('.')}: ${issue.message}`
          ).join(', ');
          logger.error(`Building ${buildings[i].name} failed validation: ${errorDetails}`);
        } else if (error instanceof Error) {
          logger.error(`Building ${buildings[i].name} failed validation: ${error.message}`);
        } else {
          logger.error(`Building ${buildings[i].name} failed validation:`, error);
        }
        // Silenciosamente omitir edificios que no pasan validación
        logger.warn(`Building ${buildings[i].name} skipped due to validation error`);
      }
    }
    
    logger.log(`[readFromSupabase] Edificios validados: ${validatedBuildings.length} de ${buildings.length}`);
    
    if (validatedBuildings.length === 0 && buildings.length > 0) {
      logger.error(`[readFromSupabase] ⚠️ PROBLEMA: ${buildings.length} edificios obtenidos pero 0 pasaron validación`);
      logger.error(`[readFromSupabase] Esto significa que todos los edificios están fallando validación del schema`);
    }
    
    return validatedBuildings;
  } catch (error) {
    logger.error('Error reading from Supabase:', error);
    throw error;
  }
}

// Función para normalizar tipologías de formato "1D/1B" a "1D1B"
function normalizeTipologia(tipologia: string): string {
  // Mapeo de formatos comunes a formato canónico
  const normalized = tipologia
    .replace(/\//g, '') // Remover barras
    .replace(/\s+/g, '') // Remover espacios
    .trim();
  
  // Validar que esté en formato canónico
  const validFormats = ['Studio', '1D1B', '2D1B', '2D2B', '3D2B'];
  if (validFormats.includes(normalized)) {
    return normalized;
  }
  
  // Intentar convertir formatos comunes
  const conversions: Record<string, string> = {
    'studio': 'Studio',
    '1d1b': '1D1B',
    '2d1b': '2D1B',
    '2d2b': '2D2B',
    '3d2b': '3D2B',
  };
  
  const lower = normalized.toLowerCase();
  return conversions[lower] || '1D1B'; // Default a 1D1B si no se puede convertir
}

// Función para leer desde mocks
async function readFromMock(): Promise<Building[]> {
  try {
    const { MOCK_BUILDINGS } = await import("@data/buildings.mock");
    const { BuildingSchema } = await import("@schemas/models");
    
    // Convertir LegacyBuilding a Building y validar
    const validatedBuildings: Building[] = [];
    
    for (const mock of MOCK_BUILDINGS) {
      try {
        // Asegurar que gallery tenga al menos 3 elementos
        const gallery = mock.gallery && mock.gallery.length >= 3 
          ? mock.gallery 
          : [
              mock.cover || mock.hero || '/images/lascondes-cover.jpg',
              '/images/lascondes-1.jpg',
              '/images/lascondes-2.jpg',
              '/images/lascondes-3.jpg'
            ];
        
        // Asegurar que amenities tenga al menos 1 elemento
        const amenities = mock.amenities && mock.amenities.length > 0
          ? mock.amenities
          : ['Piscina', 'Gimnasio'];
        
        // Convertir unidades usando normalizeUnit para asegurar todos los campos requeridos
        const units = mock.units.map(u => 
          normalizeUnit(
            {
              id: u.id,
              tipologia: normalizeTipologia(u.tipologia),
              m2: u.m2,
              price: u.price,
              disponible: u.disponible !== false,
              estacionamiento: u.estacionamiento || false,
              bodega: u.bodega || false,
              // bedrooms y bathrooms pueden no estar en LegacyUnit, normalizeUnit los calculará
              bedrooms: (u as any).bedrooms,
              bathrooms: (u as any).bathrooms,
            },
            mock.id,
            mock.slug
          )
        );
        
        // Si no hay unidades, saltar este edificio
        if (units.length === 0) {
          logger.warn(`Mock building ${mock.id} has no units, skipping`);
          continue;
        }
        
        // Mapear LegacyBuilding a Building
        const building = {
          id: mock.id,
          slug: mock.slug,
          name: mock.name,
          comuna: mock.comuna,
          address: mock.address,
          amenities,
          gallery,
          coverImage: mock.cover || mock.hero || gallery[0],
          badges: [],
          units,
        };
        
        const validated = BuildingSchema.parse(building);
        validatedBuildings.push(validated);
      } catch (error) {
        // Log detallado del error para debugging
        if (error && typeof error === 'object' && 'issues' in error) {
          const zodError = error as { issues: Array<{ path: string[]; message: string }> };
          const errorDetails = zodError.issues.map(issue => 
            `${issue.path.join('.')}: ${issue.message}`
          ).join(', ');
          console.error(`[Mock] Building ${mock.id} validation failed:`, errorDetails);
          logger.warn(`Mock building ${mock.id} failed validation: ${errorDetails}`);
        } else if (error instanceof Error) {
          console.error(`[Mock] Building ${mock.id} validation failed:`, error.message);
          logger.warn(`Mock building ${mock.id} failed validation: ${error.message}`);
        } else {
          console.error(`[Mock] Building ${mock.id} validation failed:`, error);
          logger.warn(`Mock building ${mock.id} failed validation:`, error);
        }
      }
    }
    
    return validatedBuildings;
  } catch (error) {
    logger.error('Error reading from mocks:', error);
    throw error;
  }
}

export async function readAll(): Promise<Building[]> {
  const USE_SUPABASE = process.env.USE_SUPABASE === "true";
  
  logger.log(`[readAll] USE_SUPABASE: ${USE_SUPABASE}`);
  
  if (USE_SUPABASE) {
    try {
      const buildings = await readFromSupabase();
      logger.log(`[readAll] Edificios desde Supabase: ${buildings.length}`);
      if (buildings.length > 0) {
        logger.log(`[readAll] Primer edificio: ${buildings[0].name}, unidades: ${buildings[0].units.length}`);
        return buildings; // Retornar edificios de Supabase si hay
      } else {
        // Si Supabase está configurado pero no hay edificios, NO caer a mocks
        logger.warn(`[readAll] ⚠️ USE_SUPABASE=true pero no se encontraron edificios en Supabase. Retornando array vacío en lugar de mocks.`);
        return [];
      }
    } catch (error) {
      logger.error(`[readAll] ❌ Error leyendo de Supabase:`, error);
      logger.warn(`[readAll] ⚠️ USE_SUPABASE=true pero falló. Retornando array vacío en lugar de mocks para evitar datos incorrectos.`);
      // NO caer a mocks si USE_SUPABASE está activo - retornar vacío
      return [];
    }
  }
  
  // Solo usar mocks si USE_SUPABASE es explícitamente false
  logger.log(`[readAll] USE_SUPABASE=false, usando datos mock`);
  return await readFromMock();
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
  const USE_SUPABASE = process.env.USE_SUPABASE === "true";
  
  // Si estamos usando Supabase, intentar consulta directa primero
  if (USE_SUPABASE) {
    try {
      const { supabase, supabaseAdmin } = await import("@lib/supabase");
      const client = supabaseAdmin || supabase;
      
      if (client) {
        // Consulta directa por slug
        const { data: buildingData, error } = await client
          .from('buildings')
          .select(`
            id,
            slug,
            name,
            comuna,
            address,
            amenities,
            gallery,
            cover_image,
            badges,
            service_level,
            units!left (
              id,
              tipologia,
              m2,
              price,
              disponible,
              estacionamiento,
              bodega,
              bedrooms,
              bathrooms,
              pet_friendly,
              images_tipologia,
              images_areas_comunes,
              images
            )
          `)
          .eq('slug', slug)
          .single();
        
        if (!error && buildingData) {
          const b = buildingData as any;
          const availableUnits = (b.units || []).filter((u: any) => u.disponible);
          const prices = availableUnits.map((u: any) => u.price || 0).filter((p: number) => p > 0);
          
          const building: Building = {
            id: b.id,
            slug: b.slug || `edificio-${b.id}`,
            name: b.name,
            comuna: b.comuna,
            address: b.address || 'Dirección no disponible',
            amenities: Array.isArray(b.amenities) && b.amenities.length > 0 ? b.amenities : [],
            gallery: Array.isArray(b.gallery) && b.gallery.length > 0 ? b.gallery : [],
            coverImage: b.cover_image || (Array.isArray(b.gallery) && b.gallery.length > 0 ? b.gallery[0] : undefined),
            badges: Array.isArray(b.badges) ? b.badges : [],
            serviceLevel: b.service_level as 'pro' | 'standard' | undefined,
            units: (b.units || []).map((u: any) => {
              return normalizeUnit(
                {
                  id: u.id,
                  tipologia: u.tipologia || 'Studio',
                  m2: u.m2,
                  price: u.price || 0,
                  disponible: u.disponible ?? true,
                  estacionamiento: u.estacionamiento ?? false,
                  bodega: u.bodega ?? false,
                  bedrooms: u.bedrooms,
                  bathrooms: u.bathrooms,
                  pet_friendly: u.pet_friendly !== undefined ? u.pet_friendly : false,
                  imagesTipologia: u.images_tipologia,
                  imagesAreasComunes: u.images_areas_comunes,
                  images: u.images,
                },
                b.id,
                b.slug || `edificio-${b.id}`
              );
            }),
          };
          
          return { ...building, precioDesde: calculatePrecioDesde(building.units) };
        }
      }
    } catch (error) {
      logger.warn('Error en consulta directa a Supabase, cayendo a readAll:', error);
    }
  }
  
  // Fallback a readAll
  const all = await readAll();
  // Buscar por slug primero, luego por id (para compatibilidad con Supabase)
  const found = all.find((b) => b.slug === slug) ?? all.find((b) => b.id === slug);
  if (!found) {
    // Debug: log available slugs if not found
    logger.warn(`Building not found with slug: ${slug}. Available slugs: ${all.map(b => b.slug).join(', ')}`);
    return null;
  }
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
      const currentTypologies = current.typologySummary?.map((t: TypologySummary) => t.key) || [];
      const buildingTypologies = building.typologySummary?.map((t: TypologySummary) => t.key) || [];
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
    logger.error('Error getting unit with building:', error);
    throw error;
  }
}

export type { Building, Unit };
