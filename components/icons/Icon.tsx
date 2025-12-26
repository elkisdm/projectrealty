'use client';

/**
 * 🎨 Icon - Componente Principal de Íconos Glass
 * 
 * Componente principal que integra el IconWrapper con la carga dinámica
 * de SVGs generados por el sistema de íconos glass.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { IconWrapper } from './IconWrapper';
import { useIconContext, useIconPreset } from './IconProvider';
import { IconSize, StrokeWeight, IconVariant } from '@workspace/scripts/icon-gen/tokens';

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

/**
 * Props del componente Icon
 */
interface IconProps {
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
    /** Fallback cuando no se encuentra el ícono */
    fallback?: React.ReactNode;
    /** Si debe precargar el ícono */
    preload?: boolean;
}

/**
 * Estado del ícono
 */
interface IconState {
    /** Si está cargando */
    isLoading: boolean;
    /** Si se cargó exitosamente */
    isLoaded: boolean;
    /** Si hubo error */
    hasError: boolean;
    /** Contenido SVG */
    svgContent: string | null;
    /** Error si lo hay */
    error: string | null;
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Genera la ruta del archivo SVG
 */
function generateSVGPath(
    name: string,
    variant: IconVariant,
    size: IconSize,
    stroke: StrokeWeight
): string {
    return `/icons/generated/${name}-${variant}-${size}-${stroke}.svg`;
}

/**
 * Carga un SVG desde la ruta especificada
 */
async function loadSVG(path: string): Promise<string> {
    try {
        const response = await fetch(path);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const svgContent = await response.text();

        // Validar que es un SVG válido
        if (!svgContent.includes('<svg')) {
            throw new Error('Contenido no es un SVG válido');
        }

        return svgContent;
    } catch (error) {
        throw new Error(`Error cargando SVG: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Icon - Componente principal de íconos glass
 */
export function Icon({
    name,
    size = 'md',
    stroke = 'normal',
    variant = 'outline',
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
    loading: externalLoading = false,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedby,
    role = 'img',
    fallback,
    preload = false
}: IconProps) {
    // Contexto de íconos
    const { config: _ } = useIconContext();
    const currentPreset = useIconPreset();

    // Estado interno del ícono
    const [state, setState] = useState<IconState>({
        isLoading: false,
        isLoaded: false,
        hasError: false,
        svgContent: null,
        error: null
    });

    // Ruta del SVG
    const svgPath = useMemo(() => {
        return generateSVGPath(name, variant, size, stroke);
    }, [name, variant, size, stroke]);

    // Cargar SVG
    const loadIcon = async () => {
        if (state.isLoaded || state.isLoading) return;

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const svgContent = await loadSVG(svgPath);
            setState({
                isLoading: false,
                isLoaded: true,
                hasError: false,
                svgContent,
                error: null
            });
        } catch (error) {
            setState({
                isLoading: false,
                isLoaded: false,
                hasError: true,
                svgContent: null,
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    };

    // Cargar ícono al montar o cambiar dependencias
    useEffect(() => {
        if (preload || !state.isLoaded) {
            loadIcon();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- loadIcon is stable, triggers on svgPath/preload change only
    }, [svgPath, preload]);

    // Estado de loading combinado
    const isLoading = state.isLoading || externalLoading;

    // Renderizar contenido SVG
    const renderSVG = () => {
        if (isLoading) {
            return (
                <div className="animate-pulse">
                    <div className="w-full h-full bg-gray-200 rounded" />
                </div>
            );
        }

        if (state.hasError || !state.svgContent) {
            if (fallback) {
                return fallback;
            }

            // Fallback por defecto
            return (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-xs">?</span>
                </div>
            );
        }

        // Renderizar SVG
        return (
            <div
                className="w-full h-full"
                dangerouslySetInnerHTML={{ __html: state.svgContent }}
            />
        );
    };

    // Color efectivo
    const effectiveColor = useMemo(() => {
        if (color) return color;

        // Usar colores del preset según la variante
        switch (variant) {
            case 'filled':
                return currentPreset.colors.primary;
            case 'duotone':
                return currentPreset.colors.secondary;
            case 'gradient':
                return currentPreset.colors.primary;
            default:
                return currentPreset.colors.primary;
        }
    }, [color, variant, currentPreset.colors]);

    return (
        <IconWrapper
            name={name}
            size={size}
            stroke={stroke}
            variant={variant}
            color={effectiveColor}
            className={className}
            glass={glass}
            animated={animated}
            opacity={opacity}
            blur={blur}
            onClick={onClick}
            onHover={onHover}
            onFocus={onFocus}
            disabled={disabled}
            loading={isLoading}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedby}
            role={role}
        >
            {renderSVG()}
        </IconWrapper>
    );
}

// ============================================================================
// COMPONENTES ESPECIALIZADOS
// ============================================================================

/**
 * IconButton - Ícono con comportamiento de botón
 */
export function IconButton({
    name,
    size = 'md',
    stroke = 'normal',
    variant = 'outline',
    color,
    className = '',
    glass = true,
    animated = true,
    onClick,
    disabled = false,
    loading = false,
    'aria-label': ariaLabel,
    ...props
}: Omit<IconProps, 'role'> & {
    /** Texto del botón para accesibilidad */
    buttonText?: string;
}) {
    return (
        <Icon
            name={name}
            size={size}
            stroke={stroke}
            variant={variant}
            color={color}
            className={`hover:scale-105 active:scale-95 ${className}`}
            glass={glass}
            animated={animated}
            onClick={onClick}
            disabled={disabled}
            loading={loading}
            aria-label={ariaLabel || `${name} button`}
            role="button"
            {...props}
        />
    );
}

/**
 * IconLink - Ícono con comportamiento de enlace
 */
export function IconLink({
    name,
    size = 'md',
    stroke = 'normal',
    variant = 'outline',
    color,
    className = '',
    glass = true,
    animated = true,
    href,
    target,
    rel,
    onClick,
    disabled = false,
    loading = false,
    'aria-label': ariaLabel,
    ...props
}: Omit<IconProps, 'role'> & {
    /** URL del enlace */
    href: string;
    /** Target del enlace */
    target?: string;
    /** Rel del enlace */
    rel?: string;
}) {
    const handleClick = (e: React.MouseEvent) => {
        if (disabled || loading) {
            e.preventDefault();
            return;
        }
        onClick?.();
    };

    return (
        <a
            href={href}
            target={target}
            rel={rel}
            onClick={handleClick}
            className="inline-block"
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : 0}
        >
            <Icon
                name={name}
                size={size}
                stroke={stroke}
                variant={variant}
                color={color}
                className={`hover:scale-105 ${className}`}
                glass={glass}
                animated={animated}
                disabled={disabled}
                loading={loading}
                aria-label={ariaLabel || `${name} link`}
                role="link"
                {...props}
            />
        </a>
    );
}

/**
 * IconBadge - Ícono con badge de notificación
 */
export function IconBadge({
    name,
    size = 'md',
    stroke = 'normal',
    variant = 'outline',
    color,
    className = '',
    glass = true,
    animated = true,
    badge,
    badgeColor = 'red',
    badgeSize = 'sm',
    onClick,
    disabled = false,
    loading = false,
    'aria-label': ariaLabel,
    ...props
}: Omit<IconProps, 'role'> & {
    /** Contenido del badge */
    badge?: string | number;
    /** Color del badge */
    badgeColor?: string;
    /** Tamaño del badge */
    badgeSize?: 'xs' | 'sm' | 'md';
}) {
    const badgeSizes = {
        xs: 'w-2 h-2 text-xs',
        sm: 'w-3 h-3 text-xs',
        md: 'w-4 h-4 text-sm'
    };

    return (
        <div className="relative inline-block">
            <Icon
                name={name}
                size={size}
                stroke={stroke}
                variant={variant}
                color={color}
                className={className}
                glass={glass}
                animated={animated}
                onClick={onClick}
                disabled={disabled}
                loading={loading}
                aria-label={ariaLabel || `${name} with badge`}
                {...props}
            />
            {badge && (
                <div
                    className={`absolute -top-1 -right-1 ${badgeSizes[badgeSize]} bg-${badgeColor}-500 text-white rounded-full flex items-center justify-center font-bold`}
                    style={{ backgroundColor: badgeColor }}
                >
                    {badge}
                </div>
            )}
        </div>
    );
}
