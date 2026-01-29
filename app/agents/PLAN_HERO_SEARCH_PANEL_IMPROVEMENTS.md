# Plan: Mejoras Hero Search Panel - Quality Gates G3, G5, G6

> Generado como: **UI Builder Agent v1.1**  
> Fecha: 2026-01-28  
> Componente: `HeroSearchPanel` y sub-componentes

---

## 1. Goal

Implementar mejoras para que `HeroSearchPanel` pase completamente los Quality Gates G3 (UX States), G5 (Verification) y G6 (Mobile Sheet UX), mejorando la experiencia de usuario y accesibilidad.

---

## 2. Verificación Actual de Quality Gates

### G3: UX States & Edge Cases

**Estado Actual**: ⚠️ **PARTIAL PASS**

| Estado | Implementación | Status |
|--------|----------------|--------|
| Loading | `isSubmitting` en CTA button | ✅ PASS |
| Empty | Placeholders en inputs | ✅ PASS |
| Selected | Pills/tabs con estados activos | ✅ PASS |
| **Error** | **NO IMPLEMENTADO** | ❌ **FAIL** |
| Edge Cases | Valores undefined manejados | ✅ PASS |

**Problema Detectado**:
- `HeroSearchPanel` usa `react-hook-form` con `zodResolver` pero **no muestra errores visuales**
- `formState.errors` existe pero no se renderiza en la UI
- Usuario no sabe si el formulario es inválido antes de submit

---

### G5: Verification & Testing

**Estado Actual**: ❌ **FAIL**

**Criterios Faltantes**:
- ❌ Sin smoke tests documentados
- ❌ Edge cases no documentados explícitamente
- ❌ Pasos de verificación manual no incluidos
- ❌ Rollback plan no documentado

**Problema Detectado**:
- No hay documentación de cómo verificar el componente manualmente
- No hay checklist de edge cases a probar

---

### G6: Mobile Sheet UX

**Estado Actual**: ⚠️ **PARTIAL PASS**

**Verificación de `MobileFilterSheet`** (usado por `FilterBottomSheet`):

| Criterio | Implementación | Status |
|----------|----------------|--------|
| Body scroll locked | ✅ `document.body.style.overflow = "hidden"` | ✅ PASS |
| Internal scroll works | ✅ `overflow-y-auto` en content | ✅ PASS |
| **Focus trap** | ⚠️ **NO IMPLEMENTADO** | ❌ **FAIL** |
| Escape key closes | ✅ `handleEscape` con `keydown` listener | ✅ PASS |
| **Focus return** | ⚠️ **NO IMPLEMENTADO** | ❌ **FAIL** |

**Problemas Detectados**:
- No hay focus trap: Tab puede escapar del sheet
- No hay guardado de elemento activo previo para restaurar focus
- No hay focus inicial en primer elemento del sheet

---

## 3. Component Contract

### Componentes a Modificar

**Archivos Principales**:
1. `components/search/HeroSearchPanel.tsx` - Agregar error states
2. `components/mobile/MobileFilterSheet.tsx` - Agregar focus trap + focus return
3. `components/search/FilterBottomSheet.tsx` - Verificar integración con focus trap

**Archivos Nuevos**:
4. `components/search/HeroSearchPanel.test.md` - Documentación de smoke tests

---

## 4. Plan de Implementación

### Fase 1: G3 - Agregar Error States (Prioridad ALTA)

#### 1.1 Extraer `formState.errors` en HeroSearchPanel

**Archivo**: `components/search/HeroSearchPanel.tsx`

**Cambios**:
```tsx
// Agregar a useForm destructuring
const {
  handleSubmit,
  formState: { isSubmitting, errors }, // ← Agregar errors
  setValue,
  watch,
} = useForm<SearchFormInput>({
  resolver: zodResolver(searchFormInputSchema),
  defaultValues: contextFormState,
});
```

**Líneas afectadas**: ~3 líneas

