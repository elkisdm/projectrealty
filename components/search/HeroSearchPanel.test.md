# Smoke Tests - HeroSearchPanel

> Documentación de smoke tests para verificación manual del componente HeroSearchPanel y sus mejoras de Quality Gates G3, G5, G6.

---

## Test 1: Búsqueda Básica (Happy Path)

**Pasos**:
1. Abrir `/` (homepage)
2. Ver HeroSearchPanel visible
3. Escribir "Las Condes" en input de búsqueda
4. Click en "Ver opciones"

**Expected**:
- Navega a `/buscar?q=Las+Condes`
- No hay errores en consola
- Loading state visible durante navegación (botón muestra "Buscando...")

**Quality Gate**: G3 (Loading state)

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

**Quality Gate**: G3 (Selected states)

---

## Test 3: Error State - Búsqueda Muy Larga

**Pasos**:
1. Abrir `/`
2. Escribir texto de >100 caracteres en input (ej: "Las Condes Las Condes Las Condes Las Condes Las Condes Las Condes Las Condes Las Condes Las Condes Las Condes")
3. Click en "Ver opciones"

**Expected**:
- Mensaje de error visible debajo del input
- Error dice: "La búsqueda no puede tener más de 100 caracteres"
- Icono AlertCircle visible junto al mensaje
- Banner de error general visible: "Por favor corrige los errores antes de continuar"
- Input tiene `aria-invalid="true"` y `aria-describedby` apunta al mensaje
- No navega a `/buscar`

**Quality Gate**: G3 (Error state) ✅ **NUEVO**

---

## Test 4: FilterBottomSheet - Focus Trap

**Pasos**:
1. Abrir `/`
2. Click en "Más filtros"
3. Presionar Tab repetidamente (10+ veces)

**Expected**:
- Focus NO escapa del sheet
- Focus circula entre elementos dentro del sheet (close button → filtros → botones)
- Focus vuelve al primer elemento después del último
- Shift+Tab funciona correctamente (navegación inversa)

**Quality Gate**: G6 (Focus trap) ✅ **NUEVO**

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

**Quality Gate**: G6 (Escape key + Focus return) ✅ **NUEVO**

---

## Test 6: FilterBottomSheet - Scroll Lock

**Pasos**:
1. Abrir `/` en mobile (<768px) o desktop con DevTools mobile view
2. Scroll hacia abajo en la página
3. Click en "Más filtros"
4. Intentar hacer scroll en el body (fuera del sheet)

**Expected**:
- Body scroll está bloqueado (`overflow: hidden` en `document.body`)
- Scroll funciona DENTRO del sheet (content area)
- Al cerrar, body scroll se restaura

**Quality Gate**: G6 (Scroll lock)

---

## Test 7: Edge Cases - Valores Vacíos

**Pasos**:
1. Abrir `/`
2. No seleccionar ningún filtro
3. No escribir nada en el input
4. Click en "Ver opciones"

**Expected**:
- Navega a `/buscar` sin query params (o con mínimos como `?intent=rent`)
- No hay errores
- Página de resultados carga correctamente

**Quality Gate**: G3 (Edge cases)

---

## Test 8: Edge Cases - Precio Inválido

**Pasos**:
1. Abrir `/`
2. Abrir "Más filtros"
3. En "Rango de precio", ingresar precio mínimo > precio máximo (ej: Mín: 1000000, Máx: 500000)
4. Click en "Aplicar filtros"

**Expected**:
- Error visible: "El precio máximo debe ser mayor o igual al precio mínimo"
- ErrorMessage visible debajo del campo priceMax
- Filtros no se aplican
- Sheet permanece abierto

**Quality Gate**: G3 (Error state) ✅ **NUEVO**

---

## Test 9: Responsive - Mobile

**Pasos**:
1. Abrir `/` en viewport mobile (375px) o usar DevTools mobile emulation
2. Verificar layout del HeroSearchPanel

