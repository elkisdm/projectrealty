#!/usr/bin/env node

/**
 * Script para consolidar edificios duplicados
 * 
 * Uso:
 *   node scripts/consolidate-buildings.mjs <nombre-edificio>
 * 
 * Ejemplo:
 *   node scripts/consolidate-buildings.mjs "Guillermo Mann"
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

// Cargar variables de entorno
const envPath = join(ROOT_DIR, '.env.local');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan credenciales de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

// Colores
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'blue');
  log(title, 'bold');
  log('='.repeat(60) + '\n', 'blue');
}

async function consolidateBuildings(buildingName) {
  logSection(`🔧 Consolidando Edificios: ${buildingName}`);
  
  try {
    // 1. Buscar todos los edificios con ese nombre
    logInfo('Buscando edificios duplicados...');
    const { data: buildings, error: buildingsError } = await supabase
      .from('buildings')
      .select('id, name, slug, comuna, address, amenities, gallery, cover_image, badges, service_level')
      .eq('name', buildingName);
    
    if (buildingsError) {
      throw new Error(`Error buscando edificios: ${buildingsError.message}`);
    }
    
    if (!buildings || buildings.length < 2) {
      logWarning(`Solo se encontraron ${buildings?.length || 0} edificio(s) con el nombre "${buildingName}"`);
      logInfo('No hay duplicados para consolidar');
      return;
    }
    
    logInfo(`Encontrados ${buildings.length} edificios con el nombre "${buildingName}"`);
    
    // 2. Elegir el edificio principal (el primero, o el que tenga más datos)
    const mainBuilding = buildings[0];
    const otherBuildings = buildings.slice(1);
    
    logInfo(`Edificio principal: ${mainBuilding.id}`);
    logInfo(`Edificios a consolidar: ${otherBuildings.length}`);
    
    // 3. Obtener todas las unidades de los edificios a consolidar
    logInfo('Obteniendo unidades de los edificios a consolidar...');
    const allBuildingIds = buildings.map(b => b.id);
    
    const { data: units, error: unitsError } = await supabase
      .from('units')
      .select('id, building_id')
      .in('building_id', allBuildingIds);
    
    if (unitsError) {
      throw new Error(`Error obteniendo unidades: ${unitsError.message}`);
    }
    
    logInfo(`Total unidades encontradas: ${units?.length || 0}`);
    
    // Contar unidades por edificio
    const unitsByBuilding = new Map();
    allBuildingIds.forEach(id => {
      const buildingUnits = units?.filter(u => u.building_id === id) || [];
      unitsByBuilding.set(id, buildingUnits.length);
      logInfo(`  - Edificio ${id.substring(0, 8)}...: ${buildingUnits.length} unidades`);
    });
    
    // 4. Actualizar todas las unidades para que apunten al edificio principal
    logInfo(`Actualizando ${units?.length || 0} unidades para apuntar al edificio principal...`);
    
    const otherBuildingIds = otherBuildings.map(b => b.id);
    const unitsToUpdate = units?.filter(u => otherBuildingIds.includes(u.building_id)) || [];
    
    if (unitsToUpdate.length > 0) {
      const { error: updateError } = await supabase
        .from('units')
        .update({ building_id: mainBuilding.id })
        .in('building_id', otherBuildingIds);
      
      if (updateError) {
        throw new Error(`Error actualizando unidades: ${updateError.message}`);
      }
      
      logSuccess(`${unitsToUpdate.length} unidades actualizadas`);
    }
    
    // 5. Consolidar datos del edificio principal (combinar amenities, gallery, etc.)
    logInfo('Consolidando datos del edificio principal...');
    
    const consolidatedAmenities = new Set(mainBuilding.amenities || []);
    const consolidatedGallery = new Set(mainBuilding.gallery || []);
    
    otherBuildings.forEach(building => {
      if (building.amenities && Array.isArray(building.amenities)) {
        building.amenities.forEach(a => consolidatedAmenities.add(a));
      }
      if (building.gallery && Array.isArray(building.gallery)) {
        building.gallery.forEach(g => consolidatedGallery.add(g));
      }
    });
    
    // Actualizar edificio principal con datos consolidados
    const updateData = {
      amenities: Array.from(consolidatedAmenities),
      gallery: Array.from(consolidatedGallery),
    };
    
    // Usar cover_image del que lo tenga, si el principal no lo tiene
    if (!mainBuilding.cover_image) {
      const buildingWithCover = otherBuildings.find(b => b.cover_image);
      if (buildingWithCover) {
        updateData.cover_image = buildingWithCover.cover_image;
      }
    }
    
    const { error: updateBuildingError } = await supabase
      .from('buildings')
      .update(updateData)
      .eq('id', mainBuilding.id);
    
    if (updateBuildingError) {
      logWarning(`Advertencia al actualizar edificio principal: ${updateBuildingError.message}`);
    } else {
      logSuccess('Edificio principal actualizado con datos consolidados');
    }
    
    // 6. Eliminar edificios duplicados
    logInfo(`Eliminando ${otherBuildings.length} edificio(s) duplicado(s)...`);
    
    const { error: deleteError } = await supabase
      .from('buildings')
      .delete()
      .in('id', otherBuildingIds);
    
    if (deleteError) {
      throw new Error(`Error eliminando edificios: ${deleteError.message}`);
    }
    
    logSuccess(`${otherBuildings.length} edificio(s) eliminado(s)`);
    
    // 7. Verificar resultado
    logInfo('Verificando resultado...');
    const { data: finalBuildings, error: finalError } = await supabase
      .from('buildings')
      .select('id, name, units(id)')
      .eq('name', buildingName);
    
    if (finalError) {
      logWarning(`Advertencia al verificar: ${finalError.message}`);
    } else {
      logSuccess(`Edificios restantes con nombre "${buildingName}": ${finalBuildings?.length || 0}`);
      if (finalBuildings && finalBuildings.length > 0) {
        const totalUnits = finalBuildings.reduce((sum, b) => sum + (b.units?.length || 0), 0);
        logSuccess(`Total unidades en el edificio consolidado: ${totalUnits}`);
      }
    }
    
    logSection('🎉 Consolidación Completada');
    logSuccess(`✅ Edificio "${buildingName}" consolidado exitosamente`);
    logInfo(`   - Edificio principal: ${mainBuilding.id}`);
    logInfo(`   - Unidades consolidadas: ${units?.length || 0}`);
    logInfo(`   - Edificios eliminados: ${otherBuildings.length}`);
    
  } catch (error) {
    logError(`Error durante la consolidación: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Obtener nombre del edificio desde argumentos
const buildingName = process.argv[2];

if (!buildingName) {
  logError('Uso: node scripts/consolidate-buildings.mjs <nombre-edificio>');
  logInfo('Ejemplo: node scripts/consolidate-buildings.mjs "Guillermo Mann"');
  process.exit(1);
}

consolidateBuildings(buildingName)
  .then(() => {
    log('\n✅ Proceso completado', 'green');
    process.exit(0);
  })
  .catch((error) => {
    logError(`\n❌ Error: ${error.message}`);
    console.error(error);
    process.exit(1);
  });



