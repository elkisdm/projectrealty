#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🔍 Verificando preparación para producción...\n');

let allChecksPassed = true;

// Función para ejecutar comandos y manejar errores
function runCheck(name, command) {
  try {
    console.log(`✅ ${name}...`);
    execSync(command, { stdio: 'pipe' });
    console.log(`   ✅ ${name} - PASÓ\n`);
    return true;
  } catch (error) {
    console.log(`   ❌ ${name} - FALLÓ`);
    console.log(`   Error: ${error.message}\n`);
    return false;
  }
}

// Función para verificar archivos
function checkFile(name, path) {
  try {
    console.log(`✅ ${name}...`);
    if (existsSync(path)) {
      console.log(`   ✅ ${name} - EXISTE\n`);
      return true;
    } else {
      console.log(`   ❌ ${name} - NO EXISTE\n`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ ${name} - ERROR: ${error.message}\n`);
    return false;
  }
}

// 1. Verificar TypeScript
allChecksPassed = runCheck('TypeScript', 'npm run typecheck') && allChecksPassed;

// 2. Verificar Build
allChecksPassed = runCheck('Build de producción', 'npm run build') && allChecksPassed;

// 3. Verificar archivos de configuración
allChecksPassed = checkFile('Configuración de producción', 'config/env.production.example') && allChecksPassed;
allChecksPassed = checkFile('Configuración de ejemplo', 'config/env.example') && allChecksPassed;

// 4. Verificar package.json
try {
  console.log('✅ Package.json...');
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  const requiredScripts = ['build', 'start', 'typecheck'];
  const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);
  
  if (missingScripts.length === 0) {
    console.log('   ✅ Package.json - Scripts requeridos presentes\n');
  } else {
    console.log(`   ❌ Package.json - Scripts faltantes: ${missingScripts.join(', ')}\n`);
    allChecksPassed = false;
  }
} catch (error) {
  console.log(`   ❌ Package.json - ERROR: ${error.message}\n`);
  allChecksPassed = false;
}

// 5. Verificar next.config
allChecksPassed = checkFile('Next.js config', 'next.config.mjs') && allChecksPassed;

// 6. Verificar estructura de directorios críticos
const criticalDirs = [
  'app',
  'components',
  'lib',
  'public',
  'tests'
];

console.log('✅ Estructura de directorios...');
for (const dir of criticalDirs) {
  if (existsSync(dir)) {
    console.log(`   ✅ ${dir}/ - EXISTE`);
  } else {
    console.log(`   ❌ ${dir}/ - NO EXISTE`);
    allChecksPassed = false;
  }
}
console.log('');

// Resumen final
console.log('='.repeat(50));
if (allChecksPassed) {
  console.log('🎉 ¡PROYECTO LISTO PARA PRODUCCIÓN!');
  console.log('');
  console.log('📋 Próximos pasos:');
  console.log('1. Configurar variables de entorno de producción');
  console.log('2. Configurar Supabase para producción');
  console.log('3. Configurar dominio y SSL');
  console.log('4. Ejecutar smoke tests en staging');
  console.log('5. Deploy a producción');
} else {
  console.log('❌ PROYECTO NO ESTÁ LISTO PARA PRODUCCIÓN');
  console.log('');
  console.log('🔧 Problemas encontrados:');
  console.log('- Revisa los errores arriba');
  console.log('- Arregla los problemas críticos antes del deploy');
}
console.log('='.repeat(50));

process.exit(allChecksPassed ? 0 : 1);
