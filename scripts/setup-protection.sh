#!/bin/bash

# 🛡️ SCRIPT DE CONFIGURACIÓN DE PROTECCIÓN DE RAMAS
# Ejecutar: bash setup-protection.sh YOUR_GITHUB_TOKEN

if [ -z "$1" ]; then
    echo "❌ Error: Proporciona tu token de GitHub"
    echo "Uso: bash setup-protection.sh YOUR_GITHUB_TOKEN"
    exit 1
fi

TOKEN="$1"
REPO_OWNER="elkisdm"
REPO_NAME="projectrealty"

echo "🚀 Configurando protección de ramas..."

# Configurar protección para main
echo "🛡️ Configurando protección para main..."
curl -X PUT \
  -H "Authorization: token $TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/branches/main/protection \
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
curl -X PUT \
  -H "Authorization: token $TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/branches/develop/protection \
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
curl -H "Authorization: token $TOKEN" \
  https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/branches/main/protection

echo "Develop protection:"
curl -H "Authorization: token $TOKEN" \
  https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/branches/develop/protection

echo "🎉 ¡Configuración completada!"
echo "📋 Próximos pasos:"
echo "1. Commit y push de los cambios"
echo "2. Verificar que las protecciones funcionan"
echo "3. Probar creando un PR"
echo "4. Notificar al equipo sobre el nuevo flujo"