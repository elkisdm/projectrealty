"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PromotionBadge } from "@components/ui/PromotionBadge";
import { formatPrice } from "@lib/utils";
import { track } from "@lib/analytics";
import type { BuildingSummary } from "@hooks/useFetchBuildings";
import type { PromotionBadge as PromotionBadgeType } from "@schemas/models";
import { PromotionType } from "@schemas/models";

type CardProps = {
  building: BuildingSummary;
  priority?: boolean;
  showBadge?: boolean;
};

const DEFAULT_BLUR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTYnIGhlaWdodD0nMTAnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHJlY3Qgd2lkdGg9JzE2JyBoZWlnaHQ9JzEwJyBmaWxsPSIjMjIyMjIyIi8+PC9zdmc+";

// Helper function to get the primary badge with priority
function getPrimaryBadge(badges?: PromotionBadgeType[]): PromotionBadgeType | null {
  if (!badges || badges.length === 0) return null;

  // Priority: FREE_COMMISSION first, then DISCOUNT_PERCENT, then others
  const freeCommission = badges.find(b => b.type === PromotionType.FREE_COMMISSION);
  if (freeCommission) return freeCommission;

  const discount = badges.find(b => b.type === PromotionType.DISCOUNT_PERCENT);
  if (discount) return discount;

  // Return first available badge
  return badges[0];
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

export function BuildingCard({ building, priority = false, showBadge = true }: CardProps) {
  const router = useRouter();
  const cover = building.coverImage ?? building.gallery?.[1] ?? building.gallery?.[0] ?? "/images/nunoa-cover.jpg";
  const href = `/property/${building.slug}`;
  const handleClick = () => {
    track("property_view", {
      property_id: building.id,
      property_name: building.name,
    });
  };

  const primaryBadge = getPrimaryBadge(building.badges);
  const isProService = building.serviceLevel === 'pro';
  const hasAvailability = building.hasAvailability;
  const typologyChips = building.typologySummary || [];

  // Enhanced aria-label with availability info
  const ariaLabel = hasAvailability
    ? `Ver propiedad ${building.name} en ${building.comuna}, ${typologyChips.length > 0 ? `${typologyChips.length} tipologías disponibles` : 'unidades disponibles'}`
    : `Ver propiedad ${building.name} en ${building.comuna}, sin disponibilidad`;

  return (
    <Link
      href={href}
      onClick={handleClick}
      aria-label={ariaLabel}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] rounded-2xl"
    >
      <article className="rounded-2xl bg-[var(--soft)]/90 ring-1 ring-white/10 overflow-hidden transition-all group-hover:ring-[var(--ring)]/60">
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
          {showBadge && (primaryBadge || isProService) && (
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {primaryBadge && (
                <PromotionBadge
                  label={primaryBadge.label}
                  tag={primaryBadge.tag}
                />
              )}
              {isProService && !building.badges?.some(b => b.type === PromotionType.SERVICE_PRO) && (
                <PromotionBadge
                  label="Pro"
                  tag="Servicio"
                />
              )}
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
                  <div className="font-bold tabular-nums">{formatPrice(building.precioDesde)}</div>
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
              {typologyChips.slice(0, 3).map((chip) => (
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
                    router.push(`${href}?tipologia=${encodeURIComponent(chip.key)}`);
                  }}
                  className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-[var(--soft)] text-[var(--text)] ring-1 ring-white/10 hover:bg-[var(--primary)]/20 hover:ring-[var(--primary)]/50 transition-colors cursor-pointer"
                  title={`Ver unidades ${chip.label}`}
                >
                  {formatTypologyChip(chip)}
                </button>
              ))}
              {typologyChips.length > 3 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    track("view_all_units", {
                      property_id: building.id,
                      property_name: building.name,
                    });
                    router.push(`${href}?ver=unidades`);
                  }}
                  className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-[var(--soft)] text-[var(--subtext)] ring-1 ring-white/10 hover:bg-[var(--primary)]/20 hover:ring-[var(--primary)]/50 transition-colors cursor-pointer"
                  title="Ver todas las unidades"
                >
                  +{typologyChips.length - 3} más
                </button>
              )}
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
  );
}


