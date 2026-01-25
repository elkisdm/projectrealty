> Last updated: 2026-01-24  
> Changelog: Profesionalización inicial - estructura estandarizada, quality gates reference, rollback detallado

## Purpose
Documentar los pasos para integrar cambios a `main`/`dev` de forma segura, con verificación pre/post-merge y rollback plan. Usa este template DESPUÉS de que QA Gate sea PASS.

## Context ✅
- **Feature / Workpack**: `<FEATURE>` / `<WORKPACK_ID>`
- **Branch**: `<BRANCH_NAME>` → `<TARGET_BRANCH>` (ej: `feat/visits` → `dev`)
- **Commit**: `<COMMIT_HASH>` (últimos 7 chars)
- **Author**: `<AGENT_NAME>` o `<DEV_NAME>`
- **QA Status**: ☑️ PASS (link a QA Gate report si existe)

## Summary ✅
### What changes
(1-2 párrafos: qué se implementó técnicamente)

### Why
(1-2 párrafos: problema que resuelve, impacto en negocio/UX)

## Files Changed ✅
(Máx 10 archivos. Si son más, considerar dividir en 2 PRs.)

- [ ] `<FILE_1>` — (razón del cambio - ej: "agregó validación Zod")
- [ ] `<FILE_2>` — (razón del cambio)
- [ ] `<FILE_3>` — (razón del cambio)

**Stats**:
- Files changed: `<N>`
- Lines added: `+<N>`
- Lines deleted: `-<N>`

## Commands (Pre-Merge Checklist) ✅

### Install/Build
```bash
# Instalar dependencies si hubo cambios en package.json
pnpm install

# Build de producción (verifica que no rompe SSR)
pnpm build
```

**Expected**: Build exitoso sin errores TS/ESLint.

---

### Lint/Typecheck
```bash
# Linter
pnpm lint

# TypeScript strict check
pnpm typecheck
```

**Expected**: 0 errors, 0 warnings críticos.

---

### Test (if any)
```bash
# Si hay tests unitarios (opcional en MVP)
pnpm test

# Si hay E2E (opcional)
pnpm test:e2e
```

**Expected**: Todos los tests pasan. Si fallan, **BLOCK merge**.

---

## Manual Verification (Smoke Test) ✅
**Ejecutar ANTES de merge en local:**

1. 
2. 
3. 

**Expected result**: (qué debe pasar si todo funciona)

**Tested on**:
- [ ] Desktop (Chrome/Safari)
- [ ] Mobile viewport (≤390px en DevTools)
- [ ] Authenticated user
- [ ] Non-authenticated user (si aplica)

---

## Edge Cases to Re-Check ✅
**Verificar manualmente (no confiar solo en QA Gate anterior):**

- [ ] **Mobile (≤390px)**: Layout no rompe, botones ≥44px, no scroll horizontal
- [ ] **Back/Forward**: Browser navigation no pierde estado crítico
- [ ] **Refresh (F5)**: Datos persisten (URL/cookies/DB) o se re-fetching
- [ ] **API error (simular 500)**: Muestra error user-friendly, no crash
- [ ] **Empty data**: Muestra empty state con CTA claro
- [ ] **User no autenticado**: Redirect a login o mensaje claro

---

## Quality Gates (Quick Reference) ✅
(Confirmar que todos siguen PASS después de rebase/merge de main)

- [ ] **G1 Contract**: Tipos TS, Zod schemas, sin `any`
- [ ] **G2 Security**: Auth, RLS, rate-limit, sin PII en logs
- [ ] **G3 UX States**: Loading/empty/error/success presentes
- [ ] **G4 Edge Cases**: Mobile, back/forward, refresh, offline
- [ ] **G5 Verification**: Smoke tests reproducibles (≤5 pasos)

⚠️ **Si algún gate cambia a FAIL post-rebase, STOP y corregir antes de merge.**

---

## Rollback Plan ✅

