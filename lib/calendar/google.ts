import { CalendarEvent, asIsoDateTime } from "@/types/calendar";

export type GoogleFreeBusyInput = {
  calendarId: string;
  dateIso: string; // YYYY-MM-DD (local)
};

interface GoogleCalendarItem {
  id?: string;
  summary?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
}

export async function fetchGoogleBusy({ calendarId, dateIso }: GoogleFreeBusyInput): Promise<CalendarEvent[]> {
  if (process.env.NODE_ENV !== 'production' && !process.env.GOOGLE_API_KEY) {
    return [];
  }
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("Google Calendar no está configurado en el entorno");
  }
  // Limitar a un día: [00:00, 23:59:59] en UTC
  const timeMin = new Date(dateIso + 'T00:00:00Z').toISOString();
  const timeMax = new Date(dateIso + 'T23:59:59Z').toISOString();
  const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('singleEvents', 'true');
  url.searchParams.set('orderBy', 'startTime');
  url.searchParams.set('timeMin', timeMin);
  url.searchParams.set('timeMax', timeMax);

  const res = await fetch(url.toString());
  if (!res.ok) return [];
  const data = await res.json() as { items?: GoogleCalendarItem[] };
  const items = Array.isArray(data.items) ? data.items : [];
  const events: CalendarEvent[] = items
    .filter((it): it is GoogleCalendarItem => Boolean(it.start && it.end))
    .map((it) => ({
      id: String(it.id ?? `${it.start?.dateTime}-${it.end?.dateTime}`),
      title: String(it.summary ?? 'Ocupado'),
      start: asIsoDateTime(String(it.start?.dateTime ?? (it.start?.date ? it.start.date + 'T00:00:00Z' : ''))),
      end: asIsoDateTime(String(it.end?.dateTime ?? (it.end?.date ? it.end.date + 'T23:59:59Z' : ''))),
      busy: true,
      source: { kind: 'google' as const, calendarId },
    }));
  return events;
}
