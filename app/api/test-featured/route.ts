import { NextResponse } from 'next/server';
import { getAllBuildings } from '@/lib/data';
import { getFeaturedUnits } from '@/lib/hooks/useFeaturedUnits';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('[test-featured] Iniciando test...');
    
    const allBuildings = await getAllBuildings();
    console.log(`[test-featured] getAllBuildings() retornó: ${allBuildings.length} edificios`);
    
    if (allBuildings.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'getAllBuildings() retornó array vacío',
        data: { buildingsCount: 0 }
      });
    }
    
    const firstBuilding = allBuildings[0];
    console.log(`[test-featured] Primer edificio: ${firstBuilding.name}`);
    console.log(`[test-featured] Comuna: ${firstBuilding.comuna}`);
    console.log(`[test-featured] Unidades totales: ${firstBuilding.units.length}`);
    console.log(`[test-featured] Unidades disponibles: ${firstBuilding.units.filter(u => u.disponible).length}`);
    
    // Test getFeaturedUnits
    const nunoaUnits = await getFeaturedUnits({ type: 'comuna', value: 'Ñuñoa' }, 6);
    const featuredUnits = await getFeaturedUnits({ type: 'featured', value: 'featured' }, 6);
    
    console.log(`[test-featured] getFeaturedUnits(Ñuñoa): ${nunoaUnits.length}`);
    console.log(`[test-featured] getFeaturedUnits(featured): ${featuredUnits.length}`);
    
    return NextResponse.json({
      success: true,
      data: {
        buildings: {
          count: allBuildings.length,
          first: {
            name: firstBuilding.name,
            comuna: firstBuilding.comuna,
            unitsTotal: firstBuilding.units.length,
            unitsAvailable: firstBuilding.units.filter(u => u.disponible).length,
          }
        },
        featuredUnits: {
          nunoa: nunoaUnits.length,
          featured: featuredUnits.length,
        }
      }
    });
  } catch (error) {
    console.error('[test-featured] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
