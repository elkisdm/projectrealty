# Property Page V3 - Prompts para Componentes

## 🎯 Prompts Listos para Cursor (Micro-tareas)

### **1) Sticky CTA + Métricas**

```markdown
Crea `components/ui/StickyCtaBar.tsx` (TS + Tailwind). Props: `priceMonthly`, `onBook`, `onWhatsApp`.

**Requisitos:**
- Muestra precio y dos botones grandes
- Aparece tras 120px de scroll (IntersectionObserver)
- A11y: `role="navigation"`, `aria-label="Acciones rápidas"`
- Instrumenta `track('cta_book_click')` y `track('cta_whatsapp_click')`
- Tests RTL: render y eventos
- Mobile-first: bottom bar en mobile, sidebar en desktop
- Animación suave de entrada/salida
- Respetar `prefers-reduced-motion`

**Interface:**
```typescript
interface StickyCtaBarProps {
  priceMonthly: number;
  onBook: () => void;
  onWhatsApp: () => void;
  isVisible?: boolean;
}
```

**Estilo:**
- Fondo glassmorphism con backdrop-blur
- Botones con hover states claros
- Precio destacado en verde
- Safe area para iOS
```

### **2) Galería Pro**

```markdown
Crea `components/property/PropertyGallery.tsx` con carrusel + thumbs + fullscreen modal.

**Requisitos:**
- Lazy para imágenes salvo la primera (`priority`)
- Contador 1/N, swipe en modal
- Respetar `prefers-reduced-motion`
- Tests: navegación, fullscreen, alt text
- Thumbnails con scroll horizontal
- Fullscreen modal con escape key
- Swipe gestures en mobile
- Zoom en fullscreen (pinch-to-zoom)

**Interface:**
```typescript
interface PropertyGalleryProps {
  images: Image[];
  initialIndex?: number;
  onImageClick?: (index: number) => void;
}
```

**Estilo:**
- Aspect ratio 1:1.2 para hero
- Thumbnails compactos
- Indicador de progreso
- Overlay con contador
```

### **3) Desglose de Costos**

```markdown
Crea `components/property/PriceBreakdown.tsx`.

**Requisitos:**
- Props: `rent`, `commonExpenses`, `deposit?`, `fee=0`, `currency='CLP'`
- Mostrar "0% comisión" si `fee===0`
- Tabla compacta; totals en bold
- Animación de entrada stagger
- Responsive: stack en mobile, table en desktop

**Interface:**
```typescript
interface PriceBreakdownProps {
  rent: number;
  commonExpenses: number;
  deposit?: number;
  fee?: number;
  currency?: 'CLP' | 'USD';
}
```

**Estilo:**
- Cards con sombra suave
- Badge destacado para 0% comisión
- Totales en verde y bold
- Iconos para cada línea
```

### **4) Amenity Chips**

```markdown
Crea `components/property/AmenityChips.tsx`.

**Requisitos:**
- Props: `items: Chip[]` (icon, label)
- 6–8 máx. visibles; resto en "+ Ver más"
- Animaciones stagger con Framer Motion
- Categorización por tipo
- Hover states con tooltips

**Interface:**
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

**Estilo:**
- Chips con bordes redondeados
- Iconos Lucide 18px
- Colores por categoría
- Animación de expansión
```

### **5) Building Link Card**

```markdown
Crea `components/building/BuildingLinkCard.tsx`.

**Requisitos:**
- Props: `buildingName`, `photo`, `href`
- Card con foto y link a Building Page
- Micro-interacciones hover
- Lazy loading de imagen
- Contador de unidades disponibles

**Interface:**
```typescript
interface BuildingLinkCardProps {
  buildingName: string;
  photo: string;
  href: string;
  unitCount?: number;
}
```

**Estilo:**
- Card con sombra y hover
- Imagen con overlay
- Badge con contador
- Arrow icon para indicar link
```

### **6) Preevaluación Express**

```markdown
Crea `components/flow/PreapprovalForm.tsx` (Zod + server action).

**Requisitos:**
- Campos: RUT, sueldo, fecha-mudanza
- Devuelve status: `ok`/`review`/`nope`
- Si `ok` => abre VisitScheduler
- Validación en tiempo real
- Loading states
- Error handling

**Interface:**
```typescript
interface PreapprovalFormProps {
  onResult: (result: 'ok' | 'review' | 'nope') => void;
  propertyId: string;
}
```

**Schema Zod:**
```typescript
const preapprovalSchema = z.object({
  rut: z.string().regex(/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/),
  salary: z.number().min(300000),
  moveInDate: z.date().min(new Date())
});
```

**Estilo:**
- Form compacto y claro
- Progress indicator
- Resultado con animación
- CTA destacado para siguiente paso
```

