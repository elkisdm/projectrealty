# Estructura Completa de la Página de Propiedad

## Descripción

Documentación detallada sobre cómo está configurada la estructura de la página de propiedad, incluyendo el orden de declaración de la información y cómo se organizan los componentes.

---

## 📁 Estructura de Archivos

```
app/(catalog)/property/[slug]/
├── page.tsx                    # ⚠️ Server Component - Obtiene datos y prepara metadata
├── PropertyClient.tsx          # Client Component wrapper (delgadez, solo pasa props)
├── loading.tsx                 # Loading state
└── error.tsx                   # Error boundary

components/property/
└── PropertyClient.tsx          # ⚠️ Componente principal (BasePropertyClient) - Organiza todo el layout
```

---

## 🔄 Flujo de Ejecución

```
1. page.tsx (Server Component)
   ↓ Obtiene datos
   ↓ Prepara metadata y JSON-LD
   ↓
2. PropertyClient.tsx (Wrapper - Client Component)
   ↓ Pasa props al BasePropertyClient
   ↓
3. components/property/PropertyClient.tsx (BasePropertyClient)
   ↓ Organiza layout y componentes
   ↓ Renderiza componentes hijos
```

---

## 📄 1. page.tsx - Estructura y Orden de Declaración

### Ubicación
`app/(catalog)/property/[slug]/page.tsx`

### Orden de Ejecución (Línea por Línea)

#### 1.1. Imports y Configuración (Líneas 1-13)

```typescript
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { getBuildingBySlug, getRelatedBuildings } from "@lib/data";
import { PropertyClient } from "./PropertyClient";
import { safeJsonLd } from "@lib/seo/jsonld";
import { PROPERTY_PAGE_CONSTANTS } from "@lib/constants/property";
import { normalizeComunaSlug } from "@/lib/utils/slug";

type PropertyPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 3600; // 1 hour
```

#### 1.2. Parámetros y Validación Inicial (Líneas 15-22)

```typescript
export default async function PropertyPage({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  
  // Simulate a failure to verify error.tsx boundary
  if (resolvedSearchParams?.fail === "1") {
    throw new Error("Falló carga de propiedad (simulada)");
  }
```

**Orden de declaración:**
1. `slug` - Extraído de params
2. `resolvedSearchParams` - Parámetros de búsqueda resueltos
3. Validación de error simulado (si aplica)

#### 1.3. Verificación de Unidad y Redirect (Líneas 24-50)

```typescript
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "http://localhost:3000";
  let redirectUrl: string | null = null;

  try {
    const unitResponse = await fetch(`${baseUrl}/api/buildings/${slug}`, {
      next: { revalidate: 3600 },
    });

    if (unitResponse.ok) {
      const unitData = await unitResponse.json();
      if (unitData.unit && unitData.building) {
        const comunaSlug = normalizeComunaSlug(unitData.building.comuna);
        redirectUrl = `/arriendo/departamento/${comunaSlug}/${slug}`;
      }
    }
  } catch (error) {
    console.error('Error checking unit:', error);
  }

  if (redirectUrl) {
    redirect(redirectUrl);
  }
```

**Orden de declaración:**
1. `baseUrl` - URL base del sitio
2. `redirectUrl` - Variable para redirect (null inicialmente)
3. Fetch a API para verificar si es unidad
4. Si es unidad → prepara redirect
5. Ejecuta redirect si es necesario

#### 1.4. Obtención de Datos del Edificio (Líneas 52-74)

```typescript
  // Si no es una unidad, buscar como edificio (compatibilidad backward)
  const building = await getBuildingBySlug(slug);

  if (!building) {
    notFound();
  }

  const relatedBuildings = await getRelatedBuildings(slug, PROPERTY_PAGE_CONSTANTS.RELATED_BUILDINGS_LIMIT);
```

**Orden de declaración:**
1. `building` - Objeto Building completo (obtenido de BD/API)
2. Validación: si no existe → `notFound()`
3. `relatedBuildings` - Array de edificios relacionados

#### 1.5. Preparación de Datos para JSON-LD y Metadata (Líneas 61-74)

```typescript
  // Build JSON-LD (Schema.org) for this property
  const canonicalUrl = `${baseUrl}/property/${slug}`;
  const primaryImage =
    building.media?.images?.[0] ||
    building.coverImage ||
    building.gallery?.[0] ||
    PROPERTY_PAGE_CONSTANTS.DEFAULT_IMAGE;
  const toAbsoluteUrl = (url: string) => (url.startsWith("http") ? url : `${baseUrl}${url}`);

  // Get first unit for breadcrumb (or use unit from searchParams if available)
  const unitId = resolvedSearchParams?.unit;
  const selectedUnit = unitId
    ? building.units.find(u => u.id === unitId)
    : building.units[0];
```