---

#### 1.2 Crear componente ErrorMessage reutilizable

**Archivo**: `components/ui/ErrorMessage.tsx` (nuevo)

**Props Interface**:
```typescript
interface ErrorMessageProps {
  error?: string | { message?: string };
  className?: string;
  id?: string;
}
```

**Implementación**:
```tsx
"use client";

import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  error?: string | { message?: string };
  className?: string;
  id?: string;
}

export function ErrorMessage({ error, className, id }: ErrorMessageProps) {
  if (!error) return null;
  
  const message = typeof error === "string" ? error : error.message;
  if (!message) return null;

  return (
    <p
      id={id}
      role="alert"
      className={cn(
        "mt-1 text-sm text-accent-error dark:text-red-400",
        "flex items-center gap-1.5",
        className
      )}
    >
      <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}
```

**Líneas**: ~30 líneas

---

#### 1.3 Agregar ErrorMessage debajo de UniversalSearchInput

**Archivo**: `components/search/HeroSearchPanel.tsx`

**Cambios**:
```tsx
{/* Universal Search Input - dominant element */}
<div className="pt-2">
  <UniversalSearchInput
    value={q || ""}
    onChange={(value) => setValue("q", value)}
    onParsedData={handleParsedData}
    placeholder="Comuna, barrio o metro…"
    aria-invalid={!!errors.q}
    aria-describedby={errors.q ? "q-error" : undefined}
  />
  <ErrorMessage 
    error={errors.q} 
    id="q-error"
    className="mt-1"
  />
</div>
```

**Líneas afectadas**: ~8 líneas

---

#### 1.4 Agregar ErrorMessage para validación de precio (si aplica)

**Archivo**: `components/search/HeroSearchPanel.tsx`

**Cambios**:
```tsx
{/* Compact Row - Presupuesto + Mudanza */}
<CompactRow
  priceMax={priceMax}
  moveIn={moveIn}
  onPriceMaxChange={(value) => setValue("priceMax", value)}
  onMoveInChange={(value) => setValue("moveIn", value as SearchFormInput["moveIn"])}
/>
{errors.priceMax && (
  <ErrorMessage 
    error={errors.priceMax} 
    id="priceMax-error"
    className="mt-1"
  />
)}
```

**Líneas afectadas**: ~5 líneas

---

#### 1.5 Agregar error general del formulario (si hay errores de validación)

**Archivo**: `components/search/HeroSearchPanel.tsx`

**Cambios**:
```tsx
{/* CTA - Primary action */}
{Object.keys(errors).length > 0 && (
  <div className="rounded-xl bg-accent-error/10 dark:bg-red-900/20 border border-accent-error/20 p-3 text-sm text-accent-error" role="alert">
    Por favor corrige los errores antes de continuar
  </div>
)}
<HeroCTA
  isSubmitting={isSubmitting}
  onMoreFiltersClick={() => setShowFiltersSheet(true)}
/>
```

**Líneas afectadas**: ~6 líneas

---

### Fase 2: G6 - Focus Trap y Focus Return (Prioridad ALTA)

#### 2.1 Crear hook useFocusTrap

**Archivo**: `hooks/useFocusTrap.ts` (nuevo)

**Implementación**:
```tsx
"use client";

import { useEffect, useRef, RefObject } from "react";

interface UseFocusTrapOptions {
  isActive: boolean;
  initialFocusRef?: RefObject<HTMLElement>;
  returnFocusRef?: RefObject<HTMLElement>;
}

export function useFocusTrap({
  isActive,
  initialFocusRef,
  returnFocusRef,
}: UseFocusTrapOptions) {
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    // Guardar elemento activo previo
    previousActiveElementRef.current = document.activeElement as HTMLElement;

    // Focus inicial
    const timeout = setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else if (containerRef.current) {
        // Buscar primer elemento focusable
        const firstFocusable = containerRef.current.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        firstFocusable?.focus();
      }
    }, 100);

    // Focus trap: mantener Tab dentro del contenedor
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !containerRef.current) return;

      const focusableElements = containerRef.current.querySelectorAll(
        'button:not([disabled]), [href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
      );

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("keydown", handleKeyDown);

      // Restaurar focus
      const elementToFocus = returnFocusRef?.current || previousActiveElementRef.current;
      if (elementToFocus && typeof elementToFocus.focus === "function") {
        elementToFocus.focus();
      }
    };
  }, [isActive, initialFocusRef, returnFocusRef]);

  return { containerRef };
}
```

