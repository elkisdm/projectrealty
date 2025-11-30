import { fromAssetPlan, type AssetPlanRawBuilding } from "@lib/adapters/assetplan";
import { BuildingSchema, type Building } from "@schemas/models";
import { deriveBuildingAggregates, computeUnitTotalArea } from "@lib/derive";
import { createClient } from "@supabase/supabase-js";
import path from "node:path";
import fs from "node:fs/promises";
import { loadCsv } from "./utils/parse";

type IngestCounters = {
  rowsTotal: number;
  rowsValid: number;
  unitsUpserted: number;
  unitsSoftDeleted: number;
  alertsCount: number;
};

function getEnvOrThrow(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function listAssetPlanSourceFiles(): Promise<string[]> {
  const dir = path.join(process.cwd(), "data", "sources");
  try {
    const files = await fs.readdir(dir);
    const candidates = files.filter((f) => /^assetplan-.*\.json$/i.test(f));
    if (candidates.length > 0) {
      return candidates.map((f) => path.join(dir, f));
    }
    const sample = path.join(dir, "assetplan-sample.json");
    await fs.access(sample);
    return [sample];
  } catch {
    return [];
  }
}

async function loadBuildingsFromFiles(): Promise<Building[]> {
  const files = await listAssetPlanSourceFiles();
  const out: Building[] = [];
  for (const file of files) {
    try {
      const rawContent = await fs.readFile(file, "utf-8");
      const json = JSON.parse(rawContent) as unknown;
      const items = Array.isArray(json) ? json : [json];
      for (const item of items) {
        try {
          const mapped = fromAssetPlan(item as AssetPlanRawBuilding);
          const validated = BuildingSchema.parse(mapped);
          out.push(validated);
        } catch {
          // skip invalid item
        }
      }
    } catch {
      // skip file errors
    }
  }
  return out;
}

async function main() {
  // Optional remote CSV argument in the form "@https://..."
  const urlArg = process.argv.slice(2).find((a) => a.startsWith("@"));
  const remoteUrl = urlArg ? urlArg.slice(1).trim() : undefined;

  if (remoteUrl) {
    try {
      // Validate remote URL returns CSV-like content (or direct download)
      await loadCsv(remoteUrl);
      console.log("Remote CSV validated successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message === "CSV expected") {
        console.error(
          "CSV expected. Parece ser una página de confirmación de Google Drive. Instrucción: mover a Supabase Storage o usar link directo"
        );
        process.exitCode = 1;
        return;
      }
      throw err;
    }
  }
  const supabaseUrl = getEnvOrThrow("SUPABASE_URL");
  const supabaseServiceKey = getEnvOrThrow("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  // Start run
  const { data: runStart, error: runErr } = await supabase
    .from("ingest_runs")
    .insert({ provider: "assetplan", source_url: remoteUrl ?? "local:data/sources" })
    .select("id")
    .single();
  if (runErr || !runStart) {
    throw new Error(`Could not create ingest_runs row: ${runErr?.message ?? "unknown error"}`);
  }
  const runId: number = runStart.id as number;

  const counters: IngestCounters = {
    rowsTotal: 0,
    rowsValid: 0,
    unitsUpserted: 0,
    unitsSoftDeleted: 0,
    alertsCount: 0,
  };

  const buildings = await loadBuildingsFromFiles();
  for (const raw of buildings) {
    const enriched = deriveBuildingAggregates(raw);

    // Upsert building
    const { data: bRow, error: bErr } = await supabase
      .from("buildings")
      .upsert(
        [
          {
            provider: "assetplan",
            source_building_id: enriched.id,
            slug: enriched.slug,
            nombre: enriched.name,
            comuna: enriched.comuna,
            direccion: enriched.address,
          },
        ],
        { onConflict: "provider,source_building_id" }
      )
      .select("id")
      .single();
    if (bErr || !bRow) {
      console.error(`Building upsert failed for ${enriched.id}: ${bErr?.message ?? "unknown error"}`);
      continue;
    }
    const buildingId: string = bRow.id as string;

    // Existing units in DB for this building/provider
    const { data: existingUnits, error: exErr } = await supabase
      .from("units")
      .select("id, source_unit_id")
      .eq("provider", "assetplan")
      .eq("building_id", buildingId);
    if (exErr) {
      console.error(`Failed to fetch existing units for building ${enriched.id}: ${exErr.message}`);
    }
    const existingBySource = new Map<string, { id: string }>();
    for (const row of existingUnits ?? []) {
      existingBySource.set(String((row as any).source_unit_id), { id: (row as any).id });
    }

    // Prepare current batch upsert
    const currentSourceIds = new Set<string>();
    const upsertPayload: Record<string, unknown>[] = [];

    for (const u of enriched.units) {
      counters.rowsTotal += 1;
      counters.rowsValid += 1;
      currentSourceIds.add(u.id);

      const price = typeof u.price === "number" ? u.price : 0;
      const priceIsValid = Number.isFinite(price) && price > 1;
      const forceInactive = !priceIsValid;
      const disponible = forceInactive ? false : Boolean(u.disponible);

      const payload: Record<string, unknown> = {
        provider: "assetplan",
        source_unit_id: u.id,
        building_id: buildingId,
        unidad: u.codigoInterno ?? u.id,
        tipologia: u.tipologia,
        bedrooms: typeof u.bedrooms === "number" ? u.bedrooms : null,
        bathrooms: typeof u.bathrooms === "number" ? u.bathrooms : null,
        area_m2: computeUnitTotalArea(u),
        area_interior_m2: typeof u.area_interior_m2 === "number" ? u.area_interior_m2 : null,
        area_exterior_m2: typeof u.area_exterior_m2 === "number" ? u.area_exterior_m2 : null,
        orientacion: u.orientacion ?? null,
        pet_friendly: typeof u.petFriendly === "boolean" ? u.petFriendly : null,
        precio: priceIsValid ? price : 0,
        gastos_comunes: null,
        disponible,
        status: forceInactive ? "inactive" : (u.status ?? "unknown"),
        promotions: Array.isArray(u.promotions) ? u.promotions.map((p) => p.type) : [],
        updated_at: new Date().toISOString(),
      };
      upsertPayload.push(payload);
    }

    if (upsertPayload.length > 0) {
      const { error: upErr } = await supabase
        .from("units")
        .upsert(upsertPayload, { onConflict: "provider,source_unit_id" });
      if (upErr) {
        console.error(`Units upsert failed for building ${enriched.id}: ${upErr.message}`);
      } else {
        counters.unitsUpserted += upsertPayload.length;
      }
    }

    // Soft-delete units missing from feed
    const missingIds: string[] = [];
    for (const [sourceId, row] of existingBySource.entries()) {
      if (!currentSourceIds.has(sourceId)) {
        missingIds.push(row.id);
      }
    }
    if (missingIds.length > 0) {
      const { error: delErr } = await supabase
        .from("units")
        .update({ disponible: false, status: "inactive", updated_at: new Date().toISOString() })
        .in("id", missingIds);
      if (delErr) {
        console.error(`Soft-delete failed for building ${enriched.id}: ${delErr.message}`);
      } else {
        counters.unitsSoftDeleted += missingIds.length;
      }
    }
  }

  // Post-ingest maintenance
  await supabase.rpc("refresh_building_aggregates");
  await supabase.rpc("take_daily_snapshots", { p_date: new Date().toISOString().slice(0, 10) });
  await supabase.rpc("refresh_market_views");

  const { count: dropsCount } = await supabase
    .from("mv_price_drops_7d")
    .select("*", { count: "exact", head: true });
  const { count: newListingsCount } = await supabase
    .from("mv_new_listings_24h")
    .select("*", { count: "exact", head: true });

  await supabase.rpc("purge_units_history", { p_days: 180 });

  const drops = typeof dropsCount === "number" ? dropsCount : 0;
  const news = typeof newListingsCount === "number" ? newListingsCount : 0;
  const alerts = drops + news;
  counters.alertsCount = alerts;

  // Finish run
  const { error: finishErr } = await supabase
    .from("ingest_runs")
    .update({
      finished_at: new Date().toISOString(),
      rows_total: counters.rowsTotal,
      rows_valid: counters.rowsValid,
      units_upserted: counters.unitsUpserted,
      units_soft_deleted: counters.unitsSoftDeleted,
      alerts_count: counters.alertsCount,
    })
    .eq("id", runId);
  if (finishErr) {
    console.error(`Failed to finalize ingest_runs: ${finishErr.message}`);
  }

  console.log(
    JSON.stringify(
      {
        runId,
        rowsTotal: counters.rowsTotal,
        rowsValid: counters.rowsValid,
        unitsUpserted: counters.unitsUpserted,
        unitsSoftDeleted: counters.unitsSoftDeleted,
        alertsCount: counters.alertsCount,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});


