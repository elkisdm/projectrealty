#!/usr/bin/env node

/**
 * Script de diagnóstico para verificar configuración de Supabase
 * Identifica qué falta para que las propiedades aparezcan
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, colors.cyan);
  log(title, colors.bold + colors.cyan);
  log('='.repeat(60), colors.cyan);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

async function checkEnvVariables() {
  logSection('1. Verificación de Variables de Entorno');
  
  const requiredVars = {
    'USE_SUPABASE': process.env.USE_SUPABASE,
    'SUPABASE_URL': process.env.SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'SUPABASE_ANON_KEY': process.env.SUPABASE_ANON_KEY,
    'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
  
  let allPresent = true;
  const missing = [];
  
  for (const [varName, value] of Object.entries(requiredVars)) {
    if (value) {
      if (varName.includes('KEY')) {
        logSuccess(`${varName}: Configurada (${value.substring(0, 20)}...)`);
      } else {
        logSuccess(`${varName}: ${value}`);
      }
    } else {
      logError(`${varName}: NO configurada`);
      missing.push(varName);
      allPresent = false;
    }
  }
  
  // Verificar USE_SUPABASE específicamente
  if (process.env.USE_SUPABASE !== 'true') {
    logWarning('USE_SUPABASE no está configurado como "true"');
    logInfo('Valor actual: ' + (process.env.USE_SUPABASE || 'undefined'));
    logInfo('Esto hará que el sistema use datos mock en lugar de Supabase');
    allPresent = false;
  } else {
    logSuccess('USE_SUPABASE está configurado correctamente como "true"');
  }
  
  return { allPresent, missing };
}

async function checkSupabaseConnection() {
  logSection('2. Verificación de Conexión a Supabase');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    logError('No se puede verificar conexión: faltan variables de entorno');
    return false;
  }
  
  try {
    // Intentar con anon key primero
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });
    
    logInfo('Probando conexión con ANON key...');
    const { data, error } = await client
      .from('buildings')
      .select('count')
      .limit(0);
    
    if (error) {
      logError(`Error de conexión: ${error.message}`);
      if (error.message.includes('does not exist')) {
        logWarning('La tabla "buildings" no existe en Supabase');
        logInfo('Necesitas ejecutar las migraciones SQL primero');
      }
      return false;
    }
    
    logSuccess('Conexión exitosa con ANON key');
    
    // Si hay service key, probar con ella también
    if (supabaseServiceKey) {
      logInfo('Probando conexión con SERVICE ROLE key...');
      const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false },
      });
      
      const { error: adminError } = await adminClient
        .from('buildings')
        .select('count')
        .limit(0);
      
      if (adminError) {
        logWarning(`Service role key tiene problemas: ${adminError.message}`);
      } else {
        logSuccess('Conexión exitosa con SERVICE ROLE key');
      }
    }
    
    return true;
  } catch (error) {
    logError(`Error inesperado: ${error.message}`);
    return false;
  }
}

async function checkSupabaseData() {
  logSection('3. Verificación de Datos en Supabase');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    logError('No se puede verificar datos: faltan variables de entorno');
    return { hasData: false, buildingCount: 0, unitCount: 0 };
  }
  
  try {
    const client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });
    
    // Contar edificios
    logInfo('Contando edificios...');
    const { count: buildingCount, error: buildingsError } = await client
      .from('buildings')
      .select('*', { count: 'exact', head: true });
    
    if (buildingsError) {
      logError(`Error contando edificios: ${buildingsError.message}`);
      return { hasData: false, buildingCount: 0, unitCount: 0 };
    }
    
    logInfo(`Edificios encontrados: ${buildingCount || 0}`);
    
    // Contar unidades
    logInfo('Contando unidades...');
    const { count: unitCount, error: unitsError } = await client
      .from('units')
      .select('*', { count: 'exact', head: true });
    
    if (unitsError) {
      logError(`Error contando unidades: ${unitsError.message}`);
      return { hasData: false, buildingCount: buildingCount || 0, unitCount: 0 };
    }
    
    logInfo(`Unidades encontradas: ${unitCount || 0}`);
    
    // Verificar edificios con unidades válidas
    if (buildingCount > 0) {
      logInfo('Verificando edificios con unidades válidas...');
      const { data: buildingsWithUnits, error: relationError } = await client
        .from('buildings')
        .select(`
          id,
          name,
          units!left (
            id,
            tipologia,
            price
          )
        `)
        .limit(10);
      
      if (!relationError && buildingsWithUnits) {
        const validBuildings = buildingsWithUnits.filter(b => {
          const units = b.units || [];
          return units.some(u => u.id && u.tipologia && u.price && u.price > 0);
        });
        
        logInfo(`Edificios con unidades válidas: ${validBuildings.length} de ${buildingsWithUnits.length} muestreados`);
        
        if (validBuildings.length === 0 && buildingsWithUnits.length > 0) {
          logWarning('⚠️  PROBLEMA: Hay edificios pero ninguno tiene unidades válidas');
          logInfo('Las unidades necesitan: id, tipologia, y price > 0');
        }
      }
    }
    
    const hasData = (buildingCount || 0) > 0 && (unitCount || 0) > 0;
    
    if (hasData) {
      logSuccess(`Hay datos en Supabase: ${buildingCount} edificios, ${unitCount} unidades`);
    } else {
      logWarning('No hay datos en Supabase');
      logInfo('Necesitas ejecutar el script de ingesta de datos');
    }
    
    return { hasData, buildingCount: buildingCount || 0, unitCount: unitCount || 0 };
  } catch (error) {
    logError(`Error verificando datos: ${error.message}`);
    return { hasData: false, buildingCount: 0, unitCount: 0 };
  }
}

function checkEnvFiles() {
  logSection('4. Verificación de Archivos .env');
  
  const envFiles = [
    { path: '.env.local', name: 'Local' },
    { path: '.env.production', name: 'Producción' },
  ];
  
  for (const envFile of envFiles) {
    const filePath = join(process.cwd(), envFile.path);
    
    if (existsSync(filePath)) {
      logSuccess(`${envFile.name}: ${envFile.path} existe`);
      
      try {
        const content = readFileSync(filePath, 'utf-8');
        const hasUseSupabase = content.includes('USE_SUPABASE=true');
        const hasSupabaseUrl = content.includes('SUPABASE_URL=');
        
        if (hasUseSupabase) {
          logSuccess(`  - USE_SUPABASE=true encontrado`);
        } else {
          logWarning(`  - USE_SUPABASE no está configurado como "true"`);
        }
        
        if (hasSupabaseUrl) {
          logSuccess(`  - SUPABASE_URL configurado`);
        } else {
          logWarning(`  - SUPABASE_URL no encontrado`);
        }
      } catch (error) {
        logError(`  - Error leyendo archivo: ${error.message}`);
      }
    } else {
      logInfo(`${envFile.name}: ${envFile.path} no existe (opcional)`);
    }
  }
}

function generateVercelInstructions(missing) {
  logSection('5. Instrucciones para Configurar en Vercel');
  
  if (missing.length === 0) {
    logSuccess('Todas las variables están configuradas localmente');
    logInfo('Asegúrate de que también estén en Vercel Dashboard');
  } else {
    logWarning(`Faltan ${missing.length} variable(s) de entorno`);
  }
  
  log('\n📋 Pasos para configurar en Vercel:');
  log('1. Ve a https://vercel.com/dashboard');
  log('2. Selecciona tu proyecto "tremendoarriendo"');
  log('3. Ve a Settings → Environment Variables');
  log('4. Agrega las siguientes variables:');
  log('');
  
  const requiredVars = [
    { name: 'USE_SUPABASE', value: 'true', description: 'Habilita uso de Supabase' },
    { name: 'SUPABASE_URL', value: 'https://lytgdrbdyvmvziypvumy.supabase.co', description: 'URL de Supabase' },
    { name: 'NEXT_PUBLIC_SUPABASE_URL', value: 'https://lytgdrbdyvmvziypvumy.supabase.co', description: 'URL pública de Supabase' },
    { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: 'tu-anon-key', description: 'Clave anónima pública' },
    { name: 'SUPABASE_ANON_KEY', value: 'tu-anon-key', description: 'Clave anónima' },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', value: 'tu-service-role-key', description: 'Clave de servicio (admin)' },
  ];
  
  for (const varInfo of requiredVars) {
    const isMissing = missing.includes(varInfo.name);
    const marker = isMissing ? '❌' : '✅';
    log(`${marker} ${varInfo.name}=${varInfo.value}`);
    log(`   ${varInfo.description}`);
    if (isMissing) {
      log(`   ⚠️  REQUERIDO - Esta variable falta`);
    }
    log('');
  }
  
  log('5. Marca TODAS las variables para:');
  log('   ☑️  Production');
  log('   ☑️  Preview');
  log('   ☑️  Development');
  log('');
  log('6. Después de agregar las variables, haz un nuevo deploy:');
  log('   vercel --prod');
  log('');
  logWarning('IMPORTANTE: Las variables de entorno solo se aplican en nuevos deploys');
}

async function main() {
  log('\n🔍 DIAGNÓSTICO DE CONFIGURACIÓN SUPABASE', colors.bold + colors.cyan);
  log('='.repeat(60), colors.cyan);
  
  // Cargar variables de entorno desde .env.local si existe
  try {
    const dotenv = await import('dotenv');
    const envLocal = dotenv.config({ path: '.env.local' });
    if (envLocal.parsed) {
      logInfo('Variables cargadas desde .env.local');
    }
  } catch (error) {
    // dotenv no disponible o no hay .env.local
  }
  
  const envCheck = await checkEnvVariables();
  checkEnvFiles();
  
  if (envCheck.allPresent) {
    const connectionOk = await checkSupabaseConnection();
    if (connectionOk) {
      await checkSupabaseData();
    }
  } else {
    logWarning('No se puede verificar conexión: faltan variables de entorno');
  }
  
  generateVercelInstructions(envCheck.missing);
  
  logSection('Resumen');
  
  if (envCheck.allPresent) {
    logSuccess('✅ Variables de entorno: OK');
  } else {
    logError('❌ Variables de entorno: FALTANTES');
    logInfo(`   Faltan: ${envCheck.missing.join(', ')}`);
  }
  
  log('\n💡 Próximos pasos:');
  if (!envCheck.allPresent) {
    log('1. Configura las variables faltantes en Vercel Dashboard');
    log('2. Haz un nuevo deploy después de configurar');
  } else {
    log('1. Verifica que las variables también estén en Vercel');
    log('2. Si hay datos en Supabase pero no aparecen, revisa los logs del deploy');
  }
  log('');
}

main().catch((error) => {
  logError(`Error ejecutando diagnóstico: ${error.message}`);
  process.exit(1);
});


