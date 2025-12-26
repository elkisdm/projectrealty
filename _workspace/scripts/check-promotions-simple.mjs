import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error('❌ Faltan variables de entorno requeridas');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false }
});

async function checkPromotions() {
  console.log('🔍 Revisando promociones en Supabase...\n');

  try {
    // 1. Revisar unidades con promociones
    const { data: unitsWithPromotions, error: unitsError } = await supabase
      .from('units')
      .select(`
        id,
        tipologia,
        promotions,
        disponible,
        precio,
        building_id
      `)
      .not('promotions', 'is', null)
      .limit(5);

    if (unitsError) {
      console.error('❌ Error consultando unidades con promociones:', unitsError);
      return;
    }

    console.log(`📊 Unidades con promociones encontradas: ${unitsWithPromotions?.length || 0}\n`);

    if (unitsWithPromotions && unitsWithPromotions.length > 0) {
      console.log('🏢 Primeras 5 unidades con promociones:');
      unitsWithPromotions.forEach((unit, index) => {
        console.log(`   ${index + 1}. Tipología: ${unit.tipologia}`);
        console.log(`      Precio: $${unit.precio?.toLocaleString()}`);
        console.log(`      Disponible: ${unit.disponible ? 'Sí' : 'No'}`);
        console.log(`      Promociones: ${JSON.stringify(unit.promotions)}`);
        console.log('');
      });
    } else {
      console.log('❌ No se encontraron unidades con promociones');
    }

    // 2. Contar total de unidades con promociones
    const { count: totalPromotions, error: countError } = await supabase
      .from('units')
      .select('*', { count: 'exact', head: true })
      .not('promotions', 'is', null);

    if (countError) {
      console.error('❌ Error contando promociones:', countError);
    } else {
      console.log(`📈 Total de unidades con promociones: ${totalPromotions || 0}`);
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkPromotions();
