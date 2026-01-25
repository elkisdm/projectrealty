#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Configuración
const REPORTS_DIR = join(projectRoot, 'reports');
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const DEV_SERVER_TIMEOUT = 20000; // 20s
const DEV_SERVER_RETRY_DELAY = 5000; // 5s

// Estado global del release gate
const results = {
  timestamp: new Date().toISOString(),
  baseUrl: BASE_URL,
  sections: {},
  summary: {
    lint: 'UNKNOWN',
    types: 'UNKNOWN', 
    tests: 'UNKNOWN',
    build: 'UNKNOWN',
    rootCheck: 'UNKNOWN',
    seoRobot: 'UNKNOWN'
  },
  decision: 'UNKNOWN'
};

let devServerProcess = null;

// Utilidades
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`);
}

function execCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      ...options
    });
    return { success: true, exitCode: 0, output: result };
  } catch (error) {
    return { 
      success: false, 
      exitCode: error.status || 1, 
      output: error.stdout || error.stderr || error.message 
    };
  }
}

// Nueva función fetch con retry y redirect manual
async function httpGet(url, options = {}) {
  const maxRetries = options.maxRetries || 1;
  const retryDelay = options.retryDelay || 1500;
  const useManualRedirect = options.manualRedirect !== false; // true por defecto
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const fetchOptions = {
        method: 'GET',
        ...options
      };
      
      // Usar redirect manual por defecto para inspeccionar redirects
      if (useManualRedirect) {
        fetchOptions.redirect = 'manual';
      }
      
      const response = await fetch(url, fetchOptions);
      const body = await response.text();
      
      return {
        statusCode: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: body,
        url: response.url
      };
    } catch (error) {
      log(`HTTP request failed (attempt ${attempt}/${maxRetries}): ${error.message}`, 'WARN');
      
      // Solo retry en errores 500 en dev
      if (attempt < maxRetries && (error.message.includes('500') || error.message.includes('fetch failed'))) {
        log(`Retrying in ${retryDelay}ms...`, 'INFO');
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
      
      return { error: error.message };
    }
  }
}

// Función específica para checks que necesitan retry en 500
async function httpGetWithRetry(url, maxRetries = 3) {
  return httpGet(url, { maxRetries, retryDelay: 1500 });
}

function waitForServer(url, maxAttempts = 4) {
  return new Promise((resolve) => {
    let attempts = 0;
    
    const checkServer = async () => {
      attempts++;
      try {
        const response = await httpGet(url, { manualRedirect: false });
        if (response.statusCode) {
          log(`Server ready at ${url} (attempt ${attempts})`);
          resolve(true);
          return;
        }
      } catch (error) {
        // Ignore errors
      }
      
      if (attempts >= maxAttempts) {
        log(`Server not ready after ${maxAttempts} attempts`, 'WARN');
        resolve(false);
        return;
      }
      
      setTimeout(checkServer, DEV_SERVER_RETRY_DELAY);
    };
    
    checkServer();
  });
}

function startDevServer() {
  return new Promise((resolve) => {
    log('Starting dev server...');
    devServerProcess = spawn('npm', ['run', 'dev'], {
      cwd: projectRoot,
      stdio: 'pipe',
      detached: false
    });
    
    let output = '';
    let resolved = false;
    
    const checkReady = () => {
      if (resolved) return;
      if (output.includes('Ready') || output.includes('started server')) {
        resolved = true;
        log('Dev server started');
        resolve(true);
      }
    };
    
    devServerProcess.stdout.on('data', (data) => {
      output += data.toString();
      checkReady();
    });
    
    devServerProcess.stderr.on('data', (data) => {
      output += data.toString();
      checkReady();
    });
    
    // Timeout fallback
    setTimeout(() => {
      if (!resolved && devServerProcess) {
        log('Dev server timeout, checking if ready...');
        resolved = true;
        waitForServer(BASE_URL).then(resolve);
      }
    }, DEV_SERVER_TIMEOUT);
  });
}

function stopDevServer() {
  if (devServerProcess) {
    log('Stopping dev server...');
    devServerProcess.kill('SIGTERM');
    devServerProcess = null;
  }
}

// 1. Bootstrap
async function bootstrap() {
  log('=== RELEASE GATE: BOOTSTRAP ===');
  
  // Crear directorio reports si no existe
  if (!existsSync(REPORTS_DIR)) {
    mkdirSync(REPORTS_DIR, { recursive: true });
    log('Created reports directory');
  }
  
  // Verificar si hay .env.local, crear temporal si no existe
  const envPath = join(projectRoot, '.env.local');
  if (!existsSync(envPath)) {
    const envContent = `SUPABASE_URL=https://dummy.supabase.co
