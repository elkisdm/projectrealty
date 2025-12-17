#!/usr/bin/env node

/**
 * Script para subir imágenes a Supabase Storage
 * 
 * Uso:
 *   node _workspace/scripts/upload-images-to-supabase.mjs <bucket-name> <image-path> [unit-id|building-id]
 * 
 * Ejemplos:
 *   # Subir imagen a bucket 'properties' para una unidad
 *   node _workspace/scripts/upload-images-to-supabase.mjs properties ./images/unit-123.jpg unit-123
 * 
 *   # Subir múltiples imágenes
 *   node _workspace/scripts/upload-images-to-supabase.mjs properties ./images/*.jpg
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  console.error('Necesitas configurar:');
  console.error('  - SUPABASE_URL o NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nAsegúrate de tener un archivo .env.local con estas variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Sube una imagen a Supabase Storage
 */
async function uploadImage(bucketName, filePath, entityId = null) {
  try {
    // Leer archivo
    const fileBuffer = readFileSync(filePath);
    const fileName = basename(filePath);
    
    // Crear path en storage
    // Formato: entity-id/filename o solo filename si no hay entity-id
    const storagePath = entityId 
      ? `${entityId}/${fileName}`
      : fileName;
    
    console.log(`📤 Subiendo: ${filePath} → ${bucketName}/${storagePath}`);
    
    // Subir archivo
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, fileBuffer, {
        contentType: `image/${extname(fileName).slice(1) || 'jpeg'}`,
        upsert: true, // Sobrescribir si existe
      });
    
    if (error) {
      console.error(`❌ Error subiendo ${filePath}:`, error.message);
      return null;
    }
    
    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(storagePath);
    
    console.log(`✅ Subido exitosamente: ${publicUrl}`);
    return publicUrl;
    
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Actualiza URLs de imágenes en una unidad
 */
async function updateUnitImages(unitId, imageUrls) {
  try {
    console.log(`\n🔄 Actualizando imágenes para unidad ${unitId}...`);
    
    const { data, error } = await supabase
      .from('units')
      .update({ images: imageUrls })
      .eq('id', unitId)
      .select()
      .single();
    
    if (error) {
      console.error(`❌ Error actualizando unidad:`, error.message);
      return false;
    }
    
    console.log(`✅ Unidad actualizada exitosamente`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    return false;
  }
}

/**
 * Actualiza URLs de imágenes en un edificio
 */
async function updateBuildingGallery(buildingId, imageUrls) {
  try {
    console.log(`\n🔄 Actualizando galería para edificio ${buildingId}...`);
    
    const { data, error } = await supabase
      .from('buildings')
      .update({ gallery: imageUrls })
      .eq('id', buildingId)
      .select()
      .single();
    
    if (error) {
      console.error(`❌ Error actualizando edificio:`, error.message);
      return false;
    }
    
    console.log(`✅ Edificio actualizado exitosamente`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    return false;
  }
}

/**
 * Crea un bucket si no existe
 */
async function ensureBucketExists(bucketName, isPublic = true) {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('❌ Error listando buckets:', listError.message);
    return false;
  }
  
  const bucketExists = buckets.some(b => b.name === bucketName);
  
  if (!bucketExists) {
    console.log(`📦 Creando bucket: ${bucketName}...`);
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: isPublic,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    });
    
    if (error) {
      console.error(`❌ Error creando bucket:`, error.message);
      return false;
    }
    
    console.log(`✅ Bucket creado: ${bucketName}`);
  } else {
    console.log(`✓ Bucket existe: ${bucketName}`);
  }
  
  return true;
}

/**
 * Función principal
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`
📤 Script para subir imágenes a Supabase Storage

Uso:
  node upload-images-to-supabase.mjs <bucket> <image-path> [entity-id] [--update-db]

Argumentos:
  bucket      Nombre del bucket en Supabase Storage (ej: 'properties', 'units')
  image-path  Ruta a la imagen o directorio con imágenes
  entity-id   ID de la unidad o edificio (opcional, para organizar en storage)
  --update-db Si se proporciona entity-id, actualiza la BD con las nuevas URLs

Ejemplos:
  # Subir una imagen
  node upload-images-to-supabase.mjs properties ./images/unit-123.jpg unit-123

  # Subir todas las imágenes de un directorio
  node upload-images-to-supabase.mjs properties ./images/units/

  # Subir y actualizar base de datos
  node upload-images-to-supabase.mjs properties ./images/unit-123.jpg unit-123 --update-db
`);
    process.exit(0);
  }
  
  const [bucketName, imagePath, entityId, updateDb] = args;
  const shouldUpdateDb = updateDb === '--update-db';
  
  // Asegurar que el bucket existe
  await ensureBucketExists(bucketName);
  
  // Determinar si es archivo o directorio
  const fullPath = join(projectRoot, imagePath);
  const stats = statSync(fullPath);
  
  let imageFiles = [];
  
  if (stats.isDirectory()) {
    // Leer todos los archivos de imagen del directorio
    imageFiles = readdirSync(fullPath)
      .filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file))
      .map(file => join(fullPath, file));
  } else if (stats.isFile()) {
    imageFiles = [fullPath];
  } else {
    console.error(`❌ Error: ${imagePath} no es un archivo ni directorio válido`);
    process.exit(1);
  }
  
  if (imageFiles.length === 0) {
    console.error(`❌ No se encontraron imágenes en ${imagePath}`);
    process.exit(1);
  }
  
  console.log(`\n📤 Subiendo ${imageFiles.length} imagen(es) a bucket: ${bucketName}\n`);
  
  // Subir imágenes
  const uploadedUrls = [];
  for (const filePath of imageFiles) {
    const url = await uploadImage(bucketName, filePath, entityId);
    if (url) {
      uploadedUrls.push(url);
    }
  }
  
  if (uploadedUrls.length === 0) {
    console.error('\n❌ No se pudo subir ninguna imagen');
    process.exit(1);
  }
  
  console.log(`\n✅ ${uploadedUrls.length} imagen(es) subida(s) exitosamente`);
  console.log('\n📋 URLs generadas:');
  uploadedUrls.forEach(url => console.log(`  - ${url}`));
  
  // Actualizar base de datos si se solicita
  if (shouldUpdateDb && entityId) {
    // Determinar si es unidad o edificio (basado en el nombre del bucket o lógica)
    // Por ahora, asumimos que si el bucket es 'units' o contiene 'unit', es una unidad
    const isUnit = bucketName.toLowerCase().includes('unit') || bucketName.toLowerCase() === 'units';
    
    if (isUnit) {
      await updateUnitImages(entityId, uploadedUrls);
    } else {
      await updateBuildingGallery(entityId, uploadedUrls);
    }
  } else if (shouldUpdateDb && !entityId) {
    console.warn('\n⚠️  --update-db requiere entity-id');
  }
  
  console.log('\n✨ Proceso completado');
}

main().catch(console.error);

