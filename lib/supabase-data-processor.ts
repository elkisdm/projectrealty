// Importación de Supabase
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';
import { createMockSupabaseClient } from './supabase.mock';
import { getTremendoUnitsProcessor, type TremendoUnitsProcessor } from './tremendo-units-processor';
import { logger } from './logger';

/**
 * Función helper para crear cliente Supabase (real o mock según disponibilidad)
 * @param url - URL de Supabase
 * @param key - Clave de autenticación (service role key)
 * @param options - Opciones de configuración del cliente
 * @returns Cliente Supabase (real o mock tipado como SupabaseClient)
 */
function createClient(
  url?: string, 
  key?: string, 
  options?: { auth?: { persistSession?: boolean } }
): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // Si no hay configuración, usar mock
  if (!supabaseUrl || !supabaseServiceKey || !url || !key) {
    // eslint-disable-next-line no-console -- Early init warning before logger setup
    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('⚠️  Supabase no configurado, usando mock');
    }
    // Type assertion: mock implementa interfaz compatible con SupabaseClient
    return createMockSupabaseClient() as unknown as SupabaseClient;
  }
  
  return createSupabaseClient(url, key, options);
}

export interface SupabaseUnit {
  id: string;
  provider: string;
  source_unit_id: string;
  building_id: string;
  unidad: string;
  tipologia: string;
  bedrooms: number;
  bathrooms: number;
  area_m2: number;
  area_interior_m2: number;
  area_exterior_m2: number;
  orientacion: string;
  pet_friendly: boolean;
  precio: number;
  gastos_comunes: number;
  disponible: boolean;
  status: string;
  promotions: string[];
  comment_text: string;
  internal_flags: string[];
  piso: number;
  amoblado: boolean;
  parking_ids: string;
  storage_ids: string;
  parking_opcional: boolean;
  storage_opcional: boolean;
  guarantee_installments: number;
  guarantee_months: number;
  rentas_necesarias: number;
  renta_minima: number;
  link_listing: string;
}

export interface CondominioData {
  id: string;
  nombre: string;
  direccion: string;
  comuna: string;
  unidades: SupabaseUnit[];
  tipologias: string[];
  precioDesde: number;
  precioHasta: number;
  precioPromedio: number;
  totalUnidades: number;
  unidadesDisponibles: number;
  tienePromociones: boolean;
  promociones: string[];
  aceptaMascotas: boolean;
  amenities: string[];
}

export interface LandingBuilding {
  id: string;
  slug: string;
  name: string;
  comuna: string;
  address: string;
  coverImage: string;
  gallery: string[];
  precioDesde: number;
  hasAvailability: boolean;
  badges: Array<{
    type: string;
    label: string;
    description: string;
  }>;
  amenities: string[];
  typologySummary: Array<{
    key: string;
    label: string;
    count: number;
    minPrice: number;
  }>;
}

// Tipo para las filas de unidades devueltas por Supabase (con relación a buildings)
export interface SupabaseUnitRow extends SupabaseUnit {
  buildings: {
    id: string;
    nombre: string;
    comuna: string;
    direccion: string;
  } | null;
}

