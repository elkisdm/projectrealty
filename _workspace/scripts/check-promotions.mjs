#!/usr/bin/env node

import { supabaseAdmin } from '../lib/supabase.ts';

async function checkPromotions() {
  console.log('🔍 Revisando promociones en Supabase...\n');

  try {
    // 1. Revisar unidades con promociones
    const { data: unitsWithPromotions, error: unitsError } = await supabaseAdmin
      .from('units')
      .select(`
        id,
        tipologia,
        promotions,
        disponible,
        precio,
        building_id,
        buildings!inner(nombre, comuna)
      `)
      .not('promotions', 'is', null)
      .not('promotions', 'eq', '[]')
      .not('promotions', 'eq', 'null')
      .limit(10);

    if (unitsError) {
      console.error('❌ Error consultando unidades con promociones:', unitsError);
      return;
    }

    console.log(`📊 Unidades con promociones encontradas: ${unitsWithPromotions?.length || 0}\n`);

    if (unitsWithPromotions && unitsWithPromotions.length > 0) {
      console.log('🏢 Primeras 5 unidades con promociones:');
      unitsWithPromotions.slice(0, 5).forEach((unit, index) => {
        console.log(`   ${index + 1}. ${unit.buildings?.nombre} (${unit.buildings?.comuna})`);
        console.log(`      Tipología: ${unit.tipologia}`);
        console.log(`      Precio: $${unit.precio?.toLocaleString()}`);
        console.log(`      Disponible: ${unit.disponible ? 'Sí' : 'No'}`);
        console.log(`      Promociones: ${JSON.stringify(unit.promotions)}`);
        console.log('');
      });
    }

    // 2. Contar total de unidades con promociones
    const { count: totalPromotions, error: countError } = await supabaseAdmin
      .from('units')
      .select('*', { count: 'exact', head: true })
      .not('promotions', 'is', null)
      .not('promotions', 'eq', '[]')
      .not('promotions', 'eq', 'null');

    if (countError) {
      console.error('❌ Error contando promociones:', countError);
    } else {
      console.log(`📈 Total de unidades con promociones: ${totalPromotions || 0}`);
    }

    // 3. Revisar edificios que tienen unidades con promociones
    const { data: buildingsWithPromotions, error: buildingsError } = await supabaseAdmin
      .from('buildings')
      .select(`
        id,
        nombre,
        comuna,
        units!inner(
          id,
          promotions
        )
      `)
      .not('units.promotions', 'is', null)
      .not('units.promotions', 'eq', '[]')
      .not('units.promotions', 'eq', 'null')
      .limit(10);

    if (buildingsError) {
      console.error('❌ Error consultando edificios con promociones:', buildingsError);
      return;
    }

    console.log(`\n🏢 Edificios con unidades que tienen promociones: ${buildingsWithPromotions?.length || 0}\n`);

    if (buildingsWithPromotions && buildingsWithPromotions.length > 0) {
      console.log('🏢 Primeros 5 edificios con promociones:');
      buildingsWithPromotions.slice(0, 5).forEach((building, index) => {
        console.log(`   ${index + 1}. ${building.nombre} (${building.comuna})`);
        console.log(`      Unidades con promociones: ${building.units?.length || 0}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkPromotions();
