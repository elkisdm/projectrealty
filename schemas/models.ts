import { z } from "zod";

// Promotions
export enum PromotionType {
  DISCOUNT_PERCENT = "discount_percent",
  FREE_COMMISSION = "free_commission",
  GUARANTEE_INSTALLMENTS = "guarantee_installments",
  FIXED_PRICE_TERM = "fixed_price_term",
  NO_AVAL = "no_aval",
  NO_GUARANTEE = "no_guarantee",
  SERVICE_PRO = "service_pro",
}

export const PromotionBadgeSchema = z.object({
  label: z.string().min(1),
  type: z.nativeEnum(PromotionType),
  tag: z.string().min(1).optional(),
});

// Media and Location
const LatLngSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export const MediaSchema = z.object({
  images: z.array(z.string().min(1)).min(1),
  tour360: z.string().min(1).optional(),
  video: z.string().min(1).optional(),
  map: LatLngSchema.optional(),
});

// Transit
export const TransitSchema = z.object({
  name: z.string().min(1),
  distanceMin: z.number().int().nonnegative(),
});

// Typology summary
export const TypologySummarySchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  count: z.number().int().nonnegative(),
  minPrice: z.number().int().positive().optional(),
  minM2: z.number().positive().optional(),
});

// New schemas for v2 validations
export const ParkingStorageSchema = z.object({
  ids: z.string().nullable(),
  has_optional: z.boolean(),
});

export const UnitSchema = z.object({
  id: z.string().min(1),
  tipologia: z.string().min(1).regex(/^(Studio|Estudio|1D1B|2D1B|2D2B|3D2B)$/, {
    message: "Tipología debe estar en formato canónico: Studio/Estudio, 1D1B, 2D1B, 2D2B, 3D2B"
  }),
  price: z.number().int().positive(),
  disponible: z.boolean(),
  // ✅ Campos requeridos según especificación MVP (Sprint 6.3.1)
  slug: z.string().min(1),
  codigoUnidad: z.string().min(1),
  buildingId: z.string().min(1),
  // Información básica
  dormitorios: z.number().int().nonnegative(), // 0 para Studio/Estudio
  banos: z.number().int().positive(),
  // Información económica
  gastoComun: z.number().int().nonnegative().optional(),
  garantia: z.number().int().positive(),
  // Contenido visual
  images: z.array(z.string().min(1)).optional(), // Opcional, puede estar vacío
  // Campos opcionales según especificación
  m2: z.number().positive().optional(), // Superficie interior (opcional)
  piso: z.number().int().nonnegative().optional(),
  vista: z.string().optional(), // Opcional: "Norte", "Sur", etc.
  amoblado: z.boolean().optional(),
  politicaMascotas: z.string().optional(),
  precioFijoMeses: z.number().int().positive().optional(), // Ej: 3 (precio fijo primeros 3 meses)
  garantiaEnCuotas: z.boolean().optional(),
  cuotasGarantia: z.number().int().min(1).max(12, {
    message: "Cuotas de garantía deben estar entre 1-12"
  }).optional(),
  reajuste: z.string().optional(), // Ej: "cada 3 meses según UF"
  estado: z.enum(["Disponible", "Reservado", "Arrendado"]).optional(),
  estacionamiento: z.boolean().optional(),
  bodega: z.boolean().optional(),
  imagesTipologia: z.array(z.string().min(1)).optional(),
  imagesAreasComunes: z.array(z.string().min(1)).optional(),
  // Extended fields (backward compatibility)
  codigoInterno: z.string().min(1).optional(),
  bedrooms: z.number().int().nonnegative().optional(), // Alias de dormitorios (0 válido para Studio)
  bathrooms: z.number().int().positive().optional(), // Alias de banos
  area_interior_m2: z.number().positive().max(200, {
    message: "Área interior debe estar entre 20-200 m²"
  }).optional(),
  area_exterior_m2: z.number().nonnegative().max(50, {
    message: "Área exterior debe estar entre 0-50 m²"
  }).optional(),
  orientacion: z.enum(['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']).optional(),
  petFriendly: z.boolean().optional(),
  parkingOptions: z.array(z.string().min(1)).optional(),
  storageOptions: z.array(z.string().min(1)).optional(),
  status: z.enum(["available", "reserved", "rented"]).optional(), // Legacy status
  promotions: z.array(PromotionBadgeSchema).optional(),
  // New v2 fields (backward compatibility)
  parking_ids: z.string().nullable().optional(),
  storage_ids: z.string().nullable().optional(),
  parking_opcional: z.boolean().optional(),
  storage_opcional: z.boolean().optional(),
  guarantee_installments: z.number().int().min(1).max(12, {
    message: "Cuotas de garantía deben estar entre 1-12"
  }).optional(),
  guarantee_months: z.number().int().min(0).max(2, {
    message: "Meses de garantía deben ser 0, 1 o 2"
  }).optional(),
  rentas_necesarias: z.number().positive().optional(),
  link_listing: z.string().url().optional(),
  renta_minima: z.number().positive().optional(),
  gastosComunes: z.number().int().nonnegative().optional(), // Alias de gastoComun
  // Nota: precioFijoMeses ya está validado con .int().positive(), no se requiere refine adicional
});

