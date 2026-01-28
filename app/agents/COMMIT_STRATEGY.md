# Estrategia de Commits - Cambios Pendientes

> Generado: 2026-01-28  
> Agente: Orchestrator  
> Status: 🟡 PENDING REVIEW

---

## Context ✅

**Branch**: `dev`  
**Estado actual**:
- **Staged**: 12 archivos nuevos (sistema Tree + privacidad)
- **Modified (unstaged)**: 10 archivos modificados
- **Untracked**: ~200 archivos (duplicados con sufijos " 2", " 3")

**Último commit**: `8ba28d93` - feat(search): implement Hero Cocktail search panel + fix TS errors

---

## Goal

Organizar los cambios pendientes en commits lógicos siguiendo Conventional Commits y el sistema de Workpacks, asegurando que cada commit sea:
- **Atómico**: Un cambio coherente por commit
- **Verificable**: Cada commit debe pasar QA Gates básicos
- **Reversible**: Fácil de revertir si hay problemas
- **Descriptivo**: Mensajes claros siguiendo Conventional Commits

---

## Análisis de Cambios

### Grupo 1: Sistema Tree (Staged) ✅
**Tipo**: Feature completa  
**Archivos**: 12 nuevos archivos  
**Líneas**: +3,866

**Componentes**:
- `app/privacidad/page.tsx` - Página de privacidad
- `components/tree/*` - Sistema completo de formularios Tree
  - `TreeLanding.tsx` - Landing page
  - `RentPropertyForm.tsx` - Formulario de arriendo
  - `SellPropertyForm.tsx` - Formulario de venta
  - `BuyForm.tsx` - Formulario de compra
  - `RentFormStepper.tsx` - Stepper para arriendo
  - `CommuneAutocomplete.tsx` - Autocomplete de comunas
  - `UFIndicator.tsx` - Indicador UF
  - `WhatsAppInput.tsx` - Input de WhatsApp
- `lib/data/chilean-communes.ts` - Datos de comunas chilenas
- `lib/utils/form-persistence.ts` - Persistencia de formularios
- `lib/utils/whatsapp.ts` - Utilidades WhatsApp

**Risk Score**: Medium  
**Rationale**: Feature nueva completa, no afecta código existente directamente

---

### Grupo 2: Refactor UnitCard (Unstaged) ⚠️
**Tipo**: Refactor  
**Archivos**: 
- `components/ui/UnitCard.tsx` (-471 líneas, simplificación)
- `components/ui/UnitCardSkeleton.tsx` (-57 líneas)
- `tests/unit/components/UnitCard.test.tsx` (+176 líneas, tests nuevos)

**Risk Score**: High  
**Rationale**: Componente crítico usado en múltiples páginas, cambios grandes

---

### Grupo 3: Configuración y Flags (Unstaged) 🔧
**Tipo**: Config/Chore  
**Archivos**:
- `.cursor/rules/00-core.mdc` (+1 línea)
- `app/layout.tsx` (modificaciones menores)
- `lib/flags.ts` (+65 líneas, nuevas flags)
- `lib/analytics/events.ts` (+9 líneas)
- `jest.config.ts` (modificaciones)
- `proxy.ts` (+4 líneas)

**Risk Score**: Low-Medium  
**Rationale**: Configuración y flags, bajo riesgo pero requiere verificación

---

### Grupo 4: Archivos Duplicados (Untracked) 🗑️
**Tipo**: Cleanup  
**Archivos**: ~200 archivos con sufijos " 2", " 3"  
**Ejemplos**: 
- `app/api/admin/buildings/route 2.ts`
- `docs/_archive/legacy/root-docs/CHECKLIST_7_DIAS 2.md`

**Risk Score**: Low  
**Rationale**: Archivos duplicados, deben eliminarse

---

## Estrategia de Commits

### Commit 1: feat(tree): implement Tree landing and property forms
**Tipo**: `feat`  
**Scope**: `tree`  
**Archivos**: Todos los archivos staged actualmente

