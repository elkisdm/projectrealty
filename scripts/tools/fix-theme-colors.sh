#!/bin/bash

# Script para corregir colores hardcodeados con variables CSS unificadas
# Ejecutar desde la raíz del proyecto

echo "🎨 Iniciando corrección masiva de colores hardcodeados..."

# Patrones más comunes a reemplazar
PATTERNS=(
    "bg-white dark:bg-gray-800:bg-card"
    "text-gray-900 dark:text-white:text-text"
    "text-gray-600 dark:text-gray-300:text-text-secondary"
    "text-gray-500 dark:text-gray-400:text-text-muted"
    "border-gray-200 dark:border-gray-700:border-border"
    "bg-gray-50 dark:bg-gray-900:bg-surface"
    "bg-gray-100 dark:bg-gray-800:bg-soft"
)

# Función para reemplazar patrones en archivos
replace_pattern() {
    local pattern="$1"
    local from=$(echo "$pattern" | cut -d: -f1)
    local to=$(echo "$pattern" | cut -d: -f2)
    
    echo "  🔄 Reemplazando: $from → $to"
    
    # Buscar archivos que contengan el patrón
    find components/ -name "*.tsx" -type f -exec grep -l "$from" {} \; | while read file; do
        if [[ -f "$file" ]]; then
            sed -i '' "s/$from/$to/g" "$file"
            echo "    ✅ Corregido: $file"
        fi
    done
}

# Ejecutar reemplazos
for pattern in "${PATTERNS[@]}"; do
    replace_pattern "$pattern"
done

echo "🎉 Corrección masiva completada!"
echo "📊 Verificando resultados..."

# Verificar que los reemplazos funcionaron
echo "🔍 Patrones restantes:"
for pattern in "${PATTERNS[@]}"; do
    from=$(echo "$pattern" | cut -d: -f1)
    count=$(find components/ -name "*.tsx" -type f -exec grep -l "$from" {} \; 2>/dev/null | wc -l)
    if [[ $count -gt 0 ]]; then
        echo "  ⚠️  $from: $count archivos restantes"
    else
        echo "  ✅ $from: 0 archivos restantes"
    fi
done
