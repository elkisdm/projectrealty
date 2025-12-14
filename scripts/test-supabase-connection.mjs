#!/usr/bin/env node

/**
 * Script de diagnóstico para verificar conexión y datos de Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.production' });
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const useSupabase = process.env.USE_SUPABASE === 'true';

console.log('=== Diagnóstico de Conexión Supabase ===\n');

// 1. Verificar variables de entorno
console.log('1. Variables de Entorno:');
console.log(`   USE_SUPABASE: ${useSupabase}`);
console.log(`   SUPABASE_URL: ${supabaseUrl ? '✅ Configurado' : '❌ FALTA'}`);
console.log(`   SUPABASE_KEY: ${supabaseKey ? '✅ Configurado' : '❌ FALTA'}`);
console.log('');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno críticas');
  process.exit(1);
}

// 2. Crear cliente
console.log('2. Creando cliente Supabase...');
const supabase = createClient(supabaseUrl, supabaseKey);
console.log('   ✅ Cliente creado\n');

// 3. Verificar conexión básica
console.log('3. Verificando conexión...');
try {
  const { data, error } = await supabase.from('buildings').select('id').limit(1);
  
  if (error) {
    console.error(`   ❌ Error de conexión: ${error.message}`);
    console.error(`   Código: ${error.code}`);
    console.error(`   Detalles: ${error.details}`);
  } else {
    console.log('   ✅ Conexión exitosa\n');
  }
} catch (err) {
  console.error(`   ❌ Error: ${err.message}\n`);
}

// 4. Contar edificios
console.log('4. Contando edificios...');
try {
  const { count, error } = await supabase
    .from('buildings')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.error(`   ❌ Error: ${error.message}`);
  } else {
    console.log(`   📊 Total edificios: ${count || 0}\n`);
  }
} catch (err) {
  console.error(`   ❌ Error: ${err.message}\n`);
}

// 5. Contar unidades
console.log('5. Contando unidades...');
try {
  const { count, error } = await supabase
    .from('units')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.error(`   ❌ Error: ${error.message}`);
  } else {
    console.log(`   📊 Total unidades: ${count || 0}\n`);
  }
} catch (err) {
  console.error(`   ❌ Error: ${err.message}\n`);
}

// 6. Obtener edificios con unidades (query real)
console.log('6. Probando query de edificios con unidades...');
try {
  const { data: buildingsData, error: buildingsError } = await supabase
    .from('buildings')
    .select(`
      id,
      slug,
      name,
      comuna,
      units!left (
        id,
        tipologia,
        m2,
        price,
        disponible
      )
    `)
    .limit(5);

  if (buildingsError) {
    console.error(`   ❌ Error en query: ${buildingsError.message}`);
    console.error(`   Código: ${buildingsError.code}`);
    console.error(`   Detalles: ${buildingsError.details}`);
  } else {
    console.log(`   ✅ Query exitosa`);
    console.log(`   📊 Edificios obtenidos: ${buildingsData?.length || 0}`);
    
    if (buildingsData && buildingsData.length > 0) {
      const buildingsWithUnits = buildingsData.filter(b => b.units && b.units.length > 0);
      console.log(`   📊 Edificios con unidades: ${buildingsWithUnits.length}`);
      
      if (buildingsWithUnits.length > 0) {
        console.log('\n   Primer edificio con unidades:');
        const first = buildingsWithUnits[0];
        console.log(`     - ID: ${first.id}`);
        console.log(`     - Nombre: ${first.name}`);
        console.log(`     - Comuna: ${first.comuna}`);
        console.log(`     - Unidades: ${first.units?.length || 0}`);
        if (first.units && first.units.length > 0) {
          console.log(`     - Primera unidad: ${first.units[0].tipologia || 'N/A'}, $${first.units[0].price || 'N/A'}`);
        }
      } else {
        console.log('   ⚠️ Ningún edificio tiene unidades asociadas');
      }
    } else {
      console.log('   ⚠️ No se encontraron edificios');
    }
  }
} catch (err) {
  console.error(`   ❌ Error: ${err.message}\n`);
}

// 7. Verificar relación entre buildings y units
console.log('\n7. Verificando relación buildings-units...');
try {
  const { data: units, error } = await supabase
    .from('units')
    .select('id, building_id')
    .limit(5);
  
  if (error) {
    console.error(`   ❌ Error: ${error.message}`);
  } else {
    console.log(`   📊 Unidades con building_id: ${units?.length || 0}`);
    if (units && units.length > 0) {
      const withBuildingId = units.filter(u => u.building_id);
      console.log(`   📊 Unidades con building_id válido: ${withBuildingId.length}`);
      if (withBuildingId.length === 0) {
        console.log('   ⚠️ PROBLEMA: Las unidades no tienen building_id configurado');
      }
    }
  }
} catch (err) {
  console.error(`   ❌ Error: ${err.message}\n`);
}

console.log('\n=== Diagnóstico completado ===');
