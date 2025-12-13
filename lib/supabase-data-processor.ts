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
  slug: string;
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
  gallery: string[];
  coverImage: string;
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
export interface SupabaseUnitRow {
  id: string;
  building_id: string;
  tipologia: string;
  m2?: number;
  price?: number;
  disponible?: boolean;
  estacionamiento?: boolean;
  bodega?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  buildings: {
    id: string;
    name: string;
    slug?: string;
    comuna: string;
    address: string;
    amenities?: string[];
    gallery?: string[];
    cover_image?: string;
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
          building_id,
          tipologia,
          m2,
          price,
          disponible,
          estacionamiento,
          bodega,
          bedrooms,
          bathrooms,
          buildings!inner (
            id,
            name,
            slug,
            comuna,
            address,
            amenities,
            gallery,
            cover_image
          )
        `)
        .order('price', { ascending: true });

      if (error) {
        logger.error('❌ Error cargando unidades:', error);
        throw error;
      }

      logger.log(`📊 Unidades cargadas desde Supabase: ${units?.length || 0}`);
      
      // Usar todas las unidades, no solo las de Tremendo
      const filteredUnits = (units as SupabaseUnitRow[]) || [];
      
      if (filteredUnits.length === 0) {
        logger.warn('⚠️ No se encontraron unidades en Supabase');
      } else {
        logger.log(`✅ Unidades disponibles: ${filteredUnits.length}`);
        const uniqueBuildings = [...new Set(filteredUnits.map((u) => u.buildings?.name).filter(Boolean))];
        logger.log(`📋 Edificios encontrados: ${uniqueBuildings.length}`);
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
      const precios = unidades.map(u => (u as any).price || 0).filter(p => p > 0);
      const tipologias = [...new Set(unidades.map(u => u.tipologia).filter(t => t))];
      
      // Considerar disponibles las unidades con disponible = true
      const unidadesDisponibles = unidades.filter(u => u.disponible).length;
      
      const tienePromociones = false; // No hay campo promotions en el schema actual
      const aceptaMascotas = false; // No hay campo pet_friendly en el schema actual

      // Generar promociones (vacío por ahora)
      const promociones: string[] = [];

      // Generar amenities basados en características del condominio
      const amenities: string[] = [];
      if (unidades.some(u => (u as any).estacionamiento)) amenities.push('Estacionamiento');
      if (unidades.some(u => (u as any).bodega)) amenities.push('Bodega');
      if (tipologias.length > 2) amenities.push('Múltiples Tipologías');
      amenities.push('Seguridad 24/7', 'Áreas Comunes');

      // Obtener información del building
      const buildingInfo = unidades[0] as any;
      const buildingName = buildingInfo.buildings?.name || `Edificio ${buildingId}`;
      const buildingSlug = buildingInfo.buildings?.slug || buildingId;
      const buildingComuna = buildingInfo.buildings?.comuna || 'Santiago';
      const buildingDireccion = buildingInfo.buildings?.address || 'Dirección no disponible';
      const buildingAmenities = buildingInfo.buildings?.amenities || [];
      const buildingGallery = buildingInfo.buildings?.gallery || [];
      const buildingCoverImage = buildingInfo.buildings?.cover_image || this.getCoverImage(buildingComuna);

      const condominioData: CondominioData = {
        id: buildingId,
        slug: buildingSlug,
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
        amenities: buildingAmenities.length > 0 ? buildingAmenities : amenities,
        gallery: buildingGallery.length > 0 ? buildingGallery : this.getGallery(buildingComuna),
        coverImage: buildingCoverImage,
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
        slug: condominio.slug,
        name: condominio.nombre,
        comuna: condominio.comuna,
        address: condominio.direccion,
        coverImage: condominio.coverImage || this.getCoverImage(condominio.comuna),
        gallery: condominio.gallery.length > 0 ? condominio.gallery : this.getGallery(condominio.comuna),
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
      // Buscar por slug primero, luego por id para compatibilidad
      if (condominio.slug === slug || condominio.id === slug) {
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

