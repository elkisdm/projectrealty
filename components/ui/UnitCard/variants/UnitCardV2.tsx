'use client';

import Link from 'next/link';
import { useState, memo, useCallback } from 'react';
import type { Unit, Building } from '@types';
import { useLongPress } from '@hooks/useLongPress';
import { useUnitFavorite } from '@hooks/useFavorites';
import { ContextMenu, useContextMenuOptions } from '../../ContextMenu';
import { CardMedia } from '../parts/CardMedia';
import { CardPrice } from '../parts/CardPrice';
import { CardSpecs } from '../parts/CardSpecs';
import { CardAddress } from '../parts/CardAddress';
import { CardChips } from '../parts/CardChips';
import {
  computeUnitData,
  computePrimaryBadge,
  computeChips,
} from '../helpers';
import { track } from '@lib/analytics';

interface UnitCardV2Props {
  unit: Unit;
  building?: Building;
  onClick?: () => void;
  priority?: boolean;
  className?: string;
}

/**
 * UnitCard V2 - Minimal/Premium layout
 * 
 * Design inspired by QuintoAndar/Airbnb/StreetEasy:
 * - Image with aspect ratio 4:3
 * - Max 1 badge overlay
 * - Heart with optimistic UI
 * - Price hierarchy: main price > total > specs > address
 * - Max 2 chips at bottom
 * 
 * Improvements over V1:
 * - Cleaner visual hierarchy
 * - Functional favorites with localStorage
 * - Better tracking events
 * - Reduced visual noise
 */
export const UnitCardV2 = memo(function UnitCardV2({
  unit,
  building,
  onClick,
  priority = false,
  className = '',
}: UnitCardV2Props) {
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | undefined>();

  // Computed data
  const data = computeUnitData(unit, building);
  const badge = computePrimaryBadge(unit, building);
  const chips = computeChips(unit, 2);

  // Favorites hook
  const { isFavorited, toggle: toggleFavorite } = useUnitFavorite(unit.id);

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

  // Handle favorite toggle with tracking
  const handleFavoriteToggle = useCallback(() => {
    // Track with current state (before toggle)
    const willBeFavorited = !isFavorited;
    toggleFavorite();
    track('favorite_toggle', {
      action: willBeFavorited ? 'add' : 'remove',
      unit_id: unit.id,
      building_id: building?.id,
      variant: 'v2',
    });
  }, [toggleFavorite, isFavorited, unit.id, building?.id]);

  // Handle card click with tracking
  const handleClick = useCallback(() => {
    track('unit_card_click', {
      variant: 'v2',
      unit_id: unit.id,
      building_id: building?.id,
      building_name: building?.name,
      comuna: building?.comuna,
    });
    onClick?.();
  }, [onClick, unit.id, building]);

  // Context menu options
  const contextMenuOptions = useContextMenuOptions(
    () => {
      // Share
      if (typeof navigator !== 'undefined' && navigator.share) {
        navigator.share({
          title: `${data.buildingName} - ${unit.tipologia}`,
          text: `Mira esta propiedad en ${data.comuna}`,
          url: typeof window !== 'undefined' ? `${window.location.origin}${data.href}` : data.href,
        }).catch(() => {
          if (typeof window !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(`${window.location.origin}${data.href}`);
          }
        });
      } else if (typeof window !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(`${window.location.origin}${data.href}`);
      }
    },
    handleFavoriteToggle,
    () => onClick?.()
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
        hover:border-border/80
        transition-all duration-200
        cursor-pointer 
        focus:outline-none 
        focus-visible:ring-2 
        focus-visible:ring-brand-violet 
        focus-visible:ring-offset-2
        ${longPressHandlers.isPressing ? 'scale-[0.98] opacity-90' : ''}
        ${className}
      `}
      onClick={handleClick}
      {...longPressHandlers.handlers}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      } : undefined}
    >
      {/* Image Section */}
      <CardMedia
        imageUrl={data.imageUrl}
        alt={`${data.buildingName} - ${unit.tipologia}`}
        priority={priority}
        badge={badge}
        unitId={unit.id}
        isFavorited={isFavorited}
        onFavoriteToggle={handleFavoriteToggle}
        isPressing={longPressHandlers.isPressing}
      />

      {/* Content Section - V2 Layout */}
      <div className="p-4 space-y-2">
        {/* Price (primary hierarchy) */}
        <CardPrice
          price={unit.price}
          gastoComun={data.gastoComun}
          totalMensual={data.totalMensual}
          showTotal={data.gastoComun > 0}
        />

        {/* Specs (m² · D · B) */}
        <CardSpecs
          m2={data.specs.m2}
          dormitorios={data.specs.dormitorios}
          banos={data.specs.banos}
          terraza={data.specs.terraza}
        />

        {/* Address */}
        <CardAddress address={data.address} />

        {/* Chips (max 2) */}
        {chips.length > 0 && (
          <CardChips chips={chips} maxChips={2} />
        )}
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
      <Link href={data.href} className="block">
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

export default UnitCardV2;
