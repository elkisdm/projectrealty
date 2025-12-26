# 📸 Guía Rápida: Añadir Imágenes al Proyecto con Supabase Storage

**Guía práctica paso a paso para subir y gestionar imágenes usando Supabase Storage.**

---

## ✅ Prerrequisitos

### 1. Variables de Entorno Configuradas

Asegúrate de tener estas variables en tu `.env.local`:

```bash
SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
```

> **⚠️ Importante:** El `SUPABASE_SERVICE_ROLE_KEY` es necesario para subir imágenes. Lo encuentras en:
> Supabase Dashboard → Settings → API → `service_role` key (secret)

### 2. Ejecutar Migración SQL (si no lo has hecho)

Si la tabla `units` no tiene las columnas de imágenes, ejecuta esta migración en Supabase SQL Editor:

```sql
-- Ejecutar en Supabase Dashboard → SQL Editor
ALTER TABLE public.units
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS images_tipologia TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS images_areas_comunes TEXT[] DEFAULT '{}';
```

O ejecuta el archivo completo:
```bash
# El archivo está en: config/supabase/migrations/20250120_add_unit_images.sql
```

---

## 🚀 Paso 1: Crear Buckets en Supabase Storage

### Opción A: Desde el Dashboard (Recomendado)

1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Navega a **Storage** en el menú lateral
3. Click en **New bucket**
4. Crea los siguientes buckets (públicos):

   | Nombre del Bucket | Descripción | Público |
   |-------------------|-------------|---------|
   | `edificios` | Imágenes de edificios (gallery, cover) | ✅ Sí |
   | `unidades` | Imágenes de unidades (interior) | ✅ Sí |
   | `tipologias` | Imágenes de tipologías | ✅ Sí |
   | `areas-comunes` | Imágenes de áreas comunes | ✅ Sí |

5. Para cada bucket:
   - **Name:** El nombre correspondiente (ej: `edificios`)
   - **Public bucket:** ✅ **Marcar como público**
   - **File size limit:** 50 MB (o el límite que necesites)
   - **Allowed MIME types:** `image/jpeg, image/png, image/webp, image/gif`

### Opción B: El Script los Crea Automáticamente

El script de upload creará los buckets automáticamente si no existen (ver Paso 2).

---

## 📤 Paso 2: Subir Imágenes

### Opción A: Script para Estructura de Carpetas (Recomendado)

Si tienes tus imágenes organizadas como `[Nombre del edificio]/Edificio, Estudio, 1D, 2D, 3D`, usa el script:

```bash
# Subir todas las imágenes de un edificio (detecta automáticamente el nombre)
node scripts/upload-building-images.mjs "/Users/macbookpro/Downloads/Guillermo 2632"

# Especificar nombre y slug del edificio
node scripts/upload-building-images.mjs "./Imagenes/Guillermo 2632" --building-name "Guillermo 2632" --building-slug "guillermo-2632"
```

**Este script:**
- ✅ Sube imágenes del edificio a `edificios/{building-slug}/edificio/`
- ✅ Sube imágenes de tipologías a `edificios/{building-slug}/tipologias/{tipologia}/`
- ✅ Actualiza automáticamente `buildings.gallery` y `buildings.cover_image`
- ✅ Actualiza automáticamente `units.images_tipologia` para todas las unidades de cada tipología

### Opción B: Script Genérico

Para casos más específicos, usa el script genérico en `_workspace/scripts/upload-images-to-supabase.mjs`.

#### Ejemplo 1: Subir una imagen para una unidad

```bash
# Subir imagen de una unidad específica
node _workspace/scripts/upload-images-to-supabase.mjs unidades ./images/unit-123.jpg unit-123
```

#### Ejemplo 2: Subir múltiples imágenes de un directorio

```bash
# Subir todas las imágenes de un directorio
node _workspace/scripts/upload-images-to-supabase.mjs unidades ./images/units/unit-123/ unit-123
```

#### Ejemplo 3: Subir y actualizar base de datos automáticamente