**Líneas**: ~70 líneas

---

#### 2.2 Integrar useFocusTrap en MobileFilterSheet

**Archivo**: `components/mobile/MobileFilterSheet.tsx`

**Cambios**:
```tsx
import { useFocusTrap } from "@/hooks/useFocusTrap";

export function MobileFilterSheet({
  isOpen,
  onClose,
  title = "Filtros",
  children,
  maxHeight = "90vh",
}: MobileFilterSheetProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isDragging, setIsDragging] = useState(false);
  const y = useMotionValue(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null); // Guardar trigger

  // Guardar trigger antes de abrir
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Focus trap
  const { containerRef } = useFocusTrap({
    isActive: isOpen,
    initialFocusRef: closeButtonRef,
    returnFocusRef: { current: triggerRef.current },
  });

  // ... resto del código

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ... backdrop ... */}

          {/* Bottom Sheet */}
          <motion.div
            ref={(node) => {
              sheetRef.current = node;
              if (containerRef) {
                (containerRef as React.MutableRefObject<HTMLElement | null>).current = node;
              }
            }}
            // ... resto de props
          >
            {/* ... header ... */}
            <button
              ref={closeButtonRef}
              onClick={onClose}
              // ... resto de props
            >
              <X className="h-5 w-5 text-text" />
            </button>
            {/* ... */}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

**Líneas afectadas**: ~20 líneas

---

#### 2.3 Pasar triggerRef desde HeroSearchPanel

**Archivo**: `components/search/HeroSearchPanel.tsx`

**Cambios**:
```tsx
const [showFiltersSheet, setShowFiltersSheet] = useState(false);
const moreFiltersButtonRef = useRef<HTMLButtonElement>(null);

// ... en HeroCTA
<HeroCTA
  isSubmitting={isSubmitting}
  onMoreFiltersClick={() => {
    moreFiltersButtonRef.current = document.activeElement as HTMLButtonElement;
    setShowFiltersSheet(true);
  }}
  moreFiltersButtonRef={moreFiltersButtonRef}
/>

// ... en FilterBottomSheet
<FilterBottomSheet
  isOpen={showFiltersSheet}
  onClose={() => setShowFiltersSheet(false)}
  triggerRef={moreFiltersButtonRef}
  // ... resto de props
/>
```

**Líneas afectadas**: ~10 líneas

---

#### 2.4 Actualizar FilterBottomSheet para pasar triggerRef

**Archivo**: `components/search/FilterBottomSheet.tsx`

**Cambios**:
```tsx
interface FilterBottomSheetProps {
  // ... props existentes
  triggerRef?: RefObject<HTMLElement>;
}

export const FilterBottomSheet = memo(function FilterBottomSheet({
  // ... props existentes
  triggerRef,
}: FilterBottomSheetProps) {
  return (
    <MobileFilterSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Ajusta tu búsqueda"
      maxHeight="85vh"
      triggerRef={triggerRef}
    >
      {/* ... */}
    </MobileFilterSheet>
  );
});
```

**Líneas afectadas**: ~5 líneas

---

#### 2.5 Actualizar MobileFilterSheet para aceptar triggerRef

**Archivo**: `components/mobile/MobileFilterSheet.tsx`

**Cambios**:
```tsx
interface MobileFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: string;
  triggerRef?: RefObject<HTMLElement>; // ← Nuevo
}