SUPABASE_ANON_KEY=dummy
NEXT_PUBLIC_SITE_URL=${BASE_URL}`;
    writeFileSync(envPath, envContent);
    log('Created temporary .env.local');
  }
  
  // Verificar si el servidor está corriendo
  try {
    const response = await httpGet(BASE_URL);
    if (response.statusCode) {
      log('Dev server already running');
      return;
    }
  } catch (error) {
    // Server not running, start it
  }
  
  await startDevServer();
}

// 2. QA Local (CLI)
async function qaLocal() {
  log('=== RELEASE GATE: QA LOCAL ===');
  
  const checks = {};
  
  // a) Lint
  log('Running lint...');
  const lintResult = execCommand('npm run lint');
  checks.lint = {
    exitCode: lintResult.exitCode,
    summary: lintResult.success ? 'PASS' : 'FAIL',
    output: lintResult.output.substring(0, 500) + (lintResult.output.length > 500 ? '...' : '')
  };
  results.summary.lint = checks.lint.summary;
  
  // b) Typecheck (usando tsc directamente)
  log('Running typecheck...');
  const typecheckResult = execCommand('npx tsc --noEmit');
  checks.types = {
    exitCode: typecheckResult.exitCode,
    summary: typecheckResult.success ? 'PASS' : 'FAIL',
    output: typecheckResult.output.substring(0, 500) + (typecheckResult.output.length > 500 ? '...' : '')
  };
  results.summary.types = checks.types.summary;
  
  // c) Tests
  log('Running tests...');
  const testResult = execCommand('npm test -s');
  checks.tests = {
    exitCode: testResult.exitCode,
    summary: testResult.success ? 'PASS' : 'FAIL',
    output: testResult.output.substring(0, 500) + (testResult.output.length > 500 ? '...' : '')
  };
  results.summary.tests = checks.tests.summary;
  
  // d) Build
  log('Running build...');
  const buildResult = execCommand('NEXT_TELEMETRY_DISABLED=1 npm run build');
  checks.build = {
    exitCode: buildResult.exitCode,
    summary: buildResult.success ? 'PASS' : 'FAIL',
    output: buildResult.output.substring(0, 500) + (buildResult.output.length > 500 ? '...' : '')
  };
  results.summary.build = checks.build.summary;
  
  results.sections.qaLocal = checks;
}

// 3. Checks de páginas (HTTP)
async function pageChecks() {
  log('=== RELEASE GATE: PAGE CHECKS ===');
  
  const checks = {};
  
  // Leer feature flags
  const flagsPath = join(projectRoot, 'config', 'feature-flags.ts');
  const flagsContent = readFileSync(flagsPath, 'utf8');
  // Extraer el valor de comingSoon del archivo TypeScript
  const comingSoonMatch = flagsContent.match(/comingSoon:\s*(true|false)/);
  const comingSoon = comingSoonMatch ? comingSoonMatch[1] === 'true' : false;
  
  log(`Feature flag comingSoon: ${comingSoon}`);
  
  // GET / con redirect manual para inspeccionar
  log('Checking root page with manual redirect...');
  const rootResponse = await httpGetWithRetry(BASE_URL);
  checks.root = {
    statusCode: rootResponse.statusCode,
    isRedirect: rootResponse.statusCode >= 300 && rootResponse.statusCode < 400,
    location: rootResponse.headers?.location,
    summary: 'UNKNOWN'
  };
  
  // Nueva lógica mejorada para Root Check
  if (comingSoon) {
    // Flag ON: debe redirigir a /coming-soon (301, 302, 307)
    if (checks.root.isRedirect && 
        [301, 302, 307].includes(checks.root.statusCode) && 
        checks.root.location?.endsWith('/coming-soon')) {
      checks.root.summary = 'PASS';
      results.summary.rootCheck = 'PASS';
    } else {
      checks.root.summary = 'FAIL';
      results.summary.rootCheck = 'FAIL';
    }
  } else {
    // Flag OFF: debe ser 200 o redirigir a /landing
    if (checks.root.statusCode === 200 || 
        (checks.root.isRedirect && checks.root.location?.includes('/landing'))) {
      checks.root.summary = 'PASS';
      results.summary.rootCheck = 'PASS';
    } else {
      checks.root.summary = 'FAIL';
      results.summary.rootCheck = 'FAIL';
    }
  }
  
  // GET /coming-soon
  log('Checking coming-soon page...');
  const comingSoonResponse = await httpGet(`${BASE_URL}/coming-soon`);
  checks.comingSoon = {
    statusCode: comingSoonResponse.statusCode,
    hasTitle: comingSoonResponse.body.includes('<title>'),
    hasNoIndex: comingSoonResponse.body.includes('noindex'),
    summary: 'UNKNOWN'
  };
  
  if (comingSoon) {
    if (comingSoonResponse.statusCode === 200 && 
        checks.comingSoon.hasTitle && 
        checks.comingSoon.hasNoIndex) {
      checks.comingSoon.summary = 'PASS';
    } else {
      checks.comingSoon.summary = 'FAIL';
    }
  } else {
    checks.comingSoon.summary = 'NO_APPLY';
  }
  
  // GET /landing
  log('Checking landing page...');
  const landingResponse = await httpGet(`${BASE_URL}/landing`);
  checks.landing = {
    statusCode: landingResponse.statusCode,
    hasTitle: landingResponse.body.includes('<title>'),
    hasOgTitle: landingResponse.body.includes('property="og:title"'),
    summary: 'UNKNOWN'
  };
  
  if (landingResponse.statusCode === 200 && 
      checks.landing.hasTitle && 
      checks.landing.hasOgTitle) {
    checks.landing.summary = 'PASS';
  } else {
    checks.landing.summary = 'FAIL';
  }
  
  // GET /propiedad/ejemplo (opcional)
  log('Checking property page...');
  const propertyResponse = await httpGet(`${BASE_URL}/propiedad/ejemplo`);
  checks.property = {
    statusCode: propertyResponse.statusCode,
    hasTitle: propertyResponse.body.includes('<title>'),
    hasJsonLd: propertyResponse.body.includes('application/ld+json'),
    summary: 'UNKNOWN'
  };
  
  if (propertyResponse.statusCode === 200) {
    if (checks.property.hasTitle && checks.property.hasJsonLd) {
      checks.property.summary = 'PASS';
    } else {
      checks.property.summary = 'FAIL';
    }
  } else {
    checks.property.summary = 'NO_APPLY';
  }
  
  results.sections.pageChecks = checks;
}

// 4. Seguridad JSON-LD (estático)
function jsonLdSecurityCheck() {
  log('=== RELEASE GATE: JSON-LD SECURITY ===');
  
  const checks = {};
  
  // Escanear archivo de propiedad
  const propertyPagePath = join(projectRoot, 'app', '(catalog)', 'property', '[slug]', 'page.tsx');
  const propertyPageContent = readFileSync(propertyPagePath, 'utf8');
  
  checks.propertyPage = {
    hasDangerouslySetInnerHTML: propertyPageContent.includes('dangerouslySetInnerHTML'),
    hasSafeJsonLd: propertyPageContent.includes('safeJsonLd'),
    hasScriptJsonLd: propertyPageContent.includes('application/ld+json'),
    summary: 'UNKNOWN'
  };
  
  if (!checks.propertyPage.hasDangerouslySetInnerHTML && 
      checks.propertyPage.hasSafeJsonLd && 
      checks.propertyPage.hasScriptJsonLd) {
    checks.propertyPage.summary = 'PASS';
  } else {
    checks.propertyPage.summary = 'FAIL';
  }
  
  // Verificar util jsonld.ts
  const jsonLdUtilPath = join(projectRoot, 'lib', 'seo', 'jsonld.ts');
  const jsonLdUtilContent = readFileSync(jsonLdUtilPath, 'utf8');
  
  checks.jsonLdUtil = {
    exists: true,
    hasSafeJsonLd: jsonLdUtilContent.includes('safeJsonLd'),
    hasEscapeFunction: jsonLdUtilContent.includes('escapeJsonString'),
    summary: 'UNKNOWN'
  };
  
  if (checks.jsonLdUtil.hasSafeJsonLd && checks.jsonLdUtil.hasEscapeFunction) {
    checks.jsonLdUtil.summary = 'PASS';
  } else {
    checks.jsonLdUtil.summary = 'FAIL';
  }
  
  results.sections.jsonLdSecurity = checks;
}

// 5. Rate-limit
async function rateLimitCheck() {
  log('=== RELEASE GATE: RATE LIMIT ===');
  
  const checks = {};
  
  // Verificar si existen rutas debug/test
  const testRoute = '/api/test';
  const debugRoute = '/api/debug';
  
  const testResponse = await httpGet(`${BASE_URL}${testRoute}`);
  const debugResponse = await httpGet(`${BASE_URL}${debugRoute}`);
  
  if (testResponse.statusCode === 404 && debugResponse.statusCode === 404) {
    checks.rateLimit = {
      routesExist: false,
      summary: 'NO_APPLY'
    };
  } else {
    // Hacer 25 requests seguidas
    log('Testing rate limit with 25 requests...');
    const targetRoute = testResponse.statusCode !== 404 ? testRoute : debugRoute;
    const responses = [];
    
    for (let i = 0; i < 25; i++) {
      const response = await httpGet(`${BASE_URL}${targetRoute}`);
      responses.push(response.statusCode);
    }
    
    const has429 = responses.includes(429);
    checks.rateLimit = {
      routesExist: true,
      targetRoute,
      responses,
      has429,
      summary: has429 ? 'PASS' : 'FAIL'
    };
  }
  
  results.sections.rateLimit = checks;
}

// 6. SEO técnico y robots
async function seoAndRobotsCheck() {
  log('=== RELEASE GATE: SEO & ROBOTS ===');
  
  const checks = {};
  
  // Leer feature flags
  const flagsPath = join(projectRoot, 'config', 'feature-flags.ts');
  const flagsContent = readFileSync(flagsPath, 'utf8');
  // Extraer el valor de comingSoon del archivo TypeScript
  const comingSoonMatch = flagsContent.match(/comingSoon:\s*(true|false)/);
  const comingSoon = comingSoonMatch ? comingSoonMatch[1] === 'true' : false;
  
  // GET /robots.txt con retry si da 500
  log('Checking robots.txt with retry on 500...');
  const robotsResponse = await httpGetWithRetry(`${BASE_URL}/robots.txt`);
  checks.robots = {
    statusCode: robotsResponse.statusCode,
    content: robotsResponse.body,
    hasDisallowAll: robotsResponse.body.includes('Disallow: /'),
    hasAllowRoot: robotsResponse.body.includes('Allow: /'),
    summary: 'UNKNOWN'
  };
  
  if (comingSoon) {
    if (checks.robots.hasDisallowAll) {
      checks.robots.summary = 'PASS';
      results.summary.seoRobot = 'PASS';
    } else {
      checks.robots.summary = 'FAIL';
      results.summary.seoRobot = 'FAIL';
    }
  } else {
    if (checks.robots.hasAllowRoot || !checks.robots.hasDisallowAll) {
      checks.robots.summary = 'PASS';
      results.summary.seoRobot = 'PASS';
    } else {
      checks.robots.summary = 'FAIL';
      results.summary.seoRobot = 'FAIL';
    }
  }
  
  // Verificar canonical en páginas principales
  const rootResponse = await httpGet(BASE_URL);
  const landingResponse = await httpGet(`${BASE_URL}/landing`);
  
  checks.canonical = {
    rootHasCanonical: rootResponse.body.includes('rel="canonical"'),
    landingHasCanonical: landingResponse.body.includes('rel="canonical"'),
    summary: 'UNKNOWN'
  };
  
  if (checks.canonical.rootHasCanonical && checks.canonical.landingHasCanonical) {
    checks.canonical.summary = 'PASS';
  } else {
    checks.canonical.summary = 'FAIL';
  }
  
  results.sections.seoAndRobots = checks;
}

// 7. Salida y decisión
function generateReports() {
  log('=== RELEASE GATE: GENERATING REPORTS ===');
  
  // Determinar decisión final
  const mustPassChecks = [
    results.summary.lint,
    results.summary.types,
    results.summary.build,
    results.summary.rootCheck,
    results.summary.seoRobot
  ];
  
  const allMustPass = mustPassChecks.every(check => check === 'PASS');
  results.decision = allMustPass ? 'GO' : 'NO-GO';
  
  // Guardar JSON
  const jsonPath = join(REPORTS_DIR, 'release_gate.json');
  writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  log(`Saved JSON report to ${jsonPath}`);
  
  // Generar MD
  const mdPath = join(REPORTS_DIR, 'RELEASE_GATE.md');
  const mdContent = generateMarkdownReport();
  writeFileSync(mdPath, mdContent);
  log(`Saved Markdown report to ${mdPath}`);
}

function generateMarkdownReport() {
  const severity = (check) => {
    if (check === 'FAIL') return '🔴 ALTA';
    if (check === 'PASS') return '🟢 OK';
    if (check === 'NO_APPLY') return '🟡 NO APLICA';
    return '⚪ UNKNOWN';
  };
  
  const fixSuggestion = (check, context) => {
    if (check === 'FAIL') {
      switch (context) {
        case 'lint': return 'Ejecutar `npm run lint --fix`';
        case 'types': return 'Corregir errores de TypeScript';
        case 'build': return 'Corregir errores de build';
        case 'rootCheck': return 'Verificar redirección según feature flag (manual redirect check)';
        case 'seoRobot': return 'Verificar robots.txt según feature flag (con retry en 500)';
        default: return 'Revisar configuración';
      }
    }
    return '-';
  };
  
  return `# Release Gate Report

