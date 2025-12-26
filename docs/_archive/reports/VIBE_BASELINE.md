# VIBE BASELINE REPORT

**Fecha:** $(date +%Y-%m-%d)  
**Tag:** pre-vibe-$(date +%Y%m%d)  
**Rama:** chore/vibe-baseline  

## 📊 RESUMEN EJECUTIVO

Proyecto Next.js 14 con App Router, TypeScript estricto, Supabase como backend, y enfoque en arriendo 0% comisión. Estado: coming-soon activo, estructura sólida pero con oportunidades de mejora.

---

## 🛣️ TABLA DE RUTAS

| Path | Tipo | Metadata | Revalidate | Estado |
|------|------|----------|------------|--------|
| `/` | RSC | ✅ | 3600s | Redirect a coming-soon/landing |
| `/coming-soon` | RSC | ✅ | - | Página estática |
| `/landing` | RSC + Client | ✅ | 3600s | Landing principal |
| `/property/[slug]` | RSC + Client | ✅ | - | Detalle propiedad |
| `/propiedad/[id]` | RSC | ✅ | - | Ruta legacy |
| `/api/buildings` | API | - | - | GET con filtros |
| `/api/buildings/[slug]` | API | - | - | GET detalle |
| `/api/booking` | API | - | - | POST booking |
| `/api/waitlist` | API | - | - | POST con rate-limit |
| `/api/debug` | API | - | - | Debug interno |
| `/api/debug-admin` | API | - | - | Debug admin |

### Rutas Duplicadas Detectadas
- `landing/` y `landing 2/` 
- `property/` y `property 2/`
- `buildings/` y `buildings 2/`
- `booking/` y `booking 2/`

---

## 🔌 APIs

| Endpoint | Métodos | Validación | Rate Limit | Estado |
|----------|---------|------------|------------|--------|
| `/api/buildings` | GET | ✅ Zod | ❌ | Producción |
| `/api/buildings/[slug]` | GET | ✅ Zod | ❌ | Producción |
| `/api/booking` | POST | ✅ Zod | ❌ | Simulado |
| `/api/waitlist` | POST | ✅ Zod | ✅ (3/min) | Supabase |
| `/api/debug` | GET | ❌ | ❌ | Dev only |
| `/api/debug-admin` | GET | ❌ | ❌ | Dev only |

### Validaciones Implementadas
- **Zod schemas** en `schemas/models.ts`
- **Rate limiting** solo en waitlist (in-memory)
- **Error handling** consistente con NextResponse

---

## 📚 LIBS CLAVE

### Core Libraries
| Lib | Propósito | Estado |
|-----|-----------|--------|
| `lib/data.ts` | Data layer + Supabase | ✅ Activo |
| `lib/flags.ts` | Feature flags | ✅ Activo |
| `lib/derive.ts` | Cálculos precioDesde | ✅ Activo |
| `lib/supabase.ts` | Supabase client | ✅ Activo |
| `lib/rate-limit.ts` | Rate limiting utils | ✅ Activo |

### Adapters
| Adapter | Propósito | Estado |
|---------|-----------|--------|
| `lib/adapters/assetplan.ts` | CSV data import | ✅ Activo |
| `lib/adapters/constants.ts` | Constantes | ✅ Activo |

### SEO & Analytics
| Lib | Propósito | Estado |
|-----|-----------|--------|
| `lib/seo/jsonld.ts` | Structured data | ✅ Activo |
| `lib/analytics.ts` | GA4 tracking | ✅ Activo |
| `lib/whatsapp.ts` | WhatsApp integration | ✅ Activo |

---

## 📦 DEPENDENCIAS CRÍTICAS

### Production Dependencies
```json
{
  "@supabase/supabase-js": "^2.54.0",    // Backend DB
  "@tanstack/react-query": "^5.84.2",    // Data fetching
  "next": "14.2.5",                      // Framework
  "react": "18.2.0",                     // UI Library
  "zod": "^4.0.16",                      // Validation
  "framer-motion": "11.0.0",             // Animations
  "lucide-react": "0.424.0"              // Icons
}
```

