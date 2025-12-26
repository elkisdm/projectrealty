# 📤 Guía: Subir Imágenes a Supabase Storage

Esta guía explica cómo subir imágenes a Supabase Storage y actualizar las URLs en la base de datos.

## 📋 Prerrequisitos

1. **Variables de entorno configuradas:**
   ```bash
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. **Bucket creado en Supabase:**
   - Ve a Supabase Dashboard → Storage
   - Crea un bucket (ej: `properties`, `units`, `buildings`)
   - Marca como público si quieres URLs públicas

## 🚀 Uso del Script

### Opción 1: Subir una imagen

```bash
# Subir imagen a bucket 'properties' para una unidad específica
node _workspace/scripts/upload-images-to-supabase.mjs properties ./images/unit-123.jpg unit-123
```

### Opción 2: Subir múltiples imágenes de un directorio

```bash
# Subir todas las imágenes de un directorio
node _workspace/scripts/upload-images-to-supabase.mjs properties ./images/units/
```

### Opción 3: Subir y actualizar base de datos automáticamente

```bash
# Subir imagen y actualizar el campo 'images' de la unidad en la BD
node _workspace/scripts/upload-images-to-supabase.mjs units ./images/unit-123.jpg unit-123 --update-db
```

## 📁 Estructura en Storage

El script organiza las imágenes de esta forma:

```
bucket-name/
  ├── unit-123/
  │   ├── image1.jpg
  │   ├── image2.jpg
  │   └── image3.jpg
  ├── unit-456/
  │   └── image1.jpg
  └── standalone-image.jpg  (si no se proporciona entity-id)
```

## 🔄 Actualizar URLs en Base de Datos

### Opción A: Usar el script con --update-db

El script puede actualizar automáticamente:
- Unidades: Campo `images` en tabla `units`
- Edificios: Campo `gallery` en tabla `buildings`

### Opción B: Actualizar manualmente con SQL

```sql
-- Actualizar imágenes de una unidad
UPDATE units 
SET images = ARRAY[
  'https://your-project.supabase.co/storage/v1/object/public/properties/unit-123/image1.jpg',
  'https://your-project.supabase.co/storage/v1/object/public/properties/unit-123/image2.jpg'
]
WHERE id = 'unit-123';

-- Actualizar galería de un edificio
UPDATE buildings 
SET gallery = ARRAY[
  'https://your-project.supabase.co/storage/v1/object/public/properties/building-123/image1.jpg',
  'https://your-project.supabase.co/storage/v1/object/public/properties/building-123/image2.jpg'
]
WHERE id = 'building-123';
```

### Opción C: Usar Supabase Dashboard

1. Ve a Supabase Dashboard → Table Editor
2. Selecciona la tabla (`units` o `buildings`)
3. Edita el registro y actualiza el array de URLs

## 📝 Ejemplos Completos

### Ejemplo 1: Subir imágenes para una unidad nueva

```bash
# 1. Subir imágenes
node _workspace/scripts/upload-images-to-supabase.mjs units ./images/unit-789/ unit-789 --update-db

# 2. Verificar en Supabase Dashboard que las URLs se actualizaron
```

### Ejemplo 2: Subir imágenes sin actualizar BD (solo storage)

```bash
# Subir imágenes al storage sin tocar la BD
node _workspace/scripts/upload-images-to-supabase.mjs properties ./images/temp-images/
```

### Ejemplo 3: Batch upload de múltiples unidades

```bash
# Script para subir imágenes de múltiples unidades
for unit_dir in ./images/units/*/; do
  unit_id=$(basename "$unit_dir")
  echo "Subiendo imágenes para unidad: $unit_id"
  node _workspace/scripts/upload-images-to-supabase.mjs units "$unit_dir" "$unit_id" --update-db
done
```

## ⚙️ Configuración de Buckets

### Crear bucket en Supabase Dashboard

1. Ve a **Storage** en el dashboard
2. Click en **New bucket**
3. Nombre: `properties` (o el que prefieras)
4. Marca **Public bucket** si quieres URLs públicas
5. **File size limit**: 50 MB (o el límite que necesites)
6. **Allowed MIME types**: 
   - `image/jpeg`
   - `image/png`
   - `image/webp`
   - `image/gif`

### El script crea el bucket automáticamente

Si el bucket no existe, el script intentará crearlo automáticamente.

## 🔐 Permisos y Seguridad

### Para desarrollo/testing:
- Usa `SUPABASE_SERVICE_ROLE_KEY` (tiene todos los permisos)
- Buckets pueden ser públicos

### Para producción:
- Considera buckets privados para imágenes sensibles
- Usa políticas de Storage para controlar acceso
- Valida tipos de archivo y tamaños en el servidor

## 📊 Formatos de URL

Después de subir, las URLs se ven así:

```
# URL pública (bucket público)
https://your-project.supabase.co/storage/v1/object/public/properties/unit-123/image.jpg

# URL con signed URL (bucket privado, con expiración)
https://your-project.supabase.co/storage/v1/object/sign/properties/unit-123/image.jpg?token=...
```

## 🐛 Troubleshooting

### Error: "Bucket not found"
- El bucket no existe. El script intenta crearlo, pero verifica permisos.

### Error: "new row violates row-level security policy"
- Necesitas usar `SUPABASE_SERVICE_ROLE_KEY` en lugar de la anon key
- O ajustar las políticas RLS en Supabase

### Error: "File size exceeds limit"
- El archivo es muy grande. Aumenta el límite en el bucket o comprime la imagen.

### Las imágenes no se muestran
- Verifica que el bucket es público
- Verifica que las URLs en la BD son correctas
- Verifica permisos del bucket

## 🔗 Enlaces Útiles

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Supabase Storage API](https://supabase.com/docs/reference/javascript/storage-from-upload)
- [Storage Policies](https://supabase.com/docs/guides/storage/security/access-control)