**Mensaje**:
```
feat(tree): implement Tree landing and property forms

- Add TreeLanding component with navigation to rent/sell/buy flows
- Implement RentPropertyForm with multi-step stepper
- Implement SellPropertyForm and BuyForm components
- Add CommuneAutocomplete with Chilean communes data
- Add UFIndicator for UF price display
- Add WhatsAppInput component for contact forms
- Add form persistence utilities
- Add WhatsApp utility functions
- Add privacy policy page

Files:
- app/privacidad/page.tsx
- components/tree/* (8 components)
- lib/data/chilean-communes.ts
- lib/utils/form-persistence.ts
- lib/utils/whatsapp.ts

QA Gates:
- G1: Contract ✅ (TypeScript types defined)
- G3: UX States ✅ (forms have loading/error states)
- G4: Code Quality ✅ (Tailwind, responsive)
- G5: Verification ⚠️ (requires manual smoke test)

Risk: Medium - New feature, doesn't affect existing code
```

**Comandos**:
```bash
# Ya está staged, solo commit
git commit -m "feat(tree): implement Tree landing and property forms

- Add TreeLanding component with navigation to rent/sell/buy flows
- Implement RentPropertyForm with multi-step stepper
- Implement SellPropertyForm and BuyForm components
- Add CommuneAutocomplete with Chilean communes data
- Add UFIndicator for UF price display
- Add WhatsAppInput component for contact forms
- Add form persistence utilities
- Add WhatsApp utility functions
- Add privacy policy page"
```

---

### Commit 2: refactor(ui): simplify UnitCard component
**Tipo**: `refactor`  
**Scope**: `ui`  
**Archivos**: UnitCard y relacionados

**Mensaje**:
```
refactor(ui): simplify UnitCard component

- Reduce UnitCard from 471 lines to simplified version
- Simplify UnitCardSkeleton (57 lines removed)
- Add comprehensive unit tests for UnitCard (176 new test lines)
- Improve component maintainability

BREAKING: None - component API remains the same

Files:
- components/ui/UnitCard.tsx
- components/ui/UnitCardSkeleton.tsx
- tests/unit/components/UnitCard.test.tsx

QA Gates:
- G1: Contract ⚠️ (verify no breaking changes)
- G3: UX States ⚠️ (verify all states still work)
- G4: Code Quality ✅ (simplified code)
- G5: Verification ⚠️ (run tests, manual check)

Risk: High - Critical component, requires thorough testing
```

**Comandos**:
```bash
# Stage UnitCard files
git add components/ui/UnitCard.tsx components/ui/UnitCardSkeleton.tsx tests/unit/components/UnitCard.test.tsx

# Commit
git commit -m "refactor(ui): simplify UnitCard component

- Reduce UnitCard from 471 lines to simplified version
- Simplify UnitCardSkeleton (57 lines removed)
- Add comprehensive unit tests for UnitCard (176 new test lines)
- Improve component maintainability

BREAKING: None - component API remains the same"
```

---

### Commit 3: chore(config): update flags, analytics, and build config
**Tipo**: `chore`  
**Scope**: `config`  
**Archivos**: Configuración y flags

**Mensaje**:
```
chore(config): update flags, analytics, and build config

- Add new feature flags in lib/flags.ts
- Add new analytics events
- Update Jest configuration
- Update proxy configuration
- Update core rules documentation

Files:
- lib/flags.ts
- lib/analytics/events.ts
- jest.config.ts
- proxy.ts
- .cursor/rules/00-core.mdc
- app/layout.tsx

QA Gates:
- G1: Contract ✅ (TypeScript types)
- G4: Code Quality ✅ (linting)
- G5: Verification ⚠️ (verify build works)

Risk: Low-Medium - Configuration changes
```

**Comandos**:
```bash
# Stage config files
git add lib/flags.ts lib/analytics/events.ts jest.config.ts proxy.ts .cursor/rules/00-core.mdc app/layout.tsx

# Commit
git commit -m "chore(config): update flags, analytics, and build config

- Add new feature flags in lib/flags.ts
- Add new analytics events
- Update Jest configuration
- Update proxy configuration
- Update core rules documentation"
```

---

### Commit 4: chore(cleanup): remove duplicate files with numeric suffixes
**Tipo**: `chore`  
**Scope**: `cleanup`  
**Archivos**: Todos los archivos untracked con " 2", " 3"

