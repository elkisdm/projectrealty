> **Version:** 1.0  
> **Last updated:** 2026-01-24  
> **Purpose:** Documentar el flujo exacto para ejecutar 1 micro-tarea con el sistema de agentes

---

## ⚡ Resumen Ejecutivo

**1 iteración = 1 micro-tarea completa (feature mínima, fix, mejora)**

**Secuencia:**
```
User Brief → Orchestrator → Workpack → Agent → Merge Plan → QA Gate → READY/BLOCKED
```

**Tiempo estimado:** 30-90 min (depende de complejidad)

**Límites duros:**
- 1 micro-tarea por iteración
- Max 3 archivos tocados (salvo refactor justificado)
- Max 3 agentes involucrados (UI + Backend + QA típico)

---

## 📋 Artefactos del Sistema

| Artefacto | Quién genera | Cuándo | Formato |
|-----------|--------------|--------|---------|
| **User Brief** | Usuario/PM | Inicio | Texto libre + contexto |
| **Workpack** | Orchestrator | Post-análisis | Markdown estructurado |
| **Merge Plan** | Agent (UI/Backend/Data) | Post-implementación | Template de merge-plan.md |
| **QA Gate** | QA Gatekeeper | Pre-merge | G1-G6 verdict + test plan |
| **Status** | Cualquier agent | Cualquier momento | READY / BLOCKED / WAITING |

---

## 🔄 Flujo Completo (5 Pasos)

### Paso 0: Preparación (Usuario)

**Qué hacer:**
1. Identificar 1 micro-tarea clara (ej: "agregar filtro de precio")
2. Reunir contexto mínimo:
   - Archivos relevantes (ej: `components/search/FilterModal.tsx`)
   - Comportamiento esperado (DoD)
   - Restricciones técnicas (ej: "mobile-first", "no tocar API todavía")

**Output:** User Brief pegable

---

### Paso 1: User Brief → Orchestrator

**Qué pegar:**
```markdown
@Orchestrator

Feature: [título corto en 3-5 palabras]

Goal: [1 párrafo: qué se necesita lograr]

Context:
- Ruta/archivo: [ej: app/buscar, components/search/*]
- Problema actual: [qué no funciona o falta]
- Restricciones: [ej: "no modificar DB", "mobile-first"]

Definition of Done:
- [ ] [Criterio 1]
- [ ] [Criterio 2]
- [ ] [Criterio 3]

Open Questions:
- [Pregunta 1 si hay ambigüedad]
- [Pregunta 2]
```

**Dónde pegar:** Chat con Orchestrator (AI o humano)

**Output esperado:** Orchestrator responde con **Workpack** (ver Paso 2)

---

### Paso 2: Orchestrator → Workpack

**Qué esperar del Orchestrator:**

```markdown
## Workpack: WP-[ID] — [Feature Name]

**Status:** READY / BLOCKED / WAITING

**Scope:**
- Goal: [1 párrafo claro]
- Files to touch: [máx 3]
- Agent assigned: [UI Builder / Backend / Data / QA]

**Plan:**
1. [Paso 1 — ej: "Agregar inputs de precio a FilterModal"]
2. [Paso 2 — ej: "Validar con Zod en search.ts"]
3. [Paso 3 — ej: "Actualizar URL params en page.tsx"]

**Assumptions:**
- [Asunción 1]
- [Asunción 2]

**Risks:**
- [Riesgo 1 + mitigación]

**Exit Criteria:**
- [ ] Tests pasan (typecheck, lint)
- [ ] Smoke tests ejecutados
- [ ] QA Gate = PASS
```

**Acción del Usuario:**
1. **Si Status = BLOCKED:** resolver blocker antes de continuar
2. **Si Status = READY:** copiar Workpack completo y pasar a Paso 3

---

### Paso 3: Workpack → Agent

**Qué pegar al Agent:**
```markdown
@[AgentName] (UI Builder / Backend / Data)

[PEGAR WORKPACK COMPLETO AQUÍ]

Instrucciones adicionales (si aplica):
- [Restricción específica del contexto]
- [Prioridad de este vs otros cambios]
```

**Agentes disponibles:**
- **UI Builder** → para componentes, UX, mobile-first
- **Backend / Data** → para API, DB, Supabase
- **QA Gatekeeper** → para test plans (usualmente último paso)

**Output esperado del Agent:** **Merge Plan** (ver formato abajo)

---

### Paso 4: Agent → Merge Plan

**Qué esperar del Agent (formato obligatorio):**

