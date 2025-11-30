#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

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

console.log('🚀 INGESTA DE DATOS ASSETPLAN CSV');
console.log('================================');

// Mapeo de tipologías a formato canónico
const TIPOLOGIA_MAPPING = {
  'Estudio': 'Studio',
  '1D1B': '1D1B',
  '2D1B (3C)': '2D1B',
  '2D1B (4C)': '2D1B', 
  '2D1B': '2D1B',
  '2D2B (4C)': '2D2B',
  '2D2B': '2D2B',
  '3D2B': '3D2B'
};

// Mapeo de orientaciones
const ORIENTACION_MAPPING = {
  'N': 'N', 'NE': 'NE', 'E': 'E', 'SE': 'SE',
  'S': 'S', 'SO': 'SO', 'O': 'O', 'NO': 'NO',
  'NP': 'N', 'SP': 'S', 'P': undefined // Genéricos
};

// Función para normalizar números de Chile
function parseChileanNumber(value) {
  if (!value || value === '') return 0;
  
  // Convertir a string y limpiar
  let cleanValue = String(value).trim();
  
  // Si tiene punto como separador de miles y coma como decimal
  if (cleanValue.includes(',') && cleanValue.includes('.')) {
    // Formato: 1.234.567,89 -> quitar puntos, cambiar coma por punto
    cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
  } 
  // Si solo tiene punto (puede ser decimal o miles)
  else if (cleanValue.includes('.')) {
    // Si el punto está en los últimos 3 caracteres, es decimal
    const dotIndex = cleanValue.lastIndexOf('.');
    if (cleanValue.length - dotIndex <= 3 && cleanValue.length - dotIndex > 1) {
      // Es decimal, mantener como está
    } else {
      // Es separador de miles, quitar
      cleanValue = cleanValue.replace(/\./g, '');
    }
  }
  // Si solo tiene coma, es decimal
  else if (cleanValue.includes(',')) {
    cleanValue = cleanValue.replace(',', '.');
  }
  
  const num = parseFloat(cleanValue);
  const result = isNaN(num) ? 0 : Math.round(num);
  
  // Verificar que no sea un número demasiado grande para INTEGER
  if (result > 2147483647) { // Max INT en PostgreSQL
    console.log(`⚠️ Valor muy grande detectado: ${value} -> ${result}, usando 0`);
    return 0;
  }
  
  return result;
}

// Función para normalizar decimales
function parseChileanDecimal(value) {
  if (!value || value === '') return null;
  
  let cleanValue = String(value).trim();
  
  // Para decimales pequeños (< 1000), el punto es separador decimal
  // Para decimales grandes (>= 1000), el punto puede ser separador de miles
  
  if (cleanValue.includes(',') && cleanValue.includes('.')) {
    // Formato: 1.234.567,89 -> quitar puntos, cambiar coma por punto
    cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
  } 
  else if (cleanValue.includes(',')) {
    // Solo coma, es decimal: 123,45 -> 123.45
    cleanValue = cleanValue.replace(',', '.');
  }
  else if (cleanValue.includes('.')) {
    // Solo punto - determinar si es decimal o miles
    const dotIndex = cleanValue.lastIndexOf('.');
    const afterDot = cleanValue.substring(dotIndex + 1);
    
    // Si hay 1-2 dígitos después del punto, es decimal
    // Si hay 3 dígitos después del punto, es separador de miles
    if (afterDot.length <= 2) {
      // Es decimal, mantener como está
    } else {
      // Es separador de miles, quitar
      cleanValue = cleanValue.replace(/\./g, '');
    }
  }
  
  const num = parseFloat(cleanValue);
  return isNaN(num) ? null : num;
}

// Función para normalizar booleanos
function parseBoolean(value) {
  if (!value || value === '') return false;
  const str = String(value).toLowerCase().trim();
  return str === 'si' || str === 'sí' || str === 'yes' || str === '1' || str === 'true';
}

// Función para determinar disponibilidad
function isAvailable(estado) {
  const disponibles = ['Lista para arrendar', 'RE - Acondicionamiento'];
  return disponibles.includes(estado);
}

// Función para extraer bedrooms de tipología
function extractBedrooms(tipologia) {
  if (tipologia.includes('Estudio')) return 0;
  if (tipologia.includes('1D')) return 1;
  if (tipologia.includes('2D')) return 2;
  if (tipologia.includes('3D')) return 3;
  return 1;
}

// Función para extraer bathrooms de tipología
function extractBathrooms(tipologia) {
  if (tipologia.includes('1B')) return 1;
  if (tipologia.includes('2B')) return 2;
  if (tipologia.includes('3B')) return 3;
  return 1;
}

