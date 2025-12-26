# 🗄️ Estructura Visual de Base de Datos - Edificios y Unidades

**Base de Datos:** PostgreSQL (Supabase)  
**Última actualización:** Basado en `_workspace/scripts/sql/core.sql`

---

## 📊 Diagrama de Relaciones

```
┌─────────────────────────────────┐
│         BUILDINGS               │
│  (Edificios/Condominios)        │
├─────────────────────────────────┤
│ PK: id (UUID)                   │
│ UK: (provider, source_building) │
│     slug (TEXT)                 │
└────────────┬────────────────────┘
             │ 1
             │
             │ *
             │
┌────────────▼────────────────────┐
│           UNITS                 │
│    (Unidades/Departamentos)     │
├─────────────────────────────────┤
│ PK: id (UUID)                   │
│ FK: building_id → buildings(id) │
│ UK: (provider, source_unit)     │
└─────────────────────────────────┘
```

**Relación:** Un edificio tiene muchas unidades (1:N)  
**Cascada:** Al eliminar un edificio, se eliminan todas sus unidades

---

## 🏢 Tabla: `buildings` (Edificios)

### Estructura Principal

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| **`id`** | `UUID` | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Identificador único del edificio (generado automáticamente) |
| **`provider`** | `TEXT` | NOT NULL, DEFAULT `'assetplan'` | Proveedor/origen de los datos (actualmente solo 'assetplan') |
| **`source_building_id`** | `TEXT` | NOT NULL | ID original del edificio en el sistema fuente (ej: AssetPlan) |
| **`slug`** | `TEXT` | NOT NULL | URL-friendly para SEO (ej: "edificio-las-condes-123") |
| **`nombre`** | `TEXT` | NOT NULL | Nombre del edificio/condominio |
| **`comuna`** | `TEXT` | NOT NULL | Comuna donde se ubica el edificio (ej: "Las Condes", "Providencia") |
| **`direccion`** | `TEXT` | NULLABLE | Dirección completa del edificio |
| **`precio_desde`** | `INTEGER` | NULLABLE | Precio mínimo de arriendo de las unidades disponibles (calculado automáticamente) |
| **`has_availability`** | `BOOLEAN` | DEFAULT `false` | Indica si el edificio tiene unidades disponibles (calculado automáticamente) |
| **`created_at`** | `TIMESTAMPTZ` | DEFAULT `now()` | Fecha y hora de creación del registro |
| **`updated_at`** | `TIMESTAMPTZ` | DEFAULT `now()` | Fecha y hora de última actualización |

### Campos Extendidos (v2 - Opcionales)

Estos campos pueden no estar presentes en todas las instalaciones:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| **`precio_hasta`** | `INTEGER` | Precio máximo de arriendo (opcional, v2) |
| **`gc_mode`** | `TEXT` | Modo de gastos comunes: 'MF' (monto fijo) o 'variable' (opcional, v2) |
| **`featured`** | `BOOLEAN` | Indica si el edificio es destacado (opcional, v2) |

### Índices

```sql
-- Índice único compuesto para evitar duplicados por proveedor
CREATE UNIQUE INDEX uq_buildings_provider_source 
  ON buildings(provider, source_building_id);

-- Índice para búsquedas por comuna (performance)
CREATE INDEX idx_buildings_comuna ON buildings(comuna);

-- Índice para búsquedas por slug (performance)
CREATE INDEX idx_buildings_slug ON buildings(slug);

-- Índice para filtros por precio (opcional, v2)
CREATE INDEX idx_buildings_precio_desde ON buildings(precio_desde);

-- Índice para edificios destacados (opcional, v2)
CREATE INDEX idx_buildings_featured ON buildings(featured);
```

### Funciones Automáticas

```sql
-- Función que actualiza agregados del edificio (precio_desde, has_availability)
CREATE FUNCTION refresh_building_aggregates() RETURNS void AS $$
  UPDATE buildings b SET
    has_availability = EXISTS (
      SELECT 1 FROM units u 
      WHERE u.building_id = b.id 
        AND u.disponible = true 
        AND COALESCE(u.precio, 0) > 1
    ),
    precio_desde = (
      SELECT MIN(precio) 
      FROM units u 
      WHERE u.building_id = b.id 
        AND u.disponible = true 
        AND COALESCE(u.precio, 0) > 1
    ),
    updated_at = NOW();
$$ LANGUAGE SQL;
```

