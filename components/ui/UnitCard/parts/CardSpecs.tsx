'use client';

import { memo } from 'react';
import type { CardSpecsProps } from '../types';

/**
 * Card specs component
 * Shows m² · D · B in a single line
 */
export const CardSpecs = memo(function CardSpecs({
  m2,
  dormitorios,
  banos,
  terraza,
  className = '',
}: CardSpecsProps) {
  const parts: string[] = [];

  if (m2) {
    parts.push(`${m2} m²`);
  }

  parts.push(`${dormitorios}D`);
  parts.push(`${banos}B`);

  if (terraza && terraza > 0) {
    parts.push(`+${terraza}m² terraza`);
  }

  return (
    <p className={`text-sm text-subtext font-medium truncate ${className}`}>
      {parts.join(' · ')}
    </p>
  );
});

export default CardSpecs;
