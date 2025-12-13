import { BuildingSchema, UnitSchema, type Building, type Unit, PromotionType, type PromotionBadge } from "@schemas/models";
import { AMENITY_LABEL_TO_KEY, BADGE_LABEL_TO_TAG, PromotionTag } from "./constants";

// Raw provider types for AssetPlan input. These are conservative and capture only
// the fields we actually consume in the adapter.
export type AssetPlanRawBadge = {
  label: string;
};

export type AssetPlanRawMedia = {
  images?: string[];
  tour360?: string;
  video?: string;
  lat?: number;
  lng?: number;
};

export type AssetPlanRawTransit = {
  name: string;
  distanceMin: number;
};

export type AssetPlanRawUnit = {
  id: string | number;
  codigoInterno?: string;
  tipologia?: string; // e.g., "1D/1B", "Studio"
  bedrooms?: number;
  bathrooms?: number;
  m2?: number; // total or interior, depends on source
  area_interior_m2?: number;
  area_exterior_m2?: number;
  orientacion?: string;
  piso?: number;
  amoblado?: boolean;
  petFriendly?: boolean;
  estacionamiento?: boolean;
  bodega?: boolean;
  parkingOptions?: string[];
  storageOptions?: string[];
  price?: number;
  disponible?: boolean;
  status?: string; // provider-specific status label
  promotions?: AssetPlanRawBadge[] | string[]; // can be strings or objects with label
};

export type AssetPlanRawBuilding = {
  id: string | number;
  slug?: string;
  nombre: string;
  comuna: string;
  direccion: string;
  coverImage?: string;
  amenities?: string[]; // free-form labels
  media?: AssetPlanRawMedia;
  serviceLevel?: "pro" | "standard" | string;
  badges?: AssetPlanRawBadge[] | string[];
  nearestTransit?: AssetPlanRawTransit;
  images?: string[]; // sometimes comes at root instead of media.images
  units: AssetPlanRawUnit[];
};

function normalizeString(value: string | undefined | null): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function coerceId(value: string | number): string {
  return String(value).trim();
}

// Map provider status labels into internal enum
function mapStatus(providerStatus?: string): Unit["status"] {
  const v = normalizeString(providerStatus)?.toLowerCase();
  switch (v) {
    case "available":
    case "disponible":
    case "libre":
    case "en disponibilidad":
      return "available";
    case "reserved":
    case "reservado":
      return "reserved";
    case "rented":
    case "arrendado":
    case "ocupado":
      return "rented";
    default:
      return undefined;
  }
}

// Map provider badge labels to internal PromotionType
const PROMOTION_TAG_TO_TYPE: Record<PromotionTag, PromotionType> = {
  [PromotionTag.DISCOUNT_PERCENT]: PromotionType.DISCOUNT_PERCENT,
  [PromotionTag.FREE_COMMISSION]: PromotionType.FREE_COMMISSION,
  [PromotionTag.GUARANTEE_INSTALLMENTS]: PromotionType.GUARANTEE_INSTALLMENTS,
  [PromotionTag.FIXED_PRICE_TERM]: PromotionType.FIXED_PRICE_TERM,
  [PromotionTag.NO_AVAL]: PromotionType.NO_AVAL,
  [PromotionTag.NO_GUARANTEE]: PromotionType.NO_GUARANTEE,
  [PromotionTag.SERVICE_PRO]: PromotionType.SERVICE_PRO,
};

function toPromotionBadges(input?: (AssetPlanRawBadge | string)[]): PromotionBadge[] | undefined {
  if (!input || input.length === 0) return undefined;
  const badges: PromotionBadge[] = [];
  for (const b of input) {
    const label = typeof b === "string" ? b : b.label;
    const normLabel = normalizeString(label);
    if (!normLabel) continue;
    const tagKey = BADGE_LABEL_TO_TAG[normLabel as keyof typeof BADGE_LABEL_TO_TAG];
    if (!tagKey) continue;
    const type = PROMOTION_TAG_TO_TYPE[tagKey];
    badges.push({ label: normLabel, type });
  }
  return badges.length ? badges : undefined;
}