### Dev Dependencies
```json
{
  "typescript": "5.4.5",                 // Type safety
  "tailwindcss": "3.4.1",               // Styling
  "jest": "^29.7.0",                    // Testing
  "eslint": "8.57.0"                    // Linting
}
```

---

## 📝 TODOs DETECTADOS

### Por Archivo

#### `app/(marketing)/landing/page.tsx`
- **TODO(BLUEPRINT):** texto legal final (línea 37)

#### `components/forms/BookingForm.tsx`
- **contacto_metodo:** "form" hardcodeado (línea 122)

#### `lib/data.ts`
- **Simulación de latencia** en desarrollo (línea 11)
- **Valores por defecto** para amenities/gallery (líneas 80-90)

#### `app/api/waitlist/route.ts`
- **Rate limiting in-memory** (línea 8) - debería usar Redis en producción

#### `app/api/booking/route.ts`
- **Simulación de persistencia** (línea 15) - no persiste realmente

---

## ⚠️ RIESGOS DE REFACTOR

### 1. **Rutas Duplicadas** (Alto)
- **Impacto:** Confusión en routing, mantenimiento duplicado
- **Archivos:** `landing/` vs `landing 2/`, `property/` vs `property 2/`
- **Mitigación:** Consolidar rutas antes de refactor

### 2. **Data Layer Híbrido** (Medio)
- **Impacto:** Inconsistencia entre mock y Supabase
- **Archivos:** `lib/data.ts`, `lib/db.mock.ts`
- **Mitigación:** Migrar completamente a Supabase

### 3. **Rate Limiting In-Memory** (Medio)
- **Impacto:** No funciona en múltiples instancias
- **Archivos:** `app/api/waitlist/route.ts`
- **Mitigación:** Implementar Redis o Upstash

### 4. **Feature Flags Hardcodeados** (Bajo)
- **Impacto:** Deploy manual para cambios
- **Archivos:** `config/feature-flags.ts`
- **Mitigación:** Sistema de flags dinámico

### 5. **Validación Inconsistente** (Bajo)
- **Impacto:** Algunas APIs sin validación
- **Archivos:** `app/api/debug/`, `app/api/debug-admin/`
- **Mitigación:** Implementar Zod en todas las APIs

---

## 🎯 STORIES PROPUESTAS (≤4h cada una)

### 1. **Coming Soon Override** (3h)
- **Objetivo:** Sistema de override para coming-soon
- **Archivos:** `lib/flags.ts`, `config/feature-flags.ts`
- **Entregables:** API endpoint + UI toggle

### 2. **Promotion System** (4h)
- **Objetivo:** Sistema de promociones dinámico
- **Archivos:** `components/PromotionBadge.tsx`, `schemas/models.ts`
- **Entregables:** Componente + schema extendido

### 3. **SEO Optimization** (3h)
- **Objetivo:** Mejorar structured data y meta tags
- **Archivos:** `lib/seo/jsonld.ts`, páginas principales
- **Entregables:** JSON-LD completo + meta tags

### 4. **Rate Limit Enhancement** (2h)
- **Objetivo:** Rate limiting robusto
- **Archivos:** `lib/rate-limit.ts`, APIs
- **Entregables:** Middleware + configuración

### 5. **Data Layer Cleanup** (4h)
- **Objetivo:** Eliminar rutas duplicadas y mock data
- **Archivos:** Rutas duplicadas, `lib/data.ts`
- **Entregables:** Rutas consolidadas + Supabase only

---

## 📈 MÉTRICAS DE ÉXITO

- **Performance:** Lighthouse score >90
- **Type Safety:** 0 `any` types
- **Test Coverage:** >80% en componentes críticos
- **Bundle Size:** <500KB gzipped
- **SEO:** 100% structured data coverage

---

## 🔄 PRÓXIMOS PASOS

1. **Validar baseline** con equipo
2. **Priorizar stories** según backlog
3. **Crear tickets** en sistema de gestión
4. **Establecer métricas** de seguimiento
5. **Planificar sprints** de implementación

---

*Reporte generado automáticamente el $(date +%Y-%m-%d %H:%M:%S)*
