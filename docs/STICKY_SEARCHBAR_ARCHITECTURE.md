# Arquitectura del Sticky SearchBar (Opción A)

## Resumen

Este documento explica cómo funciona el sistema de búsqueda sticky implementado, donde **una sola instancia** del SearchBar vive en el Hero y se transforma a modo sticky al hacer scroll.

## Componentes

### 1. `useStickyObserver` Hook

**Ubicación**: `hooks/useStickyObserver.ts`

Hook personalizado que usa `IntersectionObserver` para detectar cuando un elemento sentinel sale del viewport.

**Funcionamiento**:
- Observa un elemento sentinel (div invisible) 
- Cuando el sentinel sale del viewport → `isSticky = true`
- Cuando el sentinel vuelve al viewport → `isSticky = false`
- Usa `rootMargin: '-64px 0px 0px 0px'` para activar 64px antes de que el sentinel salga completamente

**API**:
```typescript
const { isSticky } = useStickyObserver({
  sentinelId: 'search-bar-sentinel',  // ID del elemento a observar
  threshold: 0,                        // Umbral de intersección
  rootMargin: '-64px 0px 0px 0px',    // Margen para activación anticipada
  enabled: true                        // Si el observer está habilitado
});
```

### 2. `SearchBarController` Component

**Ubicación**: `components/marketing/SearchBarController.tsx`

Componente controller que maneja la transición del SearchBar de hero a sticky.

**Responsabilidades**:
- Renderizar el elemento sentinel
- Gestionar el placeholder para evitar CLS (Cumulative Layout Shift)
- Aplicar clases CSS condicionales según `isSticky`
- Medir altura del SearchBar con `ResizeObserver`
- Renderizar `UnifiedSearchBar` con estilos sticky condicionales

**Estructura**:
```
SearchBarController
├── Sentinel (div invisible al final)
├── Placeholder (solo cuando isSticky = true)
└── UnifiedSearchBar (con clases sticky condicionales)
```

### 3. `UnifiedSearchBar` Component (Modificado)

**Ubicación**: `components/marketing/UnifiedSearchBar.tsx`

**Cambios realizados**:
- ❌ Eliminada lógica de `variant="sticky"`
- ❌ Eliminado estado `isSticky` interno
- ❌ Eliminado `useEffect` para scroll detection
- ✅ Mantiene `variant="hero"` e `variant="inline"`
- ✅ El sticky es manejado externamente por `SearchBarController`

## Flujo de Datos

```
1. Usuario hace scroll
   ↓
2. Sentinel sale del viewport
   ↓
3. IntersectionObserver detecta cambio
   ↓
4. useStickyObserver actualiza isSticky = true
   ↓
5. SearchBarController aplica clases sticky:
   - position: fixed
   - top: 0
   - backdrop-blur
   - shadow
   ↓
6. Placeholder mantiene espacio original (evita CLS)
```

## Prevención de CLS (Cumulative Layout Shift)

El CLS ocurre cuando un elemento cambia de `relative` a `fixed` y el espacio que ocupaba "desaparece", causando que el contenido debajo salte hacia arriba.

**Solución implementada**:

1. **Medir altura real**: `ResizeObserver` mide la altura del SearchBar
2. **Placeholder condicional**: Cuando `isSticky = true`, renderizamos un div con la altura exacta
3. **Transición suave**: `transition-all duration-300` suaviza el cambio

```typescript
// Placeholder mantiene el espacio
{isSticky && searchBarHeight !== null && (
  <div 
    style={{ height: searchBarHeight }}
    aria-hidden="true"
  />
)}
```

## Accesibilidad

- ✅ Sentinel tiene `aria-hidden="true"` (no anuncia a screen readers)
- ✅ Placeholder tiene `aria-hidden="true"` (no anuncia a screen readers)
- ✅ Respeta `prefers-reduced-motion` (desactiva animaciones)
- ✅ Foco se mantiene al cambiar de posición (no hay cambio en el DOM)
- ✅ Navegación por teclado funciona en todos los estados

## Performance

### Optimizaciones implementadas:

1. **IntersectionObserver**: Más eficiente que scroll events
   - Nativo del browser
   - No requiere throttle/debounce
   - Pasivo por defecto

2. **ResizeObserver**: Solo mide cuando cambia tamaño
   - Se limpia en cleanup
   - No causa reflows innecesarios

3. **useMemo**: Clases CSS se memorizan
   ```typescript
   const containerClasses = useMemo(() => clx(...), [isSticky, prefersReducedMotion]);
   ```

4. **Cleanup**: Todos los observers se desconectan al desmontar

### Renders esperados:

- Inicial: 1 render
- Al activar sticky: 2-3 renders (isSticky + altura del placeholder)
- Total: < 5 renders en toda la sesión

## Rollback

Si es necesario revertir a la implementación anterior:

1. Descomentar `StickySearchWrapper.tsx`
2. Restaurar import en `app/page.tsx`:
   ```typescript
   import { StickySearchWrapper } from "@/components/marketing/StickySearchWrapper";
   ```
3. Agregar componente en `app/page.tsx`:
   ```tsx
   <StickySearchWrapper heroId="hero-section" />
   ```
4. Revertir `HeroV2.tsx`:
   ```tsx
   <UnifiedSearchBar variant="hero" showAdvancedFilters={true} />
   ```
5. Restaurar lógica sticky en `UnifiedSearchBar.tsx` (ver commit anterior)

**Tiempo estimado**: < 5 minutos

## Testing Checklist

### Desktop
- [ ] SearchBar se renderiza una sola vez en el DOM
- [ ] Al hacer scroll, se vuelve sticky suavemente
- [ ] No hay "jump" de layout (CLS = 0)
- [ ] Transición de 300ms se ve fluida
- [ ] Submit navega a `/buscar?q=...`

### Mobile
- [ ] Sticky funciona en iOS Safari
- [ ] Backdrop blur funciona
- [ ] Sheet modal se abre al tocar input
- [ ] Foco se mantiene

### A11y
- [ ] Tab navigation funciona
- [ ] Screen reader anuncia correctamente
- [ ] `prefers-reduced-motion` respetado

### Performance
- [ ] < 3 re-renders al activar sticky
- [ ] Observers se limpian correctamente
- [ ] LCP sin degradación

## Troubleshooting

### Problema: El sticky no se activa

**Causa**: Sentinel no está en el DOM o tiene ID incorrecto

**Solución**: Verificar que el sentinel se renderiza:
```typescript
<div id="search-bar-sentinel" />
```

### Problema: Hay un "jump" de layout

**Causa**: Placeholder no tiene la altura correcta

**Solución**: Verificar que `ResizeObserver` está midiendo:
```typescript
console.log('SearchBar height:', searchBarHeight);
```

### Problema: El sticky parpadea (flicker)

**Causa**: Threshold o rootMargin mal configurados

**Solución**: Ajustar valores:
```typescript
rootMargin: '-64px 0px 0px 0px'  // Activar antes
threshold: 0                      // Cuando sale completamente
```

### Problema: Performance issues (muchos renders)

**Causa**: Clases no están memoizadas

**Solución**: Verificar `useMemo` en `SearchBarController`

## Referencias

- [IntersectionObserver MDN](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [ResizeObserver MDN](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)
- [Cumulative Layout Shift (CLS)](https://web.dev/cls/)
- [Plan de implementación original](../.cursor/plans/single_sticky_searchbar_implementation_94f69c86.plan.md)
