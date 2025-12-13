# Página "Cómo Vivir en..."

## 🎯 Objetivo
Crear una página de presentación de comunas con experiencia visual rica y secciones de departamentos organizadas en carruseles, que sirva como punto de entrada para explorar cada comuna.

## 🏗️ Estructura de Página

### URL Structure
```
/como-vivir-en/[comuna-slug]/
```

### Layout de Página
```
┌─────────────────────────────────────┐
│ Hero Section                        │
│ ┌─────────────────────────────────┐ │
│ │ Imagen de fondo de la comuna   │ │
│ │ Título: "Cómo Vivir en [Comuna]"│ │
│ │ Descripción atractiva          │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Estadísticas Destacadas             │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│ │Precio   │ │Metro    │ │Propiedad│ │
│ │Promedio │ │Cercano  │ │es       │ │
│ └─────────┘ └─────────┘ └─────────┘ │
├─────────────────────────────────────┤
│ Secciones de Departamentos          │
│ ┌─────────────────────────────────┐ │
│ │ Proyectos Destacados           │ │
│ │ [Carrusel horizontal]          │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Del Más Barato al Más Caro     │ │
│ │ [Carrusel horizontal]          │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Cerca del Metro                │ │
│ │ [Carrusel horizontal]          │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Con Estacionamiento Incluido   │ │
│ │ [Carrusel horizontal]          │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Información de la Comuna            │
│ ┌─────────────────────────────────┐ │
│ │ Historia, Transporte, Servicios│ │
│ │ Galería de imágenes            │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## 🧩 Componentes a Crear

### ComoVivirHero
```typescript
interface ComoVivirHeroProps {
  comuna: {
    nombre: string;
    slug: string;
    imagenHero: string;
    descripcion: string;
    tagline: string;
  };
}
```

### ComunaStatsGrid
```typescript
interface ComunaStatsGridProps {
  estadisticas: {
    precioPromedio: number;
    estacionesMetro: number;
    cantidadPropiedades: number;
    tiempoPromedioCentro: number;
    densidadPoblacional: number;
    indiceSeguridad: number;
  };
}
```

### PropertyCarousel
```typescript
interface PropertyCarouselProps {
  titulo: string;
  subtitulo?: string;
  propiedades: Property[];
  filtro: string;
  showViewAll?: boolean;
  maxItems?: number;
}
```

### ComunaInfoSection
```typescript
interface ComunaInfoSectionProps {
  comuna: {
    historia: string;
    transporte: TransporteInfo[];
    servicios: ServicioInfo[];
    entretenimiento: EntretenimientoInfo[];
    galeria: string[];
  };
}
```

## 📊 Secciones de Departamentos

### Secciones Principales
1. **Proyectos Destacados**
   - Mejores propiedades de la comuna
   - Filtro: Rating alto + buenas fotos
   - Máximo: 8 propiedades

2. **Del Más Barato al Más Caro**
   - Ordenadas por precio ascendente
   - Filtro: Precio
   - Máximo: 6 propiedades

3. **Cerca del Metro**
   - Propiedades a menos de 500m de estaciones
   - Filtro: Distancia a metro
   - Máximo: 6 propiedades

4. **Con Estacionamiento Incluido**
   - Propiedades que incluyen estacionamiento
   - Filtro: Amenidades
   - Máximo: 6 propiedades

### Secciones Secundarias
- **Nuevos Proyectos** - Propiedades recientes
- **Oportunidades** - Mejor relación precio/calidad
- **Premium** - Propiedades de alta gama
- **Con Terraza** - Filtro por amenidades específicas
- **Cerca de Parques** - Filtro por proximidad a áreas verdes

## 🔧 Implementación Técnica

### Estructura de Datos
```typescript
interface ComoVivirPage {
  comuna: ComunaInfo;
  estadisticas: ComunaStats;
  secciones: ComoVivirSection[];
  informacion: ComunaInfoSection;
}

interface ComoVivirSection {
  id: string;
  titulo: string;
  subtitulo?: string;
  filtro: FilterConfig;
  propiedades: Property[];
  orden: number;
  maxItems: number;
  showViewAll: boolean;
}

interface FilterConfig {
  tipo: 'destacados' | 'precio' | 'ubicacion' | 'amenidades' | 'fecha';
  parametros: Record<string, any>;
  ordenamiento?: 'asc' | 'desc';
}
```

### API Endpoints
```typescript
// GET /api/como-vivir-en/[slug]
interface ComoVivirResponse {
  pagina: ComoVivirPage;
  secciones: ComoVivirSection[];
}

// GET /api/como-vivir-en/[slug]/secciones/[sectionId]
interface SeccionResponse {
  seccion: ComoVivirSection;
  propiedades: Property[];
}
```

### Generación de Páginas
- ISR con revalidación cada 12 horas
- Fallback para comunas no existentes
- Optimización de imágenes con Next.js Image

## 🎨 Diseño y UX

### Hero Section
- Imagen de fondo de alta calidad
- Overlay con gradiente para legibilidad
- Título grande y llamativo
- Descripción atractiva y concisa
- Call-to-action sutil

### Estadísticas
- Cards con iconos
- Números destacados
- Animaciones de entrada
- Responsive grid

### Carruseles
- Navegación con flechas
- Indicadores de progreso
- Scroll suave
- Hover effects en PropertyCards
- Botón "Ver todas" cuando aplica

### Información Contextual
- Tabs para organizar contenido
- Galería de imágenes
- Mapa interactivo
- Lista de servicios

## 📈 Métricas y Analytics

### Eventos a Trackear
- Vista de página "Cómo vivir en"
- Clic en sección específica
- Interacción con carrusel
- Clic en "Ver todas"
- Navegación a propiedad específica

### Métricas de Engagement
- Tiempo de permanencia
- Scroll depth
- Propiedades vistas por sección
- Conversiones por comuna

## 🚀 Roadmap

### Fase 1: MVP
- [ ] Crear layout básico de página
- [ ] Implementar Hero y Stats
- [ ] Crear 2-3 secciones básicas
- [ ] 1-2 comunas piloto

### Fase 2: Funcionalidad Completa
- [ ] Todas las secciones implementadas
- [ ] Carruseles interactivos
- [ ] Información contextual completa
- [ ] 5-10 comunas

### Fase 3: Optimización
- [ ] Performance y SEO
- [ ] Analytics avanzados
- [ ] Personalización
- [ ] Todas las comunas

## 💡 Ideas Adicionales

### Funcionalidades Futuras
- Comparador de comunas
- Calculadora de costos de vida
- Guías de barrios
- Testimonios de residentes
- Eventos y actividades locales
