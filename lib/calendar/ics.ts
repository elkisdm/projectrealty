import { CalendarEvent, asIsoDateTime } from "@/types/calendar";

interface IcsEventParsing {
  uid?: string;
  summary?: string;
  dtstart: string;
  dtend: string;
}

export async function fetchIcsEvents(url: string): Promise<CalendarEvent[]> {
  if (process.env.NODE_ENV !== 'production' && !url) {
    return [];
  }
  if (!url) return [];
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const text = await res.text();
    return parseIcs(text).map((ev, idx) => ({
      id: ev.uid ?? String(idx),
      title: ev.summary ?? 'Ocupado',
      start: asIsoDateTime(toIso(ev.dtstart)),
      end: asIsoDateTime(toIso(ev.dtend)),
      busy: true,
      source: { kind: 'ics' as const, url }
    }));
  } catch {
    return [];
  }
}

function parseIcs(content: string): IcsEventParsing[] {
  const events: IcsEventParsing[] = [];
  const lines = content.split(/\r?\n/);
  let cur: Partial<IcsEventParsing> | null = null;
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') { cur = {}; continue; }
    if (line === 'END:VEVENT') { 
      if (cur?.dtstart && cur?.dtend) {
        events.push({
          uid: cur.uid,
          summary: cur.summary,
          dtstart: cur.dtstart,
          dtend: cur.dtend,
        });
      }
      cur = null; 
      continue; 
    }
    if (!cur) continue;
    if (line.startsWith('UID:')) cur.uid = line.slice(4).trim();
    if (line.startsWith('SUMMARY:')) cur.summary = line.slice(8).trim();
    if (line.startsWith('DTSTART')) cur.dtstart = line.split(':').pop()!.trim();
    if (line.startsWith('DTEND')) cur.dtend = line.split(':').pop()!.trim();
  }
  return events;
}

function toIso(value: string): string {
  // Soporta formatos como 20250101T090000Z o 20250101
  if (/Z$/.test(value)) {
    const y = value.slice(0,4); const m = value.slice(4,6); const d = value.slice(6,8);
    const t = value.slice(9,15);
    const hh = t.slice(0,2); const mm = t.slice(2,4); const ss = t.slice(4,6);
    return `${y}-${m}-${d}T${hh}:${mm}:${ss}Z`;
  }
  if (/^\d{8}$/.test(value)) {
    const y = value.slice(0,4); const m = value.slice(4,6); const d = value.slice(6,8);
    return `${y}-${m}-${d}T00:00:00Z`;
  }
  return new Date(value).toISOString();
}
