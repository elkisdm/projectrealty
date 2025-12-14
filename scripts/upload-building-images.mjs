#!/usr/bin/env node

/**
 * Script para subir imágenes de edificios siguiendo la estructura:
 * Imagenes/[Nombre del edificio]/Edificio, Estudio, 1D, 2D, 3D
 * 
 * Uso:
 *   node scripts/upload-building-images.mjs <ruta-carpeta-edificio> [--building-name "Nombre"] [--building-slug "slug"]
 * 
 * Ejemplos:
 *   # Subir todas las imágenes de un edificio (detecta automáticamente el nombre)
 *   node scripts/upload-building-images.mjs "/Users/macbookpro/Downloads/Guillermo 2632"
 * 
 *   # Especificar nombre y slug del edificio
 *   node scripts/upload-building-images.mjs "./Imagenes/Guillermo 2632" --building-name "Guillermo 2632" --building-slug "guillermo-2632"
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Cargar variables de entorno desde .env.local
function loadEnvFile() {
  const envPath = join(projectRoot, '.env.local');
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Remover comillas
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      }
    });
  }
}

loadEnvFile();

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

// Mapeo de carpetas locales a tipologías canónicas
const TIPOLOGIA_MAP = {
  'Estudio': ['Estudio', 'Studio'],
  '1D': ['1D1B'],
  '2D': ['2D1B', '2D2B'], // Puede ser cualquiera de las dos
  '3D': ['3D2B'],
};

/**
 * Normaliza un nombre de edificio a slug
 */
function normalizeToSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9]+/g, '-') // Reemplazar espacios y caracteres especiales con guiones
    .replace(/^-+|-+$/g, ''); // Remover guiones al inicio y final
}

/**
 * Obtiene el MIME type correcto desde la extensión del archivo
 */
function getContentType(fileName) {
  const ext = extname(fileName).toLowerCase().slice(1);
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'gif': 'image/gif',
  };
  return mimeTypes[ext] || 'image/jpeg';
}

/**
 * Sube una imagen a Supabase Storage
 */
