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

async function testReadAll() {
  try {
    console.log('🧪 Simulando función readAll()...\n');
    
    // Simular la lógica de readAll()
    const USE_SUPABASE = process.env.USE_SUPABASE === "true";
    console.log(`🔧 USE_SUPABASE: ${USE_SUPABASE}`);
    
    if (USE_SUPABASE) {
      console.log('🔄 Intentando leer desde Supabase...');
      
      // Simular readFromSupabase()
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
        console.error('❌ Error fetching buildings from Supabase:', buildingsError);
        return;
      }

      if (!buildingsData || buildingsData.length === 0) {
        console.log('❌ No buildings found in Supabase');
        return;
      }

      console.log(`✅ Encontrados ${buildingsData.length} edificios en Supabase`);

      // Filtrar solo edificios que tienen unidades disponibles
      const buildingsWithAvailableUnits = buildingsData.filter(building => {
        const availableUnits = building.units?.filter(unit => unit.disponible) || [];
        return availableUnits.length > 0;
      });

      console.log(`✅ ${buildingsWithAvailableUnits.length} edificios tienen unidades disponibles`);

      if (buildingsWithAvailableUnits.length === 0) {
        console.log('❌ No hay edificios con unidades disponibles');
        return;
      }

      // Transformar los datos al formato esperado
      const buildings = buildingsWithAvailableUnits.map((building) => ({
        id: building.id,
        slug: building.slug || `edificio-${building.id}`,
        name: building.nombre,
        comuna: building.comuna,
        address: building.direccion || 'Dirección no disponible',
        amenities: ['Piscina', 'Gimnasio'],
        gallery: [
          '/images/lascondes-cover.jpg',
          '/images/lascondes-1.jpg', 
          '/images/lascondes-2.jpg'
        ],
        coverImage: '/images/lascondes-cover.jpg',
        badges: [],
        serviceLevel: undefined,
        units: (building.units || []).map((unit) => ({
          id: unit.id,
          tipologia: unit.tipologia || 'No especificada',
          m2: unit.area_m2 || 50,
          price: unit.precio || 500000,
          estacionamiento: false,
          bodega: false,
          disponible: unit.disponible || false,
          bedrooms: unit.bedrooms || 1,
          bathrooms: unit.bathrooms || 1
        }))
      }));

      console.log(`✅ Transformados ${buildings.length} edificios al formato esperado`);
      
      // Simular validación
      console.log('🔍 Simulando validación...');
      console.log(`✅ ${buildings.length} edificios listos para usar`);
      
      // Mostrar algunos ejemplos
      console.log('\n📋 Primeros 5 edificios:');
      buildings.slice(0, 5).forEach((building, index) => {
        const availableUnits = building.units.filter(unit => unit.disponible);
        console.log(`${index + 1}. ${building.name} (${building.comuna}) - ${availableUnits.length} unidades disponibles`);
      });
      
    } else {
      console.log('📄 USE_SUPABASE no está habilitado');
    }
    
  } catch (error) {
    console.error('❌ Error durante la simulación:', error);
  }
}

testReadAll();
