import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function countUniqueBuildings() {
  try {
    console.log('🔍 Contando edificios únicos en Supabase...\n');
    
    // Obtener todos los edificios
    const { data: buildings, error } = await supabase
      .from('buildings')
      .select('source_building_id, nombre, comuna, direccion, precio_desde, has_availability');

    if (error) {
      console.error('❌ Error al obtener datos:', error);
      return;
    }

    console.log(`📊 Total de edificios: ${buildings.length}`);

    // Agrupar por source_building_id (que parece ser el identificador del condominio)
    const uniqueBuildingsMap = new Map();

    buildings.forEach(building => {
      const sourceId = building.source_building_id;
      
      if (sourceId) {
        if (!uniqueBuildingsMap.has(sourceId)) {
          uniqueBuildingsMap.set(sourceId, {
            count: 0,
            edificios: [],
            comunas: new Set(),
            precios: [],
            hasAvailability: false
          });
        }
        const buildingData = uniqueBuildingsMap.get(sourceId);
        buildingData.count++;
        buildingData.edificios.push(building.nombre);
        buildingData.comunas.add(building.comuna);
        if (building.precio_desde) {
          buildingData.precios.push(building.precio_desde);
        }
        if (building.has_availability) {
          buildingData.hasAvailability = true;
        }
      }
    });

    console.log(`\n🏢 EDIFICIOS ÚNICOS (${uniqueBuildingsMap.size}):`);
    console.log('=' .repeat(80));
    
    Array.from(uniqueBuildingsMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 30) // Mostrar los primeros 30
      .forEach(([sourceId, data]) => {
        const minPrice = Math.min(...data.precios);
        const maxPrice = Math.max(...data.precios);
        const avgPrice = data.precios.reduce((a, b) => a + b, 0) / data.precios.length;
        
        console.log(`\n📋 ${sourceId}`);
        console.log(`   🏠 Edificios: ${data.count}`);
        console.log(`   📍 Comunas: ${Array.from(data.comunas).join(', ')}`);
        console.log(`   🏢 Nombres: ${data.edificios.slice(0, 3).join(', ')}${data.edificios.length > 3 ? '...' : ''}`);
        console.log(`   💰 Precio desde: $${minPrice.toLocaleString('es-CL')}`);
        console.log(`   💰 Precio hasta: $${maxPrice.toLocaleString('es-CL')}`);
        console.log(`   💰 Precio promedio: $${avgPrice.toLocaleString('es-CL')}`);
        console.log(`   ✅ Disponibilidad: ${data.hasAvailability ? 'Sí' : 'No'}`);
      });

    if (uniqueBuildingsMap.size > 30) {
      console.log(`\n... y ${uniqueBuildingsMap.size - 30} edificios más`);
    }

    // Estadísticas por comuna
    const comunasMap = new Map();
    buildings.forEach(building => {
      const comuna = building.comuna;
      if (!comunasMap.has(comuna)) {
        comunasMap.set(comuna, 0);
      }
      comunasMap.set(comuna, comunasMap.get(comuna) + 1);
    });

    console.log(`\n🏘️  EDIFICIOS POR COMUNA:`);
    console.log('=' .repeat(80));
    
    Array.from(comunasMap.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([comuna, count]) => {
        console.log(`   📍 ${comuna}: ${count} edificios`);
      });

    console.log(`\n📈 RESUMEN:`);
    console.log(`   • Total edificios: ${buildings.length}`);
    console.log(`   • Edificios únicos (por source_building_id): ${uniqueBuildingsMap.size}`);
    console.log(`   • Comunas: ${comunasMap.size}`);
    console.log(`   • Promedio edificios por condominio: ${(buildings.length / uniqueBuildingsMap.size).toFixed(1)}`);
    console.log(`   • Edificios con disponibilidad: ${buildings.filter(b => b.has_availability).length}`);

  } catch (error) {
    console.error('❌ Error fatal:', error);
  }
}

countUniqueBuildings();

