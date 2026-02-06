/**
 * Convención de IDs Parque Mackenna (PMQ)
 * - PMQ: edificio base
 * - PMQD: departamentos (units)
 * - PMQE: estacionamientos
 * - PMQB: bodegas
 * Válidos en mayúsculas y minúsculas; se almacenan y comparan normalizados (uppercase).
 */

export const PMQ_PREFIX = {
  building: "PMQ",
  unit: "PMQD",
  parking: "PMQE",
  storage: "PMQB",
} as const;

/** Normaliza un id PMQ a mayúsculas para almacenar/comparar. Acepta mayúsculas y minúsculas. */
export function normalizePmqId(value: string | null | undefined): string {
  if (value == null || typeof value !== "string") return "";
  return value.trim().toUpperCase();
}

/** Compara dos ids PMQ sin importar mayúsculas/minúsculas. */
export function pmqIdEquals(a: string | null | undefined, b: string | null | undefined): boolean {
  return normalizePmqId(a) === normalizePmqId(b);
}

/**
 * Construye el código de unidad sin guiones para el id PMQ.
 * Ej: "305-C" → "305C", "305" → "305"
 */
export function normalizeUnitCodeForPmq(code: string | null | undefined): string {
  if (code == null || typeof code !== "string") return "";
  return code.trim().replace(/-/g, "").toUpperCase();
}

/** Construye id PMQ de departamento: PMQD + código normalizado. Ej: "305-C" → "PMQD305C" */
export function buildUnitPmqId(unitCode: string | null | undefined): string {
  const code = normalizeUnitCodeForPmq(unitCode);
  if (!code) return "";
  return `${PMQ_PREFIX.unit}${code}`;
}

/** Indica si el slug parece un id PMQ (PMQD/PMQE/PMQB). */
export function isPmqSlug(slug: string | null | undefined): boolean {
  const s = normalizePmqId(slug);
  if (!s) return false;
  return (
    s.startsWith(PMQ_PREFIX.unit) ||
    s.startsWith(PMQ_PREFIX.parking) ||
    s.startsWith(PMQ_PREFIX.storage)
  );
}
