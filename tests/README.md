# 🧪 Suite de Tests Completa - Modal de Agendamiento

Esta suite de tests cubre completamente el sistema de agendamiento de visitas, incluyendo tests unitarios, de integración, E2E, performance y accesibilidad.

## 📁 Estructura de Tests

```
tests/
├── hooks/                          # Tests unitarios de hooks
│   └── useVisitScheduler.test.ts   # Hook principal de agendamiento
├── components/                     # Tests unitarios de componentes
│   └── QuintoAndarVisitScheduler.test.tsx
├── integration/                    # Tests de integración
│   └── visitSchedulingFlow.test.tsx
├── api/                           # Tests de APIs
│   ├── availability.test.ts       # API de disponibilidad
│   └── visits.test.ts            # API de visitas
├── e2e/                          # Tests end-to-end
│   └── visitScheduling.e2e.test.ts
├── performance/                   # Tests de performance y accesibilidad
│   └── visitScheduler.performance.test.ts
├── setup.ts                      # Configuración global de Jest
├── global-setup.ts               # Setup global de Playwright
├── global-teardown.ts            # Teardown global de Playwright
└── README.md                     # Este archivo
```

## 🚀 Comandos de Testing

### Tests Unitarios
```bash
# Todos los tests unitarios
pnpm run test:unit

# Solo hooks
pnpm run test:unit -- --testPathPattern="hooks/"

# Solo componentes
pnpm run test:unit -- --testPathPattern="components/"
```

### Tests de Integración
```bash
# Tests de integración
pnpm run test:integration
```

### Tests de API
```bash
# Tests de APIs
pnpm run test:api
```

### Tests End-to-End
```bash
# Todos los tests E2E
pnpm run test:e2e

# Solo tests de performance
pnpm run test:performance

# Solo tests de accesibilidad
pnpm run test:accessibility
```

### Tests Completos
```bash
# Ejecutar todos los tests
pnpm run test:all

# Con coverage
pnpm run test:coverage

# En modo watch
pnpm run test:watch

# Debug mode
pnpm run test:debug
```

## 📊 Cobertura de Tests

### Objetivos de Cobertura
- **Global**: 80% en branches, functions, lines, statements
- **Componentes**: 90% (crítico para UX)
- **Hooks**: 85% (lógica de negocio)

### Comandos de Coverage
```bash
# Generar reporte de cobertura
pnpm run test:coverage

# Ver reporte en navegador
open coverage/lcov-report/index.html
```

## 🎯 Tipos de Tests

### 1. Tests Unitarios
- **Hook useVisitScheduler**: Lógica de estado, validaciones, llamadas a API
- **Componente QuintoAndarVisitScheduler**: Renderizado, interacciones, navegación

### 2. Tests de Integración
- **Flujo completo**: Desde selección hasta confirmación
- **Navegación entre pasos**: Validación de estado
- **Manejo de errores**: Recuperación y feedback

### 3. Tests de API
- **GET /api/availability**: Filtrado, validación, errores
- **POST /api/visits**: Creación, validación, idempotencia

### 4. Tests E2E
- **Flujo completo**: Usuario real navegando
- **Validación de formularios**: Feedback en tiempo real
- **Modo oscuro/claro**: Cambio de tema
- **Accesibilidad**: Navegación con teclado

### 5. Tests de Performance
- **Tiempo de carga**: < 100ms para modal
- **Tiempo de respuesta**: < 50ms para interacciones
- **Uso de memoria**: < 50MB
- **Layout shift**: Mínimo

### 6. Tests de Accesibilidad
- **Contraste**: WCAG AA
- **Navegación con teclado**: Tab order lógico
- **Screen readers**: Labels y roles ARIA
- **Reduced motion**: Respeta preferencias

## 🔧 Configuración

### Jest
- **Configuración**: `jest.config.visitScheduler.js`
- **Setup**: `tests/setup.ts`
- **Mocks**: framer-motion, Next.js router, APIs

