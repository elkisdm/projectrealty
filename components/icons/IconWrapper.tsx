'use client';

/**
 * 🎨 IconWrapper - Componente Base para Íconos Glass
 * 
 * Wrapper base que proporciona efectos glass, animaciones y configuración
 * para todos los íconos del sistema. Integra con el contexto de íconos.
 */

import React, { forwardRef, useMemo, useState } from 'react';
import { motion, AnimatePresence, cubicBezier } from 'framer-motion';
import { useIconContext, useIconConfig } from './IconProvider';
import { IconSize, StrokeWeight, IconVariant, ICON_SIZES } from '@workspace/scripts/icon-gen/tokens';

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

/**
 * Props del IconWrapper
 */
interface IconWrapperProps {
    /** Nombre del ícono */
    name: string;
    /** Tamaño del ícono */
    size?: IconSize;
    /** Stroke del ícono */
    stroke?: StrokeWeight;
    /** Variante del ícono */
    variant?: IconVariant;
    /** Color personalizado */
    color?: string;
    /** Clases CSS adicionales */
    className?: string;
    /** Si debe mostrar efectos glass */
    glass?: boolean;
    /** Si debe mostrar animaciones */
    animated?: boolean;
    /** Opacidad personalizada */
    opacity?: number;
    /** Intensidad del blur personalizada */
    blur?: number;
    /** Callback al hacer click */
    onClick?: () => void;
    /** Callback al hacer hover */
    onHover?: () => void;
    /** Callback al hacer focus */
    onFocus?: () => void;
    /** Si está deshabilitado */
    disabled?: boolean;
    /** Si está cargando */
    loading?: boolean;
    /** Accesibilidad: aria-label */
    'aria-label'?: string;
    /** Accesibilidad: aria-describedby */
    'aria-describedby'?: string;
    /** Accesibilidad: role */
    role?: string;
    /** Hijos del wrapper */
    children?: React.ReactNode;
}

/**
 * Props del contenedor glass
 */
interface GlassContainerProps {
    /** Si debe mostrar efectos glass */
    glass: boolean;
    /** Opacidad del glass */
    opacity: number;
    /** Intensidad del blur */
    blur: number;
    /** Color del glass */
    glassColor: string;
    /** Color del borde */
    borderColor: string;
    /** Clases CSS */
    className?: string;
    /** Hijos */
    children: React.ReactNode;
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

/**
 * Contenedor con efectos glass
 */
function GlassContainer({
    glass,
    opacity,
    blur,
    glassColor,
    borderColor,
    className = '',
    children
}: GlassContainerProps) {
    if (!glass) {
        return <>{children}</>;
    }

    return (
        <div
            className={`relative overflow-hidden rounded-2xl ${className}`}
            style={{
                backdropFilter: `blur(${blur}px)`,
                backgroundColor: glassColor,
                border: `1px solid ${borderColor}`,
                opacity
            }}
        >
            {children}
        </div>
    );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * IconWrapper - Componente base para íconos glass
 */
export const IconWrapper = forwardRef<HTMLDivElement, IconWrapperProps>(
    ({
        name,
        size = 'md',
        stroke: _stroke = 'normal',
        variant: _variant = 'outline',
        color,
        className = '',
        glass,
        animated = true,
        opacity,
        blur,
        onClick,
        onHover,
        onFocus,
        disabled = false,
        loading = false,
        'aria-label': ariaLabel,
        'aria-describedby': ariaDescribedby,
        role = 'img',
        children
    }, ref) => {
        // Contexto de íconos
        const { currentPreset } = useIconContext();
        const config = useIconConfig();

        // Valores por defecto desde el contexto
        const effectiveGlass = glass ?? config.enableGlassEffects;
        const effectiveAnimated = animated && config.enableAnimations;
        const effectiveOpacity = opacity ?? config.glassOpacity;
        const effectiveBlur = blur ?? config.blurIntensity;

        // Tamaño del ícono
        const iconSize = ICON_SIZES[size];

        // Colores del glass
        const glassColor = useMemo(() => {
            if (color) return color;
            return currentPreset.colors.glass;
        }, [color, currentPreset.colors.glass]);

        const borderColor = useMemo(() => {
            if (color) return `${color}20`; // 20% opacity
            return currentPreset.colors.glassBorder;
        }, [color, currentPreset.colors.glassBorder]);

        // Animaciones
        const animations = useMemo(() => {
            if (!effectiveAnimated) return {};

            return {
                initial: { scale: 0.8, opacity: 0 },
                animate: { scale: 1, opacity: 1 },
                exit: { scale: 0.8, opacity: 0 },
                whileHover: {
                    scale: 1.05,
                    transition: { duration: 0.2 }
                },
                whileTap: {
                    scale: 0.95,
                    transition: { duration: 0.1 }
                },
                transition: {
                    duration: 0.3,
                    ease: cubicBezier(0.4, 0, 0.2, 1)
                }
            };
        }, [effectiveAnimated]);

        // Estados de hover y focus
        const [isHovered, setIsHovered] = useState(false);
        const [isFocused, setIsFocused] = useState(false);

        // Handlers
        const handleMouseEnter = () => {
            setIsHovered(true);
            onHover?.();
        };

        const handleMouseLeave = () => {
            setIsHovered(false);
        };

        const handleFocus = () => {
            setIsFocused(true);
            onFocus?.();
        };

        const handleBlur = () => {
            setIsFocused(false);
        };

        const handleClick = () => {
            if (!disabled && !loading) {
                onClick?.();
            }
        };

        // Clases CSS
        const containerClasses = useMemo(() => {
            const baseClasses = [
                'inline-flex',
                'items-center',
                'justify-center',
                'relative',
                'transition-all',
                'duration-200',
                'ease-out',
                'focus:outline-none',
                'focus:ring-2',
                'focus:ring-offset-2',
                'focus:ring-primary/50',
                'rounded-2xl'
            ];

            if (disabled) {
                baseClasses.push('opacity-50', 'cursor-not-allowed');
            } else if (loading) {
                baseClasses.push('opacity-75', 'cursor-wait');
            } else {
                baseClasses.push('cursor-pointer');
            }

            if (isHovered) {
                baseClasses.push('shadow-lg');
            }

            if (isFocused) {
                baseClasses.push('ring-2', 'ring-primary/50');
            }

            return [...baseClasses, className].filter(Boolean).join(' ');
        }, [disabled, loading, isHovered, isFocused, className]);

        // Componente base
        const BaseComponent = effectiveAnimated ? motion.div : 'div';

        return (
            <AnimatePresence mode="wait">
                <BaseComponent
                    ref={ref}
                    className={containerClasses}
                    style={{
                        width: iconSize,
                        height: iconSize,
                        minWidth: iconSize,
                        minHeight: iconSize
                    }}
                    onClick={handleClick}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    role={role}
                    aria-label={ariaLabel || `${name} icon`}
                    aria-describedby={ariaDescribedby}
                    aria-disabled={disabled}
                    aria-busy={loading}
                    tabIndex={disabled ? -1 : 0}
                    {...(effectiveAnimated ? animations : {})}
                >
                    <GlassContainer
                        glass={effectiveGlass}
                        opacity={effectiveOpacity}
                        blur={effectiveBlur}
                        glassColor={glassColor}
                        borderColor={borderColor}
                        className="w-full h-full flex items-center justify-center"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                            children
                        )}
                    </GlassContainer>
                </BaseComponent>
            </AnimatePresence>
        );
    }
);

// Display name para debugging
IconWrapper.displayName = 'IconWrapper';
