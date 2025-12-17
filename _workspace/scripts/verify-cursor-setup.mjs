#!/usr/bin/env node

/**
 * Script para verificar que el setup de Cursor esté correctamente configurado
 * Uso: node scripts/verify-cursor-setup.mjs
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const REQUIRED_FILES = [
  '.cursor/rules/00-core.mdc',
  '.cursor/rules/10-api.mdc',
  '.cursor/rules/20-components.mdc',
  '.cursor/rules/30-pages.mdc',
  '.cursor/rules/prompts.mdc',
  '.cursor/.cursorignore',
  '.cursor/README.md'
];

const REQUIRED_CONTENT = {
  '00-core.mdc': ['alwaysApply: true', 'Rol: Dev Senior'],
  '10-api.mdc': ['globs:', 'app/api/**/*', 'Rate limit: 20/60s'],
  '20-components.mdc': ['globs:', 'components/**/*', 'Server Components'],
  '30-pages.mdc': ['globs:', 'app/**/page.tsx', 'SSR/ISR'],
  'prompts.mdc': ['PLANTILLA DIAGNÓSTICO', 'PLANTILLA API', 'PLANTILLA COMPONENTE'],
  '.cursorignore': ['node_modules/', '.next/', '*.log'],
  'README.md': ['Cursor Setup', 'Project Rules', 'Plantillas']
};

function checkFile(filePath) {
  if (!existsSync(filePath)) {
    console.error(`❌ Faltante: ${filePath}`);
    return false;
  }
  
  try {
    const content = readFileSync(filePath, 'utf8');
    const requiredContent = REQUIRED_CONTENT[filePath.split('/').pop()];
    
    if (requiredContent) {
      const missingContent = requiredContent.filter(item => !content.includes(item));
      if (missingContent.length > 0) {
        console.error(`⚠️  ${filePath} - Contenido faltante: ${missingContent.join(', ')}`);
        return false;
      }
    }
    
    console.log(`✅ ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error leyendo ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔍 Verificando setup de Cursor...\n');
  
  let allGood = true;
  let passed = 0;
  let total = REQUIRED_FILES.length;
  
  for (const file of REQUIRED_FILES) {
    if (checkFile(file)) {
      passed++;
    } else {
      allGood = false;
    }
  }
  
  console.log(`\n📊 Resultado: ${passed}/${total} archivos correctos`);
  
  if (allGood) {
    console.log('\n🎉 ¡Setup de Cursor configurado correctamente!');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Reinicia Cursor para cargar las reglas');
    console.log('2. Configura Shell Commands en Settings → Shell Commands');
    console.log('3. Prueba las plantillas con: @prompts A, @prompts B, etc.');
    console.log('4. Verifica que las reglas se apliquen automáticamente');
  } else {
    console.log('\n⚠️  Algunos archivos necesitan atención. Revisa los errores arriba.');
    process.exit(1);
  }
}

main();
