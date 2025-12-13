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
    // TODO(BLUEPRINT): mocks solo dev
    // Intentar consulta con cliente admin
    const supabaseAdmin = createSupabaseClient();
    const { data: buildingsData, error: buildingsError } = await supabaseAdmin
      .from('buildings')
      .select('id, nombre, comuna')
      .limit(10);

    if (buildingsError) {
      return NextResponse.json({ 
        success: false, 
        error: buildingsError.message
      });
    }

    return NextResponse.json({ 
      success: true,
      totalBuildings: buildingsData?.length || 0,
      sample: (buildingsData?.slice(0, 3) as Array<{ nombre?: string; comuna?: string }>).map((b) => ({
        name: b.nombre,
        comuna: b.comuna
      })) || []
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
