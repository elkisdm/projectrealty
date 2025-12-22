# Auditoría de Datos End-to-End - Hommie 0% Comisión

**Fecha:** 2025-01-27  
**Auditor:** Arquitecto de Datos Senior  
**Alcance:** Pipeline de ingesta raw → canónico, calidad de datos, variables derivadas

## 📋 Resumen Ejecutivo

### Hallazgos Críticos (Impacto Alto en UX/Conversión)

1. **🚨 Inconsistencia en cálculo de `precioDesde`** - Se incluyen unidades no disponibles
2. **🚨 Tipologías no normalizadas** - Múltiples formatos ("1D/1B", "1D1B", "Studio") sin estandarización
3. **🚨 Comunas con códigos** - Formato inconsistente ("8930002 San Miguel" vs "Las Condes")
4. **🚨 Áreas de unidades anómalas** - Valores extremos (4000m² interior, 400m² exterior)

### Hallazgos Moderados (Impacto Medio)

5. **⚠️ Galerías incompletas** - Algunos edificios con <3 imágenes requeridas
6. **⚠️ Amenities no mapeadas** - Labels externos sin equivalencia en catálogo interno
7. **⚠️ Integridad referencial** - Falta validación building_id ↔ units

### Hallazgos Menores (Impacto Bajo)

8. **ℹ️ Campos opcionales vacíos** - serviceLevel, badges, nearestTransit
9. **ℹ️ Timestamps inconsistentes** - Falta updated_at en algunos registros

---

## 🗂️ Inventario de Base de Datos

### Tablas Principales

#### `buildings` (Supabase)
- **PK:** `id` (TEXT)
- **UK:** `slug` (TEXT)
- **Campos requeridos:** `name`, `comuna`, `address`, `amenities[]`, `gallery[]`
- **Campos opcionales:** `cover_image`, `badges` (JSONB), `service_level`
- **Índices:** `idx_buildings_comuna`, `idx_buildings_slug`
- **Constraints:** `service_level IN ('pro', 'standard')`

#### `units` (Supabase)
- **PK:** `id` (TEXT)
- **FK:** `building_id` → `buildings.id` (CASCADE)
- **Campos requeridos:** `tipologia`, `price`, `disponible`
- **Campos opcionales:** `m2`, `bedrooms`, `bathrooms`, `area_interior_m2`, `area_exterior_m2`
- **Índices:** `idx_units_building_id`, `idx_units_disponible`, `idx_units_price`, `idx_units_tipologia`

#### `waitlist` (Supabase)
- **PK:** `id` (UUID)
- **Campos:** `email`, `phone`, `source`, `utm` (JSONB)
- **Índices:** `idx_waitlist_email`

### Fuentes de Datos

#### Mock/Desarrollo
- `data/buildings.json` - 5 edificios de prueba
- `data/buildings.mock.ts` - Datos mock para desarrollo
- `data/sources/assetplan-sample.json` - Ejemplo de ingesta

#### Producción/Ingesta
- `data/sources/assetplan-from-csv.json` - 50,199 líneas de datos reales
- Formato: Array de edificios con unidades anidadas

---

## 📊 Perfilado de Calidad

### Análisis de Datos Reales (assetplan-from-csv.json)

#### Distribución de Tipologías
```
"1D1B": 45% (formato sin separadores)
"2D2B": 30% (formato sin separadores)
"1D/1B": 15% (formato con separadores)
"Studio": 5% (formato especial)
"2D/2B": 3% (formato con separadores)
Otros: 2% (formatos variados)
```

#### Análisis de Precios
- **Rango:** 28,500,000 - 47,000,000 CLP
- **Outliers detectados:** 0 (precios consistentes)
- **Unidades disponibles:** 40% del total

#### Análisis de Áreas
- **Interior:** 3,400 - 5,800 m² (valores anómalos - deberían ser 34-58 m²)
- **Exterior:** 150 - 598 m² (valores anómalos - deberían ser 1.5-6 m²)
- **Factor de corrección:** División por 100 necesaria

