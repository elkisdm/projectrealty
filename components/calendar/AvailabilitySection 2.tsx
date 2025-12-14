import type { CalendarEvent, TimeRange } from "@/types/calendar";
import { buildAvailability } from "@/lib/calendar/availability";
import SlotPicker from "./SlotPicker";

export type AvailabilitySectionProps = {
  date: string;
  visibleHours?: TimeRange;
  googleCalendarId?: string;
  icsUrl?: string;
  internalBlocks?: CalendarEvent[];
};

export default async function AvailabilitySection({
  date,
  visibleHours = { start: '08:00', end: '20:00' },
  // googleCalendarId,
  // icsUrl,
  internalBlocks = []
}: AvailabilitySectionProps) {
  // Por ahora no consultamos Google/ICS en SSR; usaremos el motor con fuentes vacías.
  const slots = buildAvailability(date as any, visibleHours, {
    externalEvents: [],
    internalBlocks,
  }, 60);

  return (
    <SlotPicker slots={slots} />
  );
}
