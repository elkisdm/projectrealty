# Semana 1 - Resolución Auditoría (Ejecutado 2026-01-31)

> **Referencia:** `docs/PLAN_RESOLUCION_AUDITORIA_2026-01-31.md`

---

## Cambios Aplicados

### WP-C: Migración ESLint — COMPLETADO

- [x] **C1:** Agregados ignores de `.eslintignore` a `eslint.config.mjs`:
  - `.next/**/*`
  - `scripts/**/*`
  - `**/*.mjs`
  - `_workspace/**/*`
- [x] **C2:** Eliminado `.eslintignore`

### WP-D: Vulnerabilidades — PARCIAL

- [x] **D1:** Next.js actualizado 16.1.4 → 16.1.5 (4 CVEs resueltos)
- [x] **D2:** eslint-config-next 16.1.4 → 16.1.5
- [x] **D3:** Overrides pnpm agregados para dependencias transitivas:
  - `glob`: >=10.5.0
  - `js-yaml`: >=3.14.2
  - `diff`: >=4.0.4
- [ ] **D4:** Verificar: `pnpm install --no-frozen-lockfile` + `pnpm audit` + `pnpm run build`

### WP-A: Tests — EN PROGRESO

- [x] Corregido 1 test obsoleto: `landing-v2.test.tsx`
  - Ajustada aserción: imports están en `LandingV2Client.tsx`, no en `page.tsx`
- [ ] Ejecutar suite completa y clasificar fallos restantes
- [ ] Corregir tests críticos (API, visits)

---

## Comandos de Verificación (ejecutar manualmente)

```bash
# 1. Completar instalación (si hubo timeout)
pnpm install --no-frozen-lockfile

# 2. Verificar vulnerabilidades
pnpm audit

# 3. Verificar build
pnpm run build

# 4. Verificar lint
pnpm run lint

# 5. Ejecutar tests (puede tardar ~2 min)
pnpm run test
```

---

## Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `eslint.config.mjs` | +4 ignores (.next, scripts, mjs, _workspace) |
| `.eslintignore` | Eliminado |
| `package.json` | next 16.1.5, eslint-config-next 16.1.5, pnpm overrides |
| `tests/unit/landing-v2.test.tsx` | Fix: verificar LandingV2Client.tsx para imports |

---

## Siguiente Iteración

1. Ejecutar `pnpm run test` y capturar lista de suites fallando
2. Priorizar corrección de tests de `tests/api/` y `tests/integration/visit*`
3. Continuar con WP-B (CSP) en Semana 2
