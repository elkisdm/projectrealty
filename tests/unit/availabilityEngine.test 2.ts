import { buildAvailability } from '@/lib/calendar/availability';
import type { CalendarEvent } from '@/types/calendar';

describe('buildAvailability', () => {
  it('marca bloqueos internos como no disponibles', () => {
    const date = '2025-01-01';
    const visibleHours = { start: '09:00', end: '11:00' };
    const internal: CalendarEvent[] = [
      {
        id: '1',
        title: 'Visita programada',
        start: '2025-01-01T09:00:00.000Z',
        end: '2025-01-01T10:00:00.000Z',
        busy: true,
      } as CalendarEvent,
    ];

    const slots = buildAvailability(date as any, visibleHours, { externalEvents: [], internalBlocks: internal }, 60);
    expect(slots.length).toBeGreaterThan(0);
    const first = slots[0];
    expect(first.available).toBe(false);
  });
});
