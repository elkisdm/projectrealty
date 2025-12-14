#!/usr/bin/env node

/**
 * Script para asociar imágenes subidas a un edificio existente
 * Mueve las imágenes en Storage y actualiza la BD
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Cargar variables de entorno
function loadEnvFile() {
  const envPath = join(projectRoot, '.env.local');
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      }
    });
  }
}

loadEnvFile();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Obtiene todas las imágenes de una carpeta en Storage
 */
async function listImages(bucketName, folderPath) {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .list(folderPath);
  
  if (error) {
    console.error(`❌ Error listando imágenes:`, error.message);
    return [];
  }
  
  return data || [];
}

/**
 * Copia una imagen de un path a otro en Storage
 */
async function copyImage(bucketName, fromPath, toPath) {
  // Leer el archivo original
  const { data: fileData, error: readError } = await supabase.storage
    .from(bucketName)
    .download(fromPath);
  
  if (readError) {
    console.error(`❌ Error leyendo ${fromPath}:`, readError.message);
    return null;
  }
  
  // Convertir blob a buffer
  const arrayBuffer = await fileData.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Subir al nuevo path
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(toPath, buffer, {
      contentType: fileData.type || 'image/jpeg',
      upsert: true,
    });
  
  if (uploadError) {
    console.error(`❌ Error copiando a ${toPath}:`, uploadError.message);
    return null;
  }
  
  // Obtener URL pública
  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(toPath);
  
  return publicUrl;
}

/**
 * Actualiza la galería del edificio
 */
async function updateBuildingGallery(buildingSlug, imageUrls) {
  try {
    const { data, error } = await supabase
      .from('buildings')
      .update({ 
        gallery: imageUrls,
        cover_image: imageUrls[0]
      })
      .eq('slug', buildingSlug)
      .select()
      .single();
    
    if (error) {
      console.error(`❌ Error actualizando edificio:`, error.message);
      return false;
    }
    
    console.log(`✅ Galería del edificio actualizada: ${imageUrls.length} imagen(es)`);
    return true;
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    return false;
  }
}

/**
 * Actualiza imágenes de tipología para todas las unidades
 */
async function updateTipologiaImages(buildingSlug, tipologia, imageUrls) {
  if (imageUrls.length === 0) return false;
  
  try {
    const { data: building, error: buildingError } = await supabase
      .from('buildings')
      .select('id')
      .eq('slug', buildingSlug)
      .single();
    
    if (buildingError || !building) {
      console.error(`❌ Edificio no encontrado: ${buildingSlug}`);
      return false;
    }
    
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
 * Mapeo de carpetas a tipologías
 */
const TIPOLOGIA_MAP = {
  'estudio': ['Estudio', 'Studio'],
  '1d': ['1D1B'],
  '2d': ['2D1B', '2D2B'],
  '3d': ['3D2B'],
};

async function main() {
  const oldSlug = 'guillermo-2632';
  const newSlug = 'guillermo-mann-74012ca7';
  const bucketName = 'edificios';
  
  console.log(`\n🔄 Asociando imágenes de "${oldSlug}" a "${newSlug}"\n`);
  
  // Obtener todas las imágenes del edificio
  const edificioImages = await listImages(bucketName, `${oldSlug}/edificio`);
  const edificioUrls = [];
  
  console.log(`📁 Procesando carpeta: edificio (${edificioImages.length} imagen(es))`);
  for (const file of edificioImages) {
    if (file.name && !file.name.startsWith('.')) {
      const fromPath = `${oldSlug}/edificio/${file.name}`;
      const toPath = `${newSlug}/edificio/${file.name}`;
      const url = await copyImage(bucketName, fromPath, toPath);
      if (url) {
        edificioUrls.push(url);
        console.log(`  ✅ ${file.name}`);
      }
    }
  }
  
  // Procesar tipologías
  const tipologias = {
    'estudio': await listImages(bucketName, `${oldSlug}/estudio`),
    '1d': await listImages(bucketName, `${oldSlug}/1d`),
    '2d': await listImages(bucketName, `${oldSlug}/2d`),
  };
  
  const tipologiaUrls = {};
  
  for (const [folder, files] of Object.entries(tipologias)) {
    if (files.length === 0) continue;
    
    console.log(`\n📁 Procesando carpeta: ${folder} (${files.length} imagen(es))`);
    const urls = [];
    
    for (const file of files) {
      if (file.name && !file.name.startsWith('.')) {
        const fromPath = `${oldSlug}/${folder}/${file.name}`;
        const toPath = `${newSlug}/tipologias/${TIPOLOGIA_MAP[folder]?.[0] || folder}/${file.name}`;
        const url = await copyImage(bucketName, fromPath, toPath);
        if (url) {
          urls.push(url);
          console.log(`  ✅ ${file.name}`);
        }
      }
    }
    
    if (urls.length > 0) {
      tipologiaUrls[folder] = urls;
    }
  }
  
  // Actualizar base de datos
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔄 Actualizando Base de Datos\n`);
  
  // Actualizar galería del edificio
  if (edificioUrls.length > 0) {
    await updateBuildingGallery(newSlug, edificioUrls);
  }
  
  // Actualizar imágenes de tipologías
  for (const [folder, urls] of Object.entries(tipologiaUrls)) {
    const tipologias = TIPOLOGIA_MAP[folder] || [folder];
    
    for (const tipologia of tipologias) {
      if (folder === '2d') {
        // Para 2D, actualizar ambas variantes
        await updateTipologiaImages(newSlug, '2D1B', urls);
        await updateTipologiaImages(newSlug, '2D2B', urls);
      } else {
        await updateTipologiaImages(newSlug, tipologia, urls);
      }
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✨ Proceso completado\n`);
  console.log(`📊 Resumen:`);
  console.log(`   - Edificio: ${edificioUrls.length} imagen(es)`);
  for (const [folder, urls] of Object.entries(tipologiaUrls)) {
    console.log(`   - ${folder}: ${urls.length} imagen(es)`);
  }
}

main().catch(console.error);
