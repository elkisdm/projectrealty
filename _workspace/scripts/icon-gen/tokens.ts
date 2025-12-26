/**
 * Icon Tokens - Definiciones de tipos y constantes para el sistema de íconos
 */

// ============================================================================
// TIPOS
// ============================================================================

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type StrokeWeight = 'thin' | 'light' | 'normal' | 'bold';
export type IconVariant = 'outline' | 'filled' | 'duotone' | 'gradient';
export type OpacityLevel = number;
export type IconPreset = 'light' | 'dark' | 'brand';

// ============================================================================
// CONSTANTES
// ============================================================================

export const ICON_SIZES: Record<IconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
};

export const STROKE_WEIGHTS: Record<StrokeWeight, number> = {
  thin: 1,
  light: 1.5,
  normal: 2,
  bold: 2.5,
};

export const OPACITY_LEVELS: OpacityLevel[] = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

export const LIGHT_PRESET: IconPreset = 'light';
export const DARK_PRESET: IconPreset = 'dark';
export const BRAND_PRESET: IconPreset = 'brand';

// ============================================================================
// UTILIDADES
// ============================================================================

export function getPreset(preset: IconPreset): {
  defaultSize: IconSize;
  defaultStroke: StrokeWeight;
  defaultVariant: IconVariant;
  colors: {
    primary: string;
    secondary: string;
    gradient: string;
    glass: string;
    glassBorder: string;
  };
} {
  const presets = {
    light: {
      defaultSize: 'md' as IconSize,
      defaultStroke: 'normal' as StrokeWeight,
      defaultVariant: 'outline' as IconVariant,
      colors: {
        primary: '#000000',
        secondary: '#666666',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        glass: 'rgba(255, 255, 255, 0.1)',
        glassBorder: 'rgba(0, 0, 0, 0.2)',
      },
    },
    dark: {
      defaultSize: 'md' as IconSize,
      defaultStroke: 'normal' as StrokeWeight,
      defaultVariant: 'filled' as IconVariant,
      colors: {
        primary: '#ffffff',
        secondary: '#cccccc',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        glass: 'rgba(0, 0, 0, 0.2)',
        glassBorder: 'rgba(255, 255, 255, 0.2)',
      },
    },
    brand: {
      defaultSize: 'lg' as IconSize,
      defaultStroke: 'bold' as StrokeWeight,
      defaultVariant: 'gradient' as IconVariant,
      colors: {
        primary: '#8B6CFF',
        secondary: '#764ba2',
        gradient: 'linear-gradient(135deg, #8B6CFF 0%, #764ba2 100%)',
        glass: 'rgba(139, 108, 255, 0.1)',
        glassBorder: 'rgba(139, 108, 255, 0.2)',
      },
    },
  };

  return presets[preset];
}

