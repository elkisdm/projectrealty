# Flujo de Visitas del Calendario

## Resumen
Interfaz completa para agendar visitas a propiedades con integración de calendarios externos y cotización automática.

## Componentes Principales

### `CalendarVisitFlow` (Cliente)
Componente principal que orquesta todo el flujo de visitas.

```tsx
import CalendarVisitFlow from '@/components/calendar/CalendarVisitFlow';

// Uso básico con datos mock
<CalendarVisitFlow
  building={building}
  unit={unit}
  date="2024-01-15"
/>

// Uso con calendarios externos
<CalendarVisitFlow
  building={building}
  unit={unit}
  date="2024-01-15"
  googleCalendarId="tu-cal@dominio.com"
  icsUrl="https://ejemplo.com/calendario.ics"
/>
```

### `VisitPanel` (RSC)
Panel informativo de la visita con datos de la propiedad y unidad.

```tsx
import VisitPanel from '@/components/calendar/VisitPanel';

<VisitPanel
  propertyTitle="Edificio Premium Las Condes"
  unitLabel="A-101 · 2D1B"
  address="Av. Apoquindo 1234, Las Condes"
  visitDate="2024-01-15"
  visitHour="14:00"
  onQuoteHref="#"
/>
```

### `VisitQuoteModal` (Cliente)
Modal para cotización con selector de unidad.

```tsx
import VisitQuoteModal from '@/components/calendar/VisitQuoteModal';

<VisitQuoteModal
  building={building}
  unit={unit}
  open={isOpen}
  onClose={() => setIsOpen(false)}
  initialStartDate="2024-01-15"
/>
```

## API Endpoint

### `POST /api/calendar/availability`
Obtiene disponibilidad combinando calendarios externos e internos.

**Rate Limit:** 20 requests/60s por IP

**Body:**
```json
{
  "date": "2024-01-15",
  "visibleHours": { "start": "09:00", "end": "18:00" },
  "googleCalendarId": "tu-cal@dominio.com",
  "icsUrl": "https://ejemplo.com/calendario.ics",
  "internalBlocks": [
    {
      "id": "block-1",
      "title": "Mantenimiento",
      "start": "2024-01-15T10:00:00Z",
      "end": "2024-01-15T11:00:00Z",
      "busy": true
    }
  ]
}
```

**Response:**
```json
{
  "date": "2024-01-15",
  "slots": [
    {
      "start": "2024-01-15T09:00:00Z",
      "end": "2024-01-15T10:00:00Z",
      "available": true
    },
    {
      "start": "2024-01-15T10:00:00Z", 
      "end": "2024-01-15T11:00:00Z",
      "available": false
    }
  ]
}
```

## Flujo de Usuario

1. **Carga inicial:** Se muestran los datos de la propiedad y unidad
2. **Fetch disponibilidad:** Se cargan slots desde API o datos mock
3. **Selección de horario:** Usuario selecciona slot disponible
4. **Modal de cotización:** Se abre con fecha pre-llenada
5. **Selector de unidad:** Usuario puede cambiar a otra unidad
6. **Cotización:** Se genera con lógica existente de `PropertyQuotationPanel`

## Datos de Prueba

### Página de Test
Visita `/test-calendar` para probar la interfaz completa con datos mock.

### Slots de Prueba
```typescript
const MOCK_SLOTS = [
  { start: '2024-01-15T09:00:00Z', end: '2024-01-15T10:00:00Z', available: true },
  { start: '2024-01-15T10:00:00Z', end: '2024-01-15T11:00:00Z', available: false },
  { start: '2024-01-15T11:00:00Z', end: '2024-01-15T12:00:00Z', available: true },
  // ... más slots
];
```

### Building Mock
```typescript
const MOCK_BUILDING = {
  id: 'test-building-1',
  name: 'Edificio Premium Las Condes',
  address: {
    street: 'Av. Apoquindo 1234',
    commune: 'Las Condes',
    // ... más datos
  },
  units: [
    {
      id: 'A-101',
      tipologia: '2D1B',
      superficie: 65,
      precio: 850000,
      // ... más datos
    }
  ]
};
```

## Características

### ✅ Implementado
- [x] Mobile-first design con Tailwind
- [x] Integración Google Calendar API
- [x] Parser ICS lightweight
- [x] Rate limiting en API
- [x] A11y completo (ARIA, focus, screen readers)
- [x] Dark mode support
- [x] Loading states y error handling
- [x] Reutilización lógica cotización existente
- [x] Selector de unidad en modal
- [x] Prefill fecha de visita
- [x] Tests de humo
- [x] Datos de prueba completos

### 🔧 Configuración
- **Google Calendar:** Requiere `GOOGLE_API_KEY` en prod
- **ICS:** URLs públicas o con auth en headers
- **Rate Limit:** 20 requests/60s por IP
- **Timezones:** UTC por defecto

### 🎨 Estilos
- Gradientes premium con violeta
- Sombras suaves y backdrop-blur
- Bordes redondeados (rounded-2xl)
- Transiciones suaves con motion-reduce
- Focus rings accesibles

### ♿ A11y
- ARIA labels y descriptions
- Roles semánticos (group, list, listitem)
- Focus management
- Screen reader support
- Prefers-reduced-motion

## Uso en Producción

```tsx
// En página de propiedad
<CalendarVisitFlow
  building={property}
  unit={selectedUnit}
  date={selectedDate}
  googleCalendarId={process.env.NEXT_PUBLIC_GOOGLE_CAL_ID}
  icsUrl={process.env.NEXT_PUBLIC_ICS_URL}
/>
```

## Troubleshooting

### Google Calendar no carga
- Verificar `GOOGLE_API_KEY` en env
- En dev, se mockea si no hay key
- En prod, error claro si falta

### ICS no parsea
- Verificar URL es accesible
- Formato debe ser VEVENT válido
- Fallback a lista vacía

### Rate limit
- 429 si excedes 20 requests/60s
- Implementar retry con backoff
- Cache local para slots frecuentes