**Orden de declaración:**
1. `canonicalUrl` - URL canónica de la página
2. `primaryImage` - Imagen principal (con fallback chain)
3. `toAbsoluteUrl` - Helper function para URLs absolutas
4. `unitId` - ID de unidad desde searchParams (opcional)
5. `selectedUnit` - Unidad seleccionada (desde searchParams o primera del array)

#### 1.6. Construcción de Breadcrumbs para JSON-LD (Líneas 76-126)

```typescript
  // Build breadcrumb items for JSON-LD (matching PropertyBreadcrumb structure)
  const breadcrumbItems = [
    { name: "Home", item: `${baseUrl}/` },
    { name: "Arriendo Departamentos", item: `${baseUrl}/buscar` },
  ];

  // Add región if available
  if (building.region) {
    breadcrumbItems.push({
      name: building.region,
      item: `${baseUrl}/buscar?region=${encodeURIComponent(building.region)}`
    });
  }

  // Add comuna
  breadcrumbItems.push({
    name: building.comuna || "Santiago",
    item: `${baseUrl}/buscar?comuna=${encodeURIComponent(building.comuna || "Santiago")}`
  });

  // Add dirección if available
  if (building.address) {
    breadcrumbItems.push({
      name: building.address,
      item: `${baseUrl}/buscar?direccion=${encodeURIComponent(building.address)}`
    });
  }

  // Add edificio
  breadcrumbItems.push({
    name: building.name,
    item: canonicalUrl
  });

  // Add tipología if unit is available
  if (selectedUnit?.tipologia) {
    const tipologiaLabel = selectedUnit.tipologia === "Studio" || selectedUnit.tipologia === "Estudio"
      ? "Estudio"
      : selectedUnit.tipologia;
    breadcrumbItems.push({ name: tipologiaLabel, item: canonicalUrl });
    
    // Optionally add código de unidad if available
    if (selectedUnit.codigoUnidad) {
      breadcrumbItems.push({
        name: selectedUnit.codigoUnidad,
        item: canonicalUrl
      });
    }
  } else {
    breadcrumbItems.push({ name: "Departamento", item: canonicalUrl });
  }
```

**Orden de declaración:**
1. `breadcrumbItems` - Array inicial con Home y Arriendo Departamentos
2. Región (condicional) - Se añade si existe
3. Comuna - Siempre se añade (con fallback)
4. Dirección (condicional) - Se añade si existe
5. Nombre del edificio - Siempre se añade
6. Tipología - Se añade si hay unidad seleccionada
7. Código de unidad - Se añade si existe

#### 1.7. Objetos JSON-LD (Líneas 128-155)

```typescript
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };

  const jsonLd = {
    "@context": PROPERTY_PAGE_CONSTANTS.JSON_LD_CONTEXT,
    "@type": PROPERTY_PAGE_CONSTANTS.JSON_LD_TYPE,
    name: building.name,
    address: {
      "@type": "PostalAddress",
      addressLocality: building.comuna,
    },
    image: toAbsoluteUrl(primaryImage),
    url: canonicalUrl,
    offers: building.units.map((unit) => ({
      "@type": "Offer",
      price: unit.price,
      priceCurrency: PROPERTY_PAGE_CONSTANTS.PRICE_CURRENCY,
      ...(unit.disponible ? { availability: PROPERTY_PAGE_CONSTANTS.AVAILABILITY_IN_STOCK } : {}),
    })),
  } as const;
```

**Orden de declaración:**
1. `breadcrumbJsonLd` - Schema.org BreadcrumbList
2. `jsonLd` - Schema.org Property/Product con offers

#### 1.8. Componente Skeleton (Líneas 157-180)

```typescript
  const PropertySkeleton = () => (
    <div className="min-h-screen bg-bg">
      {/* ... estructura del skeleton ... */}
    </div>
  );
```

**Propósito:** Loading state mientras cargan los datos.

#### 1.9. Return y Render (Líneas 182-200)

```typescript
  return (
    <>
      <script type="application/ld+json">
        {safeJsonLd(jsonLd)}
      </script>
      <script type="application/ld+json">
        {safeJsonLd(breadcrumbJsonLd)}
      </script>
      <Suspense fallback={<PropertySkeleton />}>
        <PropertyClient
          building={building}
          relatedBuildings={relatedBuildings}
          defaultUnitId={resolvedSearchParams?.unit}
          tipologiaFilter={resolvedSearchParams?.tipologia}
          showAllUnits={resolvedSearchParams?.ver === "unidades"}
        />
      </Suspense>
    </>
  );
```