### MSW (Mock Service Worker)
- **Versión**: 1.3.2 (MSW v1)
- **Setup**: `tests/setup.ts` (integración), `tests/setupTests.ts` (unitarios)
- **Handlers**: `tests/mocks/handlers.ts`
- **Server**: `tests/mocks/server.ts`
- **Uso**: Tests de integración usan MSW para mocking de APIs HTTP

### Playwright
- **Configuración**: `playwright.config.visitScheduler.ts`
- **Browsers**: Chrome, Firefox, Safari, Mobile
- **Setup/Teardown**: Global para servidor

## 📝 Escribir Nuevos Tests

### Test Unitario
```typescript
import { renderHook, act } from '@testing-library/react';
import { useVisitScheduler } from '@/hooks/useVisitScheduler';

describe('useVisitScheduler', () => {
    it('debería inicializar correctamente', () => {
        const { result } = renderHook(() => 
            useVisitScheduler({ listingId: 'test' })
        );
        
        expect(result.current.isLoading).toBe(false);
    });
});
```

### Test E2E
```typescript
import { test, expect } from '@playwright/test';

test('debería completar flujo de agendamiento', async ({ page }) => {
    await page.goto('/property/test');
    await page.click('text=Agendar Visita');
    
    // ... interacciones del usuario
    
    await expect(page.locator('text=¡Visita confirmada!')).toBeVisible();
});
```

## 🐛 Debugging

### Jest
```bash
# Debug con logs detallados
pnpm run test:debug

# Tests específicos
pnpm run test:unit -- --testNamePattern="should initialize"
```

### Playwright
```bash
# Debug con UI
npx playwright test --ui

# Debug específico
npx playwright test --debug tests/e2e/visitScheduling.e2e.test.ts
```

## 📈 Métricas de Calidad

### Performance
- ✅ Modal carga en < 100ms
- ✅ Interacciones responden en < 50ms
- ✅ Sin layout shift significativo
- ✅ Uso de memoria < 50MB

### Accesibilidad
- ✅ Contraste WCAG AA
- ✅ Navegación completa con teclado
- ✅ Labels y roles ARIA correctos
- ✅ Respeta prefers-reduced-motion

### Funcionalidad
- ✅ Flujo completo funciona
- ✅ Validación en tiempo real
- ✅ Manejo de errores robusto
- ✅ Estado consistente

## 🚨 Troubleshooting

### Tests Fallando
1. **Verificar servidor**: `pnpm run dev` debe estar corriendo
2. **Limpiar cache**: `pnpm run test:debug`
3. **Verificar mocks**: Revisar `tests/setup.ts`

### MSW Issues
1. **MSW no intercepta**: Verificar que `global.fetch = jest.fn()` no esté presente en tests de integración
2. **Version mismatch**: Asegurar uso de MSW v1 API (`rest` en lugar de `http`)
3. **Handlers no funcionan**: Verificar que `server.resetHandlers()` se llame en `beforeEach`
4. **Setup incorrecto**: MSW debe inicializarse antes de cualquier test que use fetch

### Performance Issues
1. **Verificar bundle size**: Revisar imports innecesarios
2. **Optimizar renders**: Usar React.memo, useMemo
3. **Lazy loading**: Cargar componentes bajo demanda

### Accesibilidad Issues
1. **Verificar contraste**: Usar herramientas de contraste
2. **Testear con screen reader**: NVDA, JAWS, VoiceOver
3. **Validar ARIA**: Usar axe-core

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Vitals](https://web.dev/vitals/)

## 🎉 Contribuir

1. **Escribir tests** para nueva funcionalidad
2. **Mantener cobertura** > 80%
3. **Seguir convenciones** de naming
4. **Documentar** casos edge
5. **Optimizar** performance

---

**¡Tests completos = Código confiable! 🚀**
