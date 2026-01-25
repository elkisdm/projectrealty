> Last updated: 2026-01-24

## Purpose

Este documento define los Quality Gates unificados para el sistema de agentes. Cada gate es binario (PASS/FAIL/N/A) y se aplica según el tipo de agente y workpack.

---

## Universal Gates (G1-G5)

Estos gates aplican a la mayoría de los agentes y workpacks.

### G1: Contract Compliance

**Objetivo**: Asegurar que todos los contratos están bien definidos y son type-safe.

**Criterios PASS**:
- [ ] TypeScript types defined without `any`
- [ ] Zod schemas for validation (server-side)
- [ ] Input/output contracts explicit and documented
- [ ] Props interfaces documented with JSDoc
- [ ] **Validated against `context/CONTRACTS.md` (no duplicate definitions)**

**Criterios FAIL**:
- ❌ Uso de `any` en TypeScript
- ❌ Contratos implícitos o no documentados
- ❌ Props sin interfaz definida
- ❌ Tipos duplicados que ya existen en CONTRACTS.md

**Verificación**:
```bash
# TypeScript strict mode check
pnpm run typecheck

# Buscar uso de 'any'
rg ": any" --type ts
```

---

### G2: Security & Privacy

**Objetivo**: Garantizar seguridad básica y privacidad de datos.

**Criterios PASS**:
- [ ] Auth checks where applicable (middleware, RLS)
- [ ] RLS policies enabled (Supabase tables)
- [ ] Rate limiting implemented (20 req/60s default)
- [ ] No PII in logs (emails, names, phones stripped)
- [ ] Input sanitization (Zod validation server-side)

**Criterios FAIL**:
- ❌ Endpoint público sin rate limit
- ❌ RLS deshabilitado en tabla con datos sensibles
- ❌ Logs con PII visible
- ❌ Validación solo client-side (sin server-side)

**Verificación**:
```sql
-- Check RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = false;
-- Expected: empty (all tables have RLS)
```

---

### G3: UX States & Edge Cases

**Objetivo**: Asegurar que la UI maneja todos los estados posibles.

**Criterios PASS**:
- [ ] Loading states visible (spinner/skeleton)
- [ ] Empty states with clear messaging + CTA
- [ ] Error states with retry options
- [ ] Edge cases handled (null, undefined, empty arrays)
- [ ] No layout shift durante loading

**Criterios FAIL**:
- ❌ Pantalla vacía sin indicador de carga
- ❌ Crash con datos vacíos
- ❌ Error sin mensaje ni retry
- ❌ Layout shift violento al cargar

**Verificación**:
```typescript
// Test edge cases
- Test con data = []
- Test con data = undefined
- Test con data = null
- Test con error de red (offline)
```

---

### G4: Code Quality & Consistency

**Objetivo**: Mantener código consistente con las convenciones del proyecto.

**Criterios PASS**:
- [ ] TailwindCSS (no inline styles)
- [ ] Dark mode support (`dark:...` variants)
- [ ] Mobile-first responsive
- [ ] TypeScript strict mode
- [ ] Consistent naming conventions (PascalCase components, camelCase functions)

**Criterios FAIL**:
- ❌ Uso de `style={{ ... }}` inline
- ❌ Hardcoded colors (no dark mode)
- ❌ No responsive (rompe en mobile)
- ❌ TypeScript con `@ts-ignore` sin justificar

**Verificación**:
```bash
# Check for inline styles
rg "style=" --type tsx

# Check linter
pnpm run lint
```

---

### G5: Verification & Testing

**Objetivo**: Asegurar que los cambios son verificables y reversibles.

**Criterios PASS**:
- [ ] Smoke tests reproducible (≤5 steps)
- [ ] Edge cases documented
- [ ] Manual verification steps included
- [ ] Rollback plan documented

**Criterios FAIL**:
- ❌ Sin pasos de verificación
- ❌ Test que requiere setup complejo no documentado
- ❌ Sin plan de rollback

**Verificación**:
```markdown
## Smoke Test Example
1. Open /page
2. Click button X
3. Verify result Y
Expected: Y appears, no errors
```

