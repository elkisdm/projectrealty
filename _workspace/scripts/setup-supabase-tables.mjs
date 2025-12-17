#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

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

async function setupTables() {
  try {
    console.log('🚀 Configurando tablas en Supabase...');
    
    // Leer el esquema SQL
    const schemaPath = path.join(process.cwd(), 'supabase', 'schema.sql');
    const schemaSQL = await fs.readFile(schemaPath, 'utf-8');
    
    console.log('📄 Ejecutando esquema SQL...');
    
    // Ejecutar el esquema SQL
    const { error } = await supabase.rpc('exec_sql', { sql: schemaSQL });
    
    if (error) {
      console.error('❌ Error ejecutando esquema:', error.message);
      
      // Si no existe la función exec_sql, vamos a ejecutar las consultas por separado
      console.log('🔄 Intentando crear tablas manualmente...');
      
      // Crear tabla buildings
      const { error: buildingsError } = await supabase.rpc('exec_sql', { 
        sql: `
          CREATE TABLE IF NOT EXISTS public.buildings (
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
      
      if (buildingsError) {
        console.error('❌ Error creando tabla buildings:', buildingsError.message);
        return;
      }
      
      // Crear tabla units
      const { error: unitsError } = await supabase.rpc('exec_sql', { 
        sql: `
          CREATE TABLE IF NOT EXISTS public.units (
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
      
      if (unitsError) {
        console.error('❌ Error creando tabla units:', unitsError.message);
        return;
      }
      
      // Crear índices
      await supabase.rpc('exec_sql', { 
        sql: `
          CREATE INDEX IF NOT EXISTS idx_buildings_comuna ON public.buildings(comuna);
          CREATE INDEX IF NOT EXISTS idx_units_building_id ON public.units(building_id);
          CREATE INDEX IF NOT EXISTS idx_units_disponible ON public.units(disponible);
        `
      });
      
    }
    
    console.log('✅ Tablas configuradas correctamente');
    
    // Verificar que las tablas existen
    console.log('\n🔍 Verificando estructura de las tablas...');
    
    const { data: buildings, error: buildingsCheck } = await supabase
      .from('buildings')
      .select('*')
      .limit(1);
    
    if (buildingsCheck) {
      console.error('❌ Error verificando tabla buildings:', buildingsCheck.message);
      return;
    }
    
    console.log('✅ Tabla buildings creada correctamente');
    
    const { data: units, error: unitsCheck } = await supabase
      .from('units')
      .select('*')
      .limit(1);
    
    if (unitsCheck) {
      console.error('❌ Error verificando tabla units:', unitsCheck.message);
      return;
    }
    
    console.log('✅ Tabla units creada correctamente');
    console.log('\n🎉 Configuración completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
  }
}

setupTables();
