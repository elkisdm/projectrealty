# ARQUITECTURA

## 🏗️ MÓDULOS

### Frontend
- **`/app/(marketing)/landing/`** - Landing principal
- **`/app/(catalog)/property/[slug]/`** - Detalle propiedad
- **`/app/coming-soon/`** - Página coming-soon
- **`/components/`** - UI components reutilizables

### Backend
- **`/app/api/buildings/`** - CRUD edificios
- **`/app/api/booking/`** - Reservas
- **`/app/api/waitlist/`** - Lista de espera
- **`/app/api/debug/`** - Debug interno

### Data Layer
- **`/lib/data.ts`** - Data access layer
- **`/lib/supabase.ts`** - Supabase client
- **`/lib/derive.ts`** - Cálculos de negocio
- **`/lib/flags.ts`** - Feature flags

### Schemas
- **`/schemas/models.ts`** - Zod schemas
- **`/types/index.ts`** - TypeScript types

## 🔄 FLUJO DE DATOS

```
Client → Server → Supabase/Mock
   ↓         ↓           ↓
RSC/CSR → API Routes → Database
   ↓         ↓           ↓
Components → Validation → Cache
```

## 🎯 PATRONES

- **RSC** por defecto
- **ISR** para datos estáticos
- **Zod** para validación
- **TanStack Query** para cache
- **Feature flags** para rollouts
