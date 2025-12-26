import { CalendarEvent, AvailabilitySlot, IsoDate, IsoDateTime, TimeRange } from "@/types/calendar";

export function normalizeEventsToDaySlots(
  date: IsoDate,
  events: CalendarEvent[],
  visibleHours: TimeRange,
  slotMinutes: number = 60
): AvailabilitySlot[] {
  const dayStart = toDate(date, visibleHours.start);
  const dayEnd = toDate(date, visibleHours.end);

  const slots: AvailabilitySlot[] = [];
  let cursor = new Date(dayStart);
  while (cursor <= dayEnd) {
    const slotStart = new Date(cursor);
    const slotEnd = new Date(cursor);
    slotEnd.setMinutes(slotEnd.getMinutes() + slotMinutes);

    const isBlocked = events.some((ev) => overlaps(slotStart, slotEnd, new Date(ev.start), new Date(ev.end)) && ev.busy !== false);
    const reason = isBlocked ? 'blocked_external' : 'open';

    slots.push({
      start: slotStart.toISOString() as IsoDateTime,
      end: slotEnd.toISOString() as IsoDateTime,
      available: !isBlocked,
      // reason removed from AvailabilitySlot type
    });

    cursor = slotEnd;
  }
  return slots;
}

export function mergeInternalBlocks(slots: AvailabilitySlot[], internal: CalendarEvent[]): AvailabilitySlot[] {
  if (internal.length === 0) return slots;
  return slots.map((slot) => {
    const slotStart = new Date(slot.start);
    const slotEnd = new Date(slot.end);
    const blocked = internal.some((ev) => overlaps(slotStart, slotEnd, new Date(ev.start), new Date(ev.end)));
    if (!blocked) return slot;
    return {
      ...slot,
      available: false,
      reason: 'blocked_internal',
    };
  });
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return bEnd > aStart && bStart < aEnd;
}

function toDate(yyyyMmDd: string, hhmm: string): Date {
  const [y, m, d] = yyyyMmDd.split('-').map(Number);
  const [hh, mm] = hhmm.split(':').map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh, mm, 0));
}
