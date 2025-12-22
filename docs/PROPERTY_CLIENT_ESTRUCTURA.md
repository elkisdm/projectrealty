# Estructura de Información de PropertyClient

## Descripción

`PropertyClient` es el componente principal que orquesta todas las páginas de propiedades en el sistema. Es un componente cliente reutilizable que soporta diferentes variantes (catalog, marketing, admin) y coordina todos los subcomponentes de la página de detalle de propiedad.

## Ubicación

- **Archivo:** `components/property/PropertyClient.tsx`
- **Rutas que lo usan:**
  - `/property/[slug]` (catalog)
  - `/arrienda-sin-comision/property/[slug]` (marketing)
  - `/arriendo/departamento/[comuna]/[slug]` (UnitDetailClient)

---

## Interface PropertyClientProps

```typescript
interface PropertyClientProps {
    building: Building;                    // ⚠️ REQUERIDO - Objeto Building completo
    relatedBuildings: Building[];          // ⚠️ REQUERIDO - Array de edificios relacionados
    defaultUnitId?: string;                // Opcional - ID de unidad por defecto a mostrar
    tipologiaFilter?: string;              // Opcional - Filtrar unidades por tipología
    showAllUnits?: boolean;                // Opcional - Mostrar todas las unidades o solo disponibles
    variant?: "catalog" | "marketing" | "admin"; // Opcional - Variante de visualización (default: "catalog")
}
```

---

## Estructura de Datos: Building

El objeto `Building` es el componente central de `PropertyClient`. Contiene toda la información del edificio y sus unidades.

### Campos Básicos (Requeridos)

```typescript
interface Building {
  id: string;              // ID único del edificio
  slug: string;            // Slug para URL: /property/[slug]
  name: string;            // Nombre del edificio
  comuna: string;          // Comuna (ej: "Las Condes", "Providencia")
  region?: string;         // Región (opcional)
  address?: string;        // Dirección completa (opcional)
  
  // Precio base
  precio_desde: number;    // Precio mínimo desde (arriendo mensual)
  
  // Contenido visual
  coverImage: string;      // Imagen principal del edificio
  gallery?: string[];      // Array de URLs de imágenes del edificio
  
  // Unidades
  units: Unit[];           // ⚠️ REQUERIDO - Array de unidades del edificio
}
```

### Campos Extendidos (Opcionales)

```typescript
interface Building {
  // Media y ubicación
  media?: {
    images?: string[];
    tour360?: string;
    video?: string;
    map?: {
      lat: number;
      lng: number;
    };
  };
  
  // Amenities y características
  amenities?: string[];           // Array de amenities: ["Piscina", "Gimnasio", etc.]
  
  // Información detallada
  description?: string;            // Descripción del edificio
  yearBuilt?: number;              // Año de construcción
  floors?: number;                 // Número de pisos
  totalUnits?: number;             // Total de unidades
  
  // Promociones
  promotions?: Array<{
    label: string;
    type: PromotionType;
    tag?: string;
  }>;
  
  // Tipologías disponibles
  tipologias?: TypologySummary[];  // Resumen de tipologías disponibles
  
  // Ubicación y conectividad
  metroCercano?: {
    nombre: string;
    distancia?: number;            // En metros
    tiempoCaminando?: number;      // En minutos
  };
  
  // Política de mascotas
  politicaMascotas?: {
    petFriendly: boolean;
    pesoMaximoKg?: number;
    permitidos?: string[];
    prohibidos?: string[];
    reglas?: string[];
    nota?: string;
  };
  
  // Estacionamientos y bodegas
  estacionamientos?: {
    subterraneo?: boolean;
    visitas?: boolean;
    disponibles?: boolean;
  };
  
  bodegas?: {
    disponibles?: boolean;
    descripcion?: string;
  };
  
  // Requisitos de arriendo
  requisitosArriendo?: {
    documentacion?: {
      dependiente?: string[];
      independiente?: string[];
      extranjeros?: string[];
    };
    condicionesFinancieras?: {
      puntajeFinanciero?: number;
      rentaMinimaMultiplo?: string;
      avales?: {
        permitidos: boolean;
        maxAvales?: number;
        algunosDepartamentosRequierenAvalObligatorio?: boolean;
      };
      garantiaEnCuotas?: boolean;
    };
  };
  
  // Información de contrato
  infoContrato?: {
    duracionAnos: number;
    salidaAnticipada?: {
      aplicaMulta: boolean;
      descripcion?: string;
    };
    despuesDelAno?: {
      salidaLibre: boolean;
      avisoPrevio: boolean;
      descripcion?: string;
    };
  };
}
```

