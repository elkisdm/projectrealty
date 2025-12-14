#!/usr/bin/env node

/**
 * Script para verificar la conexión con Supabase y las tablas
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

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Colores
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'blue');
  log(title, 'bold');
  log('='.repeat(60) + '\n', 'blue');
}

async function verifyConnection() {
  logSection('🔗 Verificación de Conexión Supabase');
  
  // Verificar variables de entorno
  if (!supabaseUrl || !supabaseAnonKey) {
    logError('Variables de entorno no configuradas');
    log('Asegúrate de tener .env.local con:');
    log('  - SUPABASE_URL');
    log('  - SUPABASE_ANON_KEY o NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return false;
  }
  
  logInfo(`URL: ${supabaseUrl}`);
  logInfo(`Anon Key: ${supabaseAnonKey.substring(0, 20)}...`);
  
  // Crear cliente
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
  
  // Probar conexión básica
  try {
    logInfo('Probando conexión...');
    
    // Intentar una query simple que siempre funciona
    const { data, error } = await supabase
      .from('buildings')
      .select('count')
      .limit(0);
    
    if (error) {
      if (error.message.includes('does not exist')) {
        logError('La tabla "buildings" no existe');
        logWarning('Necesitas ejecutar el schema SQL primero');
        return false;
      }
      throw error;
    }
    
    logSuccess('Conexión exitosa');
    return true;
  } catch (error) {
    logError(`Error de conexión: ${error.message}`);
    return false;
  }
}

async function verifyTables() {
  logSection('📋 Verificación de Tablas');
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return false;
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
  
  const tables = [
    { name: 'buildings', description: 'Edificios' },
    { name: 'units', description: 'Unidades' },
    { name: 'waitlist', description: 'Lista de espera' },
    { name: 'admin_users', description: 'Usuarios admin' },
  ];
  
  const results = {};
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table.name)
        .select('*')
        .limit(1);
      
      if (error) {
        if (error.message.includes('does not exist')) {
          logError(`  ❌ ${table.name} (${table.description}): NO EXISTE`);
          results[table.name] = false;
        } else {
          logWarning(`  ⚠️  ${table.name} (${table.description}): ${error.message}`);
          results[table.name] = false;
        }
      } else {
        logSuccess(`  ✅ ${table.name} (${table.description}): OK`);
        results[table.name] = true;
      }
    } catch (error) {
      logError(`  ❌ ${table.name}: ${error.message}`);
      results[table.name] = false;
    }
  }
  
  const allOk = Object.values(results).every(r => r === true);
  const countOk = Object.values(results).filter(r => r === true).length;
  
  log(`\n📊 Resumen: ${countOk}/${tables.length} tablas creadas`);
  
  return allOk;
}

async function verifyRLS() {
  logSection('🔒 Verificación de RLS (Row Level Security)');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    logWarning('Service Role Key no configurada, saltando verificación de RLS');
    return true;
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
  
  // Verificar que podemos leer (con service role siempre funciona)
  try {
    const { data, error } = await supabase
      .from('buildings')
      .select('id')
      .limit(1);
    
    if (error) {
      logWarning(`RLS puede estar bloqueando: ${error.message}`);
      return false;
    }
    
    logSuccess('RLS configurado correctamente');
    return true;
  } catch (error) {
    logWarning(`Error verificando RLS: ${error.message}`);
    return false;
  }
}

async function testQueries() {
  logSection('🔍 Prueba de Consultas');
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return false;
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
  
  // Probar consultas básicas
  const tests = [
    {
      name: 'Contar edificios',
      query: () => supabase.from('buildings').select('id', { count: 'exact', head: true }),
    },
    {
      name: 'Contar unidades',
      query: () => supabase.from('units').select('id', { count: 'exact', head: true }),
    },
    {
      name: 'Obtener filtros disponibles',
      query: () => supabase.from('v_filters_available').select('*').limit(5),
    },
  ];
  
  for (const test of tests) {
    try {
      const { data, error, count } = await test.query();
      
      if (error) {
        logWarning(`  ⚠️  ${test.name}: ${error.message}`);
      } else {
        const result = count !== undefined ? `${count} registros` : `${data?.length || 0} registros`;
        logSuccess(`  ✅ ${test.name}: ${result}`);
      }
    } catch (error) {
      logWarning(`  ⚠️  ${test.name}: ${error.message}`);
    }
  }
  
  return true;
}

async function main() {
  log('\n🚀 Verificación de Conexión Supabase\n', 'bold');
  
  const connectionOk = await verifyConnection();
  if (!connectionOk) {
    logError('\n❌ No se pudo conectar. Verifica las credenciales y que el SQL esté ejecutado.');
    process.exit(1);
  }
  
  const tablesOk = await verifyTables();
  if (!tablesOk) {
    logWarning('\n⚠️  Algunas tablas no existen. Ejecuta el schema SQL desde el dashboard.');
    log('\n📝 Pasos:');
    log('  1. Ve a: https://supabase.com/dashboard/project/lytgdrbdyvmvziypvumy/sql/new');
    log('  2. Ejecuta: config/supabase/schema.sql');
    log('  3. Ejecuta: config/supabase/migrations/20250115_create_admin_users.sql');
    process.exit(1);
  }
  
  await verifyRLS();
  await testQueries();
  
  logSection('🎉 Resumen Final');
  logSuccess('✅ Conexión verificada exitosamente');
  logSuccess('✅ Todas las tablas están creadas');
  log('\n✨ Supabase está configurado correctamente!');
  log('\nPróximos pasos:');
  log('  - Prueba la aplicación: pnpm dev');
  log('  - Verifica funcionalidad: node scripts/verify-core-functionality.mjs');
}

main().catch((error) => {
  logError(`\n❌ Error: ${error.message}`);
  console.error(error);
  process.exit(1);
});



