import { Heart, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Unit, Building } from '@types';
import { formatPrice } from '@lib/utils';

interface UnitCardProps {
  unit: Unit;
  building?: Building;
  onClick?: () => void;
  variant?: 'default' | 'compact';
  priority?: boolean;
  className?: string;
}

// Helper function to get unit image
function getUnitImage(unit: Unit, building?: Building): string {
  // Prioridad 1: Imágenes de la unidad (interior)
  if (unit.images && Array.isArray(unit.images) && unit.images.length > 0) {
    return unit.images[0];
  }

  // Prioridad 2: Imágenes de tipología
  if (unit.imagesTipologia && Array.isArray(unit.imagesTipologia) && unit.imagesTipologia.length > 0) {
    return unit.imagesTipologia[0];
  }

  // Prioridad 3: Imágenes de áreas comunes
  if (unit.imagesAreasComunes && Array.isArray(unit.imagesAreasComunes) && unit.imagesAreasComunes.length > 0) {
    return unit.imagesAreasComunes[0];
  }

  // Prioridad 4: Galería del edificio
  if (building?.gallery && building.gallery.length > 0) {
    return building.gallery[0];
  }

  // Prioridad 5: CoverImage del edificio
  if (building?.coverImage) {
    return building.coverImage;
  }

  // Fallback a imagen por defecto
  return '/images/lascondes-cover.jpg';
}

// Helper function to get unit slug
function getUnitSlug(unit: Unit, building?: Building): string {
  // Usar el slug de la unidad si está disponible (es el correcto)
  if (unit.slug) {
    return unit.slug;
  }

  // Fallback: generar slug si no existe
  if (building?.slug) {
    return `${building.slug}-${unit.id.substring(0, 8)}`;
  }

  // Último fallback: usar id de la unidad
  return unit.id;
}

// Helper function to get unit status text
function getStatusText(unit: Unit): string {
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

// Default blur data URL for next/image
const DEFAULT_BLUR =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTYnIGhlaWdodD0nMTAnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHJlY3Qgd2lkdGg9JzE2JyBoZWlnaHQ9JzEwJyBmaWxsPSIjMjIyMjIyIi8+PC9zdmc+';

export function UnitCard({
  unit,
  building,
  onClick,
  variant = 'default',
  priority = false,
  className = '',
}: UnitCardProps) {
  const imageUrl = getUnitImage(unit, building);
  const slug = getUnitSlug(unit, building);
  const statusText = getStatusText(unit);
  const buildingName = building?.name || 'Edificio';
  const comuna = building?.comuna || '';
  const gastosComunes = unit.gastosComunes || 0;

  // Generate href for navigation
  const href = `/property/${slug}`;

  // Card content component (to avoid nesting Link inside Link)
  const cardContent = (
    <div
      className={`
        group relative 
        bg-card 
        border border-border 
        rounded-2xl 
        overflow-hidden 
        hover:shadow-lg 
        hover:scale-[1.02] 
        transition-all duration-300
        cursor-pointer 
        focus:outline-none 
        focus-visible:ring-2 
        focus-visible:ring-brand-violet 
        focus-visible:ring-offset-2
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={imageUrl}
          alt={`${buildingName} - ${unit.tipologia}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105 rounded-t-2xl"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
          placeholder="blur"
          blurDataURL={DEFAULT_BLUR}
        />

        {/* Glass Badge (Top Left) */}
        <div className="absolute top-3 left-3 glass px-3 py-1 rounded-full">
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            {statusText}
          </span>
        </div>

        {/* Favorite Button (Top Right) */}
        <button
          className="absolute top-3 right-3 p-2 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          aria-label="Agregar a favoritos"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Implement favorite functionality
          }}
        >
          <Heart className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Header with name and location */}
        <div className="mb-2">
          <h3 className="text-lg font-bold text-text leading-tight">
            {buildingName}
          </h3>
          <p className="text-sm text-subtext flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" aria-hidden="true" />
            {comuna} • {unit.tipologia}
          </p>
        </div>

        {/* Separator */}
        <div className="my-3 h-px w-full bg-border" />

        {/* Price Section */}
        <div className="flex justify-between items-end">
          <div>
            <p className="text-2xl font-bold text-text tracking-tight tabular-nums">
              {formatPrice(unit.price)}
              <span className="text-sm font-normal text-subtext"> /mes</span>
            </p>
            {gastosComunes > 0 && (
              <p className="text-xs text-text-muted mt-1">
                + {formatPrice(gastosComunes)} GC aprox.
              </p>
            )}
          </div>

          {/* Call to Action (Hover Desktop) */}
          <div className="opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hidden lg:block">
            <span className="text-[#8B6CFF] font-semibold text-sm">
              Ver unidad →
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // If onClick is provided, return without Link wrapper
  if (onClick) {
    return cardContent;
  }

  // Otherwise, wrap in Link for navigation
  return (
    <Link href={href} className="block">
      {cardContent}
    </Link>
  );
}