---

## Estructura de Datos: Unit

El objeto `Unit` representa una unidad individual dentro de un edificio.

### Campos Requeridos

```typescript
interface Unit {
  id: string;                    // ⚠️ ID único de la unidad
  slug: string;                  // ⚠️ Slug para URLs de unidades
  codigoUnidad: string;          // ⚠️ Código de la unidad (ej: "2201-B")
  buildingId: string;            // ⚠️ ID del edificio al que pertenece
  tipologia: string;             // ⚠️ "Studio" | "Estudio" | "1D1B" | "2D1B" | "2D2B" | "3D2B"
  
  // Información básica
  dormitorios: number;           // ⚠️ Número de dormitorios (0 para Studio)
  banos: number;                 // ⚠️ Número de baños (mínimo 1)
  
  // Información económica
  price: number;                 // ⚠️ Arriendo mensual
  gastoComun?: number;           // Gasto común mensual
  garantia: number;              // ⚠️ Valor de garantía
  
  // Estado
  disponible: boolean;           // ⚠️ Si la unidad está disponible
}
```

### Campos Opcionales

```typescript
interface Unit {
  // Superficie
  m2?: number;                   // Superficie interior en m²
  area_interior_m2?: number;     // Alias de m2
  area_exterior_m2?: number;     // Superficie exterior/terraza en m²
  m2_terraza?: number;           // Alias de area_exterior_m2
  
  // Ubicación dentro del edificio
  piso?: number;                 // Número de piso
  vista?: string;                // Orientación de la vista
  orientacion?: string;          // Orientación (N, NE, E, etc.)
  
  // Características
  amoblado?: boolean;            // Si está amueblado
  petFriendly?: boolean;         // Si acepta mascotas
  politicaMascotas?: string;     // Política de mascotas detallada
  
  // Imágenes
  images?: string[];             // Imágenes del interior de la unidad
  imagesTipologia?: string[];    // Imágenes de la tipología
  imagesAreasComunes?: string[]; // Imágenes de áreas comunes del edificio
  
  // Precios y promociones
  total_mensual?: number;        // Precio total mensual (arriendo + GC)
  descuento_porcentaje?: number; // Porcentaje de descuento
  meses_descuento?: number;      // Meses con descuento aplicado
  precioFijoMeses?: number;      // Meses con precio fijo
  reajuste?: string;             // Información de reajuste (ej: "cada 3 meses según UF")
  reajuste_meses?: number;       // Meses entre reajustes
  
  // Garantía
  garantiaEnCuotas?: boolean;    // Si la garantía se puede pagar en cuotas
  cuotasGarantia?: number;       // Número de cuotas (1-12)
  garantia_meses?: number;       // Meses de garantía requeridos
  garantia_cuotas?: number;      // Cuotas de garantía
  
  // Estacionamiento y bodega
  estacionamiento?: boolean;     // Si incluye estacionamiento
  bodega?: boolean;              // Si incluye bodega
  parkingOptions?: string[];     // Opciones de estacionamiento
  storageOptions?: string[];     // Opciones de bodega
  parking_ids?: string | null;   // IDs de estacionamientos
  storage_ids?: string | null;   // IDs de bodegas
  parking_opcional?: boolean;    // Si estacionamiento es opcional
  storage_opcional?: boolean;    // Si bodega es opcional
  
  // Estado y disponibilidad
  estado?: "Disponible" | "Reservado" | "Arrendado" | "RE - Acondicionamiento";
  status?: "available" | "reserved" | "rented";
  estadoRaw?: string;            // Estado original desde AssetPlan
  
  // Requisitos financieros
  renta_minima?: number;         // Renta mínima requerida
  rentas_necesarias?: number;    // Rentas necesarias para calificar
  guarantee_installments?: number; // Cuotas de garantía disponibles
  
  // Promociones
  promotions?: Array<{
    label: string;
    type: PromotionType;
    tag?: string;
  }>;
  
  // Link externo
  link_listing?: string;         // URL del listing original
  
  // Campos legacy (aliases)
  bedrooms?: number;             // Alias de dormitorios
  bathrooms?: number;            // Alias de banos
  gastosComunes?: number;        // Alias de gastoComun
}
```