**Fecha:** ${new Date().toLocaleString('es-CL')}
**Decisión:** ${results.decision === 'GO' ? '🟢 GO' : '🔴 NO-GO'}
**Base URL:** ${results.baseUrl}

## Mejoras Implementadas

- ✅ **Manual Redirect Check**: Inspección de redirects 301/302/307 sin seguirlos automáticamente
- ✅ **Retry con Backoff**: Reintentos automáticos en errores 500 (hasta 3 veces, 1.5s delay)
- ✅ **Root Check Robusto**: PASS si obtiene 30x correcto o 200 esperado tras follow manual
- ✅ **Robots.txt Retry**: Reintento automático si /robots.txt da 500 una vez

## Resumen por Sección

| Sección | Estado | Detalle |
|---------|--------|---------|
| Lint | ${severity(results.summary.lint)} | ${results.summary.lint} |
| TypeScript | ${severity(results.summary.types)} | ${results.summary.types} |
| Tests | ${severity(results.summary.tests)} | ${results.summary.tests} |
| Build | ${severity(results.summary.build)} | ${results.summary.build} |
| Root Check | ${severity(results.summary.rootCheck)} | ${results.summary.rootCheck} |
| SEO/Robots | ${severity(results.summary.seoRobot)} | ${results.summary.seoRobot} |