```markdown
## Merge Plan: [Feature Name]

**Context:**
- Branch: [nombre] → [target]
- Files changed: [lista]
- Agent: [UI Builder / Backend]

**Summary:**
[1-2 párrafos: qué se implementó y por qué]

**Implementation:**
[Código pegable por archivo]

**Commands:**
```bash
pnpm install  # si hubo cambios en package.json
pnpm build
pnpm lint
pnpm typecheck
```

**Verification Steps (Manual):**
1. [Paso 1]
2. [Paso 2]
3. [Edge case 1]
4. [Edge case 2]

**Risks / Tradeoffs:**
- [Riesgo 1 + mitigación]

**DoD:**
- [ ] [Criterio 1]
- [ ] [Criterio 2]
- [ ] [Criterio 3]

**Status:** READY / BLOCKED / WAITING
**Reason:** [1 línea explicando status]
```

**Acción del Usuario:**
1. Aplicar código (copy/paste de Implementation)
2. Ejecutar Commands
3. Si Commands pasan → Paso 5 (QA)
4. Si Commands fallan → regresar al Agent con error log

---

### Paso 5: Merge Plan → QA Gatekeeper

**Qué pegar al QA:**
```markdown
@QA

[PEGAR MERGE PLAN COMPLETO AQUÍ]

Pedido:
- Ejecutar QA Gate (G1-G6)
- Proporcionar test plan reproducible
- Verdict final: PASS / FAIL / BLOCKED
```

**Output esperado del QA:**

```markdown
## QA Gate Report: [Feature Name]

**Risk Scoring:**
| Área | Risk Level | Razón |
|------|------------|-------|
| [Área 1] | High/Med/Low | [razón] |

**Quality Gates Verdict:**
- **G1 Contract:** PASS / FAIL / N/A — [razón]
- **G2 Security:** PASS / FAIL / N/A — [razón]
- **G3 UX States:** PASS / FAIL / N/A — [razón]
- **G4 Edge Cases:** PASS / FAIL / N/A — [razón]
- **G5 Mobile Sheet:** PASS / FAIL / N/A — [razón]
- **G6 Verification:** PASS / FAIL / N/A — [razón]

**Test Plan (Smoke):**
1. Given: [estado inicial]
   When: [acción]
   Then: [resultado esperado]

2. [Test 2]
3. [Test 3]

**Exit Criteria:**
✅ Puede mergear si todos los gates en PASS/N/A
🚫 Bloquear si algún gate en FAIL sin mitigación

**Final Verdict:** PASS / FAIL / BLOCKED
**Blockers:** [lista si FAIL/BLOCKED]
```

**Acción del Usuario:**
1. **Si Verdict = PASS:** ejecutar Verification Steps manualmente
2. Si pasan → **MERGE READY** 🎉
3. **Si Verdict = FAIL:** regresar a Agent con feedback de QA
4. **Si Verdict = BLOCKED:** escalar a Orchestrator

---

## 🚧 Límites y Reglas Duras

### Límite 1: 1 micro-tarea por iteración
**Qué significa:**
- 1 feature mínima viable (ej: "agregar filtro de precio")
- 1 fix específico (ej: "arreglar sticky bar en iPad")
- 1 mejora puntual (ej: "agregar skeleton a UnitCard")

**Qué NO es 1 micro-tarea:**
- ❌ "Implementar search completo" (demasiado amplio)
- ❌ "Refactor de toda la app" (sin scope claro)
- ❌ "Agregar filtros + paginación + sorting" (son 3 tareas)

**Criterio:** Si el Merge Plan toca >3 áreas conceptuales → dividir en 2+ iteraciones

---

### Límite 2: Max 3 archivos tocados
**Qué significa:**
- Implementación debe concentrarse en ≤3 archivos principales
- Ajustes menores (tipos, imports) no cuentan si son triviales

**Excepciones justificadas:**
- Refactor explícito pedido por Orchestrator
- Renombrado masivo de variables (con search/replace global)
- Fix de seguridad que requiere tocar múltiples endpoints

**Criterio:** Si Files Changed >3 en Merge Plan → justificar explícitamente

---

### Límite 3: Max 3 agentes por iteración
**Qué significa:**
- Típico: UI Builder + QA Gatekeeper (2 agentes)
- Con backend: UI Builder + Backend + QA (3 agentes)
- Si necesitas >3 → probablemente scope es muy grande

**Excepciones:**
- Orchestrator siempre puede involucrarse (no cuenta como agente de implementación)
- Data Agent puede sumarse si hay migración DB (total 4: Orchestrator + UI + Data + QA)

