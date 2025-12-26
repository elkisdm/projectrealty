/**
 * Utilidades para crear y normalizar objetos Unit
 * Asegura que todos los campos requeridos estén presentes con valores por defecto
 */

import type { Unit } from "@/schemas/models";

/**
 * Genera un slug para una unidad basado en el building slug, tipología y código
 */
export function generateUnitSlug(
  buildingSlug: string,
  tipologia: string,
  unitId: string
): string {
  const tipologiaSlug = tipologia.toLowerCase().replace(/\s+/g, '-');
  const shortId = unitId.substring(0, 8);
  return `${buildingSlug}-${tipologiaSlug}-${shortId}`;
}

/**
 * Extrae el número de dormitorios de una tipología
 */
export function extractDormitoriosFromTipologia(tipologia: string): number {
  if (tipologia === 'Studio' || tipologia === 'Estudio') {
    return 0;
  }
  // Intentar extraer el primer número de la tipología (ej: "1D1B" -> 1, "2D2B" -> 2)
  const match = tipologia.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
}

/**
 * Extrae el número de piso del código de unidad
 * Ejemplos: "2204" -> 22, "301" -> 3, "1205" -> 12
 * @param unitCode - Código de la unidad (ej: "2204", "301", "A-1205")
 * @returns Número de piso o null si no se puede extraer
 */
export function extractFloorNumber(unitCode: string): number | null {
  if (!unitCode) return null;
  
  // Remover caracteres no numéricos
  const numericCode = unitCode.replace(/\D/g, '');
  if (!numericCode || numericCode.length < 2) return null;
  
  // Intentar extraer piso desde los primeros 2 dígitos (patrón más común: XXYY)
  // Para códigos como 2201, 301, 1205, etc.
  if (numericCode.length >= 4) {
    // 4+ dígitos: tomar primeros 2 como piso (2201 -> 22)
    const floor = parseInt(numericCode.substring(0, 2), 10);
    if (floor > 0 && floor <= 99) return floor;
  } else if (numericCode.length === 3) {
    // 3 dígitos: tomar primer 1 como piso (301 -> 3)
    const floor = parseInt(numericCode.substring(0, 1), 10);
    if (floor > 0 && floor <= 9) return floor;
  }
  
  return null;
}

/**
 * Crea un objeto Unit completo con valores por defecto para campos requeridos
 * 
 * @param partial - Objeto parcial de Unit con los campos disponibles
 * @param buildingId - ID del edificio (requerido si no está en partial)
 * @param buildingSlug - Slug del edificio (opcional, se genera si no se proporciona)
 * @returns Objeto Unit completo con todos los campos requeridos
 */