// Map a single AssetPlan unit into our internal Unit
export function mapUnit(raw: AssetPlanRawUnit): Unit {
  const id = coerceId(raw.id);
  const tipologia = normalizeTypology(raw.tipologia) ?? "";

  // Prefer explicit m2 when provided; otherwise sum interior + exterior
  const explicitM2 = typeof raw.m2 === 'number' ? raw.m2 : undefined;
  const areaInterior = typeof raw.area_interior_m2 === 'number' ? raw.area_interior_m2 : undefined;
  const areaExterior = typeof raw.area_exterior_m2 === 'number' ? raw.area_exterior_m2 : undefined;
  const areaTotal = explicitM2 ?? ((areaInterior ?? 0) + (areaExterior ?? 0));
  const m2 = Number(areaTotal ?? 0);

  const price = Number(raw.price ?? 0);
  const estacionamiento = Boolean(raw.estacionamiento ?? (raw.parkingOptions && raw.parkingOptions.length > 0));
  const bodega = Boolean(raw.bodega ?? (raw.storageOptions && raw.storageOptions.length > 0));
  const disponible = Boolean(
    typeof raw.disponible === "boolean" ? raw.disponible : mapStatus(raw.status) === "available"
  );

  const base: Unit = {
    id,
    tipologia,
    m2,
    price,
    estacionamiento,
    bodega,
    disponible,
  };

  const extended: Partial<Unit> = {
    codigoInterno: normalizeString(raw.codigoInterno),
    bedrooms: typeof raw.bedrooms === "number" ? raw.bedrooms : undefined,
    bathrooms: typeof raw.bathrooms === "number" ? raw.bathrooms : undefined,
    area_interior_m2: typeof raw.area_interior_m2 === "number" ? raw.area_interior_m2 : undefined,
    area_exterior_m2: typeof raw.area_exterior_m2 === "number" ? raw.area_exterior_m2 : undefined,
    orientacion: normalizeOrientation(raw.orientacion),
    piso: typeof raw.piso === "number" ? raw.piso : undefined,
    amoblado: typeof raw.amoblado === "boolean" ? raw.amoblado : undefined,
    petFriendly: typeof raw.petFriendly === "boolean" ? raw.petFriendly : undefined,
    parkingOptions: Array.isArray(raw.parkingOptions) ? raw.parkingOptions.map((s) => s.trim()).filter(Boolean) : undefined,
    storageOptions: Array.isArray(raw.storageOptions) ? raw.storageOptions.map((s) => s.trim()).filter(Boolean) : undefined,
    status: mapStatus(raw.status),
    promotions: toPromotionBadges(raw.promotions as (AssetPlanRawBadge | string)[] | undefined),
  };

  // Validate and return; rely on schema for final shape correctness
  return UnitSchema.parse({ ...base, ...extended });
}