// Schemas para campos extendidos de Building
const ConectividadSchema = z.object({
  viaPrincipal: z.boolean().optional(),
  transporteUrbano: z.boolean().optional(),
  comerciosCercanos: z.boolean().optional(),
  areasVerdes: z.boolean().optional(),
}).optional();

const MetroCercanoSchema = z.object({
  nombre: z.string().min(1),
  distancia: z.number().nonnegative().optional(), // Distancia en metros
  tiempoCaminando: z.number().int().positive().optional(), // Tiempo caminando en minutos
}).optional();

const EstacionamientosSchema = z.object({
  subterraneo: z.boolean().optional(),
  visitas: z.boolean().optional(),
  disponibles: z.boolean().optional(),
}).optional();

const BodegasSchema = z.object({
  disponibles: z.boolean().optional(),
  descripcion: z.string().optional(),
}).optional();

const PoliticaMascotasSchema = z.object({
  petFriendly: z.boolean(),
  pesoMaximoKg: z.number().positive().optional(),
  permitidos: z.array(z.string()).optional(),
  prohibidos: z.array(z.string()).optional(),
  reglas: z.array(z.string()).optional(),
  nota: z.string().optional(),
}).optional();

const DocumentacionSchema = z.object({
  dependiente: z.array(z.string()).optional(),
  independiente: z.array(z.string()).optional(),
  extranjeros: z.array(z.string()).optional(),
});

const AvalesSchema = z.object({
  permitidos: z.boolean(),
  maxAvales: z.number().int().positive().optional(),
  algunosDepartamentosRequierenAvalObligatorio: z.boolean().optional(),
});

const CondicionesFinancierasSchema = z.object({
  puntajeFinanciero: z.number().int().positive().optional(),
  rentaMinimaMultiplo: z.string().optional(),
  avales: AvalesSchema,
  garantiaEnCuotas: z.boolean().optional(),
});

const RequisitosArriendoSchema = z.object({
  documentacion: DocumentacionSchema,
  condicionesFinancieras: CondicionesFinancierasSchema,
}).optional();

const SalidaAnticipadaSchema = z.object({
  aplicaMulta: z.boolean(),
  descripcion: z.string().optional(),
});

const DespuesDelAnoSchema = z.object({
  salidaLibre: z.boolean(),
  avisoPrevio: z.boolean(),
  descripcion: z.string().optional(),
});

const InfoContratoSchema = z.object({
  duracionAnos: z.number().int().positive(),
  salidaAnticipada: SalidaAnticipadaSchema,
  despuesDelAno: DespuesDelAnoSchema,
}).optional();

const OcupacionSchema = z.object({
  maxPersonasPorDormitorio: z.number().int().positive().optional(),
  menores3AnosNoCuentan: z.boolean().optional(),
}).optional();

