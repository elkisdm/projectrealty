/**
 * Constantes de eventos de analytics
 * Utilizadas para mantener consistencia en el tracking a través de la aplicación
 */

export const ANALYTICS_EVENTS = {
  // Page views
  PAGE_VIEW: 'page_view',
  PROPERTY_VIEW: 'property_view',
  SEARCH_VIEW: 'search_view',
  
  // CTAs
  CTA_BOOK_CLICK: 'cta_book_click',
  CTA_WHATSAPP_CLICK: 'cta_whatsapp_click',
  
  // Conversions
  VISIT_SCHEDULED: 'visit_scheduled',
  VISIT_SCHEDULED_WHATSAPP_CLICK: 'visit_scheduled_whatsapp_click',
  FORM_SUBMITTED: 'form_submitted',
  
  // Engagement
  FILTER_APPLIED: 'filter_applied',
  IMAGE_CLICKED: 'image_clicked',
  SCROLL_25_PERCENT: 'scroll_25_percent',
  SCROLL_50_PERCENT: 'scroll_50_percent',
  SCROLL_75_PERCENT: 'scroll_75_percent',
  SCROLL_100_PERCENT: 'scroll_100_percent',
  TIME_ON_PAGE_30S: 'time_on_page_30s',
  TIME_ON_PAGE_1MIN: 'time_on_page_1min',
  TIME_ON_PAGE_2MIN: 'time_on_page_2min',
} as const;

export type AnalyticsEvent = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];


