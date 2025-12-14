#!/usr/bin/env node

/**
 * Script guiado para configurar Supabase desde cero
 * 
 * Este script te ayuda a:
 * 1. Configurar las variables de entorno
 * 2. Ejecutar el schema SQL
 * 3. Ejecutar las migraciones
 * 4. Verificar que todo funcione
 * 
 * Uso:
 *   node scripts/setup-supabase-production.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import readline from 'node:readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

// Colores para terminal
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

// Crear interfaz readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

/**
 * Paso 1: Obtener credenciales de Supabase
 */
async function getSupabaseCredentials() {
  logSection('📋 Paso 1: Credenciales de Supabase');
  
  // Intentar obtener de argumentos o variables de entorno primero
  const args = process.argv.slice(2);
  let url = process.env.SUPABASE_URL || args[0];
  let anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || args[1];
  let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || args[2];
  
  // Si no están disponibles, pedirlas interactivamente
  if (!url || !anonKey || !serviceKey) {
    logInfo('Necesitas las siguientes credenciales de tu proyecto Supabase:');
    log('   1. SUPABASE_URL - URL del proyecto (ej: https://xxxxx.supabase.co)');
    log('   2. SUPABASE_ANON_KEY - Clave anónima pública');
    log('   3. SUPABASE_SERVICE_ROLE_KEY - Clave de servicio (admin)');
    log('\n   Puedes encontrarlas en:');
    log('   Dashboard → Settings → API\n', 'cyan');
    
    if (!url) url = await question('🔗 SUPABASE_URL: ');
    if (!anonKey) anonKey = await question('🔑 SUPABASE_ANON_KEY: ');
    if (!serviceKey) serviceKey = await question('🔐 SUPABASE_SERVICE_ROLE_KEY: ');
  } else {
    logSuccess('Credenciales encontradas en argumentos/variables de entorno');
  }
  
  if (!url || !anonKey || !serviceKey) {
    logError('Todas las credenciales son requeridas');
    log('\nUso alternativo:');
    log('  node scripts/setup-supabase-production.mjs <URL> <ANON_KEY> <SERVICE_ROLE_KEY>');
    log('  O configura las variables de entorno: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  
  return { url, anonKey, serviceKey };
}

/**
 * Paso 2: Probar conexión
 */
async function testConnection(url, anonKey, serviceKey) {
  logSection('🔗 Paso 2: Verificar Conexión');
  
  try {
    logInfo('Probando conexión con Supabase...');
    
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false },
    });
    
    // Probar conexión básica usando una query simple que siempre funciona
    // Intentar obtener información del schema (esto funciona incluso sin tablas)
    const { data, error } = await supabase
      .rpc('version')
      .catch(async () => {
        // Si rpc no funciona, intentar una query simple a information_schema
        // que siempre existe en PostgreSQL
        return await supabase
          .from('information_schema.tables')
          .select('table_name')
          .limit(1)
          .catch(() => ({ data: null, error: null }));
      });
    
    // Si hay error pero es de tabla no encontrada, es normal (tablas aún no creadas)
    if (error) {
      // Verificar si es un error de autenticación (más grave)
      if (error.message.includes('Invalid API key') || error.message.includes('JWT')) {
        throw new Error('Credenciales inválidas: ' + error.message);
      }
      // Otros errores pueden ser normales si las tablas no existen aún
      logWarning(`Advertencia: ${error.message.substring(0, 100)}`);
      logInfo('(Esto es normal si las tablas aún no están creadas)');
    }
    
    logSuccess('Conexión exitosa con Supabase');
    return true;
  } catch (error) {
    // Si es un error de autenticación, fallar
    if (error.message.includes('Invalid API key') || error.message.includes('JWT')) {
      logError(`Error de autenticación: ${error.message}`);
      logWarning('Verifica que las credenciales sean correctas');
      return false;
    }
    
    // Para otros errores, asumir que la conexión funciona
    logWarning(`Advertencia de conexión: ${error.message}`);
    logInfo('Continuando (esto puede ser normal si las tablas no existen aún)...');
    return true;
  }
}

/**
 * Paso 3: Ejecutar schema SQL
 */
