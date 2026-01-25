#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Credenciales de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

const command = process.argv[2];
const provider = process.argv[3] || 'assetplan';

console.log('🔧 HERRAMIENTAS DE INGESTA HOMMIE');
console.log('================================');

// Comando: Limpiar datos de un proveedor
async function cleanProvider(providerName) {
  console.log(`\n🧹 Limpiando datos del proveedor: ${providerName}`);
  
  try {
    // Contar datos antes
    const { count: unitsCount } = await supabase
      .from('units')
      .select('*', { count: 'exact', head: true })
      .eq('provider', providerName);
    
    const { count: buildingsCount } = await supabase
      .from('buildings')
      .select('*', { count: 'exact', head: true })
      .eq('provider', providerName);
    
    console.log(`📊 Datos encontrados: ${buildingsCount} edificios, ${unitsCount} unidades`);
    
    if (unitsCount === 0 && buildingsCount === 0) {
      console.log('ℹ️ No hay datos para limpiar');
      return;
    }
    
    // Limpiar unidades primero (foreign key constraint)
    console.log('🏠 Eliminando unidades...');
    const { error: unitsError } = await supabase
      .from('units')
      .delete()
      .eq('provider', providerName);
    
    if (unitsError) {
      throw new Error(`Error eliminando unidades: ${unitsError.message}`);
    }
    
    // Limpiar edificios
    console.log('🏗️ Eliminando edificios...');
    const { error: buildingsError } = await supabase
      .from('buildings')
      .delete()
      .eq('provider', providerName);
    
    if (buildingsError) {
      throw new Error(`Error eliminando edificios: ${buildingsError.message}`);
    }
    
    console.log(`✅ Limpieza completada: ${buildingsCount} edificios y ${unitsCount} unidades eliminados`);
    
  } catch (error) {
    console.error('❌ Error durante limpieza:', error.message);
  }
}

// Comando: Verificar integridad de datos
async function verifyIntegrity() {
  console.log('\n🔍 Verificando integridad de datos...');
  
  try {
    const issues = [];
    
    // 1. Verificar unidades huérfanas (sin edificio)
    const { data: orphanUnits } = await supabase
      .from('units')
      .select('id, source_unit_id')
      .is('building_id', null);
    
    if (orphanUnits && orphanUnits.length > 0) {
      issues.push(`${orphanUnits.length} unidades huérfanas (sin edificio)`);
    }
    
    // 2. Verificar edificios sin unidades
    const { data: emptyBuildings } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT b.id, b.nombre 
        FROM buildings b 
        LEFT JOIN units u ON b.id = u.building_id 
        WHERE u.id IS NULL AND b.provider = 'assetplan'
      `
    });
    
    if (emptyBuildings && emptyBuildings.length > 0) {
      issues.push(`${emptyBuildings.length} edificios sin unidades`);
    }
    
    // 3. Verificar precios fuera de rango
    const { data: badPrices } = await supabase
      .from('units')
      .select('id, precio')
      .or('precio.lt.100000,precio.gt.5000000')
      .eq('provider', 'assetplan');
    
    if (badPrices && badPrices.length > 0) {
      issues.push(`${badPrices.length} unidades con precios fuera de rango`);
    }
    
    // 4. Verificar áreas inválidas
    const { data: badAreas } = await supabase
      .from('units')
      .select('id, area_m2')
      .or('area_m2.lt.10,area_m2.gt.300')
      .eq('provider', 'assetplan');
    
    if (badAreas && badAreas.length > 0) {
      issues.push(`${badAreas.length} unidades con áreas inválidas`);
    }
    
    // 5. Verificar duplicados por source_unit_id
    const { data: duplicates } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT source_unit_id, COUNT(*) as count 
        FROM units 
        WHERE provider = 'assetplan' 
        GROUP BY source_unit_id 
        HAVING COUNT(*) > 1
      `
    });
    
    if (duplicates && duplicates.length > 0) {
      issues.push(`${duplicates.length} códigos de unidad duplicados`);
    }
    
    // Reporte final
    if (issues.length === 0) {
      console.log('✅ Integridad verificada: No se encontraron problemas');
    } else {
      console.log('⚠️ Problemas de integridad encontrados:');
      issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error verificando integridad:', error.message);
  }
}

