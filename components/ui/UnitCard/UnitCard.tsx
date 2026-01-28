'use client';

import { memo, useEffect } from 'react';
import type { UnitCardProps, UnitCardVariant } from './types';
import { UnitCardV1 } from './variants/UnitCardV1';
import { UnitCardV2 } from './variants/UnitCardV2';
import { isUnitCardV2Enabled } from '@lib/flags';
import { track } from '@lib/analytics';

/**
 * UnitCard Orchestrator
 * 
 * Decides which variant to render based on:
 * 1. Explicit variant prop
 * 2. Feature flag for gradual rollout
 * 
 * Public API remains unchanged:
 * - unit: Unit (required)
 * - building?: Building
 * - onClick?: () => void
 * - variant?: 'default' | 'compact' | 'v2'
 * - priority?: boolean
 * - className?: string
 */
export const UnitCard = memo(function UnitCard({
  unit,
  building,
  onClick,
  variant = 'default',
  priority = false,
  className = '',
}: UnitCardProps) {
  // Determine which variant to render
  const effectiveVariant = resolveVariant(variant);

  // Track card view with variant info
  useEffect(() => {
    track('unit_card_view', {
      variant: effectiveVariant,
      unit_id: unit.id,
      building_id: building?.id,
    });
  }, [effectiveVariant, unit.id, building?.id]);

  // Render V2 if enabled
  if (effectiveVariant === 'v2') {
    return (
      <UnitCardV2
        unit={unit}
        building={building}
        onClick={onClick}
        priority={priority}
        className={className}
      />
    );
  }

  // Default: render V1
  return (
    <UnitCardV1
      unit={unit}
      building={building}
      onClick={onClick}
      priority={priority}
      className={className}
    />
  );
});

/**
 * Resolve the effective variant based on prop and feature flag
 */
function resolveVariant(variant: UnitCardVariant): 'v1' | 'v2' {
  // Explicit v2 variant
  if (variant === 'v2') {
    return 'v2';
  }

  // Check feature flag for gradual rollout
  if (isUnitCardV2Enabled()) {
    return 'v2';
  }

  // Default to v1
  return 'v1';
}

export default UnitCard;
