---
title: Paso 04 — A11y labels en AdvancedFilterBar
objective: Asociar labels e inputs; roles y aria-*
area: [a11y]
routes: []
acceptance:
  - [ ] Labels vinculados a controles (getByLabelText funciona)
  - [ ] Botón 'Filtros' accesible por teclado
checks:
  - [ ] a11y
  - [ ] release-gate
refs: [/stories/2025-08-13_tests-stability.story.md]
---

# Paso 04 — A11y labels en AdvancedFilterBar

## Contexto
`getByLabelText('Comuna' | 'Precio mínimo' | etc.)` falla; el botón 'Filtros' no es BUTTON.

## Pre-lectura
- `components/filters/AdvancedFilterBar.tsx`
- `components/filters/FilterBar.tsx`
- `components/filters/SearchInput.tsx`
- `tests/unit/AdvancedFilterBar.test.tsx`

## Implementación
- Añadir `htmlFor`/`id` o `aria-labelledby` entre labels y inputs/selects
- Asegurar que el trigger de filtros sea `<button>` con role adecuado

## Archivos a modificar
- `components/filters/AdvancedFilterBar.tsx`

## QA
```bash
pnpm test tests/unit/AdvancedFilterBar.test.tsx
```

## Riesgos
- Cambios de markup → mantener estilos y estructura visual

## Registro
- Archivos modificados: []
- Estado tests: [antes → después]


