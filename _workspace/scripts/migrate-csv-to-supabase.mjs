#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { v4 as uuidv4 } from 'uuid';

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

async function migrateCSVData() {
  try {
    console.log('🚀 Iniciando migración de datos CSV a Supabase...');
    
    // Leer archivo CSV
    const csvPath = path.join(process.env.HOME, 'Library', 'Mobile Documents', 'com~apple~CloudDocs', 'export.csv');
    console.log(`📄 Leyendo archivo: ${csvPath}`);
    
    const csvContent = await fs.readFile(csvPath, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      delimiter: ';',
      relax_quotes: true,
      relax_column_count: true
    });
    
    console.log(`📊 Encontrados ${records.length} registros en el CSV`);
    
    if (records.length === 0) {
      console.log('❌ No hay registros para migrar');
      return;
    }
    
    // Mostrar estructura del CSV
    console.log('\n📋 Estructura del CSV:');
    console.log('Columnas disponibles:', Object.keys(records[0]));
    
    // Limpiar tablas existentes
    console.log('\n🧹 Limpiando tablas existentes...');
    await supabase.from('units').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('buildings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Agrupar registros por edificio
    const buildingsMap = new Map();
    
    for (const record of records) {
      // Extraer información del edificio según la estructura del CSV
      const buildingKey = record.Condominio || record['Nombre Edificio'] || 'Edificio Default';
      const comuna = record.Comuna || 'Santiago';
      const direccion = record.Direccion || 'Dirección no disponible';
      
      if (!buildingsMap.has(buildingKey)) {
        const buildingId = uuidv4();
        buildingsMap.set(buildingKey, {
          id: buildingId,
          slug: `edificio-${buildingKey.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`,
          nombre: buildingKey,
          comuna: comuna,
          direccion: direccion,
          precio_desde: null,
          has_availability: false,
          units: []
        });
      }
      
      const building = buildingsMap.get(buildingKey);
      
      // Extraer información de la unidad según la estructura del CSV
      const unit = {
        id: uuidv4(),
        building_id: building.id,
        tipologia: record.Tipologia || 'No especificada',
        area_m2: parseFloat(record['m2 Depto'] || '50'),
        precio: parseFloat(record['Arriendo Total'] || '500000'),
        disponible: record.Estado === 'Lista para arrendar',
        bedrooms: parseInt(record.Tipologia?.match(/(\d+)D/)?.[1] || '1'),
        bathrooms: parseInt(record.Tipologia?.match(/(\d+)B/)?.[1] || '1')
      };
      
      building.units.push(unit);
      
      // Actualizar precio desde si la unidad está disponible
      if (unit.disponible) {
        building.has_availability = true;
        if (!building.precio_desde || unit.precio < building.precio_desde) {
          building.precio_desde = unit.precio;
        }
      }
    }
    
    const buildings = Array.from(buildingsMap.values());
    console.log(`🏢 Procesados ${buildings.length} edificios únicos`);
    
    // Insertar edificios
    console.log('\n📝 Insertando edificios...');
    const buildingsToInsert = buildings.map(b => ({
      id: b.id,
      provider: 'csv',
      source_building_id: b.nombre,
      slug: b.slug,
      nombre: b.nombre,
      comuna: b.comuna,
      direccion: b.direccion,
      precio_desde: b.precio_desde,
      has_availability: b.has_availability
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
    console.log('\n📝 Insertando unidades...');
    const unitsToInsert = buildings.flatMap(building => building.units.map(unit => ({
      ...unit,
      provider: 'csv',
      source_unit_id: unit.id,
      unidad: unit.id,
      area_interior_m2: unit.area_m2,
      area_exterior_m2: 0,
      orientacion: 'N/A',
      pet_friendly: false,
      gastos_comunes: 0,
      promotions: '{}',
      comment_text: '',
      internal_flags: '{}'
    })));
    
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
        precio_desde,
        has_availability,
        units (
          id,
          tipologia,
          precio,
          disponible
        )
      `)
      .order('nombre');
    
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
      const priceRange = availableUnits.length > 0 
        ? `$${Math.min(...availableUnits.map(u => u.precio)).toLocaleString()} - $${Math.max(...availableUnits.map(u => u.precio)).toLocaleString()}`
        : 'Sin unidades disponibles';
      
      console.log(`  • ${building.nombre} (${building.comuna}): ${availableUnits.length} unidades disponibles - ${priceRange}`);
    }
    
    // Mostrar estadísticas por comuna
    console.log('\n📊 Estadísticas por comuna:');
    const comunas = {};
    for (const building of finalBuildings) {
      if (!comunas[building.comuna]) {
        comunas[building.comuna] = { buildings: 0, units: 0, available: 0 };
      }
      comunas[building.comuna].buildings++;
      comunas[building.comuna].units += building.units.length;
      comunas[building.comuna].available += building.units.filter(u => u.disponible).length;
    }
    
    for (const [comuna, stats] of Object.entries(comunas)) {
      console.log(`  • ${comuna}: ${stats.buildings} edificios, ${stats.units} unidades total, ${stats.available} disponibles`);
    }
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    if (error.code === 'ENOENT') {
      console.log('\n💡 El archivo export.csv no se encontró en iCloud Drive.');
      console.log('   Asegúrate de que el archivo esté en: ~/Library/Mobile Documents/com~apple~CloudDocs/export.csv');
    }
  }
}

migrateCSVData();