---

## Componentes Internos

`PropertyClient` coordina los siguientes componentes:

### 1. PropertyAboveFoldMobile
**Props que recibe:**
```typescript
{
  building: Building;
  selectedUnit: Unit;
  variant?: "catalog" | "marketing" | "admin";
  onScheduleVisit: () => void;
  onWhatsApp?: () => void;
  onSelectOtherUnit?: () => void;
  onSave?: () => void;
  onShare?: () => void;
}
```

**Funcionalidad:**
- Hero image con galería deslizable
- Breadcrumb y título
- Precio y badges
- CTAs principales (agendar, WhatsApp)

### 2. PropertyBreadcrumb
**Props que recibe:**
```typescript
{
  building: Building;
  unit?: Unit;
  variant?: "catalog" | "marketing" | "admin";
}
```

### 3. PropertyTabs
**Props que recibe:**
```typescript
{
  unit?: Unit;
  building: Building;
}
```

**Tabs incluidos:**
- Características
- Amenities
- Ubicación
- Requisitos
- FAQ

### 4. PropertySidebar
**Props que recibe:**
```typescript
{
  building: Building;
  selectedUnit: Unit;
  unitDetails: UnitDetails;
  originalPrice: number;
  discountPrice: number;
  firstPaymentCalculation: FirstPaymentCalculation;
  moveInDate: Date;
  includeParking: boolean;
  includeStorage: boolean;
  onDateChange: (date: Date) => void;
  onParkingChange: (include: boolean) => void;
  onStorageChange: (include: boolean) => void;
  onSendQuotation: () => void;
  onScheduleVisit: () => void;
  variant?: "catalog" | "marketing" | "admin";
}
```

### 5. PropertySimilarUnits
**Props que recibe:**
```typescript
{
  building: Building;
  currentUnit?: Unit;
  variant?: "catalog" | "marketing" | "admin";
}
```

### 6. CommuneLifeSection
**Props que recibe:**
```typescript
{
  building: Building;
  variant?: "catalog" | "marketing" | "admin";
}
```

### 7. PropertyFAQ
**Props que recibe:**
```typescript
{
  building: Building;
  variant?: "catalog" | "marketing" | "admin";
}
```

---

## Hook: usePropertyUnit

`PropertyClient` utiliza el hook `usePropertyUnit` para gestionar la lógica de unidades.

### Parámetros del Hook

```typescript
usePropertyUnit({
  building: Building;
  defaultUnitId?: string;
})
```

### Retorno del Hook

```typescript
{
  // Estado de la unidad seleccionada
  selectedUnit: Unit | null;
  setSelectedUnit: (unit: Unit) => void;
  
  // Fecha de mudanza
  moveInDate: Date;
  setMoveInDate: (date: Date) => void;
  
  // Opciones adicionales
  includeParking: boolean;
  setIncludeParking: (include: boolean) => void;
  includeStorage: boolean;
  setIncludeStorage: (include: boolean) => void;
  
  // Unidades disponibles
  availableUnits: Unit[];
  
  // Cálculos de precio
  originalPrice: number;
  discountPrice: number;
  unitDetails: UnitDetails;
  firstPaymentCalculation: FirstPaymentCalculation;
  
  // Handlers
  handleDateChange: (date: Date) => void;
  formatDate: (date: Date) => string;
  formatDateForSummary: (date: Date) => string;
  getSummaryText: () => string;
  getSummaryPrice: () => number;
}
```

