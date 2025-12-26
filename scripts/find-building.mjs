#!/usr/bin/env node

/**
 * Script para buscar un edificio en la BD
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Cargar variables de entorno
function loadEnvFile() {
  const envPath = join(projectRoot, '.env.local');
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      }
    });
  }
}

loadEnvFile();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findBuilding(searchTerm) {
  console.log(`\n🔍 Buscando edificio: "${searchTerm}"\n`);
  
  const { data, error } = await supabase
    .from('buildings')
    .select('id, slug, name, comuna')
    .ilike('name', `%${searchTerm}%`);
  
  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }
  
  if (!data || data.length === 0) {
    console.log('❌ No se encontró ningún edificio');
    return;
  }
  
  console.log(`✅ Encontrado(s) ${data.length} edificio(s):\n`);
  data.forEach((building, index) => {
    console.log(`${index + 1}. ${building.name}`);
    console.log(`   ID: ${building.id}`);
    console.log(`   Slug: ${building.slug}`);
    console.log(`   Comuna: ${building.comuna}`);
    console.log('');
  });
  
  return data[0]; // Retornar el primero
}

const searchTerm = process.argv[2] || 'guillermo';
findBuilding(searchTerm).catch(console.error);
