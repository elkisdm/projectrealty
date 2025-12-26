import { AvailabilitySlot, CalendarEvent, IsoDate, TimeRange } from "@/types/calendar";
import { normalizeEventsToDaySlots, mergeInternalBlocks } from "./normalizers";

export type ExternalCalendars = {
  externalEvents: CalendarEvent[]; // Google/ICS, marcados busy=true por defecto
  internalBlocks?: CalendarEvent[]; // bloqueos internos (visitas, buffers, mantenimiento)
};

export function buildAvailability(
  date: IsoDate,
  visibleHours: TimeRange,
  input: ExternalCalendars,
  slotMinutes = 60
): AvailabilitySlot[] {
  const external = input.externalEvents ?? [];
  const internal = input.internalBlocks ?? [];

  // 1) Slots base a partir de eventos externos (free/busy)
  const base = normalizeEventsToDaySlots(date, external, visibleHours, slotMinutes);

  // 2) Aplicar bloqueos internos
  const withInternal = mergeInternalBlocks(base, internal);

  // 3) Orden y merge trivial de adyacentes con mismo estado (opcional)
  return mergeAdjacent(withInternal);
}

function mergeAdjacent(slots: AvailabilitySlot[]): AvailabilitySlot[] {
  if (slots.length === 0) return slots;
  const out: AvailabilitySlot[] = [];
  let acc = { ...slots[0] };
  for (let i = 1; i < slots.length; i++) {
    const cur = slots[i];
    if (cur.available === acc.available) {
      acc.end = cur.end;
      continue;
    }
    out.push(acc);
    acc = { ...cur };
  }
  out.push(acc);
  return out;
}
