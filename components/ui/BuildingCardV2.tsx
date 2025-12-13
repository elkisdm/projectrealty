"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PromotionBadge } from "@components/ui/PromotionBadge";
import { formatPrice } from "@lib/utils";
import { track } from "@lib/analytics";
import type { Building, Unit, LegacyBuilding } from "@types";
import type { BuildingSummary } from "../../hooks/useFetchBuildings";
// import type { PromotionBadge as PromotionBadgeType } from "@schemas/models";
import { PromotionType } from "@schemas/models";

type BuildingCardV2Props = {
  building: Building | BuildingSummary | LegacyBuilding;
  priority?: boolean;
  showBadge?: boolean;
  className?: string;
};

const DEFAULT_BLUR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTYnIGhlaWdodD0nMTAnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHJlY3Qgd2lkdGg9JzE2JyBoZWlnaHQ9JzEwJyBmaWxsPSIjMjIyMjIyIi8+PC9zdmc+";

// Helper functions to work with Building, BuildingSummary, and LegacyBuilding types
function getCoverImage(building: Building | BuildingSummary | LegacyBuilding): string {
  if ('cover' in building) return building.cover;
  if ('coverImage' in building && building.coverImage) return building.coverImage;
  if ('gallery' in building && building.gallery.length > 0) return building.gallery[0];
  return '';
}

function getUnitsInfo(building: Building | BuildingSummary | LegacyBuilding) {
  if ('units' in building) {
    const available = building.units.filter((unit: Unit) => unit.disponible);
    return { available: available.length, total: building.units.length };
  }
  // For BuildingSummary, use hasAvailability flag
  if ('hasAvailability' in building) {
    return { available: building.hasAvailability ? 1 : 0, total: 1 };
  }
  return { available: 0, total: 0 };
}

function getPromoInfo(building: Building | BuildingSummary | LegacyBuilding) {
  if ('promo' in building && building.promo) {
    return {
      label: building.promo.label,
      tag: building.promo.tag || "Promoción"
    };
  }
  if ('badges' in building && building.badges && building.badges.length > 0) {
    const firstBadge = building.badges[0];
    return {
      label: firstBadge.label,
      tag: firstBadge.tag || "Promoción"
    };
  }
  return null;
}

function getPrice(building: Building | BuildingSummary | LegacyBuilding): number {
  if ('precioDesde' in building) return building.precioDesde;
  if ('units' in building && building.units.length > 0) {
    const availableUnits = building.units.filter((unit: Unit) => unit.disponible);
    if (availableUnits.length > 0) {
      return Math.min(...availableUnits.map((unit: Unit) => unit.price));
    }
  }
  return 0;
}

// Helper function to get the primary badge with priority
// function getPrimaryBadge(badges?: PromotionBadgeType[]): PromotionBadgeType | null {
//   if (!badges || badges.length === 0) return null;
//   
//   // Priority: FREE_COMMISSION first, then DISCOUNT_PERCENT, then others
//   const freeCommission = badges.find(b => b.type === PromotionType.FREE_COMMISSION);
//   if (freeCommission) return freeCommission;
//   
//   const discount = badges.find(b => b.type === PromotionType.DISCOUNT_PERCENT);
//   if (discount) return discount;
//   
//   // Return first available badge
//   return badges[0];
// }

