> Last updated: 2026-01-24  
> Changelog: Profesionalización inicial - estructura estandarizada, límites operacionales, anti-invención

## Purpose
Definir una unidad de trabajo multi-paso (macro-tarea) que involucra 1-3 agentes y produce un entregable verificable. Usa este template al inicio de un ciclo de trabajo.

## Context ✅
- **Workpack ID**: `<WORKPACK_ID>` (ej: WP#024)
- **Repo area**: `<REPO_AREA>` (ej: `app/`, `components/marketing/`, `lib/api/`)
- **Relevant files**: `<FILES>` (lista de paths actuales que contextualizan)
- **Current state**: (comportamiento actual o punto de partida)
- **Target state**: (comportamiento deseado al finalizar el workpack)

## Objective ✅
(1-2 párrafos: qué se busca lograr y por qué importa para el negocio/UX)

## Scope (In/Out) ✅
### ✅ In Scope (máx 3)
- 
- 
- 

### ❌ Out of Scope (máx 3)
- 
- 
- 

## Inputs ✅
- `<FEATURE>`: (nombre de la feature/tarea principal)
- `<RISK_LEVEL>`: High / Medium / Low
- `<DB_TABLES>`: (si aplica, tablas involucradas)
- `<API_ENDPOINTS>`: (si aplica, endpoints nuevos o modificados)
- `<COMPONENTS>`: (si aplica, componentes clave)

## Output Contract ✅
Al finalizar este workpack, se debe entregar:
- [ ] **Code**: Implementación completa en `<FILES>` (máx 3 archivos por paso)
- [ ] **Tests**: Smoke tests manuales documentados (mín 3)
- [ ] **Merge Plan**: Checklist de comandos + verificación + rollback
- [ ] **QA Gate**: Reporte con G1-G5 PASS/FAIL
- [ ] **Docs**: Actualización de README/CHANGELOG si aplica

## Plan (Steps) ✅
⚠️ **Límite: Máx 3 steps por workpack. Si necesitas más, divide en 2 workpacks.**

### Step 1: `<STEP_NAME>`
- **Agent**: `<AGENT_NAME>` (Orchestrator / UI Builder / Data-Backend / QA Gatekeeper)
- **Task**: (micro-tarea específica, ≤30min ejecución)
- **Files**: `<FILES>` (máx 3)
- **Output**: (artefacto entregable)

### Step 2: `<STEP_NAME>`
- **Agent**: `<AGENT_NAME>`
- **Task**: 
- **Files**: 
- **Output**: 

### Step 3: `<STEP_NAME>`
- **Agent**: `<AGENT_NAME>`
- **Task**: 
- **Files**: 
- **Output**: 

## Dependencies
- **Agents needed**: `<AGENT_NAMES>` (máx 3 por workpack)
- **Requires Orchestrator decision**: Yes / No (si hay tradeoffs arquitectónicos)
- **Requires schema/API confirmation**: Yes / No (si hay inventos de tablas/endpoints)
- **Blockers**: (dependencias externas, PRs pendientes, decisiones de negocio)

## Quality Gates (G1–G5) ✅
- [ ] **G1 Contract**: Inputs/outputs definidos, tipos TypeScript claros, Zod schema si es API
- [ ] **G2 Security**: Auth verificado, RLS activo, rate-limit 20/60s, sin PII en logs
- [ ] **G3 UX States**: Loading, empty, error, success - todos los estados cubiertos
- [ ] **G4 Edge Cases**: Mobile, back/forward, refresh, offline, datos faltantes
- [ ] **G5 Verification**: Smoke test reproducible en ≤5 pasos manuales

## Verification (Smoke + Edge Cases) ✅
### Smoke Tests (happy path, debe pasar 100%)
1. 
2. 
3. 

### Edge Cases (debe manejar sin crash)
- [ ] Mobile viewport (≤390px)
- [ ] Usuario no autenticado intenta acceder
- [ ] API retorna 500/timeout
- [ ] Data vacía o null
- [ ] Back/forward/refresh en mid-flow

## Risks / Tradeoffs
(Máx 5 bullets. Identifica antes de ejecutar)
- 
- 
- 

## Assumptions
⚠️ **Si cualquier assumption es falsa, STOP y pedir aclaración**

- [ ] Tabla `<DB_TABLE>` existe con columnas `<COLUMNS>`
- [ ] Endpoint `<API_ENDPOINT>` retorna shape `<SHAPE>`
- [ ] Componente `<COMPONENT>` acepta props `<PROPS>`
- [ ] Librería `<LIBRARY>` está instalada (version `<VERSION>`)
- [ ] RLS policies ya están configuradas en `<DB_TABLE>`

## Open Questions (max 3)
1. 
2. 
3. 

⚠️ **Resolver antes de ejecutar Step 1. Si no tienes respuesta, provee Plan A / Plan B.**

## Operational Constraints
- ✅ **1 micro-tarea por step** (≤30 min ejecución)
- ✅ **Máx 3 archivos** tocados por step
- ✅ **Máx 3 agentes** involucrados en el workpack completo
- ✅ **Plan A/Plan B** si falta información (default: Plan A = más conservador)

## Merge Readiness ✅
- **Status**: PENDING / READY / BLOCKED
- **Reason**: (1 línea explicando por qué - ej: "Todos los gates PASS", "Bloqueado por decisión de API schema")
- **Blockers**: (si BLOCKED, lista qué se necesita)

## Next Iteration Suggestion ✅
(1 bullet con la siguiente micro-tarea después de que este workpack sea merged)
-