**Orden de render:**
1. JSON-LD script (Property schema)
2. JSON-LD script (Breadcrumb schema)
3. Suspense boundary con PropertyClient

#### 1.10. Función generateMetadata (Líneas 203-229)

```typescript
export async function generateMetadata({ params }: PropertyPageProps) {
  const { slug } = await params;
  const building = await getBuildingBySlug(slug);

  if (!building) {
    return {
      title: "Propiedad no encontrada",
    };
  }

  return {
    title: `${building.name} - 0% Comisión | Elkis Realtor`,
    description: `Arrienda ${building.name} en ${building.comuna} sin comisión de corretaje. ${building.amenities.join(", ")}.`,
    alternates: { canonical: `/property/${slug}` },
    openGraph: {
      title: `${building.name} - 0% Comisión`.replace(/\s+/g, " "),
      description: `Arrienda ${building.name} en ${building.comuna} sin comisión de corretaje.`,
      type: "website",
      images: [building.coverImage ?? building.gallery?.[0] ?? PROPERTY_PAGE_CONSTANTS.DEFAULT_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${building.name} - 0% Comisión`.replace(/\s+/g, " "),
      images: [building.coverImage ?? building.gallery?.[0] ?? PROPERTY_PAGE_CONSTANTS.DEFAULT_IMAGE],
    },
  };
}
```

**Orden de declaración:**
1. Obtiene `slug` de params
2. Obtiene `building` de BD
3. Retorna metadata con título, descripción, OpenGraph y Twitter

---

## 📄 2. PropertyClient.tsx (Wrapper) - Estructura

### Ubicación
`app/(catalog)/property/[slug]/PropertyClient.tsx`

### Estructura Completa

```typescript
"use client";
import React from "react";
import type { Building } from "@schemas/models";
import { PropertyClient as BasePropertyClient } from "@components/property/PropertyClient";

interface PropertyClientProps {
  building: Building;
  relatedBuildings: Building[];
  defaultUnitId?: string;
  tipologiaFilter?: string;
  showAllUnits?: boolean;
}

