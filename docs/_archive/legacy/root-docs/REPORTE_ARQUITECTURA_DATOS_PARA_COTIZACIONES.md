# REPORTE ARQUITECTURA Y LÓGICA DE DATOS - HOMMIE 0% COMISIÓN

## RESUMEN EJECUTIVO

Este reporte documenta la arquitectura actual y lógica de datos del sistema Hommie 0% Comisión para facilitar la implementación de un sistema de cotizaciones automatizado. La plataforma es una aplicación Next.js 14 con TypeScript estricto que gestiona propiedades inmobiliarias sin comisiones.

## 1. ARQUITECTURA DEL SISTEMA

### 1.1 Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript estricto
- **Styling**: Tailwind CSS, Framer Motion
- **Validación**: Zod (server-side y client-side)
- **Base de Datos**: Supabase (PostgreSQL) + fallback a datos mock JSON
- **Estado**: Zustand + React Query (TanStack Query)
- **Gestión de paquetes**: pnpm

### 1.2 Estructura de Directorios Clave

```
├── app/
│   ├── api/                    # API Routes (REST endpoints)
│   │   ├── buildings/          # CRUD edificios
│   │   ├── booking/           # Sistema de reservas
│   │   └── waitlist/          # Lista de espera
│   ├── (catalog)/property/    # Páginas de detalle
│   └── (marketing)/landing/   # Landing principal
├── schemas/models.ts          # Esquemas Zod (fuente de verdad)
├── lib/
│   ├── data.ts               # Data access layer
│   ├── derive.ts             # Lógica de cálculos de negocio
│   ├── supabase.ts           # Cliente de base de datos
│   └── adapters/             # Transformadores de datos
├── stores/buildingsStore.ts   # Estado global con Zustand
└── hooks/                    # Custom hooks para datos
```

## 2. MODELOS DE DATOS

### 2.1 Modelo Principal: Building

```typescript
Building {
  id: string                    // Identificador único
  slug: string                  // URL slug
  name: string                  // Nombre del edificio
  comuna: string                // Comuna (sin dígitos)
  address: string               // Dirección completa
  amenities: string[]           // Amenidades (min 1)
  gallery: string[]             // Galería de imágenes (min 3)
  units: Unit[]                 // Unidades (min 1)
  
  // Campos extendidos v2
  coverImage?: string           // Imagen principal
  badges?: PromotionBadge[]     // Promociones nivel edificio
  serviceLevel?: "pro" | "standard"
  media?: Media                 // Fotos, video, tour 360°
  nearestTransit?: Transit      // Transporte cercano
  
  // Campos derivados/calculados
  hasAvailability?: boolean     // Calculado: tiene unidades disponibles
  precioRango?: {min: number, max: number}
  precio_desde?: number         // Precio mínimo de unidades publicables
  precio_hasta?: number         // Precio máximo de unidades publicables
  featured?: boolean            // Flag destacado (por promociones)
  gc_mode?: 'MF' | 'variable'   // Modo gastos comunes
}
```

### 2.2 Modelo de Unidad: Unit

```typescript
Unit {
  id: string                    // Identificador único
  tipologia: string             // Studio|1D1B|2D1B|2D2B|3D2B (canónico)
  m2: number                    // Área total
  price: number                 // Precio de arriendo (int positivo)
  estacionamiento: boolean      // Incluye estacionamiento
  bodega: boolean               // Incluye bodega
  disponible: boolean           // Disponible para arriendo
  
  // Campos extendidos
  codigoInterno?: string        // Código interno edificio
  bedrooms?: number             // Dormitorios (positivo)
  bathrooms?: number            // Baños (positivo)
  area_interior_m2?: number     // 20-200 m²
  area_exterior_m2?: number     // 0-50 m²
  orientacion?: 'N'|'NE'|'E'|'SE'|'S'|'SO'|'O'|'NO'
  piso?: number                 // Piso (≥0)
  amoblado?: boolean            // Amoblado
  petFriendly?: boolean         // Acepta mascotas
  
  // Opciones adicionales
  parkingOptions?: string[]     // IDs estacionamientos adicionales
  storageOptions?: string[]     // IDs bodegas adicionales
  parking_ids?: string | null   // IDs pipe-separated o 'x'
  storage_ids?: string | null   // IDs pipe-separated o 'x'
  parking_opcional?: boolean    // Estacionamiento opcional
  storage_opcional?: boolean    // Bodega opcional
  
  // Garantías y requisitos
  guarantee_installments?: number  // 1-12 cuotas garantía
  guarantee_months?: number        // 0-2 meses garantía
  rentas_necesarias?: number       // Múltiplo de renta requerido
  renta_minima?: number           // Renta mínima calculada
  
  // Estado y promociones
  status?: "available"|"reserved"|"rented"
  promotions?: PromotionBadge[]   // Promociones nivel unidad
  link_listing?: string           // URL a listing externo
}
```

