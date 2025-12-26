# Estructura Visual del Copy - Home Page

## 📐 LAYOUT COMPLETO

```
┌─────────────────────────────────────────────────────────────┐
│                    HEADER / NAVBAR                           │
│  [Logo] [Nav]                    [Search] [whatsapp]         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    HERO SECTION                              │
│                                                               │
│              [Badge: La forma más fácil de encontrar arriendo]                 │
│                                                               │
│         Arrienda departamentos                               │
│              en [Santiago] ← Componente dinámico que rota cada segundo        │
│              con otras comunas disponibles (Ñuñoa, Las Condes, etc.)          │
│                                                               │
│  Propiedades dedicadas para arrendar. Experiencia hotelera.      │
│  Agenda visitas, compara precios y arrienda 100% online.    │
│                                                               │
│    [Buscar departamentos]  [Ver todos los departamentos]   │
│                                                               │
│    [0%] Comisión    [100%] Digital    [+X] Propiedades disponibles     │
│    (X = número dinámico desde BD)                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              SEARCH SECTION                                   │
│                                                               │
│              Encuentra tu departamento                        │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Busca por comuna, dirección o nombre de edificio...  │   │
│  │                                    [🔽 Filtros]      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  FILTROS (Desplegables al hacer click en botón)     │   │
│  │                                                       │   │
│  │  [Comuna pills] [Dormitorios pills]                 │   │
│  │                                                       │   │
│  │  Precio mínimo: [____]  Precio máximo: [____]       │   │
│  │                                                       │   │
│  │              [Buscar departamentos]                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│         Ver todos los departamentos →                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│           FEATURED UNITS SECTION                              │
│                                                               │
│         Departamentos destacados                              │
│                                                               │
│  [Card] [Card] [Card] [Card] [Card] [Card]                  │
│                                                               │
│         Departamentos en Ñuñoa                               │
│                                                               │
│  [Card] [Card] [Card] [Card] [Card] [Card]                  │
│                                                               │
│         Departamentos 1 dormitorio                           │
│                                                               │
│  [Card] [Card] [Card] [Card] [Card] [Card]                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│            BENEFITS SECTION                                   │
│                                                               │
│                  Por qué elegirnos                            │
│                                                               │
│        Proceso simple, transparente y 100% digital           │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Arrienda sin │  │ Proceso 100% │  │ Propiedades  │      │
│  │   estrés     │  │   digital    │  │ verificadas  │      │
│  │              │  │              │  │              │      │
│  │ Proceso      │  │ Agenda       │  │ Cada         │      │
│  │ guiado paso  │  │ visitas,     │  │ departamento │      │
│  │ a paso...    │  │ compara...   │  │ verificado...│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 JERARQUÍA VISUAL

### Tamaños de Texto Recomendados

#### Hero Section
- **Badge**: `text-sm` (14px) - "La forma más fácil de encontrar arriendo"
- **Headline (H1)**: `text-4xl sm:text-6xl lg:text-7xl` (48-72px)
  - **Parte estática**: "Arrienda departamentos en"
  - **Parte dinámica**: Componente rotativo con comunas (mismo tamaño, animación suave)
- **Subheadline**: `text-lg sm:text-xl lg:text-2xl` (18-24px)
- **CTAs**: `text-base sm:text-lg` (16-18px)
- **Stats**: `text-2xl` (24px) para número, `text-sm` (14px) para label
  - **Tercer stat**: Número dinámico de propiedades desde BD

#### Search Section
- **Título (H2)**: `text-2xl sm:text-3xl` (24-30px)
- **Input placeholder**: `text-base` (16px)
- **Botón Filtros**: `text-sm` (14px) - Icono + texto "Filtros"
- **Panel Filtros Desplegable**: 
  - Animación: slide-down con fade
  - Padding: `p-6` (24px)
  - Background: `bg-soft/30 backdrop-blur-sm`
- **Labels**: `text-sm` (14px)
- **CTA**: `text-base sm:text-lg` (16-18px)

#### Featured Units
- **Título (H2)**: `text-2xl sm:text-3xl` (24-30px)
- **Subtítulo (opcional)**: `text-base` (16px)
- **Card title**: `text-lg` (18px)
- **Card price**: `text-xl font-bold` (20px)

#### Benefits
- **Título (H2)**: `text-3xl sm:text-4xl` (30-36px)
- **Subtítulo**: `text-lg` (18px)
- **Card title**: `text-xl` (20px)
- **Card description**: `text-base` (16px)

---

## 📊 FLUJO DE LECTURA (F-Pattern)

```
┌─────────────────────────────────────────┐
│ Hero: "Arrienda departamentos..."       │ ← Primera línea (crítico)
│                                         │
│ Search: "Encuentra tu departamento"     │ ← Segunda línea
│                                         │
│ Featured: "Departamentos destacados"   │ ← Tercera línea
│                                         │
│ Benefits: "Por qué elegirnos"          │ ← Cuarta línea
└─────────────────────────────────────────┘
```

### Puntos de Atención
1. **Hero Badge** → "La forma más fácil de encontrar arriendo" (captura inicial)
2. **Hero Headline Dinámico** → Componente rotativo de comunas (genera interés)
3. **Hero CTA** → Primera acción (scroll o click)
4. **Search Input + Filtros Desplegables** → Segunda acción (búsqueda avanzada)
5. **Featured Cards** → Prueba social (propiedades reales)
6. **Benefits** → Confianza (cierre de venta)

---

## 🎨 CONTRASTE Y LEGIBILIDAD

### Colores de Texto
- **Headlines**: `text-text` (alto contraste)
- **Subheadlines**: `text-subtext` (contraste medio)
- **Body text**: `text-text` (alto contraste)
- **Labels**: `text-subtext` (contraste medio)
- **CTAs**: `text-white` sobre fondo de color

### Espaciado
- **Entre secciones**: `py-16 lg:py-24` (64-96px)
- **Entre elementos**: `space-y-6` (24px)
- **Padding interno**: `px-6 lg:px-8` (24-32px)

---

## 📱 ADAPTACIÓN MÓVIL

### Desktop (≥1024px)
```
┌─────────────────────────────────────────┐
│  Hero: Texto completo, 2 CTAs lado a    │
│  lado, stats en grid 3 columnas         │
└─────────────────────────────────────────┘
```

### Mobile (<1024px)
```
┌─────────────────────────────────────────┐
│  Hero: Texto reducido, CTAs apilados,   │
│  stats en columna única                 │
└─────────────────────────────────────────┘
```

### Cambios Específicos Móvil
- **Headline**: Reducir de 7xl a 4xl
- **Subheadline**: Reducir de 2xl a lg
- **CTAs**: Apilar verticalmente
- **Stats**: Grid de 3 columnas a 1 columna
- **Benefits**: Grid de 3 a 1 columna

---

## 🎬 COMPONENTES DINÁMICOS

### Hero - Rotador de Comunas

**Comportamiento:**
- Rotación automática cada 2-3 segundos
- Transición suave: fade out/in o slide
- Comunas a mostrar: Santiago, Ñuñoa, Las Condes, Providencia, etc.
- Orden: Basado en disponibilidad de propiedades (más disponibles primero)

**Implementación:**
```tsx
// Ejemplo de estructura
<HeroHeadline>
  Arrienda departamentos en
  <RotatingCommunes 
    communes={['Santiago', 'Ñuñoa', 'Las Condes', 'Providencia']}
    interval={2500}
    animation="fade"
  />
