# Sprint 2 - Stories Individuales para Chats Separados

## 🎯 **Contexto Rápido del Sprint 1**
- ✅ **Zustand Store:** `stores/buildingsStore.ts` - Estado global operativo
- ✅ **Hook de Datos:** `hooks/useBuildingsData.ts` - Lógica de negocio integrada  
- ✅ **Card Base:** `components/ui/BuildingCardV2.tsx` - Componente moderno funcionando
- ✅ **Integración:** `components/lists/ResultsGrid.tsx` - Feature flags activos (`CARD_V2=1`)
- ✅ **Tests de Lógica:** 19/19 suites pasando (100% cobertura crítica)
- ✅ **Funcionalidad:** Páginas `/demo` y `/landing` operativas

---

## 📋 **Story 1: Configuración Completa de Testing**

**Copia este prompt para un chat separado:**

```
Sprint 2 - Story 1: Configurar jsdom para tests de React

CONTEXTO:
- Sprint 1 completado con fundación sólida
- Tests de lógica 100% funcionando (19/19 suites)
- Problema: Tests de React fallan por testEnvironment: 'node'
- Necesidad: Configurar jsdom para tests de componentes

ARCHIVOS CLAVE:
- jest.config.ts (actualmente testEnvironment: 'node')
- tests/setupTests.ts (pendiente de configuración)
- tests/unit/BuildingCardV2.test.tsx (fallando por jsdom)
- tests/unit/useBuildingsData.test.ts (fallando por jsdom)

OBJETIVO:
Resolver configuración jsdom y completar tests de componentes

CRITERIOS DE ACEPTACIÓN:
- ✅ jsdom configurado correctamente
- ✅ Todos los tests de componentes pasando
- ✅ Cobertura de tests > 90%
- ✅ Mantener compatibilidad con tests de lógica existentes

COMANDOS DE VERIFICACIÓN:
npm run typecheck
npm run build
npm test -- --testPathPattern="(buildingsStore|zustand|BuildingCardV2-simple|ResultsGrid-integration)"
```

---

## 📋 **Story 2: Virtual Grid para Listas Grandes**

**Copia este prompt para un chat separado:**

```
Sprint 2 - Story 2: Implementar virtual grid para optimizar performance

CONTEXTO:
- Sprint 1: Grid básico implementado en ResultsGrid.tsx
- BuildingCardV2 funcionando con feature flags
- Problema: Performance con 100+ propiedades
- Necesidad: Virtualización para scroll suave

ARCHIVOS CLAVE:
- components/lists/VirtualResultsGrid.tsx (nuevo)
- hooks/useVirtualGrid.ts (nuevo)
- components/lists/ResultsGrid.tsx (integrar virtual grid)
- lib/virtualization.ts (nuevo)

OBJETIVO:
Implementar virtualización para mejorar performance con listas grandes

CRITERIOS DE ACEPTACIÓN:
- ✅ Virtualización con react-window o similar
- ✅ Performance optimizada para 1000+ items
- ✅ Scroll suave y responsive
- ✅ Compatibilidad con filtros existentes
- ✅ Tests de performance
- ✅ Mantener compatibilidad con BuildingCardV2

COMANDOS DE VERIFICACIÓN:
npm run typecheck
npm run build
curl http://localhost:3000/demo
curl http://localhost:3000/landing
```

---

## 📋 **Story 3: Filtros Avanzados con Búsqueda**

**Copia este prompt para un chat separado:**

```
Sprint 2 - Story 3: Implementar filtros avanzados con búsqueda

CONTEXTO:
- Sprint 1: Filtros básicos (comuna, tipología, precio) funcionando
- BuildingCardV2 integrado con feature flags
- Problema: Búsqueda limitada, filtros simples
- Necesidad: Búsqueda por texto y filtros avanzados

ARCHIVOS CLAVE:
- components/filters/AdvancedFilterBar.tsx (nuevo)
- components/filters/SearchInput.tsx (nuevo)
- hooks/useAdvancedFilters.ts (nuevo)
- lib/search.ts (nuevo)
- components/filters/FilterChips.tsx (nuevo)

OBJETIVO:
Mejorar sistema de filtros con búsqueda por texto y filtros múltiples

CRITERIOS DE ACEPTACIÓN:
- ✅ Búsqueda por texto en nombre y descripción
- ✅ Filtros múltiples con chips visuales
- ✅ Búsqueda fuzzy/autocompletado
- ✅ Filtros por amenities, m2, estacionamiento
- ✅ URL sync con filtros avanzados
- ✅ Tests de búsqueda y filtros

COMANDOS DE VERIFICACIÓN:
npm run typecheck
npm run build
curl http://localhost:3000/landing
```

