'use client';

import { Heart } from 'lucide-react';
import { memo, useCallback } from 'react';
import type { CardFavoriteButtonProps } from '../types';

const SIZE_CLASSES = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-3',
} as const;

const ICON_SIZES = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
} as const;

/**
 * Favorite button component with stopPropagation
 * Prevents navigation when clicking the heart
 */
export const CardFavoriteButton = memo(function CardFavoriteButton({
  unitId,
  isFavorited = false,
  onToggle,
  size = 'md',
  className = '',
}: CardFavoriteButtonProps) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    // CRITICAL: Prevent card navigation
    e.stopPropagation();
    e.preventDefault();
    onToggle?.();
  }, [onToggle]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.stopPropagation();
      e.preventDefault();
      onToggle?.();
    }
  }, [onToggle]);

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={isFavorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      aria-pressed={isFavorited}
      data-unit-id={unitId}
      className={`
        ${SIZE_CLASSES[size]}
        rounded-full 
        bg-black/20 hover:bg-black/40 
        backdrop-blur-sm 
        transition-all duration-200
        focus:outline-none 
        focus-visible:ring-2 
        focus-visible:ring-white/50
        hover:scale-110
        active:scale-95
        ${className}
      `}
    >
      <Heart
        className={`
          ${ICON_SIZES[size]}
          transition-colors duration-200
          ${isFavorited
            ? 'text-red-500 fill-red-500'
            : 'text-white fill-transparent'
          }
        `}
        aria-hidden="true"
      />
    </button>
  );
});

export default CardFavoriteButton;