async function parseCSV() {
  console.log('\n📄 Leyendo archivo CSV...');
  
  const csvPath = path.join(process.cwd(), 'data/sources/assetplan-export.csv');
  const csvContent = await fs.readFile(csvPath, 'utf-8');
  
  const lines = csvContent.split('\n').filter(line => line.trim());
  const headers = lines[0].split(';');
  
  console.log(`📊 Headers detectados: ${headers.length} columnas`);
  console.log(`📊 Filas de datos: ${lines.length - 1}`);
  
  // Procesar filas de datos
  const rawUnits = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(';');
    if (values.length !== headers.length) {
      console.log(`⚠️ Línea ${i + 1} tiene ${values.length} valores, esperando ${headers.length}`);
      continue;
    }
    
    const unit = {};
    headers.forEach((header, index) => {
      unit[header.trim()] = values[index]?.trim() || '';
    });
    
    rawUnits.push(unit);
  }
  
  console.log(`✅ Procesadas ${rawUnits.length} unidades`);
  return rawUnits;
}

function groupByBuilding(units) {
  console.log('\n🏗️ Agrupando por edificios...');
  
  const buildingsMap = new Map();
  
  units.forEach(unit => {
    const buildingCode = unit.OP || 'UNKNOWN';
    const buildingKey = buildingCode.substring(0, buildingCode.length - 3); // Quitar últimos 3 caracteres (número de unidad)
    
    if (!buildingsMap.has(buildingKey)) {
      buildingsMap.set(buildingKey, {
        code: buildingKey,
        name: unit.Condominio || buildingKey,
        address: unit.Direccion || '',
        comuna: unit.Comuna || '',
        units: []
      });
    }
    
    buildingsMap.get(buildingKey).units.push(unit);
  });
  
  console.log(`✅ Encontrados ${buildingsMap.size} edificios únicos`);
  return Array.from(buildingsMap.values());
}

function transformToSupabaseFormat(buildings) {
  console.log('\n🔄 Transformando al formato Supabase...');
  
  const supabaseBuildings = [];
  const supabaseUnits = [];
  
  buildings.forEach(building => {
    const buildingId = randomUUID();
    
    // Calcular precio_desde y precio_hasta
    const availableUnits = building.units.filter(u => isAvailable(u.Estado));
    const prices = availableUnits.map(u => parseChileanNumber(u['Arriendo Total'])).filter(p => p > 0);
    
    const buildingData = {
      id: buildingId,
      provider: 'assetplan',
      source_building_id: building.code,
      slug: building.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      nombre: building.name,
      comuna: building.comuna,
      direccion: building.address,
      precio_desde: prices.length > 0 ? Math.min(...prices) : null,
      precio_hasta: prices.length > 0 ? Math.max(...prices) : null,
      has_availability: availableUnits.length > 0,
      gc_mode: 'MF', // Multifamily por defecto
      featured: false
    };
    
    supabaseBuildings.push(buildingData);
    
    // Procesar unidades
    building.units.forEach(unit => {
      const unitId = randomUUID();
      const tipologiaOriginal = unit.Tipologia || '';
      const tipologiaCanonica = TIPOLOGIA_MAPPING[tipologiaOriginal] || tipologiaOriginal;
      
      const unitData = {
        id: unitId,
        provider: 'assetplan',
        source_unit_id: unit.OP || '',
        building_id: buildingId,
        unidad: unit.Unidad || '',
        tipologia: tipologiaCanonica,
        bedrooms: extractBedrooms(tipologiaOriginal),
        bathrooms: extractBathrooms(tipologiaOriginal),
        area_m2: parseChileanDecimal(unit['m2 Depto']),
        area_interior_m2: parseChileanDecimal(unit['m2 Depto']),
        area_exterior_m2: parseChileanDecimal(unit['m2 Terraza']),
        orientacion: ORIENTACION_MAPPING[unit.Orientacion] || null,
        pet_friendly: parseBoolean(unit['Acepta Mascotas?']),
        precio: parseChileanNumber(unit['Arriendo Total']),
        gastos_comunes: parseChileanNumber(unit['GC Total']),
        disponible: isAvailable(unit.Estado),
        status: isAvailable(unit.Estado) ? 'available' : 'rented',
        // Campos v2 para cotizaciones
        guarantee_installments: parseChileanNumber(unit['Cuotas Garantía']) || null,
        guarantee_months: parseChileanNumber(unit['Cant. Garantías (Meses)']) || null,
        rentas_necesarias: parseChileanDecimal(unit['Rentas Necesarias']),
        link_listing: unit['Link Listing'] || null,
        // Campos adicionales
        parking_ids: null, // No viene en este CSV
        storage_ids: null,  // No viene en este CSV
        parking_opcional: false,
        storage_opcional: false,
        piso: null, // Se podría extraer del número de unidad
        amoblado: false, // No viene en este CSV
        comment_text: unit.Comentario || null
      };
      
      // Calcular renta_minima como precio * rentas_necesarias
      if (unitData.precio && unitData.rentas_necesarias) {
        unitData.renta_minima = Math.round(unitData.precio * unitData.rentas_necesarias);
      }
      
      supabaseUnits.push(unitData);
    });
  });
  
  console.log(`✅ Transformados ${supabaseBuildings.length} edificios y ${supabaseUnits.length} unidades`);
  return { buildings: supabaseBuildings, units: supabaseUnits };
}

