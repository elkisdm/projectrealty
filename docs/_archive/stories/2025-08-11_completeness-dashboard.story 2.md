---
title: Dashboard de Completeness
objective: Vista v_building_completeness + endpoint admin para monitorear completitud de datos
area: [api, data, ui]
routes: [/admin/completeness, /api/admin/completeness]
acceptance:
  - [ ] AC1: Vista SQL v_building_completeness
  - [ ] AC2: Endpoint GET /api/admin/completeness
  - [ ] AC3: Dashboard admin en /admin/completeness
  - [ ] AC4: Métricas de completitud por campo
checks:
  - [ ] a11y
  - [ ] release-gate
refs: [/docs/ARQUITECTURA.md, /docs/DECISIONES.md]
---

# Dashboard de Completeness - Vista v_building_completeness + Endpoint Admin

## 🎯 Objetivo
Crear un dashboard administrativo que muestre métricas de completitud de datos de edificios usando una vista SQL y un endpoint admin protegido.

## 📋 Criterios de Aceptación

### AC1: Vista SQL v_building_completeness
- [ ] Crear vista SQL que calcule completitud por edificio
- [ ] Incluir métricas: campos requeridos, opcionales, total
- [ ] Porcentaje de completitud por edificio
- [ ] Campos: id, slug, name, comuna, address, amenities, gallery, cover_image, badges, service_level

### AC2: Endpoint GET /api/admin/completeness
- [ ] Endpoint protegido para admin
- [ ] Retorna datos de la vista v_building_completeness
- [ ] Incluye estadísticas agregadas
- [ ] Rate limiting apropiado

### AC3: Dashboard Admin en /admin/completeness
- [ ] Página admin con métricas visuales
- [ ] Tabla con edificios y sus porcentajes
- [ ] Gráficos de completitud general
- [ ] Filtros por comuna y rango de completitud

### AC4: Métricas de Completitud por Campo
- [ ] Campos requeridos: id, slug, name, comuna, address, amenities, gallery
- [ ] Campos opcionales: cover_image, badges, service_level
- [ ] Cálculo de porcentaje ponderado
- [ ] Identificación de edificios con datos incompletos

## 🔧 Implementación

### Archivos a modificar
- `supabase/schema.sql` - Agregar vista v_building_completeness
- `app/api/admin/completeness/route.ts` - Nuevo endpoint
- `app/admin/completeness/page.tsx` - Nueva página admin
- `components/admin/CompletenessDashboard.tsx` - Componente dashboard

### Archivos a crear
- `app/admin/completeness/page.tsx`
- `components/admin/CompletenessDashboard.tsx`
- `app/api/admin/completeness/route.ts`

### Dependencias
- Ninguna nueva
- Usar patrones existentes de admin

## ✅ Checklist

### Funcional
- [ ] AC1 implementado - Vista SQL creada
- [ ] AC2 implementado - Endpoint admin funcional
- [ ] AC3 implementado - Dashboard visual
- [ ] AC4 implementado - Métricas detalladas

### Calidad
- [ ] Tests pasando
- [ ] TypeScript sin errores
- [ ] Lint sin warnings

### A11y
- [ ] Screen reader compatible
- [ ] Keyboard navigation
- [ ] Color contrast OK
- [ ] Tablas con headers apropiados

### Performance
- [ ] Vista SQL optimizada
- [ ] Endpoint con rate limiting
- [ ] Dashboard con loading states

### Release Gate
- [ ] Lint ✅
- [ ] Type check ✅
- [ ] Tests ✅
- [ ] Build ✅
- [ ] SEO check ✅
- [ ] Robots check ✅
- [ ] Root check ✅

## 📚 Referencias
- [/docs/ARQUITECTURA.md] - Patrones de admin
- [/docs/DECISIONES.md] - Decisiones de diseño
- Patrón existente: `/admin/flags`

## ⚠️ Riesgos
- Vista SQL compleja: Usar índices apropiados
- Performance con muchos edificios: Implementar paginación
- Seguridad admin: Usar rate limiting y autenticación

## 🎯 Estimación
- **Tiempo:** ≤6h
- **Complejidad:** Media

