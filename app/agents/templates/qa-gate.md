> Last updated: 2026-01-24  
> Changelog: Profesionalización inicial - estructura estandarizada, criterios explícitos por gate, anti-invención

## Purpose
Verificar que una implementación cumple los 5 Quality Gates antes de merge. Usa este template ANTES de aprobar cualquier PR o commit a `main`/`dev`.

## Context ✅
- **Feature / Workpack**: `<FEATURE>` / `<WORKPACK_ID>`
- **Agent responsible**: `<AGENT_NAME>`
- **Files changed**: `<FILES>` (lista de paths modificados)
- **Branch**: `<BRANCH_NAME>`
- **Commit**: `<COMMIT_HASH>` (últimos 7 chars)

## Objective ✅
Validar que la implementación es **production-ready** según los 5 gates (G1–G5). Si algún gate falla, **BLOCK merge** y solicitar corrección.

## Scope (In/Out) ✅
### ✅ In Scope (qué se verifica)
- Código implementado en `<FILES>`
- Contratos (tipos, API schemas, props)
- Estados de UI (loading/error/empty/success)
- Edge cases (mobile, auth, errors, refresh)
- Verificación reproducible (smoke tests)

### ❌ Out of Scope (no se verifica ahora)
- Performance (lighthouse scores) - auditoría separada
- Unit tests (opcional en MVP) - se priorizan smoke tests
- Refactors futuros - solo bloquear si rompe funcionamiento

## Risk Level ✅
- **Level**: High / Medium / Low
- **Why**: (1 línea - ej: "High: toca auth + RLS", "Low: solo copy change")

**Criteria:**
- **High**: Auth, pagos, RLS, data exposure, APIs públicas
- **Medium**: UI flows, forms, búsquedas, navegación
- **Low**: Copy, estilos, componentes atómicos, docs

## Quality Gates Verdict (G1–G5) ✅

### G1 Contract (inputs/outputs)
- **Status**: ☑️ PASS / ⚠️ FAIL / ➖ N/A
- **Notes**: 

**Qué verificar:**
- [ ] Props de componentes tienen tipos TS claros (no `any`)
- [ ] APIs tienen Zod schema server-side + validación
- [ ] Respuestas de API siguen formato `{ data, error }` consistente
- [ ] Funciones exportadas tienen JSDoc si son públicas
- [ ] Tipos complejos usan interfaces/types, no inline

**Ejemplos de FAIL:**
- Props con `any` o `Record<string, any>`
- API sin validación Zod
- Funciones sin tipos de retorno

---

### G2 Security (auth/RLS/data exposure)
- **Status**: ☑️ PASS / ⚠️ FAIL / ➖ N/A
- **Notes**: 

**Qué verificar:**
- [ ] Rutas protegidas verifican `session` server-side
- [ ] APIs tienen rate-limit (20/60s default)
- [ ] Queries usan RLS (Row Level Security en Supabase)
- [ ] No se expone PII en logs/console/errors públicos
- [ ] Inputs se validan/sanitizan antes de DB/API
- [ ] Tokens/keys no están hardcoded

**Ejemplos de FAIL:**
- API sin `await auth.getSession()`
- Query sin `.from('table').select().eq('user_id', userId)`
- `console.log({ email, phone })` en prod

---

### G3 UX States (loading/empty/error)
- **Status**: ☑️ PASS / ⚠️ FAIL / ➖ N/A
- **Notes**: 

**Qué verificar:**
- [ ] **Loading**: Spinner/skeleton mientras carga
- [ ] **Empty**: Mensaje + CTA cuando no hay datos
- [ ] **Error**: Mensaje user-friendly + retry/fallback
- [ ] **Success**: Confirmación visual (toast, redirect, etc.)
- [ ] Estados no se "flashean" (debounce ≥300ms si aplica)

**Ejemplos de FAIL:**
- Componente sin `if (isLoading) return <Skeleton />`
- Error crudo `{error.message}` expuesto al usuario
- Array vacío muestra UI rota en lugar de empty state

---

### G4 Edge Cases (routing/back/forward/refresh/mobile)
- **Status**: ☑️ PASS / ⚠️ FAIL / ➖ N/A
- **Notes**: 

