#!/usr/bin/env node

/**
 * Test directo de getFeaturedUnits() para verificar qué retorna
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.production' });
dotenv.config({ path: '.env.local' });

console.log('=== Test getFeaturedUnits() ===\n');
console.log('USE_SUPABASE:', process.env.USE_SUPABASE);

// Simular el proceso completo
async function testGetFeaturedUnits() {
  try {
    // Importar dinámicamente para simular el entorno del servidor
    const { getAllBuildings } = await import('./lib/data.js');
    
    console.log('\n1. Llamando getAllBuildings()...');
    const allBuildings = await getAllBuildings();
    console.log(`   ✅ Edificios obtenidos: ${allBuildings.length}`);
    
    if (allBuildings.length === 0) {
      console.log('   ❌ PROBLEMA: getAllBuildings() retorna array vacío');
      return;
    }
    
    const firstBuilding = allBuildings[0];
    console.log(`   - Primer edificio: ${firstBuilding.name}`);
    console.log(`   - Comuna: ${firstBuilding.comuna}`);
    console.log(`   - Unidades: ${firstBuilding.units.length}`);
    
    if (firstBuilding.units.length === 0) {
      console.log('   ❌ PROBLEMA: El edificio no tiene unidades');
      return;
    }
    
    const availableUnits = firstBuilding.units.filter(u => u.disponible);
    console.log(`   - Unidades disponibles: ${availableUnits.length}`);
    
    if (availableUnits.length === 0) {
      console.log('   ❌ PROBLEMA: No hay unidades disponibles');
      return;
    }
    
    console.log(`   - Primera unidad disponible: ${availableUnits[0].tipologia}, $${availableUnits[0].price}`);
    
    // Simular getFeaturedUnits para comuna Ñuñoa
    console.log('\n2. Simulando filtro por comuna "Ñuñoa"...');
    const allUnits = [];
    for (const building of allBuildings) {
      const availableUnits = building.units.filter((u) => u.disponible);
      for (const unit of availableUnits) {
        allUnits.push({ unit, building });
      }
    }
    
    console.log(`   Total unidades disponibles: ${allUnits.length}`);
    
    const nunoaUnits = allUnits.filter(
      (item) => item.building.comuna.toLowerCase() === 'ñuñoa'.toLowerCase()
    );
    
    console.log(`   Unidades en Ñuñoa: ${nunoaUnits.length}`);
    
    if (nunoaUnits.length === 0) {
      console.log('   ❌ PROBLEMA: No se encontraron unidades en Ñuñoa');
      console.log(`   Comunas disponibles: ${[...new Set(allUnits.map(u => u.building.comuna))].join(', ')}`);
      console.log(`   Comuna del primer edificio: "${firstBuilding.comuna}"`);
      console.log(`   Comparación: "${firstBuilding.comuna.toLowerCase()}" === "ñuñoa" = ${firstBuilding.comuna.toLowerCase() === 'ñuñoa'}`);
    } else {
      console.log(`   ✅ Encontradas ${nunoaUnits.length} unidades en Ñuñoa`);
      console.log(`   Primera: ${nunoaUnits[0].unit.tipologia}, $${nunoaUnits[0].unit.price}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

testGetFeaturedUnits().then(() => process.exit(0));