### **7) Agenda de Visitas**

```markdown
Crea `components/flow/VisitScheduler.tsx` con chips Hoy/Mañana/Sábado y slots horarios.

**Requisitos:**
- Chips de fecha rápida: Hoy / Mañana / Sábado
- Slots horarios disponibles
- Confirmación + instrucciones + add-to-calendar
- Integración con Google Calendar
- Email de confirmación

**Interface:**
```typescript
interface VisitSchedulerProps {
  slots: Slot[];
  onConfirm: (slot: Slot) => void;
  propertyId: string;
}

interface Slot {
  date: Date;
  time: string;
  available: boolean;
}
```

**Estilo:**
- Calendar view compacto
- Slots disponibles destacados
- Confirmación modal
- Instrucciones claras
```

### **8) Sección Comuna**

```markdown
Crea `components/commune/CommuneLifeSection.tsx`.

**Requisitos:**
- Hero (imagen), 4 highlights con iconos
- Mini-mapa mock con 3 pins
- Testimonio, CTA
- Data en `data/communes/estacion-central.ts`

**Interface:**
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

**Estilo:**
- Hero image con overlay
- Highlights en grid 2x2
- Mapa interactivo
- Testimonio con avatar
- CTA contextual
```

### **9) Propiedades Relacionadas**

```markdown
Crea `components/property/RelatedProperties.tsx`.

**Requisitos:**
- 4 mini-cards (mismo edificio o comuna)
- Virtualización para performance
- Lazy loading de imágenes
- Swipe horizontal en mobile

**Interface:**
```typescript
interface RelatedPropertiesProps {
  properties: Property[];
  currentPropertyId: string;
}
```

**Estilo:**
- Cards compactas
- Imagen thumbnail
- Precio destacado
- Badge de distancia
```

### **10) FAQ + Legal**

```markdown
Crea `components/property/PropertyFAQ.tsx`.

**Requisitos:**
- 3 preguntas frecuentes
- Enlaces legales (contrato, privacidad)
- Accordion expandible
- Búsqueda de preguntas

**Interface:**
```typescript
interface PropertyFAQProps {
  faqs: FAQ[];
  legalLinks: LegalLink[];
}

interface FAQ {
  question: string;
  answer: string;
  category: string;
}
```

**Estilo:**
- Accordion con animación
- Iconos para expandir
- Links legales en footer
- Búsqueda con filtros
```

## 🔧 Prompts de Configuración

### **Lighthouse CI**

```markdown
Configura Lighthouse CI en `.github/workflows/lighthouse.yml`.

**Requisitos:**
- Umbrales: LCP < 2.5s, INP < 200ms, CLS < 0.1
- Falla el job si no cumple
- Upload artifacts
- Reporte detallado

**Configuración:**
```yaml
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
```

### **Performance Monitoring**

```markdown
Configura métricas de performance con `@vercel/analytics`.

**Requisitos:**
- Track Core Web Vitals
- Custom events para CTA clicks
- Performance budgets
- Alertas automáticas

**Implementación:**
```typescript
import { track } from '@vercel/analytics';

// Track CTA clicks
track('cta_book_click', { propertyId, commune });
track('cta_whatsapp_click', { propertyId, commune });

// Track performance
track('page_view', { 
  propertyId, 
  commune, 
  loadTime: performance.now() 
});
```
```

## 📝 Notas de Implementación

### **Patrones Comunes**
- Usar `React.memo()` para optimización
- Implementar `useCallback` para handlers
- Lazy loading para componentes pesados
- Error boundaries para manejo de errores
- Tests unitarios para cada componente

### **Accesibilidad**
- `role` y `aria-label` en todos los componentes
- Keyboard navigation completa
- Screen reader compatible
- Contraste AA+ en todos los textos
- Hit areas mínimas de 44px

### **Performance**
- Lazy loading de imágenes
- Code splitting por componente
- Memoización de cálculos costosos
- Virtualización para listas largas
- Preloading de recursos críticos
