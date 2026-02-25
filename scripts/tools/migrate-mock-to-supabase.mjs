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

// Crear cliente con service role para poder insertar datos
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateMockData() {
  try {
    console.log('🚀 Iniciando migración de datos mock a Supabase...');
    
    // Leer datos mock
    const mockDataPath = path.join(process.cwd(), 'data', 'buildings.json');
    const mockData = JSON.parse(await fs.readFile(mockDataPath, 'utf-8'));
    
    console.log(`📄 Encontrados ${mockData.length} edificios en datos mock`);
    
    // Limpiar tablas existentes
    console.log('🧹 Limpiando tablas existentes...');
    await supabase.from('units').delete().neq('id', 'dummy');
    await supabase.from('buildings').delete().neq('id', 'dummy');
    
    // Insertar edificios
    console.log('📝 Insertando edificios...');
    const buildingsToInsert = mockData.map(building => ({
      id: building.id,
      slug: building.slug,
      nombre: building.name,
      comuna: building.comuna,
      direccion: building.address,
      precio_desde: building.units.filter(u => u.disponible).map(u => u.price).sort((a, b) => a - b)[0] || null,
      has_availability: building.units.some(u => u.disponible)
    }));
    
    const { data: insertedBuildings, error: buildingsError } = await supabase
      .from('buildings')
      .insert(buildingsToInsert)
      .select();
    
    if (buildingsError) {
      console.error('❌ Error insertando edificios:', buildingsError.message);
      return;
    }
    
    console.log(`✅ ${insertedBuildings.length} edificios insertados`);
    
    // Insertar unidades
    console.log('📝 Insertando unidades...');
    const unitsToInsert = [];
    
    for (const building of mockData) {
      for (const unit of building.units) {
        unitsToInsert.push({
          id: unit.id,
          building_id: building.id,
          tipologia: unit.tipologia,
          area_m2: unit.m2,
          precio: unit.price,
          disponible: unit.disponible,
          bedrooms: unit.tipologia.includes('Studio') ? 0 : parseInt(unit.tipologia.split('/')[0]),
          bathrooms: parseInt(unit.tipologia.split('/')[1] || '1'),
          estacionamiento: unit.estacionamiento,
          bodega: unit.bodega
        });
      }
    }
    
    const { data: insertedUnits, error: unitsError } = await supabase
      .from('units')
      .insert(unitsToInsert)
      .select();
    
    if (unitsError) {
      console.error('❌ Error insertando unidades:', unitsError.message);
      return;
    }
    
    console.log(`✅ ${insertedUnits.length} unidades insertadas`);
    
    // Verificar migración
    console.log('\n🔍 Verificando migración...');
    const { data: finalBuildings, error: checkError } = await supabase
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
      `);
    
    if (checkError) {
      console.error('❌ Error verificando migración:', checkError.message);
      return;
    }
    
    console.log(`✅ Migración completada exitosamente`);
    console.log(`📊 Total edificios: ${finalBuildings.length}`);
    console.log(`📊 Total unidades: ${finalBuildings.reduce((acc, b) => acc + b.units.length, 0)}`);
    
    // Mostrar resumen
    console.log('\n📋 Resumen de la migración:');
    for (const building of finalBuildings) {
      const availableUnits = building.units.filter(u => u.disponible);
      console.log(`  • ${building.nombre} (${building.comuna}): ${availableUnits.length} unidades disponibles`);
    }
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
  }
}

migrateMockData();
