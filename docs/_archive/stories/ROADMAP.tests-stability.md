# Roadmap — Tests Stability Sprint

Este roadmap define el orden de ejecución de los pasos, los archivos que se deben leer ANTES de cada cambio, comandos útiles y criterios de salida por paso. Mantener cambios atómicos y registrar todo en `stories/CHANGELOG.tests-stability.md`.

## Orden de pasos
1) ✅ Paso 01 — Fix JSX/TSX en useBuildingsPagination test
2) ✅ Paso 02 — React Query Provider en tests de ResultsGrid
3) ⚠️ Paso 03 — Flags configurables para tests
4) ✅ Paso 04 — A11y labels en AdvancedFilterBar
5) ✅ Paso 05 — Fix Regresión JSX (duplicado eliminado)
6) ✅ Paso 06 — Fix useBuildingsData timeout (bucle infinito)
7) 🔄 **Paso 07 — Fix AdvancedFilterBar focus y URL sync**
8) 🔄 **Paso 08 — Fix ResultsGrid CARD_V2 flag**
9) 🔄 **Paso 09 — Fix useBuildingsPagination URL encoding**
10) 🔄 **Paso 10 — Fix pagination-integration mock fetch**

---

## ✅ Paso 01 — Fix JSX/TSX en useBuildingsPagination test

- Pre-lectura (obligatoria):
  - `tests/unit/useBuildingsPagination.test.ts`
  - `hooks/useBuildingsPagination.ts`
  - `tests/setupTests.ts` (setup global de testing)
- Objetivo: El archivo debe compilar sin errores de sintaxis JSX
- Comandos:
  - `pnpm typecheck` (verificar errores TS)
  - `pnpm test tests/unit/useBuildingsPagination.test.tsx`
- Criterio de salida: Test compila y ejecuta (puede fallar por lógica, pero no por sintaxis)

---

## ✅ Paso 02 — React Query Provider en tests de ResultsGrid

- Pre-lectura (obligatoria):
  - `tests/integration/ResultsGrid.test.tsx`
  - `components/lists/ResultsGrid.tsx`
  - `hooks/useBuildingsPagination.ts`
- Objetivo: Tests de integración deben tener QueryClient Provider
- Comandos:
  - `pnpm test tests/integration/ResultsGrid.test.tsx`
- Criterio de salida: Tests ejecutan sin errores de React Query

---

## ⚠️ Paso 03 — Flags configurables para tests

- Pre-lectura (obligatoria):
  - `tests/integration/ResultsGrid.test.tsx`
  - `@lib/flags` (sistema de feature flags)
  - `components/ui/BuildingCardV2.tsx`
- Objetivo: Tests deben poder configurar flags para mocking
- Comandos:
  - `pnpm test tests/integration/ResultsGrid.test.tsx`
- Criterio de salida: Tests pasan con diferentes configuraciones de flags

---

## ✅ Paso 04 — A11y labels en AdvancedFilterBar

- Pre-lectura (obligatoria):
  - `tests/unit/AdvancedFilterBar.test.tsx`
  - `components/filters/AdvancedFilterBar.tsx`
- Objetivo: Componente debe tener labels de accesibilidad correctos
- Comandos:
  - `pnpm test tests/unit/AdvancedFilterBar.test.tsx`
- Criterio de salida: Tests de A11y pasan

---

## ✅ Paso 05 — Fix Regresión JSX (duplicado eliminado)

- Pre-lectura (obligatoria):
  - `tests/unit/useBuildingsPagination.test.ts` (archivo duplicado)
  - `tests/unit/useBuildingsPagination.test.tsx` (archivo correcto)
- Objetivo: Eliminar archivo duplicado que causa errores
- Comandos:
  - `ls tests/unit/useBuildingsPagination.test.*`
  - `pnpm test tests/unit/useBuildingsPagination.test.tsx`
- Criterio de salida: Solo existe un archivo de test y ejecuta correctamente

---

## ✅ Paso 06 — Fix useBuildingsData timeout (bucle infinito)

- Pre-lectura (obligatoria):
  - `tests/unit/useBuildingsData.test.ts`
  - `hooks/useBuildingsData.ts`
  - `stores/buildingsStore.ts`
- Objetivo: Resolver bucle infinito en useEffect
- Comandos:
  - `pnpm test tests/unit/useBuildingsData.test.ts`
- Criterio de salida: Tests ejecutan sin timeout (13/13 tests pasan)

---

## 🔄 **Paso 07 — Fix AdvancedFilterBar focus y URL sync**

### **Objetivo:** 
Resolver problemas de focus y sincronización de URL en AdvancedFilterBar

### **Pre-lectura (obligatoria):**
- `tests/unit/AdvancedFilterBar.test.tsx`
- `components/filters/AdvancedFilterBar.tsx`
- `hooks/useAdvancedFilters.ts`

### **Problemas identificados:**
1. **Focus no funciona:** `expect(searchInput).toHaveFocus()` falla
2. **URL sync no sincroniza:** `expect(searchInput).toHaveValue('test search')` falla

