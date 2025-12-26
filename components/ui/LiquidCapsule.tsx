'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface LiquidCapsuleProps {
    children: React.ReactNode;
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'premium';
    size?: 'xs' | 'sm' | 'md' | 'lg';
    icon?: LucideIcon;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    animate?: boolean;
}

const LIQUID_CAPSULE_VARIANTS = {
    default: {
        background: 'bg-white/60 backdrop-blur-sm',
        border: 'border-gray-200/50',
        text: 'text-gray-700',
        hover: 'hover:bg-white/80 hover:border-gray-300/50',
        selected: 'bg-gray-50/80 border-gray-300/50'
    },
    primary: {
        background: 'bg-blue-50/80 backdrop-blur-sm',
        border: 'border-blue-200/50',
        text: 'text-blue-700',
        hover: 'hover:bg-blue-100/80 hover:border-blue-300/50',
        selected: 'bg-blue-100/80 border-blue-400/50'
    },
    success: {
        background: 'bg-green-50/80 backdrop-blur-sm',
        border: 'border-green-200/50',
        text: 'text-green-700',
        hover: 'hover:bg-green-100/80 hover:border-green-300/50',
        selected: 'bg-green-100/80 border-green-400/50'
    },
    warning: {
        background: 'bg-yellow-50/80 backdrop-blur-sm',
        border: 'border-yellow-200/50',
        text: 'text-yellow-700',
        hover: 'hover:bg-yellow-100/80 hover:border-yellow-300/50',
        selected: 'bg-yellow-100/80 border-yellow-400/50'
    },
    error: {
        background: 'bg-red-50/80 backdrop-blur-sm',
        border: 'border-red-200/50',
        text: 'text-red-700',
        hover: 'hover:bg-red-100/80 hover:border-red-300/50',
        selected: 'bg-red-100/80 border-red-400/50'
    },
    info: {
        background: 'bg-cyan-50/80 backdrop-blur-sm',
        border: 'border-cyan-200/50',
        text: 'text-cyan-700',
        hover: 'hover:bg-cyan-100/80 hover:border-cyan-300/50',
        selected: 'bg-cyan-100/80 border-cyan-400/50'
    },
    premium: {
        background: 'bg-purple-50/80 backdrop-blur-sm',
        border: 'border-purple-200/50',
        text: 'text-purple-700',
        hover: 'hover:bg-purple-100/80 hover:border-purple-300/50',
        selected: 'bg-purple-100/80 border-purple-400/50'
    }
} as const;

const LIQUID_CAPSULE_SIZES = {
    xs: 'px-2 py-1 text-xs rounded-lg',
    sm: 'px-3 py-1.5 text-sm rounded-xl',
    md: 'px-4 py-2 text-base rounded-2xl',
    lg: 'px-6 py-3 text-lg rounded-3xl'
} as const;

export function LiquidCapsule({
    children,
    variant = 'default',
    size = 'md',
    icon: Icon,
    className = '',
    onClick,
    disabled = false,
    animate = true
}: LiquidCapsuleProps) {
    const variantStyles = LIQUID_CAPSULE_VARIANTS[variant];
    const sizeStyles = LIQUID_CAPSULE_SIZES[size];

    const baseClasses = `
    ${variantStyles.background}
    ${variantStyles.border}
    ${variantStyles.text}
    ${sizeStyles}
    border-2
    transition-all
    duration-150
    font-medium
    ${!disabled && onClick ? 'cursor-pointer' : ''}
    ${!disabled && onClick ? variantStyles.hover : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `.trim();

    const content = (
        <div className="flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4" />}
            {children}
        </div>
    );

    if (animate) {
        return (
            <motion.div
                className={baseClasses}
                onClick={!disabled ? onClick : undefined}
                whileHover={!disabled && onClick ? { scale: 1.02 } : {}}
                whileTap={!disabled && onClick ? { scale: 0.98 } : {}}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
                {content}
            </motion.div>
        );
    }

    return (
        <div className={baseClasses} onClick={!disabled ? onClick : undefined}>
            {content}
        </div>
    );
}

// Variantes especializadas para casos de uso comunes
export function TitleLiquidCapsule({
    children,
    className = '',
    ...props
}: Omit<LiquidCapsuleProps, 'children'> & { children: string }) {
    return (
        <LiquidCapsule
            variant="primary"
            size="lg"
            className={`font-bold text-lg ${className}`}
            {...props}
        >
            {children}
        </LiquidCapsule>
    );
}

export function PriceLiquidCapsule({
    price,
    currency = 'CLP',
    className = '',
    ...props
}: Omit<LiquidCapsuleProps, 'children'> & {
    price: number;
    currency?: string;
}) {
    const formatPrice = (price: number, currency: string): string => {
        if (currency === 'CLP') {
            return new Intl.NumberFormat('es-CL', {
                style: 'currency',
                currency: 'CLP',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(price);
        }
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <LiquidCapsule
            variant="success"
            size="md"
            className={`font-semibold ${className}`}
            {...props}
        >
            {formatPrice(price, currency)}
        </LiquidCapsule>
    );
}

export function StatusLiquidCapsule({
    status,
    className = '',
    ...props
}: Omit<LiquidCapsuleProps, 'children'> & {
    status: 'available' | 'pending' | 'sold' | 'reserved';
}) {
    const statusConfig = {
        available: { variant: 'success' as const, text: 'Disponible' },
        pending: { variant: 'warning' as const, text: 'Pendiente' },
        sold: { variant: 'error' as const, text: 'Vendido' },
        reserved: { variant: 'info' as const, text: 'Reservado' }
    };

    const config = statusConfig[status];

    return (
        <LiquidCapsule
            variant={config.variant}
            size="sm"
            className={className}
            {...props}
        >
            {config.text}
        </LiquidCapsule>
    );
}

export function FeatureLiquidCapsule({
    feature,
    icon: Icon,
    className = '',
    ...props
}: Omit<LiquidCapsuleProps, 'children'> & {
    feature: string;
    icon?: LucideIcon;
}) {
    return (
        <LiquidCapsule
            variant="default"
            size="sm"
            icon={Icon}
            className={className}
            {...props}
        >
            {feature}
        </LiquidCapsule>
    );
}

export function BadgeLiquidCapsule({
    badge,
    className = '',
    ...props
}: Omit<LiquidCapsuleProps, 'children'> & {
    badge: string;
}) {
    return (
        <LiquidCapsule
            variant="primary"
            size="sm"
            className={`font-medium ${className}`}
            {...props}
        >
            {badge}
        </LiquidCapsule>
    );
}
