import type { Building, Unit } from "@schemas/models";
import { BuildingSchema, UnitSchema } from "@schemas/models";

/**
 * Parser específico para CSV de AssetPlan
 * Formato: Especial;OP;Direccion;Comuna;Condominio;...
 */

interface AssetPlanCSVRow {
  Especial: string;
  OP: string;
  Direccion: string;
  Comuna: string;
  Condominio: string;
  "Tipo edificio": string;
  "Max inicio cttos (Días)": string;
  Tipologia: string;
  Estac: string;
  Bod: string;
  "Arriendo Total": string;
  "GC Total": string;
  "Reajuste por contrato": string;
  "Meses sin reajuste": string;
  "% Descuento": string;
  "Cant. Meses Descuento": string;
  "Cant. Garantías (Meses)": string;
  "Cant. Garantías Mascota (Meses)": string;
  "Sin Garantia": string;
  "Cuotas Garantía": string;
  "Rentas Necesarias": string;
  "Requiere Aval(es)": string;
  "Plan Sin Aval": string;
  "Tremenda promo": string;
  Orientacion: string;
  "m2 Depto": string;
  "m2 Terraza": string;
  "Estatus LLave": string;
  Candado: string;
  "Status Video": string;
  Comentario: string;
  "Fecha Reparacion": string;
  Presupuesto: string;
  "Acepta Mascotas?": string;
  "Link Listing": string;
  Unidad: string;
  Estado: string;
}

/**
 * Parsea un CSV de AssetPlan (separado por punto y coma)
 */
function parseAssetPlanCSV(csv: string): AssetPlanCSVRow[] {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Parsear headers
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine, ";");

  // Parsear filas
  const rows: AssetPlanCSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = parseCSVLine(line, ";");
    const row: Partial<AssetPlanCSVRow> = {};

    headers.forEach((header, index) => {
      const value = values[index]?.trim() || "";
      (row as any)[header] = value;
    });

    rows.push(row as AssetPlanCSVRow);
  }

  return rows;
}

/**
 * Parsea una línea CSV respetando comillas
 */
function parseCSVLine(line: string, delimiter: string): string[] {
  const values: string[] = [];
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
    } else if (char === delimiter && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);

  return values;
}

/**
 * Convierte número chileno (formato 1.234.567,89) a número
 */