---

## Specialized Gates (G6-G9)

Estos gates aplican solo a agentes/workpacks específicos.

### G6: Mobile Sheet UX (UI/QA only)

**Objetivo**: Asegurar que modals/sheets móviles funcionan correctamente.

**Aplicable a**: UI Builder, QA Gatekeeper (cuando toca modals/sheets)

**Criterios PASS**:
- [ ] Body scroll locked when open (`overflow: hidden`)
- [ ] Internal scroll works (scroll container dentro del sheet)
- [ ] Focus trap active (Tab no escapa)
- [ ] Escape key closes
- [ ] Focus returns to trigger on close

**Criterios FAIL**:
- ❌ Double scroll (body + sheet)
- ❌ Tab escapa del modal
- ❌ Focus perdido al cerrar
- ❌ No cierra con Escape

**Verificación**:
```typescript
// Mobile sheet checklist
1. Open sheet → body scroll bloqueado
2. Scroll dentro del sheet → funciona
3. Press Tab repetidamente → no escapa
4. Press Escape → cierra y regresa foco
```

---

### G7: Performance (Backend/UI only)

**Objetivo**: Asegurar performance aceptable.

**Aplicable a**: Data/Backend, UI Builder

**Criterios PASS (Backend)**:
- [ ] Query cost <1000 (interactive queries)
- [ ] Index usage verified (EXPLAIN Analyze)
- [ ] Pagination mandatory (max 100 rows)
- [ ] N+1 queries avoided

**Criterios PASS (Frontend)**:
- [ ] No layout shift (skeleton con dimensiones estables)
- [ ] Memoization where appropriate (`useCallback`, `useMemo`)
- [ ] Lazy loading de componentes pesados
- [ ] Images optimized (`next/image`)

**Criterios FAIL**:
- ❌ Query sin índice (Seq Scan en tabla >1000 rows)
- ❌ Fetch sin límite (puede traer 10K+ rows)
- ❌ Re-renders innecesarios (sin memoización)
- ❌ Layout shift CLS >0.1

**Verificación (Backend)**:
```sql
EXPLAIN ANALYZE SELECT ... FROM ... WHERE ...;
-- Expected: Index Scan, cost <1000, time <100ms
```

**Verificación (Frontend)**:
```bash
# Lighthouse performance score
pnpm run lighthouse
# Expected: Performance >90
```

---

### G8: Freshness (Context only)

**Objetivo**: Asegurar que la documentación está actualizada.

**Aplicable a**: Context Indexer

**Criterios PASS**:
- [ ] Last updated ≤7 days (repos activos)
- [ ] No references to deleted files
- [ ] Patterns reflect current code (no legacy)

**Criterios FAIL**:
- ❌ Documentación de hace >30 días sin updates
- ❌ Links rotos a archivos eliminados
- ❌ Patterns obsoletos documentados como actuales

**Verificación**:
```bash
# Check last update date
head -5 context/CONTRACTS.md
# Expected: > Last updated: 2026-01-XX (menos de 7 días)

# Check for broken links
rg "app/.*\.tsx" context/ | while read line; do
  file=$(echo $line | grep -oP 'app/.*\.tsx')
  [ -f "$file" ] || echo "BROKEN: $file"
done
```

---

### G9: Actionable Context (Context only)

**Objetivo**: Asegurar que el contexto es accionable (copy-paste ready).

**Aplicable a**: Context Indexer

**Criterios PASS**:
- [ ] Links to files with line numbers (`file.ts:15-30`)
- [ ] Examples included (code snippets)
- [ ] Copy-paste ready (no necesita edición)

**Criterios FAIL**:
- ❌ Context Pack sin links
- ❌ Patterns sin ejemplos de código
- ❌ Instrucciones vagas ("mejora X")

**Verificación**:
```markdown
## Good Context Example
File: `app/api/units/route.ts:25-40`
```typescript
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data } = await supabase.from('units').select('*');
  return NextResponse.json({ data });
}
```
```

---

## Matrix by Agent

