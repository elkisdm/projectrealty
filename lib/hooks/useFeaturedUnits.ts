import { getAllBuildings } from '@lib/data';
import type { Unit, Building } from '@types';
import { logger } from '@lib/logger';
import { deduplicateUnitsByTipology } from '@lib/utils/unit-deduplication';

/**
 * Tipo para unidad con su edificio asociado
 */
export interface UnitWithBuilding {
  unit: Unit;
  building: Building;
}

/**
 * Filtros para obtener unidades destacadas
 */
export interface FeaturedUnitsFilter {
  type: 'comuna' | 'dormitorios' | 'precio' | 'featured';
  value: string | number;
}

/**
 * Convierte número de dormitorios a formato de tipología
 * "Estudio" -> "Studio", "1" -> "1D1B", "2" -> "2D1B" o "2D2B", "3" -> "3D2B"
 */
function dormitoriosToTipologia(dormitorios: string): string[] {
  switch (dormitorios) {
    case 'Estudio':
      return ['Studio'];
    case '1':
      return ['1D1B'];
    case '2':
      return ['2D1B', '2D2B'];
    case '3':
      return ['3D2B'];
    default:
      return [];
  }
}

/**
 * Obtiene unidades destacadas según filtro
 * @param filter - Filtro a aplicar (comuna, dormitorios, precio, featured)
 * @param limit - Límite de unidades a retornar (default: 6)
 * @returns Array de unidades con su edificio asociado
 */
export async function getFeaturedUnits(
  filter: FeaturedUnitsFilter,
  limit: number = 6
): Promise<UnitWithBuilding[]> {
  try {
    // Obtener todos los edificios
    const allBuildings = await getAllBuildings();
    
    // Debug log
    logger.log(`[getFeaturedUnits] Edificios obtenidos: ${allBuildings.length}`);
    if (allBuildings.length > 0) {
      logger.log(`[getFeaturedUnits] Primer edificio: ${allBuildings[0].name}, unidades: ${allBuildings[0].units.length}`);
      logger.log(`[getFeaturedUnits] Comuna del primer edificio: "${allBuildings[0].comuna}"`);
      const availableCount = allBuildings[0].units.filter(u => u.disponible).length;
      logger.log(`[getFeaturedUnits] Unidades disponibles en primer edificio: ${availableCount}`);
    } else {
      logger.error(`[getFeaturedUnits] ⚠️ PROBLEMA: getAllBuildings() retornó array vacío`);
      logger.error(`[getFeaturedUnits] Esto significa que no hay edificios o todos fallaron validación`);
    }

    // Flatten: convertir buildings con units a array de unidades con building
    const allUnits: UnitWithBuilding[] = [];
    
    for (const building of allBuildings) {
      // Solo procesar edificios con unidades disponibles
      const availableUnits = building.units.filter((u) => u.disponible);
      
      for (const unit of availableUnits) {
        allUnits.push({
          unit,
          building,
        });
      }
    }
    
    logger.log(`[getFeaturedUnits] Total unidades disponibles (antes de filtro): ${allUnits.length}`);
    
    if (allUnits.length === 0) {
      logger.error(`[getFeaturedUnits] ⚠️ PROBLEMA: No hay unidades disponibles después de flatten`);
      logger.error(`[getFeaturedUnits] Esto puede significar que todas las unidades tienen disponible=false`);
    }

    // Aplicar filtros
    let filteredUnits = allUnits;

    switch (filter.type) {
      case 'comuna':
        filteredUnits = allUnits.filter(
          (item) => item.building.comuna.toLowerCase() === (filter.value as string).toLowerCase()
        );
        break;

      case 'dormitorios':
        const tipologias = dormitoriosToTipologia(filter.value as string);
        filteredUnits = allUnits.filter((item) => {
          // Verificar por tipología
          if (tipologias.includes(item.unit.tipologia)) {
            return true;
          }
          // También verificar por bedrooms si está disponible
          if (item.unit.bedrooms) {
            const dormitoriosNum = filter.value === 'Estudio' ? 0 : parseInt(filter.value as string, 10);
            return item.unit.bedrooms === dormitoriosNum;
          }
          return false;
        });
        break;

      case 'precio':
        const maxPrice = typeof filter.value === 'number' ? filter.value : parseInt(filter.value as string, 10);
        filteredUnits = allUnits.filter((item) => item.unit.price <= maxPrice);
        break;

      case 'featured':
        // Por ahora, featured = unidades disponibles de edificios con más unidades disponibles
        // O podemos usar un campo específico si existe en el futuro
        filteredUnits = allUnits;
        // Ordenar por edificios con más unidades disponibles primero
        const buildingUnitCount = new Map<string, number>();
        allUnits.forEach((item) => {
          const count = buildingUnitCount.get(item.building.id) || 0;
          buildingUnitCount.set(item.building.id, count + 1);
        });
        filteredUnits.sort((a, b) => {
          const countA = buildingUnitCount.get(a.building.id) || 0;
          const countB = buildingUnitCount.get(b.building.id) || 0;
          return countB - countA;
        });
        break;
    }

    // Deduplicar: solo 1 unidad por tipología por edificio
    const deduplicatedUnits = deduplicateUnitsByTipology(filteredUnits);

    // Limitar resultados después de deduplicar
    const limitedUnits = deduplicatedUnits.slice(0, limit);

    logger.log(`📊 Featured units: ${limitedUnits.length} unidades encontradas (después de deduplicación) con filtro ${filter.type}=${filter.value}`);

    return limitedUnits;
  } catch (error) {
    logger.error('Error getting featured units:', error);
    return [];
  }
}

/**
 * Helper para obtener unidades por comuna
 */
export async function getUnitsByComuna(comuna: string, limit: number = 6): Promise<UnitWithBuilding[]> {
  return getFeaturedUnits({ type: 'comuna', value: comuna }, limit);
}

/**
 * Helper para obtener unidades por dormitorios
 */
export async function getUnitsByDormitorios(dormitorios: string, limit: number = 6): Promise<UnitWithBuilding[]> {
  return getFeaturedUnits({ type: 'dormitorios', value: dormitorios }, limit);
}

/**
 * Helper para obtener unidades por precio máximo
 */
export async function getUnitsByPrecio(maxPrice: number, limit: number = 6): Promise<UnitWithBuilding[]> {
  return getFeaturedUnits({ type: 'precio', value: maxPrice }, limit);
}

/**
 * Helper para obtener unidades destacadas
 */
export async function getFeaturedUnitsList(limit: number = 6): Promise<UnitWithBuilding[]> {
  return getFeaturedUnits({ type: 'featured', value: 'featured' }, limit);
}

/**
 * Obtiene el número total de unidades disponibles
 * @returns Número de unidades disponibles
 */
export async function getAvailableUnitsCount(): Promise<number> {
  try {
    const allBuildings = await getAllBuildings();
    
    let count = 0;
    for (const building of allBuildings) {
      const availableUnits = building.units.filter((u) => u.disponible);
      count += availableUnits.length;
    }
    
    logger.log(`📊 Total available units: ${count}`);
    return count;
  } catch (error) {
    logger.error('Error getting available units count:', error);
    return 0;
  }
}



