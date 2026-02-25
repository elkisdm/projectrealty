# Plan: Optimización Móvil TreeLanding

> **Workpack ID**: WP#MOBILE-TREE-001  
> **Agent**: UI Builder  
> **Status**: PLAN (pendiente ejecución)  
> **Fecha**: 2026-01-28

---

## Goal

Optimizar el componente `TreeLanding` para dispositivos móviles, mejorando la experiencia táctil, legibilidad, rendimiento y accesibilidad. El objetivo es garantizar que todos los elementos interactivos cumplan con las guías de iOS/Android (touch targets ≥44px), prevenir layout shifts, y asegurar navegación fluida en pantallas pequeñas.

---

## Selected Workpack: WP3 (Integración Real)

**Razón**: Ya existe la implementación base. Este workpack se enfoca en optimizar la UI existente sin cambiar contratos ni crear nuevos endpoints.

---

## Context References

- ✅ `/app/agents/ui-builder.md` - Reglas de mobile-first, touch targets, accessibility
- ✅ `/components/tree/TreeLanding.tsx` - Implementación actual
- ✅ `/components/tree/UFIndicator.tsx` - Componente relacionado
- ✅ `/docs/MOBILE_DEBUG.md` - Patrones de breakpoints del proyecto
- ✅ `/components/mobile/MobileSearchInput.tsx` - Ejemplo de optimización móvil

---

## Current State Analysis

### ✅ Lo que ya funciona:
- Responsive breakpoints (`sm:`) implementados
- Safe area handling (`safe-area-bottom`)
- Reduced motion support
- Focus states básicos
- Animaciones con Framer Motion

### ⚠️ Áreas a optimizar:

1. **Touch Targets**:
   - Cards: padding `p-3 sm:p-4` puede ser insuficiente para área táctil completa
   - Social icons: `w-9 h-9` (36px) < 44px mínimo recomendado
   - Botones dentro de cards: no tienen `min-h-[44px]` explícito

2. **Layout Shift**:
   - `UFIndicator` carga asíncronamente sin skeleton con altura fija
   - Puede causar CLS (Cumulative Layout Shift)

3. **Espaciado**:
   - `space-y-2 sm:space-y-3` puede ser muy ajustado en móvil
   - Footer puede quedar muy pegado al contenido en pantallas pequeñas

4. **Legibilidad**:
   - Texto `text-xs` puede ser difícil de leer en móviles pequeños
   - Subtítulos `text-subtext` pueden tener bajo contraste

5. **Performance**:
   - Animaciones pueden ser pesadas en dispositivos low-end
   - No hay lazy loading de componentes no críticos

6. **Accesibilidad**:
   - Falta `aria-live` para cambios dinámicos (UF loading)
   - No hay skip link para navegación por teclado

---

## Plan (5 pasos)

### Paso 1: Optimizar Touch Targets y Espaciado
**Archivos**: `components/tree/TreeLanding.tsx`  
**Cambios**:
- Aumentar padding de cards a `p-4 sm:p-5` (mínimo 16px móvil)
- Asegurar que botones dentro de cards tengan `min-h-[44px]`
- Aumentar tamaño de social icons a `w-11 h-11 sm:w-12 sm:h-12` (44px+ móvil)
- Aumentar espaciado entre cards a `space-y-3 sm:space-y-4`
- Aumentar padding del contenedor principal si es necesario

**Output**: Cards y botones con touch targets adecuados

---

### Paso 2: Prevenir Layout Shift en UFIndicator
**Archivos**: `components/tree/UFIndicator.tsx`  
**Cambios**:
- Agregar altura mínima fija al contenedor (`min-h-[24px] sm:min-h-[28px]`)
- Usar skeleton con misma altura durante loading
- Agregar `aria-live="polite"` para anunciar cambios
- Considerar usar `loading="lazy"` o `priority={false}` si no es crítico

**Output**: Sin layout shift al cargar UF

---

