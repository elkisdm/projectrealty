import fs from "node:fs/promises";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { loadCsv } from "./utils/parse";

type CsvRow = Record<string, string>;

function parseSemicolonCsv(csv: string): CsvRow[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length === 0) return [];
  const headers = lines[0].split(";").map((h) => h.trim());
  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i += 1) {
    const cols = lines[i].split(";").map((c) => c.trim());
    if (cols.every((c) => c === "")) continue;
    const row: CsvRow = {};
    for (let j = 0; j < headers.length; j += 1) {
      row[headers[j]] = cols[j] ?? "";
    }
    rows.push(row);
  }
  return rows;
}

function toNumber(value: string | undefined): number | undefined {
  const v = (value ?? "").replace(/\./g, "").replace(",", ".").trim();
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function toAreaM2(value: string | undefined): number | undefined {
  const n = toNumber(value);
  if (typeof n !== "number") return undefined;
  
  // Auto-detect if value is in cm² and convert to m²
  // Typical apartment areas: 20-200 m² (2000-20000 cm²)
  // If value > 300, likely in cm², so divide by 100
  if (n > 300) {
    return Math.round(n / 100 * 100) / 100; // Convert cm² to m² with 2 decimals
  }
  
  // Value is likely already in m²
  return n;
}

function getEnvOrThrow(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function readCsvSource(arg: string): Promise<string> {
  if (arg.startsWith("@")) {
    const url = arg.slice(1);
    return loadCsv(url);
  }
  const abs = path.isAbsolute(arg) ? arg : path.resolve(process.cwd(), arg);
  return fs.readFile(abs, "utf8");
}

function extractBuildingKey(row: CsvRow): { key: string; nombre: string; comuna: string; direccion: string } {
  const nombre = (row["Condominio"] || row["Condominio "] || row["Proyecto"] || "").trim();
  const comuna = (row["Comuna"] || "").trim();
  const direccion = (row["Direccion"] || row["Dirección"] || "").trim();
  const key = `${nombre}|${direccion}|${comuna}`;
  return { key, nombre, comuna, direccion };
}

async function ensureBuilding(
  supabase: SupabaseClient,
  buildingKey: string,
  nombre: string,
  comuna: string,
  direccion: string
): Promise<string | null> {
  const payload = {
    provider: "assetplan",
    source_building_id: buildingKey,
    slug: nombre ? nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : buildingKey,
    nombre: nombre || buildingKey,
    comuna: comuna || "",
    direccion: direccion || null,
  } as const;

  const { data, error } = await supabase
    .from("buildings")
    .upsert([payload], { onConflict: "provider,source_building_id" })
    .select("id")
    .single();
  if (error) {
    console.error(`Building upsert failed for ${buildingKey}: ${error.message}`);
    return null;
  }
  return (data as { id: string }).id;
}

async function upsertUnit(
  supabase: SupabaseClient,
  buildingId: string,
  row: CsvRow
): Promise<boolean> {
  const unidad = (row["Unidad"] || row["Depto"] || row["Departamento"] || "").trim();
  const tipologia = (row["Tipologia"] || row["Tipología"] || "").trim() || null;
  const bedrooms = toNumber(row["Dormitorios"] as string) ?? undefined;
  const bathrooms = toNumber(row["Baños"] as string) ?? undefined;
  const areaDepto = toAreaM2((row["m2 Depto"] || row["M2 Depto"]) as string);
  const areaTerraza = toAreaM2((row["m2 Terraza"] || row["M2 Terraza"]) as string);
  const orientacion = (row["Orientacion"] || row["Orientación"] || "").trim() || null;
  const aceptaMascotas = (row["Acepta Mascotas?"] || row["Acepta Mascotas"] || "").toLowerCase();
  const petFriendly = aceptaMascotas === "si" || aceptaMascotas === "sí" || aceptaMascotas === "si.";
  const precio = toNumber((row["Arriendo Total"] || row["Arriendo"]) as string) ?? 0;
  const gc = toNumber((row["GC Total"] || row["Gastos Comunes"]) as string) ?? null;
  const estado = (row["Estado"] || row["Estatus"] || row["Status"] || "").toLowerCase();
  const disponible = estado.includes("lista para arrendar") || estado.includes("listo para arrendar");

  const payload: Record<string, unknown> = {
    provider: "assetplan",
    source_unit_id: unidad || `${buildingId}_${Math.random().toString(36).slice(2, 10)}`,
    building_id: buildingId,
    unidad: unidad || "s/n",
    tipologia,
    bedrooms: typeof bedrooms === "number" ? bedrooms : null,
    bathrooms: typeof bathrooms === "number" ? bathrooms : null,
    area_m2: typeof areaDepto === "number" ? areaDepto : null,
    area_interior_m2: typeof areaDepto === "number" ? areaDepto : null,
    area_exterior_m2: typeof areaTerraza === "number" ? areaTerraza : null,
    orientacion,
    pet_friendly: petFriendly,
    precio: typeof precio === "number" ? Math.trunc(precio) : 0,
    gastos_comunes: typeof gc === "number" ? Math.trunc(gc) : null,
    disponible,
    status: disponible ? "available" : "inactive",
    promotions: [],
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("units")
    .upsert([payload], { onConflict: "provider,source_unit_id" });
  if (error) {
    console.error(`Unit upsert failed for ${payload.source_unit_id}: ${error.message}`);
    return false;
  }
  return true;
}

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error("Uso: ts-node scripts/ingest-csv-direct.ts <ruta.csv | @URL>");
    process.exitCode = 1;
    return;
  }

  const supabaseUrl = getEnvOrThrow("SUPABASE_URL");
  const supabaseKey = getEnvOrThrow("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

  const csv = await readCsvSource(arg);
  const rows = parseSemicolonCsv(csv);

  let unitsUpserted = 0;
  let buildingsTouched = 0;

  const buildingCache = new Map<string, string>();

  for (const row of rows) {
    const { key, nombre, comuna, direccion } = extractBuildingKey(row);
    let buildingId = buildingCache.get(key);
    if (!buildingId) {
      const id = await ensureBuilding(supabase, key, nombre, comuna, direccion);
      if (!id) continue;
      buildingCache.set(key, id);
      buildingsTouched += 1;
      buildingId = id;
    }
    const ok = await upsertUnit(supabase, buildingId, row);
    if (ok) unitsUpserted += 1;
  }

  await supabase.rpc("refresh_building_aggregates");

  console.log(JSON.stringify({ buildingsTouched, unitsUpserted }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});