**Criterio:** Si necesitas >3 agentes de implementación → dividir workpack

---

### Límite 4: Diff mínimo
**Qué significa:**
- Cambiar solo lo necesario para cumplir DoD
- No refactorizar "por si acaso"
- No agregar features no pedidas

**Ejemplo bueno:**
```diff
+ if (images && images.length > 0) {
    return <Image src={images[0]} ... />
+ } else {
+   return <div>Fotos próximamente</div>
+ }
```

**Ejemplo malo (over-engineering):**
```diff
+ const ImageComponent = useMemo(() => {
+   if (!images?.length) return <Placeholder />;
+   return <OptimizedImage src={images[0]} />;
+ }, [images]);
+ return <Suspense fallback={<Skeleton />}>{ImageComponent}</Suspense>
```

---

## 📝 Ejemplo End-to-End

### Contexto
Usuario quiere agregar filtro de precio (min/max) a la búsqueda.

---

#### **Paso 1: User Brief**

```markdown
@Orchestrator

Feature: Filtro de precio min/max

Goal: Usuarios pueden filtrar propiedades por rango de precio en /buscar

Context:
- Ruta: app/buscar, components/search/FilterModal.tsx
- Problema actual: solo se puede filtrar por ubicación y habitaciones
- Restricciones: mobile-first, validar cliente y servidor

Definition of Done:
- [ ] Inputs de minPrice y maxPrice en FilterModal
- [ ] Validación: minPrice <= maxPrice (Zod)
- [ ] URL actualiza con ?minPrice=X&maxPrice=Y
- [ ] Resultados filtran correctamente
- [ ] Smoke tests ejecutados

Open Questions:
- ¿Formato de precio con separador de miles?
- ¿Qué pasa con URL inválida (precio negativo)?
```

---

#### **Paso 2: Orchestrator → Workpack**

```markdown
## Workpack: WP-042 — Price Range Filter

**Status:** READY

**Scope:**
- Goal: Agregar filtro de precio min/max con validación completa
- Files to touch:
  1. components/search/FilterModal.tsx
  2. lib/validations/search.ts
  3. app/buscar/page.tsx
- Agent assigned: UI Builder

**Plan:**
1. Agregar inputs de precio a FilterModal (mobile-first, ≥44px)
2. Actualizar Zod schema en search.ts (min <= max, >= 0)
3. Parsear URL params en page.tsx y aplicar filtrado

**Assumptions:**
- Precio en CLP (pesos chilenos), sin conversión de moneda
- Rango razonable: 0 - 10.000.000 CLP
- Sin formato de miles en inputs (solo números)

**Risks:**
- URL con precio negativo → mitigar con Zod coerce + validation
- Min > Max → mitigar con custom Zod refine

**Exit Criteria:**
- [ ] Typecheck + lint pasan
- [ ] Smoke test: filtrar 300k-500k muestra resultados correctos
- [ ] QA Gate = PASS
```

---

#### **Paso 3: Workpack → UI Builder**

```markdown
@UI Builder

[PEGAR WORKPACK WP-042 COMPLETO]

Instrucciones adicionales:
- Usar NumberInput component si existe, si no, input type="number"
- Error de validación debe ser visible inline
- Mobile: inputs apilados (stack), Desktop: inline (flex)
```

---

#### **Paso 4: UI Builder → Merge Plan**

```markdown
## Merge Plan: Price Range Filter

**Context:**
- Branch: feat/price-filter → dev
- Files changed: 3 (FilterModal, search.ts, page.tsx)
- Agent: UI Builder

**Summary:**
Agregado filtro de precio min/max a FilterModal con validación Zod.
URL actualiza con query params, resultados filtran correctamente.

**Implementation:**

### File 1: components/search/FilterModal.tsx
```tsx
// ... (código existente)

// Agregar después de bedrooms input:
<div className="space-y-2">
  <label className="text-sm font-medium">Precio</label>
  <div className="flex gap-2">
    <input
      type="number"
      placeholder="Mín"
      value={filters.minPrice ?? ''}
      onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) || undefined })}
      className="flex-1 px-3 py-2 border rounded-lg min-h-[44px]"
    />
    <input
      type="number"
      placeholder="Máx"
      value={filters.maxPrice ?? ''}
      onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) || undefined })}
      className="flex-1 px-3 py-2 border rounded-lg min-h-[44px]"
    />
  </div>
  {priceError && (
    <p className="text-sm text-red-600">{priceError}</p>
  )}
