---
title: Sistema de overrides de contenido y catálogo de promociones
objective: Implementar tablas building_content_overrides, promotion_catalog/assignments + endpoints para gestión dinámica de contenido y promociones
area: [data, api, ui]
routes: [/api/buildings/[slug]/overrides, /api/promotions, /api/promotions/assignments]
acceptance:
  - [ ] AC1: Tabla building_content_overrides con campos editables
  - [ ] AC2: Tabla promotion_catalog con catálogo maestro de promociones
  - [ ] AC3: Tabla promotion_assignments para asignar promociones a edificios/unidades
  - [ ] AC4: Endpoints CRUD para gestión de overrides y promociones
  - [ ] AC5: Integración con sistema existente de badges y derive
checks:
  - [ ] a11y
  - [ ] release-gate
refs: [/docs/ARQUITECTURA.md, /docs/DECISIONES.md]
---

# Sistema de overrides de contenido y catálogo de promociones

## 🎯 Objetivo
Implementar un sistema completo de gestión dinámica de contenido y promociones que permita:
- Sobrescribir contenido de edificios (nombre, descripción, imágenes, etc.)
- Mantener un catálogo maestro de promociones reutilizables
- Asignar promociones específicas a edificios o unidades individuales
- Endpoints REST para gestión administrativa
- Integración transparente con el sistema existente de derive y badges

## 📋 Criterios de Aceptación

### AC1: Tabla building_content_overrides con campos editables
- [ ] Tabla con building_id como FK a buildings
- [ ] Campos editables: name, description, amenities, gallery, cover_image
- [ ] Campo metadata JSONB para datos adicionales
- [ ] Timestamps created_at, updated_at
- [ ] RLS configurado (solo service_role puede escribir)
- [ ] Índices para performance

### AC2: Tabla promotion_catalog con catálogo maestro de promociones
- [ ] Tabla con id, name, description, type (enum), discount_value
- [ ] Campos: start_date, end_date, is_active, priority
- [ ] Campo metadata JSONB para configuración específica
- [ ] Validación de fechas y valores
- [ ] Soft delete con deleted_at

### AC3: Tabla promotion_assignments para asignar promociones
- [ ] FK a promotion_catalog y buildings/units
- [ ] Campos: target_type (building|unit), target_id, assigned_at
- [ ] Campo conditions JSONB para reglas específicas
- [ ] Campo priority para orden de aplicación
- [ ] RLS configurado apropiadamente

### AC4: Endpoints CRUD para gestión de overrides y promociones
- [ ] GET/PUT/DELETE /api/buildings/[slug]/overrides
- [ ] GET/POST/PUT/DELETE /api/promotions
- [ ] GET/POST/DELETE /api/promotions/assignments
- [ ] Validación con Zod schemas
- [ ] Rate limiting y autenticación
- [ ] Response format consistente

### AC5: Integración con sistema existente de badges y derive
- [ ] Función mergeBuildingWithOverrides en lib/data.ts
- [ ] Función applyPromotionAssignments en lib/derive.ts
- [ ] Actualización de BuildingSchema para incluir overrides
- [ ] Tests para verificar integración
- [ ] Backward compatibility garantizada

## 🔧 Implementación

### Archivos a crear
- `supabase/migrations/001_content_overrides.sql` - Migración de tablas
- `schemas/overrides.ts` - Schemas para overrides y promociones
- `app/api/buildings/[slug]/overrides/route.ts` - Endpoint overrides
- `app/api/promotions/route.ts` - Endpoint catálogo
- `app/api/promotions/assignments/route.ts` - Endpoint asignaciones
- `lib/data.ts` - Funciones de merge y aplicación
- `tests/unit/overrides.test.ts` - Tests unitarios
- `tests/integration/promotions.test.ts` - Tests de integración

