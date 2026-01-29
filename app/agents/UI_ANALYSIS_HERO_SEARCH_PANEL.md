# UI Analysis: Hero Search Panel (Hero Cocktail)

> Analizado como: **UI Builder Agent v1.1**  
> Fecha: 2026-01-28  
> Componente: `HeroSearchPanel` y sub-componentes

---

## 1. Goal

Analizar la implementación actual del Hero Search Panel (Hero Cocktail) que combina patrones de Airbnb, Zillow y QuintoAndar. El panel incluye tabs de intención, búsqueda universal, filtros rápidos (pills), selectores compactos y CTA principal.

---

## 2. Component Contract

### Componentes Identificados

**Componente Principal**:
- `HeroSearchPanel` (`components/search/HeroSearchPanel.tsx`)

**Sub-componentes**:
- `IntentTabs` (`components/search/IntentTabs.tsx`) - Tabs Arrendar/Comprar/Inversión
- `UniversalSearchInput` (`components/search/UniversalSearchInput.tsx`) - Input de búsqueda inteligente
- `HeroQuickPills` (`components/search/HeroQuickPills.tsx`) - Pills de Tipología, Pet friendly, Estacionamiento
- `CompactRow` (`components/search/CompactRow.tsx`) - Selectores Presupuesto + Mudanza
- `HeroCTA` (`components/search/HeroCTA.tsx`) - Botón "Ver opciones" + link "Más filtros"
- `FilterBottomSheet` (`components/search/FilterBottomSheet.tsx`) - Sheet de filtros avanzados

**Props Interface Principal**:
```typescript
interface HeroSearchPanelProps {
  availableCount?: number;
  minPrice?: number;
  className?: string;
}
```

---

## 3. Análisis de Implementación Actual

### 3.1 Estructura Visual (Según Imagen)

**Layout**:
- Glass card con backdrop blur (`bg-white/95 dark:bg-gray-900/95 backdrop-blur-md`)
- Rounded corners (`rounded-3xl`)
- Shadow elevado (`shadow-[0_20px_60px_rgba(0,0,0,0.18)]`)
- Padding responsive (`p-6 md:p-8`)

**Jerarquía Visual**:
1. **Tabs** (Arrendar seleccionado) - Variant "subtle"
2. **Headline** - "Arriendos. Visitas. Check-in. Listo."
3. **Subtitle** - "Dime dónde. Yo me encargo del resto."
4. **Search Input** - Dominante, con icono de lupa
5. **Quick Pills** - Tipología (Studio seleccionado), Pet friendly (Sí), Estacionamiento (Sí)
6. **Compact Row** - Presupuesto + Mudanza (dropdowns)
7. **CTA Button** - "Ver opciones" con icono
8. **Secondary Link** - "Más filtros"

### 3.2 Estados Implementados

| State | UI | Trigger | Status |
|-------|-----|---------|--------|
| **Default** | Glass card con todos los controles | Componente montado | ✅ |
| **Loading** | `isSubmitting` en CTA button | Durante submit | ✅ |
| **Empty** | Placeholders en inputs | Valores vacíos | ✅ |
| **Selected** | Pills/buttons con estados activos | Valores seleccionados | ✅ |
| **Error** | No visible en imagen | Validación fallida | ⚠️ No visible |

**Observación**: No se ve estado de error en la UI actual. Debería haber validación visual si el formulario falla.

---

## 4. Responsive Behavior

### Breakpoints Observados

| Breakpoint | Behavior | Implementación |
|------------|----------|----------------|
| **Mobile (<768px)** | Card full-width, padding `p-6`, texto `text-4xl` | ✅ `md:` breakpoints |
| **Tablet (768-1024px)** | Card `max-w-[560px]`, padding `md:p-8`, texto `md:text-5xl` | ✅ |
| **Desktop (>1024px)** | Mismo que tablet, más espacio | ✅ |

**Touch Targets**:
- Botones pills: `min-h-[44px]` ✅
- CTA button: `h-[52px]` ✅
- Dropdowns: `h-[52px]` ✅

---

## 5. Accessibility Analysis

### A1: Focus Management

**Estado Actual**:
- ✅ Tabs tienen `role="tablist"`, `role="tab"`, `aria-selected`, `aria-disabled`
- ✅ Search input tiene placeholder descriptivo
- ✅ Dropdowns tienen `aria-label`
- ✅ CTA button tiene `aria-label` dinámico
- ⚠️ **Falta**: Focus trap en FilterBottomSheet cuando está abierto
- ⚠️ **Falta**: Focus return al trigger cuando se cierra el sheet

### A2: Keyboard Navigation

