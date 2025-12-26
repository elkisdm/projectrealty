#!/usr/bin/env node

/**
 * Script para verificar el campo pet_friendly en las unidades de Supabase
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

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPetFriendly() {
  console.log('🔍 Verificando campo pet_friendly en unidades...\n');
  
  try {
    // Consultar todas las unidades disponibles con pet_friendly
    const { data: units, error } = await supabase
      .from('units')
      .select(`
        id,
        tipologia,
        pet_friendly,
        disponible,
        buildings!inner (
          id,
          name,
          slug
        )
      `)
      .eq('disponible', true)
      .limit(20);

    if (error) {
      console.error('❌ Error consultando unidades:', error.message);
      return;
    }

    if (!units || units.length === 0) {
      console.log('⚠️  No se encontraron unidades disponibles.');
      return;
    }

    console.log(`📊 Total de unidades consultadas: ${units.length}\n`);

    // Contar unidades con pet_friendly
    const withPetFriendly = units.filter(u => u.pet_friendly === true);
    const withoutPetFriendly = units.filter(u => u.pet_friendly === false || u.pet_friendly === null);
    const nullPetFriendly = units.filter(u => u.pet_friendly === null || u.pet_friendly === undefined);

    console.log(`✅ Unidades con pet_friendly = true: ${withPetFriendly.length}`);
    console.log(`❌ Unidades con pet_friendly = false: ${withoutPetFriendly.length}`);
    console.log(`⚠️  Unidades con pet_friendly = null/undefined: ${nullPetFriendly.length}\n`);

    // Mostrar ejemplos de unidades con pet_friendly = true
    if (withPetFriendly.length > 0) {
      console.log('📋 Ejemplos de unidades que aceptan mascotas:');
      withPetFriendly.slice(0, 5).forEach((unit, idx) => {
        console.log(`  ${idx + 1}. ${unit.id} - ${unit.tipologia} - Edificio: ${unit.buildings?.name || 'N/A'}`);
      });
      console.log('');
    }

    // Mostrar ejemplos de unidades sin pet_friendly
    if (withoutPetFriendly.length > 0) {
      console.log('📋 Ejemplos de unidades que NO aceptan mascotas:');
      withoutPetFriendly.slice(0, 5).forEach((unit, idx) => {
        console.log(`  ${idx + 1}. ${unit.id} - ${unit.tipologia} - Edificio: ${unit.buildings?.name || 'N/A'}`);
      });
      console.log('');
    }

    // Verificar si hay unidades con valores null
    if (nullPetFriendly.length > 0) {
      console.log('⚠️  Unidades con pet_friendly null/undefined (necesitan actualización):');
      nullPetFriendly.slice(0, 5).forEach((unit, idx) => {
        console.log(`  ${idx + 1}. ${unit.id} - ${unit.tipologia} - Edificio: ${unit.buildings?.name || 'N/A'}`);
      });
      console.log('');
    }

    // Verificar el tipo de dato
    if (units.length > 0) {
      const firstUnit = units[0];
      console.log(`📝 Tipo de dato de pet_friendly: ${typeof firstUnit.pet_friendly}`);
      console.log(`📝 Valor de ejemplo: ${firstUnit.pet_friendly}`);
    }

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

checkPetFriendly();







