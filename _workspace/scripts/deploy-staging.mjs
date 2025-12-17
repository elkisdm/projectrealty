#!/usr/bin/env node

/**
 * Script de Deploy a Staging
 * Verifica que el proyecto esté listo para producción antes del deploy
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function warning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function checkStep(step, fn) {
  try {
    log(`\n${step}...`, colors.cyan);
    fn();
    success(`${step} completado`);
    return true;
  } catch (err) {
    error(`${step} falló: ${err.message}`);
    return false;
  }
}

function runCommand(command, options = {}) {
  return execSync(command, { 
    stdio: 'inherit', 
    encoding: 'utf8',
    ...options 
  });
}

function checkFileExists(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`Archivo no encontrado: ${filePath}`);
  }
}

function validateEnvFile() {
  const envPath = join(process.cwd(), '.env.production');
  checkFileExists(envPath);
  
  const envContent = readFileSync(envPath, 'utf8');
  
  // Verificar variables críticas
  const requiredVars = [
    'SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SITE_URL'
  ];
  
  for (const varName of requiredVars) {
    if (!envContent.includes(varName)) {
      throw new Error(`Variable de entorno requerida no encontrada: ${varName}`);
    }
  }
  
  // Verificar que no haya valores de ejemplo
  if (envContent.includes('your-project.supabase.co') || 
      envContent.includes('your-domain.com') ||
      envContent.includes('your-anon-key-here')) {
    throw new Error('Variables de entorno contienen valores de ejemplo. Configura los valores reales.');
  }
}

function main() {
  log('\n🚀 INICIANDO DEPLOY A STAGING', colors.magenta);
  log('=====================================\n', colors.magenta);
  
  const checks = [
    ['Verificando archivo .env.production', validateEnvFile],
    ['Ejecutando lint', () => runCommand('npm run lint')],
    ['Verificando tipos TypeScript', () => runCommand('npm run typecheck')],
    ['Ejecutando tests', () => runCommand('npm test')],
    ['Build de producción', () => runCommand('npm run build')],
    ['Ejecutando release gate', () => runCommand('node scripts/release-gate.mjs')],
  ];
  
  let allPassed = true;
  
  for (const [step, fn] of checks) {
    if (!checkStep(step, fn)) {
      allPassed = false;
      break;
    }
  }
  
  if (!allPassed) {
    error('\n❌ DEPLOY CANCELADO - Hay errores que deben corregirse antes del deploy');
    process.exit(1);
  }
  
  success('\n🎉 TODOS LOS CHECKS PASARON');
  info('\nPróximos pasos:');
  info('1. Verifica que las variables de entorno estén configuradas correctamente');
  info('2. Ejecuta el deploy a tu plataforma de staging (Vercel, Netlify, etc.)');
  info('3. Verifica que el sitio funcione correctamente en staging');
  info('4. Ejecuta pruebas de usuario en staging');
  info('5. Si todo está bien, procede con el deploy a producción');
  
  log('\n📋 Comandos sugeridos para deploy:', colors.yellow);
  log('   # Para Vercel:', colors.cyan);
  log('   vercel --prod', colors.reset);
  log('   # Para Netlify:', colors.cyan);
  log('   netlify deploy --prod', colors.reset);
  log('   # Para Railway:', colors.cyan);
  log('   railway up', colors.reset);
  
  log('\n🔒 RECUERDA:', colors.yellow);
  log('   - Nunca subas .env.production al repositorio');
  log('   - Configura las variables de entorno en tu plataforma de deploy');
  log('   - Verifica que las claves de Supabase sean correctas');
  log('   - Monitorea el sitio después del deploy');
}

// ES module equivalent
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
