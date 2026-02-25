# 📤 Guía: Subir Fotos y Video para Unidad 305 - Parque Mackenna

## 📋 Pasos Previos

1. ✅ Ejecutar script de creación de carpetas: `setup-unit-305-folders.sql`
2. ✅ Verificar que el bucket `unit-media` existe en Supabase Dashboard → Storage

## 🖼️ Subir Fotos

### Opción 1: Supabase Dashboard (Más Fácil)

1. Ve a **Supabase Dashboard** → **Storage** → **unit-media**
2. Navega a: `bld-condominio-parque-mackenna/bld-condominio-parque-mackenna-305/images/`
3. Click en **Upload file** o arrastra las fotos
4. Sube todas las imágenes (IMG_4922.jpg, IMG_4923.jpg, etc.)
5. Después de subir, copia las URLs públicas generadas

### Opción 2: Script Node.js (Automático)

Crea un archivo `upload-unit-305.mjs`:

```javascript
import { createClient } from '@supabase/supabase-js';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUILDING_ID = 'bld-condominio-parque-mackenna';
const UNIT_ID = 'bld-condominio-parque-mackenna-305'; // ID real de la unidad
const IMAGES_DIR = './images/parque-mackenna-305'; // Ruta a tus imágenes
const VIDEO_PATH = './videos/unit-305-tour.mp4'; // Ruta a tu video

async function uploadImages() {
  const files = await readdir(IMAGES_DIR);
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
  const imageUrls = [];

  for (const file of imageFiles) {
    const filePath = join(IMAGES_DIR, file);
    const fileBuffer = await readFile(filePath);
    const storagePath = `${BUILDING_ID}/${UNIT_ID}/images/${file}`;

    const { data, error } = await supabase.storage
      .from('unit-media')
      .upload(storagePath, fileBuffer, {
        contentType: `image/${file.split('.').pop()}`,
        upsert: true
      });

    if (error) {
      console.error(`Error subiendo ${file}:`, error);
      continue;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('unit-media')
      .getPublicUrl(data.path);
    
    imageUrls.push(publicUrl);
    console.log(`✅ ${file} → ${publicUrl}`);
  }

  return imageUrls;
}

async function uploadVideo() {
  const videoBuffer = await readFile(VIDEO_PATH);
  const fileName = VIDEO_PATH.split('/').pop();
  const storagePath = `${BUILDING_ID}/${UNIT_ID}/videos/${fileName}`;

  const { data, error } = await supabase.storage
    .from('unit-media')
    .upload(storagePath, videoBuffer, {
      contentType: 'video/mp4',
      upsert: true
    });

  if (error) {
    console.error('Error subiendo video:', error);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('unit-media')
    .getPublicUrl(data.path);
  
  console.log(`✅ Video → ${publicUrl}`);
  return publicUrl;
}

async function updateDatabase(imageUrls, videoUrl) {
  // Actualizar campo images
  const { error: imagesError } = await supabase
    .from('units')
    .update({ images: imageUrls })
    .eq('id', UNIT_ID);

  if (imagesError) {
    console.error('Error actualizando images:', imagesError);
  } else {
    console.log('✅ Campo images actualizado en BD');
  }

  // Actualizar campo videos
  if (videoUrl) {
    const { error: videosError } = await supabase
      .from('units')
      .update({ videos: [videoUrl] })
      .eq('id', UNIT_ID);

    if (videosError) {
      console.error('Error actualizando videos:', videosError);
    } else {
      console.log('✅ Campo videos actualizado en BD');
    }
  }
}

// Ejecutar
(async () => {
  console.log('📤 Subiendo imágenes...');
  const imageUrls = await uploadImages();
  
  console.log('\n📤 Subiendo video...');
  const videoUrl = await uploadVideo();
  
  console.log('\n💾 Actualizando base de datos...');
  await updateDatabase(imageUrls, videoUrl);
  
  console.log('\n✅ ¡Completado!');
})();
```

Ejecutar:
```bash
node upload-unit-305.mjs
```

## 🎥 Subir Video

### Desde Dashboard:
1. Ve a **Storage** → **unit-media** → `bld-condominio-parque-mackenna/bld-condominio-parque-mackenna-305/videos/`
2. Click en **Upload file**
3. Selecciona tu video (máximo 100 MB)
4. Copia la URL pública generada

## 💾 Actualizar Base de Datos

Después de subir los archivos, actualiza la unidad en la base de datos:

```sql
-- Actualizar imágenes de unidad 305
-- Unit ID: bld-condominio-parque-mackenna-305
UPDATE units 
SET images = ARRAY[
  'https://{project-id}.supabase.co/storage/v1/object/public/unit-media/bld-condominio-parque-mackenna/bld-condominio-parque-mackenna-305/images/IMG_4922.jpg',
  'https://{project-id}.supabase.co/storage/v1/object/public/unit-media/bld-condominio-parque-mackenna/bld-condominio-parque-mackenna-305/images/IMG_4923.jpg',
  'https://{project-id}.supabase.co/storage/v1/object/public/unit-media/bld-condominio-parque-mackenna/bld-condominio-parque-mackenna-305/images/IMG_4924.jpg',
  -- ... agrega todas las URLs de tus imágenes
],
videos = ARRAY[
  'https://{project-id}.supabase.co/storage/v1/object/public/unit-media/bld-condominio-parque-mackenna/bld-condominio-parque-mackenna-305/videos/tour-virtual.mp4'
]
WHERE id = 'bld-condominio-parque-mackenna-305';
```

## 📝 Estructura Final Esperada

```
unit-media/
  └── bld-condominio-parque-mackenna/
      └── bld-condominio-parque-mackenna-305/
          ├── images/
          │   ├── IMG_4922.jpg
          │   ├── IMG_4923.jpg
          │   ├── IMG_4924.jpg
          │   └── ... (todas tus fotos)
          └── videos/
              └── tour-virtual.mp4 (o el nombre de tu video)
```

## 🔍 Verificar URLs Generadas

Después de subir, las URLs públicas se verán así:

```
https://{tu-project-id}.supabase.co/storage/v1/object/public/unit-media/bld-condominio-parque-mackenna/bld-condominio-parque-mackenna-305/images/IMG_4922.jpg
https://{tu-project-id}.supabase.co/storage/v1/object/public/unit-media/bld-condominio-parque-mackenna/bld-condominio-parque-mackenna-305/videos/tour-virtual.mp4
```

## ✅ Checklist

- [ ] Ejecutar `setup-unit-305-folders.sql` para crear carpetas
- [ ] Subir todas las fotos a `unit-media/bld-condominio-parque-mackenna/bld-condominio-parque-mackenna-305/images/`
- [ ] Subir el video a `unit-media/bld-condominio-parque-mackenna/bld-condominio-parque-mackenna-305/videos/`
- [ ] Copiar todas las URLs públicas generadas
- [ ] Actualizar campo `images` en tabla `units` con las URLs de las fotos
- [ ] Actualizar campo `videos` en tabla `units` con la URL del video
- [ ] Verificar que el botón "Ver video" aparece en la página de la unidad
