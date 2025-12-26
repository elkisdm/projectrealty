import type { Unit, Building } from '@types';

/**
 * Tipo para unidad con su edificio asociado
 */
export interface UnitWithBuilding {
  unit: Unit;
  building: Building;
}

/**
 * Deduplica unidades para mostrar solo 1 unidad por tipología por edificio
 * Mantiene la primera unidad encontrada de cada combinación buildingId + tipologia
 * 
 * @param units - Array de unidades con su edificio asociado
 * @returns Array deduplicado con solo 1 unidad por tipología por edificio
 */
export function deduplicateUnitsByTipology(units: UnitWithBuilding[]): UnitWithBuilding[] {
  const seen = new Map<string, UnitWithBuilding>();
  
  for (const item of units) {
    const key = `${item.building.id}-${item.unit.tipologia}`;
    if (!seen.has(key)) {
      seen.set(key, item);
    }
  }
  
  return Array.from(seen.values());
}







