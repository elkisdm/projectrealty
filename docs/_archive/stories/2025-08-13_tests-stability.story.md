---
title: Tests Stability Sprint
objective: Llevar la suite a 0 tests fallando sin regresiones
area: [tests, a11y, perf]
routes: [/]
acceptance:
  - [ ] 0 tests fallando
  - [ ] Build exitoso
  - [ ] Sin regresiones funcionales
checks:
  - [ ] a11y
  - [ ] release-gate
refs: [/docs/DECISIONES.md, /reports/RELEASE_GATE.md]
---

# Sprint: Tests Stability

## 🎯 Objetivo
Reducir fallos actuales (≈20 tests fallando) a 0, con cambios mínimos y reversibles, registrando cada modificación y su impacto.

## 📋 Criterios de Aceptación

### AC1: Estado verde de la suite
- [ ] 0 tests fallando
- [ ] `pnpm build` exitoso

### AC2: No regresiones
- [ ] Sin cambios de API pública
- [ ] Sin romper SSR/A11y

### AC3: Observabilidad del proceso
- [ ] Cada paso documentado como story
- [ ] CHANGELOG actualizado tras cada paso

## 🔧 Implementación

### Pasos del sprint (stories)
- `stories/2025-08-13_tests-stability_step-01_useBuildingsPagination-jsx-fix.story.md`
- `stories/2025-08-13_tests-stability_step-02_react-query-provider-results-grid.story.md`
- `stories/2025-08-13_tests-stability_step-03_flags-configurable-mocks.story.md`
- `stories/2025-08-13_tests-stability_step-04_a11y-labels-advanced-filter-bar.story.md`

### Archivos de tracking
- `stories/CHANGELOG.tests-stability.md`
- `stories/README.tests-stability.md`
- `stories/ROADMAP.tests-stability.md`

## ✅ Checklist

### Funcional
- [ ] Suite verde

### Calidad
- [ ] Tests pasando
- [ ] TS sin errores
- [ ] Lint sin warnings

### A11y
- [ ] Labels asociados
- [ ] Teclado OK

### Performance
- [ ] Sin sobrecosto en tests

### Release Gate
- [ ] Lint ✅
- [ ] Type check ✅
- [ ] Tests ✅
- [ ] Build ✅

## 📚 Referencias
- [/docs/DECISIONES.md]
- [/reports/RELEASE_GATE.md]

## ⚠️ Riesgos
- Cambios en tests que oculten bugs → Mitigar con alcance mínimo por paso
- Mocks inconsistentes → Centralizar en `tests/__mocks__`

## 🎯 Estimación
- Tiempo: 2–3 sesiones
- Complejidad: Media

---
title: Tests Stability Sprint
objective: Llevar la suite a 0 tests fallando sin regressions
area: [a11y, perf]
routes: [/]
acceptance:
  - [ ] 0 tests fallando
  - [ ] Build exitoso
  - [ ] Sin regresiones funcionales
checks:
  - [ ] a11y
  - [ ] release-gate
refs: [/docs/DECISIONES.md, /reports/RELEASE_GATE.md]
---

# Sprint: Tests Stability

## 🎯 Objetivo
Reducir fallos actuales (20 tests fallando) a 0, con cambios mínimos y reversibles, registrando cada modificación y su impacto.

## 📋 Criterios de Aceptación

### AC1: Estado verde de la suite
- [ ] 0 tests fallando
- [ ] `pnpm build` exitoso

### AC2: No regressions
- [ ] Sin cambios de API pública
- [ ] Sin romper SSR/A11y

### AC3: Observabilidad del proceso
- [ ] Cada paso documentado como story
- [ ] CHANGELOG actualizado tras cada paso

## 🔧 Implementación

### Stories de pasos
- `stories/2025-08-13_tests-stability/step-01_useBuildingsPagination-jsx-fix.story.md`
- `stories/2025-08-13_tests-stability/step-02_react-query-provider-results-grid.story.md`
- `stories/2025-08-13_tests-stability/step-03_flags-configurable-mocks.story.md`
- `stories/2025-08-13_tests-stability/step-04_a11y-labels-advanced-filter-bar.story.md`

### Archivos de tracking
- `stories/2025-08-13_tests-stability/CHANGELOG.md`
- `stories/README.tests-stability.md`

## ✅ Checklist

### Funcional
- [ ] Suite verde

### Calidad
- [ ] Tests pasando
- [ ] TS sin errores
- [ ] Lint sin warnings

### A11y
- [ ] Labels asociados
- [ ] Teclado OK

### Performance
- [ ] Sin sobrecosto en tests

### Release Gate
- [ ] Lint ✅
- [ ] Type check ✅
- [ ] Tests ✅
- [ ] Build ✅

## 📚 Referencias
- [/docs/DECISIONES.md]
- [/reports/RELEASE_GATE.md]

## ⚠️ Riesgos
- Cambios en tests que oculten bugs → Mitigar con alcance mínimo por paso
- Mocks inconsistentes → Centralizar en `tests/__mocks__`

## 🎯 Estimación
- Tiempo: 2–3 sesiones
- Complejidad: Media