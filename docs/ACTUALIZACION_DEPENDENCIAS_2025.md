# Actualización de Dependencias - Diciembre 2025

## ✅ Completado: Actualizaciones Menores (Patch/Minor)

### Dependencias Actualizadas

#### Producción
- `@headlessui/react`: 2.2.7 → **2.2.9**
- `@react-pdf/renderer`: 4.3.0 → **4.3.1**
- `@tanstack/react-query`: 5.84.2 → **5.90.12**
- `lucide-react`: 0.541.0 → **0.561.0**
- `resend`: 6.0.1 → **6.6.0**

#### Desarrollo
- `@eslint/js`: 9.33.0 → **9.39.2**
- `@playwright/test`: 1.55.0 → **1.57.0**
- `@testing-library/jest-dom`: 6.6.3 → **6.9.1**
- `autoprefixer`: 10.4.16 → **10.4.22**
- `eslint-plugin-react-refresh`: 0.4.20 → **0.4.24**
- `postcss`: 8.4.31 → **8.5.6**
- `ts-jest`: 29.2.5 → **29.4.6**
- `typescript`: 5.4.5 → **5.9.3**
- `typescript-eslint`: 8.39.1 → **8.49.0**

### Correcciones Aplicadas

1. **Iconos de lucide-react**: Reemplazados `Swimming` y `Cocktail` (no disponibles en v0.561.0) por `Waves` y `Wine` en `PropertyAmenitiesTab.tsx`
2. **Variable duplicada**: Eliminada declaración duplicada de `baseUrl` en `app/(catalog)/property/[slug]/page.tsx`

### Estado de Verificación

- ✅ Dependencias instaladas correctamente
- ✅ Build compila (con warnings preexistentes de Edge Runtime)
- ✅ Tests básicos de componentes pasan
- ⚠️ Errores de TypeScript preexistentes (no relacionados con actualizaciones)
- ⚠️ Warning: `msw` requiere TypeScript <= 5.2.x (tenemos 5.9.3) - considerar actualizar MSW a 2.x

---

## 📋 Pendiente: Actualizaciones Mayores (Breaking Changes)

### Dependencias Críticas a Actualizar

#### 1. Next.js: 15.4.6 → 16.0.10
#### 2. React: 18.2.0 → 19.2.3
#### 3. React-DOM: 18.2.0 → 19.2.3
#### 4. Tailwind CSS: 3.4.1 → 4.1.18
#### 5. Zod: 3.25.0 → 4.1.13

### Otras Dependencias Mayores

- `eslint`: 8.57.0 → 9.39.2
- `eslint-config-next`: 15.4.6 → 16.0.10
- `framer-motion`: 11.0.0 → 12.23.26
- `jest`: 29.7.0 → 30.2.0
- `jest-environment-jsdom`: 29.7.0 → 30.2.0
- `msw`: 1.3.2 → 2.12.4
- `@supabase/supabase-js`: 2.54.0 → 2.87.1
- `zustand`: 4.5.7 → 5.0.9
- `uuid`: 11.1.0 → 13.0.0
- `dotenv`: 16.4.7 → 17.2.3
- `node-fetch`: 2.7.0 → 3.3.2
- `react-window`: 1.8.11 → 2.2.3
- `react-window-infinite-loader`: 1.0.10 → 2.0.0
- `@types/jest`: 29.5.12 → 30.0.0
- `@types/node`: 24.2.1 → 25.0.2
- `@types/react`: 18.3.23 → 19.2.7
- `@types/react-dom`: 18.3.7 → 19.2.3
- `@types/react-window`: 1.8.8 → 2.0.0
- `eslint-plugin-react-hooks`: 5.2.0 → 7.0.1

---

## 🚀 Plan de Migración para Dependencias Mayores

### Fase 1: Next.js 16 + React 19 (Prioridad Alta)

#### Breaking Changes de Next.js 16

1. **APIs Asíncronas Obligatorias**
   - `cookies()`, `headers()`, `draftMode()`, `params`, `searchParams` ahora son Promises
   - **Acción**: Buscar y actualizar todos los usos de estas APIs
   - **Codemod disponible**: `npx @next/codemod@latest upgrade-to-next-16`

2. **Runtime Configuration Removido**
   - `serverRuntimeConfig` y `publicRuntimeConfig` eliminados
   - **Acción**: Migrar a variables de entorno (`NEXT_PUBLIC_*` para cliente)

3. **ESLint Integration**
   - `next lint` removido, usar `eslint` directamente
   - **Acción**: Actualizar scripts en `package.json`

4. **Caching Behavior**
   - GET Route Handlers no se cachean por defecto
   - Client Router Cache: default stale time = 0
   - **Acción**: Revisar estrategias de caché

5. **Features Removidos**
   - AMP support
   - `devIndicators` config
   - Experimental `ppr` y `dynamicIO` flags

#### Breaking Changes de React 19

1. **APIs Removidas**
   - `ReactDOM.render` → `ReactDOM.createRoot`
   - `ReactDOM.hydrate` → `ReactDOM.hydrateRoot`
   - `propTypes` y `defaultProps` en function components
   - String refs
   - `ReactDOM.findDOMNode`

2. **Codemod Disponible**
   ```bash
   npx codemod react/19/migration-recipe
   ```

3. **TypeScript Types**
   - Actualizar `@types/react` y `@types/react-dom` a v19

