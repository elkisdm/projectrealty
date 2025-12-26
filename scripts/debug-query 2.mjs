
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  console.log('Testing Supabase query...');
  
  try {
      const { data: units, error } = await supabase
        .from('units')
        .select(`
          id,
          building_id,
          tipologia,
          m2,
          price,
          gc,
          total_mensual,
          orientacion,
          m2_terraza,
          descuento_porcentaje,
          meses_descuento,
          garantia_meses,
          garantia_cuotas,
          rentas_necesarias,
          pet_friendly,
          reajuste_meses,
          link_listing,
          disponible,
          estacionamiento,
          bodega,
          parking_optional,
          storage_optional,
          bedrooms,
          bathrooms,
          images_tipologia,
          images_areas_comunes,
          images,
          buildings!inner (
            id,
            name,
            slug,
            comuna,
            address,
            amenities,
            gallery,
            cover_image
          )
        `)
        .eq('disponible', true)
        .limit(5);

    if (error) {
      console.error('Supabase Query Error:', JSON.stringify(error, null, 2));
    } else {
      console.log('Query Success! Found', units.length, 'units.');
      console.log('Sample unit:', JSON.stringify(units[0], null, 2));
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testQuery();
