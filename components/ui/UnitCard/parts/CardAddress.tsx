'use client';

import { memo } from 'react';
import { MapPin } from 'lucide-react';
import type { CardAddressProps } from '../types';

/**
 * Card address component
 * Shows truncated address with icon
 */
export const CardAddress = memo(function CardAddress({
  address,
  className = '',
}: CardAddressProps) {
  if (!address) return null;

  return (
    <p className={`text-xs text-subtext font-medium flex items-center gap-1 truncate ${className}`}>
      <MapPin className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
      <span className="truncate">{address}</span>
    </p>
  );
});

export default CardAddress;
