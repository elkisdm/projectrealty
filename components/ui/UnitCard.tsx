import { Heart, MapPin, PawPrint } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { Unit, Building } from '@types';
import { formatPrice } from '@lib/utils';
import { useLongPress } from '@hooks/useLongPress';
import { ContextMenu, useContextMenuOptions } from './ContextMenu';

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
  // Prioridad 1: Imágenes de tipología
  if (unit.imagesTipologia && Array.isArray(unit.imagesTipologia) && unit.imagesTipologia.length > 0) {
    return unit.imagesTipologia[0];
  }

  // Prioridad 2: Imágenes de áreas comunes del edificio
  if (unit.imagesAreasComunes && Array.isArray(unit.imagesAreasComunes) && unit.imagesAreasComunes.length > 0) {
    return unit.imagesAreasComunes[0];
  }

  // Prioridad 3: Galería del edificio
  if (building?.gallery && building.gallery.length > 0) {
    return building.gallery[0];
  }

  // Prioridad 4: CoverImage del edificio
  if (building?.coverImage) {
    return building.coverImage;
  }

  // Prioridad 5: Imágenes de la unidad (interior) - solo si no hay imágenes del edificio
  if (unit.images && Array.isArray(unit.images) && unit.images.length > 0) {
    return unit.images[0];
  }

  // Fallback a imagen por defecto (verificar múltiples opciones)
  const fallbackImages = [
    '/images/nunoa-cover.jpg',
    '/images/lascondes-cover.jpg',
    '/images/mirador-cover.jpg',
  ];
  
  // Retornar el primer fallback disponible
  return fallbackImages[0];
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

// Helper function to extract floor number from unit code
// Examples: 2201 -> 22, 301 -> 3, 1205 -> 12
function extractFloorNumber(unitCode: string): number | null {
  if (!unitCode) return null;
  
  // Remove non-numeric characters
  const numericCode = unitCode.replace(/\D/g, '');
  if (!numericCode || numericCode.length < 2) return null;
  
  // Try to extract floor from first 2 digits (most common pattern: XXYY)
  // For codes like 2201, 301, 1205, etc.
  if (numericCode.length >= 4) {
    // 4+ digits: take first 2 as floor (2201 -> 22)
    const floor = parseInt(numericCode.substring(0, 2), 10);
    if (floor > 0 && floor <= 99) return floor;
  } else if (numericCode.length === 3) {
    // 3 digits: take first 1 as floor (301 -> 3)
    const floor = parseInt(numericCode.substring(0, 1), 10);
    if (floor > 0 && floor <= 9) return floor;
  }
  
  return null;
}

