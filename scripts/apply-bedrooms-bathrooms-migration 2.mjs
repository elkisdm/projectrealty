#!/usr/bin/env node
/**
 * Script para aplicar la migración de cálculo automático de bedrooms y bathrooms
 * 
 * Este script aplica la migración SQL que crea funciones y triggers para calcular
 * automáticamente bedrooms y bathrooms desde tipologia en la base de datos.
 * 
 * Uso:
 *   node scripts/apply-bedrooms-bathrooms-migration.mjs
 */

import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno desde .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

async function applyMigration() {
  // Intentar diferentes nombres de variables de entorno
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Faltan variables de entorno');
    console.error('   Requeridas: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('📄 Leyendo archivo de migración...');
  
  const migrationPath = join(__dirname, '../config/supabase/migrations/20250120_auto_calculate_bedrooms_bathrooms.sql');
  const migrationSQL = await readFile(migrationPath, 'utf-8');

  console.log('🚀 Aplicando migración...');
  console.log('   Esto creará funciones y triggers para calcular automáticamente bedrooms y bathrooms');
  console.log('   También actualizará los registros existentes con valores NULL\n');

  try {
    console.log('📝 Ejecutando migración completa...');
    
    // Ejecutar todo el SQL de una vez usando exec_sql
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      // Si exec_sql no existe, sugerir ejecución manual
      if (error.message.includes('function "exec_sql" does not exist') || 
          error.message.includes('RPC exec_sql no disponible')) {
        console.error('\n⚠️  La función RPC "exec_sql" no está instalada en Supabase.');
        console.error('💡 Ejecuta el SQL manualmente en el Supabase SQL Editor:');
        console.error(`   ${migrationPath}`);
        console.error('\n   O instala la función exec_sql ejecutando primero:');
        console.error('   config/supabase/migrations/20250212_create_exec_sql.sql');
        process.exit(1);
      }
      throw error;
    }
    
    console.log('   ✅ Migración ejecutada');

    console.log('\n📊 Verificando resultados...');

    // Verificar cuántas unidades se actualizaron
    const { data: unitsUpdated, error: checkError } = await supabase
      .from('units')
      .select('id, tipologia, bedrooms, bathrooms')
      .limit(10);

    if (checkError) {
      console.error('⚠️  Error verificando resultados:', checkError.message);
    } else {
      console.log(`\n✅ Verificación exitosa. Ejemplo de unidades:`);
      unitsUpdated?.forEach(u => {
        console.log(`   - ${u.tipologia} -> bedrooms: ${u.bedrooms}, bathrooms: ${u.bathrooms}`);
      });
    }

    console.log('\n✨ Migración completada. Los triggers ahora calcularán automáticamente');
    console.log('   bedrooms y bathrooms desde tipologia en futuras inserciones/actualizaciones.');

  } catch (error) {
    console.error('❌ Error aplicando migración:', error.message);
    console.error('\n💡 Alternativa: Ejecuta el SQL manualmente en el Supabase SQL Editor:');
    console.error(`   ${migrationPath}`);
    console.error('\n   Pasos:');
    console.error('   1. Ve a https://supabase.com/dashboard');
    console.error('   2. Selecciona tu proyecto');
    console.error('   3. Ve a SQL Editor');
    console.error('   4. Copia y pega el contenido del archivo de migración');
    console.error('   5. Ejecuta el SQL');
    process.exit(1);
  }
}

applyMigration()
  .then(() => {
    console.log('\n✅ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error ejecutando script:', error);
    process.exit(1);
  });
