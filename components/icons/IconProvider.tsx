'use client';

/**
 * 🎨 IconProvider - Contexto para Sistema de Íconos Glass
 * 
 * Provee configuración global para el sistema de íconos, incluyendo presets,
 * temas, y configuración de efectos glass minimal.
 */

import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { IconSize, StrokeWeight, IconVariant, getPreset } from '@workspace/scripts/icon-gen/tokens';

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

/**
 * Configuración del contexto de íconos
 */
interface IconContextConfig {
    /** Preset activo */
    preset: 'light' | 'dark' | 'brand';
    /** Tamaño por defecto */
    defaultSize: IconSize;
    /** Stroke por defecto */
    defaultStroke: StrokeWeight;
    /** Variante por defecto */
    defaultVariant: IconVariant;
    /** Si debe usar efectos glass */
    enableGlassEffects: boolean;
    /** Si debe usar animaciones */
    enableAnimations: boolean;
    /** Opacidad base para efectos glass */
    glassOpacity: number;
    /** Intensidad del blur */
    blurIntensity: number;
}

/**
 * Estado del contexto de íconos
 */
interface IconContextState {
    /** Configuración actual */
    config: IconContextConfig;
    /** Preset actual */
    currentPreset: ReturnType<typeof getPreset>;
    /** Si está en modo loading */
    isLoading: boolean;
    /** Errores del contexto */
    errors: string[];
}

/**
 * Acciones del contexto de íconos
 */
interface IconContextActions {
    /** Cambiar preset */
    setPreset: (preset: 'light' | 'dark' | 'brand') => void;
    /** Cambiar tamaño por defecto */
    setDefaultSize: (size: IconSize) => void;
    /** Cambiar stroke por defecto */
    setDefaultStroke: (stroke: StrokeWeight) => void;
    /** Cambiar variante por defecto */
    setDefaultVariant: (variant: IconVariant) => void;
    /** Toggle efectos glass */
    toggleGlassEffects: () => void;
    /** Toggle animaciones */
    toggleAnimations: () => void;
    /** Cambiar opacidad glass */
    setGlassOpacity: (opacity: number) => void;
    /** Cambiar intensidad blur */
    setBlurIntensity: (intensity: number) => void;
    /** Limpiar errores */
    clearErrors: () => void;
}

/**
 * Contexto completo de íconos
 */
interface IconContextValue extends IconContextState, IconContextActions { }

// ============================================================================
// CONTEXTO
// ============================================================================

const IconContext = createContext<IconContextValue | undefined>(undefined);

// ============================================================================
// HOOK PERSONALIZADO
// ============================================================================

/**
 * Hook para usar el contexto de íconos
 */
export function useIconContext(): IconContextValue {
    const context = useContext(IconContext);

    if (!context) {
        throw new Error('useIconContext debe usarse dentro de IconProvider');
    }

    return context;
}

// ============================================================================
// PROVIDER
// ============================================================================

/**
 * Props del IconProvider
 */
interface IconProviderProps {
    /** Hijos del provider */
    children: ReactNode;
    /** Configuración inicial */
    initialConfig?: Partial<IconContextConfig>;
}

/**
 * Provider para el sistema de íconos
 */
export function IconProvider({ children, initialConfig }: IconProviderProps) {
    // Configuración por defecto
    const defaultConfig: IconContextConfig = {
        preset: 'light',
        defaultSize: 'md',
        defaultStroke: 'normal',
        defaultVariant: 'outline',
        enableGlassEffects: true,
        enableAnimations: true,
        glassOpacity: 0.06,
        blurIntensity: 8
    };

    // Estado inicial
    const [config, setConfig] = useState<IconContextConfig>({
        ...defaultConfig,
        ...initialConfig
    });

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    // Preset actual (memoizado)
    const currentPreset = useMemo(() => {
        try {
            return getPreset(config.preset);
        } catch (error) {
            setErrors(prev => [...prev, `Error cargando preset ${config.preset}: ${error}`]);
            return getPreset('light'); // Fallback
        }
    }, [config.preset]);

    // Acciones
    const actions: IconContextActions = {
        setPreset: (preset) => {
            setConfig(prev => ({ ...prev, preset }));
            setErrors([]);
        },

        setDefaultSize: (defaultSize) => {
            setConfig(prev => ({ ...prev, defaultSize }));
        },

        setDefaultStroke: (defaultStroke) => {
            setConfig(prev => ({ ...prev, defaultStroke }));
        },

        setDefaultVariant: (defaultVariant) => {
            setConfig(prev => ({ ...prev, defaultVariant }));
        },

        toggleGlassEffects: () => {
            setConfig(prev => ({
                ...prev,
                enableGlassEffects: !prev.enableGlassEffects
            }));
        },

        toggleAnimations: () => {
            setConfig(prev => ({
                ...prev,
                enableAnimations: !prev.enableAnimations
            }));
        },

        setGlassOpacity: (glassOpacity) => {
            setConfig(prev => ({
                ...prev,
                glassOpacity: Math.max(0, Math.min(1, glassOpacity))
            }));
        },

        setBlurIntensity: (blurIntensity) => {
            setConfig(prev => ({
                ...prev,
                blurIntensity: Math.max(0, Math.min(20, blurIntensity))
            }));
        },

        clearErrors: () => {
            setErrors([]);
        }
    };

    // Valor del contexto
    const contextValue: IconContextValue = {
        config,
        currentPreset,
        isLoading,
        errors,
        ...actions
    };

    return (
        <IconContext.Provider value={contextValue}>
            {children}
        </IconContext.Provider>
    );
}

// ============================================================================
// HOOKS ADICIONALES
// ============================================================================

/**
 * Hook para obtener solo la configuración
 */
export function useIconConfig(): IconContextConfig {
    const { config } = useIconContext();
    return config;
}

/**
 * Hook para obtener solo el preset actual
 */
export function useIconPreset() {
    const { currentPreset } = useIconContext();
    return currentPreset;
}

/**
 * Hook para obtener solo las acciones
 */
export function useIconActions(): IconContextActions {
    const {
        setPreset,
        setDefaultSize,
        setDefaultStroke,
        setDefaultVariant,
        toggleGlassEffects,
        toggleAnimations,
        setGlassOpacity,
        setBlurIntensity,
        clearErrors
    } = useIconContext();

    return {
        setPreset,
        setDefaultSize,
        setDefaultStroke,
        setDefaultVariant,
        toggleGlassEffects,
        toggleAnimations,
        setGlassOpacity,
        setBlurIntensity,
        clearErrors
    };
}

/**
 * Hook para obtener el estado de loading y errores
 */
export function useIconStatus() {
    const { isLoading, errors, clearErrors } = useIconContext();
    return { isLoading, errors, clearErrors };
}