```bash
# Subir imágenes y actualizar el campo 'images' de la unidad en la BD
node _workspace/scripts/upload-images-to-supabase.mjs unidades ./images/unit-123.jpg unit-123 --update-db
```

#### Ejemplo 4: Subir imágenes de un edificio

```bash
# Subir galería de un edificio
node _workspace/scripts/upload-images-to-supabase.mjs edificios ./images/buildings/building-456/ building-456 --update-db
```

---

## 📋 Paso 3: Verificar que las Imágenes se Subieron

### Opción A: Desde Supabase Dashboard

1. Ve a **Storage** → Selecciona el bucket (ej: `unidades`)
2. Verifica que las imágenes estén en la carpeta correspondiente (ej: `unit-123/`)
3. Click en una imagen para ver su URL pública

### Opción B: Verificar en la Base de Datos

```sql
-- Ver imágenes de una unidad
SELECT id, images, images_tipologia, images_areas_comunes 
FROM units 
WHERE id = 'unit-123';

-- Ver galería de un edificio
SELECT id, name, gallery, cover_image 
FROM buildings 
WHERE id = 'building-456';
```

---

## 🔧 Paso 4: Actualizar URLs en la Base de Datos (si no usaste --update-db)

### Opción A: SQL Directo

```sql
-- Actualizar imágenes de una unidad
UPDATE units
SET images = ARRAY[
  'https://tu-proyecto.supabase.co/storage/v1/object/public/unidades/unit-123/imagen-1.jpg',
  'https://tu-proyecto.supabase.co/storage/v1/object/public/unidades/unit-123/imagen-2.jpg'
]
WHERE id = 'unit-123';

-- Actualizar galería de un edificio
UPDATE buildings
SET gallery = ARRAY[
  'https://tu-proyecto.supabase.co/storage/v1/object/public/edificios/building-456/gallery-1.jpg',
  'https://tu-proyecto.supabase.co/storage/v1/object/public/edificios/building-456/gallery-2.jpg'
]
WHERE id = 'building-456';

-- Actualizar imagen de portada
UPDATE buildings
SET cover_image = 'https://tu-proyecto.supabase.co/storage/v1/object/public/edificios/building-456/cover.jpg'
WHERE id = 'building-456';
```

### Opción B: Desde el Dashboard

1. Ve a **Table Editor** → Selecciona la tabla (`units` o `buildings`)
2. Busca el registro por ID
3. Edita el campo correspondiente (`images`, `gallery`, `cover_image`)
4. Pega las URLs como array: `["url1", "url2", ...]`

---

## 📁 Estructura Recomendada de Carpetas

### Estructura Estándar (Recomendada)

Organiza tus imágenes siguiendo esta estructura:

```
Imagenes/
└── [Nombre del edificio]/
    ├── Edificio/          → Imágenes del edificio (áreas comunes, fachada)
    ├── Estudio/           → Imágenes de tipología Estudio
    ├── 1D/                → Imágenes de tipología 1D1B
    ├── 2D/                → Imágenes de tipología 2D1B o 2D2B
    └── 3D/                → Imágenes de tipología 3D2B
```

**Ejemplo:**
```
Imagenes/
└── Guillermo 2632/
    ├── Edificio/
    │   ├── img1.jpg
    │   ├── img2.jpg
    │   └── ...
    ├── Estudio/
    │   └── ...
    ├── 1D/
    │   └── ...
    └── 2D/
        └── ...
```

### Estructura Alternativa (Para casos específicos)

Si necesitas más control, puedes usar esta estructura:

```
./images/
├── units/
│   ├── unit-123/
│   │   ├── interior-1.jpg
│   │   └── interior-2.jpg
│   └── unit-456/
├── buildings/
│   ├── building-456/
│   │   ├── cover.jpg
│   │   └── gallery/
│   └── ...
└── tipologias/
    └── ...
```

---

## 🎯 Casos de Uso Comunes

### Caso 1: Añadir imágenes a una unidad nueva

```bash
# 1. Subir imágenes
node _workspace/scripts/upload-images-to-supabase.mjs unidades ./images/units/unit-789/ unit-789 --update-db

# 2. Verificar en Supabase Dashboard que las URLs se actualizaron
```

