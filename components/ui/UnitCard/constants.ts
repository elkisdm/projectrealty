/**
 * Constants for UnitCard component
 */

import type { TipologiaColorConfig, BadgePriority } from './types';

/** Default blur placeholder for Next.js Image */
export const DEFAULT_BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTYnIGhlaWdodD0nMTAnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHJlY3Qgd2lkdGg9JzE2JyBoZWlnaHQ9JzEwJyBmaWxsPSIjMjIyMjIyIi8+PC9zdmc+';

/** Fallback images when no unit/building images available */
export const FALLBACK_IMAGES = [
  '/images/nunoa-cover.jpg',
  '/images/lascondes-cover.jpg',
  '/images/mirador-cover.jpg',
] as const;

/** Default fallback image */
export const DEFAULT_FALLBACK_IMAGE = FALLBACK_IMAGES[0];

/** Color scheme for each tipologia type */
export const TIPOLOGIA_COLORS: Record<string, TipologiaColorConfig> = {
  'studio': {
    bg: 'bg-[#8B6CFF]', // Brand Violet
    text: 'text-white',
    shadow: 'shadow-[#8B6CFF]/25'
  },
  'estudio': {
    bg: 'bg-[#8B6CFF]', // Brand Violet
    text: 'text-white',
    shadow: 'shadow-[#8B6CFF]/25'
  },
  '1d1b': {
    bg: 'bg-[#6366F1]', // Indigo
    text: 'text-white',
    shadow: 'shadow-[#6366F1]/25'
  },
  '2d1b': {
    bg: 'bg-[#3B82F6]', // Blue
    text: 'text-white',
    shadow: 'shadow-[#3B82F6]/25'
  },
  '2d2b': {
    bg: 'bg-[#0EA5E9]', // Sky Blue
    text: 'text-white',
    shadow: 'shadow-[#0EA5E9]/25'
  },
  '3d2b': {
    bg: 'bg-[#06B6D4]', // Cyan
    text: 'text-white',
    shadow: 'shadow-[#06B6D4]/25'
  }
};

/** Default tipologia color (gray) */
export const DEFAULT_TIPOLOGIA_COLOR: TipologiaColorConfig = {
  bg: 'bg-[#64748B]',
  text: 'text-white',
  shadow: 'shadow-[#64748B]/25'
};

/** Badge priority order (lower index = higher priority) */
export const BADGE_PRIORITY_ORDER: BadgePriority[] = [
  'promo',
  'exclusive',
  'pet_friendly',
  'available'
];

/** Badge styles by type */
export const BADGE_STYLES: Record<BadgePriority, { bg: string; text: string }> = {
  promo: {
    bg: 'bg-gradient-to-r from-[#8B6CFF] to-[#6366F1]',
    text: 'text-white'
  },
  exclusive: {
    bg: 'bg-gradient-to-r from-amber-500 to-orange-500',
    text: 'text-white'
  },
  pet_friendly: {
    bg: 'bg-[#F97316]',
    text: 'text-white'
  },
  available: {
    bg: 'bg-white/95 dark:bg-slate-900/95',
    text: 'text-slate-900 dark:text-slate-100'
  }
};

/** Chip colors by type */
export const CHIP_COLORS = {
  pet: {
    bg: 'bg-[#F97316]',
    text: 'text-white',
    shadow: 'shadow-[#F97316]/25'
  },
  parking: {
    bg: 'bg-[#3B82F6]',
    text: 'text-white',
    shadow: 'shadow-[#3B82F6]/25'
  },
  storage: {
    bg: 'bg-[#8B5CF6]',
    text: 'text-white',
    shadow: 'shadow-[#8B5CF6]/25'
  },
  terrace: {
    bg: 'bg-[#10B981]',
    text: 'text-white',
    shadow: 'shadow-[#10B981]/25'
  }
} as const;

/** Comuna pill color */
export const COMUNA_PILL_COLOR = {
  bg: 'bg-[#00E6B3]',
  text: 'text-white',
  shadow: 'shadow-[#00E6B3]/25'
};

/** Brand colors */
export const BRAND_COLORS = {
  violet: '#8B6CFF',
  aqua: '#00E6B3'
} as const;