export function PropertyClient({
  building,
  relatedBuildings,
  defaultUnitId,
  tipologiaFilter,
  showAllUnits
}: PropertyClientProps) {
  return (
    <BasePropertyClient
      building={building}
      relatedBuildings={relatedBuildings}
      defaultUnitId={defaultUnitId}
      tipologiaFilter={tipologiaFilter}
      showAllUnits={showAllUnits}
      variant="catalog"
    />
  );
}
```

**Propósito:** 
- Wrapper delgado que agrega `variant="catalog"` y pasa todas las props al `BasePropertyClient`
- Permite tener variantes específicas por ruta sin duplicar código

---

## 📄 3. BasePropertyClient.tsx - Estructura y Orden de Componentes

### Ubicación
`components/property/PropertyClient.tsx`

### Orden de Declaración de Variables y Estado

```typescript
export function PropertyClient({
  building,
  relatedBuildings,
  defaultUnitId,
  tipologiaFilter,
  showAllUnits,
  variant = "catalog"
}: PropertyClientProps) {
  // 1. Estado local
  const [isLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2. Hook para gestión de unidades
  const {
    selectedUnit,
    moveInDate,
    includeParking,
    includeStorage,
    originalPrice,
    discountPrice,
    unitDetails,
    firstPaymentCalculation,
    handleDateChange,
    setIncludeParking,
    setIncludeStorage
  } = usePropertyUnit({ building, defaultUnitId });

  // 3. Handlers
  const handleWhatsAppClick = useCallback(() => { /* ... */ }, [/* deps */]);

  // 4. Effects (analytics, etc.)
  useEffect(() => { /* ... */ }, [/* deps */]);
```

### Orden de Renderizado de Componentes (Layout)

```typescript
return (
  <ErrorBoundary>
    <div className="min-h-screen bg-bg">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        
        {/* 1. Breadcrumb */}
        <PropertyBreadcrumb 
          building={building} 
          unit={selectedUnit || undefined} 
          variant={variant} 
        />

        {/* 2. Layout principal: Grid 3 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          
          {/* COLUMNA PRINCIPAL (2/3) */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            
            {/* 2.1. Hero Section (Above the fold) */}
            <PropertyAboveFoldMobile
              building={building}
              selectedUnit={selectedUnit || building.units[0] || fallbackUnit}
              variant={variant}
              onScheduleVisit={() => setIsModalOpen(true)}
              onWhatsApp={handleWhatsAppClick}
              onSave={() => { /* ... */ }}
              onShare={() => { /* ... */ }}
            />

            {/* 2.2. Tabs de contenido */}
            {selectedUnit && (
              <PropertyTabs
                unit={selectedUnit}
                building={building}
              />
            )}

            {/* 2.3. Unidades similares */}
            {selectedUnit && (
              <PropertySimilarUnits
                currentUnit={selectedUnit}
                building={building}
                limit={6}
              />
            )}

            {/* 2.4. Cómo es vivir en la comuna */}
            <CommuneLifeSection 
              building={building} 
              variant={variant} 
            />

            {/* 2.5. Propiedades relacionadas */}
            <section aria-label="Propiedades relacionadas">
              <h2>Propiedades relacionadas</h2>
              <Suspense fallback={/* skeleton */}>
                <RelatedList buildings={relatedBuildings} />
              </Suspense>
            </section>

            {/* 2.6. Preguntas frecuentes */}
            <PropertyFAQ 
              building={building} 
              variant={variant} 
            />

          </div>

          {/* SIDEBAR (1/3) */}
          {selectedUnit && (
            <PropertyBookingCard
              unit={selectedUnit}
              building={building}
              onScheduleVisit={() => setIsModalOpen(true)}
              onWhatsApp={handleWhatsAppClick}
            />
          )}

        </div>

      </main>

      {/* 3. Modal de Agendamiento */}
      <QuintoAndarVisitScheduler
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        listingId={building.id}
        propertyName={building.name}
        propertyAddress={building.address}
        propertyImage={building.coverImage}
        onSuccess={(visitData) => { /* ... */ }}
      />

    </div>
  </ErrorBoundary>
);
```

---

## 📊 Resumen del Orden de Declaración

### En page.tsx (Server Component)

1. **Configuración inicial** → Imports, tipos, revalidate
2. **Parámetros** → slug, searchParams
3. **Validación de unidad** → Fetch API, redirect si aplica
4. **Obtención de datos** → building, relatedBuildings
5. **Preparación de metadata** → canonicalUrl, primaryImage, selectedUnit
6. **Breadcrumbs** → Construcción del array de breadcrumbItems
7. **JSON-LD** → breadcrumbJsonLd, jsonLd
8. **Skeleton** → Componente de loading
9. **Render** → Scripts JSON-LD + PropertyClient
10. **generateMetadata** → Metadata para SEO

### En BasePropertyClient (Client Component)

1. **Estado local** → isLoading, error, isModalOpen
2. **Hook usePropertyUnit** → selectedUnit, precios, cálculos
3. **Handlers** → handleWhatsAppClick, etc.
4. **Effects** → Analytics, etc.
5. **Render orden:**
   - Breadcrumb
   - Grid Layout (2 columnas en desktop)
     - Columna principal:
       1. PropertyAboveFoldMobile (Hero)
       2. PropertyTabs (Contenido)
       3. PropertySimilarUnits (Unidades similares)
       4. CommuneLifeSection (Vida en la comuna)
       5. RelatedList (Propiedades relacionadas)
       6. PropertyFAQ (Preguntas frecuentes)
     - Sidebar:
       - PropertyBookingCard (Booking/Pricing)
   - QuintoAndarVisitScheduler (Modal)

---

## 🔧 Puntos Clave para Modificaciones

### Si quieres cambiar el orden de los componentes:

Modifica el **orden de renderizado** en `components/property/PropertyClient.tsx` (sección de layout, líneas 295-400).

### Si quieres cambiar cómo se declaran los datos:

1. **Datos del building** → Modifica `page.tsx` líneas 52-59
2. **Breadcrumbs** → Modifica `page.tsx` líneas 76-126
3. **Metadata** → Modifica `page.tsx` líneas 203-229 o la función `generateMetadata`
4. **Unidad seleccionada** → Modifica `page.tsx` líneas 71-74 o el hook `usePropertyUnit` en `BasePropertyClient`

### Si quieres agregar nuevos campos:

1. Agrega el campo en el objeto `building` cuando se obtiene (línea 53)
2. Pásalo como prop a `PropertyClient`
3. Úsalo en los componentes internos según necesites

---

## 📝 Notas Importantes

1. **page.tsx es Server Component:** Solo puede obtener datos del servidor, no puede usar hooks de React
2. **PropertyClient wrapper es delgado:** Solo agrega `variant="catalog"`, no contiene lógica
3. **BasePropertyClient contiene toda la lógica:** Maneja estado, efectos, y organiza el layout
4. **Orden importa:** El orden de declaración afecta el orden de renderizado y la disponibilidad de datos
5. **Condicionales:** Muchos componentes se renderizan solo si `selectedUnit` existe