### Archivos a modificar
- `schemas/models.ts` - Extender BuildingSchema
- `lib/derive.ts` - Integrar aplicación de promociones
- `lib/supabase.ts` - Tipos para nuevas tablas
- `app/api/buildings/[slug]/route.ts` - Incluir overrides en response

### Dependencias
- `@supabase/supabase-js` - Base de datos
- `zod` - Validación
- `date-fns` - Manejo de fechas

## ✅ Checklist

### Funcional
- [ ] AC1 implementado - Tabla building_content_overrides
- [ ] AC2 implementado - Tabla promotion_catalog
- [ ] AC3 implementado - Tabla promotion_assignments
- [ ] AC4 implementado - Endpoints CRUD completos
- [ ] AC5 implementado - Integración con sistema existente

### Calidad
- [ ] Tests pasando (unit + integration)
- [ ] TypeScript sin errores
- [ ] Lint sin warnings
- [ ] Migración SQL ejecutada
- [ ] RLS configurado correctamente

### A11y
- [ ] Endpoints retornan códigos HTTP apropiados
- [ ] Mensajes de error accesibles
- [ ] Validación client-side en formularios admin

### Performance
- [ ] Índices SQL optimizados
- [ ] Queries eficientes con JOINs
- [ ] Caching apropiado para catálogo
- [ ] Paginación en endpoints de listado

### Release Gate
- [ ] Lint ✅
- [ ] Type check ✅
- [ ] Tests ✅
- [ ] Build ✅
- [ ] SQL migration ✅
- [ ] Database schema check ✅

## 📚 Referencias
- [/docs/ARQUITECTURA.md] - Patrones de arquitectura
- [/docs/DECISIONES.md] - Decisiones técnicas
- [Supabase RLS docs](https://supabase.com/docs/guides/auth/row-level-security)
- [Zod validation docs](https://zod.dev/)

## ⚠️ Riesgos
- **Breaking changes**: Mitigación con backward compatibility y migración gradual
- **Performance**: Mitigación con índices y queries optimizados
- **Data integrity**: Mitigación con constraints y validación en múltiples capas
- **Security**: Mitigación con RLS y autenticación robusta

## 🎯 Estimación
- **Tiempo:** ≤8h
- **Complejidad:** Alta

## 📝 Notas Técnicas

### Estructura de Tablas

```sql
-- building_content_overrides
CREATE TABLE building_content_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id text NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  name text,
  description text,
  amenities text[],
  gallery text[],
  cover_image text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- promotion_catalog
CREATE TABLE promotion_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('discount_percent', 'free_commission', 'fixed_amount')),
  discount_value numeric(10,2),
  start_date date,
  end_date date,
  is_active boolean DEFAULT true,
  priority integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- promotion_assignments
CREATE TABLE promotion_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id uuid NOT NULL REFERENCES promotion_catalog(id),
  target_type text NOT NULL CHECK (target_type IN ('building', 'unit')),
  target_id text NOT NULL,
  conditions jsonb DEFAULT '{}',
  priority integer DEFAULT 0,
  assigned_at timestamptz DEFAULT now()
);
```

### Flujo de Datos

1. **Lectura**: `getBuilding(slug)` → merge con overrides → aplicar promociones
2. **Escritura**: Validación → RLS check → inserción/actualización
3. **Derive**: Aplicar promociones asignadas → recalcular `precioDesde`

### Endpoints Design

```typescript
// GET /api/buildings/[slug]/overrides
{
  "name": "Nuevo nombre",
  "description": "Descripción actualizada",
  "amenities": ["piscina", "gimnasio"],
  "metadata": { "custom_field": "value" }
}

// POST /api/promotions
{
  "name": "Descuento 10%",
  "type": "discount_percent",
  "discount_value": 10,
  "start_date": "2025-01-01",
  "end_date": "2025-12-31"
}

// POST /api/promotions/assignments
{
  "promotion_id": "uuid",
  "target_type": "building",
  "target_id": "building-slug",
  "conditions": { "min_price": 500000 }
}
```