#### Pasos de Migración

```bash
# 1. Actualizar a React 18.3 primero (recomendado)
pnpm add react@18.3 react-dom@18.3

# 2. Ejecutar codemods
npx @next/codemod@latest upgrade-to-next-16
npx codemod react/19/migration-recipe

# 3. Actualizar dependencias
pnpm add next@16 react@19 react-dom@19 @types/react@19 @types/react-dom@19

# 4. Actualizar eslint-config-next
pnpm add -D eslint-config-next@16

# 5. Verificar y corregir manualmente
pnpm typecheck
pnpm build
pnpm test:all
```

---

### Fase 2: Tailwind CSS 4 (Prioridad Media)

#### Breaking Changes

1. **Configuración CSS-First**
   - `tailwind.config.js` → CSS con `@theme` y `@utility`
   - **Herramienta**: `npx @tailwindcss/upgrade@next`

2. **Import Statements**
   ```css
   /* Antes */
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   
   /* Después */
   @import "tailwindcss";
   ```

3. **Utilities Renombradas**
   - `shadow-sm` → `shadow-xs`
   - `shadow` → `shadow-sm`
   - `rounded-sm` → `rounded-xs`
   - `rounded` → `rounded-sm`
   - `outline-none` → `outline-hidden`
   - Y más...

4. **Utilities Deprecadas**
   - `bg-opacity-*` → `bg-black/50` (opacity modifiers)
   - `text-opacity-*` → `text-black/50`
   - `flex-shrink-*` → `shrink-*`
   - `flex-grow-*` → `grow-*`

#### Pasos de Migración

```bash
# 1. Usar herramienta oficial
npx @tailwindcss/upgrade@next

# 2. Revisar cambios en git
git diff

# 3. Actualizar manualmente utilities renombradas
# 4. Verificar estilos
pnpm build
```

---

### Fase 3: Zod 4 (Prioridad Media)

#### Breaking Changes

1. **Error Customization Unificado**
   ```typescript
   // Zod 3
   z.string().min(5, { message: "Too short." });
   
   // Zod 4
   z.string().min(5, { error: "Too short." });
   ```

2. **String Validators Top-Level**
   ```typescript
   // Zod 3
   z.string().email();
   
   // Zod 4
   z.email();
   ```

3. **Object Schema**
   - `nonstrict()` → `passthrough()`

4. **Record Schema**
   ```typescript
   // Zod 3
   z.record(z.string());
   
   // Zod 4
   z.record(z.string(), z.string());
   ```

5. **ZodError Structure**
   - `error.errors` → `error.issues`

#### Pasos de Migración

```bash
# 1. Codemod disponible
npx codemod jssg run zod-3-4

# 2. Actualizar dependencia
pnpm add zod@^4.0.0

# 3. Buscar y reemplazar manualmente
# - message → error
# - z.string().email() → z.email()
# - nonstrict() → passthrough()
# - error.errors → error.issues
```

---

### Fase 4: Otras Dependencias (Prioridad Baja)

#### Jest 30
- Breaking changes menores
- Actualizar configuraciones de Jest

#### MSW 2.x
- Cambios en setup y handlers
- Actualizar mocks y tests

#### Framer Motion 12
- Revisar breaking changes en animaciones
- Actualizar componentes que usan animaciones

#### Zustand 5
- Revisar cambios en API
- Actualizar stores si es necesario

---

## 📝 Checklist de Migración

### Pre-Migración
- [ ] Crear branch de migración
- [ ] Backup del código actual
- [ ] Revisar todos los breaking changes
- [ ] Identificar áreas críticas del código

### Durante Migración
- [ ] Actualizar dependencias una por una
- [ ] Ejecutar codemods disponibles
- [ ] Corregir errores de TypeScript
- [ ] Actualizar tests
- [ ] Verificar build

### Post-Migración
- [ ] Ejecutar suite completa de tests
- [ ] Verificar funcionalidad en desarrollo
- [ ] Revisar performance
- [ ] Actualizar documentación
- [ ] Deploy a staging
- [ ] Testing en staging
- [ ] Deploy a producción

---

## ⚠️ Riesgos y Consideraciones

### Riesgos Identificados

1. **Next.js 16 + React 19**
   - Cambios significativos en APIs asíncronas
   - Posibles problemas de compatibilidad con librerías de terceros
   - **Mitigación**: Migración incremental, testing exhaustivo

2. **Tailwind CSS 4**
   - Cambios en utilities pueden afectar estilos
   - **Mitigación**: Usar herramienta de migración, revisar visualmente

3. **Zod 4**
   - Cambios en validación pueden romper schemas
   - **Mitigación**: Codemod + búsqueda manual de patterns

4. **TypeScript 5.9.3**
   - Warning con MSW (requiere TS <= 5.2.x)
   - **Mitigación**: Actualizar MSW a 2.x o mantener TypeScript 5.4.5 para tests

### Rollback Plan

Si algo falla durante la migración:

```bash
# Revertir cambios
git checkout package.json pnpm-lock.yaml
pnpm install

# O revertir commit completo
git revert HEAD
```

---

## 📚 Recursos

- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [Tailwind CSS 4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)
- [Zod 4 Changelog](https://zod.dev/v4/changelog)

---

**Última actualización**: Diciembre 2025
**Estado**: Fase 1 completada (actualizaciones menores), Fase 2-4 pendientes


