> Last updated: 2026-01-25

# Architectural Decision Records (ADRs)

Registro de decisiones arquitectonicas del proyecto. Consultar antes de tomar decisiones que afecten multiples areas.

---

## ADR-001: Next.js 14 App Router

**Status**: Accepted  
**Date**: 2025-01-01  
**Context**: Necesitamos un framework React con SSR, routing, y soporte para Server Components.

**Decision**: Usar Next.js 14 con App Router (no Pages Router).

**Consequences**:
- Server Components por defecto (mejor performance)
- File-based routing en `app/`
- Layouts anidados
- Loading/Error boundaries automaticos
- `'use client'` explicito para componentes con estado

**References**:
- `app/` - Todas las rutas
- `app/layout.tsx` - Root layout
- `app/(marketing)/layout.tsx` - Marketing layout

---

## ADR-002: Supabase como Backend

**Status**: Accepted  
**Date**: 2025-01-01  
**Context**: Necesitamos base de datos con autenticacion, RLS, y realtime.

**Decision**: Usar Supabase (PostgreSQL + Auth + Storage + Realtime).

**Consequences**:
- PostgreSQL con RLS habilitado en todas las tablas
- Dos clientes: publico (anon key) y admin (service role)
- Fallback a mock en desarrollo sin credenciales
- Migraciones SQL manuales en `config/supabase/migrations/`

**References**:
- `lib/supabase.ts` - Clientes
- `config/supabase/schema.sql` - Schema principal
- `config/supabase/migrations/` - Migraciones

---

## ADR-003: Zod para Validacion

**Status**: Accepted  
**Date**: 2025-01-01  
**Context**: Necesitamos validacion type-safe en runtime, especialmente server-side.

**Decision**: Usar Zod para validacion server-side obligatoria.

**Consequences**:
- Schemas Zod en `schemas/` son source of truth
- Tipos TypeScript inferidos de Zod (`z.infer<typeof Schema>`)
- Validacion client-side opcional pero no suficiente
- API routes DEBEN validar con Zod antes de procesar

**References**:
- `schemas/models.ts` - Schemas principales
- `lib/validations/` - Schemas de formularios
- `app/api/*/route.ts` - Uso en API routes

---

## ADR-004: React Query (TanStack Query)

**Status**: Accepted  
**Date**: 2025-01-15  
**Context**: Necesitamos manejo de estado servidor con cache, refetch, y optimistic updates.

**Decision**: Usar React Query para data fetching client-side.

**Consequences**:
- Query keys jerarquicas en `lib/react-query.ts`
- staleTime: 5 minutos por defecto
- No refetch on window focus
- Hooks personalizados en `hooks/` wrappean useQuery
- Server Components usan fetch directo, no React Query

**References**:
- `lib/react-query.ts` - Configuracion central
- `hooks/useSearchResults.ts` - Ejemplo de hook
- `app/providers.tsx` - QueryClientProvider

---

## ADR-005: Tailwind + Dark Mode

**Status**: Accepted  
**Date**: 2025-01-01  
**Context**: Necesitamos styling consistente, responsive, y con soporte dark mode.

**Decision**: Usar TailwindCSS con dark mode via clase `dark:`.

**Consequences**:
- No inline styles (`style={{ }}` prohibido)
- Clases responsive: `md:`, `lg:`, `xl:`
- Dark mode: `dark:bg-gray-900`, `dark:text-white`
- Colores del tema en `tailwind.config.js`
- Rounded corners: `rounded-2xl` por defecto

**References**:
- `tailwind.config.js` - Configuracion
- `app/globals.css` - Estilos globales
- Cualquier componente en `components/`

---

## ADR-006: Rate Limiting

**Status**: Accepted  
**Date**: 2025-01-10  
**Context**: Necesitamos proteger API de abuso sin bloquear usuarios legitimos.

**Decision**: Rate limiting por IP con limites diferenciados.

**Limits**:
- Endpoints publicos: 20 req/60s
- Endpoints sensibles (booking, visits): 10 req/60s
- Admin login: 5 req/60s
- Search publico: 60 req/60s

**Consequences**:
- Todas las API routes usan `createRateLimiter`
- Header `Retry-After` en respuestas 429
- In-memory por defecto (considerar Redis en produccion)

**References**:
- `lib/rate-limit.ts` - Factory
- `app/api/*/route.ts` - Uso

---

## ADR-007: TypeScript Strict Mode

**Status**: Accepted  
**Date**: 2025-01-01  
**Context**: Necesitamos type safety maxima para prevenir errores en runtime.

**Decision**: TypeScript en modo estricto, sin `any`.

**Consequences**:
- `"strict": true` en tsconfig.json
- `any` prohibido (usar `unknown` + type guards)
- Todos los parametros y returns tipados
- `@ts-ignore` solo con justificacion documentada

**References**:
- `tsconfig.json` - Configuracion
- `types/` - Tipos del proyecto
- `schemas/` - Tipos inferidos de Zod

---

## ADR-008: Conventional Commits

**Status**: Accepted  
**Date**: 2025-01-01  
**Context**: Necesitamos historial de commits legible y generacion automatica de changelogs.

**Decision**: Usar Conventional Commits.

**Format**:
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**:
- `feat`: Nueva funcionalidad
- `fix`: Correccion de bug
- `docs`: Documentacion
- `style`: Formato (no afecta logica)
- `refactor`: Refactorizacion
- `test`: Tests
- `chore`: Tareas de mantenimiento

**Consequences**:
- Commits atomicos y descriptivos
- Changelog generado automaticamente
- Semantic versioning basado en commits

---

## ADR-009: Agent System v2.0

**Status**: Accepted  
**Date**: 2026-01-24  
**Context**: Vibe-coding con AI requiere estructura para evitar invencion y mantener calidad.

**Decision**: Sistema de agentes con Orchestrator + 4 agentes especializados + WP1-WP5.

**Components**:
- **Orchestrator v2.1**: Coordinacion, workpacks
- **Data/Backend v1.1**: API, DB, RLS
- **UI Builder v1.1**: Componentes, UX
- **QA Gatekeeper v1.1**: Testing, gates
- **Context Indexer v1.0**: Docs, patterns

**Workpacks**:
- WP1 Discovery (obligatorio): Validar CONTRACTS.md
- WP2 Backend: API routes, DB
- WP3 Frontend: Components, UX
- WP4 Testing: Unit + e2e tests
- WP5 Polish: Docs, optimization

**Quality Gates**:
- G1-G5: Universales
- G6-G9: Especializados

**Consequences**:
- 1 micro-tarea por iteracion
- Max 3 archivos por tarea
- Anti-invencion con Plan A/B
- Validacion obligatoria contra `context/CONTRACTS.md`

**References**:
- `app/agents/` - Sistema completo
- `app/agents/README.md` - Entry point
- `app/agents/QUALITY_GATES.md` - Definiciones G1-G9
- `context/` - Archivos de contexto

---

## Decision Template

Para nuevas decisiones, usar este formato:

```markdown
## ADR-XXX: [Titulo]

**Status**: Proposed | Accepted | Deprecated | Superseded  
**Date**: YYYY-MM-DD  
**Context**: [Por que se necesita esta decision]

**Decision**: [Que se decidio]

**Consequences**:
- [Implicacion 1]
- [Implicacion 2]

**References**:
- `path/to/file` - Descripcion
```

---

## Changelog

### 2026-01-25
- Documento inicial creado
- ADR-001 a ADR-009 documentados
- Template para nuevas decisiones
