import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { createRateLimiter } from "@lib/rate-limit";
import { readAll } from "@lib/data";
import type { Building, Unit } from "@schemas/models";
import { logger } from "@lib/logger";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Rate limiting for admin endpoints
const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });

interface DashboardStats {
  totalBuildings: number;
  totalUnits: number;
  availableUnits: number;
  occupiedUnits: number;
  buildingsWithIncompleteData: number;
  distributionByComuna: Array<{
    comuna: string;
    count: number;
  }>;
  typologyDistribution: Array<{
    tipologia: string;
    count: number;
  }>;
  priceRange: {
    min: number;
    max: number;
    average: number;
  };
}

function calculateStats(buildings: Building[]): DashboardStats {
  const totalBuildings = buildings.length;

  // Calcular unidades
  const allUnits: Unit[] = buildings.flatMap((b) => b.units || []);
  const totalUnits = allUnits.length;
  const availableUnits = allUnits.filter((u) => u.disponible).length;
  const occupiedUnits = totalUnits - availableUnits;

  // Edificios con datos incompletos (sin gallery, amenities, etc.)
  const buildingsWithIncompleteData = buildings.filter((b) => {
    const hasGallery = b.gallery && b.gallery.length >= 3;
    const hasAmenities = b.amenities && b.amenities.length > 0;
    const hasAddress = b.address && b.address.trim().length > 0;
    return !hasGallery || !hasAmenities || !hasAddress;
  }).length;

  // Distribución por comuna
  const comunaMap = new Map<string, number>();
  buildings.forEach((b) => {
    const count = comunaMap.get(b.comuna) || 0;
    comunaMap.set(b.comuna, count + 1);
  });
  const distributionByComuna = Array.from(comunaMap.entries())
    .map(([comuna, count]) => ({ comuna, count }))
    .sort((a, b) => b.count - a.count);

  // Distribución por tipología
  const tipologiaMap = new Map<string, number>();
  allUnits.forEach((u) => {
    const count = tipologiaMap.get(u.tipologia) || 0;
    tipologiaMap.set(u.tipologia, count + 1);
  });
  const typologyDistribution = Array.from(tipologiaMap.entries())
    .map(([tipologia, count]) => ({ tipologia, count }))
    .sort((a, b) => b.count - a.count);

  // Rango de precios
  const prices = allUnits.map((u) => u.price).filter((p) => p > 0);
  const priceRange = {
    min: prices.length > 0 ? Math.min(...prices) : 0,
    max: prices.length > 0 ? Math.max(...prices) : 0,
    average:
      prices.length > 0
        ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
        : 0,
  };

  return {
    totalBuildings,
    totalUnits,
    availableUnits,
    occupiedUnits,
    buildingsWithIncompleteData,
    distributionByComuna,
    typologyDistribution,
    priceRange,
  };
}

// Función cached para obtener y calcular stats
const getCachedStats = unstable_cache(
  async (): Promise<DashboardStats> => {
    const buildings = await readAll();
    return calculateStats(buildings);
  },
  ["admin-stats"],
  {
    revalidate: 60, // Revalidar cada 60 segundos
    tags: ["admin-stats"],
  }
);

export async function GET(request: Request) {
  try {
    // Rate limiting
    const ipHeader = request.headers.get("x-forwarded-for");
    const ip = ipHeader ? ipHeader.split(",")[0].trim() : "unknown";

    const rateLimitResult = await limiter.check(ip);
    if (!rateLimitResult.ok) {
      return NextResponse.json(
        { error: "rate_limited" },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimitResult.retryAfter ?? 60) },
        }
      );
    }

    // Obtener estadísticas desde cache
    const stats = await getCachedStats();

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // En caso de error, devolver stats vacías en lugar de fallar completamente
    const errorMessage = error instanceof Error ? error.message : "Error interno del servidor";
    logger.error("Error al obtener stats del admin:", errorMessage);
    
    // Devolver valores por defecto para que el dashboard no se rompa
    const defaultStats: DashboardStats = {
      totalBuildings: 0,
      totalUnits: 0,
      availableUnits: 0,
      occupiedUnits: 0,
      buildingsWithIncompleteData: 0,
      distributionByComuna: [],
      typologyDistribution: [],
      priceRange: {
        min: 0,
        max: 0,
        average: 0,
      },
    };

    return NextResponse.json({
      success: true,
      stats: defaultStats,
      timestamp: new Date().toISOString(),
      error: errorMessage, // Incluir el error para debugging
    });
  }
}