export function MobileFilterSheet({
  isOpen,
  onClose,
  title = "Filtros",
  children,
  maxHeight = "90vh",
  triggerRef,
}: MobileFilterSheetProps) {
  // ... usar triggerRef en useFocusTrap
  const { containerRef } = useFocusTrap({
    isActive: isOpen,
    initialFocusRef: closeButtonRef,
    returnFocusRef: triggerRef,
  });
}
```

**Líneas afectadas**: ~5 líneas

---

### Fase 3: G5 - Documentación de Verification (Prioridad MEDIA)

#### 3.1 Crear documento de Smoke Tests

**Archivo**: `components/search/HeroSearchPanel.test.md` (nuevo)

**Contenido**:
```markdown
# Smoke Tests - HeroSearchPanel

## Test 1: Búsqueda Básica (Happy Path)

**Pasos**:
1. Abrir `/` (homepage)
2. Ver HeroSearchPanel visible
3. Escribir "Las Condes" en input de búsqueda
4. Click en "Ver opciones"

**Expected**:
- Navega a `/buscar?q=Las+Condes`
- No hay errores en consola
- Loading state visible durante navegación

---

## Test 2: Filtros Rápidos

**Pasos**:
1. Abrir `/`
2. Click en pill "Studio" (Tipología)
3. Click en "Sí" (Pet friendly)
4. Click en "Ver opciones"

**Expected**:
- Pills muestran estado activo (border + bg)
- Navega con query params correctos: `?beds=studio&petFriendly=true`
- Filtros persisten en URL

---

## Test 3: Error State - Búsqueda Muy Larga

**Pasos**:
1. Abrir `/`
2. Escribir texto de >100 caracteres en input
3. Click en "Ver opciones"

**Expected**:
- Mensaje de error visible debajo del input
- Error dice: "La búsqueda no puede tener más de 100 caracteres"
- Botón "Ver opciones" deshabilitado o muestra error
- No navega a `/buscar`

---

## Test 4: FilterBottomSheet - Focus Trap

**Pasos**:
1. Abrir `/`
2. Click en "Más filtros"
3. Presionar Tab repetidamente (10+ veces)

**Expected**:
- Focus NO escapa del sheet
- Focus circula entre elementos dentro del sheet
- Focus vuelve al primer elemento después del último

---

## Test 5: FilterBottomSheet - Escape Key

**Pasos**:
1. Abrir `/`
2. Click en "Más filtros"
3. Presionar Escape

**Expected**:
- Sheet se cierra
- Focus regresa al botón "Más filtros"
- Body scroll se restaura

---

## Test 6: FilterBottomSheet - Scroll Lock

**Pasos**:
1. Abrir `/` en mobile (<768px)
2. Scroll hacia abajo en la página
3. Click en "Más filtros"
4. Intentar hacer scroll en el body (fuera del sheet)

**Expected**:
- Body scroll está bloqueado (`overflow: hidden`)
- Scroll funciona DENTRO del sheet
- Al cerrar, body scroll se restaura

---

## Test 7: Edge Cases - Valores Vacíos

**Pasos**:
1. Abrir `/`
2. No seleccionar ningún filtro
3. Click en "Ver opciones"

**Expected**:
- Navega a `/buscar` sin query params (o con mínimos)
- No hay errores
- Página de resultados carga correctamente

---

## Test 8: Edge Cases - Precio Inválido

**Pasos**:
1. Abrir `/`
2. Abrir "Más filtros"
3. Ingresar precio mínimo > precio máximo
4. Click en "Aplicar filtros"

**Expected**:
- Error visible: "El precio máximo debe ser mayor o igual al precio mínimo"
- Filtros no se aplican
- Sheet permanece abierto

---

## Test 9: Responsive - Mobile

**Pasos**:
1. Abrir `/` en viewport mobile (375px)
2. Verificar layout

