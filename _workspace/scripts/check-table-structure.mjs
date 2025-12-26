#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  try {
    console.log('🔍 Verificando estructura de la tabla buildings...\n');
    
    // Obtener una muestra de edificios para ver las columnas
    const { data: buildings, error } = await supabase
      .from('buildings')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Error al obtener datos:', error);
      return;
    }

    console.log(`📊 Muestra de edificios (${buildings.length}):`);
    console.log('=' .repeat(80));
    
    buildings.forEach((building, index) => {
      console.log(`\n🏢 Edificio ${index + 1}:`);
      console.log('Columnas disponibles:');
      Object.keys(building).forEach(key => {
        console.log(`   • ${key}: ${building[key]}`);
      });
    });

    // Intentar obtener condominios con diferentes nombres de columna
    const possibleColumns = ['condominio', 'Condominio', 'CONDOMINIO', 'condominio_name', 'condominio_id'];
    
    console.log('\n🔍 Probando diferentes nombres de columna para condominios:');
    console.log('=' .repeat(80));
    
    for (const column of possibleColumns) {
      try {
        const { data, error } = await supabase
          .from('buildings')
          .select(column)
          .limit(1);
        
        if (!error && data && data.length > 0) {
          console.log(`✅ Columna "${column}" existe`);
        } else {
          console.log(`❌ Columna "${column}" no existe`);
        }
      } catch (e) {
        console.log(`❌ Error con columna "${column}":`, e.message);
      }
    }

  } catch (error) {
    console.error('❌ Error fatal:', error);
  }
}

checkTableStructure();