// Helper function to get tipologia color
// Returns color configuration for each tipologia type
function getTipologiaColor(tipologia: string): { bg: string; text: string; shadow: string } {
  const normalized = tipologia.toLowerCase().trim();
  
  // Color scheme for each tipologia
  const colorMap: Record<string, { bg: string; text: string; shadow: string }> = {
    'studio': {
      bg: 'bg-[#8B6CFF]', // Brand Violet
      text: 'text-white',
      shadow: 'shadow-[#8B6CFF]/25'
    },
    'estudio': {
      bg: 'bg-[#8B6CFF]', // Brand Violet
      text: 'text-white',
      shadow: 'shadow-[#8B6CFF]/25'
    },
    '1d1b': {
      bg: 'bg-[#6366F1]', // Indigo
      text: 'text-white',
      shadow: 'shadow-[#6366F1]/25'
    },
    '2d1b': {
      bg: 'bg-[#3B82F6]', // Blue
      text: 'text-white',
      shadow: 'shadow-[#3B82F6]/25'
    },
    '2d2b': {
      bg: 'bg-[#0EA5E9]', // Sky Blue
      text: 'text-white',
      shadow: 'shadow-[#0EA5E9]/25'
    },
    '3d2b': {
      bg: 'bg-[#06B6D4]', // Cyan
      text: 'text-white',
      shadow: 'shadow-[#06B6D4]/25'
    }
  };
  
  // Normalize tipologia for lookup (remove spaces, convert to lowercase)
  const key = normalized.replace(/\s+/g, '');
  
  return colorMap[key] || {
    bg: 'bg-[#64748B]', // Default gray
    text: 'text-white',
    shadow: 'shadow-[#64748B]/25'
  };
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
  const initialImageUrl = getUnitImage(unit, building);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [hasError, setHasError] = useState(false);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | undefined>();
  
  const slug = getUnitSlug(unit, building);
  const statusText = getStatusText(unit);
  const buildingName = building?.name || 'Edificio';
  const comuna = building?.comuna || '';
  const gastosComunes = unit.gastoComun || 0;
  const precioTotal = unit.total_mensual || (unit.price + gastosComunes);
  const floorNumber = extractFloorNumber(unit.codigoUnidad || '');

  // Generate href for navigation
  const href = `/property/${slug}`;
  
  // Fallback image seguro
  const fallbackImage = '/images/nunoa-cover.jpg';
  
  // Imagen final a mostrar
  const finalImageUrl = hasError ? fallbackImage : imageUrl;

  // Long press handler
  const longPressHandlers = useLongPress({
    onLongPress: (event) => {
      const touchEvent = event as TouchEvent;
      const clientX = touchEvent.touches?.[0]?.clientX || (event as MouseEvent).clientX;
      const clientY = touchEvent.touches?.[0]?.clientY || (event as MouseEvent).clientY;
      setContextMenuPosition({ x: clientX, y: clientY });
      setContextMenuOpen(true);
    },
    delay: 500,
    threshold: 10,
    enableHapticFeedback: true,
  });

  // Context menu options
  const contextMenuOptions = useContextMenuOptions(
    () => {
      // Compartir
      if (typeof navigator !== 'undefined' && navigator.share) {
        navigator.share({
          title: `${buildingName} - ${unit.tipologia}`,
          text: `Mira esta propiedad en ${comuna}`,
          url: typeof window !== 'undefined' ? `${window.location.origin}${href}` : href,
        }).catch(() => {
          // Fallback: copiar al portapapeles
          if (typeof window !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(`${window.location.origin}${href}`);
          }
        });
      } else if (typeof window !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(`${window.location.origin}${href}`);
      }
    },
    () => {
      // Agregar a favoritos
      // TODO: Implementar lógica de favoritos
      console.log('Agregar a favoritos:', unit.id);
    },
    () => {
      // Vista rápida
      onClick?.();
    }
  );

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
        ${longPressHandlers.isPressing ? 'scale-[0.98] opacity-90' : ''}
        ${className}
      `}
      onClick={onClick}
      {...longPressHandlers.handlers}
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
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-200 dark:bg-slate-800 rounded-t-2xl">
        {/* Imagen oculta para detectar errores antes de renderizar Next Image */}
        {!hasError && imageUrl !== fallbackImage && (
          <img
            src={imageUrl}
            alt=""
            className="hidden"
            onError={() => {
              setHasError(true);
              setImageUrl(fallbackImage);
            }}
            onLoad={() => setHasError(false)}
          />
        )}
        <Image
          src={finalImageUrl}
          alt={`${buildingName} - ${unit.tipologia}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105 rounded-t-2xl"
          sizes="(max-width: 640px) 280px, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          placeholder="blur"
          blurDataURL={DEFAULT_BLUR}
        />

        {/* Status Badge (Top Left) */}
        <div className="absolute top-3 left-3 px-4 py-2 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border border-white/20 dark:border-slate-700/50">
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-wide">
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
      <div className="p-4">
        {/* Header with floor, building name, and location */}
        <div className="mb-1.5 space-y-1.5">
          {/* Floor and Building Name */}
          <div>
            {floorNumber !== null ? (
              <h3 className="text-base font-bold text-text leading-snug truncate" title={`Departamento en el piso ${floorNumber} de ${buildingName}`}>
                Departamento en el piso {floorNumber}
              </h3>
            ) : (
              <h3 className="text-base font-bold text-text leading-snug truncate" title={`${unit.tipologia || 'Departamento'} en ${buildingName}`}>
                {unit.tipologia || 'Departamento'}
              </h3>
            )}
            <p className="text-sm font-semibold text-text mt-1 truncate">
              Edificio {buildingName}
            </p>
          </div>

          {/* Tipología, Comuna, and Mascotas Pills - Horizontal alignment */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Tipología pill */}
            {unit.tipologia && (() => {
              const tipologiaColor = getTipologiaColor(unit.tipologia);
              return (
                <span className={`
                  inline-flex items-center
                  px-3 py-1.5 rounded-full
                  ${tipologiaColor.bg} ${tipologiaColor.text} text-xs font-semibold
                  shadow-md ${tipologiaColor.shadow}
                  transition-all duration-200
                `}>
                  {unit.tipologia}
                </span>
              );
            })()}
            
            {/* Comuna pill */}
            {comuna && (
              <span className="
                inline-flex items-center
                px-3 py-1.5 rounded-full
                bg-[#00E6B3] text-white text-xs font-semibold
                shadow-md shadow-[#00E6B3]/25
                transition-all duration-200
              ">
                {comuna}
              </span>
            )}
            
            {/* Mascotas pill */}
            {unit.pet_friendly && (
              <span className="
                inline-flex items-center gap-1.5
                px-3 py-1.5 rounded-full
                bg-[#F97316] text-white text-xs font-semibold
                shadow-md shadow-[#F97316]/25
                transition-all duration-200
              ">
                <PawPrint className="w-3 h-3" aria-hidden="true" />
                Mascotas
              </span>
            )}
          </div>

          {/* Address */}
          <p className="text-xs text-text/90 font-medium flex items-center gap-1 truncate mt-1.5">
            <MapPin className="w-3 h-3 flex-shrink-0 text-subtext" aria-hidden="true" />
            {building?.address || ''}
          </p>
        </div>

        {/* Separator */}
        <div className="my-3 h-px w-full bg-border" />

        {/* Price Section */}
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold text-text tracking-tight tabular-nums">
                {formatPrice(unit.price)}
              </p>
              <span className="text-base font-semibold text-text/70 tracking-wide">/mes</span>
            </div>
            {gastosComunes > 0 && (
              <p className="text-sm font-medium text-subtext">
                Gasto común: {formatPrice(gastosComunes)}
              </p>
            )}
          </div>

          {/* Call to Action (Hover Desktop) */}
          <div className="opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hidden lg:block">
            <span className="text-[#8B6CFF] font-semibold text-xs">
              Ver unidad →
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // If onClick is provided, return without Link wrapper
  if (onClick) {
    return (
      <>
        {cardContent}
        <ContextMenu
          isOpen={contextMenuOpen}
          onClose={() => setContextMenuOpen(false)}
          options={contextMenuOptions}
          position={contextMenuPosition}
        />
      </>
    );
  }

  // Otherwise, wrap in Link for navigation
  return (
    <>
      <Link href={href} className="block">
        {cardContent}
      </Link>
      <ContextMenu
        isOpen={contextMenuOpen}
        onClose={() => setContextMenuOpen(false)}
        options={contextMenuOptions}
        position={contextMenuPosition}
      />
    </>
  );
}