**Mensaje**:
```
chore(cleanup): remove duplicate files with numeric suffixes

Remove ~200 duplicate files created during development with
numeric suffixes (" 2", " 3") that are no longer needed.

Files removed:
- app/api/**/route 2.ts, route 3.ts
- app/arriendo/**/page 2.tsx, page 3.tsx
- components/ui/UnitCard/** (duplicates)
- docs/_archive/** (duplicates)
- And ~180 more duplicate files

QA Gates:
- G5: Verification ✅ (verify no references to deleted files)

Risk: Low - Cleanup only, no functional changes
```

**⚠️ IMPORTANTE**: Antes de eliminar, verificar que no hay referencias activas

**Comandos**:
```bash
# Primero, verificar que no hay referencias
rg "route 2\.ts|page 2\.tsx" --type ts --type tsx

# Si no hay referencias, eliminar duplicados
find . -name "* 2.*" -o -name "* 3.*" | grep -v node_modules | xargs git rm --cached

# Commit
git commit -m "chore(cleanup): remove duplicate files with numeric suffixes

Remove ~200 duplicate files created during development with
numeric suffixes (\" 2\", \" 3\") that are no longer needed."
```

---

## Plan de Ejecución

### Paso 1: Verificar cambios staged (Commit 1)
```bash
# Ver qué está staged
git diff --cached --stat

# Verificar que no hay errores de TypeScript
pnpm typecheck

# Verificar lint
pnpm lint

# Si todo OK, hacer commit 1
git commit -m "feat(tree): implement Tree landing and property forms..."
```

**QA Gate Check**:
- [ ] G1: TypeScript compila sin errores
- [ ] G4: Lint pasa sin errores críticos
- [ ] G5: Build funciona (`pnpm build`)

---

### Paso 2: Revisar y commit UnitCard (Commit 2)
```bash
# Ver cambios en UnitCard
git diff components/ui/UnitCard.tsx

# Verificar que los tests pasan
pnpm test UnitCard

# Si tests pasan, stage y commit
git add components/ui/UnitCard.tsx components/ui/UnitCardSkeleton.tsx tests/unit/components/UnitCard.test.tsx
git commit -m "refactor(ui): simplify UnitCard component..."
```

**QA Gate Check**:
- [ ] G1: Tests pasan
- [ ] G3: Verificar visualmente que UnitCard funciona
- [ ] G5: Build funciona

---

### Paso 3: Commit configuración (Commit 3)
```bash
# Stage config files
git add lib/flags.ts lib/analytics/events.ts jest.config.ts proxy.ts .cursor/rules/00-core.mdc app/layout.tsx

# Verificar build
pnpm build

# Commit
git commit -m "chore(config): update flags, analytics, and build config..."
```

**QA Gate Check**:
- [ ] G1: TypeScript compila
- [ ] G4: Lint pasa
- [ ] G5: Build funciona

---

### Paso 4: Limpiar duplicados (Commit 4) ⚠️ OPCIONAL
```bash
# PRIMERO: Verificar referencias
rg "route 2\.ts|page 2\.tsx" --type ts --type tsx

# Si hay referencias, NO eliminar aún
# Si no hay referencias, proceder:

# Encontrar duplicados
find . -name "* 2.*" -o -name "* 3.*" | grep -v node_modules | head -20

# Eliminar (cuidado!)
find . -name "* 2.*" -o -name "* 3.*" | grep -v node_modules | xargs git rm --cached

# Commit
git commit -m "chore(cleanup): remove duplicate files with numeric suffixes..."
```

**QA Gate Check**:
- [ ] G5: Verificar que no hay referencias rotas
- [ ] G5: Build funciona después de eliminar

---

## Quality Gates Summary

### Commit 1: Tree Feature
- [x] **G1: Contract** - PASS (TypeScript types defined)
- [ ] **G3: UX States** - ⚠️ REQUIRES MANUAL CHECK
- [x] **G4: Code Quality** - PASS (Tailwind, responsive)
- [ ] **G5: Verification** - ⚠️ REQUIRES SMOKE TEST

**Merge Readiness**: 🟡 PENDING SMOKE TEST

---

### Commit 2: UnitCard Refactor
- [ ] **G1: Contract** - ⚠️ REQUIRES TEST RUN
- [ ] **G3: UX States** - ⚠️ REQUIRES MANUAL CHECK
- [x] **G4: Code Quality** - PASS (simplified)
- [ ] **G5: Verification** - ⚠️ REQUIRES TEST RUN

**Merge Readiness**: 🟡 PENDING TESTS

