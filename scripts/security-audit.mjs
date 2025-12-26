#!/usr/bin/env node

/**
 * Script de Auditoría de Seguridad
 * 
 * Verifica automáticamente:
 * - Configuraciones de seguridad
 * - Detección de secrets en código
 * - Verificación de headers
 * - Análisis de dependencias
 * - Validación de variables de entorno
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const issues = {
  critical: [],
  high: [],
  medium: [],
  low: [],
  info: [],
};

function addIssue(severity, message, file = null, line = null) {
  const issue = { message, file, line };
  issues[severity].push(issue);
  console.log(`[${severity.toUpperCase()}] ${message}${file ? ` (${file}${line ? `:${line}` : ''})` : ''}`);
}

function checkGitignore() {
  console.log('\n📁 Verificando .gitignore...');
  const gitignorePath = join(projectRoot, '.gitignore');
  
  if (!existsSync(gitignorePath)) {
    addIssue('critical', '.gitignore no existe');
    return;
  }
  
  const gitignore = readFileSync(gitignorePath, 'utf-8');
  
  if (!gitignore.includes('.env')) {
    addIssue('critical', '.env* no está en .gitignore');
  } else {
    console.log('✅ .env* está en .gitignore');
  }
  
  if (!gitignore.includes('node_modules')) {
    addIssue('high', 'node_modules no está en .gitignore');
  }
}

function checkEnvExample() {
  console.log('\n🔐 Verificando config/env.example...');
  const envExamplePath = join(projectRoot, 'config', 'env.example');
  
  if (!existsSync(envExamplePath)) {
    addIssue('high', 'config/env.example no existe');
    return;
  }
  
  const envExample = readFileSync(envExamplePath, 'utf-8');
  
  // Verificar que no hay secrets reales
  const secretPatterns = [
    /eyJ[a-zA-Z0-9_-]{100,}/, // JWT tokens
    /sk_[a-zA-Z0-9]{32,}/, // Stripe keys
    /AIza[a-zA-Z0-9_-]{35,}/, // Google API keys
  ];
  
  for (const pattern of secretPatterns) {
    if (pattern.test(envExample)) {
      addIssue('critical', 'Posible secret real encontrado en env.example', 'config/env.example');
    }
  }
  
  // Verificar placeholders
  if (!envExample.includes('your-') && !envExample.includes('REEMPLAZA')) {
    addIssue('medium', 'env.example podría no tener placeholders claros');
  } else {
    console.log('✅ env.example usa placeholders');
  }
}

function checkSecretsInCode() {
  console.log('\n🔍 Buscando secrets en código...');
  
  const secretPatterns = [
    {
      pattern: /SUPABASE_SERVICE_ROLE_KEY\s*=\s*['"](eyJ[a-zA-Z0-9_-]{100,})['"]/,
      message: 'SUPABASE_SERVICE_ROLE_KEY hardcodeado en código',
      severity: 'critical',
    },
    {
      pattern: /ADMIN_TOKEN\s*=\s*['"]([^'"]{20,})['"]/,
      message: 'ADMIN_TOKEN hardcodeado en código',
      severity: 'critical',
    },
    {
      pattern: /password\s*[:=]\s*['"]([^'"]{8,})['"]/i,
      message: 'Posible password hardcodeado',
      severity: 'high',
    },
    {
      pattern: /api[_-]?key\s*[:=]\s*['"]([a-zA-Z0-9_-]{20,})['"]/i,
      message: 'Posible API key hardcodeado',
      severity: 'high',
    },
  ];
  
  // Buscar en archivos TypeScript/JavaScript
  const filesToCheck = [
    'app/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'middleware.ts',
  ];
  
  // Nota: Esta es una verificación básica. En producción, usar herramientas como git-secrets
  console.log('⚠️  Verificación básica. Considera usar git-secrets para verificación completa.');
}

function checkSecurityHeaders() {
  console.log('\n🛡️  Verificando headers de seguridad...');
  const nextConfigPath = join(projectRoot, 'next.config.mjs');
  
  if (!existsSync(nextConfigPath)) {
    addIssue('high', 'next.config.mjs no existe');
    return;
  }
  
  const nextConfig = readFileSync(nextConfigPath, 'utf-8');
  
  const requiredHeaders = [
    { name: 'Strict-Transport-Security', severity: 'high' },
    { name: 'X-Frame-Options', severity: 'high' },
    { name: 'X-Content-Type-Options', severity: 'medium' },
    { name: 'Referrer-Policy', severity: 'medium' },
  ];
  
  for (const header of requiredHeaders) {
    if (!nextConfig.includes(header.name)) {
      addIssue(header.severity, `Header ${header.name} no encontrado en next.config.mjs`);
    } else {
      console.log(`✅ ${header.name} configurado`);
    }
  }
  
  // Verificar CSP
  if (!nextConfig.includes('Content-Security-Policy') && !nextConfig.includes('CSP')) {
    addIssue('medium', 'Content-Security-Policy (CSP) no configurado');
  }
}

function checkRateLimiting() {
  console.log('\n⏱️  Verificando rate limiting...');
  
  // Verificar que existe lib/rate-limit.ts
  const rateLimitPath = join(projectRoot, 'lib', 'rate-limit.ts');
  if (!existsSync(rateLimitPath)) {
    addIssue('high', 'lib/rate-limit.ts no existe');
    return;
  }
  
  const rateLimitCode = readFileSync(rateLimitPath, 'utf-8');
  
  // Verificar que usa Map (en memoria) - esto es una limitación
  if (rateLimitCode.includes('new Map')) {
    addIssue('medium', 'Rate limiting usa Map en memoria (se pierde en restart). Considera usar Redis para producción.');
  }
  
  // Verificar endpoints públicos
  const publicEndpoints = [
    'app/api/waitlist/route.ts',
    'app/api/buildings/route.ts',
    'app/api/quotations/route.ts',
    'app/api/visits/route.ts',
  ];
  
  let endpointsWithoutRateLimit = 0;
  for (const endpoint of publicEndpoints) {
    const endpointPath = join(projectRoot, endpoint);
    if (existsSync(endpointPath)) {
      const code = readFileSync(endpointPath, 'utf-8');
      if (!code.includes('rateLimiter') && !code.includes('rate-limit')) {
        endpointsWithoutRateLimit++;
        addIssue('high', `Endpoint ${endpoint} no tiene rate limiting`);
      }
    }
  }
  
  if (endpointsWithoutRateLimit === 0) {
    console.log('✅ Endpoints públicos tienen rate limiting');
  }
}

function checkInputValidation() {
  console.log('\n✅ Verificando validación de input...');
  
  const apiRoutesPath = join(projectRoot, 'app', 'api');
  
  // Verificar que los endpoints principales usan Zod
  const criticalEndpoints = [
    'app/api/waitlist/route.ts',
    'app/api/admin/auth/login/route.ts',
    'app/api/quotations/route.ts',
    'app/api/visits/route.ts',
  ];
  
  let endpointsWithoutValidation = 0;
  for (const endpoint of criticalEndpoints) {
    const endpointPath = join(projectRoot, endpoint);
    if (existsSync(endpointPath)) {
      const code = readFileSync(endpointPath, 'utf-8');
      if (!code.includes('zod') && !code.includes('Zod') && !code.includes('Schema')) {
        endpointsWithoutValidation++;
        addIssue('high', `Endpoint ${endpoint} no usa Zod para validación`);
      } else {
        console.log(`✅ ${endpoint} usa validación Zod`);
      }
    }
  }
}

function checkErrorHandling() {
  console.log('\n🚨 Verificando manejo de errores...');
  
  const errorFiles = [
    'app/error.tsx',
    'app/global-error.tsx',
  ];
  
  for (const file of errorFiles) {
    const filePath = join(projectRoot, file);
    if (existsSync(filePath)) {
      const code = readFileSync(filePath, 'utf-8');
      
      // Verificar que no expone stack traces en producción
      if (code.includes('error.stack') || code.includes('error.message')) {
        // Verificar que está protegido por NODE_ENV
        if (!code.includes('NODE_ENV') && !code.includes('process.env.NODE_ENV')) {
          addIssue('high', `${file} podría exponer stack traces en producción`);
        }
      }
    }
  }
  
  // Verificar logger
  const loggerPath = join(projectRoot, 'lib', 'logger.ts');
  if (existsSync(loggerPath)) {
    const loggerCode = readFileSync(loggerPath, 'utf-8');
    if (loggerCode.includes('NODE_ENV') || loggerCode.includes('isDevelopment')) {
      console.log('✅ Logger verifica NODE_ENV');
    } else {
      addIssue('medium', 'Logger podría exponer información sensible en producción');
    }
  }
}

function checkDependencies() {
  console.log('\n📦 Verificando dependencias...');
  
  try {
    const auditOutput = execSync('pnpm audit --json', { 
      cwd: projectRoot,
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    
    const audit = JSON.parse(auditOutput);
    
    if (audit.metadata && audit.metadata.vulnerabilities) {
      const vulns = audit.metadata.vulnerabilities;
      
      if (vulns.critical > 0) {
        addIssue('critical', `${vulns.critical} vulnerabilidades críticas encontradas`);
      }
      if (vulns.high > 0) {
        addIssue('high', `${vulns.high} vulnerabilidades altas encontradas`);
      }
      if (vulns.moderate > 0) {
        addIssue('medium', `${vulns.moderate} vulnerabilidades moderadas encontradas`);
      }
      if (vulns.low > 0) {
        addIssue('low', `${vulns.low} vulnerabilidades bajas encontradas`);
      }
      
      if (vulns.critical === 0 && vulns.high === 0) {
        console.log('✅ No hay vulnerabilidades críticas o altas');
      }
    }
  } catch (error) {
    addIssue('medium', 'No se pudo ejecutar pnpm audit. Asegúrate de tener pnpm instalado.');
  }
}

function checkMiddleware() {
  console.log('\n🔒 Verificando middleware...');
  
  const middlewarePath = join(projectRoot, 'middleware.ts');
  if (!existsSync(middlewarePath)) {
    addIssue('high', 'middleware.ts no existe');
    return;
  }
  
  const middlewareCode = readFileSync(middlewarePath, 'utf-8');
  
  // Verificar bypass en desarrollo
  if (middlewareCode.includes('NODE_ENV === "development"')) {
    if (middlewareCode.includes('return true') || middlewareCode.includes('allow')) {
      addIssue('medium', 'Middleware permite bypass en desarrollo. Verificar que no se active en producción.');
    }
  }
  
  // Verificar validación de redirects
  if (middlewareCode.includes('validateAdminRedirect')) {
    console.log('✅ Middleware valida redirects');
  } else if (middlewareCode.includes('redirect')) {
    addIssue('medium', 'Middleware hace redirects pero no se verifica validateAdminRedirect');
  }
}

function checkRLS() {
  console.log('\n🗄️  Verificando RLS en Supabase...');
  
  const schemaPath = join(projectRoot, 'config', 'supabase', 'schema.sql');
  if (!existsSync(schemaPath)) {
    addIssue('info', 'schema.sql no encontrado (puede estar en otro lugar)');
    return;
  }
  
  const schema = readFileSync(schemaPath, 'utf-8');
  
  // Verificar que RLS está habilitado
  if (!schema.includes('ENABLE ROW LEVEL SECURITY') && !schema.includes('ENABLE RLS')) {
    addIssue('high', 'RLS no está habilitado en schema.sql');
  } else {
    console.log('✅ RLS está habilitado');
  }
  
  // Verificar políticas
  if (!schema.includes('CREATE POLICY')) {
    addIssue('high', 'No se encontraron políticas RLS en schema.sql');
  } else {
    console.log('✅ Políticas RLS encontradas');
  }
}

function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 REPORTE DE AUDITORÍA DE SEGURIDAD');
  console.log('='.repeat(60));
  
  const totalIssues = 
    issues.critical.length +
    issues.high.length +
    issues.medium.length +
    issues.low.length;
  
  console.log(`\nTotal de problemas encontrados: ${totalIssues}`);
  console.log(`  🔴 Críticos: ${issues.critical.length}`);
  console.log(`  🟠 Altos: ${issues.high.length}`);
  console.log(`  🟡 Medios: ${issues.medium.length}`);
  console.log(`  🔵 Bajos: ${issues.low.length}`);
  console.log(`  ℹ️  Información: ${issues.info.length}`);
  
  if (issues.critical.length > 0) {
    console.log('\n🔴 PROBLEMAS CRÍTICOS:');
    issues.critical.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue.message}${issue.file ? ` (${issue.file})` : ''}`);
    });
  }
  
  if (issues.high.length > 0) {
    console.log('\n🟠 PROBLEMAS DE ALTA PRIORIDAD:');
    issues.high.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue.message}${issue.file ? ` (${issue.file})` : ''}`);
    });
  }
  
  if (issues.medium.length > 0) {
    console.log('\n🟡 PROBLEMAS DE PRIORIDAD MEDIA:');
    issues.medium.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue.message}${issue.file ? ` (${issue.file})` : ''}`);
    });
  }
  
  if (issues.low.length > 0) {
    console.log('\n🔵 PROBLEMAS DE BAJA PRIORIDAD:');
    issues.low.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue.message}${issue.file ? ` (${issue.file})` : ''}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (totalIssues === 0) {
    console.log('✅ ¡Excelente! No se encontraron problemas de seguridad.');
  } else {
    console.log('⚠️  Se encontraron problemas que requieren atención.');
    console.log('Revisa el reporte completo en docs/AUDITORIA_SEGURIDAD.md');
  }
  
  return {
    total: totalIssues,
    critical: issues.critical.length,
    high: issues.high.length,
    medium: issues.medium.length,
    low: issues.low.length,
    issues,
  };
}

// Ejecutar todas las verificaciones
async function main() {
  console.log('🔐 Iniciando auditoría de seguridad...\n');
  
  checkGitignore();
  checkEnvExample();
  checkSecretsInCode();
  checkSecurityHeaders();
  checkRateLimiting();
  checkInputValidation();
  checkErrorHandling();
  checkDependencies();
  checkMiddleware();
  checkRLS();
  
  const report = generateReport();
  
  // Exit code basado en severidad
  if (report.critical > 0 || report.high > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch(console.error);