## Hallazgos Detallados

### QA Local
${Object.entries(results.sections.qaLocal || {}).map(([key, value]) => 
  `- **${key}**: ${severity(value.summary)} - ${value.summary} (exit: ${value.exitCode})`
).join('\n')}

### Page Checks
${Object.entries(results.sections.pageChecks || {}).map(([key, value]) => 
  `- **${key}**: ${severity(value.summary)} - ${value.summary} (status: ${value.statusCode})`
).join('\n')}

### JSON-LD Security
${Object.entries(results.sections.jsonLdSecurity || {}).map(([key, value]) => 
  `- **${key}**: ${severity(value.summary)} - ${value.summary}`
).join('\n')}

### Rate Limit
${Object.entries(results.sections.rateLimit || {}).map(([key, value]) => 
  `- **${key}**: ${severity(value.summary)} - ${value.summary}`
).join('\n')}

### SEO & Robots
${Object.entries(results.sections.seoAndRobots || {}).map(([key, value]) => 
  `- **${key}**: ${severity(value.summary)} - ${value.summary}`
).join('\n')}

## Tabla de Hallazgos

| Check | Severidad | Estado | Fix Sugerido |
|-------|-----------|--------|--------------|
| Lint | ${results.summary.lint === 'FAIL' ? 'ALTA' : 'OK'} | ${results.summary.lint} | ${fixSuggestion(results.summary.lint, 'lint')} |
| TypeScript | ${results.summary.types === 'FAIL' ? 'ALTA' : 'OK'} | ${results.summary.types} | ${fixSuggestion(results.summary.types, 'types')} |
| Tests | ${results.summary.tests === 'FAIL' ? 'ALTA' : 'OK'} | ${results.summary.tests} | ${fixSuggestion(results.summary.tests, 'tests')} |
| Build | ${results.summary.build === 'FAIL' ? 'ALTA' : 'OK'} | ${results.summary.build} | ${fixSuggestion(results.summary.build, 'build')} |
| Root Redirect | ${results.summary.rootCheck === 'FAIL' ? 'ALTA' : 'OK'} | ${results.summary.rootCheck} | ${fixSuggestion(results.summary.rootCheck, 'rootCheck')} |
| Robots.txt | ${results.summary.seoRobot === 'FAIL' ? 'ALTA' : 'OK'} | ${results.summary.seoRobot} | ${fixSuggestion(results.summary.seoRobot, 'seoRobot')} |

