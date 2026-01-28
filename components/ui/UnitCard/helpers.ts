/**
 * Helper functions for UnitCard component
 * Pure functions that can be unit tested independently
 */

import type { Unit, Building } from '@types';
import type { TipologiaColorConfig, BadgePriority, ChipType, ComputedUnitData } from './types';
import { 
  TIPOLOGIA_COLORS, 
  DEFAULT_TIPOLOGIA_COLOR, 
  DEFAULT_FALLBACK_IMAGE,
} from './constants';
import { normalizeComunaSlug } from '@lib/utils/slug';
import { formatPrice } from '@lib/utils';

/**
 * Get the best available image for a unit
 * Priority: tipologia > areas comunes > gallery > cover > unit images > fallback
 */
export function getUnitImage(unit: Unit, building?: Building): string {
  // Priority 1: Tipology images
  if (unit.imagesTipologia && Array.isArray(unit.imagesTipologia) && unit.imagesTipologia.length > 0) {
    return unit.imagesTipologia[0];
  }

  // Priority 2: Common areas images
  if (unit.imagesAreasComunes && Array.isArray(unit.imagesAreasComunes) && unit.imagesAreasComunes.length > 0) {
    return unit.imagesAreasComunes[0];
  }

  // Priority 3: Building gallery
  if (building?.gallery && building.gallery.length > 0) {
    return building.gallery[0];
  }

  // Priority 4: Building cover image
  if (building?.coverImage) {
    return building.coverImage;
  }

  // Priority 5: Unit images (interior)
  if (unit.images && Array.isArray(unit.images) && unit.images.length > 0) {
    return unit.images[0];
  }

  // Fallback
  return DEFAULT_FALLBACK_IMAGE;
}

/**
 * Get the unit slug for URL navigation
 */
export function getUnitSlug(unit: Unit, building?: Building): string {
  // Use unit slug if available
  if (unit.slug) {
    return unit.slug;
  }

  // Fallback: generate from building slug + unit id
  if (building?.slug) {
    return `${building.slug}-${unit.id.substring(0, 8)}`;
  }

  // Last fallback: use unit id
  return unit.id;
}

/**
 * Get unit status text based on availability
 */
export function getStatusText(unit: Unit): string {
  if (unit.status === 'available' || unit.disponible) {
    return 'Disponible';
  }
  if (unit.status === 'reserved') {
    return 'Reservado';
  }
  if (unit.status === 'rented') {
    return 'Arrendado';
  }
  return 'Disponible'; // Default
}

/**
 * Extract floor number from unit code
 * Examples: 2201 -> 22, 301 -> 3, 1205 -> 12
 */
export function extractFloorNumber(unitCode: string): number | null {
  if (!unitCode) return null;
  
  // Remove non-numeric characters
  const numericCode = unitCode.replace(/\D/g, '');
  if (!numericCode || numericCode.length < 2) return null;
  
  // 4+ digits: take first 2 as floor (2201 -> 22)
  if (numericCode.length >= 4) {
    const floor = parseInt(numericCode.substring(0, 2), 10);
    if (floor > 0 && floor <= 99) return floor;
  } 
  // 3 digits: take first 1 as floor (301 -> 3)
  else if (numericCode.length === 3) {
    const floor = parseInt(numericCode.substring(0, 1), 10);
    if (floor > 0 && floor <= 9) return floor;
  }
  
  return null;
}

/**
 * Get tipologia color configuration
 */
export function getTipologiaColor(tipologia: string): TipologiaColorConfig {
  const normalized = tipologia.toLowerCase().trim().replace(/\s+/g, '');
  return TIPOLOGIA_COLORS[normalized] || DEFAULT_TIPOLOGIA_COLOR;
}

/**
 * Generate the href for unit navigation
 * Uses SEO-friendly route if comuna is available
 */
