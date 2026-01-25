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

async function checkSupabaseData() {
  try {
    console.log('🔍 Verificando datos en Supabase...\n');
    
    // Contar edificios
    const { count: buildingsCount, error: buildingsError } = await supabase
      .from('buildings')
      .select('*', { count: 'exact', head: true });
    
    if (buildingsError) {
      console.error('❌ Error contando edificios:', buildingsError.message);
    } else {
      console.log(`📊 Total edificios en Supabase: ${buildingsCount}`);
    }
    
    // Contar unidades
    const { count: unitsCount, error: unitsError } = await supabase
      .from('units')
      .select('*', { count: 'exact', head: true });
    
    if (unitsError) {
      console.error('❌ Error contando unidades:', unitsError.message);
    } else {
      console.log(`📊 Total unidades en Supabase: ${unitsCount}`);
    }
    
    // Obtener algunos edificios de ejemplo
    const { data: buildings, error: buildingsDataError } = await supabase
      .from('buildings')
      .select('nombre, comuna, precio_desde, has_availability')
      .limit(10);
    
    if (buildingsDataError) {
      console.error('❌ Error leyendo edificios:', buildingsDataError.message);
    } else {
      console.log('\n📋 Primeros 10 edificios:');
      buildings?.forEach((building, index) => {
        console.log(`   ${index + 1}. ${building.nombre} (${building.comuna}) - $${building.precio_desde?.toLocaleString() || 'N/A'}`);
      });
    }
    
    // Verificar relación buildings-units
    const { data: buildingsWithUnits, error: relationError } = await supabase
      .from('buildings')
      .select(`
        id,
        nombre,
        units (id, tipologia, precio, disponible)
      `)
      .limit(5);
    
    if (relationError) {
      console.error('❌ Error verificando relación:', relationError.message);
    } else {
      console.log('\n🔗 Relación buildings-units:');
      buildingsWithUnits?.forEach(building => {
        const unitsCount = building.units?.length || 0;
        const availableUnits = building.units?.filter(u => u.disponible).length || 0;
        console.log(`   ${building.nombre}: ${unitsCount} unidades (${availableUnits} disponibles)`);
      });
    }
    
    // Verificar comunas disponibles
    const { data: comunas, error: comunasError } = await supabase
      .from('buildings')
      .select('comuna')
      .order('comuna');
    
    if (comunasError) {
      console.error('❌ Error obteniendo comunas:', comunasError.message);
    } else {
      const uniqueComunas = [...new Set(comunas?.map(b => b.comuna))];
      console.log('\n🏘️ Comunas disponibles:');
      console.log(`   ${uniqueComunas.join(', ')}`);
    }
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    process.exit(1);
  }
}

checkSupabaseData();
