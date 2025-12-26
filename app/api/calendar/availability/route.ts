import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter } from '@/lib/rate-limit';
import { buildAvailability } from '@/lib/calendar/availability';
import { fetchGoogleBusy } from '@/lib/calendar/google';
import { fetchIcsEvents } from '@/lib/calendar/ics';
import type { CalendarEvent, TimeRange } from '@/types/calendar';
import { asIsoDate } from '@/types/calendar';

const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });

const BodySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  visibleHours: z.object({ start: z.string(), end: z.string() }).optional(),
  googleCalendarId: z.string().min(1).optional(),
  icsUrl: z.string().url().optional(),
  internalBlocks: z.array(z.object({
    id: z.string(),
    title: z.string(),
    start: z.string(),
    end: z.string(),
    busy: z.boolean().optional(),
  })).optional()
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'ip:unknown';
  const rate = await limiter.check(ip);
  if (!rate.ok) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429, headers: { 'Retry-After': String(rate.retryAfter ?? 60) } });
  }

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  try {
    const visibleHours: TimeRange = body.visibleHours ?? { start: '08:00', end: '20:00' };

    const [googleEvents, icsEvents] = (await Promise.all([
      body.googleCalendarId ? fetchGoogleBusy({ calendarId: body.googleCalendarId, dateIso: body.date }) : Promise.resolve([]),
      body.icsUrl ? fetchIcsEvents(body.icsUrl) : Promise.resolve([])
    ])) as [CalendarEvent[], CalendarEvent[]];

    const internal = (body.internalBlocks ?? []).map((b) => ({
      id: b.id,
      title: b.title,
      start: b.start,
      end: b.end,
      busy: b.busy ?? true,
    })) as CalendarEvent[];

    const slots = buildAvailability(asIsoDate(body.date), visibleHours, {
      externalEvents: [...googleEvents, ...icsEvents],
      internalBlocks: internal,
    }, 60);

    return NextResponse.json({ date: body.date, slots }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