export function createCompleteUnit(
  partial: Partial<Unit> & { id: string },
  buildingId?: string,
  buildingSlug?: string
): Unit {
  const id = partial.id;
  const tipologia = partial.tipologia || 'Studio';
  const price = partial.price ?? 0;
  const disponible = partial.disponible ?? true;
  
  // Generar buildingId si no está disponible
  const finalBuildingId = partial.buildingId || buildingId || id.split('-')[0] || id.substring(0, 8);
  
  // Generar slug si no está disponible
  const finalBuildingSlug = buildingSlug || finalBuildingId;
  const slug = partial.slug || generateUnitSlug(finalBuildingSlug, tipologia, id);
  
  // Generar codigoUnidad si no está disponible
  const codigoUnidad = partial.codigoUnidad || partial.codigoInterno || id.substring(0, 8);
  
  // Calcular dormitorios y baños
  // Regla especial: Estudios siempre tienen 1 ambiente + 1 baño
  const isEstudio = tipologia === 'Studio' || tipologia === 'Estudio';
  
  const dormitorios = isEstudio 
    ? 1  // Estudios muestran 1 ambiente
    : (partial.dormitorios ?? 
       partial.bedrooms ?? 
       extractDormitoriosFromTipologia(tipologia));
  
  // Calcular baños - Estudios siempre tienen 1 baño
  const banos = isEstudio 
    ? 1 
    : (partial.banos ?? partial.bathrooms ?? 1);
  
  // Calcular garantía (por defecto igual al precio, mínimo 1 para cumplir schema)
  const garantia = partial.garantia ?? (price > 0 ? price : 1);
  
  // Construir el objeto Unit completo
  const completeUnit: Unit = {
    // Campos requeridos
    id,
    slug,
    codigoUnidad,
    buildingId: finalBuildingId,
    tipologia,
    price: Math.max(price, 0), // Asegurar que sea positivo
    disponible,
    dormitorios: isEstudio ? 1 : Math.max(dormitorios, 0), // Estudios siempre tienen 1 ambiente
    banos: isEstudio ? 1 : Math.max(banos, 1), // Estudios siempre tienen 1 baño, otros al menos 1
    garantia: Math.max(garantia, 0), // Asegurar que sea positivo
    
    // Campos opcionales (preservar los que vienen en partial)
    ...(partial.m2 !== undefined && { m2: partial.m2 }),
    ...(partial.piso !== undefined && { piso: partial.piso }),
    ...(partial.vista !== undefined && { vista: partial.vista }),
    ...(partial.orientacion !== undefined && { orientacion: partial.orientacion }),
    ...(partial.amoblado !== undefined && { amoblado: partial.amoblado }),
    ...(partial.politicaMascotas !== undefined && { politicaMascotas: partial.politicaMascotas }),
    ...(partial.estado !== undefined && { estado: partial.estado }),
    ...(partial.estacionamiento !== undefined && { estacionamiento: partial.estacionamiento }),
    ...(partial.bodega !== undefined && { bodega: partial.bodega }),
    ...(partial.gastoComun !== undefined && { gastoComun: partial.gastoComun }),
    ...(partial.gastosComunes !== undefined && { gastosComunes: partial.gastosComunes }),
    ...(partial.images !== undefined && { images: partial.images }),
    // Preservar imagesTipologia incluso si es array vacío (para que se pueda usar building.gallery como fallback)
    ...(partial.imagesTipologia !== undefined && { imagesTipologia: partial.imagesTipologia }),
    // Preservar imagesAreasComunes incluso si es array vacío
    ...(partial.imagesAreasComunes !== undefined && { imagesAreasComunes: partial.imagesAreasComunes }),
    ...(partial.codigoInterno !== undefined && { codigoInterno: partial.codigoInterno }),
    ...(partial.bedrooms !== undefined && { bedrooms: partial.bedrooms }),
    ...(partial.bathrooms !== undefined && { bathrooms: partial.bathrooms }),
    ...(partial.area_interior_m2 !== undefined && { area_interior_m2: partial.area_interior_m2 }),
    ...(partial.area_exterior_m2 !== undefined && { area_exterior_m2: partial.area_exterior_m2 }),
    ...(partial.petFriendly !== undefined && { pet_friendly: partial.petFriendly }),
    ...(partial.pet_friendly !== undefined && { pet_friendly: partial.pet_friendly }),
    ...(partial.parkingOptions !== undefined && { parkingOptions: partial.parkingOptions }),
    ...(partial.storageOptions !== undefined && { storageOptions: partial.storageOptions }),
    ...(partial.status !== undefined && { status: partial.status }),
    ...(partial.promotions !== undefined && { promotions: partial.promotions }),
    ...(partial.parking_ids !== undefined && { parking_ids: partial.parking_ids }),
    ...(partial.storage_ids !== undefined && { storage_ids: partial.storage_ids }),
    ...(partial.parking_opcional !== undefined && { parking_opcional: partial.parking_opcional }),
    ...(partial.storage_opcional !== undefined && { storage_opcional: partial.storage_opcional }),
    ...(partial.guarantee_installments !== undefined && { guarantee_installments: partial.guarantee_installments }),
    ...(partial.guarantee_months !== undefined && { guarantee_months: partial.guarantee_months }),
    ...(partial.rentas_necesarias !== undefined && { rentas_necesarias: partial.rentas_necesarias }),
    ...(partial.link_listing !== undefined && { link_listing: partial.link_listing }),
    ...(partial.renta_minima !== undefined && { renta_minima: partial.renta_minima }),
    ...(partial.precioFijoMeses !== undefined && { precioFijoMeses: partial.precioFijoMeses }),
    ...(partial.garantiaEnCuotas !== undefined && { garantiaEnCuotas: partial.garantiaEnCuotas }),
    ...(partial.cuotasGarantia !== undefined && { cuotasGarantia: partial.cuotasGarantia }),
    ...(partial.reajuste !== undefined && { reajuste: partial.reajuste }),
  };
  
  return completeUnit;
}

/**
 * Normaliza un objeto parcial de Unit asegurando que tenga todos los campos requeridos
 * Útil para convertir datos de diferentes fuentes (DB, API, etc.) a formato Unit completo
 */
export function normalizeUnit(
  data: Partial<Unit> & { id: string },
  buildingId?: string,
  buildingSlug?: string
): Unit {
  return createCompleteUnit(data, buildingId, buildingSlug);
}




