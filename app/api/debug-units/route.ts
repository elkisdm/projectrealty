import { NextResponse } from 'next/server';
import { getAllBuildings } from '@/lib/data';
import { getFeaturedUnits } from '@/lib/hooks/useFeaturedUnits';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Test 1: getAllBuildings
    const allBuildings = await getAllBuildings();
    
    // Test 2: getFeaturedUnits para Ñuñoa
    const nunoaUnits = await getFeaturedUnits({ type: 'comuna', value: 'Ñuñoa' }, 6);
    
    // Test 3: getFeaturedUnits featured
    const featuredUnits = await getFeaturedUnits({ type: 'featured', value: 'featured' }, 6);
    
    return NextResponse.json({
      success: true,
      env: {
        USE_SUPABASE: process.env.USE_SUPABASE,
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
      data: {
        getAllBuildings: {
          count: allBuildings.length,
          firstBuilding: allBuildings.length > 0 ? {
            name: allBuildings[0].name,
            comuna: allBuildings[0].comuna,
            unitsCount: allBuildings[0].units.length,
            availableUnits: allBuildings[0].units.filter(u => u.disponible).length,
            firstUnit: allBuildings[0].units.length > 0 ? {
              id: allBuildings[0].units[0].id,
              tipologia: allBuildings[0].units[0].tipologia,
              price: allBuildings[0].units[0].price,
              disponible: allBuildings[0].units[0].disponible,
            } : null,
          } : null,
        },
        getFeaturedUnits: {
          nunoa: {
            count: nunoaUnits.length,
            firstUnit: nunoaUnits.length > 0 ? {
              tipologia: nunoaUnits[0].unit.tipologia,
              price: nunoaUnits[0].unit.price,
              building: nunoaUnits[0].building.name,
              comuna: nunoaUnits[0].building.comuna,
            } : null,
          },
          featured: {
            count: featuredUnits.length,
            firstUnit: featuredUnits.length > 0 ? {
              tipologia: featuredUnits[0].unit.tipologia,
              price: featuredUnits[0].unit.price,
              building: featuredUnits[0].building.name,
            } : null,
          },
        },
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
