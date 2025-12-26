# Resultados de Tests - Rama Dev

**Fecha:** 2025-11-29  
**Rama:** `dev`  
**Comando:** `pnpm test`

## Resumen General

- **Test Suites:** 25 failed, 53 passed, 78 total
- **Tests:** 77 failed, 4 skipped, 522 passed, 603 total
- **Tiempo:** ~23 segundos

## Estado

✅ **522 tests pasando** (86.6%)  
❌ **77 tests fallando** (12.8%)  
⏭️ **4 tests saltados** (0.7%)

## Problemas Identificados

### 1. Tests de Playwright ejecutándose en Jest
- `tests/e2e/visitScheduling.e2e.test.ts`
- `tests/e2e/msw-e2e.test.ts`

**Solución:** Estos tests deben ejecutarse con `pnpm test:e2e` (Playwright), no con Jest.

### 2. Tests de API con problemas de configuración
- `tests/api/availability.test.ts` - `Request is not defined`
- `tests/api/visits.test.ts` - Problemas similares

**Causa:** Falta configuración de entorno para Next.js server-side en Jest.

### 3. Tests de integración con MSW
- `tests/integration/msw-integration.test.tsx` - Problemas con mocks
- Varios tests de integración con problemas similares

### 4. Tests de componentes/hooks
- Varios tests de hooks y componentes fallando por problemas de imports o mocks

## Configuración Actualizada

✅ `jest.config.ts` actualizado para incluir:
- `@data/*` → `_workspace/data/*`
- `@workspace/*` → `_workspace/*`

## Próximos Pasos

1. **Excluir tests de Playwright de Jest:**
   - Agregar `testPathIgnorePatterns` en `jest.config.ts`

2. **Configurar entorno para tests de API:**
   - Agregar setup para Next.js server-side

3. **Revisar y corregir tests de integración:**
   - Verificar mocks de MSW
   - Corregir imports después de reorganización

4. **Ejecutar tests por categoría:**
   ```bash
   pnpm test:unit      # Tests unitarios
   pnpm test:integration  # Tests de integración
   pnpm test:api       # Tests de API
   pnpm test:e2e       # Tests E2E (Playwright)
   ```

## Nota

La mayoría de los tests (86.6%) están pasando. Los fallos son principalmente por:
- Configuración después de reorganización
- Tests de Playwright mezclados con Jest
- Problemas de entorno para tests de API

