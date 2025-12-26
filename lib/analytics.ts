export type AnalyticsEventParams = Record<string, unknown> | undefined;

/**
 * Trackea eventos en Google Analytics 4 y Meta Pixel
 * @param eventName - Nombre del evento
 * @param params - Parámetros adicionales del evento
 */
export function track(eventName: string, params?: AnalyticsEventParams): void {
  if (typeof window === "undefined") return;
  
  // Google Analytics 4
  if (window.gtag) {
    window.gtag("event", eventName, params ?? {});
  }
  
  // Meta Pixel
  if (window.fbq) {
    window.fbq("track", eventName, params ?? {});
  }
}

// Re-export eventos constantes
export { ANALYTICS_EVENTS, type AnalyticsEvent } from './analytics/events';


