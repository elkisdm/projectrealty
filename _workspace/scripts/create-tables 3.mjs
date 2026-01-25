#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan credenciales de Supabase');
  process.exit(1);
}

// Crear cliente con service role
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  try {
    console.log('🚀 Creando tablas en Supabase...');
    
    // Crear tabla buildings
    console.log('📝 Creando tabla buildings...');
    const { error: buildingsError } = await supabase
      .from('buildings')
      .select('*')
      .limit(0);
    
    if (buildingsError && buildingsError.message.includes('relation "buildings" does not exist')) {
      console.log('🔄 Tabla buildings no existe, creándola...');
      
      // Intentar crear la tabla usando SQL directo
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE public.buildings (
            id TEXT PRIMARY KEY,
            slug TEXT UNIQUE NOT NULL,
            nombre TEXT NOT NULL,
            comuna TEXT NOT NULL,
            direccion TEXT,
            precio_desde INTEGER,
            has_availability BOOLEAN DEFAULT true
          );
        `
      });
      
      if (createError) {
        console.error('❌ Error creando tabla buildings:', createError.message);
        console.log('💡 Necesitas crear las tablas manualmente en el dashboard de Supabase');
        console.log('   Usa el SQL del archivo supabase/schema.sql');
        return;
      }
    }
    
    // Crear tabla units
    console.log('📝 Creando tabla units...');
    const { error: unitsError } = await supabase
      .from('units')
      .select('*')
      .limit(0);
    
    if (unitsError && unitsError.message.includes('relation "units" does not exist')) {
      console.log('🔄 Tabla units no existe, creándola...');
      
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE public.units (
            id TEXT PRIMARY KEY,
            building_id TEXT REFERENCES public.buildings(id) ON DELETE CASCADE,
            tipologia TEXT NOT NULL,
            area_m2 INTEGER,
            precio INTEGER NOT NULL,
            disponible BOOLEAN DEFAULT true,
            bedrooms INTEGER DEFAULT 1,
            bathrooms INTEGER DEFAULT 1,
            estacionamiento BOOLEAN DEFAULT false,
            bodega BOOLEAN DEFAULT false
          );
        `
      });
      
      if (createError) {
        console.error('❌ Error creando tabla units:', createError.message);
        return;
      }
    }
    
    console.log('✅ Tablas creadas correctamente');
    
    // Verificar que las tablas existen
    console.log('\n🔍 Verificando tablas...');
    
    const { data: buildings, error: buildingsCheck } = await supabase
      .from('buildings')
      .select('*')
      .limit(1);
    
    if (buildingsCheck) {
      console.error('❌ Error verificando tabla buildings:', buildingsCheck.message);
      return;
    }
    
    console.log('✅ Tabla buildings verificada');
    
    const { data: units, error: unitsCheck } = await supabase
      .from('units')
      .select('*')
      .limit(1);
    
    if (unitsCheck) {
      console.error('❌ Error verificando tabla units:', unitsCheck.message);
      return;
    }
    
    console.log('✅ Tabla units verificada');
    console.log('\n🎉 Tablas creadas y verificadas exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la creación:', error.message);
    console.log('\n💡 Si las tablas no se crean automáticamente, créalas manualmente:');
    console.log('   1. Ve al dashboard de Supabase');
    console.log('   2. Ve a SQL Editor');
    console.log('   3. Ejecuta el contenido del archivo supabase/schema.sql');
  }
}

createTables();