**Qué verificar:**
- [ ] **Mobile**: Viewport ≤390px funciona (scroll, tap targets ≥44px)
- [ ] **Back/Forward**: Navegación del browser no rompe estado
- [ ] **Refresh**: F5 no pierde datos críticos (usar URL/cookies/DB)
- [ ] **Offline**: Fetch errors manejados con retry/fallback
- [ ] **Data faltante**: `null`/`undefined` no crashea (optional chaining)
- [ ] **User no autenticado**: Redirect a login, no crash

**Ejemplos de FAIL:**
- Botones de <40px en mobile
- Refresh borra form incompleto sin warning
- `data.items.map()` sin verificar `data?.items`

---

### G5 Verification (reproducible steps)
- **Status**: ☑️ PASS / ⚠️ FAIL
- **Notes**: 

**Qué verificar:**
- [ ] Smoke tests documentados (≤5 pasos)
- [ ] Pasos son reproducibles por otra persona
- [ ] Incluyen URL, credenciales de test, datos de entrada
- [ ] Resultado esperado está claro ("debe mostrar X", "debe retornar Y")

**Ejemplos de FAIL:**
- "Probar que funciona" (demasiado vago)
- Pasos requieren setup no documentado
- Sin resultado esperado explícito

---

## Smoke Tests (must pass 100%) ✅
**Instrucciones reproducibles en ≤5 pasos:**

1. 
2. 
3. 

**Expected result**: (qué debe pasar si todo funciona)

## Edge Cases Checklist ✅
- [ ] **Mobile viewport** (≤390px): ¿funciona sin scroll horizontal / botones tapeable?
- [ ] **Usuario no autenticado**: ¿redirige a login o muestra error claro?
- [ ] **API retorna 500**: ¿muestra error user-friendly con retry?
- [ ] **Data vacía**: ¿muestra empty state con CTA?
- [ ] **Back/Forward/Refresh**: ¿mantiene estado o lo recupera de URL/DB?

## Known Issues (allowed?) ✅
(Listar issues no bloqueantes que se dejan pasar. Si hay issues bloqueantes, **FAIL** el gate.)

- ⚠️ **Issue**: (descripción breve)
  - **Impact**: (qué falla / quién lo ve)
  - **Mitigation**: (workaround temporal si existe)
  - **Follow-up**: (issue#, WP#, o "next iteration")

⚠️ **Regla**: Si hay issues sin mitigation + follow-up, **FAIL** merge.

## Assumptions
⚠️ **Si cualquier assumption es falsa, re-test con info correcta**

- [ ] Testing en branch `<BRANCH_NAME>` con commit `<COMMIT_HASH>`
- [ ] DB de test tiene datos seed (users, units, buildings)
- [ ] ENV vars configuradas (`.env.local` completo)
- [ ] Dependencies instaladas (`pnpm install` ejecutado)

## Open Questions (max 3)
1. 
2. 
3. 

⚠️ **Si hay preguntas sin responder que afectan la verificación, status = BLOCKED**

## Merge Readiness ✅
- **Status**: ☑️ PASS / ⚠️ FAIL / 🚫 BLOCKED
- **Reason**: (1 línea explicando - ej: "Todos los gates PASS, smoke tests OK", "FAIL en G2 - falta rate-limit")

**Criteria:**
- **PASS**: G1-G5 todos PASS, smoke tests 100%, known issues mitigados
- **FAIL**: 1+ gates FAIL, smoke tests fallan, issues bloqueantes sin mitigation
- **BLOCKED**: Open questions sin resolver, dependencies faltantes, waiting PR externo

## Next Iteration Suggestion ✅
(1 bullet con siguiente micro-tarea o mejora post-merge)
- 

---

## QA Gatekeeper Checklist (uso interno)
Antes de aprobar, verificar:
- [ ] Leí el código en `<FILES>` (no solo confiar en descripción)
- [ ] Ejecuté smoke tests localmente (no solo revisión estática)
- [ ] Probé 3+ edge cases de la lista
- [ ] Verifiqué que no rompe SSR (`pnpm build` pasa)
- [ ] Confirmé que linter/typecheck pasan (`pnpm lint && pnpm typecheck`)