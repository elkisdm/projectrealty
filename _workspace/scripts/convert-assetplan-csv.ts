import fs from "node:fs/promises";
import path from "node:path";
import { normalizeCsvUrl, loadCsv } from "./utils/parse";

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

function toNumber(value: string): number | undefined {
  const v = value.replace(/\./g, "").replace(",", ".").trim();
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function toAreaM2(value: string): number | undefined {
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

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function extractFromListingUrl(url: string): { buildingSlug?: string; buildingNumericId?: string } {
  try {
    const normalized = url.startsWith("http") ? url : normalizeCsvUrl(url);
    const u = new URL(normalized);
    const parts = u.pathname.split("/").filter(Boolean);
    // Expect .../<building-slug>/<numeric-id>
    const buildingSlug = parts.length >= 2 ? parts[parts.length - 2] : undefined;
    const lastPart = parts[parts.length - 1] ?? "";
    const match = lastPart.match(/^(\d+)/);
    const buildingNumericId = match ? match[1] : undefined;
    return { buildingSlug, buildingNumericId };
  } catch {
    return {};
  }
}

type AssetPlanCsvUnit = {
  id: string;
  tipologia?: string;
  area_interior_m2?: number;
  area_exterior_m2?: number;
  orientacion?: string;
  price?: number;
  disponible?: boolean;
  petFriendly?: boolean;
};

type AssetPlanCsvBuilding = {
  id: string;
  slug?: string;
  nombre: string;
  comuna: string;
  direccion: string;
  units: AssetPlanCsvUnit[];
};

async function readCsvSource(arg: string): Promise<string> {
  if (arg.startsWith("@")) {
    const url = arg.slice(1);
    return loadCsv(url);
  }
  const abs = path.isAbsolute(arg) ? arg : path.resolve(process.cwd(), arg);
  const raw = await fs.readFile(abs, "utf8");
  return raw;
}

function mapRowsToBuildings(rows: CsvRow[]): AssetPlanCsvBuilding[] {
  const byBuildingKey = new Map<string, AssetPlanCsvBuilding>();
  for (const r of rows) {
    const nombre = (r["Condominio"] || r["Condominio "] || r["Proyecto"] || "").trim();
    const comuna = (r["Comuna"] || "").trim();
    const direccion = (r["Direccion"] || r["Dirección"] || "").trim();
    const link = (r["Link Listing"] || r["URL"] || "").trim();
    const unidad = (r["Unidad"] || r["Unidad "] || r["Depto"] || r["Departamento"] || "").trim();
    const tipologia = (r["Tipologia"] || r["Tipología"] || "").trim();
    const orientacion = (r["Orientacion"] || r["Orientación"] || "").trim();
    const m2Depto = toAreaM2(r["m2 Depto"] || r["m2 depto"] || r["M2 Depto"] || "");
    const m2Terraza = toAreaM2(r["m2 Terraza"] || r["m2 terraza"] || r["M2 Terraza"] || "");
    const price = toNumber(r["Arriendo Total"] || r["Arriendo total"] || r["Arriendo"] || "");
    const aceptaMascotas = (r["Acepta Mascotas?"] || r["Acepta Mascotas"] || "").toLowerCase();
    const estado = (r["Estado"] || r["Estatus"] || r["Status"] || "").toLowerCase();

    const petFriendly = aceptaMascotas === "si" || aceptaMascotas === "sí" || aceptaMascotas === "si.";
    const disponible = estado.includes("lista para arrendar") || estado.includes("listo para arrendar");

    const { buildingSlug, buildingNumericId } = extractFromListingUrl(link);
    const key = buildingNumericId || buildingSlug || `${nombre}|${direccion}|${comuna}`;
    const id = buildingNumericId ? `ap_${buildingNumericId}` : slugify(nombre || buildingSlug || key);

    if (!byBuildingKey.has(key)) {
      byBuildingKey.set(key, {
        id,
        slug: buildingSlug || slugify(nombre || id),
        nombre: nombre || (buildingSlug ? buildingSlug.replace(/-/g, " ") : id),
        comuna: comuna || "",
        direccion: direccion || "",
        units: [],
      });
    }

    const b = byBuildingKey.get(key)!;
    const unitId = unidad || `${b.id}_${rows.indexOf(r)}`;
    b.units.push({
      id: unitId,
      tipologia: tipologia || undefined,
      area_interior_m2: typeof m2Depto === "number" ? m2Depto : undefined,
      area_exterior_m2: typeof m2Terraza === "number" ? m2Terraza : undefined,
      orientacion: orientacion || undefined,
      price: typeof price === "number" ? price : undefined,
      disponible,
      petFriendly,
    });
  }

  return Array.from(byBuildingKey.values());
}

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error("Uso: ts-node scripts/convert-assetplan-csv.ts <ruta.csv | @URL>");
    process.exitCode = 1;
    return;
  }

  const csv = await readCsvSource(arg);
  const rows = parseSemicolonCsv(csv);
  const buildings = mapRowsToBuildings(rows);

  const outDir = path.join(process.cwd(), "data", "sources");
  await fs.mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, "assetplan-from-csv.json");
  await fs.writeFile(outPath, JSON.stringify(buildings, null, 2), "utf8");

  console.log(`Escrito ${buildings.length} edificios a ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});


