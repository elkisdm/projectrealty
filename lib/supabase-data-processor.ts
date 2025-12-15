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
  unidades: SupabaseUnitRow[];
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
  gc?: number;
  total_mensual?: number;
  orientacion?: string;
  m2_terraza?: number;
  descuento_porcentaje?: number;
  meses_descuento?: number;
  garantia_meses?: number;
  garantia_cuotas?: number;
  rentas_necesarias?: number;
  pet_friendly?: boolean;
  reajuste_meses?: number;
  link_listing?: string;
  disponible?: boolean;
  estacionamiento?: boolean;
  bodega?: boolean;
  parking_optional?: boolean;
  storage_optional?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  images_tipologia?: string[];
  images_areas_comunes?: string[];
  images?: string[];
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
          gc,
          total_mensual,
          orientacion,
          m2_terraza,
          descuento_porcentaje,
          meses_descuento,
          garantia_meses,
          garantia_cuotas,
          rentas_necesarias,
          pet_friendly,
          reajuste_meses,
          link_listing,
          disponible,
          estacionamiento,
          bodega,
          parking_optional,
          storage_optional,
          bedrooms,
          bathrooms,
          images_tipologia,
          images_areas_comunes,
          images,
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

  private async processCondominios(units: SupabaseUnitRow[]): Promise<void> {
    // Agrupar unidades por building_id (condominio)
    const condominiosMap = new Map<string, SupabaseUnitRow[]>();

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
      const precios = unidades.map(u => u.price || 0).filter(p => p > 0);
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
        const preciosTipologia = unidadesTipologia.map(u => u.price || 0).filter(p => p > 0);
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

  async getUnitByOP(op: string): Promise<SupabaseUnitRow | null> {
    if (!this.isInitialized) {
      await this.loadDataFromSupabase();
    }

    for (const condominio of this.condominios.values()) {
      // Buscar por id ya que source_unit_id no está disponible en SupabaseUnitRow
      const unit = condominio.unidades.find(u => u.id === op);
      if (unit) return unit;
    }
    return null;
  }

  async getUnitsByCondominio(condominioSlug: string): Promise<SupabaseUnitRow[]> {
    const condominio = await this.getCondominioBySlug(condominioSlug);
    return condominio ? condominio.unidades : [];
  }

  /**
   * Obtiene unidades con filtros y paginación
   * Retorna unidades individuales (no agrupadas por edificio) según especificación MVP
   */
  async getUnits(filters: {
    comuna?: string;
    precioMin?: number;
    precioMax?: number;
    dormitorios?: number;
    q?: string; // Búsqueda por texto
  }, page: number = 1, limit: number = 12): Promise<{
    units: Array<{
      id: string;
      slug: string;
      codigoUnidad: string;
      buildingId: string;
      tipologia: string;
      dormitorios: number;
      banos: number;
      m2?: number;
      price: number;
      gastoComun: number;
      garantia: number;
      disponible: boolean;
      images: string[];
      building?: {
        id: string;
        name: string;
        slug: string;
        comuna: string;
        address: string;
      };
      [key: string]: unknown;
    }>;
    total: number;
    hasMore: boolean;
  }> {
    if (!this.isInitialized) {
      await this.loadDataFromSupabase();
    }

    // Obtener todas las unidades desde Supabase
    // Usar solo las columnas que realmente existen en la tabla units
    let query = this.supabase
      .from('units')
      .select(`
        id,
        building_id,
        tipologia,
        bedrooms,
        bathrooms,
        m2,
        price,
        disponible,
        estacionamiento,
        bodega,
        images_tipologia,
        images_areas_comunes,
        images,
        buildings!inner (
          id,
          name,
          slug,
          comuna,
          address,
          gallery,
          cover_image
        )
      `, { count: 'exact' })
      .eq('disponible', true); // Solo unidades disponibles

    // Aplicar filtros
    // Nota: Filtros de campos anidados (buildings.comuna) pueden no funcionar directamente
    // Primero obtenemos los datos y luego filtramos en memoria si es necesario
    
    if (filters.precioMin !== undefined) {
      query = query.gte('price', filters.precioMin);
    }

    if (filters.precioMax !== undefined) {
      query = query.lte('price', filters.precioMax);
    }

    // NO filtrar por bedrooms en Supabase porque muchas unidades tienen bedrooms: null
    // Filtrar solo por tipología en memoria después de obtener los datos

    // Para filtros de búsqueda texto, necesitamos obtener datos primero y filtrar después
    // ya que los campos anidados no se pueden filtrar directamente en Supabase

    // Obtener datos sin paginación primero para poder filtrar por comuna y texto
    // Nota: Para filtros complejos con relaciones anidadas, obtenemos todos los datos
    // y filtramos en memoria (más eficiente que múltiples queries)
    const { data: allData, error, count: totalCount } = await query;

    if (error) {
      logger.error('Error obteniendo unidades desde Supabase:', error);
      // Si hay error, retornar vacío en lugar de fallar completamente
      // Esto permite que la API funcione incluso si hay problemas con Supabase
      return {
        units: [],
        total: 0,
        hasMore: false,
      };
    }

    if (!allData || allData.length === 0) {
      logger.log('No se encontraron unidades en Supabase');
      return {
        units: [],
        total: 0,
        hasMore: false,
      };
    }

    let filteredData = (allData || []) as Array<UnitRowWithFields & { buildings: { id: string; name: string; slug?: string; comuna: string; address: string; gallery?: string[]; cover_image?: string } | null }>;

    // Filtrar por comuna en memoria (si se especifica)
    if (filters.comuna) {
      filteredData = filteredData.filter(u => u.buildings?.comuna?.toLowerCase() === filters.comuna!.toLowerCase());
    }

    // Filtrar por dormitorios - filtrar SOLO por tipología porque bedrooms suele ser null
    // Las unidades tienen tipologías como "Studio", "1D1B", "2D1B", "2D2B", "3D2B"
    if (filters.dormitorios !== undefined) {
      filteredData = filteredData.filter(u => {
        // Filtrar por tipología según el número de dormitorios
        if (filters.dormitorios === 0) {
          // Estudio: tipología "Studio" o "Estudio"
          return u.tipologia?.toLowerCase() === 'studio' || u.tipologia?.toLowerCase() === 'estudio';
        } else if (filters.dormitorios === 1) {
          // 1 dormitorio: tipología "1D1B"
          return u.tipologia === '1D1B';
        } else if (filters.dormitorios === 2) {
          // 2 dormitorios: tipologías "2D1B" o "2D2B"
          return u.tipologia === '2D1B' || u.tipologia === '2D2B';
        } else if (filters.dormitorios === 3) {
          // 3 dormitorios: tipología "3D2B"
          return u.tipologia === '3D2B';
        }
        return false;
      });
    }

    // Filtrar por búsqueda de texto (si se especifica)
    if (filters.q) {
      const qLower = filters.q.toLowerCase();
      filteredData = filteredData.filter(u => {
        const building = u.buildings;
        if (!building) return false;
        
        return (
          building.name?.toLowerCase().includes(qLower) ||
          building.address?.toLowerCase().includes(qLower) ||
          building.comuna?.toLowerCase().includes(qLower) ||
          u.tipologia?.toLowerCase().includes(qLower) ||
          u.id?.toLowerCase().includes(qLower)
        );
      });
    }

    // Ordenar por precio (ascendente)
    filteredData.sort((a, b) => (a.price || 0) - (b.price || 0));

    // Paginación
    const offset = (page - 1) * limit;
    const filteredTotal = filteredData.length;
    const paginatedData = filteredData.slice(offset, offset + limit);

    // Type assertion: Supabase puede retornar más campos de los definidos en el tipo
    type UnitRowWithFields = SupabaseUnitRow & {
      unidad?: string;
      gastos_comunes?: number;
      area_interior_m2?: number;
      piso?: number;
      orientacion?: string;
      amoblado?: boolean;
      pet_friendly?: boolean;
      status?: string;
      images_tipologia?: string[];
      images_areas_comunes?: string[];
      images?: string[];
    };
    
    const units = paginatedData;

    // Mapear a formato Unit
    const mappedUnits = units.map((unitRow) => {
      const building = unitRow.buildings;
      if (!building) {
        throw new Error(`Unidad ${unitRow.id} no tiene building asociado`);
      }

      // Generar slug de unidad: building-slug-unidad-id (o usar unidad si está disponible)
      const unidadCode = (unitRow as UnitRowWithFields).unidad || unitRow.id.substring(0, 8);
      const unitSlug = building.slug 
        ? `${building.slug}-${this.generateSlug(unidadCode)}-${unitRow.id.substring(0, 8)}`
        : `${building.id}-${unitRow.id.substring(0, 8)}`;

      // Calcular garantía (por defecto 1 mes de arriendo)
      const garantia = unitRow.price ? unitRow.price : 0;
      const gastoComun = (unitRow as UnitRowWithFields).gastos_comunes || 0;

      // Obtener imágenes (usar gallery del edificio si no hay imágenes específicas)
      // Siempre asegurar al menos una imagen para cumplir con el schema
      let images: string[] = [];
      if (building.gallery && building.gallery.length > 0) {
        images = building.gallery.slice(0, 5); // Máximo 5 imágenes
      } else if (building.cover_image) {
        images = [building.cover_image];
      } else {
        images = ['/images/default-unit.jpg']; // Fallback obligatorio
      }

      const rowWithFields = unitRow as UnitRowWithFields;
      
      return {
        id: unitRow.id,
        slug: unitSlug,
        codigoUnidad: unidadCode,
        buildingId: building.id,
        tipologia: unitRow.tipologia || 'Studio',
        dormitorios: unitRow.bedrooms || 0,
        banos: unitRow.bathrooms || 0,
        m2: unitRow.m2 || rowWithFields.area_interior_m2 || undefined,
        price: unitRow.price || 0,
        gastoComun: unitRow.gc || rowWithFields.gastos_comunes || 0, // Prefer 'gc' from DB
        total_mensual: unitRow.total_mensual,
        garantia: unitRow.price ? unitRow.price : 0,
        disponible: unitRow.disponible ?? true,
        images,
        // Campos de imágenes
        imagesTipologia: rowWithFields.images_tipologia || [],
        imagesAreasComunes: rowWithFields.images_areas_comunes || [],
        // Campos opcionales nuevos
        orientacion: unitRow.orientacion || rowWithFields.orientacion,
        m2_terraza: unitRow.m2_terraza,
        descuento_porcentaje: unitRow.descuento_porcentaje,
        meses_descuento: unitRow.meses_descuento,
        garantia_meses: unitRow.garantia_meses,
        garantia_cuotas: unitRow.garantia_cuotas,
        rentas_necesarias: unitRow.rentas_necesarias,
        pet_friendly: unitRow.pet_friendly,
        reajuste_meses: unitRow.reajuste_meses,
        link_listing: unitRow.link_listing,
        parking_opcional: unitRow.parking_optional,
        storage_opcional: unitRow.storage_optional,

        // Campos opcionales legacy
        piso: rowWithFields.piso,
        vista: rowWithFields.orientacion,
        amoblado: rowWithFields.amoblado,
        politicaMascotas: unitRow.pet_friendly ? 'Permitidas' : undefined,
        estacionamiento: unitRow.estacionamiento,
        bodega: unitRow.bodega,
        estado: rowWithFields.status === 'available' ? 'Disponible' : undefined,
        // Información del edificio (contexto)
        building: {
          id: building.id,
          name: building.name,
          slug: building.slug || building.id,
          comuna: building.comuna,
          address: building.address,
        },
      };
    });

    return {
      units: mappedUnits as Array<{
        id: string;
        slug: string;
        codigoUnidad: string;
        buildingId: string;
        tipologia: string;
        dormitorios: number;
        banos: number;
        m2?: number;
        price: number;
        gastoComun: number;
        garantia: number;
        disponible: boolean;
        images: string[];
        building?: {
          id: string;
          name: string;
          slug: string;
          comuna: string;
          address: string;
        };
        [key: string]: unknown;
      }>,
      total: filteredTotal,
      hasMore: offset + limit < filteredTotal,
    };
  }

  /**
   * Obtiene una unidad por su slug
   * El slug identifica la unidad específica (formato: building-slug-unidad-code-id)
   * Retorna la unidad con información del edificio como contexto
   */
  async getUnitBySlug(unitSlug: string): Promise<{
    unit: {
      id: string;
      slug: string;
      codigoUnidad: string;
      buildingId: string;
      tipologia: string;
      dormitorios: number;
      banos: number;
      m2?: number;
      price: number;
      gastoComun: number;
      total_mensual?: number;
      garantia: number;
      disponible: boolean;
      images: string[];
      // New fields
      orientacion?: string;
      pet_friendly?: boolean;
      m2_terraza?: number;
      descuento_porcentaje?: number;
      meses_descuento?: number;
      garantia_meses?: number;
      garantia_cuotas?: number;
      rentas_necesarias?: number;
      reajuste_meses?: number;
      link_listing?: string;
      parking_opcional?: boolean;
      storage_opcional?: boolean;
      
      building: {
        id: string;
        name: string;
        slug: string;
        comuna: string;
        address: string;
      };
      [key: string]: unknown;
    };
    building: {
      id: string;
      name: string;
      slug: string;
      comuna: string;
      address: string;
      amenities: string[];
      gallery: string[];
    };
    similarUnits?: Array<{
      id: string;
      slug: string;
      codigoUnidad: string;
      buildingId: string;
      tipologia: string;
      dormitorios: number;
      banos: number;
      m2?: number;
      price: number;
      gastoComun: number;
      disponible: boolean;
      images: string[];
      [key: string]: unknown;
    }>;
  } | null> {
    if (!this.isInitialized) {
      await this.loadDataFromSupabase();
    }

    // El slug de unidad tiene formato: building-slug-unidad-code-id
    // Necesitamos buscar todas las unidades y encontrar la que coincida con el slug
    // O bien buscar por ID si el slug termina con el ID de la unidad

    // Obtener todas las unidades disponibles
    const { data: allUnits, error } = await this.supabase
      .from('units')
      .select(`
        id,
        building_id,
        tipologia,
        bedrooms,
        bathrooms,
        m2,
        price,
        gc,
        total_mensual,
        orientacion,
        m2_terraza,
        descuento_porcentaje,
        meses_descuento,
        garantia_meses,
        garantia_cuotas,
        rentas_necesarias,
        pet_friendly,
        reajuste_meses,
        link_listing,
        disponible,
        estacionamiento,
        bodega,
        parking_optional,
        storage_optional,
        images_tipologia,
        images_areas_comunes,
        images,
        buildings!inner (
          id,
          name,
          slug,
          comuna,
          address,
          gallery,
          cover_image,
          amenities
        )
      `)
      .eq('disponible', true);

    if (error) {
      logger.error('Error obteniendo unidad por slug:', error);
      throw error;
    }

    // Type assertion para campos extendidos
    type UnitRowWithFields = SupabaseUnitRow & {
      unidad?: string;
      gastos_comunes?: number;
      area_interior_m2?: number;
      piso?: number;
      orientacion?: string;
      amoblado?: boolean;
      pet_friendly?: boolean;
      status?: string;
      images_tipologia?: string[];
      images_areas_comunes?: string[];
      images?: string[];
    };
    
    const units = (allUnits as Array<UnitRowWithFields & { buildings: { id: string; name: string; slug?: string; comuna: string; address: string; gallery?: string[]; cover_image?: string; amenities?: string[] } | null }>) || [];

    // Buscar la unidad que coincida con el slug
    let foundUnit: typeof units[0] | null = null;

    for (const unitRow of units) {
      const building = unitRow.buildings;
      if (!building) continue;

      // Generar slug de unidad de la misma forma que en getUnits
      const unidadCode = unitRow.unidad || unitRow.id.substring(0, 8);
      const generatedSlug = building.slug 
        ? `${building.slug}-${this.generateSlug(unidadCode)}-${unitRow.id.substring(0, 8)}`
        : `${building.id}-${unitRow.id.substring(0, 8)}`;

      if (generatedSlug === unitSlug) {
        foundUnit = unitRow;
        break;
      }

      // También buscar por ID directo como fallback
      if (unitRow.id === unitSlug || unitSlug.endsWith(unitRow.id.substring(0, 8))) {
        foundUnit = unitRow;
        break;
      }
    }

    if (!foundUnit) {
      return null;
    }

    const building = foundUnit.buildings;
    if (!building) {
      return null;
    }

    // Mapear unidad encontrada
    const unidadCode = foundUnit.unidad || foundUnit.id.substring(0, 8);
    const unitSlugGenerated = building.slug 
      ? `${building.slug}-${this.generateSlug(unidadCode)}-${foundUnit.id.substring(0, 8)}`
      : `${building.id}-${foundUnit.id.substring(0, 8)}`;

    const garantia = foundUnit.price ? foundUnit.price : 0;
    const gastoComun = foundUnit.gastos_comunes || 0;

    const images = building.gallery && building.gallery.length > 0 
      ? building.gallery.slice(0, 5)
      : (building.cover_image ? [building.cover_image] : ['/images/default-unit.jpg']);

    const unit = {
      id: foundUnit.id,
      slug: unitSlugGenerated,
      codigoUnidad: unidadCode,
      buildingId: building.id,
      tipologia: foundUnit.tipologia || 'Studio',
      dormitorios: foundUnit.bedrooms || 0,
      banos: foundUnit.bathrooms || 0,
      m2: foundUnit.m2 || foundUnit.area_interior_m2 || undefined,
      price: foundUnit.price || 0,
      gastoComun,
      total_mensual: foundUnit.total_mensual,
      garantia,
      disponible: foundUnit.disponible ?? true,
      images,
      imagesTipologia: foundUnit.images_tipologia || [],
      imagesAreasComunes: foundUnit.images_areas_comunes || [],
      piso: foundUnit.piso,
      vista: foundUnit.orientacion,
      amoblado: foundUnit.amoblado,
      politicaMascotas: foundUnit.pet_friendly ? 'Permitidas' : undefined,
      estacionamiento: foundUnit.estacionamiento,
      bodega: foundUnit.bodega,
      estado: foundUnit.status === 'available' ? 'Disponible' : undefined,
      
      // New fields mapping
      orientacion: foundUnit.orientacion,
      pet_friendly: foundUnit.pet_friendly,
      m2_terraza: foundUnit.m2_terraza,
      descuento_porcentaje: foundUnit.descuento_porcentaje,
      meses_descuento: foundUnit.meses_descuento,
      garantia_meses: foundUnit.garantia_meses,
      garantia_cuotas: foundUnit.garantia_cuotas,
      rentas_necesarias: foundUnit.rentas_necesarias,
      reajuste_meses: foundUnit.reajuste_meses,
      link_listing: foundUnit.link_listing,
      parking_opcional: foundUnit.parking_optional,
      storage_opcional: foundUnit.storage_optional,
      building: {
        id: building.id,
        name: building.name,
        slug: building.slug || building.id,
        comuna: building.comuna,
        address: building.address,
      },
    };

    // Obtener unidades similares (misma comuna, precio similar, mismo número de dormitorios)
    const similarUnits = units
      .filter(u => {
        const uBuilding = u.buildings;
        if (!uBuilding || u.id === foundUnit!.id) return false;
        
        const sameComuna = uBuilding.comuna === building.comuna;
        const sameDormitorios = (u.bedrooms || 0) === (foundUnit!.bedrooms || 0);
        const similarPrice = foundUnit!.price 
          ? Math.abs((u.price || 0) - foundUnit!.price) <= (foundUnit!.price * 0.2) // ±20%
          : false;

        return sameComuna && sameDormitorios && similarPrice;
      })
      .slice(0, 6)
      .map(u => {
        const uBuilding = u.buildings!;
        const uCode = u.unidad || u.id.substring(0, 8);
        const uSlug = uBuilding.slug 
          ? `${uBuilding.slug}-${this.generateSlug(uCode)}-${u.id.substring(0, 8)}`
          : `${uBuilding.id}-${u.id.substring(0, 8)}`;

        const uImages = uBuilding.gallery && uBuilding.gallery.length > 0 
          ? uBuilding.gallery.slice(0, 1)
          : (uBuilding.cover_image ? [uBuilding.cover_image] : ['/images/default-unit.jpg']);

        return {
          id: u.id,
          slug: uSlug,
          codigoUnidad: uCode,
          buildingId: uBuilding.id,
          tipologia: u.tipologia || 'Studio',
          dormitorios: u.bedrooms || 0,
          banos: u.bathrooms || 0,
          m2: u.m2 || u.area_interior_m2 || undefined,
          price: u.price || 0,
          gastoComun: u.gastos_comunes || 0,
          disponible: u.disponible ?? true,
          images: uImages,
        };
      });

    return {
      unit,
      building: {
        id: building.id,
        name: building.name,
        slug: building.slug || building.id,
        comuna: building.comuna,
        address: building.address,
        amenities: Array.isArray(building.amenities) ? building.amenities : [],
        gallery: Array.isArray(building.gallery) ? building.gallery : (building.cover_image ? [building.cover_image] : []),
      },
      similarUnits: similarUnits.length > 0 ? similarUnits : undefined,
    };
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

