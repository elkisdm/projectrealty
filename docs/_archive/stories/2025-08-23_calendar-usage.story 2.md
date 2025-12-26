## Calendario de agendamiento — Uso básico

### Componentes incluidos
- **MobileScheduler (RSC)**: contenedor mobile-first con grilla por horas y disponibilidad.
- **AvailabilitySection (RSC)**: calcula slots mediante el motor y renderiza `SlotPicker`.
- **SlotPicker (client)**: lista accesible de slots seleccionables.

### Importación
```tsx
import { MobileScheduler, AvailabilitySection, SlotPicker } from '@/components/calendar';
```

### Ejemplo 1: Uso mínimo (RSC)
```tsx
import { MobileScheduler } from '@/components/calendar';

export default function Page() {
  const today = new Date().toISOString().slice(0,10); // YYYY-MM-DD
  return (
    <MobileScheduler
      date={today}
      headerTitle="Agenda tu visita"
    />
  );
}
```

### Ejemplo 2: SSR con `AvailabilitySection` y horario personalizado
```tsx
import { AvailabilitySection } from '@/components/calendar';
import type { CalendarEvent } from '@/types/calendar';

export default function Page() {
  const date = '2025-01-01';
  const internalBlocks: CalendarEvent[] = [
    {
      id: 'blk-1',
      title: 'Visita ocupada',
      start: '2025-01-01T09:00:00.000Z',
      end: '2025-01-01T10:00:00.000Z',
      busy: true,
    },
  ];

  return (
    <AvailabilitySection
      date={date}
      visibleHours={{ start: '09:00', end: '18:00' }}
      internalBlocks={internalBlocks}
    />
  );
}
```

### Ejemplo 3: `SlotPicker` (client) con `onSelect`
```tsx
'use client';
import { SlotPicker } from '@/components/calendar';
import type { AvailabilitySlot } from '@/types/calendar';

export default function ClientSlotExample({ slots }: { slots: AvailabilitySlot[] }){
  function handleSelect(slot: AvailabilitySlot){
    // TODO: abrir modal de confirmación o POST a API de reservas
    console.log('Seleccionado', slot);
  }
  return <SlotPicker slots={slots} onSelect={handleSelect} />;
}
```

### Endpoint API: `/api/calendar/availability`
- Método: `POST`
- Rate-limit: 20 solicitudes/60s por IP
- Respuestas: 200/400/429/500 (sin PII)

Body de ejemplo:
```json
{
  "date": "2025-01-01",
  "visibleHours": { "start": "09:00", "end": "18:00" },
  "googleCalendarId": "calendario@tu-dominio.com",
  "icsUrl": "https://ejemplo.com/mi.ics",
  "internalBlocks": [
    { "id": "blk-1", "title": "Mantención", "start": "2025-01-01T14:00:00.000Z", "end": "2025-01-01T15:00:00.000Z", "busy": true }
  ]
}
```

Respuesta 200 (fragmento):
```json
{
  "date": "2025-01-01",
  "slots": [
    { "start": "2025-01-01T09:00:00.000Z", "end": "2025-01-01T10:00:00.000Z", "available": false, "reason": "blocked_internal" },
    { "start": "2025-01-01T10:00:00.000Z", "end": "2025-01-01T11:00:00.000Z", "available": true, "reason": "open" }
  ]
}
```

### Props rápidas
- **MobileScheduler**
  - `date: string` (YYYY-MM-DD)
  - `events?: CalendarEvent[]` (opcional, para pintar eventos en la grilla)
  - `visibleHours?: { start: string; end: string }` (por defecto 08:00–20:00)
  - `headerTitle?: string`

- **AvailabilitySection**
  - `date: string`
  - `visibleHours?: { start: string; end: string }`
  - `googleCalendarId?: string`
  - `icsUrl?: string`
  - `internalBlocks?: CalendarEvent[]`

- **SlotPicker (client)**
  - `slots: AvailabilitySlot[]`
  - `onSelect?: (slot) => void`

### A11y y rendimiento
- Respeta `prefers-reduced-motion`.
- Focus visibles con `focus-visible` y `ring-offset`.
- Mobile-first; dark mode soportado.

### Notas
- En `NODE_ENV !== 'production'`, Google/ICS se mockean por defecto.
- Para producción, configure `GOOGLE_API_KEY` o `GOOGLE_APPLICATION_CREDENTIALS` antes de integrar Google.
