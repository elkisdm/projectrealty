// Re-export types from schemas for consistency
export type {
  Unit,
  Building,
  BookingRequest,
  WaitlistRequest,
  SearchFilters,
  PromotionBadge,
  TypologySummary,
  Media,
  ParkingStorage,
  UnitV2,
  BuildingV2,
  PromotionType,
  BuildingsResponse
} from '../schemas/models';

// Legacy types for backward compatibility
export type LegacyUnit = {
  id: string;
  tipologia: string;
  m2: number;
  price: number;
  estacionamiento: boolean;
  bodega: boolean;
  disponible: boolean;
};

export type LegacyBuilding = {
  id: string;
  slug: string;
  name: string;
  comuna: string;
  address: string;
  cover: string;
  hero?: string;
  promo?: { label: string; tag?: string };
  amenities: string[];
  units: LegacyUnit[];
  gallery: string[];
};