**Expected**:
- Card ocupa ancho completo
- Pills se ajustan (wrap)
- Texto legible (no muy pequeño)
- Touch targets >= 44px

---

## Test 10: Responsive - Desktop

**Pasos**:
1. Abrir `/` en viewport desktop (1920px)
2. Verificar layout

**Expected**:
- Card tiene `max-w-[560px]`
- Centrado horizontalmente
- Espaciado adecuado
- Hover states funcionan

---

## Rollback Plan

Si hay problemas después de merge:

1. **Revert commit**: `git revert <commit-hash>`
2. **Verificar**: `pnpm run build` debe pasar
3. **Verificar**: `pnpm run typecheck` debe pasar
4. **Smoke test**: Abrir `/` y verificar que HeroSearchPanel funciona

**Archivos afectados**:
- `components/search/HeroSearchPanel.tsx`
- `components/mobile/MobileFilterSheet.tsx`
- `components/search/FilterBottomSheet.tsx`
- `hooks/useFocusTrap.ts` (nuevo)
- `components/ui/ErrorMessage.tsx` (nuevo)
```

**Líneas**: ~150 líneas

---

## 5. States Implementados (Después de Mejoras)

| State | UI | Trigger | Status |
|-------|-----|---------|--------|
| Loading | `isSubmitting` en CTA, texto "Buscando..." | Durante submit | ✅ |
| Empty | Placeholders en inputs | Valores vacíos | ✅ |
| Selected | Pills/tabs con estados activos | Valores seleccionados | ✅ |
| **Error** | **ErrorMessage debajo de campos + banner general** | **`errors` object tiene valores** | ✅ **NUEVO** |
| Edge Cases | Validación de precios, longitud de texto | Valores inválidos | ✅ |

---

## 6. Responsive Behavior

| Breakpoint | Behavior | Status |
|------------|----------|--------|
| Mobile (<768px) | Card full-width, FilterBottomSheet fullscreen | ✅ |
| Tablet (768-1024px) | Card `max-w-[560px]` | ✅ |
| Desktop (>1024px) | Mismo que tablet | ✅ |

---

## 7. Accessibility (Después de Mejoras)

### A1: Focus Management

- ✅ Focus trap en FilterBottomSheet (NUEVO)
- ✅ Focus return al trigger (NUEVO)
- ✅ Focus inicial en close button (NUEVO)
- ✅ ARIA labels en todos los campos

### A2: Keyboard Navigation

- ✅ Escape cierra FilterBottomSheet
- ✅ Tab circula dentro del sheet (NUEVO)
- ✅ Enter submit form

### A3: ARIA Labels

- ✅ `aria-invalid` en campos con error (NUEVO)
- ✅ `aria-describedby` apunta a ErrorMessage (NUEVO)
- ✅ `role="alert"` en mensajes de error (NUEVO)

### A4: Reduced Motion

- ✅ Respeta `prefersReducedMotion` en todas las animaciones

---

## 8. Verification (G5)

### Smoke Tests Documentados

**Archivo**: `components/search/HeroSearchPanel.test.md`

**10 tests cubren**:
1. Happy path (búsqueda básica)
2. Filtros rápidos
3. Error state (texto muy largo)
4. Focus trap
5. Escape key
6. Scroll lock
7. Edge cases (valores vacíos)
8. Edge cases (precio inválido)
9. Responsive mobile
10. Responsive desktop

**Rollback Plan**: Documentado en el mismo archivo

---

## 9. Quality Gates - Estado Final

### G3: UX States & Edge Cases

**Después de mejoras**: ✅ **PASS**

- ✅ Loading state
- ✅ Empty state
- ✅ Selected states
- ✅ **Error state (NUEVO)**
- ✅ Edge cases manejados

### G5: Verification & Testing

**Después de mejoras**: ✅ **PASS**

- ✅ Smoke tests documentados (10 tests)
- ✅ Edge cases documentados
- ✅ Pasos de verificación incluidos
- ✅ Rollback plan documentado

### G6: Mobile Sheet UX

**Después de mejoras**: ✅ **PASS**

- ✅ Body scroll locked
- ✅ Internal scroll works
- ✅ **Focus trap active (NUEVO)**
- ✅ Escape key closes
- ✅ **Focus returns to trigger (NUEVO)**

---

## 10. Files to Change

### Archivos Modificados (5)

1. `components/search/HeroSearchPanel.tsx` - Agregar error states
2. `components/mobile/MobileFilterSheet.tsx` - Agregar focus trap + return
3. `components/search/FilterBottomSheet.tsx` - Pasar triggerRef
4. `components/search/HeroCTA.tsx` - Aceptar y pasar triggerRef (opcional)

### Archivos Nuevos (3)

5. `components/ui/ErrorMessage.tsx` - Componente reutilizable
6. `hooks/useFocusTrap.ts` - Hook para focus trap
7. `components/search/HeroSearchPanel.test.md` - Documentación de tests

---

## 11. Implementation Order

1. **Paso 1**: Crear `ErrorMessage.tsx` (componente base)
2. **Paso 2**: Crear `useFocusTrap.ts` (hook base)
3. **Paso 3**: Agregar error states en `HeroSearchPanel.tsx`
4. **Paso 4**: Integrar focus trap en `MobileFilterSheet.tsx`
5. **Paso 5**: Pasar triggerRef desde `HeroSearchPanel` → `FilterBottomSheet` → `MobileFilterSheet`
6. **Paso 6**: Crear documentación de smoke tests
7. **Paso 7**: Ejecutar smoke tests manualmente
8. **Paso 8**: Verificar typecheck y build

---

## 12. Risks / Tradeoffs

### Riesgos

1. **Focus trap puede interferir con gestos de arrastre** en MobileFilterSheet
   - **Mitigación**: Focus trap solo activo cuando no está arrastrando

2. **ErrorMessage puede causar layout shift** si aparece dinámicamente
   - **Mitigación**: Reservar espacio con `min-h` o usar `position: absolute`

3. **useFocusTrap puede tener conflictos** con otros modals abiertos
   - **Mitigación**: Verificar que solo un modal está abierto a la vez

### Tradeoffs

1. **Error states visibles pueden ser "ruidosos"** para usuarios
   - **Tradeoff**: Mejor UX con feedback claro vs. UI más limpia

2. **Focus trap agrega complejidad** al código
   - **Tradeoff**: Mejor accesibilidad vs. código más complejo

---

## 13. Verification Commands

```bash
# Typecheck
pnpm run typecheck

