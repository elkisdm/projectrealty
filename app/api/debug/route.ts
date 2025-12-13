import { NextResponse } from "next/server";
import { createSupabaseClient } from "@lib/supabase.mock";
import { createRateLimiter } from "@lib/rate-limit";

const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });

export async function GET(request: Request) {
  const ipHeader = request.headers.get("x-forwarded-for");
  const ip = ipHeader ? ipHeader.split(",")[0].trim() : "unknown";
  const { ok, retryAfter } = await limiter.check(ip);
  if (!ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(retryAfter ?? 60) } }
    );
  }
  try {
    // console.log("🔍 Endpoint de debug llamado");
    
    // Verificar variables de entorno
    const USE_SUPABASE = process.env.USE_SUPABASE === "true";
    
    // TODO(BLUEPRINT): mocks solo dev
    // Intentar consulta directa a Supabase
    const supabase = createSupabaseClient();
    const { data: buildingsData, error: buildingsError } = await supabase
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
      .limit(10);

    if (buildingsError) {
      return NextResponse.json({ 
        success: false, 
        error: buildingsError.message,
        useSupabase: USE_SUPABASE
      });
    }

    const buildingsWithUnits = (buildingsData as Array<{ nombre?: string; comuna?: string; units?: Array<{ id: string; tipologia?: string; precio?: number; disponible?: boolean }> }>)?.filter((building) => {
      const availableUnits = building.units?.filter((unit: { disponible?: boolean }) => unit.disponible) || [];
      return availableUnits.length > 0;
    }) || [];

    return NextResponse.json({ 
      success: true,
      useSupabase: USE_SUPABASE,
      totalBuildings: buildingsData?.length || 0,
      buildingsWithAvailableUnits: buildingsWithUnits.length,
      sample: buildingsWithUnits.slice(0, 3).map(b => ({
        name: b.nombre,
        comuna: b.comuna,
        unitsCount: b.units?.length || 0,
        availableUnits: b.units?.filter(u => u.disponible).length || 0
      }))
    });
  } catch (error) {
    // console.error("❌ Error en endpoint de debug:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
