#!/usr/bin/env node

/**
 * Test directo de getAllBuildings() para verificar qué retorna
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.production' });
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('=== Test getAllBuildings() ===\n');
console.log('USE_SUPABASE:', process.env.USE_SUPABASE);
console.log('SUPABASE_URL:', supabaseUrl ? '✅' : '❌');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Simular readFromSupabase()
async function testReadFromSupabase() {
  try {
    const { data: buildingsData, error } = await supabase
      .from('buildings')
      .select(`
        id,
        slug,
        name,
        comuna,
        address,
        amenities,
        gallery,
        cover_image,
        badges,
        service_level,
        units!left (
          id,
          tipologia,
          m2,
          price,
          disponible,
          estacionamiento,
          bodega,
          bedrooms,
          bathrooms
        )
      `)
      .order('name')
      .limit(5);

    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    console.log(`✅ Edificios obtenidos: ${buildingsData?.length || 0}\n`);

    if (buildingsData && buildingsData.length > 0) {
      const b = buildingsData[0];
      console.log('Primer edificio:');
      console.log(`  - Nombre: ${b.name}`);
      console.log(`  - Comuna: ${b.comuna}`);
      console.log(`  - Slug: ${b.slug || 'NO TIENE'}`);
      console.log(`  - Address: ${b.address || 'NO TIENE'}`);
      console.log(`  - Amenities: ${Array.isArray(b.amenities) ? b.amenities.length : 'NO ES ARRAY'}`);
      console.log(`  - Gallery: ${Array.isArray(b.gallery) ? b.gallery.length : 'NO ES ARRAY'}`);
      console.log(`  - Cover image: ${b.cover_image || 'NO TIENE'}`);
      console.log(`  - Service level: ${b.service_level || 'NO TIENE'}`);
      console.log(`  - Unidades: ${Array.isArray(b.units) ? b.units.length : 'NO ES ARRAY'}`);

      if (Array.isArray(b.units) && b.units.length > 0) {
        const u = b.units[0];
        console.log('\nPrimera unidad:');
        console.log(`  - ID: ${u.id}`);
        console.log(`  - Tipología: ${u.tipologia}`);
        console.log(`  - Precio: $${u.price}`);
        console.log(`  - Disponible: ${u.disponible}`);
        console.log(`  - Bedrooms: ${u.bedrooms ?? 'NO TIENE'}`);
        console.log(`  - Bathrooms: ${u.bathrooms ?? 'NO TIENE'}`);
      }

      // Filtrar edificios con unidades
      const buildingsWithUnits = buildingsData.filter(b => {
        const units = b.units || [];
        return Array.isArray(units) && units.length > 0;
      });

      console.log(`\n✅ Edificios con unidades: ${buildingsWithUnits.length} de ${buildingsData.length}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testReadFromSupabase().then(() => process.exit(0));
