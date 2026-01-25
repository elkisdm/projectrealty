#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 VERIFICACIÓN DE FILTRADO TREMENDO');
console.log('====================================\n');

// Cargar archivo tremendo_units.csv
const csvPath = path.join(__dirname, '..', 'data', 'sources', 'tremendo_units.csv');

if (!fs.existsSync(csvPath)) {
  console.error('❌ Archivo tremendo_units.csv no encontrado');
  process.exit(1);
}

const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());

// Saltar la primera línea (headers)
const dataLines = lines.slice(1);

const tremendoUnits = dataLines.map(line => {
  const [building, condominio, unidad, op] = line.split(',').map(field => field.trim());
  return {
    building,
    condominio,
    unidad,
    op
  };
}).filter(unit => unit.building && unit.condominio && unit.op);

// Agrupar por edificio
const tremendoBuildings = new Map();
tremendoUnits.forEach(unit => {
  if (!tremendoBuildings.has(unit.building)) {
    tremendoBuildings.set(unit.building, {
      building: unit.building,
      condominio: unit.condominio,
      units: []
    });
  }
  tremendoBuildings.get(unit.building).units.push(unit);
});

console.log(`📊 Total de unidades Tremendo: ${tremendoUnits.length}`);
console.log(`🏢 Total de edificios Tremendo: ${tremendoBuildings.size}\n`);

// Verificar API endpoint
console.log('🌐 VERIFICANDO API ENDPOINT...');
console.log('==============================');

try {
  const response = await fetch('http://localhost:3000/api/arrienda-sin-comision?limit=50');
  const data = await response.json();
  
  if (data.success && data.buildings) {
    const apiBuildings = data.buildings;
    const uniqueBuildingNames = [...new Set(apiBuildings.map(b => b.name))];
    
    console.log(`✅ API respondió correctamente`);
    console.log(`📊 Edificios mostrados en API: ${apiBuildings.length}`);
    console.log(`🏢 Edificios únicos: ${uniqueBuildingNames.length}\n`);
    
    console.log('🏢 EDIFICIOS MOSTRADOS EN LA API:');
    console.log('==================================');
    
    uniqueBuildingNames.forEach((buildingName, index) => {
      const isInTremendo = tremendoBuildings.has(buildingName);
      const status = isInTremendo ? '✅ TREMENDO' : '❌ NO TREMENDO';
      const unitsCount = apiBuildings.filter(b => b.name === buildingName).length;
      
      console.log(`${index + 1}. ${buildingName}`);
      console.log(`   Status: ${status}`);
      console.log(`   Instancias en API: ${unitsCount}`);
      
      if (isInTremendo) {
        const tremendoData = tremendoBuildings.get(buildingName);
        console.log(`   Unidades en Tremendo: ${tremendoData.units.length}`);
        console.log(`   Condominio: ${tremendoData.condominio}`);
      }
      console.log('');
    });
    
    // Verificar que todos los edificios mostrados sean de Tremendo
    const nonTremendoBuildings = uniqueBuildingNames.filter(name => !tremendoBuildings.has(name));
    
    if (nonTremendoBuildings.length === 0) {
      console.log('🎉 ¡PERFECTO! Todos los edificios mostrados son de Tremendo');
    } else {
      console.log('⚠️ ADVERTENCIA: Se encontraron edificios que NO son de Tremendo:');
      nonTremendoBuildings.forEach(building => {
        console.log(`   - ${building}`);
      });
    }
    
    console.log('\n📋 RESUMEN:');
    console.log('===========');
    console.log(`• Edificios Tremendo totales: ${tremendoBuildings.size}`);
    console.log(`• Edificios mostrados en API: ${uniqueBuildingNames.length}`);
    console.log(`• Edificios Tremendo en API: ${uniqueBuildingNames.filter(name => tremendoBuildings.has(name)).length}`);
    console.log(`• Edificios no-Tremendo en API: ${nonTremendoBuildings.length}`);
    
  } else {
    console.log('❌ Error en la respuesta de la API');
    console.log(data);
  }
  
} catch (error) {
  console.error('❌ Error conectando con la API:', error.message);
  console.log('💡 Asegúrate de que el servidor esté corriendo en http://localhost:3000');
}

console.log('\n✅ Verificación completada');
