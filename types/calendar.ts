export type Uuid = string & { _brand: 'uuid' };

export type IsoDateTime = string & { _brand: 'isoDateTime' };
export type IsoDate = string & { _brand: 'isoDate' };

export type CalendarSource = 
  | { kind: 'google'; calendarId: string }
  | { kind: 'ics'; url: string }
  | { kind: 'internal'; id: string };

export type CalendarEvent = {
  id: string;
  title: string;
  start: IsoDateTime;
  end: IsoDateTime;
  busy: boolean;
  source: CalendarSource;
  description?: string;
  location?: string;
};

export type TimeRange = {
  start: string; // HH:mm
  end: string;   // HH:mm
};

export type AvailabilitySlot = {
  start: IsoDateTime;
  end: IsoDateTime;
  available: boolean;
};

export type NormalizedCalendar = {
  date: IsoDate;
  slots: AvailabilitySlot[];
};

// Nuevos tipos para vista semanal
export type WeekViewProps = {
  startDate: IsoDate; // Lunes de la semana
  googleCalendarId?: string;
  icsUrl?: string;
  internalBlocks?: InternalBlock[];
  visits?: VisitEvent[];
  className?: string;
};

export type InternalBlock = {
  id: string;
  title: string;
  start: IsoDateTime;
  end: IsoDateTime;
  busy?: boolean;
  type: 'maintenance' | 'meeting' | 'lunch' | 'other';
  description?: string;
};

export type VisitEvent = {
  id: Uuid;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  propertyId: string;
  propertyName: string;
  unitId: string;
  unitLabel: string;
  address: string;
  start: IsoDateTime;
  end: IsoDateTime;
  status: 'confirmed' | 'pending' | 'cancelled';
  notes?: string;
  createdAt: IsoDateTime;
};

export type CalendarEventType = 
  | { type: 'visit'; data: VisitEvent }
  | { type: 'external-block'; data: CalendarEvent }
  | { type: 'internal-block'; data: InternalBlock };

export type WeekDay = {
  date: IsoDate;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  events: CalendarEventType[];
};

export type WeekViewData = {
  weekStart: IsoDate;
  days: WeekDay[];
  timeSlots: string[]; // ["08:00", "09:00", ...]
};

// Props para componentes
export type MobileSchedulerProps = {
  date: IsoDate;
  events?: CalendarEvent[];
  className?: string;
};

// Helper functions para branded types
/**
 * Convierte un string a Uuid (branded type)
 */
export const asUuid = (s: string): Uuid => s as Uuid;

/**
 * Convierte un string a IsoDateTime (branded type)
 */
export const asIsoDateTime = (s: string): IsoDateTime => s as IsoDateTime;

/**
 * Convierte un string a IsoDate (branded type)
 */
export const asIsoDate = (s: string): IsoDate => s as IsoDate;
