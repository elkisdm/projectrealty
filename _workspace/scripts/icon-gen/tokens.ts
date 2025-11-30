/**
 * 🎨 Tokens Tipográficos y Visuales - Liquid Glass Minimal
 * 
 * Sistema de design tokens para el estilo "liquid glass minimal" de Hommie.
 * Define tamaños, strokes, opacidades y paletas de colores con presets
 * optimizados para íconos y componentes visuales.
 */

// ============================================================================
// TIPOS BASE
// ============================================================================

/**
 * Tamaños de íconos en píxeles
 * Optimizados para legibilidad y consistencia visual
 */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Grosor de stroke para íconos
 * Balance entre legibilidad y elegancia
 */
export type StrokeWeight = 'thin' | 'light' | 'normal' | 'bold';

/**
 * Niveles de opacidad para efectos glass
 * Mantiene contraste AA en todos los casos
 */
export type OpacityLevel = 'subtle' | 'soft' | 'medium' | 'strong';

/**
 * Estados de ícono para interacciones
 */
export type IconState = 'default' | 'hover' | 'active' | 'disabled' | 'loading';

/**
 * Variantes de estilo para íconos
 */
export type IconVariant = 'outline' | 'filled' | 'duotone' | 'gradient';

// ============================================================================
// TOKENS DE TAMAÑO
// ============================================================================

/**
 * Mapeo de tamaños de íconos a valores en píxeles
 * Basado en escala 8px para consistencia
 */
export const ICON_SIZES: Record<IconSize, number> = {
  xs: 12,   // 12px - Íconos muy pequeños (badges, indicadores)
  sm: 16,   // 16px - Íconos pequeños (tooltips, navegación)
  md: 20,   // 20px - Íconos estándar (botones, listas)
  lg: 24,   // 24px - Íconos grandes (headers, CTAs)
  xl: 32,   // 32px - Íconos extra grandes (hero, destacados)
  '2xl': 48 // 48px - Íconos monumentales (landing, features)
} as const;

/**
 * Mapeo de tamaños a clases CSS
 * Compatible con Tailwind y sistema de diseño
 */
export const ICON_SIZE_CLASSES: Record<IconSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4', 
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  '2xl': 'w-12 h-12'
} as const;

// ============================================================================
// TOKENS DE STROKE
// ============================================================================

/**
 * Mapeo de pesos de stroke a valores en píxeles
 * Optimizado para legibilidad en diferentes tamaños
 */
export const STROKE_WEIGHTS: Record<StrokeWeight, number> = {
  thin: 1,    // 1px - Strokes muy finos (íconos pequeños)
  light: 1.5, // 1.5px - Strokes ligeros (íconos estándar)
  normal: 2,  // 2px - Strokes normales (íconos grandes)
  bold: 2.5   // 2.5px - Strokes gruesos (íconos monumentales)
} as const;

/**
 * Mapeo de stroke a clases CSS
 * Para uso con Tailwind y estilos inline
 */
export const STROKE_CLASSES: Record<StrokeWeight, string> = {
  thin: 'stroke-[1px]',
  light: 'stroke-[1.5px]',
  normal: 'stroke-[2px]',
  bold: 'stroke-[2.5px]'
} as const;

// ============================================================================
// TOKENS DE OPACIDAD
// ============================================================================

/**
 * Niveles de opacidad para efectos glass
 * Garantiza contraste AA (4.5:1) en todos los casos
 */
export const OPACITY_LEVELS: Record<OpacityLevel, number> = {
  subtle: 0.08,  // 8% - Efectos muy sutiles
  soft: 0.12,    // 12% - Efectos suaves
  medium: 0.20,  // 20% - Efectos medios
  strong: 0.30   // 30% - Efectos fuertes
} as const;

/**
 * Mapeo de opacidad a clases CSS
 * Para efectos glass y transparencias
 */
export const OPACITY_CLASSES: Record<OpacityLevel, string> = {
  subtle: 'opacity-[0.08]',
  soft: 'opacity-[0.12]',
  medium: 'opacity-[0.20]',
  strong: 'opacity-[0.30]'
} as const;

// ============================================================================
// PALETA DE COLORES
// ============================================================================

/**
 * Colores base para el sistema de diseño
 * Optimizados para contraste AA y accesibilidad
 */
export interface ColorPalette {
  /** Color principal de marca */
  primary: string;
  /** Color secundario para acentos */
  secondary: string;
  /** Color de éxito/confirmación */
  success: string;
  /** Color de advertencia */
  warning: string;
  /** Color de error/destructivo */
  error: string;
  /** Color neutro para texto */
  neutral: string;
  /** Color de fondo glass */
  glass: string;
  /** Color de borde glass */
  glassBorder: string;
}

/**
 * Paleta de colores para tema claro
 * Basada en el sistema existente de Hommie
 */
export const LIGHT_PALETTE: ColorPalette = {
  primary: '#6D4AFF',      // Violeta principal
  secondary: '#00E6B3',    // Aqua secundario
  success: '#10B981',      // Verde éxito
  warning: '#F59E0B',      // Amarillo advertencia
  error: '#EF4444',        // Rojo error
  neutral: '#475569',      // Gris neutro
  glass: 'rgba(255, 255, 255, 0.06)',      // Fondo glass
  glassBorder: 'rgba(255, 255, 255, 0.10)' // Borde glass
} as const;

/**
 * Paleta de colores para tema oscuro
 * Optimizada para contraste y legibilidad
 */