## 📊 Vista SQL v_building_completeness

```sql
CREATE OR REPLACE VIEW public.v_building_completeness AS
SELECT 
    b.id,
    b.slug,
    b.name,
    b.comuna,
    b.address,
    
    -- Campos requeridos (7 total)
    CASE WHEN b.id IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN b.slug IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN b.name IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN b.comuna IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN b.address IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN b.amenities IS NOT NULL AND array_length(b.amenities, 1) > 0 THEN 1 ELSE 0 END +
    CASE WHEN b.gallery IS NOT NULL AND array_length(b.gallery, 1) >= 3 THEN 1 ELSE 0 END AS required_fields,
    
    -- Campos opcionales (3 total)
    CASE WHEN b.cover_image IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN b.badges IS NOT NULL AND jsonb_array_length(b.badges) > 0 THEN 1 ELSE 0 END +
    CASE WHEN b.service_level IS NOT NULL THEN 1 ELSE 0 END AS optional_fields,
    
    -- Total campos (10)
    10 AS total_fields,
    
    -- Porcentaje de completitud (ponderado: 70% requeridos + 30% opcionales)
    ROUND(
        (
            (CASE WHEN b.id IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN b.slug IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN b.name IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN b.comuna IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN b.address IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN b.amenities IS NOT NULL AND array_length(b.amenities, 1) > 0 THEN 1 ELSE 0 END +
             CASE WHEN b.gallery IS NOT NULL AND array_length(b.gallery, 1) >= 3 THEN 1 ELSE 0 END) * 0.7 +
            (CASE WHEN b.cover_image IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN b.badges IS NOT NULL AND jsonb_array_length(b.badges) > 0 THEN 1 ELSE 0 END +
             CASE WHEN b.service_level IS NOT NULL THEN 1 ELSE 0 END) * 0.3
        ) * 100, 1
    ) AS completeness_percentage,
    
    -- Detalles por campo
    CASE WHEN b.id IS NOT NULL THEN '✅' ELSE '❌' END AS id_status,
    CASE WHEN b.slug IS NOT NULL THEN '✅' ELSE '❌' END AS slug_status,
    CASE WHEN b.name IS NOT NULL THEN '✅' ELSE '❌' END AS name_status,
    CASE WHEN b.comuna IS NOT NULL THEN '✅' ELSE '❌' END AS comuna_status,
    CASE WHEN b.address IS NOT NULL THEN '✅' ELSE '❌' END AS address_status,
    CASE WHEN b.amenities IS NOT NULL AND array_length(b.amenities, 1) > 0 THEN '✅' ELSE '❌' END AS amenities_status,
    CASE WHEN b.gallery IS NOT NULL AND array_length(b.gallery, 1) >= 3 THEN '✅' ELSE '❌' END AS gallery_status,
    CASE WHEN b.cover_image IS NOT NULL THEN '✅' ELSE '❌' END AS cover_image_status,
    CASE WHEN b.badges IS NOT NULL AND jsonb_array_length(b.badges) > 0 THEN '✅' ELSE '❌' END AS badges_status,
    CASE WHEN b.service_level IS NOT NULL THEN '✅' ELSE '❌' END AS service_level_status,
    
    b.created_at,
    b.updated_at
FROM public.buildings b
ORDER BY completeness_percentage ASC, b.name;
```

## 🔐 Endpoint Admin

```typescript
// GET /api/admin/completeness
export async function GET(request: Request) {
  // Rate limiting para admin
  const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });
  
  // Obtener datos de la vista
  const { data, error } = await supabase
    .from('v_building_completeness')
    .select('*')
    .order('completeness_percentage', { ascending: true });
    
  // Calcular estadísticas agregadas
  const stats = calculateCompletenessStats(data);
  
  return NextResponse.json({ 
    buildings: data, 
    stats,
    timestamp: new Date().toISOString()
  });
}
```

## 🎨 Dashboard UI

- **Tabla principal**: Lista de edificios con porcentajes
- **Gráfico circular**: Distribución de completitud
- **Filtros**: Por comuna, rango de completitud
- **Acciones**: Enlaces a editar edificios incompletos
- **Responsive**: Mobile-first design con Tailwind