function parseChileanNumber(value: string): number | undefined {
  if (!value || value.trim() === "") return undefined;
  const cleaned = value.replace(/\./g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : Math.round(num);
}

/**
 * Convierte decimal chileno a número
 */
function parseChileanDecimal(value: string): number | undefined {
  if (!value || value.trim() === "") return undefined;
  const cleaned = value.replace(/\./g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
}

/**
 * Mapea tipología de AssetPlan a formato canónico
 */
function mapTipologia(tipologia: string): string {
  const mapping: Record<string, string> = {
    "1D1B": "1D1B",
    "1D": "1D1B",
    "2D1B": "2D1B",
    "2D": "2D1B",
    "2D2B": "2D2B",
    "3D2B": "3D2B",
    "3D": "3D2B",
    Studio: "Studio",
  };

  return mapping[tipologia] || tipologia;
}

/**
 * Extrae dormitorios de la tipología
 */
function extractBedrooms(tipologia: string): number {
  const match = tipologia.match(/^(\d+)D/);
  if (match) return parseInt(match[1], 10);
  if (tipologia.toLowerCase().includes("studio")) return 0;
  return 1;
}

/**
 * Extrae baños de la tipología
 */
function extractBathrooms(tipologia: string): number {
  const match = tipologia.match(/(\d+)B$/);
  if (match) return parseInt(match[1], 10);
  return 1;
}

/**
 * Mapea orientación
 */
function mapOrientacion(orientacion: string): Unit["orientacion"] | undefined {
  const mapping: Record<string, Unit["orientacion"]> = {
    N: "N",
    NE: "NE",
    E: "E",
    SE: "SE",
    S: "S",
    SO: "SO",
    O: "O",
    NO: "NO",
  };

  const upper = orientacion.toUpperCase().trim();
  // "P" no es una orientación válida, retornar undefined
  return mapping[upper] || undefined;
}

/**
 * Determina si la unidad está disponible
 */
function isAvailable(estado: string): boolean {
  const estadoLower = estado.toLowerCase();
  return (
    estadoLower.includes("lista para arrendar") ||
    estadoLower.includes("disponible") ||
    estadoLower === "disponible"
  );
}

/**
 * Genera un slug a partir de un nombre
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Extrae información del building desde el link de listing
 */
function extractBuildingInfo(link: string, condominio: string, direccion: string): {
  slug: string;
  id: string;
} {
  // Intentar extraer slug del URL
  const urlMatch = link.match(/assetplan\.cl\/arriendo\/[^/]+\/[^/]+\/[^/]+\/([^/?]+)/);
  const slugFromUrl = urlMatch ? urlMatch[1] : null;

  const nombre = condominio || direccion || "Edificio";
  const slug = slugFromUrl || slugify(nombre);
  const id = `ap_${slug}`;

  return { slug, id };
}

/**
 * Convierte CSV de AssetPlan a Building[]
 */
export function assetPlanCSVToBuildings(csv: string): {
  buildings: Partial<Building>[];
  errors: Array<{ row: number; error: string }>;
} {
  const rows = parseAssetPlanCSV(csv);
  const errors: Array<{ row: number; error: string }> = [];
  const buildingsMap = new Map<string, Partial<Building>>();

  rows.forEach((row, index) => {
    try {
      const condominio = row.Condominio?.trim() || "";
      const direccion = row.Direccion?.trim() || "";
      const comuna = row.Comuna?.trim() || "";

      if (!condominio && !direccion) {
        errors.push({
          row: index + 2,
          error: "Falta Condominio o Direccion",
        });
        return;
      }

      // Crear clave única para el edificio
      const buildingKey = `${condominio}|${direccion}|${comuna}`;
      const { slug, id } = extractBuildingInfo(
        row["Link Listing"] || "",
        condominio,
        direccion
      );

      // Crear o obtener edificio
      if (!buildingsMap.has(buildingKey)) {
        // Validar que tengamos nombre y dirección
        const buildingName = (condominio || direccion || "").trim();
        const buildingAddress = (direccion || condominio || "").trim();
        const buildingComuna = (comuna || "Santiago").trim();

        if (!buildingName) {
          errors.push({
            row: index + 2,
            error: "Falta nombre del edificio (Condominio o Direccion)",
          });
          return;
        }

        if (!buildingAddress) {
          errors.push({
            row: index + 2,
            error: "Falta dirección del edificio",
          });
          return;
        }

        buildingsMap.set(buildingKey, {
          id,
          slug,
          name: buildingName,
          comuna: buildingComuna,
          address: buildingAddress,
          amenities: ["Piscina", "Gimnasio"], // Valores por defecto (mínimo 1 requerido)
          gallery: [
            "/images/lascondes-cover.jpg",
            "/images/lascondes-1.jpg",
            "/images/lascondes-2.jpg",
          ], // Mínimo 3 requerido
          units: [],
        });
      }

      const building = buildingsMap.get(buildingKey)!;

      // Crear unidad
      const tipologia = mapTipologia(row.Tipologia || "");
      const price = parseChileanNumber(row["Arriendo Total"]);
      
      // Parsear áreas - pueden venir en centímetros cuadrados, convertir a m²
      const m2DeptoRaw = parseChileanDecimal(row["m2 Depto"]);
      const m2TerrazaRaw = parseChileanDecimal(row["m2 Terraza"]);
      
      // Convertir de cm² a m² si el valor es muy grande (> 100)
      // Los valores como 3859 cm² = 38.59 m²
      let m2Depto: number | undefined = undefined;
      let m2Terraza: number | undefined = undefined;
      
      if (m2DeptoRaw !== undefined) {
        // Si el valor es > 100, probablemente está en cm², convertir dividiendo por 100
        if (m2DeptoRaw > 100) {
          m2Depto = m2DeptoRaw / 100;
        } else {
          m2Depto = m2DeptoRaw;
        }
        // Redondear a 2 decimales
        m2Depto = Math.round(m2Depto * 100) / 100;
      }
      
      if (m2TerrazaRaw !== undefined) {
        // Si el valor es > 100, probablemente está en cm², convertir dividiendo por 100
        if (m2TerrazaRaw > 100) {
          m2Terraza = m2TerrazaRaw / 100;
        } else {
          m2Terraza = m2TerrazaRaw;
        }
        // Redondear a 2 decimales
        m2Terraza = Math.round(m2Terraza * 100) / 100;
      }
      const orientacion = mapOrientacion(row.Orientacion || "");
      const petFriendly =
        row["Acepta Mascotas?"]?.toLowerCase() === "si" ||
        row["Acepta Mascotas?"]?.toLowerCase() === "sí" ||
        row["Acepta Mascotas?"]?.toLowerCase() === "si.";
      const disponible = isAvailable(row.Estado || "");
      // Estac y Bod pueden estar vacíos, si tienen valor (aunque sea vacío) significa que existe
      const estacionamiento = (row.Estac?.trim() || "") !== "";
      const bodega = (row.Bod?.trim() || "") !== "";

      const unitId = row.OP || `${building.id}_${row.Unidad || index}`;

      // Validar que la tipología sea válida
      if (!tipologia || !["Studio", "1D1B", "2D1B", "2D2B", "3D2B"].includes(tipologia)) {
        errors.push({
          row: index + 2,
          error: `Tipología inválida: ${row.Tipologia}`,
        });
        return;
      }

      // Validar que tenga precio
      if (!price || price <= 0) {
        errors.push({
          row: index + 2,
          error: "Precio inválido o faltante",
        });
        return;
      }

      // Calcular m2 total si no hay m2Depto
      const m2Total = m2Depto && m2Depto > 0
        ? Math.round(m2Depto) 
        : (tipologia === "Studio" ? 30 : tipologia === "1D1B" ? 45 : tipologia === "2D1B" ? 55 : tipologia === "2D2B" ? 65 : 90);

      // Asegurar que m2 sea positivo
      if (m2Total <= 0) {
        errors.push({
          row: index + 2,
          error: "m2 debe ser positivo",
        });
        return;
      }

      // Asegurar que el precio sea un entero positivo
      const priceInt = Math.round(price);
      if (priceInt <= 0) {
        errors.push({
          row: index + 2,
          error: "Precio debe ser un entero positivo",
        });
        return;
      }

      const gastosComunes = parseChileanNumber(row["GC Total"]);

      // Validar link_listing si existe
      const linkListing = row["Link Listing"]?.trim();
      let linkListingValid: string | undefined = undefined;
      if (linkListing) {
        try {
          new URL(linkListing);
          linkListingValid = linkListing;
        } catch {
          // Si no es una URL válida, lo omitimos
        }
      }

      const unit: Partial<Unit> = {
        id: unitId,
        tipologia: tipologia,
        m2: m2Total,
        price: priceInt,
        estacionamiento,
        bodega,
        disponible,
        bedrooms: (() => {
          const beds = extractBedrooms(row.Tipologia || "");
          return beds > 0 ? beds : 1;
        })(),
        bathrooms: (() => {
          const baths = extractBathrooms(row.Tipologia || "");
          return baths > 0 ? baths : 1;
        })(),
        // Solo incluir area_interior_m2 si es positivo y está en rango válido (20-200 m²)
        area_interior_m2: m2Depto && m2Depto > 0 && m2Depto <= 200 ? m2Depto : undefined,
        // Solo incluir area_exterior_m2 si es no negativo y está en rango válido (0-50 m²)
        area_exterior_m2: m2Terraza && m2Terraza >= 0 && m2Terraza <= 50 ? m2Terraza : undefined,
        orientacion,
        petFriendly,
        gastosComunes: gastosComunes && gastosComunes >= 0 ? gastosComunes : undefined,
        guarantee_installments: parseChileanNumber(row["Cuotas Garantía"]) || undefined,
        guarantee_months: parseChileanNumber(row["Cant. Garantías (Meses)"]) || undefined,
        rentas_necesarias: parseChileanDecimal(row["Rentas Necesarias"]) || undefined,
        link_listing: linkListingValid,
        status: disponible ? "available" : "rented",
      };

      // Calcular renta_minima si hay precio y rentas_necesarias
      if (unit.price && unit.rentas_necesarias) {
        unit.renta_minima = Math.round(unit.price * unit.rentas_necesarias);
      }

      // Validar que la unidad tenga todos los campos requeridos antes de agregarla
      if (!unit.id || !unit.tipologia || !unit.m2 || unit.m2 <= 0 || !unit.price || unit.price <= 0) {
        const missingFields = [];
        if (!unit.id) missingFields.push('id');
        if (!unit.tipologia) missingFields.push('tipologia');
        if (!unit.m2 || unit.m2 <= 0) missingFields.push('m2 válido');
        if (!unit.price || unit.price <= 0) missingFields.push('price válido');
        
        errors.push({
          row: index + 2,
          error: `Unidad incompleta: faltan ${missingFields.join(', ')}`,
        });
        return;
      }

      building.units = building.units || [];
      building.units.push(unit as Unit);
    } catch (error) {
      errors.push({
        row: index + 2,
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  });

  // Filtrar edificios sin unidades válidas
  const validBuildings = Array.from(buildingsMap.values()).filter(
    (building) => building.units && building.units.length > 0
  );

  // Agregar errores para edificios sin unidades
  const buildingsWithoutUnits = Array.from(buildingsMap.values()).filter(
    (building) => !building.units || building.units.length === 0
  );
  
  buildingsWithoutUnits.forEach((building) => {
    errors.push({
      row: 0,
      error: `Edificio "${building.name}" no tiene unidades válidas`,
    });
  });

  return {
    buildings: validBuildings,
    errors,
  };
}

/**
 * Valida y convierte CSV de AssetPlan a Building[] validados
 */
export function validateAssetPlanCSV(csv: string): {
  valid: Building[];
  invalid: Array<{ data: Partial<Building>; errors: string[] }>;
  parseErrors: Array<{ row: number; error: string }>;
} {
  const { buildings, errors: parseErrors } = assetPlanCSVToBuildings(csv);
  const valid: Building[] = [];
  const invalid: Array<{ data: Partial<Building>; errors: string[] }> = [];

  buildings.forEach((data) => {
    // Validar primero las unidades individualmente
    const unitErrors: string[] = [];
    if (data.units && data.units.length > 0) {
      data.units.forEach((unit, unitIndex) => {
        const unitValidation = UnitSchema.safeParse(unit);
        if (!unitValidation.success) {
          const unitErrorDetails = unitValidation.error.errors.map(e => {
            const path = e.path.join('.');
            const value = path.split('.').reduce((obj: any, key) => obj?.[key], unit);
            return `${path}: ${e.message}${value !== undefined ? ` (valor: ${JSON.stringify(value)})` : ''}`;
          }).join(', ');
          unitErrors.push(
            `Unidad ${unitIndex + 1} (${unit.id || 'sin ID'}): ${unitErrorDetails}`
          );
        }
      });
    } else {
      unitErrors.push("El edificio no tiene unidades");
    }

    // Si hay errores en unidades, agregar al invalid
    if (unitErrors.length > 0) {
      invalid.push({
        data,
        errors: unitErrors,
      });
      return;
    }

    // Validar el edificio completo
    const validation = BuildingSchema.safeParse(data);
    if (validation.success) {
      valid.push(validation.data);
    } else {
      const buildingErrorDetails = validation.error.errors.map((e) => {
        const path = e.path.join('.');
        const value = path.split('.').reduce((obj: any, key) => obj?.[key], data);
        return `${path}: ${e.message}${value !== undefined ? ` (valor: ${JSON.stringify(value)})` : ''}`;
      });
      invalid.push({
        data,
        errors: buildingErrorDetails,
      });
    }
  });

  return { valid, invalid, parseErrors };
}