export const DARK_PALETTE: ColorPalette = {
  primary: '#A28BFF',      // Violeta claro
  secondary: '#00F5B3',    // Aqua brillante
  success: '#34D399',      // Verde claro
  warning: '#FBBF24',      // Amarillo claro
  error: '#F87171',        // Rojo claro
  neutral: '#B7C0CE',      // Gris claro
  glass: 'rgba(255, 255, 255, 0.08)',      // Fondo glass oscuro
  glassBorder: 'rgba(255, 255, 255, 0.14)' // Borde glass oscuro
} as const;

/**
 * Paleta de colores para marca/branding
 * Colores vibrantes para elementos destacados
 */
export const BRAND_PALETTE: ColorPalette = {
  primary: '#8B6CFF',      // Violeta brand
  secondary: '#00E6B3',    // Aqua brand
  success: '#00D4AA',      // Verde brand
  warning: '#FFB800',      // Amarillo brand
  error: '#FF6B6B',        // Rojo brand
  neutral: '#64748B',      // Gris brand
  glass: 'rgba(139, 108, 255, 0.12)',      // Fondo glass brand
  glassBorder: 'rgba(139, 108, 255, 0.20)' // Borde glass brand
} as const;

// ============================================================================
// PRESETS COMPLETOS
// ============================================================================

/**
 * Preset completo para tema claro
 * Incluye todos los tokens necesarios para el estilo liquid glass
 */
export interface IconPreset {
  /** Nombre del preset */
  name: string;
  /** Paleta de colores */
  colors: ColorPalette;
  /** Tamaño por defecto */
  defaultSize: IconSize;
  /** Stroke por defecto */
  defaultStroke: StrokeWeight;
  /** Opacidad por defecto */
  defaultOpacity: OpacityLevel;
  /** Configuración de blur para efectos glass */
  blur: {
    light: string;
    medium: string;
    strong: string;
  };
  /** Configuración de sombras */
  shadows: {
    glass: string;
    glassStrong: string;
    focus: string;
  };
}

/**
 * Preset para tema claro
 * Optimizado para fondos claros y máxima legibilidad
 */
export const LIGHT_PRESET: IconPreset = {
  name: 'light',
  colors: LIGHT_PALETTE,
  defaultSize: 'md',
  defaultStroke: 'normal',
  defaultOpacity: 'soft',
  blur: {
    light: 'blur(4px)',
    medium: 'blur(8px)',
    strong: 'blur(12px)'
  },
  shadows: {
    glass: '0 1px 2px rgba(255,255,255,0.06), 0 8px 24px rgba(0,0,0,0.25)',
    glassStrong: '0 2px 4px rgba(255,255,255,0.08), 0 12px 32px rgba(0,0,0,0.35)',
    focus: '0 0 0 2px #6D4AFF, 0 0 0 4px rgba(109, 74, 255, 0.15)'
  }
} as const;

/**
 * Preset para tema oscuro
 * Optimizado para fondos oscuros y contraste mejorado
 */
export const DARK_PRESET: IconPreset = {
  name: 'dark',
  colors: DARK_PALETTE,
  defaultSize: 'md',
  defaultStroke: 'light',
  defaultOpacity: 'medium',
  blur: {
    light: 'blur(6px)',
    medium: 'blur(10px)',
    strong: 'blur(16px)'
  },
  shadows: {
    glass: '0 1px 3px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.4)',
    glassStrong: '0 2px 6px rgba(0,0,0,0.4), 0 12px 32px rgba(0,0,0,0.5)',
    focus: '0 0 0 2px #A28BFF, 0 0 0 4px rgba(162, 139, 255, 0.15)'
  }
} as const;

/**
 * Preset para branding/marca
 * Colores vibrantes para elementos destacados
 */
export const BRAND_PRESET: IconPreset = {
  name: 'brand',
  colors: BRAND_PALETTE,
  defaultSize: 'lg',
  defaultStroke: 'bold',
  defaultOpacity: 'strong',
  blur: {
    light: 'blur(8px)',
    medium: 'blur(12px)',
    strong: 'blur(20px)'
  },
  shadows: {
    glass: '0 2px 8px rgba(139, 108, 255, 0.15), 0 12px 32px rgba(139, 108, 255, 0.25)',
    glassStrong: '0 4px 16px rgba(139, 108, 255, 0.25), 0 20px 48px rgba(139, 108, 255, 0.35)',
    focus: '0 0 0 3px #8B6CFF, 0 0 0 6px rgba(139, 108, 255, 0.20)'
  }
} as const;

// ============================================================================
// UTILIDADES DE VALIDACIÓN
// ============================================================================

/**
 * Valida que un tamaño de ícono sea válido
 */
export function isValidIconSize(size: string): size is IconSize {
  return Object.keys(ICON_SIZES).includes(size);
}

/**
 * Valida que un peso de stroke sea válido
 */
export function isValidStrokeWeight(stroke: string): stroke is StrokeWeight {
  return Object.keys(STROKE_WEIGHTS).includes(stroke);
}

/**
 * Valida que un nivel de opacidad sea válido
 */
export function isValidOpacityLevel(opacity: string): opacity is OpacityLevel {
  return Object.keys(OPACITY_LEVELS).includes(opacity);
}

/**
 * Obtiene el preset por nombre
 */
export function getPreset(name: 'light' | 'dark' | 'brand'): IconPreset {
  switch (name) {
    case 'light':
      return LIGHT_PRESET;
    case 'dark':
      return DARK_PRESET;
    case 'brand':
      return BRAND_PRESET;
    default:
      return LIGHT_PRESET;
  }
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

// Los tipos y constantes ya están exportados inline arriba
// No necesitamos re-exportarlos aquí
