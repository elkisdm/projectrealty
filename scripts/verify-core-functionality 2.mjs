#!/usr/bin/env node

/**
 * Script de verificación de funcionalidad core
 * 
 * Verifica que las rutas principales y APIs estén funcionando correctamente.
 * 
 * Uso:
 *   node scripts/verify-core-functionality.mjs [baseUrl]
 * 
 * Ejemplo:
 *   node scripts/verify-core-functionality.mjs http://localhost:3000
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración
const DEFAULT_BASE_URL = 'http://localhost:3000';
const TIMEOUT_MS = 10000; // 10 segundos
const TEST_PROPERTY_SLUG = 'alferez-real'; // Slug de prueba desde data/buildings

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
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

// Obtener base URL desde argumentos o usar default
const baseUrl = process.argv[2] || DEFAULT_BASE_URL;

// Resultados
const results = {
  passed: [],
  failed: [],
  warnings: [],
};

/**
 * Hacer petición HTTP con timeout
 */
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Timeout después de ${TIMEOUT_MS}ms`);
    }
    throw error;
  }
}

/**
 * Verificar una ruta
 */
async function verifyRoute(name, path, expectedStatus = 200, checkContent = null) {
  const url = `${baseUrl}${path}`;
  logInfo(`Verificando ${name}... (${url})`);

  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/json',
      },
    });

    const status = response.status;
    const contentType = response.headers.get('content-type') || '';

    // Verificar status
    if (status !== expectedStatus) {
      results.failed.push({
        name,
        path,
        error: `Status ${status} (esperado ${expectedStatus})`,
      });
      logError(`${name}: Status ${status} (esperado ${expectedStatus})`);
      return false;
    }

    // Verificar contenido si se especifica
    if (checkContent) {
      const text = await response.text();
      if (!text.includes(checkContent)) {
        results.warnings.push({
          name,
          path,
          warning: `No se encontró "${checkContent}" en la respuesta`,
        });
        logWarning(`${name}: No se encontró contenido esperado`);
      }
    }

    results.passed.push({ name, path, status });
    logSuccess(`${name}: OK (${status})`);
    return true;
  } catch (error) {
    results.failed.push({
      name,
      path,
      error: error.message,
    });
    logError(`${name}: ${error.message}`);
    return false;
  }
}

/**
 * Verificar API
 */
async function verifyAPI(name, path, expectedStatus = 200, validateJSON = null) {
  const url = `${baseUrl}${path}`;
  logInfo(`Verificando API ${name}... (${url})`);

  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const status = response.status;
    const contentType = response.headers.get('content-type') || '';

    // Verificar status
    if (status !== expectedStatus) {
      results.failed.push({
        name: `API ${name}`,
        path,
        error: `Status ${status} (esperado ${expectedStatus})`,
      });
      logError(`API ${name}: Status ${status} (esperado ${expectedStatus})`);
      return false;
    }

    // Verificar que sea JSON
    if (!contentType.includes('application/json')) {
      results.warnings.push({
        name: `API ${name}`,
        path,
        warning: `Content-Type no es JSON: ${contentType}`,
      });
      logWarning(`API ${name}: Content-Type no es JSON`);
    } else {
      // Validar JSON si se especifica
      if (validateJSON) {
        const json = await response.json();
        const isValid = validateJSON(json);
        if (!isValid) {
          results.warnings.push({
            name: `API ${name}`,
            path,
            warning: 'JSON no cumple validación',
          });
          logWarning(`API ${name}: JSON no cumple validación`);
        }
      }
    }

    results.passed.push({ name: `API ${name}`, path, status });
    logSuccess(`API ${name}: OK (${status})`);
    return true;
  } catch (error) {
    results.failed.push({
      name: `API ${name}`,
      path,
      error: error.message,
    });
    logError(`API ${name}: ${error.message}`);
    return false;
  }
}

/**
 * Verificar que el servidor esté corriendo
 */
async function verifyServerRunning() {
  logInfo(`Verificando servidor en ${baseUrl}...`);

  try {
    const response = await fetchWithTimeout(baseUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/html',
      },
    });

    if (response.ok) {
      logSuccess(`Servidor respondiendo en ${baseUrl}`);
      return true;
    } else {
      logError(`Servidor respondió con status ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`No se pudo conectar al servidor: ${error.message}`);
    logWarning(`Asegúrate de que el servidor esté corriendo:`);
    logWarning(`  pnpm dev`);
    return false;
  }
}