// Convert AssetPlan raw payload into internal Building model
export function fromAssetPlan(raw: AssetPlanRawBuilding): Building {
  const id = coerceId(raw.id);
  const name = normalizeString(raw.nombre) ?? "";
  const comuna = normalizeString(raw.comuna) ?? "";
  const address = normalizeString(raw.direccion) ?? "";
  const slug = normalizeString(raw.slug) ?? id;

  // Amenities normalization using canonical keys
  const amenities = Array.isArray(raw.amenities)
    ? raw.amenities
        .map((a) => normalizeString(a))
        .filter((a): a is string => Boolean(a))
        .map((a) => AMENITY_LABEL_TO_KEY[a as keyof typeof AMENITY_LABEL_TO_KEY])
        .filter(Boolean)
    : [];

  // Media/images handling and fallbacks
  const images = (raw.media?.images ?? raw.images ?? []).map((s) => s?.trim()).filter(Boolean) as string[];
  const gallery = images.slice();
  const coverImage = normalizeString(raw.coverImage) ?? gallery[0];

  // Badges (building level)
  const badges = toPromotionBadges(raw.badges);

  // Service level: prefer explicit, else infer from SERVICE_PRO badge
  const serviceLevel = ((): Building["serviceLevel"] => {
    const explicit = normalizeString(typeof raw.serviceLevel === "string" ? raw.serviceLevel : undefined)?.toLowerCase();
    if (explicit === "pro" || explicit === "standard") return explicit as "pro" | "standard";
    // Infer from badges or from root label properties
    const buildingHasServiceProBadge = (badges ?? []).some((b) => b.type === PromotionType.SERVICE_PRO);
    const rawWithBadges = raw as { badges?: string[] | AssetPlanRawBadge[] };
    const rootHasServiceProLabel = Array.isArray(rawWithBadges.badges) && 
      rawWithBadges.badges.some(b => (typeof b === 'string' ? b : b.label) === 'Servicio Pro');
    return (buildingHasServiceProBadge || rootHasServiceProLabel) ? "pro" : undefined;
  })();

  const nearestTransit = raw.nearestTransit && typeof raw.nearestTransit.name === "string" && typeof raw.nearestTransit.distanceMin === "number"
    ? { name: raw.nearestTransit.name.trim(), distanceMin: raw.nearestTransit.distanceMin }
    : undefined;

  const units = Array.isArray(raw.units) ? raw.units.map(mapUnit) : [];

  // Build candidate object
  const candidate: Partial<Building> & Pick<Building, "id" | "slug" | "name" | "comuna" | "address" | "amenities" | "gallery" | "units"> = {
    id,
    slug,
    name,
    comuna,
    address,
    amenities,
    gallery,
    units,
  };

  if (coverImage) candidate.coverImage = coverImage;
  // Always include media object if any media-related field is present in raw
  const rawWithMedia = raw as { tour360?: string; video?: string; media?: AssetPlanRawMedia };
  const mediaTour = normalizeString(rawWithMedia.tour360) ?? normalizeString(raw.media?.tour360);
  const mediaVideo = normalizeString(rawWithMedia.video) ?? normalizeString(raw.media?.video);
  const hasAnyMedia = images.length > 0 || Boolean(mediaTour) || Boolean(mediaVideo) || (raw.media?.lat != null && raw.media?.lng != null);
  if (hasAnyMedia) {
    candidate.media = {
      images: images.length > 0 ? images : ['/images/default.jpg'], // Media schema requires at least one image
      tour360: mediaTour,
      video: mediaVideo,
      map: raw.media?.lat != null && raw.media?.lng != null ? { lat: raw.media.lat, lng: raw.media.lng } : undefined,
    };
  }
  if (badges) candidate.badges = badges;
  if (serviceLevel) candidate.serviceLevel = serviceLevel;
  if (nearestTransit) candidate.nearestTransit = nearestTransit;

  // Validate final shape
  return BuildingSchema.parse(candidate);
}

// =====================================================
// TRANSFORMATION STUBS - mapping.v2.json implementation
// =====================================================

/**
 * Normaliza orientación a dominio estricto
 * Dominio: {N, NE, E, SE, S, SO, O, NO}
 */
export function normalizeOrientation(rawOrientation: string | undefined): 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SO' | 'O' | 'NO' | undefined {
  if (!rawOrientation) return undefined;
  
  const normalized = rawOrientation.trim().toUpperCase();
  const validOrientations: readonly ('N' | 'NE' | 'E' | 'SE' | 'S' | 'SO' | 'O' | 'NO')[] = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'] as const;
  
  return validOrientations.includes(normalized as 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SO' | 'O' | 'NO') 
    ? normalized as 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SO' | 'O' | 'NO' 
    : undefined;
}

/**
 * Determina si una unidad está disponible para publicación
 * Formula: Estado ∈ {'RE - Acondicionamiento', 'Lista para arrendar'} AND Arriendo Total > 1
 */
export function isAvailableForPublishing(estado: string, arriendoTotal: number): boolean {
  const estadosValidos = ['RE - Acondicionamiento', 'Lista para arrendar'];
  return estadosValidos.includes(estado) && arriendoTotal > 1;
}

/**
 * Valida cuotas de garantía en rango 1..12
 */
export function validateGuaranteeInstallments(installments: number | undefined): number | undefined {
  if (typeof installments !== 'number') return undefined;
  return installments >= 1 && installments <= 12 ? installments : undefined;
}

/**
 * Valida meses de garantía en {0,1,2}
 */
export function validateGuaranteeMonths(months: number | undefined): number | undefined {
  if (typeof months !== 'number') return undefined;
  return [0, 1, 2].includes(months) ? months : undefined;
}

/**
 * Calcula recargo por sin garantía (6%)
 * Se aplica sobre rent + extras (parking/bodega) si suman al arriendo
 */
export function calculateNoGuaranteeSurcharge(
  rentAmount: number, 
  parkingAmount: number = 0, 
  storageAmount: number = 0
): number {
  const totalAmount = rentAmount + parkingAmount + storageAmount;
  return totalAmount * 0.06; // 6%
}