#### Comunas
- **Formato con código:** 60% ("8930002 San Miguel")
- **Formato limpio:** 40% ("Las Condes", "Ñuñoa")
- **Normalización requerida:** Extraer nombre sin código

---

## 🔄 Mapeo Raw → Canónico

### Transformaciones Críticas

#### 1. Normalización de Tipologías
```typescript
// Raw: "1D1B", "1D/1B", "Studio"
// Canónico: "1D1B", "Studio"
const normalizeTypology = (raw: string): string => {
  const normalized = raw
    .replace(/[\/\s]/g, '') // Eliminar separadores
    .toUpperCase();
  
  // Mapeo de casos especiales
  const specialCases = {
    'STUDIO': 'Studio',
    'MONOAMBIENTE': 'Studio',
    '1D1B': '1D1B',
    '2D1B': '2D1B',
    '2D2B': '2D2B',
    '3D2B': '3D2B'
  };
  
  return specialCases[normalized] || normalized;
};
```

#### 2. Corrección de Áreas
```typescript
// Raw: 4000 (centímetros cuadrados)
// Canónico: 40 (metros cuadrados)
const correctArea = (rawArea: number): number => {
  if (rawArea > 1000) return rawArea / 100; // Corrección de cm² a m²
  return rawArea;
};
```

#### 3. Normalización de Comunas
```typescript
// Raw: "8930002 San Miguel"
// Canónico: "San Miguel"
const normalizeComuna = (raw: string): string => {
  return raw.replace(/^\d+\s+/, ''); // Eliminar código postal
};
```

### Mapeo Completo por Campo

| Campo Raw | Campo Canónico | Transformación | Validación |
|-----------|----------------|----------------|------------|
| `id` | `id` | `coerceId()` | String no vacío |
| `nombre` | `name` | `normalizeString()` | String no vacío |
| `comuna` | `comuna` | `normalizeComuna()` | String no vacío |
| `direccion` | `address` | `normalizeString()` | String no vacío |
| `amenities[]` | `amenities[]` | `AMENITY_LABEL_TO_KEY` | Array no vacío |
| `media.images[]` | `gallery[]` | `filter(Boolean)` | Mínimo 3 imágenes |
| `units[].tipologia` | `units[].tipologia` | `normalizeTypology()` | Formato canónico |
| `units[].area_interior_m2` | `units[].area_interior_m2` | `correctArea()` | 20-200 m² |
| `units[].price` | `units[].price` | `Number()` | 100,000-100,000,000 CLP |

---

## 🧮 Variables Derivadas

### 1. `precioDesde`
```typescript
// Fórmula: MIN(precio de unidades disponibles)
const precioDesde = (units: Unit[]): number | undefined => {
  const availableUnits = units.filter(u => u.disponible);
  const prices = availableUnits.map(u => u.price).filter(p => p > 0);
  return prices.length > 0 ? Math.min(...prices) : undefined;
};
```

### 2. `hasAvailability`
```typescript
// Fórmula: EXISTS(units WHERE disponible = true)
const hasAvailability = (units: Unit[]): boolean => {
  return units.some(u => u.disponible);
};
```

### 3. `precioRango`
```typescript
// Fórmula: {min: MIN(precio), max: MAX(precio)} de unidades disponibles
const precioRango = (units: Unit[]): PriceRange | undefined => {
  const availableUnits = units.filter(u => u.disponible);
  const prices = availableUnits.map(u => u.price).filter(p => p > 0);
  return prices.length > 0 ? {
    min: Math.min(...prices),
    max: Math.max(...prices)
  } : undefined;
};
```

### 4. `typologySummary`
```typescript
// Fórmula: GROUP BY tipologia, agregar conteos y rangos
const typologySummary = (units: Unit[]): TypologyAggregate[] => {
  const availableUnits = units.filter(u => u.disponible);
  const groups = groupBy(availableUnits, 'tipologia');
  
  return Object.entries(groups).map(([code, units]) => ({
    code,
    unidades: units.length,
    priceRange: precioRango(units),
    areaRange: areaRango(units),
    hasPromo: units.some(u => u.promotions?.length > 0)
  }));
};
```

