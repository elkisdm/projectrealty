import fs from 'fs';
import path from 'path';
import { logger } from './logger';

export interface TremendoUnit {
  building: string;
  condominio: string;
  unidad: string;
  op: string;
}

export interface TremendoBuilding {
  building: string;
  condominio: string;
  units: TremendoUnit[];
}

class TremendoUnitsProcessor {
  private units: TremendoUnit[] = [];
  private buildings: Map<string, TremendoBuilding> = new Map();
  private isInitialized = false;

  async loadTremendoUnits(): Promise<void> {
    try {
      const csvPath = path.join(process.cwd(), 'data', 'sources', 'tremendo_units.csv');
      
      if (!fs.existsSync(csvPath)) {
        // Archivo no encontrado - silenciar en producción
        logger.log('⚠️ Archivo tremendo_units.csv no encontrado');
        return;
      }

      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvContent.split('\n').filter(line => line.trim());
      
      // Saltar la primera línea (headers)
      const dataLines = lines.slice(1);
      
      this.units = dataLines.map(line => {
        const [building, condominio, unidad, op] = line.split(',').map(field => field.trim());
        return {
          building,
          condominio,
          unidad,
          op
        };
      }).filter(unit => unit.building && unit.condominio && unit.op);

      // Agrupar por edificio
      this.units.forEach(unit => {
        if (!this.buildings.has(unit.building)) {
          this.buildings.set(unit.building, {
            building: unit.building,
            condominio: unit.condominio,
            units: []
          });
        }
        this.buildings.get(unit.building)!.units.push(unit);
      });

      // Logs solo en desarrollo
      logger.log(`📊 Tremendo Units cargados: ${this.units.length} unidades`);
      logger.log(`🏢 Edificios Tremendo: ${this.buildings.size} edificios`);
      
      this.isInitialized = true;
    } catch (error) {
      // Error solo en desarrollo o si hay variable de entorno
      if (process.env.NODE_ENV === 'development' || process.env.DEBUG_TREMENDO) {
        logger.error('❌ Error cargando Tremendo Units:', error);
      }
    }
  }

  getTremendoBuildings(): string[] {
    if (!this.isInitialized) {
      return [];
    }
    return Array.from(this.buildings.keys());
  }

  getTremendoCondominios(): string[] {
    if (!this.isInitialized) {
      return [];
    }
    return Array.from(this.buildings.values()).map(b => b.condominio);
  }

  isTremendoBuilding(buildingName: string): boolean {
    if (!this.isInitialized) {
      return false;
    }
    return this.buildings.has(buildingName);
  }

  isTremendoCondominio(condominioName: string): boolean {
    if (!this.isInitialized) {
      return false;
    }
    return this.getTremendoCondominios().includes(condominioName);
  }

  getTremendoUnitsByBuilding(buildingName: string): TremendoUnit[] {
    if (!this.isInitialized) {
      return [];
    }
    return this.buildings.get(buildingName)?.units || [];
  }

  getTremendoUnitsByOP(op: string): TremendoUnit | null {
    if (!this.isInitialized) {
      return null;
    }
    return this.units.find(unit => unit.op === op) || null;
  }

  getAllTremendoUnits(): TremendoUnit[] {
    if (!this.isInitialized) {
      return [];
    }
    return [...this.units];
  }

  getTremendoBuildingsData(): TremendoBuilding[] {
    if (!this.isInitialized) {
      return [];
    }
    return Array.from(this.buildings.values());
  }
}

// Instancia singleton
let processor: TremendoUnitsProcessor | null = null;

export async function getTremendoUnitsProcessor(): Promise<TremendoUnitsProcessor> {
  if (!processor) {
    processor = new TremendoUnitsProcessor();
    await processor.loadTremendoUnits();
  }
  return processor;
}

export { TremendoUnitsProcessor };
