// Tipos
export type {
  Uuid,
  IsoDateTime,
  IsoDate,
  CalendarSource,
  CalendarEvent,
  TimeRange,
  AvailabilitySlot,
  NormalizedCalendar,
  WeekViewProps,
  InternalBlock,
  VisitEvent,
  CalendarEventType,
  WeekDay,
  WeekViewData,
  MobileSchedulerProps
} from '@/types/calendar';

// Componentes principales
export { default as MobileScheduler } from './MobileScheduler';
export { default as SlotPicker } from './SlotPicker';
export { default as AvailabilitySection } from './AvailabilitySection';
export { default as VisitPanel } from './VisitPanel';
export { default as VisitQuoteModal } from './VisitQuoteModal';
export { default as CalendarVisitFlow } from './CalendarVisitFlow';

// Nuevos componentes de vista semanal
export { default as WeekView } from './WeekView';
export { default as VisitCard } from './VisitCard';
export { default as BlockEvent } from './BlockEvent';

// Utilidades
export { generateWeekView, formatWeekRange, getWeekStart } from '@/lib/calendar/week-view';
export { buildAvailability } from '@/lib/calendar/availability';
export { normalizeEventsToDaySlots, mergeInternalBlocks } from '@/lib/calendar/normalizers';
export { fetchGoogleBusy } from '@/lib/calendar/google';
export { fetchIcsEvents } from '@/lib/calendar/ics';
