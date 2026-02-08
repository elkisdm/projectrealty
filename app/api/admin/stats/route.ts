import { NextRequest } from "next/server";
import { createRateLimiter } from "@lib/rate-limit";
import { adminError, adminOk } from "@lib/admin/contracts";
import { getAllAdminBuildingsSnapshot } from "@lib/admin/repositories/buildings.repository";
import { getAllAdminUnitsSnapshot } from "@lib/admin/repositories/units.repository";
import { requireAdminSession } from "@lib/admin/guards";

export const dynamic = "force-dynamic";

const limiter = createRateLimiter({ windowMs: 60_000, max: 30 });

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

function calculateStats(
  buildings: Awaited<ReturnType<typeof getAllAdminBuildingsSnapshot>>,
  units: Awaited<ReturnType<typeof getAllAdminUnitsSnapshot>>
): DashboardStats {
  const totalBuildings = buildings.length;
  const totalUnits = units.length;
  const availableUnits = units.filter((unit) => unit.disponible).length;
  const occupiedUnits = totalUnits - availableUnits;

  const buildingsWithIncompleteData = buildings.filter((building) => {
    const hasGallery = Array.isArray(building.gallery) && building.gallery.length >= 1;
    const hasAmenities = Array.isArray(building.amenities) && building.amenities.length > 0;
    const hasAddress = typeof building.address === "string" && building.address.trim().length > 0;
    return !hasGallery || !hasAmenities || !hasAddress;
  }).length;

  const comunaMap = new Map<string, number>();
  buildings.forEach((building) => {
    const current = comunaMap.get(building.comuna) ?? 0;
    comunaMap.set(building.comuna, current + 1);
  });

  const distributionByComuna = Array.from(comunaMap.entries())
    .map(([comuna, count]) => ({ comuna, count }))
    .sort((a, b) => b.count - a.count);

  const typologyMap = new Map<string, number>();
  units.forEach((unit) => {
    const current = typologyMap.get(unit.tipologia) ?? 0;
    typologyMap.set(unit.tipologia, current + 1);
  });

  const typologyDistribution = Array.from(typologyMap.entries())
    .map(([tipologia, count]) => ({ tipologia, count }))
    .sort((a, b) => b.count - a.count);

  const prices = units.map((unit) => unit.price).filter((price) => price > 0);

  const priceRange = {
    min: prices.length > 0 ? Math.min(...prices) : 0,
    max: prices.length > 0 ? Math.max(...prices) : 0,
    average:
      prices.length > 0
        ? Math.round(prices.reduce((acc, current) => acc + current, 0) / prices.length)
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

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminSession(request, "viewer");
    if (auth.response) {
      return auth.response;
    }

    const ipHeader = request.headers.get("x-forwarded-for");
    const ip = ipHeader ? ipHeader.split(",")[0].trim() : "unknown";

    const rateLimitResult = await limiter.check(ip);
    if (!rateLimitResult.ok) {
      return adminError("rate_limited", "Demasiadas solicitudes", {
        status: 429,
        details: { retryAfter: rateLimitResult.retryAfter ?? 60 },
      });
    }

    const [buildings, units] = await Promise.all([
      getAllAdminBuildingsSnapshot(),
      getAllAdminUnitsSnapshot(),
    ]);

    const stats = calculateStats(buildings, units);

    return adminOk({
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno del servidor";

    if (message.startsWith("database_error:")) {
      return adminError("database_error", message.replace("database_error:", "").trim(), {
        status: 500,
      });
    }

    return adminError("internal_error", message, { status: 500 });
  }
}
