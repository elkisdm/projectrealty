import type { Building, Unit } from "@schemas/models";
import { BuildingSchema, UnitSchema } from "@schemas/models";

/**
 * Utilidades para importar y exportar datos en formato CSV
 */

/**
 * Convierte un array de edificios a formato CSV
 */
export function buildingsToCSV(buildings: Building[]): string {
  if (buildings.length === 0) return "";

  const headers = [
    "id",
    "slug",
    "name",
    "comuna",
    "address",
    "amenities",
    "gallery",
    "coverImage",
    "serviceLevel",
  ];

  const rows = buildings.map((building) => {
    return [
      building.id,
      building.slug,
      building.name,
      building.comuna,
      building.address,
      Array.isArray(building.amenities) ? building.amenities.join(";") : "",
      Array.isArray(building.gallery) ? building.gallery.join(";") : "",
      building.coverImage || "",
      building.serviceLevel || "",
    ].map((field) => {
      // Escapar comillas y envolver en comillas si contiene comas o punto y coma
      const str = String(field || "");
      if (str.includes(",") || str.includes(";") || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    });
  });

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  return csvContent;
}

/**
 * Convierte un array de unidades a formato CSV
 */
export function unitsToCSV(
  units: Array<Unit & { buildingId?: string; buildingName?: string }>
): string {
  if (units.length === 0) return "";

  const headers = [
    "id",
    "buildingId",
    "buildingName",
    "tipologia",
    "m2",
    "price",
    "estacionamiento",
    "bodega",
    "disponible",
    "bedrooms",
    "bathrooms",
    "area_interior_m2",
    "area_exterior_m2",
    "orientacion",
  ];

  const rows = units.map((unit) => {
    return [
      unit.id,
      unit.buildingId || "",
      unit.buildingName || "",
      unit.tipologia,
      unit.m2,
      unit.price,
      unit.estacionamiento ? "true" : "false",
      unit.bodega ? "true" : "false",
      unit.disponible ? "true" : "false",
      unit.bedrooms || "",
      unit.bathrooms || "",
      unit.area_interior_m2 || "",
      unit.area_exterior_m2 || "",
      unit.orientacion || "",
    ].map((field) => {
      const str = String(field || "");
      if (str.includes(",") || str.includes(";") || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    });
  });

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  return csvContent;
}

/**
 * Parsea un string CSV a array de objetos
 */
function parseCSV(csv: string): string[][] {
  const lines = csv.split("\n").filter((line) => line.trim().length > 0);
  const rows: string[][] = [];

  for (const line of lines) {
    const row: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        row.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    row.push(current);
    rows.push(row);
  }

  return rows;
}

/**
 * Convierte CSV a array de edificios (parcial, requiere validación completa)
 */
export function csvToBuildings(csv: string): Partial<Building>[] {
  const rows = parseCSV(csv);
  if (rows.length < 2) return []; // Necesita al menos headers + 1 fila

  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const buildings: Partial<Building>[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const building: Partial<Building> = {};

    headers.forEach((header, index) => {
      const value = row[index]?.trim() || "";

      switch (header) {
        case "id":
          building.id = value;
          break;
        case "slug":
          building.slug = value;
          break;
        case "name":
          building.name = value;
          break;
        case "comuna":
          building.comuna = value;
          break;
        case "address":
          building.address = value;
          break;
        case "amenities":
          building.amenities = value ? value.split(";").map((a) => a.trim()) : [];
          break;
        case "gallery":
          building.gallery = value ? value.split(";").map((g) => g.trim()) : [];
          break;
        case "coverimage":
          building.coverImage = value || undefined;
          break;
        case "servicelevel":
          building.serviceLevel = value === "pro" || value === "standard" ? value : undefined;
          break;
      }
    });

    // Valores por defecto mínimos
    if (!building.units) {
      building.units = [];
    }

    buildings.push(building);
  }

  return buildings;
}

/**
 * Convierte CSV a array de unidades (parcial, requiere validación completa)
 */
export function csvToUnits(
  csv: string
): Array<Partial<Unit> & { buildingId?: string }> {
  const rows = parseCSV(csv);
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const units: Array<Partial<Unit> & { buildingId?: string }> = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const unit: Partial<Unit> & { buildingId?: string } = {};

    headers.forEach((header, index) => {
      const value = row[index]?.trim() || "";

      switch (header) {
        case "id":
          unit.id = value;
          break;
        case "buildingid":
          unit.buildingId = value;
          break;
        case "tipologia":
          unit.tipologia = value;
          break;
        case "m2":
          unit.m2 = value ? parseFloat(value) : undefined;
          break;
        case "price":
          unit.price = value ? parseInt(value, 10) : undefined;
          break;
        case "estacionamiento":
          unit.estacionamiento = value === "true" || value === "1" || value === "si";
          break;
        case "bodega":
          unit.bodega = value === "true" || value === "1" || value === "si";
          break;
        case "disponible":
          unit.disponible = value !== "false" && value !== "0" && value !== "no";
          break;
        case "bedrooms":
          unit.bedrooms = value ? parseInt(value, 10) : undefined;
          break;
        case "bathrooms":
          unit.bathrooms = value ? parseInt(value, 10) : undefined;
          break;
        case "area_interior_m2":
          unit.area_interior_m2 = value ? parseFloat(value) : undefined;
          break;
        case "area_exterior_m2":
          unit.area_exterior_m2 = value ? parseFloat(value) : undefined;
          break;
        case "orientacion":
          unit.orientacion = value as Unit["orientacion"];
          break;
        case "petfriendly":
        case "pet_friendly":
          unit.petFriendly = value === "true" || value === "1" || value === "si";
          break;
        case "gastoscomunes":
        case "gastos_comunes":
        case "gastoscomunes":
          unit.gastosComunes = value ? parseInt(value, 10) : undefined;
          break;
        case "status":
          unit.status = value as Unit["status"];
          break;
      }
    });

    // Validar campos requeridos antes de agregar
    if (!unit.id || !unit.tipologia || !unit.m2 || !unit.price) {
      // Omitir unidades incompletas en lugar de agregarlas
      continue;
    }

    // Asegurar valores por defecto para campos requeridos
    if (unit.estacionamiento === undefined) unit.estacionamiento = false;
    if (unit.bodega === undefined) unit.bodega = false;
    if (unit.disponible === undefined) unit.disponible = true;

    units.push(unit);
  }

  return units;
}

/**
 * Valida y convierte datos CSV a objetos validados con Zod
 */
export function validateBuildingsFromCSV(
  csv: string
): { valid: Building[]; invalid: Array<{ data: Partial<Building>; errors: string[] }> } {
  const parsed = csvToBuildings(csv);
  const valid: Building[] = [];
  const invalid: Array<{ data: Partial<Building>; errors: string[] }> = [];

  parsed.forEach((data) => {
    const validation = BuildingSchema.safeParse(data);
    if (validation.success) {
      valid.push(validation.data);
    } else {
      invalid.push({
        data,
        errors: validation.error.errors.map((e) => e.message),
      });
    }
  });

  return { valid, invalid };
}

/**
 * Valida y convierte datos CSV a objetos validados con Zod
 */
export function validateUnitsFromCSV(
  csv: string
): {
  valid: Unit[];
  invalid: Array<{ data: Partial<Unit>; errors: string[] }>;
} {
  const parsed = csvToUnits(csv);
  const valid: Unit[] = [];
  const invalid: Array<{ data: Partial<Unit>; errors: string[] }> = [];

  parsed.forEach((data) => {
    const { buildingId, ...unitData } = data;
    const validation = UnitSchema.safeParse(unitData);
    if (validation.success) {
      valid.push(validation.data);
    } else {
      const errorDetails = validation.error.errors.map((e) => {
        const path = e.path.join('.');
        const value = path.split('.').reduce((obj: any, key) => obj?.[key], unitData);
        return `${path}: ${e.message}${value !== undefined ? ` (valor: ${JSON.stringify(value)})` : ''}`;
      });
      invalid.push({
        data: unitData,
        errors: errorDetails,
      });
    }
  });

  return { valid, invalid };
}

/**
 * Descarga un archivo CSV
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

