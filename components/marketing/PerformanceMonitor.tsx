"use client";

import { useEffect } from "react";

// Tipos para métricas de performance
type PerformanceMetric = {
    name: string;
    value: number;
    rating: "good" | "needs-improvement" | "poor";
    timestamp: number;
};

// Umbrales de Core Web Vitals
const CORE_WEB_VITALS_THRESHOLDS = {
    LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
    FID: { good: 100, poor: 300 }, // First Input Delay
    CLS: { good: 0.1, poor: 0.25 }, // Cumulative Layout Shift
    FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
    TTFB: { good: 800, poor: 1800 }, // Time to First Byte
} as const;

// Función para obtener rating de métrica
function getMetricRating(metric: string, value: number): "good" | "needs-improvement" | "poor" {
    const thresholds = CORE_WEB_VITALS_THRESHOLDS[metric as keyof typeof CORE_WEB_VITALS_THRESHOLDS];
    if (!thresholds) return "good";

    if (value <= thresholds.good) return "good";
    if (value <= thresholds.poor) return "needs-improvement";
    return "poor";
}

// Hook para monitorear Core Web Vitals
export function usePerformanceMonitoring() {
    useEffect(() => {
        if (typeof window === "undefined" || !window.performance) return;

        const metrics: PerformanceMetric[] = [];

        // Observer para LCP
        if ("PerformanceObserver" in window) {
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1] as PerformanceEntry;

                    if (lastEntry) {
                        const metric: PerformanceMetric = {
                            name: "LCP",
                            value: lastEntry.startTime,
                            rating: getMetricRating("LCP", lastEntry.startTime),
                            timestamp: Date.now(),
                        };
                        metrics.push(metric);

                        // Log para debugging
                        console.log(`[Performance] LCP: ${metric.value}ms (${metric.rating})`);

                        // Enviar a analytics
                        trackPerformanceMetric(metric);
                    }
                });

                lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
            } catch (error) {
                console.warn("LCP observer not supported");
            }

            // Observer para FID
            try {
                const fidObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();

                    entries.forEach((entry) => {
                        // Cast to PerformanceEventTiming for FID
                        const fidEntry = entry as PerformanceEventTiming;
                        const metric: PerformanceMetric = {
                            name: "FID",
                            value: fidEntry.processingStart - fidEntry.startTime,
                            rating: getMetricRating("FID", fidEntry.processingStart - fidEntry.startTime),
                            timestamp: Date.now(),
                        };
                        metrics.push(metric);

                        console.log(`[Performance] FID: ${metric.value}ms (${metric.rating})`);
                        trackPerformanceMetric(metric);
                    });
                });

                fidObserver.observe({ entryTypes: ["first-input"] });
            } catch (error) {
                console.warn("FID observer not supported");
            }

            // Observer para CLS
            try {
                let clsValue = 0;
                const clsObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();

                    entries.forEach((entry: any) => {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    });

                    const metric: PerformanceMetric = {
                        name: "CLS",
                        value: clsValue,
                        rating: getMetricRating("CLS", clsValue),
                        timestamp: Date.now(),
                    };

                    console.log(`[Performance] CLS: ${metric.value} (${metric.rating})`);
                    trackPerformanceMetric(metric);
                });

                clsObserver.observe({ entryTypes: ["layout-shift"] });
            } catch (error) {
                console.warn("CLS observer not supported");
            }
        }

        // Métricas básicas de navegación
        const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
        if (navigationEntry) {
            const basicMetrics = [
                { name: "TTFB", value: navigationEntry.responseStart - navigationEntry.requestStart },
                { name: "DOMContentLoaded", value: navigationEntry.domContentLoadedEventEnd - navigationEntry.domContentLoadedEventStart },
                { name: "LoadComplete", value: navigationEntry.loadEventEnd - navigationEntry.loadEventStart },
            ];

            basicMetrics.forEach(({ name, value }) => {
                if (value > 0) {
                    const metric: PerformanceMetric = {
                        name,
                        value,
                        rating: getMetricRating(name, value),
                        timestamp: Date.now(),
                    };

                    console.log(`[Performance] ${name}: ${metric.value}ms (${metric.rating})`);
                    trackPerformanceMetric(metric);
                }
            });
        }

        // Cleanup
        return () => {
            // Los observers se limpian automáticamente
        };
    }, []);
}

// Función para trackear métricas de performance
function trackPerformanceMetric(metric: PerformanceMetric) {
    if (typeof window === "undefined") return;

    // GA4
    if (window.gtag) {
        window.gtag("event", "performance_metric", {
            event_category: "performance",
            event_label: "core_web_vitals",
            custom_parameters: {
                metric_name: metric.name,
                metric_value: metric.value,
                metric_rating: metric.rating,
                session_id: sessionStorage.getItem("flash_videos_session_id"),
            },
        });
    }

    // Enviar a endpoint de analytics
    try {
        fetch("/api/analytics/performance", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...metric,
                page_url: window.location.href,
                user_agent: navigator.userAgent,
            }),
        }).catch(() => {
            // Silenciar errores
        });
    } catch {
        // Silenciar errores
    }
}

// Componente para monitoreo automático
export function PerformanceMonitor() {
    usePerformanceMonitoring();
    return null;
}

// Hook para métricas de interacción
export function useInteractionMetrics() {
    useEffect(() => {
        if (typeof window === "undefined") return;

        let interactionCount = 0;
        let lastInteractionTime = Date.now();

        const trackInteraction = () => {
            interactionCount++;
            lastInteractionTime = Date.now();

            // Trackear cada 5 interacciones
            if (interactionCount % 5 === 0) {
                window.gtag?.("event", "user_interaction", {
                    event_category: "engagement",
                    event_label: "flash_videos",
                    custom_parameters: {
                        interaction_count: interactionCount,
                        time_on_page: Date.now() - performance.timing.navigationStart,
                        session_id: sessionStorage.getItem("flash_videos_session_id"),
                    },
                });
            }
        };

        // Eventos de interacción
        const events = ["click", "scroll", "keydown", "touchstart"];
        events.forEach(event => {
            window.addEventListener(event, trackInteraction, { passive: true });
        });

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, trackInteraction);
            });
        };
    }, []);
}

// Componente para métricas de interacción
export function InteractionMonitor() {
    useInteractionMetrics();
    return null;
}

