# 📐 Lógica de Base de Datos para Imágenes

**Especificación completa de cómo se almacenan y organizan las imágenes en Supabase Storage y Base de Datos.**

---

## 🎯 Principios de Diseño

### 1. **Reutilización de Imágenes de Tipología**
- Las imágenes de tipología (1D, 2D, Estudio, 3D) se **reutilizan** para todas las unidades del mismo número de habitaciones
- No se duplican imágenes por unidad individual
- Una unidad hereda automáticamente las imágenes de su tipología

### 2. **Estructura de Carpetas Local**
```
Imagenes/
└── [Nombre del edificio]/
    ├── Edificio/          → Imágenes del edificio y áreas comunes
    ├── Estudio/           → Imágenes de tipología Estudio
    ├── 1D/                → Imágenes de tipología 1D1B
    ├── 2D/                → Imágenes de tipología 2D1B o 2D2B
    └── 3D/                → Imágenes de tipología 3D2B
```

### 3. **Estructura en Supabase Storage**
```
edificios/
└── {building-slug}/
    ├── edificio/          → Imágenes del edificio (áreas comunes, fachada, etc.)
    └── tipologias/
        ├── Estudio/       → Imágenes de tipología Estudio
        ├── 1D1B/          → Imágenes de tipología 1D1B
        ├── 2D1B/          → Imágenes de tipología 2D1B
        ├── 2D2B/          → Imágenes de tipología 2D2B
        └── 3D2B/          → Imágenes de tipología 3D2B
```

---

## 📊 Estructura de Base de Datos

### Tabla: `buildings`

| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| `id` | `TEXT` | ID único del edificio | `"guillermo-2632"` |
| `slug` | `TEXT` | Slug del edificio (normalizado) | `"guillermo-2632"` |
| `name` | `TEXT` | Nombre del edificio | `"Guillermo 2632"` |
| `gallery` | `TEXT[]` | Array de URLs de imágenes del edificio | `["https://.../edificio/img1.jpg", ...]` |
| `cover_image` | `TEXT` | URL de la imagen de portada (primera de gallery) | `"https://.../edificio/img1.jpg"` |

**Lógica:**
- `gallery` contiene todas las imágenes de la carpeta `Edificio/`
- `cover_image` es la primera imagen de `gallery` (se actualiza automáticamente)
- Estas imágenes se muestran en todas las unidades del edificio

### Tabla: `units`

| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| `id` | `TEXT` | ID único de la unidad | `"unit-123"` |
| `building_id` | `TEXT` | ID del edificio al que pertenece | `"guillermo-2632"` |
| `tipologia` | `TEXT` | Tipología de la unidad | `"1D1B"`, `"2D2B"`, `"Estudio"` |
| `images` | `TEXT[]` | **Opcional:** Imágenes específicas de esta unidad | `[]` (vacío por defecto) |
| `images_tipologia` | `TEXT[]` | URLs de imágenes de la tipología (heredadas) | `["https://.../tipologias/1D1B/img1.jpg", ...]` |
| `images_areas_comunes` | `TEXT[]` | **Opcional:** Subconjunto de imágenes del edificio | `[]` (vacío por defecto) |

**Lógica:**
- `images_tipologia`: Se llena automáticamente con las imágenes de `edificios/{building-slug}/tipologias/{tipologia}/`
- `images`: Solo se usa si hay imágenes específicas de esa unidad (raro, pero posible)
- `images_areas_comunes`: Opcional, si se quiere mostrar solo algunas imágenes del edificio para esta unidad

---

## 🔄 Mapeo de Tipologías

### Mapeo de Carpetas Locales → Tipologías en BD

| Carpeta Local | Tipología en BD | Descripción |
|---------------|-----------------|-------------|
| `Estudio/` | `"Estudio"` o `"Studio"` | Estudio (0 dormitorios) |
| `1D/` | `"1D1B"` | 1 Dormitorio, 1 Baño |
| `2D/` | `"2D1B"` o `"2D2B"` | 2 Dormitorios (1 o 2 baños) |
| `3D/` | `"3D2B"` | 3 Dormitorios, 2 Baños |

