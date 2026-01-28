/**
 * UnitCard Component - Public API
 * 
 * Usage:
 * ```tsx
 * import { UnitCard, UnitCardSkeleton } from '@/components/ui/UnitCard';
 * 
 * <UnitCard 
 *   unit={unit} 
 *   building={building}
 *   priority={index < 4}
 * />
 * ```
 * 
 * Props:
 * - unit: Unit (required) - The unit data to display
 * - building?: Building - The building data for context
 * - onClick?: () => void - Optional click handler (disables navigation)
 * - variant?: 'default' | 'compact' | 'v2' - Card variant
 * - priority?: boolean - Enable priority loading for images
 * - className?: string - Additional CSS classes
 */

export { UnitCard } from './UnitCard';
export { UnitCardSkeleton } from './UnitCardSkeleton';
export type { UnitCardProps, UnitCardVariant } from './types';

// Re-export helpers for testing and advanced usage
export * from './helpers';
export * from './constants';