async function uploadImage(bucketName, storagePath, filePath) {
  try {
    const fileBuffer = readFileSync(filePath);
    const fileName = basename(filePath);
    const contentType = getContentType(fileName);
    
    console.log(`📤 Subiendo: ${fileName} → ${bucketName}/${storagePath}`);
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, fileBuffer, {
        contentType: contentType,
        upsert: true,
      });
    
    if (error) {
      console.error(`❌ Error subiendo ${fileName}:`, error.message);
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(storagePath);
    
    console.log(`✅ Subido: ${publicUrl}`);
    return publicUrl;
    
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Obtiene el slug de un edificio desde la BD (por nombre o slug)
 */
async function getBuildingSlug(buildingName, buildingSlug) {
  if (buildingSlug) {
    // Verificar que existe en la BD
    const { data, error } = await supabase
      .from('buildings')
      .select('slug')
      .eq('slug', buildingSlug)
      .single();
    
    if (!error && data) {
      return buildingSlug;
    }
    console.warn(`⚠️  Slug "${buildingSlug}" no encontrado en BD, intentando por nombre...`);
  }
  
  if (buildingName) {
    // Buscar por nombre
    const { data, error } = await supabase
      .from('buildings')
      .select('slug, name')
      .ilike('name', `%${buildingName}%`)
      .limit(1)
      .single();
    
    if (!error && data) {
      console.log(`✓ Edificio encontrado: "${data.name}" (slug: ${data.slug})`);
      return data.slug;
    }
  }
  
  // Si no se encuentra, generar slug desde el nombre
  const generatedSlug = normalizeToSlug(buildingName || 'edificio-desconocido');
  console.warn(`⚠️  Edificio no encontrado en BD, usando slug generado: "${generatedSlug}"`);
  console.warn(`   Asegúrate de que el edificio existe en la BD o créalo primero.`);
  return generatedSlug;
}

/**
 * Actualiza la galería del edificio en la BD
 */
async function updateBuildingGallery(buildingSlug, imageUrls) {
  if (imageUrls.length === 0) return false;
  
  try {
    console.log(`\n🔄 Actualizando galería del edificio (slug: ${buildingSlug})...`);
    
    const { data, error } = await supabase
      .from('buildings')
      .update({ 
        gallery: imageUrls,
        cover_image: imageUrls[0] // Primera imagen como portada
      })
      .eq('slug', buildingSlug)
      .select()
      .single();
    
    if (error) {
      console.error(`❌ Error actualizando edificio:`, error.message);
      return false;
    }
    
    console.log(`✅ Galería actualizada: ${imageUrls.length} imagen(es)`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    return false;
  }
}

/**
 * Actualiza images_tipologia para todas las unidades de una tipología en un edificio
 */
async function updateTipologiaImages(buildingSlug, tipologia, imageUrls) {
  if (imageUrls.length === 0) return false;
  
  try {
    // Primero obtener el building_id desde el slug
    const { data: building, error: buildingError } = await supabase
      .from('buildings')
      .select('id')
      .eq('slug', buildingSlug)
      .single();
    
    if (buildingError || !building) {
      console.error(`❌ Edificio no encontrado: ${buildingSlug}`);
      return false;
    }
    
    console.log(`\n🔄 Actualizando imágenes de tipología "${tipologia}" para edificio...`);
    
    // Actualizar todas las unidades de esta tipología en este edificio
    const { data, error } = await supabase
      .from('units')
      .update({ images_tipologia: imageUrls })
      .eq('building_id', building.id)
      .eq('tipologia', tipologia)
      .select();
    
    if (error) {
      console.error(`❌ Error actualizando unidades:`, error.message);
      return false;
    }
    
    console.log(`✅ ${data?.length || 0} unidad(es) actualizada(s) con imágenes de tipología "${tipologia}"`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    return false;
  }
}

/**
 * Crea el bucket si no existe
 */
async function ensureBucketExists(bucketName) {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('❌ Error listando buckets:', listError.message);
    return false;
  }
  
  const bucketExists = buckets.some(b => b.name === bucketName);
  
  if (!bucketExists) {
    console.log(`📦 Creando bucket: ${bucketName}...`);
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    });
    
    if (error) {
      console.error(`❌ Error creando bucket:`, error.message);
      return false;
    }
    
    console.log(`✅ Bucket creado: ${bucketName}`);
  }
  
  return true;
}

/**
 * Procesa una carpeta de imágenes
 */
async function processFolder(buildingSlug, folderName, folderPath, bucketName = 'edificios') {
  if (!existsSync(folderPath)) {
    console.warn(`⚠️  Carpeta no existe: ${folderPath}`);
    return [];
  }
  
  const stats = statSync(folderPath);
  if (!stats.isDirectory()) {
    console.warn(`⚠️  No es un directorio: ${folderPath}`);
    return [];
  }
  
  const imageFiles = readdirSync(folderPath)
    .filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file))
    .map(file => join(folderPath, file));
  
  if (imageFiles.length === 0) {
    console.warn(`⚠️  No se encontraron imágenes en: ${folderPath}`);
    return [];
  }
  
  console.log(`\n📁 Procesando carpeta: ${folderName} (${imageFiles.length} imagen(es))`);
  
  const uploadedUrls = [];
  for (const filePath of imageFiles) {
    const fileName = basename(filePath);
    const storagePath = `${buildingSlug}/${folderName.toLowerCase()}/${fileName}`;
    const url = await uploadImage(bucketName, storagePath, filePath);
    if (url) {
      uploadedUrls.push(url);
    }
  }
  
  return uploadedUrls;
}

