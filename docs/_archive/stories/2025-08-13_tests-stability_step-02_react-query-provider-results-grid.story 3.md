---
title: Paso 02 — React Query Provider en tests de ResultsGrid
objective: Proveer QueryClientProvider para hooks de React Query
area: [tests]
routes: []
acceptance:
  - [ ] Tests de integración no fallan por falta de provider
checks:
  - [ ] release-gate
refs: [/stories/2025-08-13_tests-stability.story.md]
---

# Paso 02 — React Query Provider para ResultsGrid

## Contexto
Errores "No QueryClient set" en tests de integración (hooks en `useBuildingsPagination`).

## Pre-lectura
- `tests/integration/ResultsGrid.test.tsx`
- `components/lists/ResultsGrid.tsx`
- `hooks/useBuildingsPagination.ts`
- `lib/react-query.ts`

## Implementación
- Crear helper `renderWithQueryClient`
- Envolver render de `ResultsGrid` con `QueryClientProvider`

## Archivos a modificar
- `tests/integration/ResultsGrid.test.tsx`
- (opcional) `tests/utils/render.tsx`

## QA
```bash
pnpm test tests/integration/ResultsGrid.test.tsx
```

## Riesgos
- QueryCache persistente entre tests → usar `new QueryClient()` por test

## Registro
- Archivos modificados: []
- Estado tests: [antes → después]