</HeroHeadline>
```

**Estados:**
- Loading: Mostrar "Santiago" por defecto
- Error: Mantener última comuna mostrada
- Empty: Mostrar "Santiago" como fallback

---

### Stats - Contador de Propiedades

**Comportamiento:**
- Número dinámico desde BD
- Actualización: En tiempo real o cada X minutos
- Formato: "+X Propiedades disponibles"
- Ejemplo: "+127 Propiedades disponibles"

**Implementación:**
```tsx
// Ejemplo de estructura
<StatCard>
  <Number>{propertyCount}</Number>
  <Label>Propiedades disponibles</Label>
</StatCard>
```

**Estados:**
- Loading: Mostrar skeleton o "Cargando..."
- Error: Mostrar último número conocido o "-"
- Empty: Mostrar "0" o mensaje alternativo

---

## 🔽 FILTROS DESPLEGABLES

### Comportamiento del Panel

**Estado Inicial:**
- Input de búsqueda visible
- Botón "Filtros" visible (icono + texto)
- Panel de filtros oculto (collapsed)

**Al hacer click en "Filtros":**
- Panel se despliega con animación slide-down + fade
- Input de búsqueda permanece visible
- Botón cambia a "Ocultar filtros" o icono X

**Contenido del Panel:**
- Pills de Comuna
- Pills de Dormitorios
- Inputs de Precio (mínimo/máximo)
- CTA "Buscar departamentos"

**Estados:**
- **Collapsed**: Altura 0, opacity 0, overflow hidden
- **Expanded**: Altura auto, opacity 1, padding visible
- **Transition**: 300ms ease-in-out

**Mobile:**
- Panel puede ser full-width o modal overlay
- Botón de cerrar más prominente
- Backdrop blur opcional

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN VISUAL

### Tipografía
- [ ] Headlines usan fuente bold (700-800)
- [ ] Body text usa fuente regular (400)
- [ ] CTAs usan fuente semibold (600)
- [ ] Line-height adecuado (1.5-1.75 para body, 1.2 para headlines)

### Espaciado
- [ ] Mínimo 24px entre secciones
- [ ] Mínimo 16px entre elementos relacionados
- [ ] Padding lateral consistente (24px mobile, 32px desktop)

### Contraste
- [ ] Headlines tienen contraste mínimo 4.5:1
- [ ] Body text tiene contraste mínimo 4.5:1
- [ ] CTAs tienen contraste mínimo 3:1 sobre fondo

### Responsive
- [ ] Texto se reduce apropiadamente en móvil
- [ ] CTAs se apilan en móvil
- [ ] Grids se adaptan (3→1 columna en móvil)
- [ ] Componente dinámico de comunas funciona en móvil (velocidad de rotación adecuada)
- [ ] Panel de filtros desplegable se adapta a móvil (full-width o modal)

### Componentes Dinámicos
- [ ] Hero: Componente rotativo de comunas (velocidad: 2-3 segundos por comuna)
- [ ] Stats: Número de propiedades se actualiza desde BD en tiempo real
- [ ] Animaciones respetan `prefers-reduced-motion`

---

**Última actualización**: 2025-01-XX

