// Analytics V3 - Sistema mejorado para tracking de eventos
interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
  sessionId?: string;
}

interface VisitSchedulerEvent {
  propertyId: string;
  propertyName: string;
  step: 'date_selection' | 'time_selection' | 'confirmation' | 'cancellation';
  date?: string;
  time?: string;
  quickSlot?: boolean;
  source?: 'cta_bar' | 'cta_sidebar' | 'modal';
}

interface PropertyViewEvent {
  propertyId: string;
  propertyName: string;
  commune: string;
  unitId?: string;
  unitType?: string;
  price?: number;
  source?: 'search' | 'related' | 'direct' | 'social';
  sessionDuration?: number;
}

interface CTAClickEvent {
  propertyId: string;
  propertyName: string;
  ctaType: 'book_visit' | 'whatsapp' | 'phone' | 'email';
  location: 'sticky_bar' | 'sticky_sidebar' | 'property_card' | 'modal';
  price?: number;
}

interface LeadFormEvent {
  propertyId: string;
  propertyName: string;
  step: 'name_completed' | 'email_completed' | 'form_completed';
  field?: string;
  date?: string;
  time?: string;
  hasName?: boolean;
  hasEmail?: boolean;
  hasPhone?: boolean;
}

interface VisitFunnelEvent {
  propertyId: string;
  propertyName: string;
  step: 'view_property' | 'click_schedule' | 'slot_selected' | 'lead_submitted' | 'visit_confirmed' | 'showed_up' | 'offer_made';
  date?: string;
  time?: string;
  conversionValue?: number;
}

class AnalyticsV3 {
  private sessionId: string;
  private sessionStart: number;
  private events: AnalyticsEvent[] = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStart = Date.now();
    this.initializeSession();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeSession(): void {
    // Track session start
    this.track('session_start', {
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  }

  private track(event: string, properties?: Record<string, unknown>): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        timestamp: Date.now()
      },
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.events.push(analyticsEvent);

    // Send to analytics service (in production, this would be Google Analytics, Mixpanel, etc.)
    this.sendToAnalytics(analyticsEvent);

    // Console log for development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', analyticsEvent);
    }
  }

  private sendToAnalytics(event: AnalyticsEvent): void {
    // In production, this would send to your analytics service
    // For now, we'll just store in localStorage for debugging
    try {
      const existingEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      existingEvents.push(event);
      localStorage.setItem('analytics_events', JSON.stringify(existingEvents.slice(-100))); // Keep last 100 events
    } catch (error) {
      console.error('Error storing analytics event:', error);
    }
  }

  // Property View Tracking
  trackPropertyView(data: PropertyViewEvent): void {
    this.track('property_view_v3', {
      ...data,
      sessionDuration: Date.now() - this.sessionStart
    });
  }

  // Visit Scheduler Tracking
  trackVisitSchedulerStep(data: VisitSchedulerEvent): void {
    this.track('visit_scheduler_step', data as unknown as Record<string, unknown>);
  }

  trackVisitSchedulerQuickSlot(data: Omit<VisitSchedulerEvent, 'step'> & { quickSlot: true; days: number }): void {
    this.track('visit_scheduler_quick_slot', data as unknown as Record<string, unknown>);
  }

  trackVisitSchedulerConfirmation(data: Omit<VisitSchedulerEvent, 'step'> & { step: 'confirmation' }): void {
    this.track('visit_scheduler_confirmation', data as unknown as Record<string, unknown>);
  }

  trackVisitSchedulerCancellation(data: Omit<VisitSchedulerEvent, 'step'> & { step: 'cancellation'; reason?: string }): void {
    this.track('visit_scheduler_cancellation', data as unknown as Record<string, unknown>);
  }

  // CTA Tracking
  trackCTAClick(data: CTAClickEvent): void {
    this.track('cta_click_v3', data as unknown as Record<string, unknown>);
  }

  // Lead Form Tracking
  trackLeadFormProgress(data: LeadFormEvent): void {
    this.track('lead_form_progress', data as unknown as Record<string, unknown>);
  }

  trackLeadFormCompleted(data: LeadFormEvent): void {
    this.track('lead_form_completed', data as unknown as Record<string, unknown>);
  }

  // Visit Funnel Tracking
  trackVisitFunnel(data: VisitFunnelEvent): void {
    this.track('visit_funnel', data as unknown as Record<string, unknown>);
  }

  // Component Interaction Tracking
  trackComponentInteraction(component: string, action: string, properties?: Record<string, any>): void {
    this.track('component_interaction', {
      component,
      action,
      ...properties
    });
  }

  // Performance Tracking
  trackPerformance(metric: string, value: number, properties?: Record<string, any>): void {
    this.track('performance_metric', {
      metric,
      value,
      ...properties
    });
  }

  // Error Tracking
  trackError(error: Error, context?: Record<string, any>): void {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      ...context
    });
  }

  // Session End
  trackSessionEnd(): void {
    const sessionDuration = Date.now() - this.sessionStart;
    this.track('session_end', {
      sessionId: this.sessionId,
      duration: sessionDuration,
      totalEvents: this.events.length
    });
  }

  // Get Analytics Data (for debugging)
  getAnalyticsData(): AnalyticsEvent[] {
    return this.events;
  }

  // Export Analytics Data
  exportAnalyticsData(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      sessionStart: this.sessionStart,
      events: this.events
    }, null, 2);
  }
}

// Create singleton instance
const analyticsV3 = new AnalyticsV3();

// Track session end on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    analyticsV3.trackSessionEnd();
  });
}

export default analyticsV3;

// Convenience functions for common tracking patterns
export const trackPropertyView = (data: PropertyViewEvent) => analyticsV3.trackPropertyView(data);
export const trackVisitSchedulerStep = (data: VisitSchedulerEvent) => analyticsV3.trackVisitSchedulerStep(data);
export const trackVisitSchedulerQuickSlot = (data: Omit<VisitSchedulerEvent, 'step'> & { quickSlot: true; days: number }) => 
  analyticsV3.trackVisitSchedulerQuickSlot(data);
export const trackVisitSchedulerConfirmation = (data: Omit<VisitSchedulerEvent, 'step'> & { step: 'confirmation' }) => 
  analyticsV3.trackVisitSchedulerConfirmation(data);
export const trackCTAClick = (data: CTAClickEvent) => analyticsV3.trackCTAClick(data);
export const trackLeadFormProgress = (data: LeadFormEvent) => analyticsV3.trackLeadFormProgress(data);
export const trackLeadFormCompleted = (data: LeadFormEvent) => analyticsV3.trackLeadFormCompleted(data);
export const trackVisitFunnel = (data: VisitFunnelEvent) => analyticsV3.trackVisitFunnel(data);
export const trackComponentInteraction = (component: string, action: string, properties?: Record<string, unknown>) => 
  analyticsV3.trackComponentInteraction(component, action, properties);
export const trackPerformance = (metric: string, value: number, properties?: Record<string, unknown>) => 
  analyticsV3.trackPerformance(metric, value, properties);
export const trackError = (error: Error, context?: Record<string, unknown>) => analyticsV3.trackError(error, context);

export type { AnalyticsEvent, VisitSchedulerEvent, PropertyViewEvent, CTAClickEvent, LeadFormEvent, VisitFunnelEvent };
