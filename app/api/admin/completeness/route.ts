import { NextRequest } from "next/server";
import { createRateLimiter } from "@lib/rate-limit";
import { adminError, adminOk } from "@lib/admin/contracts";
import { requireAdminSession } from "@lib/admin/guards";
import { getAdminDbClient } from "@lib/admin/repositories/client";
import { getAllAdminBuildingsSnapshot } from "@lib/admin/repositories/buildings.repository";

export const dynamic = "force-dynamic";

const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });

interface CompletenessStats {
  totalBuildings: number;
  averageCompleteness: number;
  buildingsWithIssues: number;
  completenessDistribution: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
  topIssues: Array<{
    field: string;
    count: number;
    percentage: number;
  }>;
}

type CompletenessRow = {
  id: string;
  slug: string;
  name: string;
  comuna: string;
  address: string;
  completeness_percentage: number;
  cover_image_status: "✅" | "❌";
  badges_status: "✅" | "❌";
  service_level_status: "✅" | "❌";
  amenities_status: "✅" | "❌";
  gallery_status: "✅" | "❌";
  updated_at: string;
};

function calculateCompletenessStats(buildings: CompletenessRow[]): CompletenessStats {
  if (buildings.length === 0) {
    return {
      totalBuildings: 0,
      averageCompleteness: 0,
      buildingsWithIssues: 0,
      completenessDistribution: {
        excellent: 0,
        good: 0,
        fair: 0,
        poor: 0,
      },
      topIssues: [],
    };
  }

  const totalBuildings = buildings.length;
  const averageCompleteness =
    buildings.reduce((acc, row) => acc + row.completeness_percentage, 0) / totalBuildings;

  const buildingsWithIssues = buildings.filter((row) => row.completeness_percentage < 100).length;

  const completenessDistribution = buildings.reduce(
    (acc, row) => {
      if (row.completeness_percentage >= 90) acc.excellent += 1;
      else if (row.completeness_percentage >= 70) acc.good += 1;
      else if (row.completeness_percentage >= 50) acc.fair += 1;
      else acc.poor += 1;
      return acc;
    },
    {
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0,
    }
  );

  const issueCounters = {
    cover_image: buildings.filter((row) => row.cover_image_status === "❌").length,
    badges: buildings.filter((row) => row.badges_status === "❌").length,
    service_level: buildings.filter((row) => row.service_level_status === "❌").length,
    amenities: buildings.filter((row) => row.amenities_status === "❌").length,
    gallery: buildings.filter((row) => row.gallery_status === "❌").length,
  };

  const topIssues = Object.entries(issueCounters)
    .filter(([, count]) => count > 0)
    .map(([field, count]) => ({
      field,
      count,
      percentage: Math.round((count / totalBuildings) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalBuildings,
    averageCompleteness: Math.round(averageCompleteness * 10) / 10,
    buildingsWithIssues,
    completenessDistribution,
    topIssues,
  };
}

function toCompletenessRowsFromSnapshot(
  buildings: Awaited<ReturnType<typeof getAllAdminBuildingsSnapshot>>
): CompletenessRow[] {
  return buildings.map((building) => {
    const checks = {
      cover_image_status: building.coverImage ? "✅" : "❌",
      badges_status: Array.isArray(building.badges) && building.badges.length > 0 ? "✅" : "❌",
      service_level_status: building.serviceLevel ? "✅" : "❌",
      amenities_status: Array.isArray(building.amenities) && building.amenities.length > 0 ? "✅" : "❌",
      gallery_status: Array.isArray(building.gallery) && building.gallery.length > 0 ? "✅" : "❌",
    } as const;

    const totalChecks = Object.keys(checks).length;
    const passed = Object.values(checks).filter((value) => value === "✅").length;

    return {
      id: building.id,
      slug: building.slug,
      name: building.name,
      comuna: building.comuna,
      address: building.address,
      completeness_percentage: Math.round((passed / totalChecks) * 1000) / 10,
      ...checks,
      updated_at: new Date().toISOString(),
    };
  });
}

async function fetchCompletenessRows(): Promise<CompletenessRow[]> {
  const client = getAdminDbClient();
  const { data, error } = await client
    .from("v_building_completeness")
    .select("*")
    .order("completeness_percentage", { ascending: true });

  if (error) {
    const snapshot = await getAllAdminBuildingsSnapshot();
    return toCompletenessRowsFromSnapshot(snapshot);
  }

  return ((data || []) as CompletenessRow[]).map((row) => ({
    ...row,
    name: (row as CompletenessRow & { nombre?: string }).name ||
      (row as CompletenessRow & { nombre?: string }).nombre ||
      row.slug,
  }));
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

    const buildings = await fetchCompletenessRows();
    const stats = calculateCompletenessStats(buildings);

    return adminOk({
      buildings,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno del servidor";
    return adminError("internal_error", message, { status: 500 });
  }
}
