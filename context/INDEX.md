> Last updated: 2026-01-25

# Repository Index

Mapa de navegacion rapida del repositorio. Usa este documento para localizar codigo rapidamente.

---

## Quick Links

### Core Documents
- [CONTRACTS.md](./CONTRACTS.md) - Tipos, schemas Zod, contratos API (validar en WP1)
- [PATTERNS.md](./PATTERNS.md) - Patrones de codigo del proyecto
- [DECISIONS.md](./DECISIONS.md) - ADRs (decisiones arquitectonicas)

### Agent System
- [Agent System README](../app/agents/README.md) - Entry point del sistema de agentes
- [Quality Gates (G1-G9)](../app/agents/QUALITY_GATES.md) - Criterios de calidad
- [Routing Rules](../app/agents/ROUTING_RULES.md) - Cuando usar cada agente
- [Workflow Diagram](../app/agents/WORKFLOW_DIAGRAM.md) - Flujo WP1-WP5

### Project Rules
- [00-core.mdc](../.cursor/rules/00-core.mdc) - Reglas core del proyecto
- [10-api.mdc](../.cursor/rules/10-api.mdc) - Reglas de API
- [20-components.mdc](../.cursor/rules/20-components.mdc) - Reglas de componentes

---

## Directory Structure

```
hommie-0-commission-next/
│
├── app/                          # Next.js 14 App Router
│   ├── api/                      # API Routes (28 endpoints)
│   │   ├── admin/                # Admin endpoints (auth, buildings, units, stats)
│   │   ├── analytics/            # Conversion & performance tracking
│   │   ├── availability/         # Slot availability
│   │   ├── booking/              # Reservations
│   │   ├── buildings/            # Public building/unit search
│   │   ├── calendar/             # Calendar availability
│   │   ├── flash-videos/         # Flash offer cupos
│   │   ├── investment/           # Investment requests
│   │   ├── landing/              # Featured buildings
│   │   ├── quotations/           # Quote generation
│   │   ├── visits/               # Visit scheduling
│   │   └── waitlist/             # Waitlist signup
│   │
│   ├── agents/                   # Agent System v2.0
│   │   ├── Orchestrator.md       # Main coordinator (v2.1)
│   │   ├── data-backend.md       # Backend agent (v1.1)
│   │   ├── ui-builder.md         # UI agent (v1.1)
│   │   ├── qa-gatekeeper.md      # QA agent (v1.1)
│   │   ├── context-indexer.md    # Context agent (v1.0)
│   │   ├── QUALITY_GATES.md      # G1-G9 definitions
│   │   ├── ROUTING_RULES.md      # Agent selection
│   │   ├── WORKFLOW_DIAGRAM.md   # WP1-WP5 flow
│   │   └── templates/            # 5 core templates
│   │
│   ├── (catalog)/                # Catalog pages
│   ├── (marketing)/              # Marketing pages
│   ├── admin/                    # Admin dashboard
│   ├── arriendo/                 # Rental pages
│   ├── buscar/                   # Search results
│   ├── propiedad/                # Property detail
│   └── page.tsx                  # Homepage
│
├── components/                   # React Components
│   ├── admin/                    # Admin UI (12 components)
│   ├── calendar/                 # Calendar components (10)
│   ├── filters/                  # Filter components (8)
│   ├── flow/                     # Visit scheduling flow
│   ├── marketing/                # Marketing components (50+)
│   ├── mobile/                   # Mobile-specific (8)
│   ├── property/                 # Property components (38)
│   ├── search/                   # Search components (17)
│   └── ui/                       # Base UI components (27)
│
├── hooks/                        # Custom React Hooks (22)
│   ├── useAdminBuildings.ts      # Admin data fetching
│   ├── useBuildingsPagination.ts # Pagination with Zustand
│   ├── useFetchBuildings.ts      # Building fetching
│   ├── useSearchResults.ts       # Search with React Query
│   ├── useReducedMotion.ts       # Motion preference
│   ├── useStickySearch.ts        # Sticky search bar
│   └── ...
│
├── lib/                          # Utilities & Core Logic
│   ├── supabase.ts               # Supabase client (public + admin)
│   ├── react-query.ts            # Query keys & config
│   ├── rate-limit.ts             # Rate limiter factory
│   ├── logger.ts                 # Logging (no PII)
│   ├── validations/              # Zod schemas for forms
│   │   ├── visit.ts              # Visit form validation
│   │   └── search.ts             # Search form validation
│   └── utils/                    # Helper functions
│
├── schemas/                      # Zod Schemas (Source of Truth)
│   ├── models.ts                 # Unit, Building, Booking, etc.
│   ├── quotation.ts              # Quotation input/result
│   ├── review.ts                 # Review schemas
│   └── investment.ts             # Investment request
│
├── types/                        # TypeScript Types (7 files)
│   ├── index.ts                  # Re-exports from schemas
│   ├── buildings.ts              # Building state & filters
│   ├── visit.ts                  # Visit, Slot, Agent, User
│   ├── calendar.ts               # Calendar events, branded types
│   ├── filters.ts                # Filter values
│   ├── search.ts                 # Search component props
│   └── global.d.ts               # Global declarations (gtag, fbq)
│
├── stores/                       # Zustand Stores
│   └── buildingsStore.ts         # Buildings state management
│
├── config/                       # Configuration
│   ├── supabase/                 # Supabase config & migrations
│   │   ├── schema.sql            # Main schema
│   │   ├── schema-visits.sql     # Visits schema
│   │   └── migrations/           # SQL migrations
│   └── feature-flags.ts          # Feature flags
│
├── context/                      # Context Documentation
│   ├── CONTRACTS.md              # Types & API contracts
│   ├── INDEX.md                  # This file
│   ├── PATTERNS.md               # Code patterns
│   └── DECISIONS.md              # ADRs
│
├── scripts/                      # Utility Scripts (100+)
│   ├── ingest-*.mjs              # Data ingestion
│   ├── migrate-*.mjs             # Migrations
│   └── verify-*.mjs              # Verification
│
├── tests/                        # Test Files
│   ├── *.test.ts                 # Unit tests
│   └── *.test.tsx                # Component tests
│
├── public/                       # Static Assets
│   ├── *.svg                     # Icons (68)
│   └── *.jpg                     # Images (55)
│
└── docs/                         # Documentation (278 files)
```

