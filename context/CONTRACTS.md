> Last updated: 2026-02-06
> NOTA: Este archivo debe ser validado en WP1 (Discovery) de cada feature

# Contracts - Source of Truth

Este archivo documenta todos los tipos, schemas Zod y contratos de API del proyecto. Antes de crear nuevos tipos o endpoints, validar que no existan aquí.

---

## 1. Schemas Zod (Source of Truth)

### Ubicación: `schemas/models.ts`

#### UnitSchema
```typescript
// Unidad de arriendo
{
  id: string;
  slug: string;
  tipologia: "studio" | "1D1B" | "2D1B" | "2D2B" | "3D2B" | "3D3B" | "4D+";
  price: number;
  price_clp?: number;
  currency: "UF" | "CLP";
  dormitorios: number;
  banos: number;
  m2_total: number;
  m2_terraza?: number;
  piso?: number;
  orientacion?: "N" | "S" | "E" | "O" | "NE" | "NO" | "SE" | "SO";
  disponible: boolean;
  disponible_desde?: string; // ISO date
  images: string[];
  tour_360_url?: string;
  video_url?: string;
  plano_url?: string;
  gastos_comunes?: number;
  promo?: PromotionBadge;
}
```

#### BuildingSchema
```typescript
// Edificio con unidades
{
  id: string;
  slug: string;
  name: string;
  address: string;
  comuna: string;
  region: string;
  lat?: number;
  lng?: number;
  year_built?: number;
  floors?: number;
  total_units?: number;
  amenities: string[];
  gallery: Media[];
  hero_image?: string;
  description?: string;
  pet_friendly: boolean;
  transit?: Transit[];
  units: Unit[];
  provider?: "assetplan" | "tremendo" | "manual";
}
```

#### PromotionBadgeSchema
```typescript
{
  type: "descuento" | "meses_gratis" | "sin_comision" | "oferta_flash" | "nuevo";
  label: string;
  value?: number;
  expires_at?: string; // ISO date
}
```

#### MediaSchema
```typescript
{
  type: "image" | "tour_360" | "video" | "map";
  url: string;
  alt?: string;
  order?: number;
}
```

#### NearbyAmenitySchema
```typescript
// Amenidad cercana a un edificio
{
  id: string; // UUID
  buildingId: string;
  category: "transporte" | "educacion" | "areas_verdes" | "comercios" | "salud";
  subcategory?: string; // ej: 'metro', 'paraderos', 'jardines_infantiles', 'colegios', 'universidades', 'plazas', 'farmacias', 'clinicas'
  name: string;
  walkingTimeMinutes: number; // >= 0
  distanceMeters: number; // >= 0
  icon?: string; // nombre del icono de lucide-react
  metadata?: Record<string, unknown>; // datos adicionales
  displayOrder: number; // >= 0, default 0
}
```

### Ubicación: `schemas/quotation.ts`

#### QuotationInputSchema
```typescript
{
  unitId: string;
  startDate: string; // YYYY-MM-DD
  options?: {
    includeParking?: boolean;
    includeStorage?: boolean;
    petDeposit?: boolean;
  };
}
```

#### QuotationResultSchema
```typescript
{
  meta: { unitId, buildingName, startDate, generatedAt };
  lines: Array<{ concept, amount, currency }>;
  totals: { monthly, moveIn, deposit };
  flags: { hasPromotion, promotionType? };
}
```

### Ubicación: `schemas/review.ts`

#### ReviewSchema
```typescript
{
  id: string;
  author: { name, avatar?, verified };
  rating: 1-5;
  title?: string;
  content: string;
  date: string; // ISO date
  images?: ReviewImage[];
  helpful_count?: number;
  vendor_response?: VendorResponse;
}
```

### Ubicación: `lib/validations/visit.ts`

#### visitFormSchema
```typescript
{
  name: string; // min 2, max 100
  email?: string; // valid email
  phone: string; // Chilean format +56XXXXXXXXX
}
```

### Ubicación: `lib/validations/search.ts`

#### searchFormSchema
```typescript
{
  comuna?: string;
  tipologia?: string;
  dormitorios?: number; // 0-5
  precioMin?: number;
  precioMax?: number;
  servicios?: boolean; // incluye gastos comunes
}
```

---

## 2. Tipos de Dominio