</div>
```

### File 2: lib/validations/search.ts
```ts
export const searchParamsSchema = z.object({
  location: z.string().optional(),
  bedrooms: z.coerce.number().int().min(1).max(5).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
}).refine(
  (data) => {
    if (data.minPrice && data.maxPrice) {
      return data.minPrice <= data.maxPrice;
    }
    return true;
  },
  { message: "Precio mínimo debe ser menor o igual al máximo" }
);
```

### File 3: app/buscar/page.tsx
```tsx
// ... (en la función de filtrado)
const filteredUnits = units.filter(unit => {
  // ... filtros existentes
  
  if (minPrice && unit.price < minPrice) return false;
  if (maxPrice && unit.price > maxPrice) return false;
  
  return true;
});
```

**Commands:**
```bash
pnpm typecheck
pnpm lint
pnpm build
```

**Verification Steps:**
1. Abrir /buscar
2. Click "Filtros" → agregar minPrice=300000, maxPrice=500000
3. Click "Aplicar"
4. Verificar URL: /buscar?minPrice=300000&maxPrice=500000
5. Verificar resultados: todos tienen precio entre 300k-500k
6. Edge case: ingresar min=500000, max=300000 → ver error de validación
7. Mobile: inputs ≥44px, fácil de tocar

**Risks / Tradeoffs:**
- URL con precio negativo: Zod coerce lo maneja (ignora si inválido)
- Sin formato de miles: decisión de UX, fácil de agregar después

**DoD:**
- [x] Inputs de precio en FilterModal
- [x] Validación Zod (min <= max)
- [x] URL actualiza correctamente
- [x] Resultados filtrados
- [ ] Smoke tests ejecutados (pendiente usuario)

**Status:** READY
**Reason:** Implementación completa, listo para QA
```

---

#### **Paso 5: Merge Plan → QA Gatekeeper**

```markdown
@QA

[PEGAR MERGE PLAN COMPLETO]

Pedido:
- Ejecutar QA Gate (G1-G6)
- Test plan reproducible para price filter
- Verdict final
```

**QA Responde:**

```markdown
## QA Gate Report: Price Range Filter

**Risk Scoring:**
| Área | Risk Level | Razón |
|------|------------|-------|
| Price validation | High | Core search logic, muchos edge cases |
| FilterModal UI | Med | Modal mobile (G5), focus management |
| URL sync | Med | Navegación y refresh deben persistir |

**Quality Gates Verdict:**
- **G1 Contract:** ✅ PASS — Zod schema correcto, tipos sin `any`
- **G2 Security:** N/A — No toca auth ni datos sensibles
- **G3 UX States:** ✅ PASS — Error de validación visible inline
- **G4 Edge Cases:** ✅ PASS — Min>Max validado, precio negativo rechazado
- **G5 Mobile Sheet:** ✅ PASS — Inputs ≥44px, focus correcto
- **G6 Verification:** ✅ PASS — Pasos reproducibles en 7 steps

**Test Plan (Smoke):**

**Test 1: Happy path**
```
Given: Estoy en /buscar con resultados
When: Aplico minPrice=300000, maxPrice=500000
Then: 
  - URL actualiza a ?minPrice=300000&maxPrice=500000
  - Resultados filtrados correctamente
  - Chips activos muestran "300k - 500k"
```

**Test 2: Validation error (min > max)**
```
Given: FilterModal abierto
When: Ingreso minPrice=500000, maxPrice=300000
Then:
  - Error inline visible: "Precio mínimo debe ser menor o igual al máximo"
  - Botón "Aplicar" disabled (ideal) o no aplica filtro inválido
```

**Test 3: Edge case - URL inválida**
```
Given: Link directo /buscar?minPrice=-5000&maxPrice=abc
When: Página carga
Then:
  - Zod rechaza params inválidos
  - Filtros no aplicados (o valores corregidos a default)
  - No hay crash
```

**Test 4: Mobile (G5)**
```
Given: Mobile viewport 375px
When: Abro FilterModal, tap en inputs de precio
Then:
  - Inputs ≥44px táctiles
  - Keyboard numérico aparece (iOS/Android)
  - Focus correcto
```

**Test 5: Refresh con params**
```
Given: Estoy en /buscar?minPrice=300000&maxPrice=500000
When: Presiono F5
Then:
  - URL persiste
  - Filtros aplicados (chips activos)
