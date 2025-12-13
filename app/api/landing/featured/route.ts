import { NextResponse } from "next/server";
import { createRateLimiter } from "@lib/rate-limit";
import { getAllBuildings } from "@lib/data";
import { logger } from "@lib/logger";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

// Rate limiter: 20 requests per minute per IP
const rateLimiter = createRateLimiter({ windowMs: 60_000, max: 20 });

type FeaturedBuildingItem = {
  id: string;
  slug: string;
  name: string;
  comuna: string;
  cover_image: string;
  precio_desde: number | null;
  has_availability: boolean;
};

async function getFeaturedBuildings(): Promise<FeaturedBuildingItem[]> {
  try {
    // Usar el sistema de datos existente que ya funciona
    const allBuildings = await getAllBuildings({});
    
    logger.log(`📊 Total de edificios disponibles: ${allBuildings.length}`);
    
    // Calcular hasAvailability basado en unidades disponibles (igual que el endpoint de buildings)
    const buildingsWithAvailability = allBuildings.map(building => {
      const available = building.units.filter((u) => u.disponible);
      const hasAvailability = available.length > 0;
      return { ...building, hasAvailability };
    });
    
    // Marcar algunos edificios como "featured" basado en criterios
    // Por ahora, tomamos los primeros 3 edificios con disponibilidad
    const featuredBuildings = buildingsWithAvailability
      .filter(building => building.hasAvailability)
      .slice(0, 3) // Tomar los primeros 3 como "destacados"
      .map(building => ({
        id: building.id,
        slug: building.slug,
        name: building.name,
        comuna: building.comuna,
        cover_image: building.gallery?.[0] || '/images/lascondes-cover.jpg', // Usar primera imagen de gallery
        precio_desde: building.precioDesde,
        has_availability: building.hasAvailability,
      }));

    logger.log(`⭐ Edificios destacados encontrados: ${featuredBuildings.length}`);
    
    return featuredBuildings;
  } catch (error) {
    logger.error('Error in getFeaturedBuildings:', error);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    // Rate limiting check
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "unknown";
    const rateLimitResult = await rateLimiter.check(ip);
    
    if (!rateLimitResult.ok) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retryAfter: rateLimitResult.retryAfter },
        { 
          status: 429,
          headers: {
            "Retry-After": rateLimitResult.retryAfter?.toString() || "60",
            "X-RateLimit-Limit": "20",
            "X-RateLimit-Window": "60"
          }
        }
      );
    }

    const featuredBuildings = await getFeaturedBuildings();

    return NextResponse.json({ 
      buildings: featuredBuildings,
      count: featuredBuildings.length,
      meta: {
        endpoint: "featured",
        cached: false
      }
    });
  } catch (error) {
    logger.error("API Error in /api/landing/featured:", error);
    return NextResponse.json(
      { 
        error: "Error inesperado", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }, 
      { status: 500 }
    );
  }
}
