#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Probando conexión a Supabase...');
console.log('URL:', supabaseUrl ? '✅ Configurada' : '❌ Faltante');
console.log('Anon Key:', supabaseAnonKey ? '✅ Configurada' : '❌ Faltante');
console.log('Service Key:', supabaseServiceKey ? '✅ Configurada' : '❌ Faltante');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Faltan credenciales de Supabase');
  process.exit(1);
}

// Crear cliente
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n🔗 Probando conexión...');
    
    // Probar conexión básica
    const { data, error } = await supabase
      .from('buildings')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Error de conexión:', error.message);
      
      // Verificar si la tabla existe
      if (error.message.includes('relation "buildings" does not exist')) {
        console.log('\n📋 La tabla "buildings" no existe. Necesitas crear la estructura de la base de datos.');
        console.log('\n📝 SQL para crear las tablas:');
        console.log(`
-- Crear tabla buildings
CREATE TABLE buildings (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  comuna TEXT NOT NULL,
  direccion TEXT,
  precio_desde INTEGER,
  has_availability BOOLEAN DEFAULT true
);

-- Crear tabla units
CREATE TABLE units (
  id TEXT PRIMARY KEY,
  building_id TEXT REFERENCES buildings(id) ON DELETE CASCADE,
  tipologia TEXT NOT NULL,
  area_m2 INTEGER,
  precio INTEGER NOT NULL,
  disponible BOOLEAN DEFAULT true,
  bedrooms INTEGER DEFAULT 1,
  bathrooms INTEGER DEFAULT 1,
  estacionamiento BOOLEAN DEFAULT false,
  bodega BOOLEAN DEFAULT false
);

-- Crear índices
CREATE INDEX idx_buildings_comuna ON buildings(comuna);
CREATE INDEX idx_units_building_id ON units(building_id);
CREATE INDEX idx_units_disponible ON units(disponible);
        `);
      }
      return;
    }
    
    console.log('✅ Conexión exitosa');
    
    // Verificar estructura de la tabla buildings
    console.log('\n📋 Verificando estructura de la tabla buildings...');
    const { data: buildings, error: buildingsError } = await supabase
      .from('buildings')
      .select('*')
      .limit(5);
    
    if (buildingsError) {
      console.error('❌ Error al leer buildings:', buildingsError.message);
      return;
    }
    
    console.log(`✅ Tabla buildings: ${buildings.length} registros encontrados`);
    
    if (buildings.length > 0) {
      console.log('📊 Ejemplo de registro:');
      console.log(JSON.stringify(buildings[0], null, 2));
    }
    
    // Verificar estructura de la tabla units
    console.log('\n📋 Verificando estructura de la tabla units...');
    const { data: units, error: unitsError } = await supabase
      .from('units')
      .select('*')
      .limit(5);
    
    if (unitsError) {
      console.error('❌ Error al leer units:', unitsError.message);
      return;
    }
    
    console.log(`✅ Tabla units: ${units.length} registros encontrados`);
    
    if (units.length > 0) {
      console.log('📊 Ejemplo de registro:');
      console.log(JSON.stringify(units[0], null, 2));
    }
    
    // Verificar relación entre tablas
    console.log('\n🔗 Verificando relación entre tablas...');
    const { data: buildingsWithUnits, error: relationError } = await supabase
      .from('buildings')
      .select(`
        id,
        nombre,
        comuna,
        units (
          id,
          tipologia,
          precio,
          disponible
        )
      `)
      .limit(3);
    
    if (relationError) {
      console.error('❌ Error al verificar relación:', relationError.message);
      return;
    }
    
    console.log('✅ Relación entre tablas funcionando correctamente');
    console.log('📊 Ejemplo de edificio con unidades:');
    console.log(JSON.stringify(buildingsWithUnits[0], null, 2));
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
  }
}

testConnection();
