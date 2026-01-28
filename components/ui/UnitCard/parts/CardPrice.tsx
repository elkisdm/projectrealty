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

  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      {/* Main price */}
      <div className="flex items-baseline gap-1.5">
        <span className="text-xl font-bold text-text tracking-tight tabular-nums">
          {formatPrice(price)}
        </span>
        <span className="text-sm font-medium text-subtext">/mes</span>
      </div>

      {/* Total mensual (with tooltip) */}
      {showTotal && gastoComun > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-subtext">
            Total aprox: {formatPrice(total)}
          </span>
          <button
            type="button"
            className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-surface text-subtext text-[10px] font-medium hover:bg-border transition-colors"
            aria-label={`Incluye gasto común de ${formatPrice(gastoComun)}`}
            title={`Arriendo: ${formatPrice(price)} + GC: ${formatPrice(gastoComun)}`}
          >
            ?
          </button>
        </div>
      )}
    </div>
  );
});

export default CardPrice;
