# Estructura Actual de la Aplicación

**Proyecto:** Hommie 0% Comisión  
**Stack:** Next.js 15.4.6 (App Router) + TypeScript + React 18 + Tailwind CSS + Supabase  
**Fecha:** Enero 2025

---

## 📁 Estructura de Directorios

```
hommie-0-commission-next/
├── app/                          # Next.js App Router (páginas y rutas)
│   ├── (catalog)/                # Grupo de rutas: catálogo
│   │   └── property/[slug]/      # Página de propiedad individual
│   ├── (marketing)/              # Grupo de rutas: marketing
│   │   ├── flash-videos/         # Landing de videos flash
│   │   └── landing-v2/           # Landing principal v2
│   ├── admin/                    # Panel administrativo
│   │   ├── buildings/           # Gestión de edificios
│   │   ├── units/                # Gestión de unidades
│   │   ├── flags/                # Gestión de feature flags
│   │   └── login/                # Login admin
│   ├── api/                      # API Routes (Next.js)
│   │   ├── admin/                # Endpoints admin
│   │   │   ├── auth/             # Autenticación admin
│   │   │   ├── buildings/        # CRUD edificios
│   │   │   ├── units/            # CRUD unidades
│   │   │   ├── stats/            # Estadísticas
│   │   │   └── completeness/     # Completitud de datos
│   │   ├── analytics/            # Analytics y métricas
│   │   ├── availability/         # Disponibilidad de unidades
│   │   ├── booking/              # Reservas/agendamientos
│   │   ├── buildings/            # API edificios (público)
│   │   ├── calendar/             # Calendario de disponibilidad
│   │   ├── quotations/           # Cotizaciones
│   │   ├── visits/               # Visitas agendadas
│   │   └── waitlist/             # Lista de espera
│   ├── agendamiento/             # Página de agendamiento
│   ├── agendamiento-mejorado/    # Versión mejorada
│   ├── arrienda-sin-comision/    # Landing principal
│   ├── coming-soon/              # Página coming soon
│   ├── cotizador/                # Cotizador de propiedades
│   ├── propiedad/[id]/          # Página propiedad (legacy)
│   ├── layout.tsx                # Layout raíz
│   ├── page.tsx                  # Página home (redirige según flags)
│   ├── providers.tsx             # Providers (React Query, etc.)
│   ├── globals.css               # Estilos globales
│   ├── metadata.ts               # Metadata global
│   ├── robots.ts                 # robots.txt
│   └── sitemap.ts                # sitemap.xml
│
├── components/                   # Componentes React reutilizables
│   ├── admin/                    # Componentes panel admin (12 archivos)
│   ├── bio/                      # Componentes de biografía
│   ├── building/                 # Componentes de edificios
│   ├── calendar/                 # Sistema de calendario (10 archivos)
│   ├── commune/                  # Componentes de comunas
│   ├── cost/                     # Componentes de costos
│   ├── filters/                  # Sistema de filtros
│   │   ├── AdvancedFilterBar.tsx
│   │   ├── FilterBar.tsx
│   │   ├── FilterChips.tsx
│   │   ├── SearchInput.tsx
│   │   └── SortSelect.tsx
│   ├── flow/                     # Flujos de usuario (8 archivos)
│   ├── forms/                    # Formularios (2 archivos)
│   ├── gallery/                  # Galería de imágenes
│   ├── icons/                    # Iconos personalizados (6 archivos)
│   ├── linktree/                 # Componente linktree
│   ├── lists/                    # Listas (4 archivos)
│   ├── marketing/                # Componentes marketing (39 archivos)
│   ├── property/                 # Componentes de propiedades (19 archivos)
│   ├── quotation/                # Componentes de cotización
│   ├── seo/                      # Componentes SEO (2 archivos)
│   ├── social/                   # Componentes sociales
│   ├── ui/                       # Componentes UI base
│   │   ├── AmenityList.tsx
│   │   ├── BuildingCardSkeleton.tsx
│   │   ├── BuildingCardV2.tsx
│   │   ├── LiquidCapsule.tsx
│   │   ├── Modal.tsx
│   │   ├── MotionWrapper.tsx
│   │   ├── PrimaryButton.tsx
│   │   ├── PromotionBadge.tsx
│   │   ├── StickyCtaBar.tsx
│   │   └── ThemeToggle.tsx
│   └── visual/                   # Componentes visuales
│
├── hooks/                        # Custom React Hooks
│   ├── useAdminAuth.ts           # Autenticación admin
│   ├── useAdminBuildings.ts      # Gestión edificios admin
│   ├── useAdminStats.ts          # Estadísticas admin
│   ├── useAdvancedFilters.ts     # Filtros avanzados
│   ├── useBuildingsData.ts       # Datos de edificios
│   ├── useBuildingsForQuotation.ts # Edificios para cotización
│   ├── useBuildingsPagination.ts # Paginación edificios
│   ├── useFetchBuildings.ts      # Fetch edificios
│   ├── usePropertyUnit.ts        # Unidad de propiedad
│   ├── useScrollAnimation.ts     # Animaciones scroll
│   ├── useScrollVisibility.ts    # Visibilidad scroll
│   ├── useVirtualGrid.ts         # Grid virtualizado
│   └── useVisitScheduler.ts      # Agendamiento de visitas
│
├── lib/                          # Utilidades y lógica de negocio
│   ├── adapters/                 # Adaptadores de datos
│   │   ├── assetplan.ts          # Adapter AssetPlan
│   │   └── constants.ts
│   ├── admin/                    # Utilidades admin
│   │   ├── auth-middleware.ts    # Middleware autenticación
│   │   ├── auth-supabase.ts      # Auth Supabase
│   │   ├── auth.ts               # Lógica auth
│   │   ├── assetplan-csv.ts      # Procesamiento CSV AssetPlan
│   │   ├── csv.ts                # Utilidades CSV
│   │   ├── data-optimized.ts     # Datos optimizados
│   │   ├── data.ts               # Datos admin
│   │   ├── supabase-cookies.ts   # Cookies Supabase
│   │   └── validate-redirect.ts  # Validación redirects
│   ├── calendar/                 # Sistema de calendario
│   │   ├── availability.ts       # Disponibilidad
│   │   ├── google.ts             # Integración Google Calendar
│   │   ├── ics.ts                # Generación archivos ICS
│   │   ├── normalizers.ts        # Normalizadores
│   │   └── week-view.ts          # Vista semanal
│   ├── constants/                # Constantes
│   │   └── property.ts           # Constantes propiedades
│   ├── content/                  # Contenido estático
│   │   └── flashOffer.ts         # Contenido flash offer
│   ├── seo/                      # Utilidades SEO
│   │   └── jsonld.ts             # JSON-LD structured data
│   ├── stores/                   # State management (Zustand)
│   │   └── buildingsStore.ts     # Store edificios
│   ├── analytics.ts              # Analytics
│   ├── data.ts                   # Datos principales
│   ├── db.mock.ts                # Mock de base de datos
│   ├── derive.ts                 # Funciones derivadas
│   ├── flags.ts                  # Feature flags
│   ├── logger.ts                 # Logger
│   ├── mapping-v2.ts             # Mapeo de datos v2
│   ├── quotation.ts              # Lógica de cotizaciones
│   ├── rate-limit.ts             # Rate limiting
│   ├── react-query.ts            # Configuración React Query
│   ├── search.ts                 # Búsqueda
│   ├── site.ts                   # Configuración del sitio
│   ├── supabase.ts               # Cliente Supabase
│   ├── supabase-data-processor.ts # Procesador datos Supabase
│   ├── supabase.mock.ts          # Mock Supabase
│   ├── theme-context.tsx         # Contexto de tema
│   ├── theme.ts                  # Configuración tema
│   ├── tremendo-units-processor.ts # Procesador unidades Tremendo
│   ├── utils.ts                  # Utilidades generales
│   └── whatsapp.ts               # Integración WhatsApp
│
├── schemas/                      # Validaciones Zod
│   ├── models.ts                 # Schemas de modelos
│   └── quotation.ts              # Schemas de cotización
│
├── types/                        # Tipos TypeScript
│   ├── buildings.ts              # Tipos edificios
│   ├── calendar.ts               # Tipos calendario
│   ├── filters.ts                # Tipos filtros
│   ├── global.d.ts               # Tipos globales
│   ├── index.ts                  # Exportaciones
│   └── visit.ts                  # Tipos visitas
│
├── tests/                        # Tests (99 archivos)
│   ├── api/                      # Tests de API
│   ├── integration/              # Tests de integración
│   ├── mocks/                    # Mocks para tests
│   └── unit/                     # Tests unitarios
│
├── config/                       # Configuración
│   ├── feature-flags.json        # Feature flags (coming soon, etc.)
│   └── *.example                 # Archivos de ejemplo
│
├── data/                         # Datos estáticos
│   ├── buildings/                # Datos de edificios
│   │   └── alferex-real.json
│   └── sources/                  # Fuentes de datos
│       └── assetplan-export.csv
│
├── scripts/                      # Scripts de utilidad
│   ├── create-admin-user.mjs     # Crear usuario admin
│   ├── ingest-csv.mjs            # Ingesta CSV
│   ├── setup-supabase-production.mjs # Setup Supabase prod
│   ├── verify-core-functionality.mjs # Verificar funcionalidad
│   ├── verify-production-ready.mjs   # Verificar producción
│   └── verify-supabase-connection.mjs # Verificar conexión
│
├── public/                       # Archivos estáticos (86 archivos)
│   ├── *.jpg                     # Imágenes (58 archivos)
│   ├── *.svg                     # SVGs (25 archivos)
│   └── *.png                     # PNGs (2 archivos)
│
├── docs/                         # Documentación
│   ├── _archive/                 # Documentación archivada
│   ├── admin/                    # Docs admin (6 archivos)
│   ├── ARQUITECTURA.md           # Arquitectura
│   ├── BUILD_PRODUCTION_REPORT.md # Reporte build
│   ├── DEPLOY.md                 # Guía deploy
│   ├── ESTRUCTURA_FINAL.md       # Estructura final
│   ├── PRODUCCION_CHECKLIST.md   # Checklist producción
│   ├── SETUP_SUPABASE.md         # Setup Supabase
│   └── VARIABLES_ENTORNO.md     # Variables de entorno
│
├── _workspace/                   # Workspace interno (98 archivos)
│   └── scripts/                  # Scripts internos
│
├── .cursor/                      # Configuración Cursor IDE
│   └── rules/                    # Reglas de desarrollo
│
├── .github/                      # GitHub
│   └── workflows/                # GitHub Actions
│
├── package.json                  # Dependencias y scripts
├── tsconfig.json                 # Configuración TypeScript
├── jest.config.ts                # Configuración Jest
├── tailwind.config.ts            # Configuración Tailwind
├── eslint.config.mjs             # Configuración ESLint
└── README.md                     # Documentación principal
```