**Nota:** Si una carpeta `2D/` contiene imágenes para múltiples variantes (2D1B y 2D2B), se pueden duplicar las URLs en ambas tipologías o crear subcarpetas.

### Normalización de Nombres

El script de upload normaliza los nombres:
- `"Estudio"` → `"Estudio"` o `"Studio"` (según configuración)
- `"1D"` → `"1D1B"`
- `"2D"` → Se mapea a `"2D1B"` o `"2D2B"` según la unidad específica
- `"3D"` → `"3D2B"`

---

## 🖼️ Lógica de Visualización en Página de Propiedad

### Orden de Prioridad (según `PropertyGalleryGrid.tsx`)

La galería combina imágenes en este orden:

1. **`unit.images`** (Prioridad 1)
   - Imágenes específicas de la unidad (si existen)
   - Raro, solo para casos especiales

2. **`unit.images_tipologia`** (Prioridad 2) ⭐ **PRINCIPAL**
   - Imágenes de la tipología (heredadas)
   - Se obtienen de `edificios/{building-slug}/tipologias/{tipologia}/`

3. **`unit.images_areas_comunes`** (Prioridad 3)
   - Subconjunto de imágenes del edificio (opcional)
   - Si está vacío, se usa `building.gallery`

4. **`building.gallery`** (Prioridad 4)
   - Imágenes del edificio (áreas comunes, fachada, etc.)
   - Se obtienen de `edificios/{building-slug}/edificio/`

5. **`building.cover_image`** (Fallback)
   - Si no hay ninguna imagen, se usa la portada

### Resultado Final

Para una unidad típica, la galería mostrará:
```
[Imágenes de Tipología] + [Imágenes del Edificio]
```

**Ejemplo:**
- Unidad 1D1B en "Guillermo 2632"
- Galería: `images_tipologia` (1D1B) + `building.gallery` (Edificio)

---

## 📤 Proceso de Upload

### Paso 1: Organizar Imágenes Localmente

```
Imagenes/Guillermo 2632/
├── Edificio/
│   ├── img1.jpg
│   ├── img2.jpg
│   └── ...
├── Estudio/
│   ├── img1.jpg
│   └── ...
├── 1D/
│   ├── img1.jpg
│   └── ...
└── 2D/
    ├── img1.jpg
    └── ...
```

### Paso 2: Subir a Supabase Storage

El script organiza automáticamente:

```bash
# Subir imágenes del edificio
node scripts/upload-building-images.mjs "Guillermo 2632" ./Imagenes/Guillermo\ 2632/Edificio/

# Subir imágenes de tipologías
node scripts/upload-building-images.mjs "Guillermo 2632" ./Imagenes/Guillermo\ 2632/1D/ --tipologia 1D1B
node scripts/upload-building-images.mjs "Guillermo 2632" ./Imagenes/Guillermo\ 2632/2D/ --tipologia 2D1B
```

### Paso 3: Actualizar Base de Datos

#### Para el Edificio:
```sql
UPDATE buildings
SET 
  gallery = ARRAY[
    'https://.../edificios/guillermo-2632/edificio/img1.jpg',
    'https://.../edificios/guillermo-2632/edificio/img2.jpg',
    ...
  ],
  cover_image = 'https://.../edificios/guillermo-2632/edificio/img1.jpg'
WHERE slug = 'guillermo-2632';
```

#### Para las Unidades:
```sql
-- Actualizar todas las unidades de tipología 1D1B
UPDATE units
SET images_tipologia = ARRAY[
  'https://.../edificios/guillermo-2632/tipologias/1D1B/img1.jpg',
  'https://.../edificios/guillermo-2632/tipologias/1D1B/img2.jpg',
  ...
]
WHERE building_id = 'guillermo-2632' AND tipologia = '1D1B';

-- Repetir para cada tipología
```

---

## 🔧 Funciones Helper (a implementar)

### Función: Obtener imágenes de tipología para un edificio

```typescript
/**
 * Obtiene las URLs de imágenes de una tipología para un edificio
 */
async function getTipologiaImages(
  buildingSlug: string,
  tipologia: string
): Promise<string[]> {
  // Leer desde Supabase Storage: edificios/{building-slug}/tipologias/{tipologia}/
  // Retornar array de URLs públicas
}
```

