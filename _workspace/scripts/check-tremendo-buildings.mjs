#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 VERIFICACIÓN DE EDIFICIOS TREMENDO');
console.log('=====================================\n');

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

console.log('🏢 EDIFICIOS TREMENDO DISPONIBLES:');
console.log('==================================');

Array.from(tremendoBuildings.values()).forEach((building, index) => {
  console.log(`${index + 1}. ${building.building}`);
  console.log(`   Condominio: ${building.condominio}`);
  console.log(`   Unidades: ${building.units.length}`);
  console.log('');
});

// Verificar edificios en Supabase (simulado)
console.log('🔍 VERIFICACIÓN EN SUPABASE:');
console.log('============================');

// Aquí podrías agregar la lógica para verificar en Supabase
// Por ahora, simulamos algunos edificios que podrían estar disponibles

const supabaseBuildings = [
  'Edificio Home Inclusive Ejército',
  'Edificio FAM Huemul',
  'Edificio Home Inclusive Ecuador',
  'Edificio Move',
  'Edificio Altavista',
  'Edificio Lia Aguirre',
  'Edificio Morandé Sur'
];

console.log('Edificios que podrían estar en Supabase:');
supabaseBuildings.forEach((building, index) => {
  const isInTremendo = tremendoBuildings.has(building);
  const status = isInTremendo ? '✅ DISPONIBLE' : '❌ NO EN TREMENDO';
  console.log(`${index + 1}. ${building} - ${status}`);
});

console.log('\n📋 RESUMEN:');
console.log('===========');
console.log(`• Unidades totales en Tremendo: ${tremendoUnits.length}`);
console.log(`• Edificios únicos en Tremendo: ${tremendoBuildings.size}`);
console.log(`• Edificios que coinciden con Supabase: ${supabaseBuildings.filter(b => tremendoBuildings.has(b)).length}`);

// Mostrar algunos OPs de ejemplo
console.log('\n📝 EJEMPLOS DE OPs:');
console.log('===================');
tremendoUnits.slice(0, 10).forEach((unit, index) => {
  console.log(`${index + 1}. ${unit.op} - ${unit.building} - ${unit.unidad}`);
});

console.log('\n✅ Verificación completada');
