# Páginas de Comunas Específicas

## 🎯 Objetivo
Crear páginas dedicadas a cada comuna con secciones de departamentos filtrados por esa ubicación específica, incluyendo información contextual y estadísticas de la comuna.

## 🏗️ Estructura de Página

### URL Structure
```
/comuna/[slug]/
```

### Layout de Página
```
┌─────────────────────────────────────┐
│ Hero Section (Imagen + Título)      │
├─────────────────────────────────────┤
│ Estadísticas de la Comuna           │
├─────────────────────────────────────┤
│ Secciones de Departamentos:         │
│ ┌─────────────────────────────────┐ │
│ │ Proyectos Destacados           │ │
│ │ [Carrusel de PropertyCards]    │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Del Más Barato al Más Caro     │ │
│ │ [Carrusel de PropertyCards]    │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Cerca del Metro                │ │
│ │ [Carrusel de PropertyCards]    │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Con Estacionamiento Incluido   │ │
│ │ [Carrusel de PropertyCards]    │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Información de la Comuna            │
└─────────────────────────────────────┘
```

## 🧩 Componentes a Crear

### ComunaHero
```typescript
interface ComunaHeroProps {
  comuna: {
    nombre: string;
    slug: string;
    imagen: string;
    descripcion: string;
  };
}
```

### ComunaStats
```typescript
interface ComunaStatsProps {
  estadisticas: {
    precioPromedio: number;
    cantidadPropiedades: number;
    estacionesMetro: number;
    tiempoPromedioCentro: number;
    densidadPoblacional: number;
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
}
```

### ComunaInfo
```typescript
interface ComunaInfoProps {
  comuna: {
    historia: string;
    transporte: string[];
    servicios: string[];
    entretenimiento: string[];
    imagenes: string[];
  };
}
```

## 📊 Secciones de Departamentos

### Secciones Fijas
1. **Proyectos Destacados** - Mejores propiedades de la comuna
2. **Del Más Barato al Más Caro** - Ordenadas por precio
3. **Cerca del Metro** - Filtro por proximidad a estaciones
4. **Con Estacionamiento Incluido** - Filtro por amenidades

### Secciones Dinámicas
- **Nuevos Proyectos** - Propiedades recientes
- **Oportunidades** - Mejor relación precio/calidad
- **Premium** - Propiedades de alta gama
- **Con Terraza** - Filtro por amenidades específicas
- **Cerca de Parques** - Filtro por proximidad a áreas verdes

## 🔧 Implementación Técnica

### Estructura de Datos
```typescript
interface ComunaPage {
  slug: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  estadisticas: ComunaStats;
  secciones: ComunaSection[];
  informacion: ComunaInfo;
}

interface ComunaSection {
  id: string;
  titulo: string;
  subtitulo?: string;
  filtro: FilterConfig;
  propiedades: Property[];
  orden: number;
}

interface FilterConfig {
  tipo: 'precio' | 'ubicacion' | 'amenidades' | 'fecha';
  parametros: Record<string, any>;
}
```

### API Endpoints
```typescript
// GET /api/comunas/[slug]
interface ComunaResponse {
  comuna: ComunaPage;
  secciones: ComunaSection[];
}

// GET /api/comunas/[slug]/secciones/[sectionId]
interface SeccionResponse {
  seccion: ComunaSection;
  propiedades: Property[];
}
```

### Generación de Páginas
- Usar ISR (Incremental Static Regeneration)
- Revalidación cada 24 horas
- Fallback para comunas no existentes

## 📍 Filtros por Comuna

### Filtros Automáticos
- **Ubicación**: Comuna específica
- **Precio**: Rango promedio de la comuna
- **Metro**: Estaciones cercanas
- **Amenidades**: Disponibles en la zona

### Filtros Dinámicos
- Basados en datos de la comuna
- Personalizados según demanda
- Adaptativos según estación del año

## 🎨 Diseño y UX

### Hero Section
- Imagen de alta calidad de la comuna
- Título y descripción atractiva
- Call-to-action para explorar propiedades

### Carruseles
- Navegación con flechas
- Indicadores de progreso
- Responsive design
- Animaciones suaves con Framer Motion

### Información Contextual
- Historia de la comuna
- Transporte público
- Servicios disponibles
- Entretenimiento y cultura

## 📈 Métricas y Analytics

### Métricas a Seguir
- Visitas por comuna
- Tiempo de permanencia
- Clics en propiedades
- Conversiones por sección
- Propiedades más vistas

### Eventos a Trackear
- Vista de sección
- Clic en propiedad
- Interacción con carrusel
- Navegación entre secciones

## 🚀 Roadmap

### Fase 1: Estructura Básica
- [ ] Crear layout de página de comuna
- [ ] Implementar componentes básicos
- [ ] Crear 3-5 páginas de comunas piloto

### Fase 2: Secciones Dinámicas
- [ ] Implementar todas las secciones
- [ ] Filtros automáticos
- [ ] Carruseles interactivos

### Fase 3: Optimización
- [ ] ISR y cache
- [ ] Analytics y métricas
- [ ] SEO y performance
