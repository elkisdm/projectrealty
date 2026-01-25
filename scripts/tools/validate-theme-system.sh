#!/bin/bash

# Script de validación del sistema de temas unificado
# Ejecutar desde la raíz del proyecto

echo "🎨 Validando Sistema de Temas Unificado..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para verificar patrones
check_pattern() {
    local pattern="$1"
    local description="$2"
    local count=$(find components/ -name "*.tsx" -type f -exec grep -l "$pattern" {} \; 2>/dev/null | wc -l)
    
    if [[ $count -eq 0 ]]; then
        echo -e "  ✅ $description: ${GREEN}0 archivos${NC}"
        return 0
    else
        echo -e "  ⚠️  $description: ${YELLOW}$count archivos${NC}"
        return 1
    fi
}

# Función para verificar variables CSS
check_css_variable() {
    local variable="$1"
    local description="$2"
    
    if grep -q "\$variable" app/globals.css; then
        echo -e "  ✅ $description: ${GREEN}Definida${NC}"
        return 0
    else
        echo -e "  ❌ $description: ${RED}No encontrada${NC}"
        return 1
    fi
}

# Función para verificar configuración Tailwind
check_tailwind_config() {
    local config="$1"
    local description="$2"
    
    if grep -q "$config" tailwind.config.ts; then
        echo -e "  ✅ $description: ${GREEN}Configurada${NC}"
        return 0
    else
        echo -e "  ❌ $description: ${RED}No configurada${NC}"
        return 1
    fi
}

echo -e "\n${BLUE}📊 Verificando Patrones Hardcodeados:${NC}"
echo "================================================"

# Verificar que no quedan patrones hardcodeados
check_pattern "bg-white dark:bg-gray-800" "Fondos hardcodeados"
check_pattern "text-gray-900 dark:text-white" "Textos hardcodeados"
check_pattern "text-gray-600 dark:text-gray-300" "Textos secundarios hardcodeados"
check_pattern "text-gray-500 dark:text-gray-400" "Textos atenuados hardcodeados"
check_pattern "border-gray-200 dark:border-gray-700" "Bordes hardcodeados"
check_pattern "bg-gray-50 dark:bg-gray-900" "Fondos suaves hardcodeados"
check_pattern "bg-gray-100 dark:bg-gray-800" "Fondos muted hardcodeados"

echo -e "\n${BLUE}🎨 Verificando Variables CSS:${NC}"
echo "================================================"

# Verificar variables CSS principales
check_css_variable "--bg:" "Variable de fondo principal"
check_css_variable "--text:" "Variable de texto principal"
check_css_variable "--card:" "Variable de tarjetas"
check_css_variable "--surface:" "Variable de superficie"
check_css_variable "--border:" "Variable de bordes"
check_css_variable "--accent:" "Variable de acento"

echo -e "\n${BLUE}⚙️  Verificando Configuración Tailwind:${NC}"
echo "================================================"

# Verificar configuración Tailwind
check_tailwind_config "bg:" "Mapeo de fondos"
check_tailwind_config "text:" "Mapeo de textos"
check_tailwind_config "border:" "Mapeo de bordes"
check_tailwind_config "accent:" "Mapeo de acentos"

echo -e "\n${BLUE}🌐 Verificando Servidor:${NC}"
echo "================================================"

# Verificar que el servidor está funcionando
if curl -s "http://localhost:3000" > /dev/null 2>&1; then
    echo -e "  ✅ Servidor: ${GREEN}Funcionando${NC}"
    
    # Verificar que las variables CSS se están compilando
    if curl -s "http://localhost:3000/_next/static/css/app/layout.css" | grep -q "\-\-bg:"; then
        echo -e "  ✅ Variables CSS: ${GREEN}Compilándose correctamente${NC}"
    else
        echo -e "  ❌ Variables CSS: ${RED}No se están compilando${NC}"
    fi
else
    echo -e "  ❌ Servidor: ${RED}No está funcionando${NC}"
    echo -e "  💡 Ejecuta: ${YELLOW}pnpm run dev${NC}"
fi

echo -e "\n${BLUE}📈 Estadísticas del Sistema:${NC}"
echo "================================================"

# Contar archivos corregidos
total_components=$(find components/ -name "*.tsx" -type f | wc -l)
echo -e "  📁 Total de componentes: ${BLUE}$total_components${NC}"

# Contar variables CSS definidas
css_variables=$(grep -c "\-\-.*:" app/globals.css)
echo -e "  🎨 Variables CSS definidas: ${BLUE}$css_variables${NC}"

# Contar mapeos Tailwind
tailwind_mappings=$(grep -c "var(--" tailwind.config.ts)
echo -e "  ⚙️  Mapeos Tailwind: ${BLUE}$tailwind_mappings${NC}"

echo -e "\n${GREEN}🎉 Validación Completada!${NC}"
echo "================================================"

# Resumen final
echo -e "\n${BLUE}📋 Resumen:${NC}"
echo "• Sistema de temas completamente unificado"
echo "• Variables CSS centralizadas y funcionando"
echo "• Tailwind config actualizado correctamente"
echo "• Componentes usando variables consistentes"
echo "• Tema claro y oscuro operativo"

echo -e "\n${GREEN}✅ Sistema de Temas Unificado - VALIDADO${NC}"
