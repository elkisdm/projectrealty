# Metodología — Tests Stability Sprint

## Objetivo
Llevar la suite de tests a estado verde (0 fallos) sin introducir regresiones, con trazabilidad por paso y contexto suficiente para el siguiente cambio.

## Flujo por paso
1. Crear/actualizar la story del paso en `stories/` siguiendo la estructura indicada abajo
2. Ejecutar QA local (tests específicos + typecheck)
3. Aplicar edits mínimos y atómicos en código
4. Registrar en `CHANGELOG.tests-stability.md` (antes → después, archivos, comandos, notas)
5. Validar Release Gate (lint, ts, tests, build si aplica)

## Estructura de artefactos
- Story principal del sprint: `stories/2025-08-13_tests-stability.story.md`
- Changelog del sprint: `stories/CHANGELOG.tests-stability.md`
- Stories por paso: `stories/<YYYY-MM-DD>_tests-stability_step-XX_<slug>.story.md`
 - Roadmap del sprint (pre-lecturas y orden): `stories/ROADMAP.tests-stability.md`

## Plantilla para stories por paso
---
title: Paso XX — <título>
objective: <qué se corrige/mejora>
area: [a11y|perf|tests]
routes: []
acceptance:
  - [ ] Condición 1
  - [ ] Condición 2
checks:
  - [ ] release-gate
refs: [/stories/2025-08-13_tests-stability.story.md]
---

# Paso XX — <título>

## Contexto
Breve contexto del fallo/objetivo y su impacto.

## Implementación
Bullets concretos con los cambios mínimos a aplicar.

## Archivos a modificar
- `ruta/al/archivo`

## QA
```bash
pnpm typecheck
pnpm lint
pnpm test <archivo-o-patrón>
```

## Riesgos
- Riesgo y mitigación

## Checklist
- [ ] AC cumplidos
- [ ] Tests verdes local

## Formato de registro en CHANGELOG
- Fecha
- Paso
- Objetivo
- Archivos modificados
- Comandos ejecutados
- Estado tests (antes → después)
- Notas y riesgos

# Metodología — Tests Stability Sprint

## Flujo por Paso
1) Crear/abrir story del paso en `stories/2025-08-13_tests-stability/step-XX_*.story.md`
2) Ejecutar QA local (tests específicos + typecheck)
3) Aplicar edits mínimos en código
4) Registrar en `CHANGELOG.md` (antes/Después, archivos, comandos)
5) Validar Release Gate (lint, ts, tests, build si aplica)

## Nomenclatura
- Story principal: `stories/2025-08-13_tests-stability.story.md`
- Stories por paso: `stories/2025-08-13_tests-stability/step-XX_<slug>.story.md`
- Changelog del sprint: `stories/2025-08-13_tests-stability/CHANGELOG.md`

## Comandos QA
```bash
pnpm typecheck
pnpm lint
pnpm test --passWithNoTests
pnpm test <archivo>
```

## Buenas Prácticas
- Cambios pequeños y atómicos
- No re-estructurar tests salvo necesidad
- Mocks centralizados en `tests/__mocks__`
- Evitar romper SSR/A11y
- Documentar riesgos y mitigación en cada paso
