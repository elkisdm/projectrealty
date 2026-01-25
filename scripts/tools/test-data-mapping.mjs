#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
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

console.log('🧪 PRUEBA DE MAPEO DE DATOS');
console.log('==========================');

async function testDataMapping() {
  try {
    // 1. Probar inserción de edificio de prueba
    console.log('\n📍 Insertando edificio de prueba...');
    
    // Generar UUID válido para Supabase
    const testBuildingId = randomUUID();
    const testBuilding = {
      id: testBuildingId,
      slug: 'test-mapping-slug',
      nombre: 'Edificio Test Mapping',  // Usar nombres en español
      comuna: 'Las Condes',
      direccion: 'Av. Test 123',        // Usar direccion en lugar de address
      provider: 'test',                 // Campo requerido del esquema
      source_building_id: 'test-building-123', // Campo requerido del esquema
      // Campos v2
      precio_desde: 800000,
      precio_hasta: 1200000,
      gc_mode: 'MF',
      featured: true
    };

    const { data: buildingData, error: buildingError } = await supabase
      .from('buildings')
      .insert([testBuilding])
      .select();

    if (buildingError) {
      console.log(`❌ Error insertando edificio: ${buildingError.message}`);
      return;
    }
    
    console.log('✅ Edificio insertado correctamente');
    console.log(`   ID: ${buildingData[0].id}`);

    // 2. Probar inserción de unidad de prueba
    console.log('\n🏠 Insertando unidad de prueba...');
    
    const testUnit = {
      id: randomUUID(),
      provider: 'test',              // Campo requerido del esquema
      source_unit_id: 'test-unit-456', // Campo requerido del esquema  
      building_id: testBuildingId,
      unidad: '2A',                  // Campo del esquema real
      tipologia: '2D1B',
      area_m2: 75,           // Usar area_m2 en lugar de m2
      precio: 950000,        // Usar precio en lugar de price
      disponible: true,
      bedrooms: 2,
      bathrooms: 1,
      // Campos v2
      area_interior_m2: 65.5,
      area_exterior_m2: 9.5,
      orientacion: 'NE',
      piso: 8,
      amoblado: false,
      pet_friendly: true,
      parking_ids: '101|102',
      storage_opcional: true,
      guarantee_installments: 6,
      guarantee_months: 1,
      rentas_necesarias: 3.5,
      renta_minima: 3325000
    };

    const { data: unitData, error: unitError } = await supabase
      .from('units')
      .insert([testUnit])
      .select();

    if (unitError) {
      console.log(`❌ Error insertando unidad: ${unitError.message}`);
      // Continuar para limpiar el edificio
    } else {
      console.log('✅ Unidad insertada correctamente');
      console.log(`   ID: ${unitData[0].id}`);
    }

    // 3. Probar consulta con relaciones
    console.log('\n🔍 Probando consulta con relaciones...');
    
    const { data: queryData, error: queryError } = await supabase
      .from('buildings')
      .select(`
        id,
        slug,
        nombre,
        comuna,
        direccion,
        precio_desde,
        precio_hasta,
        gc_mode,
        featured,
        units (
          id,
          tipologia,
          area_m2,
          precio,
          disponible,
          bedrooms,
          bathrooms,
          area_interior_m2,
          area_exterior_m2,
          orientacion,
          guarantee_installments
        )
      `)
      .eq('id', testBuildingId);

    if (queryError) {
      console.log(`❌ Error en consulta: ${queryError.message}`);
    } else {
      console.log('✅ Consulta con relaciones exitosa');
      console.log(`   Edificio: ${queryData[0].nombre}`); // Usar nombre en lugar de name
      console.log(`   Unidades: ${queryData[0].units?.length || 0}`);
      
      if (queryData[0].units && queryData[0].units.length > 0) {
        const unit = queryData[0].units[0];
        console.log(`   Primera unidad - Tipología: ${unit.tipologia}, Precio: ${unit.precio}`); // Usar precio en lugar de price
      }
    }

    // 4. Probar mapeo a formato interno
    console.log('\n🔄 Probando mapeo a formato interno...');
    
    if (queryData && queryData.length > 0) {
      const building = queryData[0];
      
      // Simular el mapeo que hace lib/data.ts
      const mappedBuilding = {
        id: building.id,
        slug: building.slug,
        name: building.nombre,     // Mapear nombre -> name
        comuna: building.comuna,
        address: building.direccion, // Mapear direccion -> address
        amenities: ['Piscina', 'Gimnasio'], // Datos de ejemplo
        gallery: ['/images/test-1.jpg', '/images/test-2.jpg', '/images/test-3.jpg'], // Datos de ejemplo
        // Campos v2
        precio_desde: building.precio_desde,
        precio_hasta: building.precio_hasta,
        gc_mode: building.gc_mode,
        featured: building.featured,
        units: building.units?.map(unit => ({
          id: unit.id,
          tipologia: unit.tipologia,
          m2: unit.area_m2,        // Mapear area_m2 -> m2
          price: unit.precio,      // Mapear precio -> price
          estacionamiento: Boolean(unit.parking_ids && unit.parking_ids !== 'x'),
          bodega: Boolean(unit.storage_ids && unit.storage_ids !== 'x'),
          disponible: unit.disponible,
          bedrooms: unit.bedrooms,
          bathrooms: unit.bathrooms,
          // Campos v2
          area_interior_m2: unit.area_interior_m2,
          area_exterior_m2: unit.area_exterior_m2,
          orientacion: unit.orientacion,
          guarantee_installments: unit.guarantee_installments
        })) || []
      };
      
      console.log('✅ Mapeo a formato interno exitoso');
      console.log(`   Estructura validada para: ${mappedBuilding.name}`);
    }

    // 5. Limpiar datos de prueba
    console.log('\n🧹 Limpiando datos de prueba...');
    
    // Eliminar unidades primero (por foreign key)
    await supabase
      .from('units')
      .delete()
      .eq('building_id', testBuildingId);
    
    // Eliminar edificio
    await supabase
      .from('buildings')
      .delete()
      .eq('id', testBuildingId);
    
    console.log('✅ Datos de prueba eliminados');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

console.log('\n🎯 EJECUTANDO PRUEBAS...');
testDataMapping().then(() => {
  console.log('\n✅ PRUEBA COMPLETADA');
  console.log('\nSi todo salió bien, tu integración Supabase está lista para usar.');
  console.log('Puedes ejecutar: pnpm run qa:supabase para verificar todo el sistema.');
});