### 2.3 Sistema de Promociones

```typescript
PromotionBadge {
  label: string                 // Texto visible
  type: PromotionType          // Enum de tipos
  tag?: string                 // Tag opcional
}

enum PromotionType {
  DISCOUNT_PERCENT = "discount_percent"      // % descuento
  FREE_COMMISSION = "free_commission"       // Sin comisión
  GUARANTEE_INSTALLMENTS = "guarantee_installments"  // Cuotas garantía
  FIXED_PRICE_TERM = "fixed_price_term"     // Precio fijo por período
  NO_AVAL = "no_aval"                      // Sin aval
  NO_GUARANTEE = "no_guarantee"            // Sin garantía
  SERVICE_PRO = "service_pro"              // Servicio premium
}
```

## 3. LÓGICA DE CÁLCULOS DE PRECIOS

### 3.1 Fórmulas de Precios Base

```typescript
// Precio "desde" (mínimo de unidades publicables)
precioDesde = MIN(price) WHERE disponible = true AND price > 1

// Precio "hasta" (máximo de unidades publicables)
precioHasta = MAX(price) WHERE disponible = true AND price > 1

// Unidades publicables
publicableUnits = units.filter(u => u.disponible && u.price > 1)
```

### 3.2 Cálculos de Costos (CostTable Component)

```typescript
// Estructura actual de costos mostrados al usuario:
costos = {
  canon_arriendo: unit.price,
  gastos_comunes_aprox: Math.round(unit.price * 0.18),  // 18% aprox
  comision_corretaje: "0% Comisión",                     // Promoción
  garantia: Math.round(unit.price),                      // 1 mes
  estacionamiento_bodega: "Consultar",                   // Si opcional
  
  // Total estimado entrada
  total_entrada: Math.round(unit.price * 2.18)           // Canon + GC + Garantía
}
```

### 3.3 Cálculos de Garantías y Requisitos

```typescript
// Renta mínima requerida
renta_minima = arriendo_total * rentas_necesarias

// Recargo sin garantía (6%)
recargo_sin_garantia = (rent + parking + storage) * 0.06

// Validación mascotas
pet_restrictions = {
  max_weight: 20,  // kg
  prohibited_breeds: ['pitbull', 'rottweiler', 'doberman', 'bulldog']
}
```

### 3.4 Algoritmo Featured Flag

```typescript
// Flag destacado se calcula por:
featured = tremenda_promo 
        || descuento_percent >= 50 
        || sin_garantia 
        || precio_en_percentil_25_de_comuna

// Implementación actual simplificada:
isLowPrice = precioDesde < 400000  // Threshold temporal
```

## 4. ESTRUCTURA DE APIs

### 4.1 Endpoints Disponibles

```
GET /api/buildings                    # Lista todos los edificios con filtros
GET /api/buildings/paginated         # Lista paginada con metadatos
GET /api/buildings/[slug]            # Detalle de edificio específico
POST /api/booking                    # Crear solicitud de reserva
POST /api/waitlist                   # Agregar a lista de espera
GET /api/debug-admin                 # Información de sistema (admin)
```

### 4.2 Rate Limiting

- **Buildings API**: 20 requests/60s por IP
- **Booking API**: 10 requests/60s por IP (más restrictivo)
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Window`, `Retry-After`

### 4.3 Filtros Soportados

```typescript
BuildingFilters {
  comuna?: string           // Filtro por comuna
  tipologia?: string        // Filtro por tipología
  minPrice?: number         // Precio mínimo
  maxPrice?: number         // Precio máximo
  minM2?: number           // Área mínima
  maxM2?: number           // Área máxima
  amenities?: string[]     // Amenidades requeridas
  estacionamiento?: boolean // Con/sin estacionamiento
  bodega?: boolean         // Con/sin bodega
  petFriendly?: boolean    // Acepta mascotas
  bedrooms?: number        // Número dormitorios
  bathrooms?: number       // Número baños
}
```

## 5. FLUJO DE DATOS

### 5.1 Arquitectura de Datos

```
Fuentes de Datos:
1. Supabase (PostgreSQL) - Datos en producción
2. AssetPlan JSON - Datos externos procesados
3. Mock JSON - Fallback para desarrollo

Flujo:
Data Sources → lib/data.ts → Validation (Zod) → API Routes → Frontend
              ↓
         lib/derive.ts (cálculos) → Zustand Store → React Components