### **Comandos de verificación:**
```bash
# Verificar estado actual
pnpm test tests/unit/AdvancedFilterBar.test.tsx

# Verificar específicamente los tests que fallan
pnpm test tests/unit/AdvancedFilterBar.test.tsx --testNamePattern="should show search suggestions"
pnpm test tests/unit/AdvancedFilterBar.test.tsx --testNamePattern="should sync filters with URL"
```

### **Criterio de salida:**
- ✅ Test "should show search suggestions" pasa (focus funciona)
- ✅ Test "should sync filters with URL when urlSync is enabled" pasa (URL sync funciona)
- ✅ Todos los tests de AdvancedFilterBar pasan

---

## 🔄 **Paso 08 — Fix ResultsGrid CARD_V2 flag**

### **Objetivo:** 
Hacer que el flag `CARD_V2` funcione correctamente en tests de integración

### **Pre-lectura (obligatoria):**
- `tests/integration/ResultsGrid.test.tsx`
- `components/lists/ResultsGrid.tsx`
- `@lib/flags` (sistema de feature flags)
- `components/ui/BuildingCardV2.tsx`

### **Problema identificado:**
- Test espera `data-testid="building-card-v2"` pero renderiza `data-testid="building-card-v1"`
- Flag `CARD_V2: true` no se aplica correctamente en tests

### **Comandos de verificación:**
```bash
# Verificar estado actual
pnpm test tests/integration/ResultsGrid.test.tsx

# Verificar específicamente el test que falla
pnpm test tests/integration/ResultsGrid.test.tsx --testNamePattern="should render BuildingCardV2 when CARD_V2 flag is enabled"
```

### **Criterio de salida:**
- ✅ Test "should render BuildingCardV2 when CARD_V2 flag is enabled" pasa
- ✅ Componente renderiza `BuildingCardV2` cuando `CARD_V2: true`
- ✅ Todos los tests de ResultsGrid pasan

---

## 🔄 **Paso 09 — Fix useBuildingsPagination URL encoding**

### **Objetivo:** 
Resolver diferencia en URL encoding (`+` vs `%20`)

### **Pre-lectura (obligatoria):**
- `tests/unit/useBuildingsPagination.test.tsx`
- `hooks/useBuildingsPagination.ts`

### **Problema identificado:**
- Test espera: `comuna=Test%20Comuna&minPrice=1000000&maxPrice=2000000`
- Recibe: `comuna=Test+Comuna&minPrice=1000000&maxPrice=2000000&page=1&limit=12`

### **Comandos de verificación:**
```bash
# Verificar estado actual
pnpm test tests/unit/useBuildingsPagination.test.tsx

# Verificar específicamente los tests que fallan
pnpm test tests/unit/useBuildingsPagination.test.tsx --testNamePattern="should apply filters correctly"
pnpm test tests/unit/useBuildingsPagination.test.tsx --testNamePattern="should sync data with Zustand store"
```

### **Criterio de salida:**
- ✅ Test "should apply filters correctly" pasa (URL encoding correcto)
- ✅ Test "should sync data with Zustand store when useStore is true" pasa
- ✅ Todos los tests de useBuildingsPagination pasan

---

## 🔄 **Paso 10 — Fix pagination-integration mock fetch**

### **Objetivo:** 
Completar la resolución del mock de fetch en tests de integración

### **Pre-lectura (obligatoria):**
- `tests/integration/pagination-integration.test.tsx`
- `hooks/useBuildingsPagination.ts`
- `components/lists/ResultsGrid.tsx`

### **Problemas identificados:**
1. **Timeout:** Test excede 5000ms
2. **Mock incorrecto:** No devuelve datos esperados
3. **Error handling:** Test de error no funciona correctamente

### **Comandos de verificación:**
```bash
# Verificar estado actual
pnpm test tests/integration/pagination-integration.test.tsx

# Verificar específicamente los tests que fallan
pnpm test tests/integration/pagination-integration.test.tsx --testNamePattern="should render paginated results with controls"
pnpm test tests/integration/pagination-integration.test.tsx --testNamePattern="should handle infinite scroll mode"
pnpm test tests/integration/pagination-integration.test.tsx --testNamePattern="should handle API errors gracefully"
```

### **Criterio de salida:**
- ✅ Test "should render paginated results with controls" pasa (sin timeout)
- ✅ Test "should handle infinite scroll mode" pasa
- ✅ Test "should handle API errors gracefully" pasa
- ✅ Todos los tests de pagination-integration pasan

---

## 🎯 **Objetivo Final: 100% Green**

### **Estado Actual:**
- **Test Suites:** 4 failed, 40 passed, 44 total
- **Tests:** 8 failed, 1 skipped, 429 passed, 438 total
- **Tasa de éxito:** 97.8%

### **Estado Objetivo:**
- **Test Suites:** 0 failed, 44 passed, 44 total
- **Tests:** 0 failed, 0 skipped, 438 passed, 438 total
- **Tasa de éxito:** 100%

### **Comando de verificación final:**
```bash
pnpm test --passWithNoTests --silent | grep -E "(PASS|FAIL|Tests:|Test Suites:)" | tail -10
```

### **Criterio de éxito:**
- ✅ Todos los test suites pasan
- ✅ Todos los tests individuales pasan
- ✅ No hay tests skipped
- ✅ Tasa de éxito = 100%


