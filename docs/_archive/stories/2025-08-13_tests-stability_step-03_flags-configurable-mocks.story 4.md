---
title: Paso 03 — Flags configurables para tests
objective: Permitir mocking de flags como `CARD_V2`
area: [tests]
routes: []
acceptance:
  - [ ] Tests pueden forzar on/off sin errores de configurabilidad
checks:
  - [ ] release-gate
refs: [/stories/2025-08-13_tests-stability.story.md]
---

# Paso 03 — Flags configurables para tests

## Contexto
`jest.spyOn(flags, 'CARD_V2', 'get')` falla al no ser configurable.

## Pre-lectura
- `lib/flags.ts`
- `config/feature-flags.ts`
- `tests/integration/ResultsGrid.test.tsx`
- `tests/__mocks__/`

## Implementación
- Exponer flags como getters configurables o proveer mock en `tests/__mocks__/flags.ts`
- Ajustar tests para usar el mock

## Archivos a modificar
- `lib/flags.ts` (si aplica)
- `tests/integration/ResultsGrid.test.tsx`
- `tests/__mocks__/flags.ts` (nuevo)

## QA
```bash
pnpm test tests/integration/ResultsGrid.test.tsx
```

## Riesgos
- Cambios en import shape de flags → mantener API actual

## Registro
- Archivos modificados: []
- Estado tests: [antes → después]


