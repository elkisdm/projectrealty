# Sistema PropertyClient - Base para Todas las Páginas de Propiedades

## Descripción

El nuevo sistema PropertyClient proporciona una base reutilizable y modular para todas las páginas de propiedades, con soporte para diferentes variantes (catalog, marketing, admin) y componentes completamente separados.

## Arquitectura

### Componentes Base

- **`PropertyClient`** - Componente principal que orquesta todo
- **`PropertyHero`** - Header con título, ubicación y badges
- **`PropertyBreadcrumb`** - Navegación de migas de pan
- **`PropertyMobilePricing`** - Sección de precios para móviles
- **`PropertySidebar`** - Sidebar con precios y CTAs
- **`PropertySections`** - Secciones desplegables de detalles
- **`FirstPaymentCalculator`** - Calculadora de primer pago

### Hooks Personalizados

- **`usePropertyUnit`** - Lógica de selección y cálculos de unidades

## Variantes Disponibles

### 1. Catalog (Por defecto)
- **Ruta:** `/property/[slug]`
- **Propósito:** Vista estándar del catálogo
- **Características:** 3 badges, breadcrumb estándar, CTAs normales

### 2. Marketing
- **Ruta:** `/arrienda-sin-comision/property/[slug]`
- **Propósito:** Vista optimizada para conversión
- **Características:** 2 badges, breadcrumb de marketing, CTAs agresivos

### 3. Admin
- **Ruta:** `/admin/property/[slug]`
- **Propósito:** Vista para gestión interna
- **Características:** Badges informativos, breadcrumb de admin, CTAs de gestión

## Uso Básico

### Página de Catálogo (Estándar)

```tsx
import { PropertyClient } from "@components/property/PropertyClient";

export default function PropertyPage({ building, relatedBuildings, defaultUnitId }) {
  return (
    <PropertyClient
      building={building}
      relatedBuildings={relatedBuildings}
      defaultUnitId={defaultUnitId}
      variant="catalog" // Opcional, es el valor por defecto
    />
  );
}
```

### Página de Marketing

```tsx
import { PropertyClient } from "@components/property/PropertyClient";

export default function MarketingPropertyPage({ building, relatedBuildings, defaultUnitId }) {
  return (
    <PropertyClient
      building={building}
      relatedBuildings={relatedBuildings}
      defaultUnitId={defaultUnitId}
      variant="marketing"
    />
  );
}
```

**Ruta:** `/arrienda-sin-comision/property/[slug]`

### Página de Admin

```tsx
import { PropertyClient } from "@components/property/PropertyClient";

export default function AdminPropertyPage({ building, relatedBuildings, defaultUnitId }) {
  return (
    <PropertyClient
      building={building}
      relatedBuildings={relatedBuildings}
      defaultUnitId={defaultUnitId}
      variant="admin"
    />
  );
}
```

## Componentes Individuales

### PropertyHero

```tsx
import { PropertyHero } from "@components/property/PropertyHero";

<PropertyHero 
  building={building} 
  variant="marketing" 
/>
```

**Props:**
- `building`: Objeto Building
- `variant`: "catalog" | "marketing" | "admin"

### PropertyBreadcrumb

```tsx
import { PropertyBreadcrumb } from "@components/property/PropertyBreadcrumb";

<PropertyBreadcrumb 
  building={building} 
  variant="marketing" 
/>
```

**Props:**
- `building`: Objeto Building
- `variant`: "catalog" | "marketing" | "admin"

### PropertySidebar

```tsx
import { PropertySidebar } from "@components/property/PropertySidebar";

<PropertySidebar
  building={building}
  selectedUnit={selectedUnit}
  unitDetails={unitDetails}
  originalPrice={originalPrice}
  discountPrice={discountPrice}
  firstPaymentCalculation={firstPaymentCalculation}
  moveInDate={moveInDate}
  includeParking={includeParking}
  includeStorage={includeStorage}
  onDateChange={handleDateChange}
  onParkingChange={handleParkingChange}
  onStorageChange={handleStorageChange}
  onSendQuotation={handleSendQuotation}
  onScheduleVisit={handleScheduleVisit}
  variant="marketing"
/>
```

### FirstPaymentCalculator

```tsx
import { FirstPaymentCalculator } from "@components/property/FirstPaymentCalculator";

<FirstPaymentCalculator
  originalPrice={originalPrice}
  discountPrice={discountPrice}
  firstPaymentCalculation={firstPaymentCalculation}
  moveInDate={moveInDate}
  includeParking={includeParking}
  includeStorage={includeStorage}
  onDateChange={handleDateChange}
  onParkingChange={handleParkingChange}
  onStorageChange={handleStorageChange}
  onSendQuotation={handleSendQuotation}
  variant="compact" // "compact" | "detailed"
/>
```

## Hook usePropertyUnit

```tsx
import { usePropertyUnit } from "@hooks/usePropertyUnit";

const {
  selectedUnit,
  setSelectedUnit,
  moveInDate,
  setMoveInDate,
  includeParking,
  setIncludeParking,
  includeStorage,
  setIncludeStorage,
  availableUnits,
  originalPrice,
  discountPrice,
  unitDetails,
  firstPaymentCalculation,
  handleDateChange,
  formatDate,
  formatDateForSummary,
  getSummaryText,
  getSummaryPrice
} = usePropertyUnit({
  building,
  defaultUnitId
});
```

## Personalización por Variante

### Badges

Cada variante muestra diferentes badges:

- **Catalog:** 3 badges principales (0% comisión, 50% OFF, Garantía)
- **Marketing:** 2 badges (0% comisión, 50% OFF)
- **Admin:** 2 badges informativos (ID, Unidades)

### Breadcrumbs

- **Catalog:** Inicio → Propiedades → [Nombre Propiedad]
- **Marketing:** Inicio → Arrienda sin comisión → [Nombre Propiedad]
- **Admin:** Admin → Propiedades → [Nombre Propiedad]

### CTAs

- **Catalog:** "Agendar visita", "WhatsApp"
- **Marketing:** "¡Agendar visita ahora!", "WhatsApp directo"
- **Admin:** "Editar propiedad", "Ver estadísticas"

## Ventajas del Nuevo Sistema

1. **Reutilización:** Un solo componente base para todas las variantes
2. **Mantenibilidad:** Lógica separada en hooks y componentes
3. **Consistencia:** Misma funcionalidad en todas las variantes
4. **Flexibilidad:** Fácil personalización por variante
5. **Performance:** Lazy loading y optimizaciones integradas
6. **Accesibilidad:** Mejoras de a11y en todos los componentes
7. **TypeScript:** Tipado estricto en toda la base

## Migración

Para migrar una página existente:

1. Importar el nuevo `PropertyClient`
2. Reemplazar la implementación actual
3. Especificar la variante deseada
4. Eliminar código duplicado

## Próximos Pasos

- [ ] Implementar variante "admin"
- [ ] Añadir más personalizaciones por variante
- [ ] Crear tests para cada componente
- [ ] Optimizar performance con React.memo
- [ ] Añadir más hooks personalizados
