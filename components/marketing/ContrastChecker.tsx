"use client";

import { useEffect, useState } from "react";

// Función para calcular contraste WCAG AA
function calculateContrastRatio(foreground: string, background: string): number {
    // Convertir hex a RGB
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    // Calcular luminancia relativa
    const getLuminance = (r: number, g: number, b: number) => {
        const [rs, gs, bs] = [r / 255, g / 255, b / 255].map(c => {
            if (c <= 0.03928) return c / 12.92;
            return Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const fg = hexToRgb(foreground);
    const bg = hexToRgb(background);

    if (!fg || !bg) return 0;

    const l1 = getLuminance(fg.r, fg.g, fg.b);
    const l2 = getLuminance(bg.r, bg.g, bg.b);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
}

// Función para verificar si el contraste cumple WCAG AA
export function isAAContrast(foreground: string, background: string): boolean {
    const ratio = calculateContrastRatio(foreground, background);
    return ratio >= 4.5; // WCAG AA para texto normal
}

// Función para verificar si el contraste cumple WCAG AAA
export function isAAAContrast(foreground: string, background: string): boolean {
    const ratio = calculateContrastRatio(foreground, background);
    return ratio >= 7; // WCAG AAA para texto normal
}

// Hook para verificar contraste en tiempo real
export function useContrastCheck(foreground: string, background: string) {
    const [isAA, setIsAA] = useState(false);
    const [isAAA, setIsAAA] = useState(false);
    const [ratio, setRatio] = useState(0);

    useEffect(() => {
        const ratio = calculateContrastRatio(foreground, background);
        setRatio(ratio);
        setIsAA(ratio >= 4.5);
        setIsAAA(ratio >= 7);
    }, [foreground, background]);

    return { isAA, isAAA, ratio };
}

// Componente para mostrar información de contraste (solo en desarrollo)
export function ContrastChecker({
    foreground,
    background,
    label = "Contraste"
}: {
    foreground: string;
    background: string;
    label?: string;
}) {
    const { isAA, isAAA, ratio } = useContrastCheck(foreground, background);

    // Solo mostrar en desarrollo
    if (process.env.NODE_ENV !== "development") {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 bg-gray-800:bg-gray-800 p-3 rounded-lg shadow-lg border text-xs z-50">
            <div className="font-semibold mb-1">{label}</div>
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: background }}
                    />
                    <span>Ratio: {ratio.toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                    <span className={`px-1 rounded ${isAA ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        AA {isAA ? '✓' : '✗'}
                    </span>
                    <span className={`px-1 rounded ${isAAA ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        AAA {isAAA ? '✓' : '✗'}
                    </span>
                </div>
            </div>
        </div>
    );
}

// Colores predefinidos con contraste AA garantizado
export const AA_COLORS = {
    // Verde para CTAs principales
    primary: {
        background: "#059669", // green-600
        text: "#ffffff",
        hover: "#047857", // green-700
    },
    // Azul para CTAs secundarios
    secondary: {
        background: "#2563eb", // blue-600
        text: "#ffffff",
        hover: "#1d4ed8", // blue-700
    },
    // Negro para CTAs de alto contraste
    highContrast: {
        background: "#000000",
        text: "#ffffff",
        hover: "#1f2937", // gray-800
    },
    // Blanco para CTAs en modo oscuro
    light: {
        background: "#ffffff",
        text: "#000000",
        hover: "#f3f4f6", // gray-100
    },
} as const;

// Función para obtener colores AA automáticamente
export function getAAColors(baseColor: string, isDark = false) {
    const colors = Object.values(AA_COLORS);

    for (const color of colors) {
        if (isAAContrast(color.text, color.background)) {
            return color;
        }
    }

    // Fallback
    return isDark ? AA_COLORS.light : AA_COLORS.highContrast;
}