**Expected**:
- Card ocupa ancho completo (sin `max-w`)
- Pills se ajustan (wrap si es necesario)
- Texto legible (no muy pequeño, mínimo 14px)
- Touch targets >= 44px (botones, pills)
- UniversalSearchInput abre modal fullscreen en mobile

**Quality Gate**: G4 (Responsive)

---

## Test 10: Responsive - Desktop

**Pasos**:
1. Abrir `/` en viewport desktop (1920px)
2. Verificar layout del HeroSearchPanel

**Expected**:
- Card tiene `max-w-[560px]`
- Centrado horizontalmente
- Espaciado adecuado entre elementos
- Hover states funcionan en botones y pills
- FilterBottomSheet aparece como bottom sheet (no fullscreen)

**Quality Gate**: G4 (Responsive)

---

## Test 11: Accessibility - Keyboard Navigation

**Pasos**:
1. Abrir `/`
2. Usar solo teclado (Tab, Shift+Tab, Enter, Escape)
3. Navegar por todos los elementos interactivos

**Expected**:
- Tab navega por todos los elementos focusables
- Focus visible en todos los elementos (ring visible)
- Enter activa botones/pills
- Escape cierra FilterBottomSheet si está abierto
- Focus no se pierde

**Quality Gate**: G1 (Accessibility)

---

## Test 12: Error State - ARIA Attributes

**Pasos**:
1. Abrir `/`
2. Escribir texto >100 caracteres
3. Inspeccionar el input con DevTools

**Expected**:
- Input tiene `aria-invalid="true"`
- Input tiene `aria-describedby="q-error"`
- Elemento con `id="q-error"` existe y contiene el mensaje de error
- Mensaje de error tiene `role="alert"`

**Quality Gate**: G1 (Accessibility) ✅ **NUEVO**

---

## Rollback Plan

Si hay problemas después de merge:

### Paso 1: Revert commit
```bash
git revert <commit-hash>
```

### Paso 2: Verificar build
```bash
pnpm run build
```
Expected: Build pasa sin errores

### Paso 3: Verificar typecheck
```bash
pnpm run typecheck
```
Expected: Typecheck pasa sin errores

### Paso 4: Smoke test básico
1. Abrir `/`
2. Verificar que HeroSearchPanel funciona
3. Click en "Ver opciones" debe navegar correctamente

### Archivos afectados por rollback

**Archivos nuevos (se eliminarían)**:
- `components/ui/ErrorMessage.tsx`
- `hooks/useFocusTrap.ts`
- `components/search/HeroSearchPanel.test.md`

**Archivos modificados (se revertirían)**:
- `components/search/HeroSearchPanel.tsx`
- `components/search/UniversalSearchInput.tsx`
- `components/mobile/MobileFilterSheet.tsx`
- `components/search/FilterBottomSheet.tsx`
- `components/search/HeroCTA.tsx`
- `types/search.ts`

### Verificación Post-Rollback

1. ✅ HeroSearchPanel renderiza sin errores
2. ✅ Formulario funciona (submit navega correctamente)
3. ✅ FilterBottomSheet abre y cierra correctamente
4. ✅ No hay errores de TypeScript
5. ✅ Build pasa exitosamente

---

## Quality Gates Verification Checklist

### G3: UX States & Edge Cases
- [x] Loading states visible (spinner/texto "Buscando...")
- [x] Empty states con placeholders
- [x] Selected states (pills activos)
- [x] **Error states con mensajes visuales** ✅ **NUEVO**
- [x] Edge cases manejados (valores vacíos, precios inválidos)

### G5: Verification & Testing
- [x] Smoke tests documentados (12 tests)
- [x] Edge cases documentados
- [x] Pasos de verificación incluidos
- [x] Rollback plan documentado

### G6: Mobile Sheet UX
- [x] Body scroll locked when open
- [x] Internal scroll works
- [x] **Focus trap active** ✅ **NUEVO**
- [x] Escape key closes
- [x] **Focus returns to trigger** ✅ **NUEVO**

---

**Última actualización**: 2026-01-28  
**Versión**: 1.0