async function loadToSupabase(data) {
  console.log('\n💾 Cargando datos a Supabase...');
  
  try {
    // Verificar si ya hay edificios
    const { data: existingBuildings } = await supabase
      .from('buildings')
      .select('id, source_building_id')
      .eq('provider', 'assetplan');
    
    const hasBuildings = existingBuildings && existingBuildings.length > 0;
    
    if (!hasBuildings) {
      // Limpiar datos existentes solo si no hay edificios
      console.log('🧹 Limpiando datos existentes...');
      await supabase.from('units').delete().eq('provider', 'assetplan');
      await supabase.from('buildings').delete().eq('provider', 'assetplan');
    } else {
      console.log('🏗️ Edificios ya existen, solo limpiando unidades...');
      await supabase.from('units').delete().eq('provider', 'assetplan');
    }
    
    // Insertar edificios solo si no existen
    let buildingsData;
    if (!hasBuildings) {
      console.log(`📍 Insertando ${data.buildings.length} edificios...`);
      
      const { data: newBuildingsData, error: buildingsError } = await supabase
        .from('buildings')
        .insert(data.buildings)
        .select();
      
      if (buildingsError) {
        console.error('❌ Error insertando edificios:', buildingsError.message);
        return false;
      }
      
      buildingsData = newBuildingsData;
      console.log(`✅ Edificios insertados: ${buildingsData.length}`);
    } else {
      console.log('✅ Usando edificios existentes');
      buildingsData = existingBuildings;
      
      // Crear mapeo de códigos de edificio a IDs reales
      const buildingCodeToId = new Map();
      existingBuildings.forEach(building => {
        buildingCodeToId.set(building.source_building_id, building.id);
      });
      
      // Actualizar building_id en las unidades
      console.log('🔄 Actualizando IDs de edificios en unidades...');
      data.units.forEach(unit => {
        const newBuildingId = buildingCodeToId.get(unit.source_unit_id?.substring(0, unit.source_unit_id.length - 3));
        if (newBuildingId) {
          unit.building_id = newBuildingId;
        }
      });
    }
    
    // Insertar unidades en lotes de 100
    console.log(`🏠 Insertando ${data.units.length} unidades...`);
    
    const batchSize = 100;
    let insertedUnits = 0;
    
    for (let i = 0; i < data.units.length; i += batchSize) {
      const batch = data.units.slice(i, i + batchSize);
      
      const { data: unitsData, error: unitsError } = await supabase
        .from('units')
        .insert(batch)
        .select();
      
      if (unitsError) {
        console.error(`❌ Error insertando lote ${Math.floor(i/batchSize) + 1}:`, unitsError.message);
        continue;
      }
      
      insertedUnits += unitsData.length;
      console.log(`   ✅ Lote ${Math.floor(i/batchSize) + 1}: ${unitsData.length} unidades`);
    }
    
    console.log(`✅ Total unidades insertadas: ${insertedUnits}`);
    return true;
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
    return false;
  }
}

async function main() {
  try {
    // 1. Parsear CSV
    const rawUnits = await parseCSV();
    
    // 2. Agrupar por edificios
    const buildings = groupByBuilding(rawUnits);
    
    // 3. Transformar al formato Supabase
    const supabaseData = transformToSupabaseFormat(buildings);
    
    // 4. Cargar a Supabase
    const success = await loadToSupabase(supabaseData);
    
    if (success) {
      console.log('\n🎉 ¡INGESTA COMPLETADA EXITOSAMENTE!');
      console.log('=====================================');
      console.log(`📊 Edificios procesados: ${supabaseData.buildings.length}`);
      console.log(`🏠 Unidades procesadas: ${supabaseData.units.length}`);
      console.log(`✅ Disponibles: ${supabaseData.units.filter(u => u.disponible).length}`);
      console.log('\n🔍 Puedes verificar con: pnpm run qa:supabase');
    } else {
      console.log('\n❌ La ingesta falló. Revisa los errores arriba.');
    }
    
  } catch (error) {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
  }
}

main();
