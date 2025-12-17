import { readFromSupabase } from '../lib/data.ts';

async function countCondominios() {
  try {
    console.log('🔍 Contando condominios únicos en Supabase...\n');
    
    const buildings = await readFromSupabase();
    
    console.log(`📊 Total de edificios: ${buildings.length}`);

    // Agrupar por condominio
    const condominiosMap = new Map();
    const opMap = new Map();

    buildings.forEach(building => {
      const condominio = building.condominio;
      const op = building.op;
      
      if (condominio) {
        if (!condominiosMap.has(condominio)) {
          condominiosMap.set(condominio, {
            count: 0,
            edificios: [],
            comunas: new Set()
          });
        }
        const condominioData = condominiosMap.get(condominio);
        condominioData.count++;
        condominioData.edificios.push(building.name || building.nombre);
        condominioData.comunas.add(building.comuna);
      }

      if (op) {
        if (!opMap.has(op)) {
          opMap.set(op, {
            count: 0,
            edificios: [],
            comunas: new Set()
          });
        }
        const opData = opMap.get(op);
        opData.count++;
        opData.edificios.push(building.name || building.nombre);
        opData.comunas.add(building.comuna);
      }
    });

    console.log(`\n🏢 CONDOMINIOS ÚNICOS (${condominiosMap.size}):`);
    console.log('=' .repeat(80));
    
    Array.from(condominiosMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 20) // Mostrar solo los primeros 20
      .forEach(([condominio, data]) => {
        console.log(`\n📋 ${condominio}`);
        console.log(`   🏠 Edificios: ${data.count}`);
        console.log(`   📍 Comunas: ${Array.from(data.comunas).join(', ')}`);
        console.log(`   🏢 Nombres: ${data.edificios.slice(0, 3).join(', ')}${data.edificios.length > 3 ? '...' : ''}`);
      });

    if (condominiosMap.size > 20) {
      console.log(`\n... y ${condominiosMap.size - 20} condominios más`);
    }

    console.log(`\n🏗️  OPs ÚNICOS (${opMap.size}):`);
    console.log('=' .repeat(80));
    
    Array.from(opMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 20) // Mostrar solo los primeros 20
      .forEach(([op, data]) => {
        console.log(`\n📋 ${op}`);
        console.log(`   🏠 Edificios: ${data.count}`);
        console.log(`   📍 Comunas: ${Array.from(data.comunas).join(', ')}`);
        console.log(`   🏢 Nombres: ${data.edificios.slice(0, 3).join(', ')}${data.edificios.length > 3 ? '...' : ''}`);
      });

    if (opMap.size > 20) {
      console.log(`\n... y ${opMap.size - 20} OPs más`);
    }

    console.log(`\n📈 RESUMEN:`);
    console.log(`   • Total edificios: ${buildings.length}`);
    console.log(`   • Condominios únicos: ${condominiosMap.size}`);
    console.log(`   • OPs únicos: ${opMap.size}`);
    console.log(`   • Promedio edificios por condominio: ${(buildings.length / condominiosMap.size).toFixed(1)}`);

  } catch (error) {
    console.error('❌ Error fatal:', error);
  }
}

countCondominios();