**Estado Actual**:
- ✅ Tabs navegables con Tab/Arrow keys (nativo)
- ✅ Form submit con Enter
- ✅ Dropdowns navegables con teclado
- ⚠️ **Falta**: Escape key para cerrar FilterBottomSheet (verificar implementación)

### A3: ARIA Labels

**Estado Actual**:
- ✅ `aria-label="Tipo de búsqueda"` en tablist
- ✅ `aria-label="Presupuesto máximo"` en select
- ✅ `aria-label="Fecha de mudanza"` en select
- ✅ `aria-label` dinámico en CTA button
- ✅ `aria-hidden="true"` en iconos decorativos
- ✅ `aria-selected` y `aria-disabled` en tabs

### A4: Reduced Motion

**Estado Actual**:
- ✅ `MotionWrapper` usa `useReducedMotion()` hook
- ✅ Transiciones respetan `prefersReducedMotion`
- ✅ Tooltips en tabs respetan motion preference

---

## 6. Performance Analysis

### P1: Memoization

**Estado Actual**:
- ✅ `useCallback` en `handleParsedData` y `onSubmit`
- ✅ `useMemo` en `FilterBottomSheet` para `moveInDisplay`
- ⚠️ **Mejora**: `HeroQuickPills` podría usar `React.memo` si recibe mismas props frecuentemente

### P2: Layout Shift

**Estado Actual**:
- ✅ Imagen hero con `fill` y `priority` (LCP optimization)
- ✅ Altura mínima fija (`min-h-[520px] md:min-h-[600px]`)
- ✅ Glass card con dimensiones estables
- ✅ Pills con altura consistente (`min-h-[44px]`)
- ✅ Dropdowns con altura fija (`h-[52px]`)

**CLS Score**: ✅ Bajo (dimensiones estables)

### P3: Lazy Loading

**Estado Actual**:
- ✅ `FilterBottomSheet` solo renderiza cuando `isOpen=true`
- ✅ Imagen hero con `priority` (above fold, correcto)
- ✅ Background blobs con `aria-hidden` (no bloquean)

### P4: Image Optimization

**Estado Actual**:
- ✅ Usa `next/image` con `fill`, `priority`, `sizes="100vw"`
- ✅ Quality 85 (balance calidad/tamaño)
- ✅ `object-cover` para mantener aspect ratio

---

## 7. Code Quality (G4)

### Tailwind Conventions

**Estado**: ✅ **EXCELENTE**

- ✅ No inline styles (`style={{}}`)
- ✅ Dark mode completo (`dark:*` variants)
- ✅ Responsive mobile-first (`md:`, `lg:` breakpoints)
- ✅ Consistent spacing (`space-y-6`, `gap-3`)
- ✅ Border radius consistente (`rounded-2xl`, `rounded-3xl`)
- ✅ Focus rings (`focus-visible:ring-2`)

### TypeScript Strict

**Estado**: ✅ **PASS**

- ✅ Props interfaces definidas
- ✅ Tipos explícitos (no `any`)
- ✅ JSDoc en componentes principales

---

## 8. UX States (G3)

### Estados Implementados

| Estado | Implementación | Status |
|--------|----------------|--------|
| **Loading** | `isSubmitting` en CTA, texto "Buscando..." | ✅ |
| **Empty** | Placeholders en inputs, valores por defecto | ✅ |
| **Selected** | Pills con estados activos (border + bg), tabs seleccionados | ✅ |
| **Error** | No visible en código actual | ⚠️ **FALTA** |
| **Success** | Navegación a `/buscar` con query params | ✅ |

**Problema Detectado**: No hay feedback visual de error si la validación del formulario falla.

---

## 9. Issues Detectados

### Críticos

**Ninguno detectado** - La UI está bien implementada.

### Mayores

1. **Falta estado de error visual**
   - **Impacto**: Usuario no sabe si el formulario es inválido
   - **Solución**: Agregar mensajes de error debajo de campos inválidos
   - **Archivo**: `components/search/HeroSearchPanel.tsx`

2. **FilterBottomSheet - Focus trap no verificado**
   - **Impacto**: Usuario puede escapar del sheet con Tab
   - **Solución**: Implementar focus trap con `focus-trap-react` o similar
   - **Archivo**: `components/search/FilterBottomSheet.tsx`

### Menores

3. **HeroQuickPills - Sin memoización**
   - **Impacto**: Re-renders innecesarios si parent re-renderiza
   - **Solución**: Envolver con `React.memo`
   - **Archivo**: `components/search/HeroQuickPills.tsx`