class SupabaseDataProcessor {
  private supabase: SupabaseClient | ReturnType<typeof createMockSupabaseClient>;
  private condominios: Map<string, CondominioData> = new Map();
  private isInitialized = false;
  private tremendoProcessor: TremendoUnitsProcessor | null = null;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      logger.warn('⚠️  Variables de entorno de Supabase no encontradas, usando mock');
      this.supabase = createClient(); // Mock
    } else {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  async loadDataFromSupabase(): Promise<void> {
    try {
      logger.log('🔍 Cargando datos desde Supabase...');
      
      // Cargar el procesador de Tremendo Units
      this.tremendoProcessor = await getTremendoUnitsProcessor();
      const tremendoBuildings = this.tremendoProcessor.getTremendoBuildings();
      const tremendoCondominios = this.tremendoProcessor.getTremendoCondominios();
      
      logger.log(`🏢 Edificios Tremendo disponibles: ${tremendoBuildings.length}`);
      logger.log(`🏘️ Condominios Tremendo: ${tremendoCondominios.join(', ')}`);
      
      // Obtener todas las unidades desde Supabase usando las columnas correctas
      const { data: units, error } = await this.supabase
        .from('units')
        .select(`
          id,
          provider,
          source_unit_id,
          building_id,
          unidad,
          tipologia,
          bedrooms,
          bathrooms,
          area_m2,
          area_interior_m2,
          area_exterior_m2,
          orientacion,
          pet_friendly,
          precio,
          gastos_comunes,
          disponible,
          status,
          promotions,
          comment_text,
          internal_flags,
          piso,
          amoblado,
          parking_ids,
          storage_ids,
          parking_opcional,
          storage_opcional,
          guarantee_installments,
          guarantee_months,
          rentas_necesarias,
          renta_minima,
          link_listing,
          buildings!inner (
            id,
            nombre,
            comuna,
            direccion
          )
        `)
        .eq('provider', 'assetplan')
        .order('precio', { ascending: true });

      if (error) {
        logger.error('❌ Error cargando unidades:', error);
        throw error;
      }

      logger.log(`📊 Unidades cargadas desde Supabase: ${units.length}`);
      
      // Filtrar solo las unidades que pertenecen a edificios Tremendo
      const filteredUnits = (units as SupabaseUnitRow[]).filter((unit) => {
        const buildingName = unit.buildings?.nombre;
        
        if (!buildingName) {
          return false;
        }
        
        // Verificar si el edificio está en la lista de Tremendo
        const isTremendoBuilding = this.tremendoProcessor?.isTremendoBuilding(buildingName) ?? false;
        
        if (isTremendoBuilding) {
          logger.log(`✅ Edificio Tremendo encontrado: ${buildingName}`);
        }
        
        return isTremendoBuilding;
      });

      logger.log(`✅ Unidades Tremendo filtradas: ${filteredUnits.length} de ${units.length}`);
      
      if (filteredUnits.length === 0) {
        logger.warn('⚠️ No se encontraron unidades de edificios Tremendo');
        logger.log('📋 Edificios disponibles en Supabase:');
        const uniqueBuildings = [...new Set((units as SupabaseUnitRow[]).map((u) => u.buildings?.nombre).filter(Boolean))];
        uniqueBuildings.forEach((building) => {
          logger.log(`   - ${building}`);
        });
      }
      
      await this.processCondominios(filteredUnits);
      
    } catch (error) {
      logger.error('❌ Error cargando datos de Supabase:', error);
      throw error;
    }
  }

  private async processCondominios(units: SupabaseUnit[]): Promise<void> {
    // Agrupar unidades por building_id (condominio)
    const condominiosMap = new Map<string, SupabaseUnit[]>();

    units.forEach(unit => {
      if (unit.building_id) {
        if (!condominiosMap.has(unit.building_id)) {
          condominiosMap.set(unit.building_id, []);
        }
        condominiosMap.get(unit.building_id)!.push(unit);
      }
    });

    // Procesar cada condominio
    condominiosMap.forEach((unidades, buildingId) => {
      const precios = unidades.map(u => u.precio).filter(p => p > 0);
      const tipologias = [...new Set(unidades.map(u => u.tipologia).filter(t => t))];
      
      // Considerar disponibles las unidades con disponible = true
      const unidadesDisponibles = unidades.filter(u => u.disponible).length;
      
      const tienePromociones = unidades.some(u => 
        u.promotions && u.promotions.length > 0 || 
        u.internal_flags && u.internal_flags.length > 0
      );
      const aceptaMascotas = unidades.some(u => u.pet_friendly);

      // Generar promociones
      const promociones: string[] = [];
      if (tienePromociones) {
        // Buscar promociones en promotions array
        unidades.forEach(u => {
          if (u.promotions && u.promotions.length > 0) {
            promociones.push(...u.promotions);
          }
        });
        
        // Buscar flags especiales
        unidades.forEach(u => {
          if (u.internal_flags && u.internal_flags.length > 0) {
            if (u.internal_flags.includes('tremenda_promo')) {
              promociones.push('Tremenda Promo');
            }
            if (u.internal_flags.includes('oferta_especial')) {
              promociones.push('Oferta Especial');
            }
          }
        });
      }

      // Generar amenities basados en características del condominio
      const amenities: string[] = [];
      if (aceptaMascotas) amenities.push('Pet Friendly');
      if (unidades.some(u => u.parking_ids && u.parking_ids !== 'x')) amenities.push('Estacionamiento');
      if (unidades.some(u => u.storage_ids && u.storage_ids !== 'x')) amenities.push('Bodega');
      if (tipologias.length > 2) amenities.push('Múltiples Tipologías');
      amenities.push('Seguridad 24/7', 'Áreas Comunes');

      // Obtener información del building
      const buildingInfo = unidades[0] as SupabaseUnitRow;
      const buildingName = buildingInfo.buildings?.nombre || `Edificio ${buildingId}`;
      const buildingComuna = buildingInfo.buildings?.comuna || 'Santiago';
      const buildingDireccion = buildingInfo.buildings?.direccion || 'Dirección no disponible';

      const condominioData: CondominioData = {
        id: buildingId,
        nombre: buildingName,
        direccion: buildingDireccion,
        comuna: buildingComuna,
        unidades,
        tipologias,
        precioDesde: precios.length > 0 ? Math.min(...precios) : 0,
        precioHasta: precios.length > 0 ? Math.max(...precios) : 0,
        precioPromedio: precios.length > 0 ? precios.reduce((a, b) => a + b, 0) / precios.length : 0,
        totalUnidades: unidades.length,
        unidadesDisponibles,
        tienePromociones,
        promociones: [...new Set(promociones)], // Eliminar duplicados
        aceptaMascotas,
        amenities,
      };

      this.condominios.set(buildingId, condominioData);
    });

    logger.log(`🏢 Condominios procesados: ${this.condominios.size}`);
    this.isInitialized = true;
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  async getLandingBuildings(limit: number = 12, offset: number = 0): Promise<{
    buildings: LandingBuilding[];
    total: number;
    hasMore: boolean;
  }> {
    if (!this.isInitialized) {
      await this.loadDataFromSupabase();
    }

    const buildings: LandingBuilding[] = [];
    const allCondominios = Array.from(this.condominios.values())
      .filter(condominio => condominio.unidadesDisponibles > 0)
      .sort((a, b) => a.precioDesde - b.precioDesde);

    const total = allCondominios.length;
    const paginatedCondominios = allCondominios.slice(offset, offset + limit);

    paginatedCondominios.forEach(condominio => {
      const typologySummary = condominio.tipologias.map(tipologia => {
        const unidadesTipologia = condominio.unidades.filter(u => u.tipologia === tipologia);
        const preciosTipologia = unidadesTipologia.map(u => u.precio).filter(p => p > 0);
        return {
          key: tipologia,
          label: tipologia,
          count: unidadesTipologia.length,
          minPrice: preciosTipologia.length > 0 ? Math.min(...preciosTipologia) : 0,
        };
      });

      const building: LandingBuilding = {
        id: condominio.id,
        slug: condominio.id,
        name: condominio.nombre,
        comuna: condominio.comuna,
        address: condominio.direccion,
        coverImage: this.getCoverImage(condominio.comuna),
        gallery: this.getGallery(condominio.comuna),
        precioDesde: condominio.precioDesde,
        hasAvailability: condominio.unidadesDisponibles > 0,
        badges: condominio.promociones.map(promo => ({
          type: 'promotion',
          label: promo,
          description: promo,
        })),
        amenities: condominio.amenities.slice(0, 6),
        typologySummary,
      };

      buildings.push(building);
    });

    return {
      buildings,
      total,
      hasMore: offset + limit < total
    };
  }

  async getCondominioBySlug(slug: string): Promise<CondominioData | null> {
    if (!this.isInitialized) {
      await this.loadDataFromSupabase();
    }

    for (const condominio of this.condominios.values()) {
      if (condominio.id === slug) {
        return condominio;
      }
    }
    return null;
  }

  async getUnitByOP(op: string): Promise<SupabaseUnit | null> {
    if (!this.isInitialized) {
      await this.loadDataFromSupabase();
    }

    for (const condominio of this.condominios.values()) {
      const unit = condominio.unidades.find(u => u.source_unit_id === op);
      if (unit) return unit;
    }
    return null;
  }

  async getUnitsByCondominio(condominioSlug: string): Promise<SupabaseUnit[]> {
    const condominio = await this.getCondominioBySlug(condominioSlug);
    return condominio ? condominio.unidades : [];
  }

  private getCoverImage(comuna: string): string {
    // Mapear comunas a imágenes de portada
    const comunaImages: Record<string, string> = {
      'Las Condes': '/images/lascondes-cover.jpg',
      'Providencia': '/images/providencia-cover.jpg',
      'Ñuñoa': '/images/nunoa-cover.jpg',
      'Santiago': '/images/santiago-cover.jpg',
      'La Florida': '/images/laflorida-cover.jpg',
      'Estación Central': '/images/estacioncentral-cover.jpg',
      'San Miguel': '/images/sanmiguel-cover.jpg',
      'Independencia': '/images/independencia-cover.jpg',
    };

    return comunaImages[comuna] || '/images/lascondes-cover.jpg';
  }

  private getGallery(comuna: string): string[] {
    // Galería de imágenes por comuna
    const comunaGalleries: Record<string, string[]> = {
      'Las Condes': [
        '/images/lascondes-1.jpg',
        '/images/lascondes-2.jpg',
        '/images/lascondes-3.jpg',
      ],
      'Providencia': [
        '/images/providencia-1.jpg',
        '/images/providencia-2.jpg',
        '/images/providencia-3.jpg',
      ],
      'Ñuñoa': [
        '/images/nunoa-1.jpg',
        '/images/nunoa-2.jpg',
        '/images/nunoa-3.jpg',
      ],
    };

    return comunaGalleries[comuna] || [
      '/images/lascondes-1.jpg',
      '/images/lascondes-2.jpg',
      '/images/lascondes-3.jpg',
    ];
  }
}

// Instancia singleton
let processor: SupabaseDataProcessor | null = null;

export async function getSupabaseProcessor(): Promise<SupabaseDataProcessor> {
  if (!processor) {
    processor = new SupabaseDataProcessor();
  }
  return processor;
}

export { SupabaseDataProcessor };

