> Last updated: 2026-01-24  
> Changelog: Profesionalización inicial - convertido a feedback loop QA→Dev, observaciones blocking/non-blocking

## Purpose
Template para solicitar correcciones a una implementación después de QA Gate. Usa cuando un gate FALLA o hay issues bloqueantes. Este es el feedback loop entre QA Gatekeeper y el agente implementador.

## Context ✅
- **Feature / Workpack**: `<FEATURE>` / `<WORKPACK_ID>`
- **Agent responsible**: `<AGENT_NAME>` (quien implementó)
- **Reviewer**: `<REVIEWER_NAME>` (quien revisó - normalmente QA Gatekeeper)
- **QA Gate Status**: ⚠️ FAIL (qué gates fallaron)
- **Files reviewed**: `<FILES>`
- **Review date**: `<DATE>`

## What Was Delivered ✅
### Summary
(1-2 párrafos: qué se implementó, scope original)

### Files Touched
- `<FILE_1>` — (qué se cambió)
- `<FILE_2>` — (qué se cambió)
- `<FILE_3>` — (qué se cambió)

### Key Decisions
(Decisiones técnicas tomadas durante implementación - ej: "usamos Zod en lugar de validación manual", "optamos por SSR en lugar de CSR")

---

## Observations ✅

### 🚫 Blocking (must fix before merge)
(Issues que impiden merge - rompen funcionalidad, seguridad, o gates críticos)

1. **`<FILE>` línea `<N>`**: (descripción del issue)
   - **Gate affected**: G1 / G2 / G3 / G4 / G5
   - **Why blocking**: (impacto - ej: "expone PII en logs", "crashea en mobile")
   - **Suggested fix**: (sugerencia concreta)

2. **`<FILE>` línea `<N>`**: 
   - **Gate affected**: 
   - **Why blocking**: 
   - **Suggested fix**: 

---

### ⚠️ Non-Blocking (nice to fix, pero no impide merge)
(Mejoras de código, DX, performance - pueden ir a siguiente iteración)

1. **`<FILE>` línea `<N>`**: (descripción)
   - **Suggestion**: (qué mejorar)
   - **Benefit**: (por qué importa - ej: "mejor DX", "más readable")
   - **Priority**: Low / Medium

2. **`<FILE>` línea `<N>`**: 
   - **Suggestion**: 
   - **Benefit**: 
   - **Priority**: 

---

## Quality Gates Failures ✅
(Detallar qué gates fallaron y por qué)

- [ ] **G1 Contract**: ☑️ PASS / ⚠️ FAIL
  - Issue: (ej: "Props sin tipos", "API sin Zod")
  
- [ ] **G2 Security**: ☑️ PASS / ⚠️ FAIL
  - Issue: (ej: "Falta rate-limit", "RLS no verificado")
  
- [ ] **G3 UX States**: ☑️ PASS / ⚠️ FAIL
  - Issue: (ej: "No hay empty state", "Error crudo expuesto")
  
- [ ] **G4 Edge Cases**: ☑️ PASS / ⚠️ FAIL
  - Issue: (ej: "Rompe en mobile", "Refresh pierde estado")
  
- [ ] **G5 Verification**: ☑️ PASS / ⚠️ FAIL
  - Issue: (ej: "Smoke tests vagos", "No reproducible")

---

## Required Fixes (ordered by priority) ✅
(Lista ordenada de fixes mandatorios antes de re-submit)

1. **Priority 1 (Security/Crash)**: 
   - [ ] Fix: (descripción específica)
   - [ ] File: `<FILE>`
   - [ ] ETA: (estimación - ej: "10min", "30min")

2. **Priority 2 (Functionality)**: 
   - [ ] Fix: 
   - [ ] File: 
   - [ ] ETA: 

3. **Priority 3 (UX/Edge Cases)**: 
   - [ ] Fix: 
   - [ ] File: 
   - [ ] ETA: 

⚠️ **Total ETA**: (suma de ETAs - si >1h, considerar dividir en 2 reviews)

---

## Acceptance Criteria (DoD for this revision) ✅
**Para que el re-submit sea APROBADO, debe cumplir:**

- [ ] Todos los blocking issues corregidos
- [ ] Quality Gates que fallaron ahora son PASS
- [ ] Smoke tests actualizados y ejecutados (todos PASS)
- [ ] Edge cases que fallaron ahora funcionan
- [ ] Código sigue convenciones (TS strict, Tailwind, RSC cuando aplique)
- [ ] Linter/typecheck pasan sin warnings
- [ ] Build exitoso (`pnpm build`)

---

## Provide in Your Next Response ✅
(Checklist de lo que el agente debe entregar en el re-submit)

- [ ] **Updated code per file**: (diff mínimo, solo lo corregido)
- [ ] **Updated verification steps**: (smoke tests + edge cases re-ejecutados)
- [ ] **Notes on tradeoffs**: (si hubo decisiones técnicas en los fixes)
- [ ] **Self-QA**: (confirmar que ejecutaste los checks antes de re-submit)

**Response format**:
```markdown
## Fixes Applied
### File: `<FILE>`
(código corregido con diff)

### File: `<FILE>`
(código corregido con diff)

## Re-Test Results
- [ ] G1–G5 status: (actualizado)
- [ ] Smoke tests: (re-ejecutados, todos PASS)
- [ ] Edge cases: (verificados)

## Tradeoffs (if any)
(decisiones tomadas, alternativas descartadas)
```

---

## Assumptions
⚠️ **Si cualquier assumption es falsa, aclarar antes de re-submit**

- [ ] Reviewer testeó en branch `<BRANCH_NAME>` commit `<COMMIT_HASH>`
- [ ] ENV vars están configuradas (no hay issues de setup)
- [ ] Dependencies instaladas (`pnpm install` reciente)
- [ ] Blocking issues son realmente blockers (no false positives)

## Open Questions (max 3)
1. 
2. 
3. 

⚠️ **Si el implementador no está de acuerdo con algún blocking issue, discutir antes de fix.**

---

## Re-Submit Readiness ✅
- **Status**: 🔄 AWAITING FIXES / ✅ READY FOR RE-REVIEW
- **ETA**: (cuándo se espera el re-submit - ej: "en 30min", "mañana 10am")
- **Blockers**: (si hay dudas o blockers para implementar fixes)

---

## Next Iteration Suggestion ✅
(1 bullet con mejora post-merge si todos los fixes son aplicados)
- 

---

## Review Cycle Tracker (uso interno)
(Tracking de iteraciones - útil si hay múltiples rounds de review)

- **Cycle 1**: Initial review → `<N>` blocking issues found
- **Cycle 2**: Re-submit → `<N>` issues fixed, `<N>` remaining
- **Cycle 3**: (si aplica)

⚠️ **Regla**: Si >3 cycles, escalar a Orchestrator (scope mal definido o implementador necesita más contexto).