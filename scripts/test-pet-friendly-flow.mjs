#!/usr/bin/env node

/**
 * Script para probar el flujo completo de pet_friendly desde Supabase hasta el componente
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

async function testPetFriendlyFlow() {
  console.log('🔍 Probando flujo completo de pet_friendly...\n');
  
  try {
    // Simular la query exacta que usa readFromSupabase
    const { data: buildingsData, error } = await supabase
      .from('buildings')
      .select(`
        id,
        slug,
        name,
        comuna,
        address,
        amenities,
        gallery,
        cover_image,
        badges,
        service_level,
        gc_mode,
        units!left (
          id,
          tipologia,
          m2,
          price,
          disponible,
          estacionamiento,
          bodega,
          bedrooms,
          bathrooms,
          pet_friendly,
          images_tipologia,
          images_areas_comunes,
          images
        )
      `)
      .order('name')
      .limit(5);

    if (error) {
      console.error('❌ Error en query:', error.message);
      return;
    }

    if (!buildingsData || buildingsData.length === 0) {
      console.log('⚠️  No se encontraron edificios.');
      return;
    }

    console.log(`📊 Edificios encontrados: ${buildingsData.length}\n`);

    // Verificar unidades con pet_friendly
    for (const building of buildingsData) {
      if (building.units && building.units.length > 0) {
        console.log(`\n🏢 Edificio: ${building.name}`);
        console.log(`   Unidades: ${building.units.length}`);
        
        building.units.forEach((unit, idx) => {
          const petFriendlyValue = unit.pet_friendly;
          const petFriendlyType = typeof petFriendlyValue;
          const petFriendlyDisplay = petFriendlyValue === true ? '✅ true' : petFriendlyValue === false ? '❌ false' : '⚠️  null/undefined';
          
          console.log(`   ${idx + 1}. ${unit.id} - ${unit.tipologia} - pet_friendly: ${petFriendlyDisplay} (${petFriendlyType})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

testPetFriendlyFlow();







