# 📦 Buckets de Storage en Supabase

Esta guía explica los buckets de Storage configurados para almacenar imágenes y videos de unidades y edificios.

## 🚀 Creación de Buckets

### Opción 1: Crear desde Supabase Dashboard (Recomendado)

1. Ve a **Supabase Dashboard** → **Storage**
2. Click en **New bucket**
3. Crea los siguientes buckets con estas configuraciones:

#### Bucket `unit-media`
- **Nombre:** `unit-media`
- **Public bucket:** ✅ Sí (marcar)
- **File size limit:** `100 MB`
- **Allowed MIME types:** 
  - `image/jpeg`
  - `image/png`
  - `image/webp`
  - `image/gif`
  - `video/mp4`
  - `video/webm`
  - `video/quicktime` (.mov)
  - `video/x-msvideo` (.avi)

#### Bucket `building-media`
- **Nombre:** `building-media`
- **Public bucket:** ✅ Sí (marcar)
- **File size limit:** `50 MB`
- **Allowed MIME types:**
  - `image/jpeg`
  - `image/png`
  - `image/webp`
  - `image/gif`

4. Después de crear los buckets, ejecuta el script de políticas RLS:
   - Archivo: `config/supabase/migrations/20250206_create_storage_buckets_manual.sql`
   - Este script crea las políticas de acceso público y permisos para service_role

### Opción 2: Crear vía API (con service_role)

Si tienes acceso a `SUPABASE_SERVICE_ROLE_KEY`, puedes crear los buckets programáticamente:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key
);

// Crear bucket unit-media
await supabase.storage.createBucket('unit-media', {
  public: true,
  fileSizeLimit: 104857600, // 100 MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo'
  ]
});

// Crear bucket building-media
await supabase.storage.createBucket('building-media', {
  public: true,
  fileSizeLimit: 52428800, // 50 MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
});
```

### Opción 3: Ejecutar migración SQL completa (requiere permisos de propietario)

Si ejecutas la migración completa `20250206_create_storage_buckets.sql` con permisos de service_role, los buckets se crearán automáticamente.

## 🪣 Buckets Disponibles

### 1. `unit-media` - Medios de Unidades

**Propósito:** Almacenar imágenes y videos de unidades individuales.

**Configuración:**
- **Público:** Sí (acceso directo vía URL)
- **Límite de tamaño:** 100 MB por archivo
- **Tipos MIME permitidos:**
  - Imágenes: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
  - Videos: `video/mp4`, `video/webm`, `video/quicktime` (.mov), `video/x-msvideo` (.avi)

**Estructura recomendada:**
```
unit-media/
  ├── {building_id}/
  │   ├── {unit_id}/
  │   │   ├── images/
  │   │   │   ├── IMG_4922.jpg
  │   │   │   ├── IMG_4923.jpg
  │   │   │   └── ...
  │   │   └── videos/
  │   │       ├── tour-virtual.mp4
  │   │       └── ...
```

**Ejemplo de path:**
```
unit-media/bld-condominio-parque-mackenna/unit-305/images/IMG_4922.jpg
unit-media/bld-condominio-parque-mackenna/unit-305/videos/tour-virtual.mp4
```

**URL pública generada:**
```
https://{project-id}.supabase.co/storage/v1/object/public/unit-media/{building_id}/{unit_id}/images/IMG_4922.jpg
```

### 2. `building-media` - Medios de Edificios

**Propósito:** Almacenar imágenes de edificios (galerías, cover images, áreas comunes).

**Configuración:**
- **Público:** Sí (acceso directo vía URL)
- **Límite de tamaño:** 50 MB por archivo
- **Tipos MIME permitidos:**
  - Imágenes: `image/jpeg`, `image/png`, `image/webp`, `image/gif`

**Estructura recomendada:**
```
building-media/
  ├── {building_id}/
  │   ├── gallery/
  │   │   ├── imagen1.jpg
  │   │   ├── imagen2.jpg
  │   │   └── ...
  │   └── cover.jpg
```

**Ejemplo de path:**
```
building-media/bld-condominio-parque-mackenna/gallery/imagen1.jpg
building-media/bld-condominio-parque-mackenna/cover.jpg
```

## 📤 Cómo Subir Archivos

### Opción 1: Supabase Dashboard

1. Ve a **Storage** → Selecciona el bucket (`unit-media` o `building-media`)
2. Click en **Upload file** o arrastra archivos
3. Crea la estructura de carpetas manualmente si es necesario
4. Copia la URL pública generada

### Opción 2: Supabase Storage API (JavaScript/TypeScript)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Usar service role para uploads
);

// Subir imagen de unidad
const { data, error } = await supabase.storage
  .from('unit-media')
  .upload(
    `bld-condominio-parque-mackenna/unit-305/images/IMG_4922.jpg`,
    file,
    {
      contentType: 'image/jpeg',
      upsert: true // Reemplazar si existe
    }
  );

if (data) {
  const { data: { publicUrl } } = supabase.storage
    .from('unit-media')
    .getPublicUrl(data.path);
  
  console.log('URL pública:', publicUrl);
}

// Subir video de unidad
const { data: videoData, error: videoError } = await supabase.storage
  .from('unit-media')
  .upload(
    `bld-condominio-parque-mackenna/unit-305/videos/tour-virtual.mp4`,
    videoFile,
    {
      contentType: 'video/mp4',
      upsert: true
    }
  );
```