---

## 🏗️ Arquitectura Principal

### **App Router (Next.js 15)**
- **Rutas agrupadas:** `(catalog)`, `(marketing)` para organización
- **Rutas dinámicas:** `[slug]`, `[id]`, `[tipologia]`
- **API Routes:** Endpoints RESTful en `/app/api/`
- **Layouts:** Layouts anidados por sección
- **Metadata:** SEO y metadatos por ruta

### **Componentes**
- **Organización por dominio:** `admin/`, `property/`, `calendar/`, etc.
- **UI base:** Componentes reutilizables en `components/ui/`
- **Marketing:** Componentes específicos de marketing (39 archivos)
- **Flujos:** Componentes de flujos de usuario en `components/flow/`

### **State Management**
- **Zustand:** Store global en `lib/stores/buildingsStore.ts`
- **React Query:** Cache y sincronización de datos
- **Context API:** Tema y otros contextos globales

### **Data Layer**
- **Supabase:** Base de datos principal
- **Adapters:** Adaptadores para diferentes fuentes (AssetPlan, etc.)
- **Processors:** Procesadores de datos (CSV, mocks, etc.)
- **Mocks:** Mocks para desarrollo y testing

### **Validación**
- **Zod:** Schemas en `schemas/` para validación runtime
- **TypeScript:** Tipos estáticos en `types/`

