import type { Building, Unit, PromotionBadge } from "@schemas/models";

export type PriceRange = { min: number; max: number };
export type AreaRange = { min: number; max: number };

export type TypologyAggregate = {
  code: string;
  bedrooms?: number;
  bathrooms?: number;
  unidades: number;
  priceRange?: PriceRange;
  areaRange?: AreaRange;
  hasPromo: boolean;
};

export type BuildingWithAggregates = Omit<Building, "typologySummary" | "hasAvailability" | "precioRango"> & {
  hasAvailability: boolean;
  precioDesde?: number;
  precioHasta?: number; // Add v2 field
  precioRango?: PriceRange;
  typologySummary: TypologyAggregate[];
  featured?: boolean; // Add v2 field
};

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function computeUnitTotalArea(unit: Unit): number {
  const hasInterior = isPositiveNumber(unit.area_interior_m2);
  const hasExterior = isPositiveNumber(unit.area_exterior_m2);
  if (hasInterior || hasExterior) {
    const interior = hasInterior ? (unit.area_interior_m2 ?? 0) : 0;
    const exterior = hasExterior ? (unit.area_exterior_m2 ?? 0) : 0;
    const sum = interior + exterior;
    return isPositiveNumber(sum) ? sum : (unit.m2 ?? 0);
  }
  return unit.m2 ?? 0;
}

function hasAnyPromotion(badges?: PromotionBadge[] | undefined): boolean {
  return Array.isArray(badges) && badges.length > 0;
}

export function deriveBuildingAggregates(input: Building): BuildingWithAggregates {
  // Use v2 functions for publicable units (disponible = true AND price > 1)
  const publicableUnits = (input.units ?? []).filter((u) => u.disponible && u.price > 1);

  const hasAvailability = publicableUnits.length > 0;

  // Use v2 price calculation functions
  const precioDesde = calculatePriceFrom(input.units ?? []);
  const precioHasta = calculatePriceTo(input.units ?? []);
  const precioRango = precioDesde && precioHasta ? { min: precioDesde, max: precioHasta } : undefined;

  // Group by typology code
  const typologyMap = new Map<string, Unit[]>();
  for (const unit of publicableUnits) {
    const key = unit.tipologia.trim();
    if (!typologyMap.has(key)) typologyMap.set(key, []);
    typologyMap.get(key)!.push(unit);
  }

  const buildingHasPromo = hasAnyPromotion(input.badges);

  const typologySummary: TypologyAggregate[] = Array.from(typologyMap.entries()).map(([code, units]) => {
    // Count
    const unidades = units.length;

    // Price range in typology
    const tPrices = units.map((u) => u.price).filter(isPositiveNumber);
    const priceRange = tPrices.length > 0 ? { min: Math.min(...tPrices), max: Math.max(...tPrices) } : undefined;

    // Area range (using interior+exterior if present, else m2)
    const tAreas = units.map((u) => computeUnitTotalArea(u)).filter(isPositiveNumber);
    const areaRange = tAreas.length > 0 ? { min: Math.min(...tAreas), max: Math.max(...tAreas) } : undefined;

    // Bedrooms and bathrooms: if uniform across units, keep the value; else undefined
    const bedroomValues = units.map((u) => u.bedrooms).filter((v): v is number => typeof v === "number");
    const bathroomValues = units.map((u) => u.bathrooms).filter((v): v is number => typeof v === "number");

    const bedrooms = bedroomValues.length > 0 && bedroomValues.every((v) => v === bedroomValues[0]) ? bedroomValues[0] : undefined;
    const bathrooms = bathroomValues.length > 0 && bathroomValues.every((v) => v === bathroomValues[0]) ? bathroomValues[0] : undefined;

    // Promotions: any unit in typology or building-level
    const hasUnitPromo = units.some((u) => hasAnyPromotion(u.promotions));
    const hasPromo = buildingHasPromo || hasUnitPromo;

    return {
      code,
      bedrooms,
      bathrooms,
      unidades,
      priceRange,
      areaRange,
      hasPromo,
    } satisfies TypologyAggregate;
  });

  // Calculate featured flag based on v2 rules
  const featured = calculateFeaturedFlagForBuilding(input, precioDesde);

  const result: BuildingWithAggregates = {
    ...input,
    hasAvailability,
    precioDesde,
    precioRango,
    typologySummary,
    // Add v2 fields
    precioHasta,
    featured,
  };

  return result;
}

/**
 * Calcula flag de destacado para un edificio
 * Formula: Tremenda promo OR % Descuento ≥ 50 OR Sin Garantia OR precioDesde en percentil 25
 */
function calculateFeaturedFlagForBuilding(building: Building, precioDesde?: number): boolean {
  // Check for tremenda promo in badges
  const hasTremendaPromo = building.badges?.some(badge => 
    badge.label.toLowerCase().includes('tremenda promo') || 
    badge.label.toLowerCase().includes('tremenda')
  ) ?? false;

  // Check for discount >= 50% in badges
  const hasHighDiscount = building.badges?.some(badge => {
    const discountMatch = badge.label.match(/(\d+)%/);
    return discountMatch && parseInt(discountMatch[1]) >= 50;
  }) ?? false;

  // Check for sin garantía in badges
  const hasSinGarantia = building.badges?.some(badge => 
    badge.label.toLowerCase().includes('sin garantía') || 
    badge.label.toLowerCase().includes('sin garantia')
  ) ?? false;

  // For price percentile, we would need to compare with other buildings in the same comuna/typology
  // This is a simplified implementation - in production, this would require database aggregation
  const isLowPrice = precioDesde ? precioDesde < 400000 : false; // Simplified threshold

  return hasTremendaPromo || hasHighDiscount || hasSinGarantia || isLowPrice;
}