### Ubicación: `types/visit.ts`

```typescript
// Visita agendada
interface Visit {
  id: string;
  listingId: string;
  userId: string;
  slotId: string;
  status: "pending" | "confirmed" | "completed" | "canceled";
  channel: "whatsapp" | "web";
  idempotencyKey: string;
  createdAt: string;
  agent?: Agent;
}

// Slot de visita
interface VisitSlot {
  id: string;
  startTime: string; // RFC 3339
  endTime: string;
  available: boolean;
}

// Propiedad listada
interface Listing {
  id: string;
  timezone: string;
  status: "active" | "paused" | "archived";
}

// Agente inmobiliario
interface Agent {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
}

// Usuario
interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}
```

### Ubicación: `types/calendar.ts`

```typescript
// Tipos branded para type-safety
type Uuid = string & { readonly __brand: "Uuid" };
type IsoDateTime = string & { readonly __brand: "IsoDateTime" };
type IsoDate = string & { readonly __brand: "IsoDate" };

// Evento de calendario
interface CalendarEvent {
  id: Uuid;
  title: string;
  start: IsoDateTime;
  end: IsoDateTime;
  source: "google" | "ics" | "internal";
  allDay?: boolean;
}
```

### Ubicación: `types/filters.ts`

```typescript
interface FilterValues {
  comuna?: string;
  tipologia?: string;
  dormitorios?: number;
  precioMin?: number;
  precioMax?: number;
  servicios?: boolean;
}

interface AdvancedFilterValues extends FilterValues {
  search?: string;
  amenities?: string[];
  m2Min?: number;
  m2Max?: number;
  bathrooms?: number;
  hasPromotion?: boolean;
}
```

### Ubicación: `types/buildings.ts`

```typescript
interface BuildingsState {
  buildings: Building[];
  filters: BuildingFilters;
  page: number;
  limit: number;
  total: number;
  isLoading: boolean;
  error?: string;
}

interface BuildingFilters {
  comuna?: string;
  precioMin?: number;
  precioMax?: number;
  m2Min?: number;
  m2Max?: number;
  amenities?: string[];
  tipologia?: string;
}
```

---

## 3. Contratos de API

### Patron de Respuesta Estandar

```typescript
// Exito simple
{ success: true, message?: string }

// Exito con data
{ success: true, data: T }

// Exito con paginacion
{ 
  success: true, 
  data: T[], 
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }
}

// Error
{ 
  error: string; // "validation_error" | "not_found" | "rate_limited" | "internal_error"
  message?: string;
  details?: ZodError[];
}
```

### Rate Limiting Default

- Endpoints publicos: 20 req/60s por IP
- Endpoints sensibles (booking, visits): 10 req/60s
- Admin login: 5 req/60s
- Buildings publico: 60 req/60s

---

### 3.1 Admin Endpoints

#### POST /api/admin/auth/login
```typescript
Request: { email: string; password: string }
Response: { success: true, user: { id, email, role } }
Errors: 401 (invalid_credentials), 429 (rate_limited)
Rate: 5/min
```

#### POST /api/admin/auth/logout
```typescript
Response: { success: true }
```

#### GET /api/admin/auth/session
```typescript
Response: { authenticated: boolean, user?: { id, email, role } }
```

#### GET /api/admin/buildings
```typescript
Query: { page?, limit?, search?, comuna? }
Response: { success: true, data: Building[], pagination }
Rate: 20/min
```

#### POST /api/admin/buildings
```typescript
Request: BuildingSchema
Response: { success: true, data: Building }
Status: 201
```

#### GET /api/admin/buildings/[id]
```typescript
Response: { success: true, data: Building }
Errors: 404 (not_found)
```

#### GET /api/admin/units
```typescript
Query: { page?, limit?, search?, buildingId?, tipologia?, disponible?, minPrice?, maxPrice? }
Response: { success: true, data: Unit[], pagination }
```

#### POST /api/admin/units
```typescript
Request: { buildingId: string, ...UnitSchema }
Response: { success: true, data: Unit }
Status: 201
```

#### PUT /api/admin/units/[id]
```typescript
Request: Partial<UnitSchema>
Response: { success: true, data: Unit }
```

#### DELETE /api/admin/units/[id]
```typescript
Response: { success: true, message: string }
```

---

