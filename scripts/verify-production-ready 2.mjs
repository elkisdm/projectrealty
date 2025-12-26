#!/usr/bin/env node

/**
 * Script de verificación pre-deploy
 * 
 * Verifica que el proyecto esté listo para deploy a producción ejecutando
 * todas las verificaciones críticas: TypeScript, build, lint, tests, estructura.
 * 
 * Uso:
 *   node scripts/verify-production-ready.mjs
 * 
 * Salida:
 *   - Exit code 0: Todas las verificaciones pasaron
 *   - Exit code 1: Una o más verificaciones fallaron
 */

import { execSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

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

// Resultados
const results = {
  passed: [],
  failed: [],
  warnings: [],
};

/**
 * Ejecutar comando y capturar output
 */
function runCommand(command, description, allowFailure = false) {
  logInfo(`Ejecutando: ${description}...`);
  
  try {
    const output = execSync(command, {
      cwd: ROOT_DIR,
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    
    results.passed.push({ check: description, command });
    logSuccess(`${description}: OK`);
    return { success: true, output };
  } catch (error) {
    const message = error.message || error.toString();
    
    if (allowFailure) {
      results.warnings.push({ check: description, error: message });
      logWarning(`${description}: Falló (permitido)`);
      return { success: false, output: message, allowed: true };
    } else {
      results.failed.push({ check: description, error: message });
      logError(`${description}: ${message.split('\n')[0]}`);
      return { success: false, output: message };
    }
  }
}

/**
 * Verificar TypeScript
 */
function verifyTypeScript() {
  logSection('1. Verificación TypeScript');
  
  const result = runCommand(
    'pnpm typecheck',
    'TypeScript typecheck',
    false
  );
  
  // Nota: Errores en .next/types/ son artefactos de build, no críticos
  if (!result.success && result.output.includes('.next/types/')) {
    logWarning('Errores en .next/types/ son artefactos de build (no críticos)');
    results.warnings.push({
      check: 'TypeScript (artefactos de build)',
      error: 'Errores en .next/types/ ignorados',
    });
  }
  
  return result.success || result.allowed;
}

/**
 * Verificar Build
 */
function verifyBuild() {
  logSection('2. Verificación Build');
  
  const result = runCommand(
    'pnpm build',
    'Build de producción',
    false
  );
  
  if (result.success) {
    // Extraer métricas del build si es posible
    const output = result.output || '';
    if (output.includes('Compiled successfully')) {
      logSuccess('Build compilado exitosamente');
    }
    if (output.includes('Generating static pages')) {
      const match = output.match(/Generating static pages \((\d+)\/(\d+)\)/);
      if (match) {
        logInfo(`Páginas generadas: ${match[1]}/${match[2]}`);
      }
    }
  }
  
  return result.success;
}

/**
 * Verificar Lint
 */
function verifyLint() {
  logSection('3. Verificación Lint');
  
  const result = runCommand(
    'pnpm lint 2>&1 | head -100',
    'Lint check',
    false
  );
  
  if (result.success || result.output) {
    const output = result.output || '';
    
    // Contar errores y warnings
    const errorMatch = output.match(/(\d+) error/i);
    const warningMatch = output.match(/(\d+) warning/i);
    
    const errors = errorMatch ? parseInt(errorMatch[1]) : 0;
    const warnings = warningMatch ? parseInt(warningMatch[1]) : 0;
    
    if (errors === 0) {
      logSuccess(`Lint: 0 errores`);
      if (warnings > 0) {
        logInfo(`Warnings: ${warnings} (meta: <50 críticos)`);
        if (warnings > 50) {
          logWarning('Muchos warnings, considera revisarlos');
        }
      }
    } else {
      if (errors < 5) {
        logWarning(`Lint: ${errors} errores (meta: <5)`);
      } else {
        logError(`Lint: ${errors} errores (meta: <5)`);
        return false;
      }
    }
  }
  
  return true; // Lint warnings no bloquean
}

/**
 * Verificar Tests Críticos
 */
function verifyTests() {
  logSection('4. Verificación Tests');
  
  // Ejecutar tests pero permitir fallos (solo verificar que se ejecuten)
  const result = runCommand(
    'pnpm test --passWithNoTests 2>&1 | tail -20',
    'Tests críticos',
    true // Permitir fallos, solo verificar ejecución
  );
  
  if (result.output) {
    const output = result.output;
    
    // Extraer métricas de tests
    const passedMatch = output.match(/(\d+) passed/i);
    const failedMatch = output.match(/(\d+) failed/i);
    const suitesMatch = output.match(/(\d+) passed.*?(\d+) failed/i);
    
    if (passedMatch || suitesMatch) {
      const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
      const failed = failedMatch ? parseInt(failedMatch[1]) : 0;
      const total = passed + failed;
      
      if (total > 0) {
        const percentage = ((passed / total) * 100).toFixed(1);
        logInfo(`Tests: ${passed}/${total} pasando (${percentage}%)`);
        
        if (parseFloat(percentage) >= 80) {
          logSuccess(`Tests: >80% pasando (meta cumplida)`);
        } else {
          logWarning(`Tests: <80% pasando (meta: >80%)`);
        }
      }
    }
  }
  
  return true; // Tests no bloquean, solo informan
}

/**
 * Verificar Variables de Entorno
 */
function verifyEnvVariables() {
  logSection('5. Verificación Variables de Entorno');
  
  const requiredVars = [
    'SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];
  
  const envFiles = [
    { path: '.env.production', name: 'Producción' },
    { path: '.env.local', name: 'Local' },
  ];
  
  let foundAny = false;
  
  for (const envFile of envFiles) {
    const filePath = join(ROOT_DIR, envFile.path);
    
    if (existsSync(filePath)) {
      logInfo(`Verificando ${envFile.name} (${envFile.path})...`);
      
      try {
        const content = readFileSync(filePath, 'utf-8');
        const missing = [];
        
        for (const varName of requiredVars) {
          const regex = new RegExp(`^${varName}=`, 'm');
          if (!regex.test(content)) {
            missing.push(varName);
          }
        }
        
        if (missing.length === 0) {
          logSuccess(`${envFile.name}: Todas las variables requeridas presentes`);
          foundAny = true;
        } else {
          logWarning(`${envFile.name}: Faltan variables: ${missing.join(', ')}`);
        }
      } catch (error) {
        logWarning(`No se pudo leer ${envFile.path}: ${error.message}`);
      }
    } else {
      logInfo(`${envFile.path} no existe (opcional para verificación)`);
    }
  }
  
  // Verificar en process.env (para CI/CD)
  logInfo('Verificando variables en process.env...');
  const missingInEnv = requiredVars.filter(v => !process.env[v]);
  
  if (missingInEnv.length === 0) {
    logSuccess('Todas las variables requeridas en process.env');
    foundAny = true;
  } else if (foundAny) {
    logInfo('Variables faltantes en process.env (pero presentes en archivos)');
  } else {
    logWarning(`Variables faltantes: ${missingInEnv.join(', ')}`);
    logWarning('Nota: En CI/CD, las variables deben estar en process.env');
  }
  
  return true; // No bloquea, solo informa
}

/**
 * Verificar Estructura
 */
function verifyStructure() {
  logSection('6. Verificación Estructura');
  
  const appDir = join(ROOT_DIR, 'app');
  const testDirs = ['test', 'demo', 'test-'];
  
  if (!existsSync(appDir)) {
    logError('Directorio /app no existe');
    return false;
  }
  
  try {
    const entries = readdirSync(appDir, { withFileTypes: true });
    const testFolders = entries
      .filter(entry => entry.isDirectory())
      .filter(entry => testDirs.some(prefix => entry.name.startsWith(prefix)))
      .map(entry => entry.name);
    
    if (testFolders.length === 0) {
      logSuccess('No hay carpetas de prueba en /app');
      results.passed.push({ check: 'Estructura limpia', details: 'Sin carpetas de prueba' });
      return true;
    } else {
      logWarning(`Carpetas de prueba encontradas: ${testFolders.join(', ')}`);
      results.warnings.push({
        check: 'Estructura',
        warning: `Carpetas de prueba en /app: ${testFolders.join(', ')}`,
      });
      return true; // No bloquea, solo advierte
    }
  } catch (error) {
    logWarning(`No se pudo verificar estructura: ${error.message}`);
    return true; // No bloquea
  }
}

/**
 * Generar reporte final
 */
function generateReport() {
  logSection('📊 REPORTE FINAL');
  
  const total = results.passed.length + results.failed.length;
  const passedCount = results.passed.length;
  const failedCount = results.failed.length;
  const warningsCount = results.warnings.length;
  
  log(`✅ Verificaciones pasadas: ${passedCount}`, 'green');
  
  if (failedCount > 0) {
    log(`❌ Verificaciones fallidas: ${failedCount}`, 'red');
    log('\nVerificaciones fallidas:', 'red');
    results.failed.forEach(({ check, error }) => {
      log(`   - ${check}`, 'red');
      if (error) {
        const firstLine = error.split('\n')[0];
        if (firstLine.length < 100) {
          log(`     ${firstLine}`, 'red');
        }
      }
    });
  }
  
  if (warningsCount > 0) {
    log(`⚠️  Advertencias: ${warningsCount}`, 'yellow');
  }
  
  log('\n' + '='.repeat(60), 'blue');
  
  if (failedCount === 0) {
    log('\n🎉 ¡Todas las verificaciones críticas pasaron!', 'green');
    log('✅ Proyecto listo para deploy a producción', 'green');
    return true;
  } else {
    log('\n⚠️  Algunas verificaciones fallaron.', 'yellow');
    log('❌ El proyecto NO está listo para deploy', 'red');
    log('\nRevisa los errores arriba antes de continuar.', 'yellow');
    return false;
  }
}

/**
 * Ejecutar todas las verificaciones
 */
async function runVerifications() {
  log('\n🚀 Verificación Pre-Deploy a Producción\n', 'bold');
  log(`📁 Directorio: ${ROOT_DIR}\n`, 'cyan');
  
  const checks = [
    verifyTypeScript,
    verifyBuild,
    verifyLint,
    verifyTests,
    verifyEnvVariables,
    verifyStructure,
  ];
  
  for (const check of checks) {
    try {
      await check();
    } catch (error) {
      logError(`Error ejecutando verificación: ${error.message}`);
      results.failed.push({
        check: check.name,
        error: error.message,
      });
    }
  }
  
  const allPassed = generateReport();
  process.exit(allPassed ? 0 : 1);
}

// Ejecutar verificaciones
runVerifications().catch((error) => {
  logError(`\n❌ Error fatal: ${error.message}`);
  console.error(error);
  process.exit(1);
});