// =====================================================
// DERIVED VARIABLES - mapping.v2.json implementation
// =====================================================

/**
 * Calcula precio mínimo de unidades publicables
 * Formula: MIN(price) WHERE disponible = true AND rent_amount > 1
 */
export function calculatePriceFrom(units: Unit[]): number | undefined {
  const publicableUnits = units.filter(u => u.disponible && u.price > 1);
  const prices = publicableUnits.map(u => u.price).filter(p => p > 0);
  return prices.length > 0 ? Math.min(...prices) : undefined;
}

/**
 * Calcula precio máximo de unidades publicables
 * Formula: MAX(price) WHERE disponible = true AND rent_amount > 1
 */
export function calculatePriceTo(units: Unit[]): number | undefined {
  const publicableUnits = units.filter(u => u.disponible && u.price > 1);
  const prices = publicableUnits.map(u => u.price).filter(p => p > 0);
  return prices.length > 0 ? Math.max(...prices) : undefined;
}

/**
 * Calcula renta mínima requerida
 * Formula: arriendo_total * rentas_necesarias
 */
export function calculateRentaMinima(arriendoTotal: number, rentasNecesarias: number): number {
  return arriendoTotal * rentasNecesarias;
}

/**
 * Calcula flag de destacado
 * Formula: Tremenda promo OR % Descuento ≥ 50 OR Sin Garantia OR precioDesde en percentil 25
 */
export function calculateFeaturedFlag(
  promoData: { 
    tremendaPromo?: boolean; 
    descuentoPercent?: number; 
    sinGarantia?: boolean; 
  },
  pricePercentile: number
): boolean {
  return (
    promoData.tremendaPromo === true ||
    (promoData.descuentoPercent && promoData.descuentoPercent >= 50) ||
    promoData.sinGarantia === true ||
    pricePercentile <= 25
  );
}

/**
 * Determina si el edificio tiene unidades publicables
 * Formula: EXISTS(units WHERE disponible = true AND rent_amount > 1)
 */
export function hasAvailability(units: Unit[]): boolean {
  return units.some(u => u.disponible && u.price > 1);
}

// =====================================================
// NEW AGGREGATION FUNCTIONS - mapping.v2.json implementation
// =====================================================

/**
 * Calcula agregaciones por edificio
 * Agrupa por Condominio y aplica filtros de disponibilidad
 */
export function calculateBuildingAggregations(buildings: Building[]): Map<string, {
  priceFrom: number | undefined;
  priceTo: number | undefined;
  hasAvailability: boolean;
}> {
  const aggregations = new Map();
  
  for (const building of buildings) {
    const publicableUnits = building.units.filter(u => u.disponible && u.price > 1);
    
    aggregations.set(building.id, {
      priceFrom: publicableUnits.length > 0 ? Math.min(...publicableUnits.map(u => u.price)) : undefined,
      priceTo: publicableUnits.length > 0 ? Math.max(...publicableUnits.map(u => u.price)) : undefined,
      hasAvailability: publicableUnits.length > 0
    });
  }
  
  return aggregations;
}

/**
 * Calcula percentil de precio para determinar destacado
 * Compara precioDesde con otros edificios de la misma comuna/tipología
 */
export function calculatePricePercentile(
  targetPrice: number,
  allPrices: number[],
  percentile: number = 25
): number {
  if (allPrices.length === 0) return 0;
  
  const sorted = [...allPrices].sort((a, b) => a - b);
  const index = Math.floor((percentile / 100) * sorted.length);
  
  return sorted[index] || 0;
}

/**
 * Calcula flag de destacado con percentil de precio
 * Formula: Tremenda promo OR % Descuento ≥ 50 OR Sin Garantia OR precioDesde en percentil 25
 */
export function calculateFeaturedFlagWithPercentile(
  promoData: { 
    tremendaPromo?: boolean; 
    descuentoPercent?: number; 
    sinGarantia?: boolean; 
  },
  pricePercentile: number
): boolean {
  return (
    promoData.tremendaPromo === true ||
    (promoData.descuentoPercent && promoData.descuentoPercent >= 50) ||
    promoData.sinGarantia === true ||
    pricePercentile <= 25
  );
}

/**
 * Calcula renta mínima requerida sumable
 * Formula: arriendo_total * rentas_necesarias
 */
export function calculateRentaMinimaSumable(arriendoTotal: number, rentasNecesarias: number): number {
  return arriendoTotal * rentasNecesarias;
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

/**
 * Valida restricciones de mascotas
 * Máximo 20kg, razas peligrosas restringidas
 */
export function validatePetRestrictions(
  petWeight?: number,
  petBreed?: string
): { allowed: boolean; reason?: string } {
  if (petWeight && petWeight > 20) {
    return { allowed: false, reason: 'Peso máximo 20kg' };
  }
  
  if (petBreed) {
    const dangerousBreeds = ['pitbull', 'rottweiler', 'doberman', 'bulldog'];
    if (dangerousBreeds.includes(petBreed.toLowerCase())) {
      return { allowed: false, reason: 'Raza restringida' };
    }
  }
  
  return { allowed: true };
}


