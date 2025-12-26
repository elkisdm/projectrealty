#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('=== Verificando unidades disponibles ===\n');

// 1. Contar todas las unidades
const { count: totalCount } = await supabase
  .from('units')
  .select('*', { count: 'exact', head: true });

console.log(`Total unidades en DB: ${totalCount}\n`);

// 2. Contar unidades con disponible = true
const { count: disponibleCount } = await supabase
  .from('units')
  .select('*', { count: 'exact', head: true })
  .eq('disponible', true);

console.log(`Unidades con disponible = true: ${disponibleCount}\n`);

// 3. Ver algunas unidades para verificar el campo disponible
const { data: sampleUnits, error } = await supabase
  .from('units')
  .select('id, tipologia, price, disponible, building_id')
  .limit(5);

if (error) {
  console.error('Error:', error.message);
} else {
  console.log('Muestra de unidades:');
  sampleUnits?.forEach(u => {
    console.log(`  - ID: ${u.id}`);
    console.log(`    Tipología: ${u.tipologia}`);
    console.log(`    Precio: $${u.price}`);
    console.log(`    Disponible: ${u.disponible}`);
    console.log(`    Building ID: ${u.building_id}`);
    console.log('');
  });
}

// 4. Probar la query exacta que usa el processor
console.log('=== Probando query del processor ===\n');
const { data: processorQuery, error: processorError } = await supabase
  .from('units')
  .select(`
    id,
    building_id,
    unidad,
    tipologia,
    bedrooms,
    bathrooms,
    m2,
    area_interior_m2,
    price,
    gastos_comunes,
    disponible,
    estacionamiento,
    bodega,
    piso,
    orientacion,
    amoblado,
    pet_friendly,
    status,
    buildings!inner (
      id,
      name,
      slug,
      comuna,
      address,
      gallery,
      cover_image
    )
  `, { count: 'exact' })
  .eq('disponible', true);

if (processorError) {
  console.error('❌ Error en query del processor:', processorError.message);
  console.error('Código:', processorError.code);
  console.error('Detalles:', processorError.details);
} else {
  console.log(`✅ Query exitosa`);
  console.log(`📊 Unidades encontradas: ${processorQuery?.length || 0}`);
  if (processorQuery && processorQuery.length > 0) {
    console.log('\nPrimera unidad:');
    const first = processorQuery[0];
    console.log(`  - ID: ${first.id}`);
    console.log(`  - Tipología: ${first.tipologia}`);
    console.log(`  - Precio: $${first.price}`);
    console.log(`  - Disponible: ${first.disponible}`);
    console.log(`  - Building: ${first.buildings?.name || 'N/A'}`);
    console.log(`  - Comuna: ${first.buildings?.comuna || 'N/A'}`);
  }
}
