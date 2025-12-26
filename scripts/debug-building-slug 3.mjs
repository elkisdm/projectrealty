#!/usr/bin/env node

/**
 * Script para debuggear qué está pasando con el slug
 */

import { getBuildingBySlug } from '../lib/data.js';

const slug = process.argv[2] || 'guillermo-mann-74012ca7';

console.log(`🔍 Buscando edificio con slug: ${slug}\n`);

try {
  const building = await getBuildingBySlug(slug);
  
  if (!building) {
    console.log('❌ No se encontró el edificio');
    console.log('\n💡 Posibles causas:');
    console.log('   1. El slug no coincide con el de Supabase');
    console.log('   2. readAll() está usando mocks en lugar de Supabase');
    console.log('   3. El edificio no tiene unidades');
  } else {
    console.log('✅ Edificio encontrado:');
    console.log(`   Nombre: ${building.name}`);
    console.log(`   Slug: ${building.slug}`);
    console.log(`   ID: ${building.id}`);
    console.log(`   Comuna: ${building.comuna}`);
    console.log(`   Unidades: ${building.units?.length || 0}`);
  }
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error);
}