---

## High-Traffic Areas

Estas son las areas mas editadas del proyecto:

### Components (frequent changes)
- `components/property/` - Property cards, detail, gallery
- `components/marketing/` - Hero, CTA, search forms
- `components/flow/` - Visit scheduling components

### API (critical paths)
- `app/api/buildings/route.ts` - Main search endpoint
- `app/api/visits/route.ts` - Visit booking
- `app/api/admin/` - Admin CRUD

### Types (source of truth)
- `schemas/models.ts` - All domain schemas
- `types/visit.ts` - Visit flow types

### Config
- `lib/supabase.ts` - Database client
- `lib/react-query.ts` - Query configuration

---

## File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Page | `page.tsx` | `app/buscar/page.tsx` |
| Layout | `layout.tsx` | `app/(marketing)/layout.tsx` |
| API Route | `route.ts` | `app/api/visits/route.ts` |
| Component | `PascalCase.tsx` | `PropertyCard.tsx` |
| Hook | `use*.ts` | `useSearchResults.ts` |
| Schema | `*.ts` in schemas/ | `schemas/models.ts` |
| Type | `*.ts` in types/ | `types/visit.ts` |
| Utility | `camelCase.ts` | `lib/utils/slug.ts` |
| Test | `*.test.ts(x)` | `PropertyCard.test.tsx` |

---

## Import Aliases

```typescript
// Configured in tsconfig.json
@/           -> ./
@components  -> ./components
@lib         -> ./lib
@schemas     -> ./schemas
@types       -> ./types
@hooks       -> ./hooks
```

---

## Database Tables

### Main Tables (Supabase)
- `buildings` - Building information
- `units` - Unit listings
- `visits` - Scheduled visits
- `waitlist` - Waitlist entries
- `admin_users` - Admin accounts

### RLS Status
- All tables have RLS enabled
- Public read policies on buildings/units
- Admin policies use service role key

---

## Changelog

### 2026-01-25
- Initial index created
- Directory structure documented
- High-traffic areas identified
- Import aliases documented