# Build
pnpm run build

# Lint
pnpm run lint

# Visual verification (manual)
# 1. Abrir http://localhost:3000
# 2. Ejecutar smoke tests de HeroSearchPanel.test.md
```

---

## 14. Definition of Done

- [ ] ErrorMessage component creado y funcionando
- [ ] useFocusTrap hook creado y funcionando
- [ ] Error states visibles en HeroSearchPanel
- [ ] Focus trap funciona en FilterBottomSheet
- [ ] Focus return funciona al cerrar sheet
- [ ] Smoke tests documentados (10 tests)
- [ ] Rollback plan documentado
- [ ] Typecheck pasa sin errores
- [ ] Build pasa sin errores
- [ ] Smoke tests ejecutados manualmente (todos PASS)
- [ ] Quality Gates G3, G5, G6: ✅ PASS

---

## 15. Next Iteration Suggestion

Después de completar estas mejoras:
- Considerar agregar tests automatizados (Jest + React Testing Library)
- Considerar agregar animación de éxito después de submit
- Considerar agregar skeleton loading si hay delay en carga inicial

---

**Plan Generado**: 2026-01-28  
**Tiempo Estimado**: 2-3 horas  
**Prioridad**: ALTA (G3, G5, G6 son críticos para calidad)  
**Status**: ✅ PLAN COMPLETO
