# Property Page V3 - Roadmap de Implementación

## 🚀 Sprint 1 (2 semanas) - Fundación y Componentes Core

### Semana 1: Componentes Base y UI

#### **Día 1-2: Sticky CTA + Métricas**
- [ ] Crear `components/ui/StickyCtaBar.tsx`
  - Props: `priceMonthly`, `onBook`, `onWhatsApp`
  - Aparece tras 120px de scroll (IntersectionObserver)
  - A11y: `role="navigation"`, `aria-label="Acciones rápidas"`
  - Instrumentar `track('cta_book_click')` y `track('cta_whatsapp_click')`
  - Tests RTL: render y eventos

#### **Día 3-4: Galería Pro**
- [ ] Crear `components/property/PropertyGallery.tsx`
  - Carrusel + thumbs + fullscreen modal
  - Lazy para imágenes salvo la primera (`priority`)
  - Contador 1/N, swipe en modal
  - Respetar `prefers-reduced-motion`
  - Tests: navegación, fullscreen, alt text

#### **Día 5: Desglose de Costos**
- [ ] Crear `components/property/PriceBreakdown.tsx`
  - Props: `rent`, `commonExpenses`, `deposit?`, `fee=0`, `currency='CLP'`
  - Mostrar "0% comisión" si `fee===0`
  - Tabla compacta; totals en bold

### Semana 2: Amenidades y Building Link

#### **Día 1-2: Amenity Chips**
- [ ] Crear `components/property/AmenityChips.tsx`
  - Props: `items: Chip[]` (icon, label)
  - 6–8 máx. visibles; resto en "+ Ver más"
  - Animaciones stagger con Framer Motion

#### **Día 3-4: Building Link Card**
- [ ] Crear `components/building/BuildingLinkCard.tsx`
  - Props: `buildingName`, `photo`, `href`
  - Card con foto y link a Building Page
  - Micro-interacciones hover

#### **Día 5: Performance Guardrails**
- [ ] Configurar Lighthouse CI en `.github/workflows/`
  - Umbrales: LCP < 2.5s, INP < 200ms, CLS < 0.1
  - Falla el job si no cumple

## 🚀 Sprint 2 (2 semanas) - Flujo de Conversión y Pulido

### Semana 3: Preevaluación + Agenda

#### **Día 1-3: Preevaluación Express**
- [ ] Crear `components/flow/PreapprovalForm.tsx`
  - Zod + server action
  - Campos: RUT, sueldo, fecha-mudanza
  - Devuelve status: `ok`/`review`/`nope`
  - Si `ok` => abre VisitScheduler

#### **Día 4-5: Agenda de Visitas**
- [ ] Crear `components/flow/VisitScheduler.tsx`
  - Chips Hoy/Mañana/Sábado
  - Slots horarios
  - Confirmación + instrucciones + add-to-calendar

### Semana 4: Relacionadas y Comuna

#### **Día 1-2: Propiedades Relacionadas**
- [ ] Crear `components/property/RelatedProperties.tsx`
  - 4 mini-cards (mismo edificio o comuna)
  - Virtualización para performance
  - Lazy loading de imágenes

#### **Día 3-5: Sección Comuna**
- [ ] Crear `components/commune/CommuneLifeSection.tsx`
  - Hero (imagen), 4 highlights con iconos
  - Mini-mapa mock con 3 pins
  - Testimonio, CTA
  - Data en `data/communes/estacion-central.ts`

#### **Día 5: FAQ + Legal**
- [ ] Crear `components/property/PropertyFAQ.tsx`
  - 3 preguntas frecuentes
  - Enlaces legales (contrato, privacidad)

## 📋 Componentes Detallados

### 1. `<StickyCtaBar />`
```typescript
interface StickyCtaBarProps {
  priceMonthly: number;
  onBook: () => void;
  onWhatsApp: () => void;
  isVisible?: boolean;
}
```

### 2. `<PropertyGallery />`
```typescript
interface PropertyGalleryProps {
  images: Image[];
  initialIndex?: number;
  onImageClick?: (index: number) => void;
}
```

