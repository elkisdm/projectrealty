> Last updated: 2026-01-24  
> Changelog: Profesionalización inicial - estructura estandarizada, output contract parseable, anti-invención

## Purpose
Prompt específico para ejecutar UNA micro-tarea con un agente especializado. Usa este template cuando delegas una tarea a UI Builder, Data-Backend, QA Gatekeeper, etc.

## Context ✅
- **Agent**: `<AGENT_NAME>` (Orchestrator / UI Builder / Data-Backend / QA Gatekeeper / Architect / Release)
- **Mode**: Feature / Hotfix / Audit
- **Workpack ID**: `<WORKPACK_ID>` (si aplica, para trazabilidad)
- **Repo area**: `<REPO_AREA>` (ej: `components/search/`, `app/api/visits/`)
- **Relevant files**: `<FILES>` (contexto actual, sin inventar)
- **Current behavior**: (estado actual observable)
- **Desired behavior**: (estado objetivo específico y medible)

## Objective ✅
(1 párrafo: qué debe lograr este agente en esta iteración)

## Scope (In/Out) ✅
### ✅ In Scope (solo esta micro-tarea)
- 
- 

### ❌ Out of Scope (deja para siguiente iteración)
- 
- 

## Task (single micro-task) ✅
(Descripción concisa de la tarea. 1-3 oraciones máximo. Debe ser completable en ≤30 min.)

**Ejemplo:**
> "Agregar validación Zod server-side al endpoint POST /api/visits con rate-limit 20/60s. Retornar 429 si excede. No tocar cliente aún."

## Inputs ✅
- `<FEATURE>`: (nombre de feature)
- `<FILES>`: (paths exactos de archivos a modificar, máx 3)
- `<PROPS>` / `<API_SHAPE>` / `<DB_COLUMNS>`: (contratos técnicos necesarios)
- `<DEPENDENCIES>`: (librerías requeridas con versiones)

## Output Contract ✅
**Formato mandatorio de respuesta del agente:**

### 1) Goal (1 párrafo)
(Qué se busca lograr y por qué)

### 2) Spec / Contract
- **Inputs**: (qué recibe - tipos TS, Zod schema si es API)
- **Outputs**: (qué retorna - tipos TS, status codes si es API)
- **Side effects**: (qué muta - DB, state, localStorage, cookies)

### 3) Files to Change (máx 3)
- `<FILE_1>`: (razón del cambio)
- `<FILE_2>`: (razón del cambio)
- `<FILE_3>`: (razón del cambio)

⚠️ **Si necesitas tocar >3 archivos, justificar o dividir en 2 tareas.**

### 4) Implementation (code per file)
```typescript
// <FILE_1>
// Diff mínimo: solo lo que cambia + 3 líneas de contexto
```

### 5) Merge Plan (steps)
- [ ] Install/build: `<COMMANDS>`
- [ ] Lint/typecheck: `pnpm lint && pnpm typecheck`
- [ ] Smoke test: (pasos 1-3 reproducibles)
- [ ] Edge case check: (qué probar manualmente)

### 6) Verification (smoke tests + edge cases)
**Smoke (happy path):**
1. 
2. 
3. 

**Edge cases:**
- [ ] Mobile (≤390px)
- [ ] Error state (API 500)
- [ ] Empty data
- [ ] Unauthorized user
- [ ] Back/refresh

### 7) Risks / Tradeoffs (máx 5)
- 
- 

## Quality Gates (G1–G5) ✅
- [ ] **G1 Contract**: Tipos TS claros, Zod si es API, sin `any`
- [ ] **G2 Security**: Auth, RLS, rate-limit, sanitización, sin PII en logs
- [ ] **G3 UX States**: Loading/empty/error/success - todos presentes
- [ ] **G4 Edge Cases**: Mobile, back/forward, refresh, offline
- [ ] **G5 Verification**: Smoke test ≤5 pasos, reproducible

## Constraints (hard rules) ✅
- ✅ **Cambios mínimos**: Solo diff necesario, sin refactors colaterales
- ✅ **Máx 3 archivos/componentes** tocados (salvo justificación)
- ✅ **No inventar APIs/tablas/props**: Si falta info, proveer **Plan A / Plan B** y elegir el más seguro
- ✅ **Incluir verificación**: Smoke tests (mín 3) + edge cases (mín 3)
- ✅ **Respetar SSR**: No romper Server Components, no usar `window` sin `"use client"`
- ✅ **A11y básico**: `aria-label`, `role`, keyboard nav cuando aplique

## Assumptions
⚠️ **Si cualquier assumption es falsa, STOP y pedir aclaración al Orchestrator**

- [ ] Componente `<COMPONENT>` existe y acepta props `<PROPS>`
- [ ] Endpoint `<API_ENDPOINT>` retorna `{ data: <SHAPE>, error?: string }`
- [ ] Tabla `<DB_TABLE>` tiene RLS configurado y columnas `<COLUMNS>`
- [ ] Librería `<LIBRARY>` v`<VERSION>` instalada
- [ ] Usuario autenticado tiene permisos para acción X

## Open Questions (max 3)
1. 
2. 
3. 

⚠️ **Si no puedes responder, provee Plan A / Plan B:**
- **Plan A** (conservador): (solución sin inventar, puede ser subóptima)
- **Plan B** (óptimo): (requiere confirmar assumption X)
- **Elegido**: Plan A (default si hay duda)

## Merge Readiness ✅
- **Status**: PASS / FAIL / BLOCKED
- **Reason**: (1 línea - ej: "Todos los gates PASS, smoke tests OK", "FAIL en G2 - falta RLS")
- **Blockers**: (si BLOCKED/FAIL, qué falta)

## Next Iteration Suggestion ✅
(1 bullet con siguiente micro-tarea lógica)
- 

---

## Anti-Patterns (NO hacer)
- ❌ Tocar >3 archivos sin justificación
- ❌ Inventar endpoints/tablas/props sin confirmar
- ❌ Refactors masivos fuera de scope
- ❌ Código sin tipos (`any`, `unknown` sin validar)
- ❌ APIs sin Zod validation server-side
- ❌ Componentes sin estados de error/loading
- ❌ Commits sin verificación reproducible