#!/bin/bash

# Script de limpieza de archivos duplicados
# USO: bash scripts/cleanup-duplicates.sh [--dry-run]

set -e

DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
  DRY_RUN=true
  echo "🔍 MODO DRY-RUN: No se eliminarán archivos, solo se mostrarán"
fi

echo "🧹 Limpieza de archivos duplicados"
echo "=================================="
echo ""

# Contar archivos duplicados
DUPLICATES=$(find . -name "* 2.*" -type f | grep -v node_modules | wc -l | tr -d ' ')
echo "📊 Archivos duplicados encontrados: $DUPLICATES"
echo ""

if [ "$DUPLICATES" -eq 0 ]; then
  echo "✅ No hay archivos duplicados para limpiar"
  exit 0
fi

# Mostrar primeros 20 archivos
echo "📋 Primeros 20 archivos duplicados:"
find . -name "* 2.*" -type f | grep -v node_modules | head -20
echo ""

# Preguntar confirmación
if [ "$DRY_RUN" = false ]; then
  read -p "¿Eliminar estos archivos? (s/N): " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "❌ Operación cancelada"
    exit 1
  fi
fi

# Eliminar archivos duplicados
echo "🗑️  Eliminando archivos duplicados..."
if [ "$DRY_RUN" = true ]; then
  echo "   (DRY-RUN: estos archivos serían eliminados)"
  find . -name "* 2.*" -type f | grep -v node_modules | while read file; do
    echo "   - $file"
  done
  find . -name "* 3.*" -type f | grep -v node_modules | while read file; do
    echo "   - $file"
  done
  find . -name "* 4.*" -type f | grep -v node_modules | while read file; do
    echo "   - $file"
  done
else
  find . -name "* 2.*" -type f | grep -v node_modules -exec rm {} \;
  find . -name "* 3.*" -type f | grep -v node_modules -exec rm {} \;
  find . -name "* 4.*" -type f | grep -v node_modules -exec rm {} \;
  echo "✅ Archivos eliminados"
fi

# Verificar resultado
REMAINING=$(find . -name "* 2.*" -type f | grep -v node_modules | wc -l | tr -d ' ')
echo ""
echo "📊 Archivos duplicados restantes: $REMAINING"
echo ""

if [ "$REMAINING" -eq 0 ]; then
  echo "✅ ¡Limpieza completada!"
else
  echo "⚠️  Aún quedan $REMAINING archivos duplicados"
fi

