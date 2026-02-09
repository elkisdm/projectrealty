'use client';

import { memo } from 'react';
import type { CardPriceProps } from '../types';
import { formatPrice } from '../helpers';

/**
 * Card price section component
 * Shows price, gasto comun, and optional total mensual
 */
export const CardPrice = memo(function CardPrice({
  price,
  gastoComun = 0,
  totalMensual,
  showTotal = true,
  className = '',
}: CardPriceProps) {
  const total = totalMensual ?? (price + gastoComun);
  const showTotalRow = showTotal && total > 0 && total !== price;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {/* Main price */}
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-text tracking-tight tabular-nums">
          {formatPrice(price)}
        </span>
        <span className="text-sm font-medium text-subtext">arriendo</span>
      </div>

      {/* Total mensual */}
      {showTotalRow && (
        <div className="text-xs text-subtext">
          <span className="font-medium text-text">Total mensual:</span>{" "}
          {formatPrice(total)}
          {gastoComun > 0 && ` (incluye GC ${formatPrice(gastoComun)})`}
        </div>
      )}
    </div>
  );
});

export default CardPrice;