export function generateUnitHref(unit: Unit, building?: Building): string {
  const slug = getUnitSlug(unit, building);
  const comuna = building?.comuna || '';
  
  return comuna 
    ? `/arriendo/departamento/${normalizeComunaSlug(comuna)}/${slug}`
    : `/property/${slug}`;
}

/**
 * Compute the primary badge to show (only 1 badge)
 * Priority: Promo > Exclusive > Pet Friendly > Available
 */
export function computePrimaryBadge(
  unit: Unit, 
  building?: Building
): { text: string; type: BadgePriority } | null {
  // Check for promotions on unit
  if (unit.promotions && unit.promotions.length > 0) {
    const promo = unit.promotions[0];
    return { text: promo.label, type: 'promo' };
  }

  // Check for building badges
  if (building?.badges && building.badges.length > 0) {
    const badge = building.badges[0];
    return { text: badge.label, type: 'promo' };
  }

  // Check for pet friendly
  if (unit.pet_friendly || unit.petFriendly) {
    return { text: 'Pet Friendly', type: 'pet_friendly' };
  }

  // Default: availability status
  const statusText = getStatusText(unit);
  return { text: statusText, type: 'available' };
}

/**
 * Compute chips for the card (max 2)
 * Priority: Included features > Pet > Optional features
 */
export function computeChips(
  unit: Unit,
  maxChips: number = 2
): Array<{ type: ChipType; label: string; included: boolean }> {
  const chips: Array<{ type: ChipType; label: string; included: boolean }> = [];

  // Pet friendly (if not already shown as badge)
  if (unit.pet_friendly || unit.petFriendly) {
    chips.push({ type: 'pet', label: 'Mascotas', included: true });
  }

  // Parking (included)
  if (unit.estacionamiento) {
    chips.push({ type: 'parking', label: 'Estacionamiento', included: true });
  }

  // Storage (included)
  if (unit.bodega) {
    chips.push({ type: 'storage', label: 'Bodega', included: true });
  }

  // Terrace
  if (unit.m2_terraza && unit.m2_terraza > 0) {
    chips.push({ type: 'terrace', label: `Terraza ${unit.m2_terraza}m²`, included: true });
  }

  // Return only max allowed chips
  return chips.slice(0, maxChips);
}

/**
 * Format specs string (m² · D · B)
 */
export function formatSpecs(
  m2?: number,
  dormitorios?: number,
  banos?: number,
  terraza?: number
): string {
  const parts: string[] = [];
  
  if (m2) {
    parts.push(`${m2} m²`);
  }
  
  if (dormitorios !== undefined) {
    parts.push(`${dormitorios}D`);
  }
  
  if (banos !== undefined) {
    parts.push(`${banos}B`);
  }
  
  if (terraza && terraza > 0) {
    parts.push(`+${terraza}m² terraza`);
  }
  
  return parts.join(' · ');
}

/**
 * Compute all derived data for a unit
 */
export function computeUnitData(unit: Unit, building?: Building): ComputedUnitData {
  const gastoComun = unit.gastoComun || unit.gc || 0;
  const dormitorios = unit.dormitorios ?? unit.bedrooms ?? 0;
  const banos = unit.banos ?? unit.bathrooms ?? 1;

  return {
    imageUrl: getUnitImage(unit, building),
    href: generateUnitHref(unit, building),
    slug: getUnitSlug(unit, building),
    statusText: getStatusText(unit),
    buildingName: building?.name || 'Edificio',
    comuna: building?.comuna || '',
    address: building?.address || '',
    floorNumber: extractFloorNumber(unit.codigoUnidad || ''),
    gastoComun,
    totalMensual: unit.total_mensual || (unit.price + gastoComun),
    tipologiaColor: getTipologiaColor(unit.tipologia),
    badge: computePrimaryBadge(unit, building),
    chips: computeChips(unit),
    specs: {
      m2: unit.m2,
      dormitorios,
      banos,
      terraza: unit.m2_terraza
    }
  };
}

// Re-export formatPrice for convenience
export { formatPrice };