### Caso 2: Añadir imágenes de tipología

```bash
# Subir imágenes de tipología para un edificio
node _workspace/scripts/upload-images-to-supabase.mjs tipologias ./images/tipologias/building-456/1D1B/ building-456-1D1B
```

Luego actualizar manualmente en la BD:

```sql
UPDATE units
SET images_tipologia = ARRAY[
  'https://tu-proyecto.supabase.co/storage/v1/object/public/tipologias/building-456-1D1B/tipologia-1.jpg'
]
WHERE building_id = 'building-456' AND tipologia = '1D1B';
```

### Caso 3: Batch upload de múltiples unidades

```bash
# Script para subir imágenes de múltiples unidades
for unit_dir in ./images/units/*/; do
  unit_id=$(basename "$unit_dir")
  echo "📤 Subiendo imágenes para unidad: $unit_id"
  node _workspace/scripts/upload-images-to-supabase.mjs unidades "$unit_dir" "$unit_id" --update-db
done
```

---

## ⚠️ Consideraciones Importantes

### Optimización de Imágenes

Antes de subir, considera:

1. **Comprimir imágenes** (usa [TinyPNG](https://tinypng.com/) o similar)
2. **Convertir a WebP** cuando sea posible (mejor compresión)
3. **Redimensionar** a tamaños razonables (max 2000px ancho)
4. **Peso recomendado:** < 500KB por imagen

### Límites de Supabase

- **Plan Gratuito:** 1GB de almacenamiento
- **Plan Pro:** 100GB incluido
- **Tamaño máximo por archivo:** Configurable en el bucket (recomendado: 50MB)

### Seguridad

- ✅ Buckets públicos solo para imágenes que deben ser públicas
- ✅ Usa buckets privados para imágenes sensibles
- ✅ Valida tipos MIME en el servidor (el script lo hace)
- ✅ Limita tamaño de archivos en el bucket

---

## 🐛 Troubleshooting

### Error: "Bucket not found"

**Solución:**
- El script intenta crear el bucket automáticamente
- Si falla, créalo manualmente desde el Dashboard
- Verifica que tengas permisos con `SUPABASE_SERVICE_ROLE_KEY`

### Error: "new row violates row-level security policy"

**Solución:**
- Asegúrate de usar `SUPABASE_SERVICE_ROLE_KEY` (no la anon key)
- O ajusta las políticas RLS en Supabase Dashboard → Storage → Policies

### Error: "File size exceeds limit"

**Solución:**
- Comprime la imagen antes de subirla
- O aumenta el límite en el bucket (Dashboard → Storage → Bucket → Settings)

### Las imágenes no se muestran en el frontend

**Verifica:**
1. ✅ Que el bucket sea público
2. ✅ Que las URLs en la BD sean correctas
3. ✅ Que las URLs tengan el formato correcto:
   ```
   https://{project-ref}.supabase.co/storage/v1/object/public/{bucket}/{path}
   ```
4. ✅ Que no haya problemas de CORS (si accedes desde otro dominio)

---

## 📚 Referencias

- **Documentación completa:** `docs/GUIA_IMAGENES_SUPABASE.md`
- **Script de upload:** `_workspace/scripts/upload-images-to-supabase.mjs`
- **Migración SQL:** `config/supabase/migrations/20250120_add_unit_images.sql`
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Supabase Storage API](https://supabase.com/docs/reference/javascript/storage)

---

## ✅ Checklist Rápido

- [ ] Variables de entorno configuradas (`SUPABASE_SERVICE_ROLE_KEY`)
- [ ] Migración SQL ejecutada (si es necesario)
- [ ] Buckets creados en Supabase Storage (o el script los creará)
- [ ] Imágenes organizadas localmente
- [ ] Script de upload ejecutado
- [ ] URLs verificadas en la base de datos
- [ ] Imágenes visibles en el frontend

---

**¿Necesitas ayuda?** Revisa la documentación completa en `docs/GUIA_IMAGENES_SUPABASE.md` o `docs/SUPABASE_STORAGE_IMAGES.md`.