```

**Exit Criteria:**
✅ Todos los tests (1-5) pasan
✅ G1-G6 en PASS/N/A
✅ Risk High → recomendar automation (test e2e de price filter)

**Final Verdict:** ✅ PASS

**Recommended Automation (Risk High):**
```javascript
// test: price-filter.spec.ts
test('Price range filter works', async ({ page }) => {
  await page.goto('/buscar');
  await page.click('[data-testid="filters-button"]');
  await page.fill('[data-testid="minPrice-input"]', '300000');
  await page.fill('[data-testid="maxPrice-input"]', '500000');
  await page.click('[data-testid="apply-filters"]');
  await expect(page).toHaveURL(/minPrice=300000.*maxPrice=500000/);
});
```

**Blockers:** Ninguno
```

---

#### **Resultado Final**

✅ **QA Gate = PASS** → Usuario ejecuta Verification Steps manualmente → **MERGE READY**

**Siguiente paso:**
1. Crear PR con Merge Plan en descripción
2. Ejecutar comandos pre-merge: `pnpm build && pnpm lint`
3. Merge a `dev`
4. Monitorear primeros 10min post-deploy (ver Merge Plan § "What to Watch After Deploy")

---

## 🎯 Criterios de Éxito de 1 Iteración

✅ **Iteración exitosa si:**
- User Brief → Workpack → Merge Plan → QA Gate completado en <2h
- Todos los comandos (build/lint/typecheck) pasan
- QA Gate = PASS (G1-G6)
- Diff mínimo (≤3 archivos principales tocados)
- Status = READY (no BLOCKED)

🚫 **Iteración fallida si:**
- Status = BLOCKED por >24h sin resolución
- QA Gate = FAIL sin plan de mitigación
- Scope creep (>3 archivos sin justificación)
- Build/lint rompe después de implementación

---

## 📊 Métricas de Iteración (opcional)

Trackear para mejorar proceso:
- **Lead time:** User Brief → MERGE READY (target: <90min)
- **Cycle time por agent:** Workpack → Merge Plan (target: <45min)
- **QA pass rate:** % de Merge Plans que pasan QA en primer intento (target: >80%)
- **Rollback rate:** % de merges que requieren revert (target: <5%)

---

## 🔧 Troubleshooting

### Problema 1: Orchestrator no genera Workpack claro
**Síntoma:** Workpack tiene >5 pasos o scope ambiguo  
**Solución:** Regresar User Brief con más contexto o dividir en 2 micro-tareas

### Problema 2: Agent se bloquea con Status = BLOCKED
**Síntoma:** Merge Plan dice "falta decisión X" o "endpoint Y no existe"  
**Solución:** Escalar a Orchestrator con Open Questions explícitas

### Problema 3: QA Gate = FAIL repetidamente
**Síntoma:** 2+ intentos sin pasar G1-G6  
**Solución:** Pair programming Agent + QA o escalar a Orchestrator para re-scoping

### Problema 4: Commands fallan (build/lint)
**Síntoma:** `pnpm build` rompe después de aplicar Merge Plan  
**Solución:** Regresar a Agent con error log completo, pedirle fix inmediato

### Problema 5: Scope creep durante implementación
**Síntoma:** Agent toca >3 archivos o agrega features no pedidas  
**Solución:** Detener implementación, regresar a Orchestrator para split de Workpack

---

## 📚 Templates Rápidos

### Template: User Brief Mínimo
```markdown
@Orchestrator

Feature: [3-5 palabras]
Goal: [1 párrafo]
Context: [archivos/rutas relevantes]
DoD:
- [ ] [Criterio 1]
- [ ] [Criterio 2]
```

### Template: Escalación a Orchestrator
```markdown
@Orchestrator

🚨 BLOCKER en iteración [ID]

Agent: [UI Builder / Backend / QA]
Issue: [1-2 líneas]
Decisión requerida: [pregunta específica]
Impact: [qué se bloquea]
```

### Template: Feedback de QA a Agent
```markdown
@[AgentName]

QA Gate: FAIL

Motivo: [gate específico que falló - ej: G4 Edge Cases]
Detalle: [qué no pasó]
Expected fix: [qué debe cambiar]
Re-test: [qué verificar de nuevo]
```

---

## 🚀 Quick Start (TLDR)

**Para ejecutar 1 iteración en 5 pasos:**

1. Pegar **User Brief** a Orchestrator
2. Copiar **Workpack** a Agent correspondiente
3. Aplicar **Merge Plan** (código + comandos)
4. Pegar **Merge Plan** a QA
5. Si **QA Gate = PASS** → ejecutar Verification Steps → **MERGE**

**Límites:**
- 1 micro-tarea
- Max 3 archivos
- Max 3 agentes

**Criterio de éxito:** QA Gate PASS + comandos pasan + diff mínimo

---

**FIN DEL RUNBOOK**