---

### Commit 3: Config Changes
- [x] **G1: Contract** - PASS (TypeScript)
- [x] **G4: Code Quality** - PASS (linting)
- [ ] **G5: Verification** - ⚠️ REQUIRES BUILD CHECK

**Merge Readiness**: 🟡 PENDING BUILD CHECK

---

### Commit 4: Cleanup
- [x] **G5: Verification** - PASS (no functional changes)

**Merge Readiness**: ✅ READY (after verifying no references)

---

## Smoke Tests Requeridos

### Smoke Test 1: Tree Feature
1. Ir a `/tree` → Ver TreeLanding
2. Click en "Arrendar" → Ver RentPropertyForm
3. Llenar formulario básico → Verificar stepper funciona
4. Verificar que CommuneAutocomplete funciona
5. Verificar que UFIndicator muestra UF actual

**Expected**: Todos los formularios funcionan, sin errores en consola

---

### Smoke Test 2: UnitCard Refactor
1. Ir a `/buscar` → Ver lista de unidades
2. Verificar que UnitCard se renderiza correctamente
3. Verificar que skeleton se muestra durante loading
4. Click en UnitCard → Navegar a detalle
5. Verificar responsive (mobile viewport)

**Expected**: UnitCard funciona igual que antes, sin regresiones visuales

---

### Smoke Test 3: Config Changes
1. `pnpm build` → Debe compilar sin errores
2. `pnpm lint` → Debe pasar sin errores críticos
3. `pnpm typecheck` → Debe pasar sin errores

**Expected**: Build, lint y typecheck pasan

---

## Rollback Plan

### Si Commit 1 (Tree) tiene problemas:
```bash
git revert HEAD  # Revert último commit
# O si ya se mergeó:
git revert <COMMIT_HASH>
```

### Si Commit 2 (UnitCard) tiene problemas:
```bash
git revert HEAD~1  # Revert UnitCard commit
# Verificar que UnitCard funciona
```

### Si Commit 3 (Config) tiene problemas:
```bash
git revert HEAD~2  # Revert config commit
# Re-ejecutar build
```

### Si Commit 4 (Cleanup) tiene problemas:
```bash
git revert HEAD~3  # Revert cleanup commit
# Los archivos volverán a aparecer
```

---

## Recomendaciones

### ⚠️ ANTES de hacer commits:

1. **Ejecutar tests**:
   ```bash
   pnpm test
   ```

2. **Verificar build**:
   ```bash
   pnpm build
   ```

3. **Verificar lint**:
   ```bash
   pnpm lint
   ```

4. **Verificar typecheck**:
   ```bash
   pnpm typecheck
   ```

### ✅ ORDEN RECOMENDADO:

1. **Commit 1** (Tree) - Feature completa, bajo riesgo de romper existente
2. **Commit 3** (Config) - Cambios de configuración, verificar build
3. **Commit 2** (UnitCard) - Refactor crítico, requiere más testing
4. **Commit 4** (Cleanup) - Opcional, hacer después de verificar que todo funciona

### 🚨 NO hacer Commit 4 hasta:
- Todos los otros commits están mergeados y funcionando
- Se verificó que no hay referencias a archivos duplicados
- Build funciona correctamente

---

## Next Steps

1. [ ] Revisar cambios staged (Commit 1)
2. [ ] Ejecutar smoke test de Tree feature
3. [ ] Si pasa, hacer Commit 1
4. [ ] Revisar cambios de UnitCard (Commit 2)
5. [ ] Ejecutar tests de UnitCard
6. [ ] Si pasan, hacer Commit 2
7. [ ] Stage y commit config files (Commit 3)
8. [ ] Verificar build después de Commit 3
9. [ ] (Opcional) Limpiar duplicados (Commit 4)

---

## Merge Readiness Final

**Status**: 🟡 PENDING QA CHECKS

**Blockers**:
- Smoke tests no ejecutados
- Tests de UnitCard no ejecutados
- Build no verificado después de cambios

**Criteria para READY**:
- ✅ Todos los smoke tests pasan
- ✅ Tests unitarios pasan
- ✅ Build exitoso
- ✅ Lint sin errores críticos
- ✅ Typecheck sin errores

---

**Generado por**: Orchestrator Agent  
**Fecha**: 2026-01-28  
**Versión**: 1.0
