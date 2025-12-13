#!/usr/bin/env node

/**
 * Script para obtener los slugs de los edificios en Supabase
 * Uso: node scripts/get-buildings-slugs.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Cargar variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  console.error('   NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getBuildingsSlugs() {
  try {
    console.log('🔍 Consultando edificios en Supabase...\n');
    
    const { data: buildings, error } = await supabase
      .from('buildings')
      .select('id, slug, name, comuna, address')
      .order('name');
    
    if (error) {
      console.error('❌ Error consultando Supabase:', error.message);
      process.exit(1);
    }
    
    if (!buildings || buildings.length === 0) {
      console.log('⚠️  No se encontraron edificios en Supabase');
      return;
    }
    
    console.log(`✅ Se encontraron ${buildings.length} edificio(s):\n`);
    
    buildings.forEach((building, index) => {
      console.log(`${index + 1}. ${building.name}`);
      console.log(`   📍 Comuna: ${building.comuna}`);
      console.log(`   🏠 Dirección: ${building.address || 'N/A'}`);
      console.log(`   🔗 Slug: ${building.slug}`);
      console.log(`   🆔 ID: ${building.id}`);
      console.log(`   🌐 URL: /property/${building.slug}`);
      console.log('');
    });
    
    console.log('\n📋 Resumen de slugs:');
    buildings.forEach(building => {
      console.log(`   - ${building.slug} → ${building.name}`);
    });
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    process.exit(1);
  }
}

getBuildingsSlugs();
