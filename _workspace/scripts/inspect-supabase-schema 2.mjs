#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Credenciales de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

console.log('🔍 INSPECCIÓN DE ESQUEMA SUPABASE');
console.log('================================');

async function inspectSchema() {
  try {
    // Consultar estructura de tabla buildings
    console.log('\n📋 ESTRUCTURA DE TABLA BUILDINGS:');
    console.log('----------------------------------');
    
    const { data: buildingsColumns, error: buildingsError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            column_name, 
            data_type, 
            is_nullable,
            column_default
          FROM information_schema.columns 
          WHERE table_name = 'buildings' 
            AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      });

    if (buildingsError) {
      console.log('⚠️ No se pudo usar RPC, probando consulta directa...');
      
      // Alternativa: hacer SELECT para ver qué columnas hay
      const { data: sampleBuilding, error: sampleError } = await supabase
        .from('buildings')
        .select('*')
        .limit(1);
      
      if (sampleError) {
        console.log(`❌ Error consultando buildings: ${sampleError.message}`);
      } else {
        console.log('📄 Columnas detectadas en buildings:');
        if (sampleBuilding && sampleBuilding.length > 0) {
          Object.keys(sampleBuilding[0]).forEach(col => {
            console.log(`   - ${col}`);
          });
        } else {
          console.log('   (tabla vacía, no se pueden detectar columnas)');
        }
      }
    } else {
      console.log('📄 Columnas en buildings:');
      buildingsColumns.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    }

    // Consultar estructura de tabla units
    console.log('\n📋 ESTRUCTURA DE TABLA UNITS:');
    console.log('------------------------------');
    
    const { data: unitsColumns, error: unitsError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            column_name, 
            data_type, 
            is_nullable,
            column_default
          FROM information_schema.columns 
          WHERE table_name = 'units' 
            AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      });

    if (unitsError) {
      console.log('⚠️ No se pudo usar RPC, probando consulta directa...');
      
      const { data: sampleUnit, error: sampleUnitError } = await supabase
        .from('units')
        .select('*')
        .limit(1);
      
      if (sampleUnitError) {
        console.log(`❌ Error consultando units: ${sampleUnitError.message}`);
      } else {
        console.log('📄 Columnas detectadas en units:');
        if (sampleUnit && sampleUnit.length > 0) {
          Object.keys(sampleUnit[0]).forEach(col => {
            console.log(`   - ${col}`);
          });
        } else {
          console.log('   (tabla vacía, no se pueden detectar columnas)');
        }
      }
    } else {
      console.log('📄 Columnas en units:');
      unitsColumns.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    }

    // Probar inserción con diferentes nombres de columnas
    console.log('\n🧪 PROBANDO MAPEO DE NOMBRES:');
    console.log('-----------------------------');
    
    const testId = 'test-mapping-' + Date.now();
    
    // Probar con nombres en inglés (esquema actual)
    try {
      console.log('   Probando nombres en inglés (name, address)...');
      const { data: englishTest, error: englishError } = await supabase
        .from('buildings')
        .insert([{
          id: testId + '-en',
          slug: 'test-english-names',
          name: 'Test Building English', // <- nombre en inglés
          comuna: 'Test Comuna',
          address: 'Test Address 123'     // <- dirección en inglés
        }])
        .select();

      if (englishError) {
        console.log(`   ❌ Nombres en inglés: ${englishError.message}`);
      } else {
        console.log('   ✅ Nombres en inglés: FUNCIONAN');
        // Limpiar
        await supabase.from('buildings').delete().eq('id', testId + '-en');
      }
    } catch (e) {
      console.log(`   ❌ Error nombres en inglés: ${e.message}`);
    }

    // Probar con nombres en español (lo que espera el código)
    try {
      console.log('   Probando nombres en español (nombre, direccion)...');
      const { data: spanishTest, error: spanishError } = await supabase
        .from('buildings')
        .insert([{
          id: testId + '-es',
          slug: 'test-spanish-names',
          nombre: 'Test Building Spanish',  // <- nombre en español
          comuna: 'Test Comuna',
          direccion: 'Test Direccion 123'   // <- dirección en español
        }])
        .select();

      if (spanishError) {
        console.log(`   ❌ Nombres en español: ${spanishError.message}`);
      } else {
        console.log('   ✅ Nombres en español: FUNCIONAN');
        // Limpiar
        await supabase.from('buildings').delete().eq('id', testId + '-es');
      }
    } catch (e) {
      console.log(`   ❌ Error nombres en español: ${e.message}`);
    }

    console.log('\n🎯 CONCLUSIONES:');
    console.log('================');
    console.log('1. Verificar qué nombres de columnas usa realmente tu esquema SQL');
    console.log('2. Actualizar el mapeo en lib/data.ts según los nombres reales');
    console.log('3. O ejecutar ALTER TABLE para renombrar columnas si es necesario');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

inspectSchema();