### 3.2 Public Endpoints

#### GET /api/buildings
```typescript
Query: { q?, comuna?, precioMin?, precioMax?, dormitorios?, page?, limit? }
Response: { units: Unit[], total: number, hasMore: boolean, page, limit }
Rate: 60/min
```

#### GET /api/buildings/[slug]
```typescript
Response: { unit: Unit, building: Building, similarUnits?: Unit[] }
Errors: 404
```

#### GET /api/buildings/paginated
```typescript
Query: { comuna?, tipologia?, minPrice?, maxPrice?, page?, limit?, cursor? }
Response: { buildings: BuildingListItem[], pagination }
Rate: 20/min
```

---

### 3.3 Visits & Availability

#### GET /api/availability
```typescript
Query: { listingId: string, start: string (RFC3339), end: string (RFC3339) }
Response: { listingId, timezone, slots: VisitSlot[], nextAvailableDate? }
Rate: 20/min
```

#### POST /api/visits
```typescript
Headers: { "Idempotency-Key": string }
Request: { listingId, slotId, userId, channel?, idempotencyKey }
Response: { visitId, status, agent, slot, confirmationMessage }
Status: 201
Errors: 409 (SLOT_UNAVAILABLE)
Rate: 10/min
```

#### GET /api/visits
```typescript
Query: { userId: string }
Response: { upcoming: Visit[], past: Visit[], canceled: Visit[] }
```

#### POST /api/calendar/availability
```typescript
Request: { date: string (YYYY-MM-DD), visibleHours?, googleCalendarId?, icsUrl?, internalBlocks? }
Response: { date, slots: CalendarSlot[] }
Rate: 20/min
```

---

### 3.4 Booking & Waitlist

#### POST /api/booking
```typescript
Request: BookingRequestSchema
Response: { success: true, bookingId: string }
Status: 201
Rate: 10/min
```

#### POST /api/waitlist
```typescript
Request: { email, phone?, name?, contactMethod?, source? }
Response: { success: true, message? }
Rate: 20/min
```

#### POST /api/availability-notifications
```typescript
Request: { email, phone?, name?, unitId? }
Response: { success: true, message? }
Rate: 20/min
```

---

### 3.5 Quotations

#### POST /api/quotations
```typescript
Request: QuotationInputSchema
Response: QuotationResult
Errors: 404 (Unit not found)
Rate: 10/min
```

---

### 3.6 Analytics

#### POST /api/analytics/conversion
```typescript
Request: { eventName, properties, timestamp, sessionId? }
Response: { success: true, eventId, timestamp }
Rate: 20/min
```

#### POST /api/analytics/performance
```typescript
Request: { name, value, rating: "good"|"needs-improvement"|"poor", timestamp, page_url? }
Response: { success: true, metric, rating, timestamp }
Rate: 20/min
```

---

### 3.7 Other Endpoints

#### GET /api/landing/featured
```typescript
Response: { buildings: FeaturedBuildingItem[], count, meta }
Rate: 20/min
```

#### POST /api/investment
```typescript
Request: { name, email, phone?, message?, source? }
Response: { success: true, message? }
Rate: 20/min
```

#### GET /api/flash-videos/cupos
```typescript
Response: { cuposDisponibles, total, porcentaje, timestamp }
Rate: 20/min
```

---

## 4. Reglas de Validacion

### Telefono Chileno
```typescript
// Formato: +56XXXXXXXXX (9 digitos despues de +56)
const phoneRegex = /^\+56[2-9]\d{8}$/;
```

### Email
```typescript
// Validacion estandar de email
z.string().email()
```

### Precios
```typescript
// UF: 0-1000, CLP: 0-50000000
price: z.number().min(0).max(currency === "UF" ? 1000 : 50000000)
```

### Paginacion
```typescript
page: z.number().min(1).default(1)
limit: z.number().min(1).max(100).default(20)
```

---

## 5. Changelog

### 2026-01-25
- Documento inicial creado
- Schemas de `schemas/models.ts`, `schemas/quotation.ts`, `schemas/review.ts`
- Tipos de `types/visit.ts`, `types/calendar.ts`, `types/filters.ts`, `types/buildings.ts`
- 28 endpoints documentados (16 categorias)
- Patrones de respuesta estandarizados
- Reglas de validacion documentadas