**Uso:** Esta función se ejecuta periódicamente para mantener actualizados los campos calculados del edificio.

### Seguridad (RLS - Row Level Security)

```sql
-- Habilitar RLS para control de acceso
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer edificios (acceso público)
CREATE POLICY read_buildings ON buildings 
  FOR SELECT USING (true);
```

---

## 🏠 Tabla: `units` (Unidades/Departamentos)

### Estructura Principal

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| **`id`** | `UUID` | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Identificador único de la unidad (generado automáticamente) |
| **`provider`** | `TEXT` | NOT NULL, DEFAULT `'assetplan'` | Proveedor/origen de los datos (actualmente solo 'assetplan') |
| **`source_unit_id`** | `TEXT` | NOT NULL | ID original de la unidad en el sistema fuente (ej: AssetPlan) |
| **`building_id`** | `UUID` | NOT NULL, FK → buildings(id) ON DELETE CASCADE | ID del edificio al que pertenece la unidad |
| **`unidad`** | `TEXT` | NOT NULL | Código/número de la unidad dentro del edificio (ej: "101", "A-205") |
| **`tipologia`** | `TEXT` | NULLABLE | Tipología de la unidad: "Studio", "Estudio", "1D1B", "2D1B", "2D2B", "3D2B" |
| **`bedrooms`** | `INTEGER` | NULLABLE | Número de dormitorios (0 para Studio/Estudio) |
| **`bathrooms`** | `INTEGER` | NULLABLE | Número de baños |
| **`area_m2`** | `NUMERIC` | NULLABLE | Área total en metros cuadrados |
| **`area_interior_m2`** | `NUMERIC` | NULLABLE | Área interior en metros cuadrados (v2) |
| **`area_exterior_m2`** | `NUMERIC` | NULLABLE | Área exterior/terraza en metros cuadrados (v2) |
| **`orientacion`** | `TEXT` | NULLABLE | Orientación: 'N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO' (v2) |
| **`pet_friendly`** | `BOOLEAN` | NULLABLE | Indica si la unidad permite mascotas |
| **`precio`** | `INTEGER` | NULLABLE | Precio mensual de arriendo (en CLP) |
| **`gastos_comunes`** | `INTEGER` | NULLABLE | Gastos comunes mensuales (en CLP) |
| **`disponible`** | `BOOLEAN` | DEFAULT `true` | Estado de disponibilidad de la unidad |
| **`status`** | `TEXT` | NOT NULL, DEFAULT `'unknown'`, CHECK | Estado detallado: 'available', 'inactive', 'unknown', 'reserved', 'rented' |
| **`promotions`** | `TEXT[]` | DEFAULT `'{}'` | Array de promociones aplicables a la unidad |
| **`created_at`** | `TIMESTAMPTZ` | DEFAULT `now()` | Fecha y hora de creación del registro |
| **`updated_at`** | `TIMESTAMPTZ` | DEFAULT `now()` | Fecha y hora de última actualización |

### Campos Extendidos (v2 - Opcionales)

Estos campos pueden no estar presentes en todas las instalaciones:

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| **`piso`** | `INTEGER` | NULLABLE | Piso donde se encuentra la unidad |
| **`amoblado`** | `BOOLEAN` | NULLABLE | Indica si la unidad está amoblada |
| **`parking_ids`** | `TEXT` | NULLABLE | IDs de estacionamientos asociados (v2) |
| **`storage_ids`** | `TEXT` | NULLABLE | IDs de bodegas asociadas (v2) |
| **`parking_opcional`** | `BOOLEAN` | NULLABLE | Indica si el estacionamiento es opcional (v2) |
| **`storage_opcional`** | `BOOLEAN` | NULLABLE | Indica si la bodega es opcional (v2) |
| **`guarantee_installments`** | `INTEGER` | CHECK (1-12) | Número de cuotas para pagar garantía (v2) |
| **`guarantee_months`** | `INTEGER` | CHECK (0-2) | Meses de garantía requeridos (v2) |
| **`rentas_necesarias`** | `NUMERIC(3,2)` | NULLABLE | Número de rentas necesarias (ej: 1.5 = 1.5 meses) (v2) |
| **`renta_minima`** | `INTEGER` | NULLABLE | Renta mínima requerida en CLP (v2) |
| **`link_listing`** | `TEXT` | NULLABLE | URL del listing original en el sistema fuente (v2) |