| Gate | Orchestrator | Data/Backend | UI Builder | QA Gatekeeper | Context Indexer |
|------|--------------|--------------|------------|---------------|-----------------|
| **G1: Contract** | ✅ Required | ✅ Required | ✅ Required | ✅ Required | N/A |
| **G2: Security** | ✅ Required | ✅ Required | N/A | ✅ Required | N/A |
| **G3: UX States** | ✅ Required | N/A | ✅ Required | ✅ Required | N/A |
| **G4: Code Quality** | ✅ Required | ✅ Required | ✅ Required | ✅ Required | N/A |
| **G5: Verification** | ✅ Required | ✅ Required | ✅ Required | ✅ Required | N/A |
| **G6: Mobile Sheet** | N/A | N/A | ✅ Required | ✅ Required | N/A |
| **G7: Performance** | N/A | ✅ Required | ✅ Required | N/A | N/A |
| **G8: Freshness** | N/A | N/A | N/A | N/A | ✅ Required |
| **G9: Actionable** | N/A | N/A | N/A | N/A | ✅ Required |

---

## Matrix by Workpack

| Gate | WP1 (Discovery) | WP2 (Backend) | WP3 (Frontend) | WP4 (Testing) | WP5 (Polish) |
|------|-----------------|---------------|----------------|---------------|--------------|
| **G1: Contract** | ✅ Required | ✅ Required | ✅ Required | ✅ Required | ✅ Required |
| **G2: Security** | If touches auth/RLS | ✅ Required | N/A | ✅ Required | ✅ Required |
| **G3: UX States** | N/A | N/A | ✅ Required | ✅ Required | N/A |
| **G4: Code Quality** | ✅ Required | ✅ Required | ✅ Required | ✅ Required | ✅ Required |
| **G5: Verification** | ✅ Required | ✅ Required | ✅ Required | ✅ Required | ✅ Required |
| **G6: Mobile Sheet** | N/A | N/A | If touches modals | ✅ Required | N/A |
| **G7: Performance** | N/A | ✅ Required | ✅ Required | N/A | ✅ Required |

---

## Usage Guidelines

### When to Check Gates

**During Development**:
- Developer checks gates informalmente mientras codea
- Pre-commit: G1 (typecheck), G4 (lint) automatizados

**Before Requesting Review**:
- Agent ejecuta checklist de gates aplicables
- Documenta resultados en merge plan

**During QA Review**:
- QA Gatekeeper valida todos los gates aplicables
- Status: PASS / FAIL / N/A (justificado)

**Before Merge**:
- Orchestrator verifica que todos los gates requeridos están en PASS
- Si alguno FAIL → Review Request

---

## Gate Status Format

En merge plans y QA reports:

```markdown
## Quality Gates

- [x] **G1: Contract Compliance** - PASS
  - TypeScript strict, no `any` found
  - Zod schemas in place
  - Validated against CONTRACTS.md
  
- [x] **G2: Security & Privacy** - PASS
  - RLS enabled on `units` table
  - Rate limit: 20/60s configured
  - No PII in logs verified

- [x] **G3: UX States** - PASS
  - Loading: skeleton with stable dimensions
  - Empty: "No results" message + CTA
  - Error: retry button functional

- [ ] **G4: Code Quality** - N/A
  - (Justification: hotfix, no new code)

- [x] **G5: Verification** - PASS
  - Smoke test: 3 steps, reproducible
  - Rollback plan: revert migration
```

---

## Escalation Rules

**If Gate Fails**:
1. Agent crea Review Request con detalles del fail
2. Agent corrige issues
3. Agent re-submits para QA
4. Loop hasta PASS

**If Gate Cannot Pass** (blocker técnico):
1. Escalar a Orchestrator
2. Documentar blocker + workaround propuesto
3. Orchestrator decide: proceder con workaround, cambiar approach, o posponer

---

## Changelog

### v1.0 (2026-01-24)
- Initial unified quality gates system
- G1-G5: Universal gates for all agents
- G6-G9: Specialized gates per domain
- Matrix by agent and workpack
- PASS/FAIL/N/A format standardized