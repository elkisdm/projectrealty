import { BuildingSchema } from "@schemas/models";
import type { Building, Unit, TypologySummary, PromotionBadge } from "@schemas/models";
import { logger } from "./logger";
import { normalizeUnit } from "./utils/unit";
import { MOCK_BUILDINGS } from "@data/buildings.mock";

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
    // Validar variables de entorno antes de intentar importar
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      const missingVars = [];
      if (!supabaseUrl) missingVars.push('SUPABASE_URL');
      if (!supabaseServiceKey) missingVars.push('SUPABASE_SERVICE_ROLE_KEY');
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}. Please configure them in Vercel settings.`);
    }
    
    // Importar Supabase dinámicamente solo cuando se necesita
    const { supabase, supabaseAdmin } = await import("@lib/supabase");
    
    // Usar el cliente admin para evitar problemas de permisos
    const client = supabaseAdmin || supabase;
    
    if (!client) {
      throw new Error('No Supabase client available. Please configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment variables.');
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
      logger.error(`[readFromSupabase] Supabase query error:`, {
        message: buildingsError.message,
        details: buildingsError.details,
        hint: buildingsError.hint,
        code: buildingsError.code
      });
      throw new Error(`Error fetching buildings from Supabase: ${buildingsError.message}${buildingsError.hint ? ` (${buildingsError.hint})` : ''}`);
    }

    if (!buildingsData || buildingsData.length === 0) {
      return [];
    }

    // Mantener edificios que al menos tengan unidades válidas
    const buildingsWithUnits = buildingsData.filter((building: unknown): building is { units?: unknown[]; id?: string; name?: string } => {
      if (typeof building !== 'object' || building === null) return false;
      const b = building as { units?: unknown[]; id?: string; name?: string };
      
      // Verificar que tenga ID y nombre válidos
      if (!b.id || typeof b.id !== 'string' || b.id.trim() === '') return false;
      if (!b.name || typeof b.name !== 'string' || b.name.trim() === '') return false;
      
      const units = b.units || [];
      if (!Array.isArray(units) || units.length === 0) return false;
      
      // Verificar que al menos una unidad tenga datos válidos (tipología y precio)
      const hasValidUnit = units.some((u: unknown) => {
        if (typeof u !== 'object' || u === null) return false;
        const unit = u as { id?: string; tipologia?: string; price?: number };
        return unit.id && 
               unit.tipologia && 
               typeof unit.tipologia === 'string' && 
               unit.price !== null && 
               unit.price !== undefined && 
               typeof unit.price === 'number' && 
               unit.price > 0;
      });
      
      return hasValidUnit;
    });

    // Transformar los datos al formato esperado
    const buildings: Building[] = buildingsWithUnits
      .filter((building: unknown) => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/data.ts:128',message:'Filtering building before transform',data:{buildingId:(building as any)?.id,buildingName:(building as any)?.name,unitsCount:Array.isArray((building as any)?.units)?(building as any).units.length:0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        // Filtrar edificios que no tienen los datos mínimos requeridos
        const b = building as { id?: string; name?: string; units?: unknown[] };
        if (!b.id || !b.name || typeof b.name !== 'string' || b.name.trim() === '') {
          logger.warn(`[readFromSupabase] Skipping building with invalid id or name: ${JSON.stringify({ id: b.id, name: b.name })}`);
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/data.ts:132',message:'Building filtered out - invalid id/name',data:{id:b.id,name:b.name,idType:typeof b.id,nameType:typeof b.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          return false;
        }
        
        // Verificar que tenga al menos una unidad válida
        const units = b.units || [];
        if (!Array.isArray(units) || units.length === 0) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/data.ts:140',message:'Building filtered out - no units',data:{buildingId:b.id,buildingName:b.name,unitsCount:units.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          return false;
        }
        
        const hasValidUnit = units.some((u: unknown) => {
          if (typeof u !== 'object' || u === null) return false;
          const unit = u as { id?: string; tipologia?: string; price?: number };
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/data.ts:145',message:'Checking unit validity',data:{unitId:unit.id,tipologia:unit.tipologia,price:unit.price,priceType:typeof unit.price},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          return unit.id && 
                 unit.tipologia && 
                 typeof unit.tipologia === 'string' && 
                 unit.price !== null && 
                 unit.price !== undefined && 
                 typeof unit.price === 'number' && 
                 unit.price > 0;
        });
        
        if (!hasValidUnit) {
          logger.warn(`[readFromSupabase] Building ${b.name || b.id} has no valid units, skipping`);
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/data.ts:155',message:'Building filtered out - no valid units',data:{buildingId:b.id,buildingName:b.name,unitsCount:units.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          return false;
        }
        
        return true;
      })
      .map((building: unknown) => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/data.ts:161',message:'Transforming building',data:{buildingId:(building as any)?.id,buildingName:(building as any)?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
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
      
      // Filtrar unidades inválidas antes de procesarlas
      const validUnits = (b.units || []).filter(u => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/data.ts:188',message:'Filtering unit before processing',data:{unitId:u.id,tipologia:u.tipologia,price:u.price,priceType:typeof u.price},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        // Filtrar unidades sin ID, sin tipología válida, o con precio inválido
        if (!u.id || typeof u.id !== 'string' || u.id.trim() === '') {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/data.ts:191',message:'Unit filtered - invalid id',data:{unitId:u.id,idType:typeof u.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          return false;
        }
        if (!u.tipologia || typeof u.tipologia !== 'string') {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/data.ts:195',message:'Unit filtered - invalid tipologia',data:{unitId:u.id,tipologia:u.tipologia,tipologiaType:typeof u.tipologia},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          return false;
        }
        // Filtrar unidades con precio inválido (null, undefined, 0 o negativo)
        if (u.price === null || u.price === undefined || typeof u.price !== 'number' || u.price <= 0) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/data.ts:199',message:'Unit filtered - invalid price',data:{unitId:u.id,price:u.price,priceType:typeof u.price},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          return false;
        }
        return true;
      });
      
      // Calcular precio_desde y precio_hasta desde las unidades válidas
      const availableUnits = validUnits.filter(u => u.disponible !== false);
      const prices = availableUnits.map(u => u.price!).filter(p => p > 0);
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
      
      const buildingResult = {
        id: b.id,
        slug: b.slug || `edificio-${b.id}`,
        name: b.name.trim(), // Asegurar que name esté definido y no vacío
        comuna: b.comuna && b.comuna.trim() ? b.comuna.trim() : 'Santiago', // Fallback a Santiago si está vacío
        address: b.address || 'Dirección no disponible',
        amenities,
        gallery,
        coverImage: b.cover_image || gallery[0],
        badges: Array.isArray(b.badges) ? (b.badges as PromotionBadge[]) : [],
        serviceLevel: (b.service_level === 'pro' || b.service_level === 'standard') ? (b.service_level as 'pro' | 'standard') : undefined,
        precio_desde,
        precio_hasta,
        gc_mode: (b.gc_mode === 'MF' || b.gc_mode === 'variable') ? b.gc_mode : undefined,
        featured: false,
        units: validUnits.map((unit: unknown) => {
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
          
          // Normalizar tipología antes de crear la unidad
          const normalizedTipologia = normalizeTipologia(u.tipologia || '1D1B');
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/data.ts:258',message:'Normalizing tipologia',data:{originalTipologia:u.tipologia,normalizedTipologia},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          
          // Usar helper para crear Unit completo
          return normalizeUnit(
            {
              id: u.id,
              tipologia: normalizedTipologia, // Usar tipología normalizada
              m2: u.m2,
              price: u.price!, // Ya validado arriba que price > 0
              disponible: u.disponible ?? true, // Default a true si no está definido
              estacionamiento: u.estacionamiento ?? false,
              bodega: u.bodega ?? false,
              bedrooms: u.bedrooms ?? (normalizedTipologia === 'Studio' ? 0 : 1), // Default según tipología normalizada
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
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/data.ts:281',message:'Building transformed before validation',data:{buildingId:buildingResult.id,buildingName:buildingResult.name,unitsCount:buildingResult.units.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return buildingResult;
    });

    // Validar los edificios
    const validatedBuildings: Building[] = [];
    
    for (let i = 0; i < buildings.length; i++) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/data.ts:287',message:'Validating building',data:{buildingId:buildings[i]?.id,buildingName:buildings[i]?.name,unitsCount:buildings[i]?.units?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      try {
        const validated = validateBuilding(buildings[i]);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/data.ts:289',message:'Building validation passed',data:{buildingId:validated.id,buildingName:validated.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        validatedBuildings.push(validated);
      } catch (error) {
        // Log detallado del error de validación
        const buildingName = buildings[i]?.name || buildings[i]?.id || 'unknown';
        const buildingId = buildings[i]?.id || 'unknown';
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/data.ts:295',message:'Building validation failed',data:{buildingId,buildingName,errorMessage:error instanceof Error?error.message:String(error),buildingData:JSON.stringify(buildings[i])},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        if (error && typeof error === 'object' && 'issues' in error) {
          const zodError = error as { issues: Array<{ path: string[]; message: string }> };
          const errorDetails = zodError.issues.map(issue => 
            `${issue.path.join('.')}: ${issue.message}`
          ).join(', ');
          logger.error(`[readFromSupabase] Building ${buildingName} (id: ${buildingId}) failed validation: ${errorDetails}`);
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/data.ts:301',message:'Zod validation errors',data:{buildingId,buildingName,errors:zodError.issues.map(i=>({path:i.path,message:i.message}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
        } else if (error instanceof Error) {
          logger.error(`[readFromSupabase] Building ${buildingName} (id: ${buildingId}) failed validation: ${error.message}`);
        } else {
          logger.error(`[readFromSupabase] Building ${buildingName} (id: ${buildingId}) failed validation:`, error);
        }
        // Silenciosamente omitir edificios que no pasan validación
        logger.warn(`[readFromSupabase] Building ${buildingName} (id: ${buildingId}) skipped due to validation error`);
      }
    }
    
    logger.log(`[readFromSupabase] Edificios validados: ${validatedBuildings.length} de ${buildings.length}`);
    
    if (validatedBuildings.length === 0 && buildings.length > 0) {
      logger.error(`[readFromSupabase] ⚠️ PROBLEMA: ${buildings.length} edificios obtenidos pero 0 pasaron validación`);
      logger.error(`[readFromSupabase] Esto significa que todos los edificios están fallando validación del schema`);
    }
    
    return validatedBuildings;
  } catch (error) {
    // Log detallado del error para debugging
    if (error instanceof Error) {
      logger.error('[readFromSupabase] Error reading from Supabase:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    } else {
      logger.error('[readFromSupabase] Error reading from Supabase:', error);
    }
    throw error;
  }
}

// Función para normalizar tipologías de formato "1D/1B" a "1D1B"
function normalizeTipologia(tipologia: string): string {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/data.ts:336',message:'Normalizing tipologia - input',data:{tipologia,tipologiaType:typeof tipologia},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  if (!tipologia || typeof tipologia !== 'string') {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/data.ts:339',message:'Normalizing tipologia - invalid input, using default',data:{tipologia,tipologiaType:typeof tipologia,default:'1D1B'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return '1D1B'; // Default si es inválido
  }
  
  // Mapeo de formatos comunes a formato canónico
  const normalized = tipologia
    .replace(/\//g, '') // Remover barras
    .replace(/\s+/g, '') // Remover espacios
    .trim();
  
  if (!normalized) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/data.ts:349',message:'Normalizing tipologia - empty after normalize, using default',data:{originalTipologia:tipologia,normalized,default:'1D1B'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return '1D1B'; // Default si está vacío después de normalizar
  }
  
  // Validar que esté en formato canónico
  const validFormats = ['Studio', 'Estudio', '1D1B', '2D1B', '2D2B', '3D2B'];
  if (validFormats.includes(normalized)) {
    // Mapear "Estudio" a "Studio"
    const result = normalized === 'Estudio' ? 'Studio' : normalized;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/data.ts:355',message:'Normalizing tipologia - valid format found',data:{originalTipologia:tipologia,normalized,result},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return result;
  }
  
  // Intentar convertir formatos comunes
  const conversions: Record<string, string> = {
    'studio': 'Studio',
    'estudio': 'Studio',
    '1d1b': '1D1B',
    '1d/1b': '1D1B',
    '2d1b': '2D1B',
    '2d/1b': '2D1B',
    '2d2b': '2D2B',
    '2d/2b': '2D2B',
    '3d2b': '3D2B',
    '3d/2b': '3D2B',
  };
  
  const lower = normalized.toLowerCase();
  const result = conversions[lower] || '1D1B'; // Default a 1D1B si no se puede convertir
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/data.ts:373',message:'Normalizing tipologia - conversion result',data:{originalTipologia:tipologia,normalized,lower,result,foundInConversions:!!conversions[lower]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  return result;
}

// Función para leer desde mocks
async function readFromMock(): Promise<Building[]> {
  try {
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
      // Log detallado del error
      if (error instanceof Error) {
        logger.error(`[readAll] ❌ Error leyendo de Supabase: ${error.message}`);
        if (error.message.includes('Missing required environment variables')) {
          logger.error(`[readAll] 💡 Solución: Configura las variables de entorno en Vercel Dashboard → Settings → Environment Variables`);
        }
      } else {
        logger.error(`[readAll] ❌ Error leyendo de Supabase:`, error);
      }
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
