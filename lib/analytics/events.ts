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
  CTA_CLICK: 'cta_click', // Generic CTA click tracking
  
  // Pre-approval
  PRE_APPROVAL_START: 'pre_approval_start',
  PRE_APPROVAL_COMPLETE: 'pre_approval_complete',
  PRE_APPROVAL_ABANDON: 'pre_approval_abandon',
  
  // Conversions
  VISIT_SCHEDULED: 'visit_scheduled',
  VISIT_SCHEDULED_WHATSAPP_CLICK: 'visit_scheduled_whatsapp_click',
  FORM_SUBMITTED: 'form_submitted',
  
  // Visit Scheduler
  VISIT_SCHEDULER_OPENED: 'visit_scheduler_opened',
  VISIT_SCHEDULER_DATE_SELECTED: 'visit_scheduler_date_selected',
  VISIT_SCHEDULER_TIME_SELECTED: 'visit_scheduler_time_selected',
  VISIT_SCHEDULER_QUALIFICATION_ANSWERED: 'visit_scheduler_qualification_answered',
  VISIT_SCHEDULER_FIELD_STARTED: 'visit_scheduler_field_started',
  VISIT_SCHEDULER_FIELD_COMPLETED: 'visit_scheduler_field_completed',
  VISIT_SCHEDULER_ABANDONED: 'visit_scheduler_abandoned',
  VISIT_SCHEDULER_COMPLETED: 'visit_scheduler_completed',
  VISIT_SCHEDULER_ERROR: 'visit_scheduler_error',
  
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
  
  // Tree (Link-in-bio)
  TREE_VIEW: 'tree_view',
  TREE_CLICK_CTA: 'tree_click_cta',
  FORM_STEP_VIEW: 'form_step_view',
  FORM_STEP_COMPLETE: 'form_step_complete',
  FORM_ABANDON: 'form_abandon',
  TREE_FORM_SUBMIT: 'tree_form_submit',
  CTA_SCHEDULE_CLICK: 'cta_schedule_click',
} as const;

export type AnalyticsEvent = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];




