#!/usr/bin/env node
/**
 * Script para verificar imágenes en Supabase y su uso en componentes
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY o SUPABASE_ANON_KEY deben estar configurados');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyImages() {
  console.log('🔍 Verificando imágenes en Supabase...\n');

  try {
    // Obtener edificios con imágenes
    const { data: buildingsData, error: buildingsError } = await supabase
      .from('buildings')
      .select(`
        id,
        name,
        slug,
        cover_image,
        gallery,
        units!left (
          id,
          images,
          images_tipologia,
          images_areas_comunes
        )
      `)
      .limit(50);

    if (buildingsError) {
      console.error('❌ Error obteniendo edificios:', buildingsError);
      return;
    }

    if (!buildingsData || buildingsData.length === 0) {
      console.log('⚠️  No se encontraron edificios en Supabase');
      return;
    }

    console.log(`✅ Se encontraron ${buildingsData.length} edificios\n`);

    // Analizar imágenes
    const stats = {
      buildingsWithCover: 0,
      buildingsWithGallery: 0,
      buildingsWithoutImages: 0,
      unitsWithImages: 0,
      unitsWithTipologiaImages: 0,
      unitsWithAreasComunesImages: 0,
      totalImages: 0,
      invalidUrls: [],
    };

    for (const building of buildingsData) {
      const units = building.units || [];
      
      // Verificar cover_image
      if (building.cover_image) {
        stats.buildingsWithCover++;
        stats.totalImages++;
        if (!isValidImageUrl(building.cover_image)) {
          stats.invalidUrls.push({
            type: 'cover_image',
            building: building.name,
            url: building.cover_image,
          });
        }
      }

      // Verificar gallery
      if (building.gallery && Array.isArray(building.gallery) && building.gallery.length > 0) {
        stats.buildingsWithGallery++;
        stats.totalImages += building.gallery.length;
        building.gallery.forEach(url => {
          if (!isValidImageUrl(url)) {
            stats.invalidUrls.push({
              type: 'gallery',
              building: building.name,
              url,
            });
          }
        });
      }

      // Verificar si no tiene imágenes
      if (!building.cover_image && (!building.gallery || building.gallery.length === 0)) {
        stats.buildingsWithoutImages++;
      }

      // Verificar imágenes de unidades
      for (const unit of units) {
        if (unit.images && Array.isArray(unit.images) && unit.images.length > 0) {
          stats.unitsWithImages++;
          stats.totalImages += unit.images.length;
        }
        if (unit.images_tipologia && Array.isArray(unit.images_tipologia) && unit.images_tipologia.length > 0) {
          stats.unitsWithTipologiaImages++;
          stats.totalImages += unit.images_tipologia.length;
        }
        if (unit.images_areas_comunes && Array.isArray(unit.images_areas_comunes) && unit.images_areas_comunes.length > 0) {
          stats.unitsWithAreasComunesImages++;
          stats.totalImages += unit.images_areas_comunes.length;
        }
      }
    }

    // Mostrar resultados
    console.log('📊 Estadísticas de imágenes:');
    console.log(`   Edificios con cover_image: ${stats.buildingsWithCover}/${buildingsData.length}`);
    console.log(`   Edificios con gallery: ${stats.buildingsWithGallery}/${buildingsData.length}`);
    console.log(`   Edificios sin imágenes: ${stats.buildingsWithoutImages}/${buildingsData.length}`);
    console.log(`   Unidades con images: ${stats.unitsWithImages}`);
    console.log(`   Unidades con images_tipologia: ${stats.unitsWithTipologiaImages}`);
    console.log(`   Unidades con images_areas_comunes: ${stats.unitsWithAreasComunesImages}`);
    console.log(`   Total de URLs de imágenes: ${stats.totalImages}\n`);

    // Mostrar edificios sin imágenes
    if (stats.buildingsWithoutImages > 0) {
      console.log('⚠️  Edificios sin imágenes:');
      buildingsData
        .filter(b => !b.cover_image && (!b.gallery || b.gallery.length === 0))
        .slice(0, 10)
        .forEach(b => {
          console.log(`   - ${b.name} (ID: ${b.id})`);
        });
      if (stats.buildingsWithoutImages > 10) {
        console.log(`   ... y ${stats.buildingsWithoutImages - 10} más`);
      }
      console.log('');
    }

    // Mostrar URLs inválidas
    if (stats.invalidUrls.length > 0) {
      console.log('⚠️  URLs de imágenes inválidas:');
      stats.invalidUrls.slice(0, 10).forEach(item => {
        console.log(`   - ${item.building} (${item.type}): ${item.url}`);
      });
      if (stats.invalidUrls.length > 10) {
        console.log(`   ... y ${stats.invalidUrls.length - 10} más`);
      }
      console.log('');
    }

    // Mostrar ejemplos de URLs válidas
    console.log('✅ Ejemplos de URLs válidas:');
    const validExamples = [];
    for (const building of buildingsData) {
      if (building.cover_image && isValidImageUrl(building.cover_image)) {
        validExamples.push({
          building: building.name,
          type: 'cover_image',
          url: building.cover_image,
        });
      }
      if (building.gallery && building.gallery.length > 0) {
        const validGallery = building.gallery.filter(isValidImageUrl);
        if (validGallery.length > 0) {
          validExamples.push({
            building: building.name,
            type: 'gallery',
            url: validGallery[0],
          });
        }
      }
      if (validExamples.length >= 3) break;
    }
    validExamples.forEach(ex => {
      console.log(`   - ${ex.building} (${ex.type}): ${ex.url}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  // Verificar que sea una URL válida
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    // Si no es una URL absoluta, verificar si es una ruta relativa válida
    return url.startsWith('/') || url.startsWith('./');
  }
}

verifyImages()
  .then(() => {
    console.log('\n✅ Verificación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