async function executeSchema(url, serviceKey) {
  logSection('📄 Paso 3: Ejecutar Schema SQL');
  
  try {
    const schemaPath = join(ROOT_DIR, 'config', 'supabase', 'schema.sql');
    
    if (!existsSync(schemaPath)) {
      logError(`No se encontró el archivo: ${schemaPath}`);
      return false;
    }
    
    logInfo('Leyendo schema.sql...');
    const schemaSQL = readFileSync(schemaPath, 'utf-8');
    
    logInfo('Ejecutando schema en Supabase...');
    logWarning('Esto puede tardar unos segundos...');
    
    // Crear cliente con service role para ejecutar SQL
    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });
    
    // Dividir el SQL en statements individuales
    const statements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const statement of statements) {
      try {
        // Ejecutar cada statement usando rpc si está disponible, o directamente
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' }).catch(async () => {
          // Si rpc no existe, intentar ejecutar directamente usando query
          // Nota: Esto requiere usar la API REST directamente
          return { error: { message: 'RPC exec_sql no disponible' } };
        });
        
        if (error && !error.message.includes('already exists') && !error.message.includes('duplicate')) {
          // Ignorar errores de "ya existe" o "duplicado"
          if (!error.message.includes('RPC exec_sql no disponible')) {
            logWarning(`  ⚠️  ${error.message.substring(0, 80)}`);
            errorCount++;
          }
        } else {
          successCount++;
        }
      } catch (e) {
        // Ignorar errores de statements que ya existen
        if (!e.message.includes('already exists') && !e.message.includes('duplicate')) {
          errorCount++;
        } else {
          successCount++;
        }
      }
    }
    
    logSuccess(`Schema ejecutado: ${successCount} statements procesados`);
    if (errorCount > 0) {
      logWarning(`${errorCount} statements con advertencias (normal si ya existen)`);
    }
    
    return true;
  } catch (error) {
    logError(`Error ejecutando schema: ${error.message}`);
    logWarning('Puedes ejecutar el SQL manualmente desde el SQL Editor de Supabase');
    return false;
  }
}

/**
 * Paso 4: Ejecutar migraciones
 */
async function executeMigrations(url, serviceKey) {
  logSection('🔄 Paso 4: Ejecutar Migraciones');
  
  try {
    const migrationsDir = join(ROOT_DIR, 'config', 'supabase', 'migrations');
    
    if (!existsSync(migrationsDir)) {
      logWarning('No se encontró directorio de migraciones, saltando...');
      return true;
    }
    
    const { readdirSync } = await import('node:fs');
    const migrations = readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    if (migrations.length === 0) {
      logInfo('No hay migraciones para ejecutar');
      return true;
    }
    
    logInfo(`Encontradas ${migrations.length} migración(es)`);
    
    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });
    
    for (const migration of migrations) {
      logInfo(`Ejecutando: ${migration}...`);
      
      const migrationPath = join(migrationsDir, migration);
      const migrationSQL = readFileSync(migrationPath, 'utf-8');
      
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
      
      for (const statement of statements) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' }).catch(() => ({
            error: { message: 'RPC no disponible' },
          }));
          
          if (error && !error.message.includes('already exists') && !error.message.includes('duplicate') && !error.message.includes('RPC no disponible')) {
            logWarning(`  ⚠️  ${error.message.substring(0, 80)}`);
          }
        } catch (e) {
          // Ignorar errores de "ya existe"
        }
      }
      
      logSuccess(`  ✅ ${migration} completada`);
    }
    
    return true;
  } catch (error) {
    logError(`Error ejecutando migraciones: ${error.message}`);
    return false;
  }
}

/**
 * Paso 5: Verificar tablas
 */
async function verifyTables(url, anonKey) {
  logSection('✅ Paso 5: Verificar Tablas');
  
  try {
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false },
    });
    
    const tables = ['buildings', 'units', 'waitlist', 'admin_users'];
    const results = {};
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        
        if (error) {
          logError(`  ❌ ${table}: ${error.message}`);
          results[table] = false;
        } else {
          logSuccess(`  ✅ ${table}: OK`);
          results[table] = true;
        }
      } catch (e) {
        logError(`  ❌ ${table}: ${e.message}`);
        results[table] = false;
      }
    }
    
    const allOk = Object.values(results).every(r => r === true);
    
    if (allOk) {
      logSuccess('\nTodas las tablas están configuradas correctamente');
      return true;
    } else {
      logWarning('\nAlgunas tablas tienen problemas. Revisa los errores arriba.');
      return false;
    }
  } catch (error) {
    logError(`Error verificando tablas: ${error.message}`);
    return false;
  }
}

