/**
 * Internal types for UnitCard component
 * These types are used internally and don't affect the public API
 */

import type { Unit, Building } from '@types';

/** Available card variants */
export type UnitCardVariant = 'default' | 'compact' | 'v2';

/** Badge priority for overlay (only 1 badge shown) */
export type BadgePriority = 'promo' | 'exclusive' | 'pet_friendly' | 'available';

/** Chip types for bottom of card (max 2 chips) */
export type ChipType = 'pet' | 'parking' | 'storage' | 'terrace';

/** Chip priority order (higher index = higher priority) */
export const CHIP_PRIORITY: ChipType[] = ['terrace', 'storage', 'parking', 'pet'];

/** Tipologia color configuration */
export interface TipologiaColorConfig {
  bg: string;
  text: string;
  shadow: string;
}

/** Props for CardMedia component */
export interface CardMediaProps {
  imageUrl: string;
  alt: string;
  priority?: boolean;
  onImageError?: () => void;
  badge?: {
    text: string;
    type: BadgePriority;
  } | null;
  unitId: string;
  isFavorited?: boolean;
  onFavoriteToggle?: () => void;
  isPressing?: boolean;
}

/** Props for CardFavoriteButton component */
export interface CardFavoriteButtonProps {
  unitId: string;
  isFavorited?: boolean;
  onToggle?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/** Props for CardBadge component */
export interface CardBadgeProps {
  text: string;
  type?: BadgePriority;
  className?: string;
}

/** Props for CardPrice component */
export interface CardPriceProps {
  price: number;
  gastoComun?: number;
  totalMensual?: number;
  showTotal?: boolean;
  className?: string;
}

/** Props for CardSpecs component */
export interface CardSpecsProps {
  m2?: number;
  dormitorios: number;
  banos: number;
  terraza?: number;
  className?: string;
}

/** Props for CardAddress component */
export interface CardAddressProps {
  address: string;
  className?: string;
}

/** Props for CardChips component */
export interface CardChipsProps {
  chips: Array<{
    type: ChipType;
    label: string;
    included?: boolean;
  }>;
  maxChips?: number;
  className?: string;
}

/** Main UnitCard props (public API - unchanged) */
export interface UnitCardProps {
  unit: Unit;
  building?: Building;
  onClick?: () => void;
  variant?: UnitCardVariant;
  priority?: boolean;
  className?: string;
}

/** Computed unit data for rendering */
export interface ComputedUnitData {
  imageUrl: string;
  href: string;
  slug: string;
  statusText: string;
  buildingName: string;
  comuna: string;
  address: string;
  floorNumber: number | null;
  gastoComun: number;
  totalMensual: number;
  tipologiaColor: TipologiaColorConfig;
  badge: { text: string; type: BadgePriority } | null;
  chips: Array<{ type: ChipType; label: string; included: boolean }>;
  specs: {
    m2?: number;
    dormitorios: number;
    banos: number;
    terraza?: number;
  };
}