### Función: Actualizar imágenes de tipología para todas las unidades

```typescript
/**
 * Actualiza images_tipologia para todas las unidades de una tipología en un edificio
 */
async function updateTipologiaImagesForAllUnits(
  buildingId: string,
  tipologia: string,
  imageUrls: string[]
): Promise<void> {
  // UPDATE units SET images_tipologia = $1 
  // WHERE building_id = $2 AND tipologia = $3
}
```

### Función: Heredar imágenes de tipología al crear una unidad

```typescript
/**
 * Al crear una unidad, hereda automáticamente las imágenes de su tipología
 */
async function inheritTipologiaImages(
  unitId: string,
  buildingId: string,
  tipologia: string
): Promise<void> {
  const tipologiaImages = await getTipologiaImages(buildingId, tipologia);
  // UPDATE units SET images_tipologia = $1 WHERE id = $2
}
```

---

## 📋 Checklist de Implementación

### Base de Datos
- [x] Migración SQL ejecutada (`20250120_add_unit_images.sql`)
- [x] Columnas `images_tipologia` y `images_areas_comunes` en tabla `units`
- [x] Columnas `gallery` y `cover_image` en tabla `buildings`

### Supabase Storage
- [ ] Bucket `edificios` creado (público)
- [ ] Estructura de carpetas: `{building-slug}/edificio/` y `{building-slug}/tipologias/{tipologia}/`
- [ ] Políticas RLS configuradas (lectura pública)

### Scripts
- [ ] Script de upload actualizado para manejar estructura de carpetas
- [ ] Script para actualizar BD automáticamente después del upload
- [ ] Función helper para heredar imágenes de tipología

### Frontend
- [x] `PropertyGalleryGrid` ya combina imágenes correctamente
- [ ] Verificar que se muestran `images_tipologia` + `building.gallery`

---

## 🎯 Casos de Uso

### Caso 1: Nuevo Edificio con Imágenes

1. Organizar imágenes localmente según estructura
2. Ejecutar script de upload para cada carpeta
3. Script actualiza automáticamente:
   - `buildings.gallery` y `buildings.cover_image`
   - `units.images_tipologia` para todas las unidades de cada tipología

### Caso 2: Nueva Unidad en Edificio Existente

1. Al crear la unidad, hereda automáticamente `images_tipologia` de su tipología
2. Si hay imágenes específicas, se agregan a `images` (opcional)

### Caso 3: Actualizar Imágenes de Tipología

1. Subir nuevas imágenes a `edificios/{building-slug}/tipologias/{tipologia}/`
2. Actualizar `units.images_tipologia` para todas las unidades de esa tipología

### Caso 4: Imágenes Específicas de Unidad

1. Subir imágenes a `edificios/{building-slug}/unidades/{unit-id}/` (opcional)
2. Actualizar `units.images` solo para esa unidad
3. Estas imágenes tienen prioridad sobre las de tipología

---

## ⚠️ Consideraciones Importantes

### Normalización de Nombres

- Los nombres de carpetas locales (`1D`, `2D`) deben mapearse a tipologías canónicas (`1D1B`, `2D1B`, `2D2B`)
- El script debe manejar variantes (ej: `2D` puede ser `2D1B` o `2D2B`)

### Reutilización

- **No duplicar imágenes:** Las imágenes de tipología se almacenan una vez y se referencian desde múltiples unidades
- **Actualización en cascada:** Si se actualizan imágenes de tipología, todas las unidades se actualizan automáticamente

### Performance

- Las URLs se almacenan en arrays en la BD (no se consulta Storage en cada request)
- Si se actualiza Storage, se debe actualizar la BD manualmente o con script

---

## 📚 Referencias

- **Migración SQL:** `config/supabase/migrations/20250120_add_unit_images.sql`
- **Componente de Galería:** `components/property/PropertyGalleryGrid.tsx`
- **Script de Upload:** `_workspace/scripts/upload-images-to-supabase.mjs` (a actualizar)
- **Guía de Upload:** `docs/GUIA_RAPIDA_IMAGENES.md`

---

**Última actualización:** Enero 2025