// =====================================================
// NEW TRANSFORMATION FUNCTIONS - mapping.v2.json implementation
// =====================================================

/**
 * Normaliza comuna eliminando códigos y duplicados
 * Regex: /\b\d{3,}\b/ para quitar enteros
 */
export function normalizeComuna(rawComuna: string | undefined): string | undefined {
  if (!rawComuna) return undefined;
  
  let normalized = rawComuna.trim();
  
  // Eliminar códigos de 3+ dígitos
  normalized = normalized.replace(/\b\d{3,}\b/g, '');
  
  // Colapsar dobles espacios
  normalized = normalized.replace(/\s+/g, ' ');
  
  // Separar por guiones y tomar tópico más largo
  if (normalized.includes(' - ')) {
    const parts = normalized.split(' - ');
    normalized = parts.reduce((longest, part) => 
      part.trim().length > longest.trim().length ? part.trim() : longest.trim()
    );
  }
  
  // Title Case
  normalized = normalized.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
  
  return normalized.trim() || undefined;
}

/**
 * Normaliza tipología a formato canónico
 * Canónico: Studio, 1D1B, 2D1B, 2D2B, 3D2B
 */
export function normalizeTypology(rawTypology: string | undefined): string | undefined {
  if (!rawTypology) return undefined;
  
  const normalized = rawTypology
    .replace(/[/\s]/g, '') // Eliminar separadores
    .toUpperCase();
  
  // Mapeo de casos especiales
  const specialCases: Record<string, string> = {
    'STUDIO': 'Studio',
    'MONOAMBIENTE': 'Studio',
    '1D1B': '1D1B',
    '2D1B': '2D1B',
    '2D2B': '2D2B',
    '3D2B': '3D2B'
  };
  
  return specialCases[normalized] || normalized;
}

/**
 * Corrige áreas de cm² a m²
 * Dividir por 100 cuando > 1000
 */
export function correctArea(rawArea: number | undefined): number | undefined {
  if (typeof rawArea !== 'number') return undefined;
  
  // Si el valor es muy grande, probablemente está en cm²
  if (rawArea > 1000) {
    return rawArea / 100;
  }
  
  return rawArea;
}

/**
 * Parsea identificadores separados por pipe
 * Formato: "31|32" o "x" para opcional
 */
export function parse_ids_or_pipe(rawValue: string | undefined): { ids: string | null; has_optional: boolean } {
  if (!rawValue) return { ids: null, has_optional: false };
  
  if (rawValue === 'x') {
    return { ids: null, has_optional: true };
  }
  
  // Validar formato: números separados por pipe
  if (!/^(\d+\|)*\d+$/.test(rawValue)) {
    return { ids: null, has_optional: false };
  }
  
  return { ids: rawValue, has_optional: false };
}

/**
 * Determina si un valor es opcional (x)
 */
export function isOptionalX(rawValue: string | undefined): boolean {
  return rawValue === 'x';
}

/**
 * Determina si tiene valor y no es opcional
 */
export function notEmptyAndNotX(rawValue: string | undefined): boolean {
  return Boolean(rawValue && rawValue !== 'x');
}

/**
 * Determina modo de garantía
 * MF fijo excepto OP en lista (VISD,SNMD,LIAD,MRSD); Retail variable
 */
export function determineGCMode(rawMode: string | undefined, buildingId: string): 'MF' | 'variable' {
  const opExcepciones = ['VISD', 'SNMD', 'LIAD', 'MRSD'];
  
  // Si es OP excepción, retornar variable
  if (opExcepciones.includes(buildingId)) {
    return 'variable';
  }
  
  // Si es Retail, siempre variable
  if (rawMode?.toLowerCase() === 'retail') {
    return 'variable';
  }
  
  // Por defecto MF fijo
  return 'MF';
}

/**
 * Valida link de listing con número de unidad
 * Si no contiene número de unidad → marcar para revisión
 */
export function validateLinkListing(link: string | undefined): string | null {
  if (!link) return null;
  
  // Validar que sea URL válida
  if (!/^https?:\/\//.test(link)) {
    return null;
  }
  
  // Validar que contenga número de unidad
  if (!/\d/.test(link)) {
    // Marcar para revisión (retornar null por ahora)
    return null;
  }
  
  return link;
}