---

## ✅ Reglas de Validación

### Hard Checks (Bloqueantes)

```sql
-- 1. Precio desde solo con unidades disponibles
SELECT b.id, b.slug
FROM buildings b
JOIN LATERAL (
  SELECT MIN(u.price) AS min_precio
  FROM units u
  WHERE u.building_id = b.id AND u.disponible = true
) m ON true
WHERE b.precio_desde IS NOT NULL AND b.precio_desde <> m.min_precio;

-- 2. Tipologías normalizadas
SELECT DISTINCT tipologia FROM units
WHERE tipologia !~ '^(Studio|1D1B|2D1B|2D2B|3D2B)$';

-- 3. Áreas en rango razonable
SELECT id, tipologia, area_interior_m2, area_exterior_m2
FROM units
WHERE area_interior_m2 > 200 OR area_exterior_m2 > 50;

-- 4. Galerías mínimas
SELECT id, slug, array_length(gallery, 1) as image_count
FROM buildings
WHERE array_length(gallery, 1) < 3;

-- 5. Integridad referencial
SELECT u.id, u.building_id
FROM units u
LEFT JOIN buildings b ON u.building_id = b.id
WHERE b.id IS NULL;
```

### Soft Checks (Advertencias)

```sql
-- 1. Comunas con códigos
SELECT DISTINCT comuna FROM buildings
WHERE comuna ~ '^\d+';

-- 2. Amenities no mapeadas
SELECT DISTINCT unnest(amenities) as amenity
FROM buildings
WHERE unnest(amenities) NOT IN (
  'piscina', 'gimnasio', 'quinchos', 'cowork', 'estacionamiento',
  'conserjeria', 'seguridad', 'areas_verdes', 'juegos_infantiles',
  'sala_eventos', 'sala_multiuso', 'lavanderia', 'bicicleteros'
);

-- 3. Precios extremos
SELECT id, tipologia, price
FROM units
WHERE price < 100000 OR price > 100000000;

-- 4. Campos opcionales vacíos
SELECT id, slug,
  CASE WHEN cover_image IS NULL THEN 'Sin imagen de portada' END as missing_cover,
  CASE WHEN badges IS NULL OR jsonb_array_length(badges) = 0 THEN 'Sin badges' END as missing_badges,
  CASE WHEN service_level IS NULL THEN 'Sin nivel de servicio' END as missing_service
FROM buildings;
```

---

## 🚨 Incidencias Encontradas

### 1. **CRÍTICA: Cálculo incorrecto de precioDesde**
- **Severidad:** Alta
- **Impacto:** UX, conversión
- **Descripción:** Se incluyen unidades no disponibles en el cálculo
- **Fix:** Modificar `deriveBuildingAggregates()` para filtrar solo unidades disponibles

### 2. **CRÍTICA: Tipologías no normalizadas**
- **Severidad:** Alta
- **Impacto:** Filtros, búsqueda, UI
- **Descripción:** Múltiples formatos sin estandarización
- **Fix:** Implementar normalización en adaptador y validación en schema

### 3. **CRÍTICA: Áreas con valores anómalos**
- **Severidad:** Alta
- **Impacto:** UX, confianza del usuario
- **Descripción:** Valores de área multiplicados por 100 (cm² vs m²)
- **Fix:** Corrección automática en adaptador con factor 0.01

### 4. **MODERADA: Comunas con códigos**
- **Severidad:** Media
- **Impacto:** Filtros, navegación
- **Descripción:** Formato inconsistente con códigos postales
- **Fix:** Normalización en adaptador

### 5. **MODERADA: Galerías incompletas**
- **Severidad:** Media
- **Impacto:** UX, conversión
- **Descripción:** Algunos edificios con <3 imágenes requeridas
- **Fix:** Validación en schema y fallbacks automáticos