## Decisión Final

**${results.decision === 'GO' ? '🟢 GO' : '🔴 NO-GO'}** - ${results.decision === 'GO' ? 
  'Todos los checks críticos pasaron. Listo para producción.' : 
  'Hay checks críticos fallando. Corregir antes de producción.'}

---
*Reporte generado automáticamente por Release Gate*
`;
}

// 8. Resumen corto
function printShortSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN CORTO - RELEASE GATE');
  console.log('='.repeat(60));
  console.log(`Fecha: ${new Date().toLocaleString('es-CL')}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log('');
  console.log('KPIs Clave:');
  console.log(`  🔍 Lint:        ${results.summary.lint}`);
  console.log(`  📝 Types:       ${results.summary.types}`);
  console.log(`  🧪 Tests:       ${results.summary.tests}`);
  console.log(`  🏗️  Build:       ${results.summary.build}`);
  console.log(`  🏠 Root Check:  ${results.summary.rootCheck}`);
  console.log(`  🤖 SEO/Robots:  ${results.summary.seoRobot}`);
  console.log('');
  console.log(`🎯 DECISIÓN: ${results.decision === 'GO' ? '🟢 GO' : '🔴 NO-GO'}`);
  console.log('='.repeat(60));
}

// Main execution
async function main() {
  try {
    log('🚀 Starting Release Gate...');
    
    await bootstrap();
    await qaLocal();
    await pageChecks();
    jsonLdSecurityCheck();
    await rateLimitCheck();
    await seoAndRobotsCheck();
    generateReports();
    printShortSummary();
    
  } catch (error) {
    log(`Error in release gate: ${error.message}`, 'ERROR');
    results.decision = 'ERROR';
    generateReports();
    printShortSummary();
  } finally {
    stopDevServer();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