### How to Revert Safely
```bash
# Opción 1: Revert del merge commit (si ya se mergeó)
git revert -m 1 <MERGE_COMMIT_HASH>

# Opción 2: Revert de commits individuales (si no se mergeó aún)
git revert <COMMIT_HASH>

# Opción 3: Rollback de deploy en Vercel (si ya está en prod)
# 1. Ir a Vercel dashboard → Deployments
# 2. Buscar deployment previo estable
# 3. "Promote to Production"
```

### What to Watch After Deploy
(Monitoreo post-merge para detectar issues)

- [ ] **Vercel logs**: Buscar errors 500/400 inusuales (primeros 5min)
- [ ] **Sentry/Console**: Errores JS en cliente (primeros 10min)
- [ ] **Analytics**: Bounce rate / conversión drop (primeras 24h)
- [ ] **User reports**: Tickets/feedback de usuarios (primeras 48h)
- [ ] **DB queries**: Slow queries o deadlocks (si tocaste DB/API)

**Trigger de Rollback**:
- Error rate >5% en primeros 10min
- Funcionalidad crítica rota (login, pagos, búsqueda)
- Issue de seguridad detectado (auth bypass, data leak)

---

## Assumptions
⚠️ **Si cualquier assumption es falsa, re-verificar antes de merge**

- [ ] Branch `<BRANCH_NAME>` está actualizado con `<TARGET_BRANCH>` (sin conflictos)
- [ ] Todos los commits tienen mensajes Conventional (feat:, fix:, chore:)
- [ ] ENV vars necesarias están en Vercel (si se agregaron nuevas)
- [ ] Dependencies nuevas son compatibles con Node 18+ / Next 14
- [ ] DB migrations (si aplican) se ejecutaron en staging

## Open Questions (max 3)
1. 
2. 
3. 

⚠️ **Si hay preguntas críticas sin resolver, status = BLOCKED**

---

## Merge Readiness ✅
- **Status**: ☑️ READY / 🚫 BLOCKED / ⏳ WAITING
- **Reason**: (1 línea - ej: "Todos los checks PASS, smoke tests OK", "BLOCKED: esperando approval de PM")
- **Blockers**: (si BLOCKED/WAITING, listar qué falta)

**Criteria para READY**:
- ✅ QA Gate = PASS
- ✅ Build exitoso (`pnpm build`)
- ✅ Lint/typecheck sin errores
- ✅ Smoke tests ejecutados y pasaron
- ✅ Edge cases verificados
- ✅ Rollback plan documentado

---

## Next Iteration Suggestion ✅
(1 bullet con siguiente micro-tarea lógica post-merge)
- 

---

## Merge Execution (Checklist Final)
**Ejecutar en este orden:**

1. [ ] Rebase branch con `<TARGET_BRANCH>`: `git rebase <TARGET_BRANCH>`
2. [ ] Resolver conflictos (si hay), re-ejecutar smoke tests
3. [ ] Push force: `git push --force-with-lease`
4. [ ] Crear PR en GitHub/GitLab con este Merge Plan en descripción
5. [ ] Esperar approval (si aplica) o auto-merge si eres owner
6. [ ] Post-merge: Ejecutar "What to Watch After Deploy" (primeros 10min)
7. [ ] Notificar a equipo en Slack/Discord: "Merged `<FEATURE>` to `<TARGET_BRANCH>`"
8. [ ] Cerrar issue/ticket asociado (si existe)

**PR Title Format**:
```
<type>(<scope>): <description>

Ejemplos:
feat(search): add filters to mobile search bar
fix(api): add rate-limit to /api/visits endpoint
chore(deps): update next to 14.2.1
```

**PR Description Template**:
```markdown
## What
(copy de "Summary - What changes")

## Why
(copy de "Summary - Why")

## Testing
- Smoke tests: ✅ (link a Merge Plan)
- Edge cases: ✅
- QA Gate: ✅ PASS

## Rollback
(link a "Rollback Plan" section)
```