/**
 * Función principal
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
📤 Script para subir imágenes de edificios

Uso:
  node scripts/upload-building-images.mjs <ruta-carpeta-edificio> [opciones]

Argumentos:
  ruta-carpeta-edificio  Ruta a la carpeta del edificio (ej: "./Imagenes/Guillermo 2632")

Opciones:
  --building-name "Nombre"    Nombre del edificio (si no se detecta del path)
  --building-slug "slug"     Slug del edificio en la BD (si no se encuentra, se genera)

Ejemplos:
  # Subir todas las imágenes (detecta nombre del path)
  node scripts/upload-building-images.mjs "/Users/macbookpro/Downloads/Guillermo 2632"

  # Especificar nombre y slug
  node scripts/upload-building-images.mjs "./Imagenes/Guillermo 2632" --building-name "Guillermo 2632" --building-slug "guillermo-2632"

Estructura esperada:
  [Nombre del edificio]/
    ├── Edificio/     → Imágenes del edificio (áreas comunes, fachada)
    ├── Estudio/      → Imágenes de tipología Estudio
    ├── 1D/           → Imágenes de tipología 1D1B
    ├── 2D/           → Imágenes de tipología 2D1B o 2D2B
    └── 3D/           → Imágenes de tipología 3D2B
`);
    process.exit(0);
  }
  
  const buildingFolderPath = args[0];
  let buildingName = null;
  let buildingSlug = null;
  
  // Parsear opciones
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--building-name' && args[i + 1]) {
      buildingName = args[i + 1];
      i++;
    } else if (args[i] === '--building-slug' && args[i + 1]) {
      buildingSlug = args[i + 1];
      i++;
    }
  }
  
  // Si no se especificó nombre, intentar detectarlo del path
  if (!buildingName) {
    buildingName = basename(buildingFolderPath);
  }
  
  console.log(`\n🏢 Procesando edificio: "${buildingName}"`);
  console.log(`📂 Carpeta: ${buildingFolderPath}\n`);
  
  // Verificar que la carpeta existe
  if (!existsSync(buildingFolderPath)) {
    console.error(`❌ Error: La carpeta no existe: ${buildingFolderPath}`);
    process.exit(1);
  }
  
  // Asegurar que el bucket existe
  await ensureBucketExists('edificios');
  
  // Obtener o generar slug del edificio
  const finalBuildingSlug = await getBuildingSlug(buildingName, buildingSlug);
  console.log(`\n📌 Usando slug: "${finalBuildingSlug}"\n`);
  
  // Procesar cada carpeta
  const folders = ['Edificio', 'Estudio', '1D', '2D', '3D'];
  const results = {};
  
  for (const folderName of folders) {
    const folderPath = join(buildingFolderPath, folderName);
    const imageUrls = await processFolder(finalBuildingSlug, folderName, folderPath);
    
    if (imageUrls.length > 0) {
      results[folderName] = imageUrls;
    }
  }
  
  // Actualizar base de datos
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔄 Actualizando Base de Datos\n`);
  
  // Actualizar galería del edificio
  if (results['Edificio']) {
    await updateBuildingGallery(finalBuildingSlug, results['Edificio']);
  }
  
  // Actualizar imágenes de tipologías
  for (const [folderName, imageUrls] of Object.entries(results)) {
    if (folderName === 'Edificio') continue; // Ya se procesó
    
    const tipologias = TIPOLOGIA_MAP[folderName] || [folderName];
    
    for (const tipologia of tipologias) {
      // Para 2D, actualizar ambas variantes si existen unidades
      if (folderName === '2D') {
        await updateTipologiaImages(finalBuildingSlug, '2D1B', imageUrls);
        await updateTipologiaImages(finalBuildingSlug, '2D2B', imageUrls);
      } else {
        await updateTipologiaImages(finalBuildingSlug, tipologia, imageUrls);
      }
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✨ Proceso completado\n`);
  console.log(`📊 Resumen:`);
  console.log(`   - Edificio: ${results['Edificio']?.length || 0} imagen(es)`);
  console.log(`   - Estudio: ${results['Estudio']?.length || 0} imagen(es)`);
  console.log(`   - 1D: ${results['1D']?.length || 0} imagen(es)`);
  console.log(`   - 2D: ${results['2D']?.length || 0} imagen(es)`);
  console.log(`   - 3D: ${results['3D']?.length || 0} imagen(es)`);
}

main().catch(console.error);