/**
 * Obtener slug de prueba desde datos
 */
function getTestSlug() {
  try {
    const dataPath = join(__dirname, '..', 'data', 'buildings', 'alferex-real.json');
    const data = JSON.parse(readFileSync(dataPath, 'utf-8'));
    return data.slug || TEST_PROPERTY_SLUG;
  } catch (error) {
    logWarning(`No se pudo leer slug de prueba, usando: ${TEST_PROPERTY_SLUG}`);
    return TEST_PROPERTY_SLUG;
  }
}

/**
 * Ejecutar todas las verificaciones
 */
async function runVerifications() {
  log('\n🚀 Iniciando verificación de funcionalidad core\n', 'blue');
  log(`📍 Base URL: ${baseUrl}\n`, 'cyan');

  // 1. Verificar servidor
  const serverRunning = await verifyServerRunning();
  if (!serverRunning) {
    logError('\n❌ El servidor no está corriendo. Abortando verificaciones.');
    process.exit(1);
  }

  log('\n📋 Verificando rutas principales...\n', 'blue');

  // 2. Landing page
  await verifyRoute('Landing page', '/', 200, 'hommie');

  // 3. Página de propiedad
  const testSlug = getTestSlug();
  await verifyRoute(`Página de propiedad (${testSlug})`, `/property/${testSlug}`, 200);

  // 4. Sistema admin
  await verifyRoute('Sistema admin (login)', '/admin/login', 200);

  // 5. Cotizador
  await verifyRoute('Cotizador', '/cotizador', 200);

  log('\n🔌 Verificando APIs principales...\n', 'blue');

  // 6. API Buildings
  await verifyAPI('Buildings', '/api/buildings', 200, (json) => {
    return Array.isArray(json) || (json && typeof json === 'object');
  });

  // 7. API Buildings Paginated
  await verifyAPI('Buildings Paginated', '/api/buildings/paginated?page=1&limit=10', 200);

  // 8. API Availability
  await verifyAPI('Availability', '/api/availability', 200);

  // 9. API Flags
  await verifyAPI('Flags', '/api/flags/override', 200);

  // Generar reporte
  generateReport();
}

/**
 * Generar reporte final
 */
function generateReport() {
  log('\n' + '='.repeat(60), 'blue');
  log('📊 REPORTE DE VERIFICACIÓN', 'blue');
  log('='.repeat(60) + '\n', 'blue');

  const total = results.passed.length + results.failed.length;
  const passedCount = results.passed.length;
  const failedCount = results.failed.length;
  const warningsCount = results.warnings.length;

  log(`✅ Pasaron: ${passedCount}/${total}`, 'green');
  if (failedCount > 0) {
    log(`❌ Fallaron: ${failedCount}/${total}`, 'red');
  }
  if (warningsCount > 0) {
    log(`⚠️  Advertencias: ${warningsCount}`, 'yellow');
  }

  if (results.failed.length > 0) {
    log('\n❌ Verificaciones fallidas:', 'red');
    results.failed.forEach(({ name, path, error }) => {
      log(`   - ${name} (${path}): ${error}`, 'red');
    });
  }

  if (results.warnings.length > 0) {
    log('\n⚠️  Advertencias:', 'yellow');
    results.warnings.forEach(({ name, path, warning }) => {
      log(`   - ${name} (${path}): ${warning}`, 'yellow');
    });
  }

  if (results.passed.length > 0) {
    log('\n✅ Verificaciones exitosas:', 'green');
    results.passed.forEach(({ name, path, status }) => {
      log(`   - ${name} (${path}): ${status}`, 'green');
    });
  }

  log('\n' + '='.repeat(60), 'blue');

  // Resumen final
  if (failedCount === 0) {
    log('\n🎉 ¡Todas las verificaciones críticas pasaron!', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Algunas verificaciones fallaron. Revisa los errores arriba.', 'yellow');
    process.exit(1);
  }
}

// Ejecutar verificaciones
runVerifications().catch((error) => {
  logError(`\n❌ Error fatal: ${error.message}`);
  console.error(error);
  process.exit(1);
});
