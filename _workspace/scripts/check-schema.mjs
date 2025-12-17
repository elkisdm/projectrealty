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

async function checkSchema() {
  try {
    console.log('🔍 Verificando estructura de tablas...');
    
    // Verificar estructura de buildings
    console.log('\n📋 Estructura de tabla buildings:');
    const { data: buildingsData, error: buildingsError } = await supabase
      .from('buildings')
      .select('*')
      .limit(1);
    
    if (buildingsError) {
      console.error('❌ Error accediendo a buildings:', buildingsError.message);
    } else {
      console.log('✅ Tabla buildings accesible');
      if (buildingsData && buildingsData.length > 0) {
        console.log('📊 Columnas disponibles:', Object.keys(buildingsData[0]));
      } else {
        console.log('📊 Tabla buildings está vacía');
      }
    }
    
    // Verificar estructura de units
    console.log('\n📋 Estructura de tabla units:');
    const { data: unitsData, error: unitsError } = await supabase
      .from('units')
      .select('*')
      .limit(1);
    
    if (unitsError) {
      console.error('❌ Error accediendo a units:', unitsError.message);
    } else {
      console.log('✅ Tabla units accesible');
      if (unitsData && unitsData.length > 0) {
        console.log('📊 Columnas disponibles:', Object.keys(unitsData[0]));
      } else {
        console.log('📊 Tabla units está vacía');
      }
    }
    
    console.log('\n🎉 Verificación completada!');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    process.exit(1);
  }
}

checkSchema();
