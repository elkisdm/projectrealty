# CHANGELOG — Tests Stability Sprint

Formato por paso:
- Fecha
- Paso
- Objetivo
- Archivos modificados
- Comandos ejecutados
- Estado de tests (antes → después)
- Notas y riesgos

## Snapshot Inicial
- Fecha: 2025-08-13
- Estado: 6 suites fallidas, 39 suites OK; 20 tests fallando, 417 pasando
- Principales fallos:
  - A11y en `AdvancedFilterBar`
  - QueryClient ausente en integración `ResultsGrid`
  - Flags no configurables para mocking
  - Error de sintaxis en `useBuildingsPagination.test.ts`

---

## Paso 01 — Fix JSX en useBuildingsPagination
- Objetivo: Habilitar ejecución del test corrigiendo JSX/TSX
- Archivos: `tests/unit/useBuildingsPagination.test.ts`
- Comandos: `pnpm test useBuildingsPagination.test.ts`
- Estado: [por completar]
- Notas: [por completar]

## Paso 02 — React Query Provider en integración
- Objetivo: Proveer `QueryClientProvider` en `ResultsGrid` tests
- Archivos: `tests/integration/ResultsGrid.test.tsx`
- Comandos: `pnpm test ResultsGrid.test.tsx`
- Estado: [por completar]

## Paso 03 — Flags configurables
- Objetivo: Permitir mocking de `flags.CARD_V2`
- Archivos: `lib/flags.ts` o mock en `tests/__mocks__`
- Comandos: `pnpm test ResultsGrid.test.tsx`
- Estado: [por completar]

## Paso 04 — A11y labels en AdvancedFilterBar
- Objetivo: Asociar labels/inputs; roles y aria-*
- Archivos: `components/filters/AdvancedFilterBar.tsx`
- Comandos: `pnpm test AdvancedFilterBar.test.tsx`
- Estado: [por completar]