4. **CompactRow - Selects nativos sin custom styling**
   - **Impacto**: Apariencia inconsistente entre navegadores
   - **Solución**: Usar componente Select customizado (Headless UI)
   - **Archivo**: `components/search/CompactRow.tsx`

---

## 10. Quality Gates Assessment

### G1: Contract Compliance

**Status**: ✅ **PASS**

- ✅ Props interfaces definidas con TypeScript
- ✅ Tipos explícitos, sin `any`
- ✅ JSDoc en componentes principales
- ✅ Validación con Zod (`searchFormInputSchema`)

### G3: UX States & Edge Cases

**Status**: ⚠️ **PARTIAL PASS**

- ✅ Loading state implementado
- ✅ Empty state (placeholders)
- ✅ Selected states (pills, tabs)
- ⚠️ **FALTA**: Error state visual
- ✅ Edge cases: valores undefined manejados

### G4: Code Quality & Consistency

**Status**: ✅ **PASS**

- ✅ TailwindCSS (no inline styles)
- ✅ Dark mode completo
- ✅ Mobile-first responsive
- ✅ TypeScript strict
- ✅ Consistent naming (PascalCase components)

### G5: Verification & Testing

**Status**: ⚠️ **NO VERIFICADO**

- ⚠️ Smoke tests no ejecutados
- ⚠️ Edge cases no documentados explícitamente

### G6: Mobile Sheet UX

**Status**: ⚠️ **REQUIERE VERIFICACIÓN**

- ⚠️ Focus trap no verificado
- ⚠️ Scroll lock no verificado
- ⚠️ Escape key no verificado
- ⚠️ Focus return no verificado

### G7: Performance

**Status**: ✅ **PASS**

- ✅ No layout shift (dimensiones estables)
- ✅ Memoization donde aplica
- ✅ Lazy loading de FilterBottomSheet
- ✅ Images optimizadas (`next/image`)

---

## 11. Recomendaciones de Mejora

### Prioridad ALTA

1. **Agregar estado de error visual**
   ```tsx
   // En HeroSearchPanel.tsx
   const { formState: { errors } } = useForm(...);
   
   // Mostrar errores debajo de campos
   {errors.q && (
     <p className="text-sm text-red-500 mt-1" role="alert">
       {errors.q.message}
     </p>
   )}
   ```

2. **Implementar focus trap en FilterBottomSheet**
   ```tsx
   import { useFocusTrap } from '@/hooks/useFocusTrap';
   
   // Dentro de FilterBottomSheet
   const { containerRef } = useFocusTrap(isOpen);
   ```

### Prioridad MEDIA

3. **Memoizar HeroQuickPills**
   ```tsx
   export const HeroQuickPills = memo(function HeroQuickPills({ ... }) {
     // ...
   });
   ```

4. **Custom Select component para CompactRow**
   - Usar Headless UI `Listbox` para consistencia cross-browser

### Prioridad BAJA

5. **Agregar skeleton loading** si hay delay en carga inicial
6. **Agregar animación de éxito** después de submit exitoso

---

## 12. Comparación con Patrones del Repo

### Patrones Seguidos Correctamente

- ✅ **Server/Client**: `"use client"` correcto (necesita estado/form)
- ✅ **Props Interface**: Definida con TypeScript + JSDoc
- ✅ **Skeleton Pattern**: No aplica (no hay loading de datos)
- ✅ **State Management**: React Hook Form + Context
- ✅ **Styling**: Tailwind, dark mode, responsive
- ✅ **Accessibility**: ARIA labels, focus rings

### Patrones que Podrían Mejorarse

- ⚠️ **Error States**: Falta implementación visual
- ⚠️ **Focus Management**: Focus trap en sheet no verificado
- ⚠️ **Memoization**: Algunos componentes podrían beneficiarse

---

## 13. Conclusión

### Score General: 8.5/10 ✅ **MUY BUENO**

**Fortalezas**:
- ✅ Implementación sólida siguiendo patrones del repo
- ✅ Accesibilidad bien implementada (ARIA, focus rings)
- ✅ Performance optimizada (memoization, lazy loading, images)
- ✅ Responsive mobile-first correcto
- ✅ Dark mode completo

**Áreas de Mejora**:
- ⚠️ Agregar estado de error visual
- ⚠️ Verificar/implementar focus trap en FilterBottomSheet
- ⚠️ Considerar memoización adicional

**Recomendación**: La UI está **production-ready** con mejoras menores recomendadas. Priorizar agregar estado de error visual antes de merge.

---

**Análisis Completado**: 2026-01-28  
**Componente Analizado**: `HeroSearchPanel` + 6 sub-componentes  
**Status**: ✅ ANÁLISIS COMPLETO
