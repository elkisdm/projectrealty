#!/usr/bin/env node

/**
 * Script para ingerir datos CSV a Supabase
 * 
 * Uso:
 *   node scripts/ingest-csv.mjs <ruta-al-archivo.csv>
 * 
 * Ejemplo:
 *   node scripts/ingest-csv.mjs "/Users/macbookpro/Downloads/export (10).csv"
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

// Obtener ruta del CSV desde argumentos
const csvPath = process.argv[2];

if (!csvPath) {
  console.error('❌ Uso: node scripts/ingest-csv.mjs <ruta-al-archivo.csv>');
  process.exit(1);
}

// Verificar que el archivo existe
if (!existsSync(csvPath)) {
  console.error(`❌ El archivo no existe: ${csvPath}`);
  process.exit(1);
}

console.log('🚀 Ingesta de CSV a Supabase');
console.log('============================\n');
console.log(`📄 Archivo: ${csvPath}`);

// Leer el script de ingesta original
const ingestScriptPath = join(ROOT_DIR, '_workspace', 'scripts', 'ingest-assetplan-csv.mjs');
const ingestScript = readFileSync(ingestScriptPath, 'utf-8');

// Crear directorio temporal si no existe
const tempDir = join(ROOT_DIR, 'data', 'sources');
const tempCsvPath = join(tempDir, 'assetplan-export.csv');

try {
  // Crear directorio si no existe
  if (!existsSync(tempDir)) {
    const { mkdirSync } = await import('node:fs');
    mkdirSync(tempDir, { recursive: true });
  }
  
  // Copiar el CSV al directorio esperado
  console.log(`📋 Copiando CSV a: ${tempCsvPath}`);
  const csvContent = readFileSync(csvPath, 'utf-8');
  writeFileSync(tempCsvPath, csvContent, 'utf-8');
  
  console.log('✅ Archivo copiado\n');
  
  // Ejecutar el script de ingesta
  console.log('🔄 Ejecutando ingesta...\n');
  execSync(`node ${ingestScriptPath}`, {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV || 'development',
    },
  });
  
  console.log('\n✅ Ingesta completada');
  
} catch (error) {
  console.error('\n❌ Error durante la ingesta:', error.message);
  if (error.stdout) console.error('Output:', error.stdout.toString());
  if (error.stderr) console.error('Error:', error.stderr.toString());
  process.exit(1);
}





