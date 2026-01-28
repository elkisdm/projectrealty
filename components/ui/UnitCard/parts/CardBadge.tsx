'use client';

import { memo } from 'react';
import type { CardBadgeProps } from '../types';
import { BADGE_STYLES } from '../constants';

/**
 * Badge overlay component for card image
 * Shows status, promo, or other badge
 */
export const CardBadge = memo(function CardBadge({
  text,
  type = 'available',
  className = '',
}: CardBadgeProps) {
  const styles = BADGE_STYLES[type];

  return (
    <div
      className={`
        px-4 py-2 
        rounded-full 
        ${styles.bg}
        backdrop-blur-md 
        shadow-lg 
        border border-white/20 dark:border-slate-700/50
        ${className}
      `}
    >
      <span className={`text-sm font-bold ${styles.text} tracking-wide`}>
        {text}
      </span>
    </div>
  );
});

export default CardBadge;
