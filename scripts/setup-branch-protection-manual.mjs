#!/usr/bin/env node

/**
 * 🛡️ CONFIGURACIÓN MANUAL DE PROTECCIÓN DE RAMAS
 * 
 * Para repositorios privados sin GitHub Pro, este script genera
 * comandos curl para configurar la protección manualmente.
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

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

function generateCurlCommands() {
  console.log('🔧 GENERANDO COMANDOS CURL PARA CONFIGURACIÓN MANUAL');
  console.log('=' .repeat(60));
  
  // Generar token de GitHub
  console.log('\n1️⃣ OBTENER TOKEN DE GITHUB:');
  console.log('   Ve a: https://github.com/settings/tokens');
  console.log('   Crea un token con permisos: repo, admin:org');
  console.log('   Copia el token y úsalo en los comandos siguientes\n');
  
  // Comandos para main
  console.log('2️⃣ CONFIGURAR PROTECCIÓN PARA MAIN:');
  console.log('   Reemplaza YOUR_TOKEN con tu token de GitHub\n');
  
  const mainConfig = JSON.stringify(MAIN_PROTECTION, null, 2);
  const mainCurl = `curl -X PUT \\
  -H "Authorization: token YOUR_TOKEN" \\
  -H "Accept: application/vnd.github.v3+json" \\
  https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/branches/main/protection \\
  -d '${mainConfig}'`;
  
  console.log(mainCurl);
  
  // Comandos para develop
  console.log('\n3️⃣ CONFIGURAR PROTECCIÓN PARA DEVELOP:');
  
  const developConfig = JSON.stringify(DEVELOP_PROTECTION, null, 2);
  const developCurl = `curl -X PUT \\
  -H "Authorization: token YOUR_TOKEN" \\
  -H "Accept: application/vnd.github.v3+json" \\
  https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/branches/develop/protection \\
  -d '${developConfig}'`;
  
  console.log(developCurl);
  
  // Verificación
  console.log('\n4️⃣ VERIFICAR CONFIGURACIÓN:');
  console.log(`   curl -H "Authorization: token YOUR_TOKEN" \\
     https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/branches/main/protection`);
  
  console.log(`   curl -H "Authorization: token YOUR_TOKEN" \\
     https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/branches/develop/protection`);
}

function createSetupScript() {
  console.log('\n📝 CREANDO SCRIPT DE CONFIGURACIÓN...');
  
  const setupScript = `#!/bin/bash

# 🛡️ SCRIPT DE CONFIGURACIÓN DE PROTECCIÓN DE RAMAS
# Ejecutar: bash setup-protection.sh YOUR_GITHUB_TOKEN

if [ -z "$1" ]; then
    echo "❌ Error: Proporciona tu token de GitHub"
    echo "Uso: bash setup-protection.sh YOUR_GITHUB_TOKEN"
    exit 1
fi

TOKEN="$1"
REPO_OWNER="elkisdm"
REPO_NAME="tremendoarriendo"

echo "🚀 Configurando protección de ramas..."

# Configurar protección para main
echo "🛡️ Configurando protección para main..."
curl -X PUT \\
  -H "Authorization: token $TOKEN" \\
  -H "Accept: application/vnd.github.v3+json" \\
  https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/branches/main/protection \\
  -d '{
    "required_status_checks": {
      "strict": true,
      "contexts": ["build", "lint", "test", "type-check"]
    },
    "enforce_admins": true,
    "required_pull_request_reviews": {
      "required_approving_review_count": 1,
      "dismiss_stale_reviews": true,
      "require_code_owner_reviews": true
    },
    "restrictions": {
      "users": [],
      "teams": []
    },
    "allow_force_pushes": false,
    "allow_deletions": false,
    "required_conversation_resolution": true,
    "require_signed_commits": true,
    "require_linear_history": true,
    "allow_squash_merge": true,
    "allow_merge_commit": false,
    "allow_rebase_merge": false,
    "allow_auto_merge": false,
    "delete_branch_on_merge": true
  }'

echo "✅ Protección de main configurada"

# Configurar protección para develop
echo "🛡️ Configurando protección para develop..."
curl -X PUT \\
  -H "Authorization: token $TOKEN" \\
  -H "Accept: application/vnd.github.v3+json" \\
  https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/branches/develop/protection \\
  -d '{
    "required_status_checks": {
      "strict": true,
      "contexts": ["build", "lint", "test"]
    },
    "enforce_admins": true,
    "required_pull_request_reviews": {
      "required_approving_review_count": 1,
      "dismiss_stale_reviews": true,
      "require_code_owner_reviews": false
    },
    "restrictions": {
      "users": [],
      "teams": []
    },
    "allow_force_pushes": false,
    "allow_deletions": false,
    "required_conversation_resolution": true,
    "require_signed_commits": false,
    "require_linear_history": false,
    "allow_squash_merge": true,
    "allow_merge_commit": true,
    "allow_rebase_merge": false,
    "allow_auto_merge": true,
    "delete_branch_on_merge": true
  }'

echo "✅ Protección de develop configurada"

# Verificar configuración
echo "🔍 Verificando configuración..."
echo "Main protection:"
curl -H "Authorization: token $TOKEN" \\
  https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/branches/main/protection

echo "Develop protection:"
curl -H "Authorization: token $TOKEN" \\
  https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/branches/develop/protection

echo "🎉 ¡Configuración completada!"
echo "📋 Próximos pasos:"
echo "1. Commit y push de los cambios"
echo "2. Verificar que las protecciones funcionan"
echo "3. Probar creando un PR"
echo "4. Notificar al equipo sobre el nuevo flujo"`;

  writeFileSync('setup-protection.sh', setupScript);
  execSync('chmod +x setup-protection.sh');
  
  console.log('✅ Script creado: setup-protection.sh');
  console.log('   Ejecutar: bash setup-protection.sh YOUR_GITHUB_TOKEN');
}

function main() {
  console.log('🚀 CONFIGURACIÓN MANUAL DE PROTECCIÓN DE RAMAS');
  console.log('=' .repeat(60));
  console.log('💡 Para repositorios privados sin GitHub Pro');
  
  generateCurlCommands();
  createSetupScript();
  
  console.log('\n🎯 OPCIONES DE CONFIGURACIÓN:');
  console.log('1. Usar el script automático: bash setup-protection.sh YOUR_TOKEN');
  console.log('2. Configurar manualmente en GitHub UI');
  console.log('3. Usar los comandos curl generados arriba');
  
  console.log('\n📋 CONFIGURACIÓN MANUAL EN GITHUB:');
  console.log('1. Ve a: https://github.com/elkisdm/tremendoarriendo/settings/branches');
  console.log('2. Agrega regla para "main" con todas las protecciones');
  console.log('3. Agrega regla para "develop" con protecciones moderadas');
  console.log('4. Guarda la configuración');
}

main();
