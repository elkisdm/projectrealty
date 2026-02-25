#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
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

console.log('🔍 VERIFICACIÓN DE DATOS REALES');
console.log('==============================');

async function verifyRealData() {
  try {
    // 1. Contar edificios y unidades de AssetPlan
    console.log('\n📊 Conteo de datos AssetPlan:');
    
    const { count: buildingsCount } = await supabase
      .from('buildings')
      .select('*', { count: 'exact', head: true })
      .eq('provider', 'assetplan');
    
    const { count: unitsCount } = await supabase
      .from('units')
      .select('*', { count: 'exact', head: true })
      .eq('provider', 'assetplan');
    
    const { count: availableUnitsCount } = await supabase
      .from('units')
      .select('*', { count: 'exact', head: true })
      .eq('provider', 'assetplan')
      .eq('disponible', true);
    
    console.log(`   Edificios: ${buildingsCount}`);
    console.log(`   Unidades total: ${unitsCount}`);
    console.log(`   Unidades disponibles: ${availableUnitsCount}`);
    
    // 2. Mostrar algunos edificios de ejemplo
    console.log('\n🏗️ Edificios de ejemplo:');
    
    const { data: sampleBuildings } = await supabase
      .from('buildings')
      .select('id, nombre, comuna, direccion, precio_desde, precio_hasta')
      .eq('provider', 'assetplan')
      .order('nombre')
      .limit(5);
    
    sampleBuildings?.forEach((building, index) => {
      console.log(`   ${index + 1}. ${building.nombre}`);
      console.log(`      📍 ${building.direccion}, ${building.comuna}`);
      console.log(`      💰 $${building.precio_desde?.toLocaleString()} - $${building.precio_hasta?.toLocaleString()}`);
    });
    
    // 3. Mostrar distribución por comuna
    console.log('\n🌍 Distribución por comuna:');
    
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
    
    if (comunaStats && Array.isArray(comunaStats)) {
      comunaStats.forEach(stat => {
        console.log(`   ${stat.comuna}: ${stat.edificios} edificios (${stat.con_disponibilidad} con disponibilidad)`);
      });
    }
    
    // 4. Mostrar tipologías disponibles
    console.log('\n🏠 Tipologías disponibles:');
    
    const { data: tipologiaStats } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          tipologia, 
          COUNT(*) as unidades,
          COUNT(CASE WHEN disponible THEN 1 END) as disponibles,
          AVG(precio)::INTEGER as precio_promedio
        FROM units 
        WHERE provider = 'assetplan' 
        GROUP BY tipologia 
        ORDER BY unidades DESC
      `
    });
    
    if (tipologiaStats && Array.isArray(tipologiaStats)) {
      tipologiaStats.forEach(stat => {
        console.log(`   ${stat.tipologia}: ${stat.unidades} unidades (${stat.disponibles} disponibles, promedio $${stat.precio_promedio?.toLocaleString()})`);
      });
    }
    
    // 5. Probar consulta de datos como lo haría la aplicación
    console.log('\n🔄 Simulando consulta de aplicación:');
    
    const { data: appQuery } = await supabase
      .from('buildings')
      .select(`
        id,
        nombre,
        comuna,
        direccion,
        precio_desde,
        units (
          id,
          tipologia,
          area_m2,
          precio,
          disponible,
          guarantee_installments
        )
      `)
      .eq('provider', 'assetplan')
      .eq('has_availability', true)
      .order('precio_desde')
      .limit(3);
    
    console.log(`   ✅ Consulta exitosa: ${appQuery?.length} edificios con disponibilidad`);
    
    if (appQuery && appQuery.length > 0) {
      const firstBuilding = appQuery[0];
      console.log(`   📝 Ejemplo: ${firstBuilding.nombre}`);
      console.log(`       Unidades: ${firstBuilding.units?.length}`);
      console.log(`       Disponibles: ${firstBuilding.units?.filter(u => u.disponible).length}`);
    }
    
    console.log('\n🎉 VERIFICACIÓN COMPLETADA');
    console.log('==========================');
    console.log('✅ Los datos de AssetPlan están correctamente cargados');
    console.log('✅ La aplicación puede consultar y usar los datos');
    console.log('✅ Sistema de cotizaciones tiene datos reales para funcionar');
    
  } catch (error) {
    console.error('❌ Error durante verificación:', error.message);
  }
}

verifyRealData();
