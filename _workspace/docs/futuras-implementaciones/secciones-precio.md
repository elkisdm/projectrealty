# Secciones por Rango de Precio

## 🎯 Objetivo
Crear secciones dinámicas que muestren departamentos filtrados por rangos de precio específicos, tanto en la página principal como en páginas de comunas específicas.

## 📊 Rangos Propuestos

### Básicos
- **$150.000 - $200.000** - Oportunidades
- **$200.000 - $250.000** - Accesibles
- **$250.000 - $300.000** - Mejores opciones
- **$300.000 - $400.000** - Intermedio
- **$400.000 - $500.000** - Semi-premium
- **$500.000+** - Premium

### Dinámicos
- Basados en el precio promedio de la comuna
- Rangos personalizados según demanda
- Oportunidades (mejor relación precio/calidad)

## 🧩 Componentes a Crear

### PriceRangeSection
```typescript
interface PriceRangeSectionProps {
  minPrice: number;
  maxPrice: number;
  title: string;
  subtitle?: string;
  properties: Property[];
  showViewAll?: boolean;
}
```

### PriceRangeFilter
```typescript
interface PriceRangeFilterProps {
  ranges: PriceRange[];
  selectedRange?: PriceRange;
  onRangeChange: (range: PriceRange) => void;
}
```

### PropertyGrid
```typescript
interface PropertyGridProps {
  properties: Property[];
  layout: 'grid' | 'carousel';
  showFilters?: boolean;
}
```

## 📍 Ubicaciones de Implementación

### Página Principal
- Sección "Oportunidades por Precio"
- Carruseles horizontales por rango
- Call-to-action para ver más

### Páginas de Comunas
- Secciones específicas por comuna
- Filtros automáticos por ubicación
- Comparación con precios promedio

### Página de Búsqueda
- Filtros dinámicos por rango
- Resultados en tiempo real
- Ordenamiento por precio

## 🔧 Implementación Técnica

### API Endpoints
```typescript
// GET /api/properties/price-range
interface PriceRangeResponse {
  range: {
    min: number;
    max: number;
  };
  properties: Property[];
  total: number;
  averagePrice: number;
}
```

### Filtros en Servidor
- Implementar en `app/api/properties/route.ts`
- Cache con ISR para rangos populares
- Paginación para grandes volúmenes

### Componentes UI
- Usar `PropertyCard` existente
- Implementar carrusel con Framer Motion
- Responsive design con Tailwind

## 📈 Métricas a Seguir

- Clics en secciones por rango
- Conversiones por rango de precio
- Tiempo de permanencia en secciones
- Propiedades más vistas por rango

## 🚀 Roadmap

### Fase 1: Básico
- [ ] Crear componente `PriceRangeSection`
- [ ] Implementar filtros básicos
- [ ] Añadir a página principal

### Fase 2: Dinámico
- [ ] Rangos automáticos por comuna
- [ ] Filtros avanzados
- [ ] Páginas de comunas específicas

### Fase 3: Optimización
- [ ] Cache inteligente
- [ ] Métricas y analytics
- [ ] Personalización por usuario
