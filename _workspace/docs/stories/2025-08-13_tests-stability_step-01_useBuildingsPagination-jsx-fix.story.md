---
title: Paso 01 — Fix JSX/TSX en useBuildingsPagination test
objective: Corregir sintaxis JSX para ejecutar la suite del archivo
area: [tests]
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
Errores TS en `tests/unit/useBuildingsPagination.test.ts` por JSX sin TSX (TS1005, TS1161, TS1128).

## Pre-lectura
- `tests/unit/useBuildingsPagination.test.ts`
- `hooks/useBuildingsPagination.ts`
- `tests/setupTests.ts`

## Implementación
- Cambiar extensión a `.tsx` si el archivo contiene JSX
- Asegurar wrapper con `QueryClientProvider` si el test usa hooks de React Query

## Archivos a modificar
- `tests/unit/useBuildingsPagination.test.ts`

## QA
```bash
pnpm typecheck
pnpm test tests/unit/useBuildingsPagination.test.ts
```

## Riesgos
- Ninguno (solo sintaxis del test)

## Registro
- Archivos modificados: []
- Estado tests: [antes → después]


