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
  tipologia: z.string().min(1).regex(/^(Studio|1D1B|2D1B|2D2B|3D2B)$/, {
    message: "Tipología debe estar en formato canónico: Studio, 1D1B, 2D1B, 2D2B, 3D2B"
  }),
  m2: z.number().positive(),
  price: z.number().int().positive(),
  estacionamiento: z.boolean(),
  bodega: z.boolean(),
  disponible: z.boolean(),
  // Extended fields (all optional for backward compatibility)
  codigoInterno: z.string().min(1).optional(),
  bedrooms: z.number().int().positive().optional(),
  bathrooms: z.number().int().positive().optional(),
  area_interior_m2: z.number().positive().max(200, {
    message: "Área interior debe estar entre 20-200 m²"
  }).optional(),
  area_exterior_m2: z.number().nonnegative().max(50, {
    message: "Área exterior debe estar entre 0-50 m²"
  }).optional(),
  orientacion: z.enum(['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']).optional(),
  piso: z.number().int().nonnegative().optional(),
  amoblado: z.boolean().optional(),
  petFriendly: z.boolean().optional(),
  parkingOptions: z.array(z.string().min(1)).optional(),
  storageOptions: z.array(z.string().min(1)).optional(),
  status: z.enum(["available", "reserved", "rented"]).optional(),
  promotions: z.array(PromotionBadgeSchema).optional(),
  // New v2 fields
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
  gastosComunes: z.number().int().nonnegative().optional(),
});

export const BuildingSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  comuna: z.string().min(1).refine((val) => !/\d/.test(val), {
    message: "Comuna no debe contener dígitos"
  }),
  address: z.string().min(1),
  amenities: z.array(z.string().min(1)).min(1),
  gallery: z.array(z.string().min(1)).min(3),
  units: z.array(UnitSchema).min(1),
  // Extended fields (all optional for backward compatibility)
  coverImage: z.string().min(1).optional(),
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

export type Unit = z.infer<typeof UnitSchema>;
export type Building = z.infer<typeof BuildingSchema>;
export type BookingRequest = z.infer<typeof BookingRequestSchema>;
export type WaitlistRequest = z.infer<typeof WaitlistRequestSchema>;
export type PromotionBadge = z.infer<typeof PromotionBadgeSchema>;
export type TypologySummary = z.infer<typeof TypologySummarySchema>;
export type Media = z.infer<typeof MediaSchema>;
export type ParkingStorage = z.infer<typeof ParkingStorageSchema>;

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


