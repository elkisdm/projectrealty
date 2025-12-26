#!/bin/bash

# Script para configurar el uso de datos reales en lugar de mocks

echo "🔧 Configurando sistema para usar datos reales..."

# Configurar variables de entorno para usar datos reales
export USE_ASSETPLAN_SOURCE=true
export USE_SUPABASE=false

echo "✅ Variables configuradas:"
echo "   USE_ASSETPLAN_SOURCE=true"
echo "   USE_SUPABASE=false"

echo ""
echo "🚀 Reinicia el servidor de desarrollo para aplicar cambios:"
echo "   pnpm dev"
echo ""
echo "📊 Datos disponibles:"
echo "   - Archivo: data/sources/assetplan-from-csv.json"
echo "   - Edificios con datos reales del CSV"
echo "   - Sin usar mocks"
