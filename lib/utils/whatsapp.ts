/**
 * Utilidades para WhatsApp con fallbacks controlados
 */

export interface WhatsAppConfig {
  phone: string;
  message: string;
  url?: string;
}

export function buildWhatsAppUrl(config: WhatsAppConfig): string {
  const { phone, message, url } = config;
  
  // Si hay URL predefinida, usarla
  if (url) {
    return url;
  }
  
  // Construir URL desde phone y message
  const cleanPhone = phone.replace(/[^\d]/g, '');
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

export function getFlashVideosWhatsAppConfig(): WhatsAppConfig {
  const phone = process.env.WA_PHONE_E164 ?? "+56993481594";
  const message = process.env.NEXT_PUBLIC_WA_FLASH_MSG ??
    "Quiero reservar el Pack Dúo de videos para mi arriendo. ¿Cupos disponibles?";
  const url = process.env.NEXT_PUBLIC_WA_URL;

  return {
    phone,
    message,
    url
  };
}

// Función para construir URL de WhatsApp con UTM parameters
export function buildWhatsAppUrlWithUTM(
  baseConfig: WhatsAppConfig,
  utmData: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    ref?: string;
  } = {}
): string {
  const { phone, message, url } = baseConfig;

  // Si hay URL predefinida, usarla como base
  if (url) {
    const urlObj = new URL(url);
    
    // Agregar UTM parameters
    Object.entries(utmData).forEach(([key, value]) => {
      if (value) {
        urlObj.searchParams.set(key, value);
      }
    });

    return urlObj.toString();
  }

  // Construir URL desde phone y message
  const cleanPhone = phone.replace(/[^\d]/g, '');
  const baseMessage = message;
  
  // Agregar UTM parameters al mensaje
  const utmParams = Object.entries(utmData)
    .filter(([_, value]) => value)
    .map(([key, value]) => `${key}=${value}`)
    .join(' | ');

  const finalMessage = utmParams ? `${baseMessage} | ${utmParams}` : baseMessage;
  const encodedMessage = encodeURIComponent(finalMessage);

  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

// Telemetría mínima para eventos de WhatsApp
export function trackWhatsAppClick(
  eventName: string,
  properties?: Record<string, unknown>
) {
  if (typeof window === 'undefined') return;
  
  try {
    // GA4 si está disponible
    if (window.gtag) {
      window.gtag('event', eventName, {
        event_category: 'whatsapp',
        event_label: 'flash_videos',
        ...properties
      });
    }
    
    // Log local solo en desarrollo
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(`[WhatsApp] ${eventName}`, properties);
    }
  } catch (error) {
    // Silenciar errores de telemetría en producción
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn('[WhatsApp] Error tracking event:', error);
    }
  }
}

// gtag interface is declared in types/global.d.ts

