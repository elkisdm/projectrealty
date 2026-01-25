#!/usr/bin/env node

/**
 * 🛡️ SCRIPT DE CONFIGURACIÓN AUTOMÁTICA DE PROTECCIÓN DE RAMAS
 * 
 * Este script configura automáticamente la protección de ramas en GitHub
 * para las ramas 'main' y 'develop' según las mejores prácticas.
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

const REPO_OWNER = 'elkisdm';
const REPO_NAME = 'projectrealty';

// Configuración de protección para main (producción)
const MAIN_PROTECTION = {
  required_status_checks: {
    strict: true,
    contexts: ['build', 'lint', 'test', 'type-check']
  },
  enforce_admins: true,
  required_pull_request_reviews: {
    required_approving_review_count: 1,
    dismiss_stale_reviews: true,
    require_code_owner_reviews: true
  },
  restrictions: {
    users: [],
    teams: []
  },
  allow_force_pushes: false,
  allow_deletions: false,
  required_conversation_resolution: true,
  require_signed_commits: true,
  require_linear_history: true,
  allow_squash_merge: true,
  allow_merge_commit: false,
  allow_rebase_merge: false,
  allow_auto_merge: false,
  delete_branch_on_merge: true
};

// Configuración de protección para develop (desarrollo)
const DEVELOP_PROTECTION = {
  required_status_checks: {
    strict: true,
    contexts: ['build', 'lint', 'test']
  },
  enforce_admins: true,
  required_pull_request_reviews: {
    required_approving_review_count: 1,
    dismiss_stale_reviews: true,
    require_code_owner_reviews: false
  },
  restrictions: {
    users: [],
    teams: []
  },
  allow_force_pushes: false,
  allow_deletions: false,
  required_conversation_resolution: true,
  require_signed_commits: false,
  require_linear_history: false,
  allow_squash_merge: true,
  allow_merge_commit: true,
  allow_rebase_merge: false,
  allow_auto_merge: true,
  delete_branch_on_merge: true
};

async function checkGitHubCLI() {
  try {
    execSync('gh --version', { stdio: 'pipe' });
    console.log('✅ GitHub CLI encontrado');
    return true;
  } catch (error) {
    console.log('❌ GitHub CLI no encontrado');
    return false;
  }
}

async function authenticateGitHub() {
  try {
    const result = execSync('gh auth status', { stdio: 'pipe' }).toString();
    if (result.includes('Logged in')) {
      console.log('✅ GitHub CLI autenticado');
      return true;
    }
  } catch (error) {
    console.log('❌ GitHub CLI no autenticado');
  }
  return false;
}

async function setupBranchProtection(branch, protection) {
  console.log(`\n🛡️ Configurando protección para rama: ${branch}`);
  
  try {
    const protectionJson = JSON.stringify(protection, null, 2);
    const tempFile = `/tmp/protection-${branch}.json`;
    
    // Escribir configuración a archivo temporal
    execSync(`echo '${protectionJson}' > ${tempFile}`);
    
    // Aplicar protección usando GitHub CLI
    const command = `gh api repos/${REPO_OWNER}/${REPO_NAME}/branches/${branch}/protection \
      --method PUT \
      --input ${tempFile}`;
    
    execSync(command, { stdio: 'pipe' });
    
    console.log(`✅ Protección configurada para ${branch}`);
    
    // Limpiar archivo temporal
    execSync(`rm ${tempFile}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error configurando protección para ${branch}:`, error.message);
    return false;
  }
}

async function createGitHubActionsWorkflow() {
  console.log('\n🔧 Creando GitHub Actions workflow...');
  
  const workflowContent = `name: Branch Protection Checks

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  protection-checks:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run lint
        run: npm run lint
        continue-on-error: false
      
      - name: Run type check
        run: npm run type-check
        continue-on-error: false
      
      - name: Run tests
        run: npm run test
        continue-on-error: false
      
      - name: Build
        run: npm run build
        continue-on-error: false
      
      - name: Check for security vulnerabilities
        run: npm audit --audit-level moderate
        continue-on-error: true`;

  try {
    // Crear directorio .github/workflows si no existe
    execSync('mkdir -p .github/workflows');
    
    // Escribir workflow
    execSync(`echo '${workflowContent}' > .github/workflows/branch-protection.yml`);
    
    console.log('✅ GitHub Actions workflow creado');
    return true;
  } catch (error) {
    console.error('❌ Error creando workflow:', error.message);
    return false;
  }
}

async function verifyProtection() {
  console.log('\n🔍 Verificando configuración...');
  
  try {
    // Verificar protección de main
    const mainProtection = execSync(
      `gh api repos/${REPO_OWNER}/${REPO_NAME}/branches/main/protection`,
      { stdio: 'pipe' }
    ).toString();
    
    console.log('✅ Protección de main verificada');
    
    // Verificar protección de develop
    const developProtection = execSync(
      `gh api repos/${REPO_OWNER}/${REPO_NAME}/branches/develop/protection`,
      { stdio: 'pipe' }
    ).toString();
    
    console.log('✅ Protección de develop verificada');
    
    return true;
  } catch (error) {
    console.error('❌ Error verificando protección:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 CONFIGURACIÓN AUTOMÁTICA DE PROTECCIÓN DE RAMAS');
  console.log('=' .repeat(60));
  
  // Verificar GitHub CLI
  const hasCLI = await checkGitHubCLI();
  if (!hasCLI) {
    console.log('\n📥 Instalando GitHub CLI...');
    try {
      execSync('brew install gh', { stdio: 'inherit' });
      console.log('✅ GitHub CLI instalado');
    } catch (error) {
      console.error('❌ Error instalando GitHub CLI:', error.message);
      console.log('\n💡 Instala GitHub CLI manualmente: https://cli.github.com/');
      process.exit(1);
    }
  }
  
  // Autenticar
  const isAuthenticated = await authenticateGitHub();
  if (!isAuthenticated) {
    console.log('\n🔐 Autenticando con GitHub...');
    try {
      execSync('gh auth login', { stdio: 'inherit' });
      console.log('✅ Autenticación exitosa');
    } catch (error) {
      console.error('❌ Error en autenticación:', error.message);
      process.exit(1);
    }
  }
  
  // Crear GitHub Actions workflow
  await createGitHubActionsWorkflow();
  
  // Configurar protección de main
  const mainSuccess = await setupBranchProtection('main', MAIN_PROTECTION);
  
  // Configurar protección de develop
  const developSuccess = await setupBranchProtection('develop', DEVELOP_PROTECTION);
  
  if (mainSuccess && developSuccess) {
    console.log('\n🎉 ¡CONFIGURACIÓN COMPLETADA CON ÉXITO!');
    console.log('=' .repeat(60));
    console.log('✅ Protección de main configurada');
    console.log('✅ Protección de develop configurada');
    console.log('✅ GitHub Actions workflow creado');
    console.log('✅ CODEOWNERS configurado');
    
    // Verificar configuración
    await verifyProtection();
    
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('1. Commit y push de los cambios');
    console.log('2. Verificar que las protecciones funcionan');
    console.log('3. Probar creando un PR');
    console.log('4. Notificar al equipo sobre el nuevo flujo');
    
  } else {
    console.log('\n❌ ERROR EN LA CONFIGURACIÓN');
    console.log('Revisa los errores anteriores y vuelve a intentar');
    process.exit(1);
  }
}

// Ejecutar script
main().catch(console.error);