```

### 5.2 Transformación de Datos (Mapping v2)

- **ID Generation**: SHA1 hash de `Condominio|Comuna|Direccion`
- **Normalización Comuna**: Remueve códigos, Title Case
- **Tipología Canónica**: Studio, 1D1B, 2D1B, 2D2B, 3D2B
- **Áreas**: Corrección cm² → m², interior + exterior
- **Validación Estado**: Solo `['RE - Acondicionamiento', 'Lista para arrendar']`

### 5.3 Estado Global (Zustand)

```typescript
BuildingsState {
  buildings: Building[]           // Datos base
  filteredBuildings: Building[]   // Datos filtrados/ordenados
  loading: boolean               // Estado de carga
  error: string | null          // Errores
  filters: BuildingFilters      // Filtros activos
  sort: SortOption             // Ordenamiento
  
  // Paginación
  page: number
  pageSize: number
  totalPages: number
  totalCount: number
  paginationMode: 'traditional' | 'infinite'
}
```

## 6. VALIDACIONES Y REGLAS DE NEGOCIO

### 6.1 Validaciones Críticas (Zod Schemas)

```typescript
// Precios
price: z.number().int().positive()

// Áreas
area_interior_m2: z.number().positive().max(200)
area_exterior_m2: z.number().nonnegative().max(50)

// Garantías
guarantee_installments: z.number().int().min(1).max(12)
guarantee_months: z.number().int().min(0).max(2)

// Tipología
tipologia: z.string().regex(/^(Studio|1D1B|2D1B|2D2B|3D2B)$/)

// Comuna
comuna: z.string().refine(val => !/\d/.test(val))
```

### 6.2 Reglas de Disponibilidad

```typescript
// Una unidad está disponible si:
disponible = estado ∈ ['RE - Acondicionamiento', 'Lista para arrendar'] 
           && arriendo_total > 1

// Un edificio tiene disponibilidad si:
hasAvailability = EXISTS(units WHERE disponible = true AND price > 1)
```

### 6.3 Agregaciones por Tipología

```typescript
// Resumen por tipología en cada edificio
TypologyAggregate {
  code: string              // Código tipología
  unidades: number          // Cantidad unidades
  priceRange: {min, max}    // Rango precios
  areaRange: {min, max}     // Rango áreas
  bedrooms?: number         // Si uniforme en tipología
  bathrooms?: number        // Si uniforme en tipología
  hasPromo: boolean         // Tiene promociones
}
```

## 7. SISTEMA DE FEATURE FLAGS

```typescript
featureFlags = {
  comingSoon: true,     // Página coming-soon activa
  pagination: false     // Paginación React Query (deshabilitada)
}
```

## 8. CONSIDERACIONES PARA IMPLEMENTACIÓN DE COTIZACIONES

### 8.1 Puntos de Integración Sugeridos

1. **Nuevo Endpoint**: `POST /api/quotations`
2. **Modelo Cotización**: Extiende datos existentes con cálculos adicionales
3. **Validaciones**: Reutilizar esquemas Zod existentes
4. **Rate Limiting**: Similar a booking (10 req/min)

### 8.2 Datos Disponibles para Cotizaciones

- ✅ **Precios base**: `unit.price`
- ✅ **Gastos comunes**: Fórmula actual 18% (ajustable)
- ✅ **Garantías**: `guarantee_months`, `guarantee_installments`
- ✅ **Servicios opcionales**: `parkingOptions`, `storageOptions`
- ✅ **Restricciones**: `rentas_necesarias`, `renta_minima`
- ✅ **Promociones**: Sistema de badges configurables
- ✅ **Área total**: `area_interior_m2 + area_exterior_m2`

### 8.3 Extensiones Necesarias

- **Tarifas dinámicas**: GC variables por edificio/comuna
- **Servicios adicionales**: Precios parking/bodega específicos
- **Seguros**: Integración con aseguradoras
- **Depósitos**: Cálculos de depósitos variables
- **Comisiones**: Sistema de comisiones diferenciadas

### 8.4 Flujo Recomendado para Cotizaciones

```
1. Usuario selecciona unidad → unit.id
2. Sistema valida disponibilidad → disponible = true
3. Calcula costos base → CostTable logic extendida
4. Aplica promociones → PromotionBadge.type
5. Calcula servicios opcionales → parkingOptions/storageOptions
6. Genera cotización final → nuevo QuotationSchema
7. Retorna PDF/JSON → integración externa
```

## 9. ARQUITECTURA DE DEPLOYMENT

- **Plataforma**: Vercel (Next.js optimizado)
- **Base de Datos**: Supabase (PostgreSQL managed)
- **CDN**: Vercel Edge Network
- **Monitoreo**: Feature flags + analytics integrados

## 10. MÉTRICAS Y KPIs ACTUALES

- **Performance**: LCP ≤ 2.5s
- **Accessibility**: AA compliance
- **SEO**: Score >90
- **Conversión objetivo**: CTR WhatsApp >8%, Booking CR >5%

---

**Fecha**: Enero 2025  
**Versión**: 1.0  
**Contacto**: Tech Lead - Hommie Development Team

Este reporte proporciona la base técnica completa para implementar el sistema de cotizaciones manteniendo consistencia con la arquitectura existente y aprovechando al máximo los modelos de datos y validaciones ya establecidos.
