import { fromAssetPlan, type AssetPlanRawBuilding } from "../../lib/adapters/assetplan";
import { deriveBuildingAggregates } from "../../lib/derive";
import path from "node:path";
import fs from "node:fs";

function loadSample(): AssetPlanRawBuilding {
  const filepath = path.resolve(process.cwd(), "data/sources/assetplan-sample.json");
  const raw = fs.readFileSync(filepath, "utf8");
  return JSON.parse(raw) as AssetPlanRawBuilding;
}

function main() {
  const sample = loadSample();
  const building = fromAssetPlan(sample);
  const enriched = deriveBuildingAggregates(building);

  // Prepare minimal printable summary
  const summary = {
    nombre: enriched.name,
    comuna: enriched.comuna,
    precioDesde: enriched.precioDesde ?? null,
    precioRango: enriched.precioRango ?? null,
    hasAvailability: enriched.hasAvailability,
    typologySummary: enriched.typologySummary.map((t) => ({
      code: t.code,
      bedrooms: t.bedrooms ?? null,
      bathrooms: t.bathrooms ?? null,
      unidades: t.unidades,
      priceRange: t.priceRange ?? null,
      areaRange: t.areaRange ?? null,
      hasPromo: t.hasPromo,
    })),
  };

  console.log(JSON.stringify(summary, null, 2));
}

main();


