---
title: Paso 01 — Fix JSX/TSX en useBuildingsPagination test
objective: Corregir sintaxis JSX para ejecutar la suite del archivo
area: [a11y]
routes: []
acceptance:
  - [ ] Test compila y corre
  - [ ] Sin modificar lógica de producción
checks:
  - [ ] release-gate
refs: [/stories/2025-08-13_tests-stability.story.md]
---

# Paso 01 — Fix JSX/TSX en useBuildingsPagination test

## Contexto
Errores TS en `tests/unit/useBuildingsPagination.test.ts` por JSX sin TSX.

## Implementación
- Cambiar extensión a `.tsx` o ajustar JSX al estilo TS
- Asegurar imports de `QueryClientProvider` si aplica

## Archivos a modificar
- `tests/unit/useBuildingsPagination.test.ts`

## QA
```bash
pnpm test tests/unit/useBuildingsPagination.test.ts
```

## Riesgos
- Ninguno (solo sintaxis)
