/**
 * UnitCard Component - Re-export from refactored module
 * 
 * This file maintains backwards compatibility for existing imports:
 * import { UnitCard } from '@/components/ui/UnitCard';
 * 
 * The component has been refactored into:
 * - components/ui/UnitCard/UnitCard.tsx (orchestrator)
 * - components/ui/UnitCard/variants/UnitCardV1.tsx (legacy layout)
 * - components/ui/UnitCard/variants/UnitCardV2.tsx (new layout - Sprint 2)
 * - components/ui/UnitCard/parts/* (subcomponents)
 * - components/ui/UnitCard/helpers.ts (pure functions)
 * - components/ui/UnitCard/constants.ts (configuration)
 * - components/ui/UnitCard/types.ts (TypeScript types)
 */

// Re-export the main component and types for backwards compatibility
export { UnitCard } from './UnitCard/index';
export type { UnitCardProps, UnitCardVariant } from './UnitCard/types';
