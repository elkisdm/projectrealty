> Last updated: 2026-01-25

# Code Patterns

Patrones de codigo establecidos en el proyecto. Seguir estos patrones para mantener consistencia.

---

## 1. React Query Pattern

### Query Keys Jerarquicas

```typescript
// lib/react-query.ts
export const queryKeys = {
  buildings: {
    all: ['buildings'] as const,
    lists: () => [...queryKeys.buildings.all, 'list'] as const,
    list: (filters: BuildingFilters) => [...queryKeys.buildings.lists(), { filters }] as const,
    details: () => [...queryKeys.buildings.all, 'detail'] as const,
    detail: (slug: string) => [...queryKeys.buildings.details(), slug] as const,
  },
  admin: {
    buildings: (page: number, limit: number, search?: string, comuna?: string) =>
      ['admin', 'buildings', { page, limit, search, comuna }] as const,
    units: (params: UnitQueryParams) => ['admin', 'units', params] as const,
    stats: () => ['admin', 'stats'] as const,
  },
};
```

### Configuracion Estandar

```typescript
// Configuracion por defecto
{
  staleTime: 5 * 60 * 1000,      // 5 minutos
  gcTime: 10 * 60 * 1000,        // 10 minutos (garbage collection)
  refetchOnWindowFocus: false,
  retry: (failureCount, error) => {
    // No reintentar errores 4xx
    if (error?.status >= 400 && error?.status < 500) return false;
    return failureCount < 3;
  },
}
```

### Hook Pattern

```typescript
// hooks/useSearchResults.ts
export function useSearchResults(filters: SearchFilters) {
  return useQuery({
    queryKey: queryKeys.buildings.list(filters),
    queryFn: () => fetchBuildings(filters),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(filters.comuna || filters.q),
  });
}
```

### Invalidacion Selectiva

```typescript
// Invalidar lista despues de crear
queryClient.invalidateQueries({ queryKey: queryKeys.buildings.lists() });

// Invalidar todo el dominio
queryClient.invalidateQueries({ queryKey: queryKeys.buildings.all });
```

---

## 2. Supabase Pattern

### Cliente Dual

```typescript
// lib/supabase.ts

// Cliente publico (anon key) - para lectura publica
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Cliente admin (service role) - bypass RLS
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

### Query con Relaciones

```typescript
const { data, error } = await supabase
  .from('buildings')
  .select(`
    id,
    slug,
    name,
    comuna,
    units!left (
      id,
      tipologia,
      price,
      disponible
    )
  `)
  .eq('provider', 'assetplan')
  .order('name')
  .limit(100);
```

### Filtros Comunes

```typescript
// Filtro por rango
.gte('price', minPrice)
.lte('price', maxPrice)

// Filtro OR
.or(`comuna.eq.${comuna1},comuna.eq.${comuna2}`)

// Filtro ILIKE (case insensitive)
.ilike('name', `%${search}%`)

// Paginacion
.range(from, to)
```

### Fallback a Mock

```typescript
// Si no hay credenciales, usar mock
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  return createMockSupabaseClient();
}
```

### RLS Pattern

```sql
-- Habilitar RLS
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;

-- Politica de lectura publica
CREATE POLICY read_buildings ON public.buildings
  FOR SELECT USING (true);

-- Politica de escritura admin
CREATE POLICY admin_write_buildings ON public.buildings
  FOR ALL USING (auth.role() = 'service_role');
```

---

## 3. Component Pattern

### Server vs Client

```typescript
// Server Component (default) - sin "use client"
export default async function PropertyPage({ params }: Props) {
  const data = await fetchProperty(params.slug);
  return <PropertyDetail data={data} />;
}

// Client Component - solo con estado/efectos
'use client';
export function PropertyGallery({ images }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  // ...
}
```

### Props Interface

```typescript
interface PropertyCardProps {
  unit: Unit;
  building: Building;
  variant?: 'compact' | 'detailed';
  showPrice?: boolean;
  className?: string;
  onSelect?: (unit: Unit) => void;
}

export function PropertyCard({
  unit,
  building,
  variant = 'detailed',
  showPrice = true,
  className,
  onSelect,
}: PropertyCardProps) {
  // ...
}
```

### Skeleton Pattern

```typescript
// Componente de carga
export function PropertyCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-2xl" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>
    </div>
  );
}

// Uso con loading state
{isLoading ? <PropertyCardSkeleton /> : <PropertyCard unit={unit} />}
```

### Estado Loading/Empty/Error

```typescript
export function PropertyList({ filters }: Props) {
  const { data, isLoading, error } = useSearchResults(filters);

  // Loading
  if (isLoading) {
    return <PropertyListSkeleton count={6} />;
  }

  // Error
  if (error) {
    return (
      <ErrorState 
        message="Error al cargar propiedades" 
        onRetry={() => refetch()} 
      />
    );
  }

  // Empty
  if (!data?.length) {
    return (
      <EmptyState 
        title="No encontramos propiedades"
        description="Intenta con otros filtros"
        action={{ label: "Limpiar filtros", onClick: clearFilters }}
      />
    );
  }

  // Success
  return <PropertyGrid units={data} />;
}
```

---

## 4. API Route Pattern

### Estructura Estandar

```typescript
// app/api/visits/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter } from '@lib/rate-limit';
import { logger } from '@lib/logger';