export const BuildingSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  comuna: z.string().min(1).refine((val) => !/\d/.test(val), {
    message: "Comuna no debe contener dígitos"
  }),
  address: z.string().min(1),
  amenities: z.array(z.string().min(1)).default(['Áreas comunes']), // Default mínimo
  gallery: z.array(z.string().min(1)).min(1), // Mínimo 1 imagen (no 3)
  units: z.array(UnitSchema).min(1),
  coverImage: z.string().min(1).optional(),
  // Campos extendidos según especificación MVP (todos opcionales)
  region: z.string().optional(), // Ej: "Región Metropolitana"
  conectividad: ConectividadSchema,
  metroCercano: MetroCercanoSchema,
  tipoProyecto: z.string().optional(), // Ej: "Multifamily – Propiedades nuevas"
  administracion: z.string().optional(), // Ej: "Servicio Pro Assetplan"
  descripcion: z.string().optional(), // Descripción general del edificio
  seguridadAccesos: z.array(z.string().min(1)).optional(), // ["Accesos controlados", "Conserjería", ...]
  estacionamientos: EstacionamientosSchema,
  bodegas: BodegasSchema,
  serviciosEdificio: z.array(z.string().min(1)).optional(), // ["Ascensores", "Calefacción central", ...]
  politicaMascotas: PoliticaMascotasSchema,
  requisitosArriendo: RequisitosArriendoSchema,
  infoContrato: InfoContratoSchema,
  ocupacion: OcupacionSchema,
  // Extended fields (backward compatibility)
  badges: z.array(PromotionBadgeSchema).optional(),
  serviceLevel: z.enum(["pro", "standard"]).optional(),
  media: MediaSchema.optional(),
  nearestTransit: TransitSchema.optional(),
  hasAvailability: z.boolean().optional(),
  precioRango: z
    .object({ min: z.number().int().nonnegative(), max: z.number().int().nonnegative() })
    .refine((v) => v.max >= v.min, { message: "max must be >= min" })
    .optional(),
  typologySummary: z.array(TypologySummarySchema).optional(),
  // New v2 fields
  gc_mode: z.enum(['MF', 'variable']).optional(),
  precio_desde: z.number().int().positive().optional(),
  precio_hasta: z.number().int().positive().optional(),
  featured: z.boolean().optional(),
});

export const BookingRequestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(5),
  buildingId: z.string().min(1),
  unitId: z.string().min(1),
  message: z.string().optional(),
  preferredDate: z.string().datetime().optional(),
});

export const WaitlistRequestSchema = z.object({
  email: z.string().email(),
  phone: z.string().max(32).optional(),
  name: z.string().min(1).max(100).optional(),
  contactMethod: z.enum(['whatsapp', 'call', 'email']).optional(),
  source: z.string().max(50).optional(),
});

/**
 * Schema para filtros de búsqueda de unidades
 * ⚠️ IMPORTANTE: NO incluye filtro por baños según especificación MVP
 */
export const SearchFiltersSchema = z.object({
  q: z.string().optional(), // Búsqueda por texto
  comuna: z.string().optional(),
  precioMin: z.number().int().nonnegative().optional(),
  precioMax: z.number().int().nonnegative().optional(),
  dormitorios: z.number().int().positive().optional(),
  // ⚠️ banos NO incluido - No se filtra por baños
  sort: z.enum(["precio", "ubicacion", "relevancia"]).optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(12),
}).refine((data) => {
  // Validar que precioMax >= precioMin si ambos están presentes
  if (data.precioMin !== undefined && data.precioMax !== undefined) {
    return data.precioMax >= data.precioMin;
  }
  return true;
}, {
  message: "precioMax debe ser mayor o igual a precioMin",
  path: ["precioMax"]
});

export type Unit = z.infer<typeof UnitSchema>;
export type Building = z.infer<typeof BuildingSchema>;
export type BookingRequest = z.infer<typeof BookingRequestSchema>;
export type WaitlistRequest = z.infer<typeof WaitlistRequestSchema>;
export type SearchFilters = z.infer<typeof SearchFiltersSchema>;
export type PromotionBadge = z.infer<typeof PromotionBadgeSchema>;
export type TypologySummary = z.infer<typeof TypologySummarySchema>;
export type Media = z.infer<typeof MediaSchema>;
export type ParkingStorage = z.infer<typeof ParkingStorageSchema>;

/**
 * Tipo para respuesta del endpoint GET /api/buildings
 * Retorna unidades paginadas según especificación MVP
 */
export interface BuildingsResponse {
  units: Unit[];
  total: number;
  hasMore: boolean;
  page: number;
  limit: number;
}

/**
 * Tipo para respuesta del endpoint GET /api/buildings/[slug]
 * Retorna una unidad específica con información del edificio y unidades similares
 */
export interface UnitDetailResponse {
  unit: Unit;
  building: {
    id: string;
    name: string;
    slug: string;
    address: string;
    comuna: string;
    amenities: string[];
    gallery: string[];
  };
  similarUnits?: Unit[];
}

// Extended types for v2 compatibility
export type UnitV2 = Unit & {
  parking_ids?: string | null;
  storage_ids?: string | null;
  parking_opcional?: boolean;
  storage_opcional?: boolean;
  guarantee_installments?: number;
  guarantee_months?: number;
  rentas_necesarias?: number;
  link_listing?: string;
  renta_minima?: number;
};

export type BuildingV2 = Building & {
  gc_mode?: 'MF' | 'variable';
  precio_desde?: number;
  precio_hasta?: number;
  featured?: boolean;
};