/**
 * Convierte CLP a entero
 */
export function clpToInt(value: string | number | undefined): number {
  if (typeof value === 'number') return Math.round(value);
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : Math.round(parsed);
  }
  return 0;
}

/**
 * Convierte CLP a entero o null
 */
export function clpToIntNull(value: string | number | undefined): number | null {
  if (typeof value === 'number') return Math.round(value);
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : Math.round(parsed);
  }
  return null;
}

/**
 * Convierte a entero o null
 */
export function toIntNull(value: string | number | undefined): number | null {
  if (typeof value === 'number') return Math.round(value);
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

/**
 * Convierte a float o null
 */
export function toFloatNull(value: string | number | undefined): number | null {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

/**
 * Convierte porcentaje a entero 0-100
 */
export function percentToInt0100(value: string | number | undefined): number {
  if (typeof value === 'number') return Math.round(value);
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : Math.round(parsed);
  }
  return 0;
}

/**
 * Convierte a booleano genérico
 */
export function toBoolGeneric(value: string | boolean | undefined): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    return ['true', '1', 'yes', 'si', 'sí'].includes(lower);
  }
  return false;
}

/**
 * Valida rango o retorna null
 */
export function rangeOrNull(value: number | undefined, min: number, max: number): number | null {
  if (typeof value !== 'number') return null;
  return value >= min && value <= max ? value : null;
}

/**
 * Valida URL o retorna null
 */
export function validUrlOrNull(value: string | undefined): string | null {
  if (!value) return null;
  try {
    new URL(value);
    return value;
  } catch {
    return null;
  }
}

/**
 * Suma si ambos valores existen
 */
export function sumIfBoth(value1: number | undefined, value2: number | undefined): number | undefined {
  if (typeof value1 === 'number' && typeof value2 === 'number') {
    return value1 + value2;
  }
  return typeof value1 === 'number' ? value1 : typeof value2 === 'number' ? value2 : undefined;
}

/**
 * Calcula renta mínima requerida sumable
 */
export function rentMinRequiredSumable(arriendoTotal: number, rentasNecesarias: number): number {
  return arriendoTotal * rentasNecesarias;
}

/**
 * Mapea índice de contrato UF/IPC
 */
export function mapContractIndexUFIPC(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const lower = value.toLowerCase().trim();
  if (lower.includes('uf')) return 'UF';
  if (lower.includes('ipc')) return 'IPC';
  return undefined;
}

/**
 * Normaliza tipología interna
 */
export function normalizeTypologyInternal(rawTypology: string | undefined): string | undefined {
  return normalizeTypology(rawTypology);
}

/**
 * Mapea tipología pública
 */
export function mapTypologyPublic(rawTypology: string | undefined): string | undefined {
  const internal = normalizeTypology(rawTypology);
  if (!internal) return undefined;
  
  const publicMap: Record<string, string> = {
    'Studio': 'estudio',
    '1D1B': '1d',
    '2D1B': '2d',
    '2D2B': '2d',
    '3D2B': '3d'
  };
  
  return publicMap[internal] || internal.toLowerCase();
}

/**
 * Normaliza comuna extendida
 */
export function normalizeCommuneExtended(rawComuna: string | undefined): string | undefined {
  return normalizeComuna(rawComuna);
}

/**
 * Enumera MF o Retail
 */
export function enumMFOrRetail(value: string | undefined): 'MF' | 'Retail' | undefined {
  if (!value) return undefined;
  const lower = value.toLowerCase().trim();
  if (lower === 'mf') return 'MF';
  if (lower === 'retail') return 'Retail';
  return undefined;
}

/**
 * Title case y trim
 */
export function titlecaseTrim(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.trim().replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Hash SHA1 join
 */
export function hashSha1Join(values: (string | undefined)[], separator: string = '|'): string {
  const filtered = values.filter((v): v is string => Boolean(v));
  const joined = filtered.join(separator);
  
  // Simple hash implementation (in production, use crypto)
  let hash = 0;
  for (let i = 0; i < joined.length; i++) {
    const char = joined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Upper trim
 */
export function upperTrim(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.trim().toUpperCase();
}

/**
 * Strict enum validation
 */
export function strictEnum(value: string | undefined, allowed: string[]): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toUpperCase();
  return allowed.includes(normalized) ? normalized : undefined;
}