### **Testing**
- **Jest:** Tests unitarios e integración
- **MSW:** Mock Service Worker para mocks de API
- **Playwright:** Tests E2E (configurado pero no visible en estructura)

---

## 📦 Dependencias Principales

### **Core**
- `next@15.4.6` - Framework React
- `react@18.2.0` - Biblioteca UI
- `typescript@5.4.5` - TypeScript

### **UI/Estilos**
- `tailwindcss@3.4.1` - CSS utility-first
- `framer-motion@11.0.0` - Animaciones
- `@headlessui/react@^2.2.7` - Componentes headless
- `lucide-react@^0.541.0` - Iconos

### **Data/State**
- `@supabase/supabase-js@^2.54.0` - Cliente Supabase
- `@tanstack/react-query@^5.84.2` - Data fetching
- `zustand@^4.5.7` - State management

### **Validación**
- `zod@^3.25.0` - Schema validation

### **Testing**
- `jest@^29.7.0` - Testing framework
- `@testing-library/react@^16.1.0` - Testing utilities
- `msw@1.3.2` - API mocking
- `@playwright/test@^1.55.0` - E2E testing

---

## 🔧 Scripts Principales

```bash
# Desarrollo
pnpm dev                    # Servidor desarrollo
pnpm build                  # Build producción
pnpm start                  # Servidor producción

# Testing
pnpm test                   # Todos los tests
pnpm test:unit              # Tests unitarios
pnpm test:integration       # Tests integración
pnpm test:api               # Tests API
pnpm test:e2e               # Tests E2E

# Calidad
pnpm lint                   # Linter
pnpm typecheck              # Type checking

# Ingesta de datos
pnpm ingest:csv:direct      # Ingesta CSV directa
pnpm ingest:assetplan:csv   # Ingesta AssetPlan CSV

# Verificación
pnpm verify                 # Verificar setup
pnpm verify:real-data        # Verificar datos reales
node scripts/verify-production-ready.mjs  # Verificar producción

# Feature Flags
pnpm coming-soon:on         # Activar coming soon
pnpm coming-soon:off        # Desactivar coming soon
```

