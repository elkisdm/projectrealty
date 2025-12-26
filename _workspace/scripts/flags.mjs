#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const file = 'config/feature-flags.ts';
const mode = process.argv[2]; // 'on' | 'off'

if (!['on','off'].includes(mode)) { 
  console.error('Uso: node scripts/flags.mjs <on|off>'); 
  process.exit(1); 
}

try {
  const content = fs.readFileSync(file, 'utf8');
  const newValue = mode === 'on';
  
  // Reemplazar el valor de comingSoon en el archivo TypeScript
  const updatedContent = content.replace(
    /comingSoon:\s*(true|false)/,
    `comingSoon: ${newValue}`
  );
  
  fs.writeFileSync(file, updatedContent);
  console.log(`✅ COMING_SOON = ${newValue}`);
  console.log(`📝 Archivo actualizado: ${file}`);
} catch (error) {
  console.error('❌ Error al actualizar flags:', error.message);
  process.exit(1);
}
