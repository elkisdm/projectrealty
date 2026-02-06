'use client';

import { memo } from 'react';
import Image from 'next/image';
import { PawPrint, Car, Package } from 'lucide-react';
import type { CardChipsProps, ChipType } from '../types';
import { CHIP_COLORS } from '../constants';

function BalconIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/icons/balcon.svg"
      alt=""
      width={12}
      height={12}
      className={className ?? 'w-3 h-3 shrink-0 object-contain'}
      aria-hidden
    />
  );
}

const CHIP_ICONS: Record<ChipType, React.ComponentType<{ className?: string }>> = {
  pet: PawPrint,
  parking: Car,
  storage: Package,
  terrace: BalconIcon,
};

const CHIP_LABELS: Record<ChipType, string> = {
  pet: 'Mascotas',
  parking: 'Estac.',
  storage: 'Bodega',
  terrace: 'Terraza',
};

/**
 * Card chips component
 * Shows feature chips (max 2 by default)
 */
export const CardChips = memo(function CardChips({
  chips,
  maxChips = 2,
  className = '',
}: CardChipsProps) {
  if (!chips || chips.length === 0) return null;

  const visibleChips = chips.slice(0, maxChips);

  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
      {visibleChips.map((chip) => {
        const Icon = CHIP_ICONS[chip.type];
        const colors = CHIP_COLORS[chip.type];
        const label = chip.label || CHIP_LABELS[chip.type];

        return (
          <span
            key={chip.type}
            className={`
              inline-flex items-center gap-1
              px-2 py-1 rounded-full
              ${colors.bg} ${colors.text} text-[10px] font-semibold
              shadow-sm ${colors.shadow}
            `}
          >
            <Icon className="w-3 h-3" aria-hidden="true" />
            <span>{label}</span>
          </span>
        );
      })}
    </div>
  );
});

export default CardChips;