---

## 🗂️ Path Aliases (TypeScript)

Configurados en `tsconfig.json`:

```typescript
"@/*"           → "./*"
"@components/*"  → "components/*"
"@lib/*"         → "lib/*"
"@schemas/*"     → "schemas/*"
"@hooks/*"       → "hooks/*"
"@types/*"       → "types/*"
"@workspace/*"   → "_workspace/*"
```

---

## 📊 Estadísticas

- **Páginas:** ~32 páginas generadas
- **Componentes:** ~150+ componentes
- **Hooks:** 13 custom hooks
- **API Routes:** ~20+ endpoints
- **Tests:** 99 archivos de test (87.1% pasando)
- **TypeScript:** 0 errores en código fuente

---

## 🎯 Características Principales

1. **Sistema de Feature Flags:** Control de "coming soon" vía `config/feature-flags.json`
2. **Panel Admin:** Gestión de edificios, unidades, estadísticas
3. **Sistema de Calendario:** Agendamiento de visitas con integración Google Calendar
4. **Cotizador:** Sistema de cotizaciones de propiedades
5. **Filtros Avanzados:** Sistema de filtrado y búsqueda
6. **SEO Optimizado:** Metadata, JSON-LD, sitemap, robots.txt
7. **Analytics:** Tracking de conversiones y performance
8. **Rate Limiting:** Protección de APIs
9. **Injestas de Datos:** Scripts para ingesta desde CSV/AssetPlan

---

## 📝 Notas

- **SSR/ISR:** Next.js App Router con Server Components
- **A11y:** Accesibilidad implementada (prefers-reduced-motion, etc.)
- **Dark Mode:** Sistema de temas implementado
- **Responsive:** Diseño mobile-first con Tailwind
- **Type Safety:** TypeScript estricto, sin `any`

---

**Última actualización:** Enero 2025