### Paso 3: Mejorar Legibilidad y Contraste
**Archivos**: `components/tree/TreeLanding.tsx`  
**Cambios**:
- Aumentar tamaño de texto principal: `text-sm sm:text-base` (mínimo 14px móvil)
- Mejorar contraste de subtítulos: `text-subtext` → `text-text-secondary` o similar
- Aumentar line-height en textos largos: `leading-relaxed`
- Verificar contraste WCAG AA (4.5:1 para texto normal)

**Output**: Texto más legible en móvil

---

### Paso 4: Optimizar Animaciones y Performance
**Archivos**: `components/tree/TreeLanding.tsx`  
**Cambios**:
- Reducir duración de animaciones en móvil (usar `prefersReducedMotion` más agresivamente)
- Lazy load animaciones no críticas (social icons pueden aparecer después)
- Usar `will-change` solo cuando sea necesario
- Considerar `transform` en lugar de `top/left` para mejor performance

**Output**: Animaciones más fluidas en dispositivos low-end

---

### Paso 5: Mejorar Accesibilidad y Navegación
**Archivos**: `components/tree/TreeLanding.tsx`  
**Cambios**:
- Agregar skip link al inicio: `<a href="#main-content" className="sr-only focus:not-sr-only">`
- Mejorar `aria-label` en cards (más descriptivos)
- Agregar `role="region"` y `aria-label` a secciones
- Asegurar orden lógico de focus (Tab navigation)
- Agregar `aria-describedby` para relaciones texto-ícono

**Output**: Navegación por teclado y screen readers mejorada

---

## Files to Change

1. `components/tree/TreeLanding.tsx` - Optimizaciones principales
2. `components/tree/UFIndicator.tsx` - Prevenir layout shift

**Máximo 2 archivos** (dentro del límite de 3)

---

## Implementation Details

### Cambios específicos por archivo:

#### `components/tree/TreeLanding.tsx`

**Touch Targets**:
```tsx
// Cards: aumentar padding
<CardContent className="p-4 sm:p-5"> // antes: p-3 sm:p-4

// Botones dentro de cards: asegurar min-height
<button className="w-full text-left min-h-[44px] focus:outline-none...">

// Social icons: aumentar tamaño
className="w-11 h-11 sm:w-12 sm:h-12" // antes: w-9 h-9 sm:w-10 sm:h-10
```

**Espaciado**:
```tsx
// Espacio entre cards
<div className="space-y-3 sm:space-y-4"> // antes: space-y-2 sm:space-y-3

// Padding contenedor
<div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8"> // antes: py-4 sm:py-6
```

**Legibilidad**:
```tsx
// Texto principal
<h2 className="text-sm sm:text-base font-semibold"> // antes: text-sm sm:text-base (mantener pero verificar contraste)

// Subtítulos con mejor contraste
<p className="text-xs sm:text-sm text-text-secondary"> // antes: text-xs text-subtext
```

**Accesibilidad**:
```tsx
// Skip link al inicio
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-violet focus:text-white focus:rounded-lg">
  Saltar al contenido principal
</a>

// Mejorar aria-labels
<button aria-label="Quiero arrendar - Encuentra tu próximo hogar">
```

#### `components/tree/UFIndicator.tsx`

**Layout Shift Prevention**:
```tsx
// Altura mínima fija
<motion.div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-subtext mb-3 min-h-[24px] sm:min-h-[28px]">

// Skeleton con misma altura
{isLoading ? (
  <div className="flex items-center gap-2 min-h-[24px]">
    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
    <span className="inline-block w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
  </div>
) : (...)}
```

**Accesibilidad**:
```tsx
// Aria-live para cambios
<motion.div aria-live="polite" aria-atomic="true">
```

---

## Merge Plan

### Comandos de verificación:

```bash
# 1. Type check
pnpm run typecheck

# 2. Lint
pnpm run lint

# 3. Build (verificar que compile)
pnpm run build

# 4. Verificar en dev
pnpm run dev
```

### Smoke Tests (pasos manuales):

