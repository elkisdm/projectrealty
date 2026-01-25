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

async function testSupabaseDirect() {
  try {
    console.log('🧪 Probando consulta directa a Supabase...\n');
    
    // Simular la consulta exacta que hace la función readFromSupabase
    const { data: buildingsData, error: buildingsError } = await supabase
      .from('buildings')
      .select(`
        id,
        slug,
        nombre,
        comuna,
        direccion,
        precio_desde,
        has_availability,
        units (
          id,
          tipologia,
          area_m2,
          precio,
          disponible,
          bedrooms,
          bathrooms
        )
      `)
      .order('nombre')
      .limit(100);

    if (buildingsError) {
      console.error('❌ Error:', buildingsError.message);
      return;
    }

    console.log(`📊 Total edificios obtenidos: ${buildingsData?.length || 0}`);
    
    // Filtrar edificios con unidades disponibles
    const buildingsWithAvailableUnits = buildingsData?.filter(building => {
      const availableUnits = building.units?.filter(unit => unit.disponible) || [];
      return availableUnits.length > 0;
    }) || [];

    console.log(`📊 Edificios con unidades disponibles: ${buildingsWithAvailableUnits.length}`);
    
    // Mostrar los primeros 10 edificios con unidades disponibles
    console.log('\n📋 Primeros 10 edificios con unidades disponibles:');
    buildingsWithAvailableUnits.slice(0, 10).forEach((building, index) => {
      const availableUnits = building.units?.filter(unit => unit.disponible) || [];
      console.log(`${index + 1}. ${building.nombre} (${building.comuna}) - ${availableUnits.length} unidades disponibles`);
    });
    
    // Verificar si hay edificios sin unidades
    const buildingsWithoutUnits = buildingsData?.filter(building => {
      return !building.units || building.units.length === 0;
    }) || [];
    
    console.log(`\n📊 Edificios sin unidades: ${buildingsWithoutUnits.length}`);
    
    // Verificar si hay edificios con unidades pero todas no disponibles
    const buildingsWithNoAvailableUnits = buildingsData?.filter(building => {
      const availableUnits = building.units?.filter(unit => unit.disponible) || [];
      return building.units && building.units.length > 0 && availableUnits.length === 0;
    }) || [];
    
    console.log(`📊 Edificios con unidades pero ninguna disponible: ${buildingsWithNoAvailableUnits.length}`);
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
    process.exit(1);
  }
}

testSupabaseDirect();