---

## 📋 **Story 4: Paginación Real con Cache**

**Copia este prompt para un chat separado:**

```
Sprint 2 - Story 4: Implementar paginación real con React Query

CONTEXTO:
- Sprint 1: Paginación preparada en buildingsStore.ts
- BuildingCardV2 y filtros funcionando
- Problema: Sin paginación real implementada
- Necesidad: Paginación con cache y optimización

ARCHIVOS CLAVE:
- hooks/useBuildingsPagination.ts (nuevo)
- components/lists/PaginationControls.tsx (nuevo)
- lib/react-query.ts (nuevo)
- api/buildings/paginated.ts (nuevo)
- stores/buildingsStore.ts (actualizar)

OBJETIVO:
Implementar paginación real con cache avanzado y React Query

CRITERIOS DE ACEPTACIÓN:
- ✅ Paginación real con API
- ✅ Cache con React Query
- ✅ Infinite scroll opcional
- ✅ Loading states por página
- ✅ Optimización de requests
- ✅ Tests de paginación

COMANDOS DE VERIFICACIÓN:
npm run typecheck
npm run build
curl http://localhost:3000/landing
```

---

## 📋 **Story 5: Estados de Carga Mejorados**

**Copia este prompt para un chat separado:**

```
Sprint 2 - Story 5: Mejorar estados de carga y UX

CONTEXTO:
- Sprint 1: Skeleton básico implementado
- BuildingCardV2 y funcionalidades funcionando
- Problema: Estados de carga simples
- Necesidad: Loading states más sofisticados

ARCHIVOS CLAVE:
- components/ui/LoadingStates.tsx (nuevo)
- components/ui/SkeletonCard.tsx (nuevo)
- components/ui/LoadingSpinner.tsx (nuevo)
- hooks/useLoadingStates.ts (nuevo)
- components/ui/ErrorBoundary.tsx (nuevo)

OBJETIVO:
Mejorar UX con skeleton loading y estados de carga más elegantes

CRITERIOS DE ACEPTACIÓN:
- ✅ Skeleton loading con animaciones
- ✅ Estados de error elegantes
- ✅ Loading progresivo
- ✅ Error boundaries
- ✅ Retry mechanisms
- ✅ Tests de estados de carga

COMANDOS DE VERIFICACIÓN:
npm run typecheck
npm run build
curl http://localhost:3000/demo
curl http://localhost:3000/landing
```

---

## 📋 **Story 6: Tracking Avanzado**

**Copia este prompt para un chat separado:**

```
Sprint 2 - Story 6: Implementar analytics avanzado

CONTEXTO:
- Sprint 1: Tracking básico implementado en BuildingCardV2
- Todas las funcionalidades del Sprint 2 funcionando
- Problema: Analytics limitado
- Necesidad: Tracking detallado para optimización

ARCHIVOS CLAVE:
- lib/analytics/advanced.ts (nuevo)
- hooks/useAnalytics.ts (nuevo)
- components/analytics/TrackingProvider.tsx (nuevo)
- lib/analytics/events.ts (nuevo)
- lib/analytics/metrics.ts (nuevo)

OBJETIVO:
Implementar analytics detallado para optimizar UX

CRITERIOS DE ACEPTACIÓN:
- ✅ Tracking de interacciones detallado
- ✅ Métricas de performance
- ✅ Funnel de conversión
- ✅ A/B testing support
- ✅ Privacy compliance
- ✅ Tests de analytics

COMANDOS DE VERIFICACIÓN:
npm run typecheck
npm run build
curl http://localhost:3000/demo
curl http://localhost:3000/landing
```

---

## 🔧 **Comandos de Verificación Estándar**

**Para cada story, verificar:**
```bash
# Verificar estado técnico
npm run typecheck
npm run build

# Verificar tests de lógica (siempre deben pasar)
npm test -- --testPathPattern="(buildingsStore|zustand|BuildingCardV2-simple|ResultsGrid-integration)"

# Verificar funcionalidad
curl http://localhost:3000/demo
curl http://localhost:3000/landing
```

**Archivos de referencia siempre disponibles:**
- `SPRINT_1_SUMMARY.md` - Resumen completo del Sprint 1
- `stores/buildingsStore.ts` - Estado global
- `hooks/useBuildingsData.ts` - Hook de datos
- `components/ui/BuildingCardV2.tsx` - Card base
- `components/lists/ResultsGrid.tsx` - Integración

**¡Listo para Sprint 2! 🚀**
