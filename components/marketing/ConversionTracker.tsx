"use client";

import { useEffect } from "react";

// Tipos para eventos de conversión
type ConversionEvent = {
    eventName: string;
    properties: Record<string, unknown>;
    timestamp: number;
    sessionId?: string;
};

type UTMData = {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    ref?: string;
};

// Función para obtener UTM parameters
function getUTMParams(): UTMData {
    if (typeof window === "undefined") return {};

    const urlParams = new URLSearchParams(window.location.search);
    return {
        utm_source: urlParams.get("utm_source") || undefined,
        utm_medium: urlParams.get("utm_medium") || undefined,
        utm_campaign: urlParams.get("utm_campaign") || undefined,
        utm_term: urlParams.get("utm_term") || undefined,
        utm_content: urlParams.get("utm_content") || undefined,
        ref: urlParams.get("ref") || undefined,
    };
}

// Función para generar session ID
function generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Función para trackear eventos
export function trackConversionEvent(
    eventName: string,
    properties: Record<string, unknown> = {}
): void {
    if (typeof window === "undefined") return;

    const utmData = getUTMParams();
    const sessionId = sessionStorage.getItem("flash_videos_session_id") || generateSessionId();

    // Guardar session ID si no existe
    if (!sessionStorage.getItem("flash_videos_session_id")) {
        sessionStorage.setItem("flash_videos_session_id", sessionId);
    }

    const event: ConversionEvent = {
        eventName,
        properties: {
            ...properties,
            ...utmData,
            page_url: window.location.href,
            user_agent: navigator.userAgent,
            timestamp: Date.now(),
        },
        timestamp: Date.now(),
        sessionId,
    };

    // GA4 si está disponible
    if (window.gtag) {
        window.gtag("event", eventName, {
            event_category: "conversion",
            event_label: "flash_videos",
            custom_parameters: {
                session_id: sessionId,
                ...properties,
                ...utmData,
            },
        });
    }

    // Log local para debugging
    console.log(`[Conversion] ${eventName}`, event);

    // Enviar a endpoint de analytics (opcional)
    try {
        fetch("/api/analytics/conversion", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(event),
        }).catch(() => {
            // Silenciar errores de analytics
        });
    } catch {
        // Silenciar errores
    }
}

// Hook para tracking de scroll y engagement
export function useConversionTracking() {
    useEffect(() => {
        if (typeof window === "undefined") return;

        let hasTrackedScroll = false;
        let hasTrackedTime = false;
        const startTime = Date.now();

        const handleScroll = () => {
            if (hasTrackedScroll) return;

            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );

            if (scrollPercent >= 50) {
                trackConversionEvent("scroll_50_percent", {
                    scroll_percent: scrollPercent,
                    time_on_page: Date.now() - startTime,
                });
                hasTrackedScroll = true;
            }
        };

        const handleTimeOnPage = () => {
            if (hasTrackedTime) return;

            const timeOnPage = Date.now() - startTime;
            if (timeOnPage >= 30000) { // 30 segundos
                trackConversionEvent("time_on_page_30s", {
                    time_on_page: timeOnPage,
                });
                hasTrackedTime = true;
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        const timeInterval = setInterval(handleTimeOnPage, 5000);

        // Trackear vista de página
        trackConversionEvent("page_view", {
            page_title: document.title,
            referrer: document.referrer,
        });

        return () => {
            window.removeEventListener("scroll", handleScroll);
            clearInterval(timeInterval);
        };
    }, []);
}

// Componente para tracking automático
export function ConversionTracker() {
    useConversionTracking();
    return null;
}

// Función para construir URL de WhatsApp con UTM
export function buildWhatsAppUrlWithUTM(
    baseUrl: string,
    message: string,
    utmData: UTMData = {}
): string {
    const url = new URL(baseUrl);

    // Agregar UTM parameters
    Object.entries(utmData).forEach(([key, value]) => {
        if (value) {
            url.searchParams.set(key, value);
        }
    });

    // Agregar ref para tracking interno
    if (utmData.ref) {
        url.searchParams.set("ref", utmData.ref);
    }

    return url.toString();
}

// Función para trackear clicks de WhatsApp
export function trackWhatsAppClick(
    position: string,
    plan?: string,
    price?: number
): void {
    trackConversionEvent("cta_whatsapp_click", {
        cta_type: "whatsapp",
        cta_position: position,
        plan: plan || "base",
        price: price || 50,
        landing_page: "flash_videos",
    });
}

// gtag interface is declared in types/global.d.ts