### 3. `<PriceBreakdown />`
```typescript
interface PriceBreakdownProps {
  rent: number;
  commonExpenses: number;
  deposit?: number;
  fee?: number;
  currency?: 'CLP' | 'USD';
}
```

### 4. `<AmenityChips />`
```typescript
interface AmenityChip {
  icon: LucideIcon;
  label: string;
  category?: string;
}

interface AmenityChipsProps {
  items: AmenityChip[];
  maxVisible?: number;
}
```

### 5. `<BuildingLinkCard />`
```typescript
interface BuildingLinkCardProps {
  buildingName: string;
  photo: string;
  href: string;
  unitCount?: number;
}
```

### 6. `<PreapprovalForm />`
```typescript
interface PreapprovalFormProps {
  onResult: (result: 'ok' | 'review' | 'nope') => void;
  propertyId: string;
}
```

### 7. `<VisitScheduler />`
```typescript
interface VisitSchedulerProps {
  slots: Slot[];
  onConfirm: (slot: Slot) => void;
  propertyId: string;
}
```

### 8. `<CommuneLifeSection />`
```typescript
interface CommuneLifeSectionProps {
  communeData: {
    name: string;
    hero: string;
    highlights: Highlight[];
    mapPins: MapPin[];
    testimonial: Testimonial;
    cta: CTA;
  };
}
```

## 🎯 Criterios de Aceptación por Sprint

### Sprint 1
- [ ] Sticky CTA funciona en mobile y desktop
- [ ] Galería con fullscreen modal y swipe
- [ ] Price breakdown muestra 0% comisión
- [ ] Amenity chips con animaciones
- [ ] Building link card funcional
- [ ] Lighthouse CI configurado y pasando

### Sprint 2
- [ ] Preevaluación devuelve resultados correctos
- [ ] Agenda de visitas funcional
- [ ] Propiedades relacionadas cargan rápido
- [ ] Sección comuna con datos reales
- [ ] FAQ y legal links funcionando
- [ ] Performance metrics cumplen KPIs

## 📊 Métricas de Éxito

### Performance
- LCP < 2.5s
- INP < 200ms
- CLS < 0.1
- Bundle size < 200KB (gzipped)

### UX/UI
- CVR visita > 15%
- CTR WhatsApp > 8%
- Tiempo en página > 2 minutos
- Bounce rate < 40%

### Accesibilidad
- Lighthouse Accessibility > 95
- WCAG 2.1 AA compliance
- Keyboard navigation completa
- Screen reader compatible

## 🔧 Configuración Técnica

### Dependencias Nuevas
```json
{
  "framer-motion": "^11.0.0",
  "react-intersection-observer": "^9.5.0",
  "zod": "^3.22.0",
  "lucide-react": "^0.300.0"
}
```

### Configuración Tailwind
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'property': {
          50: '#eff6ff',
          500: '#22D3EE',
          600: '#06b6d4',
          700: '#0891b2'
        }
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif']
      }
    }
  }
}
```

### Lighthouse CI
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push, pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          configPath: './lighthouserc.json'
          uploadArtifacts: true
```

## 📝 Notas de Implementación

### Prioridades
1. **Mobile-first**: Todo componente debe funcionar perfectamente en mobile
2. **Performance**: Cada componente debe ser optimizado para velocidad
3. **Accesibilidad**: WCAG 2.1 AA desde el primer commit
4. **Testing**: Tests unitarios y de integración para cada componente

### Patrones de Código
- Usar `React.memo()` para componentes que no cambian frecuentemente
- Implementar `useCallback` y `useMemo` para optimizaciones
- Lazy loading para componentes pesados
- Error boundaries para manejo de errores

### Naming Conventions
- Componentes: PascalCase (`StickyCtaBar`)
- Archivos: kebab-case (`sticky-cta-bar.tsx`)
- Props interfaces: `ComponentNameProps`
- Hooks: `useComponentName`
