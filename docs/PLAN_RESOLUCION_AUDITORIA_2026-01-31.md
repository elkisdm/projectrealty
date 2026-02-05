# Plan Integral: Resolución Post-Auditoría 2026-01-28

> **Objetivo:** Cerrar todos los ítems pendientes de `AUDITORIA_COMPLETA_2026-01-28.md`  
> **Fecha creación:** 2026-01-31  
> **Contexto:** `/context/INDEX.md`, `/context/PATTERNS.md`, `/context/CONTRACTS.md`

---

## 1. Resumen Ejecutivo

| Área | Estado Actual | Meta | Prioridad |
|------|---------------|------|-----------|
| Tests | 29 suites fallando, 163 tests fallando | 0 suites fallando | 🔴 Alta |
| CSP | No implementado | Content-Security-Policy activo | 🔴 Alta |
| ESLint | `.eslintignore` deprecado, 78 warnings | Migrado + warnings < 20 | 🟡 Media |
| Console statements | ~10 activos en app/ | Migrar a logger | 🟢 Baja |
| Variables no usadas | ~15 warnings | Prefijo `_` o eliminar | 🟢 Baja |
| Vulnerabilidades | 3 (js-yaml, glob, diff) | 0 | 🟡 Media |
| Rate limiting | In-memory | Redis (producción) | 🟡 Media |
| Sesiones admin | Sin expiración | Refresh tokens | 🟢 Largo plazo |
| Bundle size | No analizado | Documentado | 🟢 Largo plazo |

---

## 2. Workpacks y Orden de Ejecución

### WP-A: Tests (Prioridad Alta)

**Objetivo:** Reducir 29 suites fallando a 0, manteniendo tests críticos.

| Paso | Descripción | Archivos | Criterio de Éxito |
|------|-------------|----------|-------------------|
| A1 | Ejecutar `pnpm test` y capturar lista de suites fallando | - | Lista completa de 29 suites |
| A2 | Clasificar: **críticos** (API, auth, visits) vs **obsoletos** vs **low-value** | - | Matriz prioridad |
| A3 | Corregir tests críticos: actualizar imports, mocks, assertions | `tests/api/*`, `tests/integration/visit*` | Suites críticas PASS |
| A4 | Actualizar o eliminar tests obsoletos (ej. `landing-v2.test.tsx` → HeroV2) | `tests/unit/landing-v2*` | Sin falsos negativos |
| A5 | Decidir: eliminar o deshabilitar tests low-value | `tests/unit/*.test.tsx` | Suite completa PASS |

**Riesgos:**
- Eliminar tests que aún aportan valor → priorizar actualización sobre eliminación
- Tests que dependen de APIs externas → usar mocks/MSW

**Comandos QA:**
```bash
pnpm run test
# Verificar: Test Suites: 0 failed, 60+ passed
```

---

### WP-B: Content-Security-Policy (Prioridad Alta)

**Objetivo:** Implementar CSP en `next.config.mjs` sin romper funcionalidad.

| Paso | Descripción | Archivos | Criterio de Éxito |
|------|-------------|----------|-------------------|
| B1 | Definir política base (report-only en staging primero) | `next.config.mjs` | CSP header presente |
| B2 | Configurar `default-src`, `script-src`, `style-src`, `img-src`, `connect-src` | `next.config.mjs` | Sin errores en consola |
| B3 | Incluir dominios: Supabase, analytics (gtag, fbq), inline scripts Next | `next.config.mjs` | Formularios y tracking OK |
| B4 | Activar enforcement (quitar report-only) tras validación | `next.config.mjs` | CSP activo en prod |

**Política sugerida (base):**
```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://connect.facebook.net;
style-src 'self' 'unsafe-inline';
img-src 'self' data: https: blob:;
connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com;
font-src 'self';
frame-ancestors 'self';
```

**Riesgos:**
- `unsafe-inline` / `unsafe-eval` requeridos por Next.js en algunos casos → documentar y reducir gradualmente

---

### WP-C: Migración ESLint (Prioridad Media)

**Objetivo:** Migrar `.eslintignore` a `eslint.config.mjs` y eliminar `.eslintignore`.

| Paso | Descripción | Archivos | Criterio de Éxito |
|------|-------------|----------|-------------------|
| C1 | Agregar ignores de `.eslintignore` al array `ignores` en `eslint.config.mjs` | `eslint.config.mjs` | Mismos paths ignorados |
| C2 | Eliminar `.eslintignore` | `.eslintignore` | Archivo eliminado |
| C3 | Verificar `pnpm run lint` sin cambios en resultado | - | 0 errores |

**Ignores a migrar:**
```
.next/**/*
scripts/**/*
**/*.mjs
_workspace/**/*
**/* 2.*
**/* 3.*
...
```

---

### WP-D: Vulnerabilidades de Dependencias (Prioridad Media)

**Objetivo:** Resolver 3 CVEs (js-yaml, glob, diff).

| Paso | Descripción | Archivos | Criterio de Éxito |
|------|-------------|----------|-------------------|
| D1 | Ejecutar `pnpm audit` | - | Lista actual de CVEs |
| D2 | Ejecutar `pnpm audit fix` | `package.json`, `pnpm-lock.yaml` | Aplicar fixes seguros |
| D3 | Resoluciones manuales si audit fix no alcanza | `package.json` (overrides/resolutions) | `pnpm audit` = 0 vulnerabilidades |
| D4 | Verificar build y tests | - | Build OK, tests OK |