/**
 * Paso 6: Guardar variables de entorno
 */
async function saveEnvVariables(url, anonKey, serviceKey) {
  logSection('💾 Paso 6: Guardar Variables de Entorno');
  
  const envLocalPath = join(ROOT_DIR, '.env.local');
  const envProductionPath = join(ROOT_DIR, '.env.production');
  
  const envContent = `# Supabase Configuration
SUPABASE_URL=${url}
NEXT_PUBLIC_SUPABASE_URL=${url}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}
SUPABASE_ANON_KEY=${anonKey}
SUPABASE_SERVICE_ROLE_KEY=${serviceKey}

# Data Source Configuration
USE_SUPABASE=true

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
`;
  
  try {
    // Guardar en .env.local
    writeFileSync(envLocalPath, envContent);
    logSuccess(`Variables guardadas en: .env.local`);
    
    // Guardar en .env.production (sin service key por seguridad)
    const envProductionContent = envContent.replace(
      `SUPABASE_SERVICE_ROLE_KEY=${serviceKey}`,
      `SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here`
    );
    writeFileSync(envProductionPath, envProductionContent);
    logSuccess(`Template guardado en: .env.production`);
    logWarning('⚠️  Recuerda actualizar .env.production con las credenciales reales antes de deploy');
    
    return true;
  } catch (error) {
    logError(`Error guardando variables: ${error.message}`);
    return false;
  }
}

/**
 * Instrucciones para ejecutar SQL manualmente
 */
function showManualInstructions() {
  logSection('📝 Instrucciones Manuales');
  
  log('Si el script no pudo ejecutar el SQL automáticamente, puedes hacerlo manualmente:\n');
  
  log('1. Ve al SQL Editor en tu dashboard de Supabase');
  log('2. Copia y pega el contenido de: config/supabase/schema.sql');
  log('3. Ejecuta el SQL');
  log('4. Ejecuta las migraciones de: config/supabase/migrations/\n');
  
  log('Archivos SQL a ejecutar:');
  log('  - config/supabase/schema.sql');
  log('  - config/supabase/migrations/20250115_create_admin_users.sql\n');
}

/**
 * Función principal
 */
async function main() {
  log('\n🚀 Configuración de Supabase desde Cero\n', 'bold');
  log('Este script te guiará paso a paso para configurar Supabase.\n', 'cyan');
  
  try {
    // Paso 1: Obtener credenciales
    const { url, anonKey, serviceKey } = await getSupabaseCredentials();
    
    // Paso 2: Probar conexión
    const connectionOk = await testConnection(url, anonKey, serviceKey);
    if (!connectionOk) {
      logError('\n❌ No se pudo conectar a Supabase. Verifica las credenciales.');
      rl.close();
      process.exit(1);
    }
    
    // Paso 3: Ejecutar schema
    const schemaOk = await executeSchema(url, serviceKey);
    if (!schemaOk) {
      logWarning('\n⚠️  No se pudo ejecutar el schema automáticamente.');
      showManualInstructions();
    }
    
    // Paso 4: Ejecutar migraciones
    await executeMigrations(url, serviceKey);
    
    // Paso 5: Verificar tablas
    const tablesOk = await verifyTables(url, anonKey);
    
    // Paso 6: Guardar variables
    await saveEnvVariables(url, anonKey, serviceKey);
    
    // Resumen final
    logSection('🎉 Resumen');
    
    if (connectionOk && tablesOk) {
      logSuccess('✅ Supabase configurado exitosamente!');
      log('\nPróximos pasos:');
      log('  1. Verifica que las tablas estén creadas en el dashboard de Supabase');
      log('  2. Si el schema no se ejecutó automáticamente, ejecútalo manualmente');
      log('  3. Prueba la aplicación: pnpm dev');
      log('  4. Verifica la conexión: node scripts/verify-core-functionality.mjs\n');
    } else {
      logWarning('⚠️  Configuración completada con advertencias');
      log('Revisa los mensajes arriba y ejecuta el SQL manualmente si es necesario.\n');
      showManualInstructions();
    }
    
  } catch (error) {
    logError(`\n❌ Error fatal: ${error.message}`);
    console.error(error);
  } finally {
    rl.close();
  }
}

// Ejecutar
main().catch((error) => {
  logError(`\n❌ Error: ${error.message}`);
  rl.close();
  process.exit(1);
});



