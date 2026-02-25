#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const useSupabase = process.env.USE_SUPABASE;

console.log('🔍 VERIFICACIÓN DE CONFIGURACIÓN SUPABASE');
console.log('==========================================');

// 1. Verificar variables de entorno
console.log('\n📋 Variables de entorno:');
console.log(`USE_SUPABASE: ${useSupabase}`);
console.log(`SUPABASE_URL: ${supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'NO CONFIGURADO'}`);
console.log(`ANON_KEY: ${supabaseAnonKey ? `${supabaseAnonKey.substring(0, 10)}...` : 'NO CONFIGURADO'}`);
console.log(`SERVICE_KEY: ${supabaseServiceKey ? `${supabaseServiceKey.substring(0, 10)}...` : 'NO CONFIGURADO'}`);

// 2. Verificar si son credenciales mock
const isMock = supabaseUrl?.includes('mock.supabase.co') || 
               supabaseAnonKey?.includes('your-anon-key-here') ||
               supabaseServiceKey?.includes('your-service-role-key-here');

if (isMock) {
  console.log('\n❌ PROBLEMA: Detectadas credenciales MOCK');
  console.log('   Actualiza .env.local con credenciales reales de tu proyecto Supabase');
  process.exit(1);
}

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.log('\n❌ PROBLEMA: Credenciales incompletas');
  process.exit(1);
}

console.log('\n✅ Credenciales configuradas correctamente');

// 3. Crear clientes
console.log('\n🔌 Probando conexión...');

const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
});

const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

// 4. Probar conexión básica
try {
  console.log('   Probando cliente anónimo...');
  const { data: anonData, error: anonError } = await anonClient
    .from('buildings')
    .select('count', { count: 'exact', head: true });
  
  if (anonError) {
    console.log(`   ❌ Cliente anónimo falló: ${anonError.message}`);
  } else {
    console.log('   ✅ Cliente anónimo conectado');
  }
} catch (error) {
  console.log(`   ❌ Error cliente anónimo: ${error.message}`);
}

try {
  console.log('   Probando cliente service...');
  const { data: serviceData, error: serviceError } = await serviceClient
    .from('buildings')
    .select('count', { count: 'exact', head: true });
  
  if (serviceError) {
    console.log(`   ❌ Cliente service falló: ${serviceError.message}`);
  } else {
    console.log('   ✅ Cliente service conectado');
  }
} catch (error) {
  console.log(`   ❌ Error cliente service: ${error.message}`);
}

// 5. Verificar estructura de tablas
console.log('\n🏗️ Verificando estructura de tablas...');

try {
  // Verificar tabla buildings
  console.log('   Verificando tabla buildings...');
  const { data: buildingsColumns, error: buildingsError } = await serviceClient
    .rpc('get_table_columns', { table_name: 'buildings' })
    .single();

  if (buildingsError) {
    console.log(`   ⚠️ No se pudo verificar estructura de buildings: ${buildingsError.message}`);
    
    // Intentar una consulta simple para ver si la tabla existe
    const { data: testBuildings, error: testError } = await serviceClient
      .from('buildings')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.log(`   ❌ Tabla buildings no existe o no es accesible: ${testError.message}`);
    } else {
      console.log('   ✅ Tabla buildings existe y es accesible');
    }
  } else {
    console.log('   ✅ Estructura de buildings verificada');
  }

  // Verificar tabla units
  console.log('   Verificando tabla units...');
  const { data: testUnits, error: unitsError } = await serviceClient
    .from('units')
    .select('*')
    .limit(1);
  
  if (unitsError) {
    console.log(`   ❌ Tabla units no existe o no es accesible: ${unitsError.message}`);
  } else {
    console.log('   ✅ Tabla units existe y es accesible');
  }

} catch (error) {
  console.log(`   ❌ Error verificando tablas: ${error.message}`);
}

// 6. Probar inserción de datos de prueba (opcional)
console.log('\n🧪 Probando inserción de datos de prueba...');

try {
  const testBuilding = {
    id: 'test-building-' + Date.now(),
    slug: 'test-building-slug',
    name: 'Edificio de Prueba',
    comuna: 'Las Condes',
    address: 'Calle de Prueba 123'
  };

  const { data: insertData, error: insertError } = await serviceClient
    .from('buildings')
    .insert([testBuilding])
    .select();

  if (insertError) {
    console.log(`   ❌ No se pudo insertar datos de prueba: ${insertError.message}`);
  } else {
    console.log('   ✅ Inserción de datos exitosa');
    
    // Limpiar datos de prueba
    await serviceClient
      .from('buildings')
      .delete()
      .eq('id', testBuilding.id);
    
    console.log('   🧹 Datos de prueba eliminados');
  }
} catch (error) {
  console.log(`   ❌ Error en prueba de inserción: ${error.message}`);
}

console.log('\n🎯 RESUMEN:');
console.log('===========');
console.log('1. Actualiza .env.local con credenciales reales si aún no lo has hecho');
console.log('2. Asegúrate de que las tablas buildings y units existan en tu proyecto Supabase');
console.log('3. Verifica los permisos RLS (Row Level Security) en Supabase Dashboard');
console.log('4. Si todo está configurado, ejecuta: pnpm run qa:supabase');
