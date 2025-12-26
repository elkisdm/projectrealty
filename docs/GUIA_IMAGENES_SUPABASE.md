# 📸 Guía: Añadir Imágenes a la Base de Datos

**Guía completa para gestionar imágenes en Supabase Storage y base de datos.**

---

## 🎯 Estrategia Recomendada

### **Opción 1: Supabase Storage (RECOMENDADO) ✅**

**Ventajas:**
- ✅ CDN integrado (imágenes servidas rápido)
- ✅ Optimización automática
- ✅ Control de acceso (público/privado)
- ✅ Escalable y económico
- ✅ Integración nativa con Supabase

**Desventajas:**
- ⚠️ Requiere configuración inicial de buckets
- ⚠️ Límite de 1GB en plan gratuito

### **Opción 2: URLs Externas (Alternativa)**

**Ventajas:**
- ✅ Sin límites de almacenamiento
- ✅ No requiere configuración de buckets

**Desventajas:**
- ❌ Dependes de servicios externos
- ❌ Sin optimización automática
- ❌ Puede ser más lento

---

## 🚀 Implementación: Supabase Storage

### **Paso 1: Configurar Buckets en Supabase**

1. **Ir al Dashboard de Supabase:**
   - Ve a tu proyecto en [supabase.com](https://supabase.com)
   - Navega a **Storage** en el menú lateral

2. **Crear Buckets:**

   Crea los siguientes buckets (públicos):

   ```
   edificios          → Imágenes de edificios (gallery, coverImage)
   unidades           → Imágenes de unidades (interior)
   tipologias         → Imágenes de tipologías
   areas-comunes      → Imágenes de áreas comunes
   ```

   **Configuración de cada bucket:**
   - **Name:** `edificios` (o el nombre correspondiente)
   - **Public:** ✅ **SÍ** (para que las imágenes sean accesibles públicamente)
   - **File size limit:** 5MB (recomendado)
   - **Allowed MIME types:** `image/jpeg, image/png, image/webp`

3. **Configurar Políticas RLS (Row Level Security):**

   Para cada bucket, configura políticas que permitan:
   - **Lectura pública:** Cualquiera puede leer
   - **Escritura:** Solo usuarios autenticados (o service role)

   **SQL para políticas (ejecutar en SQL Editor):**

   ```sql
   -- Política para lectura pública en bucket 'edificios'
   CREATE POLICY "Public Access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'edificios');

   -- Política para escritura (solo autenticados o service role)
   CREATE POLICY "Authenticated users can upload"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'edificios' 
     AND auth.role() = 'authenticated'
   );
   ```

   Repite para cada bucket (`unidades`, `tipologias`, `areas-comunes`).

---

### **Paso 2: Estructura de Carpetas en Storage**

Organiza las imágenes en carpetas lógicas:

```
edificios/
  ├── {building-id}/
  │   ├── gallery/
  │   │   ├── imagen-1.jpg
  │   │   ├── imagen-2.jpg
  │   │   └── imagen-3.jpg
  │   └── cover.jpg
  └── ...

unidades/
  ├── {unit-id}/
  │   ├── interior/
  │   │   ├── sala-1.jpg
  │   │   ├── cocina-1.jpg
  │   │   └── dormitorio-1.jpg
  │   └── ...
  └── ...

tipologias/
  ├── {building-id}/
  │   ├── 1D1B/
  │   │   ├── vista-1.jpg
  │   │   └── vista-2.jpg
  │   └── 2D2B/
  │       └── ...
  └── ...

areas-comunes/
  ├── {building-id}/
  │   ├── piscina.jpg
  │   ├── gimnasio.jpg
  │   └── ...
  └── ...
```

---

### **Paso 3: Subir Imágenes**

#### **Opción A: Dashboard de Supabase (Manual)**

1. Ve a **Storage** → Selecciona el bucket (ej: `edificios`)
2. Crea una carpeta con el ID del edificio (ej: `abc123`)
3. Sube las imágenes arrastrando y soltando
4. Copia las URLs públicas generadas

#### **Opción B: API/Admin Panel (Recomendado para producción)**

Crea un endpoint o panel admin para subir imágenes:

```typescript
// lib/admin/upload-image.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function uploadImage(
  bucket: 'edificios' | 'unidades' | 'tipologias' | 'areas-comunes',
  path: string, // ej: "abc123/gallery/imagen-1.jpg"
  file: File | Buffer
): Promise<string> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  // Obtener URL pública
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return publicUrl;
}
```

---

### **Paso 4: Almacenar URLs en la Base de Datos**

Las imágenes se almacenan como **arrays de URLs** en las columnas correspondientes:

#### **Estructura Actual en la Base de Datos:**

```sql
-- Tabla: buildings
gallery TEXT[]           -- Array de URLs: ["url1", "url2", ...]
cover_image TEXT         -- URL única: "url"

-- Tabla: units
images TEXT[]            -- Array de URLs de interior (requiere migración)
images_tipologia TEXT[]  -- Array de URLs de tipología (requiere migración)
images_areas_comunes TEXT[] -- Array de URLs de áreas comunes (requiere migración)
```

**⚠️ IMPORTANTE:** Si la tabla `units` no tiene estas columnas, ejecuta la migración:

```bash
# Ejecutar migración en Supabase SQL Editor
# Archivo: config/supabase/migrations/20250120_add_unit_images.sql
```

#### **Formato de URLs de Supabase Storage:**

```
https://{project-ref}.supabase.co/storage/v1/object/public/{bucket}/{path}
```

**Ejemplo:**
```
https://abcdefgh.supabase.co/storage/v1/object/public/edificios/abc123/gallery/imagen-1.jpg
```

---

### **Paso 5: Actualizar Datos en la Base de Datos**

#### **Opción A: SQL Directo**

```sql
-- Actualizar galería de un edificio
UPDATE buildings
SET gallery = ARRAY[
  'https://{project-ref}.supabase.co/storage/v1/object/public/edificios/abc123/gallery/imagen-1.jpg',
  'https://{project-ref}.supabase.co/storage/v1/object/public/edificios/abc123/gallery/imagen-2.jpg',
  'https://{project-ref}.supabase.co/storage/v1/object/public/edificios/abc123/gallery/imagen-3.jpg'
]
WHERE id = 'abc123';

-- Actualizar imágenes de una unidad
UPDATE units
SET images = ARRAY[
  'https://{project-ref}.supabase.co/storage/v1/object/public/unidades/unit-123/interior/sala-1.jpg',
  'https://{project-ref}.supabase.co/storage/v1/object/public/unidades/unit-123/interior/cocina-1.jpg'
]
WHERE id = 'unit-123';
```

#### **Opción B: Panel Admin (Recomendado)**

Crea un panel admin que permita:
1. Seleccionar edificio/unidad
2. Subir imágenes (drag & drop)
3. Guardar URLs automáticamente en la base de datos

**Ejemplo de componente:**

```typescript
// app/admin/buildings/[id]/images/page.tsx
'use client';

import { useState } from 'react';
import { uploadImage } from '@/lib/admin/upload-image';

export function ImageUploader({ buildingId }: { buildingId: string }) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(files: FileList) {
    setUploading(true);
    const urls: string[] = [];

    for (const file of Array.from(files)) {
      const path = `${buildingId}/gallery/${file.name}`;
      const url = await uploadImage('edificios', path, file);
      urls.push(url);
    }

    // Actualizar base de datos
    await fetch(`/api/admin/buildings/${buildingId}`, {
      method: 'PATCH',
      body: JSON.stringify({ gallery: urls })
    });

    setUploading(false);
  }

  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => e.target.files && handleUpload(e.target.files)}
        disabled={uploading}
      />
    </div>
  );
}
```

---

## 📋 Checklist de Implementación

### **Configuración Inicial:**
- [ ] **Ejecutar migración SQL** para agregar columnas de imágenes a `units` (ver `config/supabase/migrations/20250120_add_unit_images.sql`)
- [ ] Crear buckets en Supabase Storage (`edificios`, `unidades`, `tipologias`, `areas-comunes`)
- [ ] Configurar buckets como públicos
- [ ] Configurar políticas RLS para lectura pública
- [ ] Configurar límites de tamaño (5MB recomendado)
- [ ] Configurar MIME types permitidos

### **Desarrollo:**
- [ ] Crear función `uploadImage` en `lib/admin/upload-image.ts`
- [ ] Crear endpoint API `/api/admin/upload` (opcional)
- [ ] Crear componente de upload en panel admin
- [ ] Probar subida de imágenes
- [ ] Verificar URLs generadas

### **Migración de Datos:**
- [ ] Identificar imágenes actuales (rutas estáticas `/images/...`)
- [ ] Subir imágenes existentes a Supabase Storage
- [ ] Actualizar URLs en base de datos
- [ ] Verificar que todas las imágenes se muestran correctamente

---

## 🔧 Utilidades y Helpers

### **Función para obtener URL pública:**

```typescript
// lib/utils/storage.ts
export function getStorageUrl(
  bucket: string,
  path: string
): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

// Uso:
const imageUrl = getStorageUrl('edificios', 'abc123/gallery/imagen-1.jpg');
```

### **Función para validar URLs de Supabase Storage:**

```typescript
// lib/utils/storage.ts
export function isValidStorageUrl(url: string): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return url.startsWith(`${supabaseUrl}/storage/v1/object/public/`);
}
```

---

## ⚠️ Consideraciones Importantes

### **Optimización de Imágenes:**

1. **Antes de subir:**
   - Comprimir imágenes (usar herramientas como [TinyPNG](https://tinypng.com/))
   - Convertir a WebP cuando sea posible
   - Redimensionar a tamaños razonables (max 2000px ancho)

2. **En el frontend:**
   - Usar `next/image` con `loader` personalizado si es necesario
   - Implementar lazy loading
   - Usar `blurDataURL` para placeholders

### **Límites y Costos:**

- **Plan Gratuito:** 1GB de almacenamiento
- **Plan Pro:** 100GB incluido
- **Archivos grandes:** Considera comprimir antes de subir

### **Seguridad:**

- ✅ Buckets públicos solo para imágenes que deben ser públicas
- ✅ Usa buckets privados para imágenes sensibles
- ✅ Valida tipos MIME en el servidor
- ✅ Limita tamaño de archivos

---

## 📚 Referencias

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Supabase Storage API](https://supabase.com/docs/reference/javascript/storage)
- [Next.js Image Optimization](https://nextjs.org/docs/app/api-reference/components/image)

---

## 🆘 Troubleshooting

### **Error: "Bucket not found"**
- Verifica que el bucket existe en el dashboard
- Verifica el nombre del bucket (case-sensitive)

### **Error: "New row violates row-level security policy"**
- Verifica las políticas RLS del bucket
- Asegúrate de que la política de lectura pública esté activa

### **Imágenes no se muestran**
- Verifica que las URLs son públicas
- Verifica CORS si accedes desde otro dominio
- Verifica que las URLs están correctamente formateadas

---

**Última actualización:** Enero 2025