---

## Variantes

### Catalog (Por defecto)
- **Ruta:** `/property/[slug]`
- **Badges:** 3 badges principales (0% comisión, 50% OFF, Garantía)
- **CTAs:** "Agendar visita", "WhatsApp"
- **Breadcrumb:** Inicio → Propiedades → [Nombre Propiedad]

### Marketing
- **Ruta:** `/arrienda-sin-comision/property/[slug]`
- **Badges:** 2 badges (0% comisión, 50% OFF)
- **CTAs:** "¡Agendar visita ahora!", "WhatsApp directo"
- **Breadcrumb:** Inicio → Arrienda sin comisión → [Nombre Propiedad]

### Admin
- **Ruta:** `/admin/property/[slug]` (por implementar)
- **Badges:** Badges informativos (ID, Unidades)
- **CTAs:** "Editar propiedad", "Ver estadísticas"
- **Breadcrumb:** Admin → Propiedades → [Nombre Propiedad]

---

## Flujo de Datos

```
Page Component (Server)
  ↓
  Building Data (from API/DB)
  ↓
PropertyClient (Client Component)
  ↓
  ┌─────────────────┬──────────────────┬───────────────┐
  │                 │                  │               │
usePropertyUnit   PropertyAboveFold   PropertyTabs   PropertySidebar
  Hook              Mobile              (Content)      (Pricing/CTAs)
  ↓                 ↓                   ↓               ↓
Selected Unit    Gallery + Hero      Tab Content    Calculations
```

---

## Ejemplo de Uso Completo

```typescript
import { PropertyClient } from "@components/property/PropertyClient";
import { getBuildingBySlug, getRelatedBuildings } from "@lib/data";

export default async function PropertyPage({ params }) {
  const { slug } = await params;
  
  // Obtener datos del edificio
  const building = await getBuildingBySlug(slug);
  const relatedBuildings = await getRelatedBuildings(slug, 4);
  
  if (!building) {
    notFound();
  }
  
  return (
    <PropertyClient
      building={building}
      relatedBuildings={relatedBuildings}
      defaultUnitId={searchParams?.unit}
      tipologiaFilter={searchParams?.tipologia}
      showAllUnits={searchParams?.ver === "unidades"}
      variant="catalog"
    />
  );
}
```

---

## Notas Importantes

1. **Building es requerido:** `PropertyClient` requiere un objeto `Building` completo con al menos `units`, `id`, `slug`, `name`, `comuna`, y `precio_desde`.

2. **Units mínimo:** El array `units` debe contener al menos una unidad, aunque puede estar `disponible: false`.

3. **Variante por defecto:** Si no se especifica `variant`, se usa `"catalog"` por defecto.

4. **Selección de unidad:** Si se proporciona `defaultUnitId`, se selecciona automáticamente. Si no, se usa la primera unidad disponible o la primera del array.

5. **Analytics:** `PropertyClient` automáticamente trackea eventos de analytics cuando se monta y cuando cambian las unidades.

6. **Error Handling:** El componente incluye un `ErrorBoundary` interno para manejar errores de renderizado.

---

## Archivos Relacionados

- **Componente principal:** `components/property/PropertyClient.tsx`
- **Hook:** `hooks/usePropertyUnit.ts`
- **Schemas:** `schemas/models.ts`
- **Tipos:** `types/index.ts`
- **Páginas que lo usan:**
  - `app/(catalog)/property/[slug]/page.tsx`
  - `app/arrienda-sin-comision/property/[slug]/page.tsx`
  - `app/arriendo/departamento/[comuna]/[slug]/page.tsx` (vía UnitDetailClient)