// Comando: Estadísticas detalladas
async function showStats() {
  console.log('\n📊 Estadísticas detalladas...');
  
  try {
    // Conteos generales
    const { count: totalBuildings } = await supabase
      .from('buildings')
      .select('*', { count: 'exact', head: true })
      .eq('provider', 'assetplan');
    
    const { count: totalUnits } = await supabase
      .from('units')
      .select('*', { count: 'exact', head: true })
      .eq('provider', 'assetplan');
    
    const { count: availableUnits } = await supabase
      .from('units')
      .select('*', { count: 'exact', head: true })
      .eq('provider', 'assetplan')
      .eq('disponible', true);
    
    console.log(`🏗️  Total edificios: ${totalBuildings}`);
    console.log(`🏠 Total unidades: ${totalUnits}`);
    console.log(`✅ Unidades disponibles: ${availableUnits} (${Math.round(availableUnits/totalUnits*100)}%)`);
    
    // Distribución por comuna
    console.log('\n🌍 Top 10 comunas por edificios:');
    const { data: comunaStats } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          comuna, 
          COUNT(*) as edificios,
          SUM(CASE WHEN has_availability THEN 1 ELSE 0 END) as con_disponibilidad
        FROM buildings 
        WHERE provider = 'assetplan' 
        GROUP BY comuna 
        ORDER BY edificios DESC
        LIMIT 10
      `
    });
    
    if (comunaStats) {
      comunaStats.forEach((stat, index) => {
        console.log(`   ${index + 1}. ${stat.comuna}: ${stat.edificios} edificios (${stat.con_disponibilidad} disponibles)`);
      });
    }
    
    // Distribución por tipología
    console.log('\n🏠 Distribución por tipología:');
    const { data: tipologiaStats } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          tipologia, 
          COUNT(*) as unidades,
          COUNT(CASE WHEN disponible THEN 1 END) as disponibles,
          ROUND(AVG(precio)) as precio_promedio
        FROM units 
        WHERE provider = 'assetplan' 
        GROUP BY tipologia 
        ORDER BY unidades DESC
      `
    });
    
    if (tipologiaStats) {
      tipologiaStats.forEach(stat => {
        console.log(`   ${stat.tipologia}: ${stat.unidades} unidades (${stat.disponibles} disponibles, promedio $${stat.precio_promedio?.toLocaleString()})`);
      });
    }
    
    // Rangos de precios
    console.log('\n💰 Rangos de precios:');
    const { data: priceStats } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          MIN(precio) as precio_min,
          MAX(precio) as precio_max,
          ROUND(AVG(precio)) as precio_promedio,
          ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY precio)) as precio_mediana
        FROM units 
        WHERE provider = 'assetplan' AND disponible = true
      `
    });
    
    if (priceStats && priceStats.length > 0) {
      const stats = priceStats[0];
      console.log(`   Mínimo: $${stats.precio_min?.toLocaleString()}`);
      console.log(`   Máximo: $${stats.precio_max?.toLocaleString()}`);
      console.log(`   Promedio: $${stats.precio_promedio?.toLocaleString()}`);
      console.log(`   Mediana: $${stats.precio_mediana?.toLocaleString()}`);
    }
    
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error.message);
  }
}

// Comando: Listar backups disponibles
async function listBackups() {
  console.log('\n📁 Backups disponibles:');
  
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    const backups = await fs.readdir(backupDir);
    
    if (backups.length === 0) {
      console.log('   No hay backups disponibles');
      return;
    }
    
    for (const backup of backups) {
      const backupPath = path.join(backupDir, backup);
      const stat = await fs.stat(backupPath);
      
      if (stat.isDirectory()) {
        const buildingsFile = path.join(backupPath, 'buildings.json');
        const unitsFile = path.join(backupPath, 'units.json');
        
        let buildingsCount = 0;
        let unitsCount = 0;
        
        try {
          const buildings = JSON.parse(await fs.readFile(buildingsFile, 'utf-8'));
          const units = JSON.parse(await fs.readFile(unitsFile, 'utf-8'));
          buildingsCount = buildings.length;
          unitsCount = units.length;
        } catch (e) {
          // Archivos no válidos
        }
        
        console.log(`   📦 ${backup}`);
        console.log(`      Fecha: ${stat.mtime.toLocaleString()}`);
        console.log(`      Contenido: ${buildingsCount} edificios, ${unitsCount} unidades`);
      }
    }
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('   Directorio de backups no existe');
    } else {
      console.error('❌ Error listando backups:', error.message);
    }
  }
}

// Comando: Ayuda
function showHelp() {
  console.log('\n📚 COMANDOS DISPONIBLES:');
  console.log('========================');
  console.log('');
  console.log('🧹 Limpieza:');
  console.log('   pnpm run tools clean [proveedor]     - Limpiar datos de un proveedor');
  console.log('');
  console.log('🔍 Verificación:');
  console.log('   pnpm run tools verify                - Verificar integridad de datos');
  console.log('   pnpm run tools stats                 - Mostrar estadísticas detalladas');
  console.log('');
  console.log('📁 Backups:');
  console.log('   pnpm run tools backups               - Listar backups disponibles');
  console.log('');
  console.log('📚 Ayuda:');
  console.log('   pnpm run tools help                  - Mostrar esta ayuda');
  console.log('');
  console.log('Ejemplos:');
  console.log('   pnpm run tools clean assetplan       - Limpiar datos de AssetPlan');
  console.log('   pnpm run tools verify                - Verificar integridad');
  console.log('   pnpm run tools stats                 - Ver estadísticas');
}

// Router de comandos
switch (command) {
  case 'clean':
    await cleanProvider(provider);
    break;
  case 'verify':
    await verifyIntegrity();
    break;
  case 'stats':
    await showStats();
    break;
  case 'backups':
    await listBackups();
    break;
  case 'help':
  default:
    showHelp();
    break;
}