### Opción 3: cURL / API REST

```bash
# Subir imagen
curl -X POST \
  'https://{project-id}.supabase.co/storage/v1/object/unit-media/bld-123/unit-456/images/foto.jpg' \
  -H 'Authorization: Bearer {service-role-key}' \
  -H 'Content-Type: image/jpeg' \
  --data-binary '@foto.jpg'

# Obtener URL pública
curl 'https://{project-id}.supabase.co/storage/v1/object/public/unit-media/bld-123/unit-456/images/foto.jpg'
```

## 🔄 Actualizar URLs en Base de Datos

Después de subir archivos, actualiza los arrays en las tablas:

### Para Unidades (images, videos)

```sql
-- Actualizar imágenes de una unidad
UPDATE units 
SET images = ARRAY[
  'https://{project-id}.supabase.co/storage/v1/object/public/unit-media/bld-123/unit-456/images/IMG_4922.jpg',
  'https://{project-id}.supabase.co/storage/v1/object/public/unit-media/bld-123/unit-456/images/IMG_4923.jpg'
]
WHERE id = 'unit-456';

-- Actualizar videos de una unidad
UPDATE units 
SET videos = ARRAY[
  'https://{project-id}.supabase.co/storage/v1/object/public/unit-media/bld-123/unit-456/videos/tour-virtual.mp4'
]
WHERE id = 'unit-456';
```

### Para Edificios (gallery, cover_image)

```sql
-- Actualizar galería de un edificio
UPDATE buildings 
SET gallery = ARRAY[
  'https://{project-id}.supabase.co/storage/v1/object/public/building-media/bld-123/gallery/imagen1.jpg',
  'https://{project-id}.supabase.co/storage/v1/object/public/building-media/bld-123/gallery/imagen2.jpg'
]
WHERE id = 'bld-123';

-- Actualizar cover image
UPDATE buildings 
SET cover_image = 'https://{project-id}.supabase.co/storage/v1/object/public/building-media/bld-123/cover.jpg'
WHERE id = 'bld-123';
```

## 🔐 Permisos y Seguridad

### Políticas RLS Configuradas

- **Lectura (SELECT):** Público - cualquier usuario puede leer archivos
- **Escritura (INSERT/UPDATE/DELETE):** Solo `service_role` - requiere autenticación con service role key

### Para Desarrollo

Usa `SUPABASE_SERVICE_ROLE_KEY` en scripts y backend para subir archivos.

### Para Producción

- Los buckets son públicos para facilitar el acceso a medios
- Las políticas RLS previenen que usuarios anónimos suban archivos
- Considera buckets privados si necesitas contenido sensible

## 📝 Ejemplo Completo: Subir Imágenes y Videos de una Unidad

```typescript
async function uploadUnitMedia(
  buildingId: string,
  unitId: string,
  images: File[],
  videos: File[]
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const imageUrls: string[] = [];
  const videoUrls: string[] = [];

  // Subir imágenes
  for (let i = 0; i < images.length; i++) {
    const file = images[i];
    const path = `${buildingId}/${unitId}/images/${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('unit-media')
      .upload(path, file, { upsert: true });
    
    if (data) {
      const { data: { publicUrl } } = supabase.storage
        .from('unit-media')
        .getPublicUrl(data.path);
      imageUrls.push(publicUrl);
    }
  }

  // Subir videos
  for (let i = 0; i < videos.length; i++) {
    const file = videos[i];
    const path = `${buildingId}/${unitId}/videos/${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('unit-media')
      .upload(path, file, { upsert: true });
    
    if (data) {
      const { data: { publicUrl } } = supabase.storage
        .from('unit-media')
        .getPublicUrl(data.path);
      videoUrls.push(publicUrl);
    }
  }

  // Actualizar base de datos
  await supabase
    .from('units')
    .update({
      images: imageUrls,
      videos: videoUrls
    })
    .eq('id', unitId);

  return { imageUrls, videoUrls };
}
```

## 🐛 Troubleshooting

### Error: "Bucket not found"
- Ejecuta la migración `20250206_create_storage_buckets.sql` en Supabase
- Verifica que el bucket existe en Storage → Buckets

### Error: "new row violates row-level security policy"
- Usa `SUPABASE_SERVICE_ROLE_KEY` para uploads (no la anon key)
- Verifica que las políticas RLS están creadas correctamente

### Error: "File size exceeds limit"
- Imágenes: máximo 50 MB (building-media) o 100 MB (unit-media)
- Videos: máximo 100 MB (unit-media)
- Comprime archivos grandes antes de subir

### Error: "Invalid MIME type"
- Verifica que el tipo de archivo está en `allowed_mime_types`
- Para videos, usa `.mp4`, `.webm`, `.mov`, o `.avi`

## 🔗 Enlaces Útiles

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Storage API Reference](https://supabase.com/docs/reference/javascript/storage-from-upload)
- [Storage Policies](https://supabase.com/docs/guides/storage/security/access-control)
