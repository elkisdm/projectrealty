'use client';

import { MapPin, PawPrint } from 'lucide-react';
import Link from 'next/link';
import { useState, memo } from 'react';
import type { Unit, Building } from '@types';
import { useLongPress } from '@hooks/useLongPress';
import { useUnitFavorite } from '@hooks/useFavorites';
import { ContextMenu, useContextMenuOptions } from '../../ContextMenu';
import { CardMedia } from '../parts/CardMedia';
import {
  getUnitImage,
  getStatusText,
  extractFloorNumber,
  getTipologiaColor,
  generateUnitHref,
  formatPrice
} from '../helpers';
import { COMUNA_PILL_COLOR } from '../constants';

interface UnitCardV1Props {
  unit: Unit;
  building?: Building;
  onClick?: () => void;
  priority?: boolean;
  className?: string;
}

/**
 * UnitCard V1 - Legacy layout
 * This is the original layout extracted as a separate component
 * Maintains exact visual parity with the original implementation
 */
export const UnitCardV1 = memo(function UnitCardV1({
  unit,
  building,
  onClick,
  priority = false,
  className = '',
}: UnitCardV1Props) {
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | undefined>();

  // Favorites hook
  const { isFavorited, toggle: toggleFavorite } = useUnitFavorite(unit.id);

  // Computed values
  const imageUrl = getUnitImage(unit, building);
  const statusText = getStatusText(unit);
  const buildingName = building?.name || 'Edificio';
  const comuna = building?.comuna || '';
  const gastosComunes = unit.gastoComun || 0;
  const floorNumber = extractFloorNumber(unit.codigoUnidad || '');
  const href = generateUnitHref(unit, building);
  const tipologiaColor = getTipologiaColor(unit.tipologia);

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
      // Share
      if (typeof navigator !== 'undefined' && navigator.share) {
        navigator.share({
          title: `${buildingName} - ${unit.tipologia}`,
          text: `Mira esta propiedad en ${comuna}`,
          url: typeof window !== 'undefined' ? `${window.location.origin}${href}` : href,
        }).catch(() => {
          if (typeof window !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(`${window.location.origin}${href}`);
          }
        });
      } else if (typeof window !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(`${window.location.origin}${href}`);
      }
    },
    () => {
      // Add to favorites
      toggleFavorite();
    },
    () => {
      // Quick view
      onClick?.();
    }
  );

  // Card content
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
      {/* Image Section - using CardMedia */}
      <CardMedia
        imageUrl={imageUrl}
        alt={`${buildingName} - ${unit.tipologia}`}
        priority={priority}
        badge={{ text: statusText, type: 'available' }}
        unitId={unit.id}
        isFavorited={isFavorited}
        onFavoriteToggle={toggleFavorite}
        isPressing={longPressHandlers.isPressing}
      />

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

          {/* Pills row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Tipología pill */}
            {unit.tipologia && (
              <span className={`
                inline-flex items-center
                px-3 py-1.5 rounded-full
                ${tipologiaColor.bg} ${tipologiaColor.text} text-xs font-semibold
                shadow-md ${tipologiaColor.shadow}
                transition-all duration-200
              `}>
                {unit.tipologia}
              </span>
            )}

            {/* Comuna pill */}
            {comuna && (
              <span className={`
                inline-flex items-center
                px-3 py-1.5 rounded-full
                ${COMUNA_PILL_COLOR.bg} ${COMUNA_PILL_COLOR.text} text-xs font-semibold
                shadow-md ${COMUNA_PILL_COLOR.shadow}
                transition-all duration-200
              `}>
                {comuna}
              </span>
            )}

            {/* Pet friendly pill */}
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

          {/* CTA (hover desktop) */}
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
});

export default UnitCardV1;