const rateLimiter = createRateLimiter({ limit: 10, window: 60 });

const CreateVisitSchema = z.object({
  listingId: z.string().uuid(),
  slotId: z.string().uuid(),
  userId: z.string().uuid(),
  channel: z.enum(['whatsapp', 'web']).optional(),
});

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const { success, remaining } = await rateLimiter.check(ip);
    if (!success) {
      return NextResponse.json(
        { error: 'rate_limited' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    // 2. Parse & validate
    const body = await request.json();
    const result = CreateVisitSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'validation_error', details: result.error.errors },
        { status: 400 }
      );
    }

    // 3. Business logic
    const visit = await createVisit(result.data);

    // 4. Log (sin PII)
    logger.log('visit_created', { visitId: visit.id, channel: result.data.channel });

    // 5. Response
    return NextResponse.json({ success: true, data: visit }, { status: 201 });

  } catch (error) {
    logger.error('visit_creation_failed', { error: String(error) });
    return NextResponse.json(
      { error: 'internal_error' },
      { status: 500 }
    );
  }
}
```

### Rate Limiter

```typescript
// lib/rate-limit.ts
export function createRateLimiter({ limit, window }: Config) {
  return {
    check: async (key: string) => {
      // Implementacion con in-memory o Redis
      return { success: true, remaining: limit - 1 };
    }
  };
}

// Uso
const rateLimiter = createRateLimiter({ limit: 20, window: 60 }); // 20/min
```

### Logging sin PII

```typescript
// CORRECTO - sin PII
logger.log('user_signup', { userId: user.id, source: 'web' });

// INCORRECTO - con PII
logger.log('user_signup', { email: user.email, phone: user.phone }); // NO!
```

---

## 5. UI/Styling Pattern

### Tailwind Classes

```typescript
// Base styles
const baseClasses = "rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700";

// Responsive
const responsiveClasses = "w-full md:w-1/2 lg:w-1/3";

// Dark mode
const darkModeClasses = "bg-white dark:bg-gray-900 text-gray-900 dark:text-white";

// Focus ring
const focusClasses = "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500";
```

### Motion con reduced-motion

```typescript
// hooks/useReducedMotion.ts
export function useReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}

// Uso en Framer Motion
const prefersReduced = useReducedMotion();

<motion.div
  initial={prefersReduced ? false : { opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={prefersReduced ? { duration: 0 } : { duration: 0.3 }}
/>
```

---

## 6. TypeScript Pattern

### No any

```typescript
// CORRECTO
function processData(data: Building[]): ProcessedBuilding[] {
  return data.map(transform);
}

// INCORRECTO
function processData(data: any): any {  // NO!
  return data.map(transform);
}
```

### Tipos de schemas/models

```typescript
// Importar tipos de schemas
import type { Unit, Building } from '@schemas/models';
import type { Visit, VisitSlot } from '@types/visit';

// Inferir de Zod
import { UnitSchema } from '@schemas/models';
type Unit = z.infer<typeof UnitSchema>;
```

### Generics en Componentes

```typescript
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onRowClick,
}: DataTableProps<T>) {
  // ...
}
```

---

## 7. Agent System Patterns

### Workpack System (WP1-WP5)

```
WP1 Discovery → WP2 Backend → WP3 Frontend → WP4 Testing → WP5 Polish
    ↑              ↓              ↓              ↓            ↓
    └──────────── QA Gate ←──────┴──────────────┴────────────┘
```

- **WP1**: Obligatorio. Validar contra CONTRACTS.md
- **WP2**: Skip si UI-only
- **WP3**: Skip si API-only
- **WP5**: Skip si hotfix

### Anti-Invencion

```markdown
## Assumptions
- [ ] Asumo que tabla X existe con columnas Y
- [ ] Asumo que endpoint retorna { data, error }

## Open Questions (max 3)
1. Pregunta 1?

## Plan A (conservador) - DEFAULT
- Opcion segura sin inventar

## Plan B (optimo)
- Opcion ideal pero requiere confirmar
```

### Quality Gate

```markdown
## Quality Gates
- [x] G1: Contract Compliance - PASS
- [x] G2: Security & Privacy - PASS
- [x] G3: UX States - PASS
- [ ] G4: Code Quality - N/A (hotfix)
- [x] G5: Verification - PASS
```

---

## Changelog

### 2026-01-25
- Documento inicial creado
- React Query patterns documentados
- Supabase patterns documentados
- Component patterns (Server/Client, Loading/Empty/Error)
- API Route pattern con rate limiting
- UI/Styling patterns
- TypeScript patterns
- Agent System patterns