**Nota:** Todas las vulnerabilidades están en devDependencies; producción no afectada directamente.

---

### WP-E: Limpieza de Warnings ESLint (Prioridad Media-Baja)

**Objetivo:** Reducir ~78 warnings a < 20 (priorizar impacto).

| Paso | Descripción | Archivos | Criterio de Éxito |
|------|-------------|----------|-------------------|
| E1 | Migrar console statements a `logger` | Ver lista en §3 | 0 `console.*` en app/ (excepto error boundaries) |
| E2 | Prefijar variables no usadas con `_` o eliminar | ~15 archivos | 0 `no-unused-vars` |
| E3 | Revisar `react-hooks/exhaustive-deps` | 2 archivos | Dependencies correctas |
| E4 | (Opcional) Separar exports mixtos para React Refresh | ~40 warnings | Baja prioridad |

**Archivos con console activo (a migrar):**
- `app/cv/components/DownloadPDFButton.tsx`
- `app/arriendo/departamento/[comuna]/[slug]/page.tsx`
- `app/(catalog)/property/[slug]/page.tsx`
- `app/sitemap.ts`
- `app/global-error.tsx`, `app/error.tsx` (mantener console en error boundaries si necesario)

---

### WP-F: Rate Limiting Persistente (Prioridad Media, Largo Plazo)

**Objetivo:** Rate limiting que funcione en múltiples instancias (Vercel/Edge).

| Paso | Descripción | Archivos | Criterio de Éxito |
|------|-------------|----------|-------------------|
| F1 | Evaluar: Upstash Redis vs Vercel KV vs Edge Config | - | Decisión documentada |
| F2 | Crear adaptador `lib/rate-limit.ts` con backend configurable | `lib/rate-limit.ts` | API compatible con actual |
| F3 | Implementar driver Redis/KV | `lib/rate-limit-redis.ts` | Rate limit distribuido |
| F4 | Configurar env vars (UPSTASH_URL, etc.) | `config/env.example` | Documentado |
| F5 | Migrar endpoints críticos al nuevo rate limiter | `app/api/*` | Sin regresiones |

---

### WP-G: Mejoras Adicionales (Prioridad Baja / Backlog)

| Ítem | Descripción | Estimación |
|------|-------------|------------|
| Sesiones admin | Refresh tokens + expiración | 1–2 días |
| Bundle analysis | `@next/bundle-analyzer` + documentar | 0.5 día |
| Logging centralizado | Integrar Sentry/LogRocket en prod | 1 día |
| Cobertura de tests | Aumentar cobertura en APIs críticas | Iterativo |

---

## 3. Cronograma Sugerido

| Semana | Workpacks | Entregables |
|--------|-----------|-------------|
| 1 | WP-A (Tests), WP-C (ESLint migración), WP-D (Audit fix) | Tests pasando, ESLint migrado, 0 CVEs |
| 2 | WP-B (CSP), WP-E.1 (Console → logger) | CSP en staging, menos warnings |
| 3 | WP-E.2–E.4 (resto warnings) | Warnings < 20 |
| 4+ | WP-F (Redis rate limit) | Rate limit distribuido (opcional) |

---

## 4. Quality Gates por Workpack

| Gate | WP-A | WP-B | WP-C | WP-D | WP-E | WP-F |
|------|------|------|------|------|------|------|
| G1 Contrato | ✓ Tests validan contratos | ✓ CSP no rompe cargas | ✓ Mismo comportamiento | ✓ Dependencias compatibles | ✓ Sin regresiones | ✓ API compatible |
| G2 Seguridad | N/A | ✓ CSP reduce XSS | N/A | ✓ CVEs resueltos | N/A | ✓ Rate limit efectivo |
| G3 Estados UI | N/A | ✓ Sin errores en consola | N/A | N/A | N/A | N/A |
| G4 Edge cases | ✓ Back/forward, refresh | ✓ Inline scripts permitidos | ✓ Lint en CI | ✓ Build + tests | ✓ Error boundaries | ✓ Múltiples instancias |
| G5 Verificación | ✓ `pnpm test` | ✓ DevTools → Network | ✓ `pnpm lint` | ✓ `pnpm audit` | ✓ `pnpm lint` | ✓ Load test |

---

## 5. Comandos de Verificación Global

```bash
# Build
pnpm run build

# TypeScript
pnpm run typecheck

# Linter
pnpm run lint

# Tests
pnpm run test

# Auditoría de dependencias
pnpm audit
```

---

## 6. Merge Readiness Checklist

Antes de considerar cerrada la resolución de la auditoría:

- [ ] Tests: 0 suites fallando
- [ ] CSP: Implementado y validado en staging
- [ ] ESLint: Migrado a `ignores`, `.eslintignore` eliminado
- [ ] Vulnerabilidades: `pnpm audit` = 0
- [ ] Console: Migrados a logger en app/ (excepto error boundaries)
- [ ] Build y typecheck: OK

---

## 7. Siguiente Iteración Sugerida

**Empezar por WP-A.1:** Ejecutar tests y generar la lista exacta de 29 suites fallando para priorizar correcciones. Es el bloqueador más visible y tiene mayor impacto en confianza del CI.

---

**Documento creado:** 2026-01-31  
**Referencia:** `AUDITORIA_COMPLETA_2026-01-28.md`  
**Asignación a agentes:** `app/agents/Orchestrator.md` § M) Assigned Tasks
