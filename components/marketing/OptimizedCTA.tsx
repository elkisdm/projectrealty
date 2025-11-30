"use client";

import React from "react";
import { WhatsAppCTA } from "./WhatsAppCTA";
import { AA_COLORS, isAAContrast } from "./ContrastChecker";

// Variantes de copy para A/B testing
export const CTA_VARIANTS = {
    // Variante A: Copy directo y urgente
    variantA: {
        header: "Reservar mi pack por WhatsApp",
        plans: {
            base: "Elegir Base",
            meta: "Elegir + Meta Ads",
            manychat: "Elegir + ManyChat"
        },
        final: "🚀 Reservar mi cupo ahora",
        sticky: "Reservar por WhatsApp"
    },
    // Variante B: Copy más suave y beneficioso
    variantB: {
        header: "Comenzar con mis videos",
        plans: {
            base: "Pack Base $50",
            meta: "Pack + Meta Ads $100",
            manychat: "Pack + ManyChat $150"
        },
        final: "✨ Comenzar ahora",
        sticky: "Comenzar"
    },
    // Variante C: Copy enfocado en resultados
    variantC: {
        header: "Generar leads con videos",
        plans: {
            base: "Videos Base",
            meta: "Videos + Ads",
            manychat: "Videos + Bot"
        },
        final: "🎯 Generar leads ahora",
        sticky: "Generar leads"
    }
} as const;

// Tipos para el componente
type CTAPosition = "header" | "plans_base" | "plans_meta" | "plans_manychat" | "final" | "sticky";
type CTASize = "sm" | "md" | "lg" | "xl";
type CTAStyle = "primary" | "secondary" | "outline" | "ghost";

interface OptimizedCTAProps {
    href: string;
    position: CTAPosition;
    plan?: string;
    price?: number;
    size?: CTASize;
    style?: CTAStyle;
    variant?: keyof typeof CTA_VARIANTS;
    className?: string;
    children?: React.ReactNode;
}

// Configuración de estilos por tamaño
const sizeConfig = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    xl: "px-8 py-4 text-xl"
} as const;

// Configuración de estilos por variante
const styleConfig = {
    primary: {
        base: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
        dark: "dark:bg-green-500 dark:text-black dark:hover:bg-green-600 dark:focus:ring-green-400"
    },
    secondary: {
        base: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
        dark: "dark:bg-blue-500 dark:text-black dark:hover:bg-blue-600 dark:focus:ring-blue-400"
    },
    outline: {
        base: "border-2 border-green-600 text-green-600 hover:bg-green-50 focus:ring-green-500",
        dark: "dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20 dark:focus:ring-green-400"
    },
    ghost: {
        base: "text-green-600 hover:bg-green-50 focus:ring-green-500",
        dark: "dark:text-green-400 dark:hover:bg-green-900/20 dark:focus:ring-green-400"
    }
} as const;

export function OptimizedCTA({
    href,
    position,
    plan = "base",
    price = 50,
    size = "md",
    style = "primary",
    variant = "variantA",
    className = "",
    children
}: OptimizedCTAProps) {
    // Obtener copy según variante y posición
    const getCopy = () => {
        if (children) return children;

        const variantCopy = CTA_VARIANTS[variant];

        switch (position) {
            case "header":
                return variantCopy.header;
            case "plans_base":
                return variantCopy.plans.base;
            case "plans_meta":
                return variantCopy.plans.meta;
            case "plans_manychat":
                return variantCopy.plans.manychat;
            case "final":
                return variantCopy.final;
            case "sticky":
                return variantCopy.sticky;
            default:
                return variantCopy.header;
        }
    };

    // Construir clases CSS con focus-rings consistentes
    const baseClasses = [
        "inline-flex items-center justify-center font-semibold rounded-xl",
        "transition-all duration-200 transform hover:scale-105 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        "min-h-[44px]", // WCAG AA minimum target size
        sizeConfig[size],
        styleConfig[style].base,
        styleConfig[style].dark,
        className
    ].join(" ");

    // Verificar contraste AA
    const isContrastAA = isAAContrast("#ffffff", "#059669"); // green-600

    return (
        <WhatsAppCTA
            href={href}
            position={position}
            plan={plan}
            price={price}
            className={baseClasses}
            data-variant={variant}
            data-size={size}
            data-style={style}
            data-contrast-aa={isContrastAA}
            aria-label={`${getCopy()} - ${plan} plan por $${price}`}
        >
            {getCopy()}
        </WhatsAppCTA>
    );
}

// Componente para A/B testing automático
export function ABTestCTA(props: OptimizedCTAProps) {
    // Para evitar errores de hidratación, usamos una variante fija en el servidor
    // y solo cambiamos en el cliente después de la hidratación
    const [variant, setVariant] = React.useState<keyof typeof CTA_VARIANTS>("variantA");

    React.useEffect(() => {
        // Solo cambiar variante después de la hidratación
        const sessionId = sessionStorage.getItem("flash_videos_session_id");
        if (sessionId) {
            const lastChar = sessionId.slice(-1);
            const variants = Object.keys(CTA_VARIANTS) as Array<keyof typeof CTA_VARIANTS>;
            const index = parseInt(lastChar, 16) % variants.length;
            setVariant(variants[index]);
        }
    }, []);

    return (
        <OptimizedCTA
            {...props}
            variant={variant}
        />
    );
}

// Hook para tracking de variantes A/B
export function useABTestTracking() {
    const trackVariant = (variant: string, position: string) => {
        if (typeof window === "undefined") return;

        // Trackear exposición a variante
        window.gtag?.("event", "ab_test_exposure", {
            event_category: "ab_testing",
            event_label: "flash_videos_cta",
            custom_parameters: {
                variant,
                position,
                session_id: sessionStorage.getItem("flash_videos_session_id")
            }
        });
    };

    return { trackVariant };
}
