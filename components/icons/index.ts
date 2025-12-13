"use client";

/**
 * 🎨 Sistema de Íconos Glass - Exportaciones
 * 
 * Archivo de índice que exporta todos los componentes y utilidades
 * del sistema de íconos glass minimal.
 */

import { useState, useCallback, useEffect } from 'react';

// ============================================================================
// COMPONENTES PRINCIPALES
// ============================================================================

export { IconProvider, useIconContext, useIconConfig, useIconPreset, useIconActions, useIconStatus } from './IconProvider';
export { IconWrapper } from './IconWrapper';
export { Icon, IconButton, IconLink, IconBadge } from './Icon';
export { IconDemo } from './IconDemo';

// ============================================================================
// TIPOS Y UTILIDADES
// ============================================================================

export type {
  IconSize,
  StrokeWeight,
  OpacityLevel,
  IconVariant,
  IconPreset
} from '@workspace/scripts/icon-gen/tokens';

export {
  ICON_SIZES,
  STROKE_WEIGHTS,
  OPACITY_LEVELS,
  LIGHT_PRESET,
  DARK_PRESET,
  BRAND_PRESET,
  getPreset
} from '@workspace/scripts/icon-gen/tokens';

// ============================================================================
// CONSTANTES Y CONFIGURACIÓN
// ============================================================================

/**
 * Configuración por defecto del sistema de íconos
 */
export const DEFAULT_ICON_CONFIG = {
  preset: 'light' as const,
  defaultSize: 'md' as const,
  defaultStroke: 'normal' as const,
  defaultVariant: 'outline' as const,
  enableGlassEffects: true,
  enableAnimations: true,
  glassOpacity: 0.06,
  blurIntensity: 8
};

/**
 * Nombres de íconos disponibles
 */
export const AVAILABLE_ICONS = [
  'home',
  'search',
  'heart',
  'settings',
  'check'
] as const;

/**
 * Tamaños disponibles
 */
export const AVAILABLE_SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;

/**
 * Strokes disponibles
 */
export const AVAILABLE_STROKES = ['thin', 'light', 'normal', 'bold'] as const;

/**
 * Variantes disponibles
 */
export const AVAILABLE_VARIANTS = ['outline', 'filled', 'duotone', 'gradient'] as const;

/**
 * Presets disponibles
 */
export const AVAILABLE_PRESETS = ['light', 'dark', 'brand'] as const;

// ============================================================================
// UTILIDADES DE VALIDACIÓN
// ============================================================================

/**
 * Valida si un nombre de ícono es válido
 */
export function isValidIconName(name: string): name is typeof AVAILABLE_ICONS[number] {
  return AVAILABLE_ICONS.includes(name as any);
}

/**
 * Valida si un tamaño es válido
 */
export function isValidIconSize(size: string): size is typeof AVAILABLE_SIZES[number] {
  return AVAILABLE_SIZES.includes(size as any);
}

/**
 * Valida si un stroke es válido
 */
export function isValidIconStroke(stroke: string): stroke is typeof AVAILABLE_STROKES[number] {
  return AVAILABLE_STROKES.includes(stroke as any);
}

/**
 * Valida si una variante es válida
 */
export function isValidIconVariant(variant: string): variant is typeof AVAILABLE_VARIANTS[number] {
  return AVAILABLE_VARIANTS.includes(variant as any);
}

/**
 * Valida si un preset es válido
 */
export function isValidIconPreset(preset: string): preset is typeof AVAILABLE_PRESETS[number] {
  return AVAILABLE_PRESETS.includes(preset as any);
}

// ============================================================================
// UTILIDADES DE GENERACIÓN
// ============================================================================

/**
 * Genera la ruta de un archivo SVG
 */
export function generateIconPath(
  name: string,
  variant: string = 'outline',
  size: string = 'md',
  stroke: string = 'normal'
): string {
  return `/icons/generated/${name}-${variant}-${size}-${stroke}.svg`;
}

/**
 * Genera todas las rutas posibles para un ícono
 */
export function generateAllIconPaths(name: string): string[] {
  const paths: string[] = [];
  
  for (const variant of AVAILABLE_VARIANTS) {
    for (const size of AVAILABLE_SIZES) {
      for (const stroke of AVAILABLE_STROKES) {
        paths.push(generateIconPath(name, variant, size, stroke));
      }
    }
  }
  
  return paths;
}

// ============================================================================
// HOOKS ADICIONALES
// ============================================================================

/**
 * Hook para precargar íconos
 */
export function useIconPreloader(iconNames: string[]) {
  const [loadedIcons, setLoadedIcons] = useState<Set<string>>(new Set());
  const [loadingIcons, setLoadingIcons] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Map<string, string>>(new Map());

  const preloadIcon = async (name: string) => {
    if (loadedIcons.has(name) || loadingIcons.has(name)) return;

    setLoadingIcons(prev => new Set(prev).add(name));

    try {
      // Precargar todas las variantes del ícono
      const paths = generateAllIconPaths(name);
      
      await Promise.all(
        paths.map(async (path) => {
          const response = await fetch(path);
          if (!response.ok) {
            throw new Error(`Failed to load ${path}`);
          }
        })
      );

      setLoadedIcons(prev => new Set(prev).add(name));
      setErrors(prev => {
        const newErrors = new Map(prev);
        newErrors.delete(name);
        return newErrors;
      });
    } catch (error) {
      setErrors(prev => new Map(prev).set(name, error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoadingIcons(prev => {
        const newLoading = new Set(prev);
        newLoading.delete(name);
        return newLoading;
      });
    }
  };

  const preloadAll = useCallback(async () => {
    await Promise.all(iconNames.map(preloadIcon));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- preloadIcon is stable
  }, [iconNames]);

  useEffect(() => {
    preloadAll();
  }, [preloadAll]);

  return {
    loadedIcons: Array.from(loadedIcons),
    loadingIcons: Array.from(loadingIcons),
    errors: Object.fromEntries(errors),
    preloadIcon,
    preloadAll
  };
}