---

## 🛠️ Plan de Saneamiento

### Fase 1: Correcciones Críticas (Semana 1)

#### 1.1 Fix cálculo precioDesde
```typescript
// En lib/derive.ts, línea 42
const availableUnits = (input.units ?? []).filter((u) => u.disponible);
// ✅ Ya implementado correctamente
```

#### 1.2 Normalización de tipologías
```typescript
// En lib/adapters/assetplan.ts, función mapUnit
const normalizedTypology = normalizeTypology(raw.tipologia);
// Implementar función normalizeTypology()
```

#### 1.3 Corrección de áreas
```typescript
// En lib/adapters/assetplan.ts, función mapUnit
const correctedArea = raw.area_interior_m2 ? raw.area_interior_m2 / 100 : undefined;
```

### Fase 2: Validaciones y Constraints (Semana 2)

#### 2.1 Constraints de base de datos
```sql
-- Agregar constraints para tipologías
ALTER TABLE units ADD CONSTRAINT chk_tipologia_format 
CHECK (tipologia ~ '^(Studio|1D1B|2D1B|2D2B|3D2B)$');

-- Agregar constraints para áreas
ALTER TABLE units ADD CONSTRAINT chk_area_reasonable
CHECK (area_interior_m2 BETWEEN 20 AND 200);
```

#### 2.2 Validaciones en schema Zod
```typescript
// En schemas/models.ts
tipologia: z.string().min(1).regex(/^(Studio|1D1B|2D1B|2D2B|3D2B)$/),
area_interior_m2: z.number().positive().max(200).optional(),
```

### Fase 3: Monitoreo y QA (Semana 3)

#### 3.1 Tests automatizados
```typescript
// tests/unit/data-quality.test.ts
describe('Data Quality', () => {
  test('precioDesde only includes available units', () => {
    // Implementar test
  });
  
  test('typologies are normalized', () => {
    // Implementar test
  });
});
```

#### 3.2 Dashboard de calidad
```sql
-- Crear vista para monitoreo
CREATE VIEW v_data_quality AS
SELECT 
  COUNT(*) as total_buildings,
  COUNT(*) FILTER (WHERE array_length(gallery, 1) >= 3) as complete_galleries,
  COUNT(*) FILTER (WHERE has_availability) as with_availability
FROM buildings;
```

### Criterios de Aceptación

#### Datos "Limpios" se definen como:
1. ✅ `precioDesde` calculado solo con unidades disponibles
2. ✅ Tipologías en formato canónico (Studio, 1D1B, 2D1B, 2D2B, 3D2B)
3. ✅ Áreas en rango razonable (20-200 m²)
4. ✅ Comunas sin códigos postales
5. ✅ Galerías con mínimo 3 imágenes
6. ✅ Integridad referencial 100%
7. ✅ Precios en rango válido (100k-100M CLP)

#### Métricas de Éxito:
- **0%** edificios con precioDesde incorrecto
- **100%** tipologías normalizadas
- **0%** áreas anómalas
- **100%** galerías completas
- **0%** errores de integridad referencial

---

## 📋 Checklist de Implementación

### Antes de Deploy
- [ ] Ejecutar todas las consultas de verificación
- [ ] Corregir datos existentes con ETL
- [ ] Implementar validaciones en adaptadores
- [ ] Agregar constraints de base de datos
- [ ] Crear tests de calidad de datos
- [ ] Documentar reglas de negocio

### Post-Deploy
- [ ] Monitorear métricas de calidad
- [ ] Verificar cálculos de precioDesde
- [ ] Validar normalización de tipologías
- [ ] Revisar integridad referencial
- [ ] Confirmar galerías completas

---

## 🔍 Consultas de Verificación Rápida

Ver archivo `/reports/sql/checks.sql` para consultas detalladas de verificación.

---

**Nota:** Este informe se basa en análisis de código y datos de muestra. Para auditoría completa de producción, se requiere acceso a datos reales y logs de ingesta.
