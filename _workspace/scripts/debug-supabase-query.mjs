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

async function debugSupabaseQuery() {
  try {
    console.log('🔍 Debuggeando consulta de Supabase...\n');
    
    // 1. Verificar edificios sin relación
    console.log('1. Edificios sin relación:');
    const { data: buildingsOnly, error: buildingsError } = await supabase
      .from('buildings')
      .select('id, nombre, comuna')
      .limit(5);
    
    if (buildingsError) {
      console.error('❌ Error:', buildingsError.message);
    } else {
      console.log(`✅ Encontrados ${buildingsOnly?.length || 0} edificios`);
      buildingsOnly?.forEach(b => console.log(`   - ${b.nombre} (${b.comuna})`));
    }
    
    // 2. Verificar unidades sin relación
    console.log('\n2. Unidades sin relación:');
    const { data: unitsOnly, error: unitsError } = await supabase
      .from('units')
      .select('id, tipologia, precio, disponible, building_id')
      .limit(5);
    
    if (unitsError) {
      console.error('❌ Error:', unitsError.message);
    } else {
      console.log(`✅ Encontradas ${unitsOnly?.length || 0} unidades`);
      unitsOnly?.forEach(u => console.log(`   - ${u.tipologia} - $${u.precio} (building_id: ${u.building_id})`));
    }
    
    // 3. Intentar consulta con relación
    console.log('\n3. Consulta con relación:');
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
      .limit(5);
    
    if (relationError) {
      console.error('❌ Error con relación:', relationError.message);
    } else {
      console.log(`✅ Encontrados ${buildingsWithUnits?.length || 0} edificios con relación`);
      buildingsWithUnits?.forEach(b => {
        const unitsCount = b.units?.length || 0;
        console.log(`   - ${b.nombre}: ${unitsCount} unidades`);
      });
    }
    
    // 4. Verificar si hay edificios con unidades
    console.log('\n4. Edificios que tienen unidades:');
    const { data: buildingsWithUnitsCount, error: countError } = await supabase
      .from('buildings')
      .select(`
        id,
        nombre,
        comuna,
        units!inner (id)
      `)
      .limit(5);
    
    if (countError) {
      console.error('❌ Error con inner join:', countError.message);
    } else {
      console.log(`✅ Encontrados ${buildingsWithUnitsCount?.length || 0} edificios con unidades`);
      buildingsWithUnitsCount?.forEach(b => {
        console.log(`   - ${b.nombre} (${b.comuna})`);
      });
    }
    
    // 5. Contar edificios con unidades
    const { count: buildingsWithUnitsTotal, error: totalError } = await supabase
      .from('buildings')
      .select('*', { count: 'exact', head: true })
      .not('units', 'is', null);
    
    if (totalError) {
      console.error('❌ Error contando edificios con unidades:', totalError.message);
    } else {
      console.log(`\n📊 Total edificios con unidades: ${buildingsWithUnitsTotal}`);
    }
    
  } catch (error) {
    console.error('❌ Error durante el debug:', error);
    process.exit(1);
  }
}

debugSupabaseQuery();