// Helper function to calculate building stats
function calculateBuildingStats(building: Building) {
  const availableUnits = building.units.filter(unit => unit.disponible);
  const totalUnits = building.units.length;

  // Calculate price range
  const prices = availableUnits.map(unit => unit.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Calculate m2 range
  const m2s = availableUnits.map(unit => unit.m2);
  const minM2 = Math.min(...m2s);
  const maxM2 = Math.max(...m2s);

  // Group by tipologia
  const tipologiaGroups = availableUnits.reduce((acc, unit) => {
    if (!acc[unit.tipologia]) {
      acc[unit.tipologia] = [];
    }
    acc[unit.tipologia].push(unit);
    return acc;
  }, {} as Record<string, typeof availableUnits>);

  const tipologiaSummary = Object.entries(tipologiaGroups).map(([tipologia, units]) => ({
    key: tipologia,
    label: tipologia,
    count: units.length,
    minPrice: Math.min(...units.map(u => u.price)),
    minM2: Math.min(...units.map(u => u.m2)),
  }));

  return {
    hasAvailability: availableUnits.length > 0,
    availableCount: availableUnits.length,
    totalCount: totalUnits,
    precioDesde: minPrice,
    precioHasta: maxPrice,
    m2Desde: minM2,
    m2Hasta: maxM2,
    tipologiaSummary,
  };
}

// Helper function to format typology display
function formatTypologyChip(summary: { key: string; label: string; count: number; minPrice?: number; minM2?: number }): string {
  const displayLabel = summary.label;
  const count = summary.count;

  if (count === 1) {
    return `${displayLabel} — 1 disp`;
  }
  return `${displayLabel} — +${count} disp`;
}

export function BuildingCardV2({
  building,
  priority = false,
  showBadge = true,
  className = ""
}: BuildingCardV2Props) {
  const router = useRouter();
  const cover = getCoverImage(building);
  // Usar slug si está disponible, sino usar id
  const href = 'slug' in building && building.slug
    ? `/property/${building.slug}`
    : `/property/${building.id}`;
  const unitsInfo = getUnitsInfo(building);
  const price = getPrice(building);

  const handleClick = () => {
    track("property_view", {
      property_id: building.id,
      property_name: building.name,
    });
  };

  const promoInfo = getPromoInfo(building);
  const primaryBadge = promoInfo ? {
    type: PromotionType.FREE_COMMISSION,
    label: promoInfo.label,
    tag: promoInfo.tag
  } : null;

  const hasAvailability = unitsInfo.available > 0;
  let typologyChips: { key: string; label: string; count: number }[] = [];
  if ('units' in building && hasAvailability) {
    typologyChips = calculateBuildingStats(building as Building).tipologiaSummary
      .sort((a, b) => a.key.localeCompare(b.key));
  }

  // Enhanced aria-label with availability info
  const ariaLabel = hasAvailability
    ? `Ver propiedad ${building.name} en ${building.comuna}, ${typologyChips.length > 0 ? `${typologyChips.length} tipologías disponibles` : 'unidades disponibles'}`
    : `Ver propiedad ${building.name} en ${building.comuna}, sin disponibilidad`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Link
        href={href}
        onClick={handleClick}
        aria-label={ariaLabel}
        className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] rounded-2xl"
      >
        <article className="rounded-2xl bg-[var(--soft)]/90 ring-1 ring-white/10 overflow-hidden transition-all group-hover:ring-[var(--ring)]/60 group-hover:shadow-lg">
          <div className="relative aspect-[16/10]">
            <Image
              src={cover}
              alt={`Portada ${building.name}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              placeholder="blur"
              blurDataURL={DEFAULT_BLUR}
              priority={priority}
            />
            {showBadge && primaryBadge && (
              <div className="absolute top-3 left-3">
                <PromotionBadge
                  label={primaryBadge.label}
                  tag={primaryBadge.tag}
                />
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold leading-tight truncate" title={building.name}>
                  {building.name}
                </h3>
                <p className="text-[13px] text-[var(--subtext)] truncate">{building.comuna}</p>
              </div>
              <div className="text-right shrink-0">
                {hasAvailability ? (
                  <>
                    <div className="font-bold">{formatPrice(price)}</div>
                    <div className="text-[12px] text-[var(--subtext)]">Desde</div>
                  </>
                ) : (
                  <>
                    <div className="text-[13px] text-[var(--subtext)]">Sin disponibilidad</div>
                    <div className="sr-only">No hay unidades disponibles</div>
                  </>
                )}
              </div>
            </div>

            {/* Typology chips */}
            {hasAvailability && typologyChips.length > 0 && (
              <div className="flex flex-wrap gap-1.5 min-h-[24px]">
                {typologyChips.slice(0, 3).map((chip) => {
                  // Determinar href según el tipo de building
                  const buildingHref = 'slug' in building
                    ? `/property/${building.slug}?tipologia=${encodeURIComponent(chip.key)}`
                    : `/property/${building.id}?tipologia=${encodeURIComponent(chip.key)}`;

                  return (
                    <button
                      key={chip.key}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        track("typology_click", {
                          property_id: building.id,
                          property_name: building.name,
                          tipologia: chip.key,
                        });
                        router.push(buildingHref);
                      }}
                      className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-[var(--soft)] text-[var(--text)] ring-1 ring-white/10 hover:bg-[var(--primary)]/20 hover:ring-[var(--primary)]/50 transition-colors cursor-pointer"
                      title={`Ver unidades ${chip.label}`}
                    >
                      {formatTypologyChip(chip)}
                    </button>
                  );
                })}
                {typologyChips.length > 3 && (() => {
                  const buildingHref = 'slug' in building
                    ? `/property/${building.slug}?ver=unidades`
                    : `/property/${building.id}?ver=unidades`;

                  return (
                    <button
                      key="more-units"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        track("view_all_units", {
                          property_id: building.id,
                          property_name: building.name,
                        });
                        router.push(buildingHref);
                      }}
                      className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-[var(--soft)] text-[var(--subtext)] ring-1 ring-white/10 hover:bg-[var(--primary)]/20 hover:ring-[var(--primary)]/50 transition-colors cursor-pointer"
                      title="Ver todas las unidades"
                    >
                      +{typologyChips.length - 3} más
                    </button>
                  );
                })()}
              </div>
            )}

            {/* Empty state for no availability with subtle visual indication */}
            {!hasAvailability && (
              <div className="flex items-center justify-center min-h-[24px] opacity-50">
                <span className="text-[11px] text-[var(--subtext)]">•</span>
              </div>
            )}
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