1. **Touch Targets**:
   - Abrir `/tree` en iPhone (DevTools responsive mode 375px)
   - Verificar que cards tengan área táctil cómoda (≥44px altura efectiva)
   - Verificar que social icons sean fáciles de tocar (≥44px)
   - Tocar cada card y verificar respuesta visual inmediata

2. **Layout Shift**:
   - Abrir `/tree` con network throttling (Slow 3G)
   - Verificar que UF indicator no cause salto de contenido
   - Verificar que skeleton tenga misma altura que contenido final

3. **Legibilidad**:
   - Abrir `/tree` en móvil real (iPhone/Android)
   - Verificar que texto sea legible sin zoom
   - Verificar contraste de subtítulos (usar DevTools Accessibility panel)

4. **Animaciones**:
   - Abrir `/tree` en móvil
   - Verificar que animaciones sean fluidas (60fps)
   - Activar "Reduced Motion" en iOS y verificar que animaciones se desactiven

5. **Accesibilidad**:
   - Navegar con teclado (Tab) y verificar orden lógico
   - Activar screen reader (VoiceOver/TalkBack) y verificar anuncios
   - Verificar skip link aparece con Tab

### Rollback Plan:

Si hay problemas:
```bash
# Revertir cambios
git checkout HEAD -- components/tree/TreeLanding.tsx components/tree/UFIndicator.tsx

# O revertir commit específico
git revert <commit-hash>
```

---

## QA Gate (G1–G5)

### G1: Contract Compliance
- **Status**: PASS ✅
- **Nota**: No se modifican props ni contratos de API. Solo optimizaciones CSS/HTML.

### G2: Security
- **Status**: N/A ✅
- **Nota**: No hay cambios de seguridad. Solo UI.

### G3: UX States
- **Status**: PASS ✅
- **Nota**: Se mantienen todos los estados existentes (loading UF, error handling). Se mejora skeleton.

### G4: Edge Cases
- **Status**: PASS ✅
- **Nota**: 
  - ✅ Mobile viewport (≤390px): Touch targets y espaciado optimizados
  - ✅ Reduced motion: Ya implementado, se verifica
  - ✅ Slow network: Layout shift prevenido con skeleton
  - ✅ Screen readers: Skip link y aria-labels mejorados

### G5: Verification
- **Status**: PENDING ⏳
- **Nota**: Requiere smoke tests manuales después de implementación.

**Merge Readiness**: PENDING (pendiente implementación y smoke tests)

---

## Risks / Tradeoffs

1. **Touch targets más grandes pueden hacer cards más altas**: Tradeoff aceptable por mejor UX móvil
2. **Skeleton fijo puede no coincidir con contenido real**: Mitigado con altura mínima conservadora
3. **Animaciones reducidas pueden afectar "premium feel"**: Mitigado con `prefersReducedMotion` (solo afecta usuarios que lo prefieren)

---

## Assumptions

- ✅ TailwindCSS está configurado con breakpoints estándar (`sm:`, `md:`, `lg:`)
- ✅ `safe-area-bottom` utility class existe en el proyecto
- ✅ `useReducedMotion` hook funciona correctamente
- ✅ Framer Motion está instalado y funcionando
- ✅ No hay cambios de diseño visual requeridos (solo optimizaciones técnicas)

---

## Open Questions

1. **¿Hay límite de altura máximo para las cards?** → Plan A: Mantener proporciones actuales, solo aumentar padding interno
2. **¿El UF indicator es crítico para LCP?** → Plan A: Mantener loading normal, solo prevenir layout shift
3. **¿Hay guías de diseño específicas para touch targets en este proyecto?** → Plan A: Seguir iOS/Android guidelines (44px mínimo)

---

## Next Iteration Suggestion

- Optimizar formularios relacionados (`RentFormStepper`, `BuyForm`) con mismos principios de touch targets y accesibilidad

---

## Notas Adicionales

- Este plan sigue las reglas del UI Builder Agent (`ui-builder.md`)
- Respeta el principio mobile-first del proyecto
- No modifica schemas ni APIs (solo UI)
- Máximo 2 archivos modificados (dentro del límite de 3)