### Índices

```sql
-- Índice único compuesto para evitar duplicados por proveedor
CREATE UNIQUE INDEX uq_units_provider_source 
  ON units(provider, source_unit_id);

-- Índice para búsquedas por edificio (performance en JOINs)
CREATE INDEX idx_units_building_id ON units(building_id);

-- Índice para filtros por disponibilidad (performance)
CREATE INDEX idx_units_disponible ON units(disponible);

-- Índice para ordenamiento por precio (performance)
CREATE INDEX idx_units_price ON units(precio);

-- Índice para filtros por tipología (performance)
CREATE INDEX idx_units_tipologia ON units(tipologia);

-- Índice para garantías en cuotas (opcional, v2)
CREATE INDEX idx_units_guarantee_installments ON units(guarantee_installments);
```

### Seguridad (RLS - Row Level Security)

```sql
-- Habilitar RLS para control de acceso
ALTER TABLE units ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer unidades (acceso público)
CREATE POLICY read_units ON units 
  FOR SELECT USING (true);
```

---

## 🔍 Vista: `v_filters_available` (Filtros Disponibles)

Esta vista se utiliza para obtener opciones de filtros en la UI (comunas y tipologías disponibles).

```sql
CREATE OR REPLACE VIEW v_filters_available AS
WITH avail AS (
  SELECT u.*, b.comuna
  FROM units u
  JOIN buildings b ON b.id = u.building_id
  WHERE u.disponible = true 
    AND COALESCE(u.precio, 0) > 1
)
SELECT 
  'comuna'::TEXT AS type, 
  comuna AS value, 
  COUNT(*) AS units
FROM avail 
GROUP BY comuna
UNION ALL
SELECT 
  'tipologia'::TEXT AS type, 
  tipologia AS value, 
  COUNT(*) AS units
FROM avail 
WHERE tipologia IS NOT NULL 
GROUP BY tipologia;
```

**Uso:** Permite obtener dinámicamente las comunas y tipologías que tienen unidades disponibles, para popular filtros en la UI.

---

## 📝 Notas Importantes

### Tipologías Canónicas

Las tipologías deben estar normalizadas a los siguientes formatos:
- **Studio** o **Estudio**: 0 dormitorios, 1 baño
- **1D1B**: 1 dormitorio, 1 baño
- **2D1B**: 2 dormitorios, 1 baño
- **2D2B**: 2 dormitorios, 2 baños
- **3D2B**: 3 dormitorios, 2 baños

### Valores de Status

El campo `status` puede tener los siguientes valores:
- **`available`**: Disponible para arriendo
- **`reserved`**: Reservada (pero aún no arrendada)
- **`rented`**: Ya arrendada
- **`inactive`**: Inactiva (no disponible por alguna razón)
- **`unknown`**: Estado desconocido (default)

### Campos Calculados

Los campos `precio_desde` y `has_availability` en la tabla `buildings` se calculan automáticamente basándose en las unidades disponibles. Deben actualizarse ejecutando la función `refresh_building_aggregates()`.

### Relación CASCADE

Cuando se elimina un edificio, todas sus unidades se eliminan automáticamente debido a la restricción `ON DELETE CASCADE` en la foreign key.

---

## 🔄 Flujo de Datos

```
1. Ingesta desde AssetPlan CSV
   ↓
2. Validación y normalización (tipologías, comunas, precios)
   ↓
3. Inserción/actualización en buildings y units
   ↓
4. Ejecución de refresh_building_aggregates()
   ↓
5. Actualización de índices y vistas
   ↓
6. Disponible para consultas en API
```

---

## 📚 Referencias

- Schema SQL principal: `_workspace/scripts/sql/core.sql`
- Schemas TypeScript: `schemas/models.ts`
- Verificación de schema v2: `_workspace/scripts/verify-schema-v2.sql`
- Procesador de datos: `lib/supabase-data-processor.ts`



