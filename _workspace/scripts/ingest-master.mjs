#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Credenciales de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

console.log('🚀 INGESTA MASTER - SISTEMA HOMMIE');
console.log('===================================');

// Configuración del proceso
const CONFIG = {
  BATCH_SIZE: 100,
  MAX_RETRIES: 3,
  PROVIDER: 'assetplan',
  CSV_DELIMITER: ';',
  BACKUP_ENABLED: true,
  VALIDATION_ENABLED: true
};

// Mapeos estándar del sistema
const TIPOLOGIA_MAPPING = {
  'Estudio': 'Studio',
  '1D1B': '1D1B',
  '2D1B (3C)': '2D1B',
  '2D1B (4C)': '2D1B', 
  '2D1B': '2D1B',
  '2D2B (4C)': '2D2B',
  '2D2B': '2D2B',
  '3D2B': '3D2B'
};

const ORIENTACION_MAPPING = {
  'N': 'N', 'NE': 'NE', 'E': 'E', 'SE': 'SE',
  'S': 'S', 'SO': 'SO', 'O': 'O', 'NO': 'NO',
  'NP': 'N', 'SP': 'S', 'P': undefined
};

const ESTADOS_DISPONIBLES = ['Lista para arrendar', 'RE - Acondicionamiento'];

// Clase principal de ingesta
class IngestaMaster {
  constructor() {
    this.stats = {
      totalRows: 0,
      processedRows: 0,
      skippedRows: 0,
      buildings: 0,
      units: 0,
      errors: []
    };
    this.startTime = Date.now();
  }

  // Parser robusto de números chilenos
  parseChileanNumber(value) {
    if (!value || value === '') return 0;
    
    let cleanValue = String(value).trim();
    
    // Manejo de formatos chilenos
    if (cleanValue.includes(',') && cleanValue.includes('.')) {
      cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
    } 
    else if (cleanValue.includes('.')) {
      const dotIndex = cleanValue.lastIndexOf('.');
      if (cleanValue.length - dotIndex <= 3 && cleanValue.length - dotIndex > 1) {
        // Es decimal
      } else {
        cleanValue = cleanValue.replace(/\./g, '');
      }
    }
    else if (cleanValue.includes(',')) {
      cleanValue = cleanValue.replace(',', '.');
    }
    
    const num = parseFloat(cleanValue);
    const result = isNaN(num) ? 0 : Math.round(num);
    
    // Validar rango PostgreSQL
    if (result > 2147483647) {
      console.log(`⚠️ Valor muy grande detectado: ${value} -> usando 0`);
      return 0;
    }
    
    return result;
  }

  // Parser de decimales
  parseChileanDecimal(value) {
    if (!value || value === '') return null;
    
    let cleanValue = String(value).trim();
    
    if (cleanValue.includes(',') && cleanValue.includes('.')) {
      cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
    } 
    else if (cleanValue.includes(',')) {
      cleanValue = cleanValue.replace(',', '.');
    }
    else if (cleanValue.includes('.')) {
      const dotIndex = cleanValue.lastIndexOf('.');
      const afterDot = cleanValue.substring(dotIndex + 1);
      
      if (afterDot.length <= 2) {
        // Es decimal
      } else {
        cleanValue = cleanValue.replace(/\./g, '');
      }
    }
    
    const num = parseFloat(cleanValue);
    return isNaN(num) ? null : num;
  }

  // Parser de booleanos
  parseBoolean(value) {
    if (!value || value === '') return false;
    const str = String(value).toLowerCase().trim();
    return ['si', 'sí', 'yes', '1', 'true'].includes(str);
  }

  // Determinar disponibilidad
  isAvailable(estado) {
    return ESTADOS_DISPONIBLES.includes(estado);
  }

  // Extraer dormitorios de tipología
  extractBedrooms(tipologia) {
    if (tipologia.includes('Estudio')) return 0;
    if (tipologia.includes('1D')) return 1;
    if (tipologia.includes('2D')) return 2;
    if (tipologia.includes('3D')) return 3;
    return 1;
  }

  // Extraer baños de tipología
  extractBathrooms(tipologia) {
    if (tipologia.includes('1B')) return 1;
    if (tipologia.includes('2B')) return 2;
    if (tipologia.includes('3B')) return 3;
    return 1;
  }

  // Parsear CSV con manejo robusto de errores
  async parseCSV(csvPath) {
    console.log('\n📄 Leyendo archivo CSV...');
    
    const csvContent = await fs.readFile(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = lines[0].split(CONFIG.CSV_DELIMITER);
    
    this.stats.totalRows = lines.length - 1;
    
    console.log(`📊 Headers detectados: ${headers.length} columnas`);
    console.log(`📊 Filas de datos: ${this.stats.totalRows}`);
    
    const rawUnits = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(CONFIG.CSV_DELIMITER);
      
      if (values.length !== headers.length) {
        console.log(`⚠️ Línea ${i + 1} tiene ${values.length} valores, esperando ${headers.length}`);
        this.stats.skippedRows++;
        continue;
      }
      
      const unit = {};
      headers.forEach((header, index) => {
        unit[header.trim()] = values[index]?.trim() || '';
      });
      
      rawUnits.push(unit);
      this.stats.processedRows++;
    }
    
    console.log(`✅ Procesadas ${rawUnits.length} unidades (${this.stats.skippedRows} omitidas)`);
    return rawUnits;
  }

  // Agrupar por edificios
  groupByBuilding(units) {
    console.log('\n🏗️ Agrupando por edificios...');
    
    const buildingsMap = new Map();
    
    units.forEach(unit => {
      const buildingCode = unit.OP || 'UNKNOWN';
      const buildingKey = buildingCode.substring(0, buildingCode.length - 3);
      
      if (!buildingsMap.has(buildingKey)) {
        buildingsMap.set(buildingKey, {
          code: buildingKey,
          name: unit.Condominio || buildingKey,
          address: unit.Direccion || '',
          comuna: unit.Comuna || '',
          units: []
        });
      }
      
      buildingsMap.get(buildingKey).units.push(unit);
    });
    
    this.stats.buildings = buildingsMap.size;
    console.log(`✅ Encontrados ${this.stats.buildings} edificios únicos`);
    return Array.from(buildingsMap.values());
  }

  // Transformar al formato Supabase
  transformToSupabaseFormat(buildings) {
    console.log('\n🔄 Transformando al formato Supabase...');
    
    const supabaseBuildings = [];
    const supabaseUnits = [];
    
    buildings.forEach(building => {
      const buildingId = randomUUID();
      
      // Calcular rangos de precios
      const availableUnits = building.units.filter(u => this.isAvailable(u.Estado));
      const prices = availableUnits
        .map(u => this.parseChileanNumber(u['Arriendo Total']))
        .filter(p => p > 0);
      
      const buildingData = {
        id: buildingId,
        provider: CONFIG.PROVIDER,
        source_building_id: building.code,
        slug: building.name.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, ''),
        nombre: building.name,
        comuna: building.comuna,
        direccion: building.address,
        precio_desde: prices.length > 0 ? Math.min(...prices) : null,
        precio_hasta: prices.length > 0 ? Math.max(...prices) : null,
        has_availability: availableUnits.length > 0,
        gc_mode: 'MF',
        featured: false
      };
      
      supabaseBuildings.push(buildingData);
      
      // Procesar unidades
      building.units.forEach(unit => {
        const unitId = randomUUID();
        const tipologiaOriginal = unit.Tipologia || '';
        const tipologiaCanonica = TIPOLOGIA_MAPPING[tipologiaOriginal] || tipologiaOriginal;
        
        const unitData = {
          id: unitId,
          provider: CONFIG.PROVIDER,
          source_unit_id: unit.OP || '',
          building_id: buildingId,
          unidad: unit.Unidad || '',
          tipologia: tipologiaCanonica,
          bedrooms: this.extractBedrooms(tipologiaOriginal),
          bathrooms: this.extractBathrooms(tipologiaOriginal),
          area_m2: this.parseChileanDecimal(unit['m2 Depto']),
          area_interior_m2: this.parseChileanDecimal(unit['m2 Depto']),
          area_exterior_m2: this.parseChileanDecimal(unit['m2 Terraza']),
          orientacion: ORIENTACION_MAPPING[unit.Orientacion] || null,
          pet_friendly: this.parseBoolean(unit['Acepta Mascotas?']),
          precio: this.parseChileanNumber(unit['Arriendo Total']),
          gastos_comunes: this.parseChileanNumber(unit['GC Total']),
          disponible: this.isAvailable(unit.Estado),
          status: this.isAvailable(unit.Estado) ? 'available' : 'rented',
          guarantee_installments: this.parseChileanNumber(unit['Cuotas Garantía']) || null,
          guarantee_months: this.parseChileanNumber(unit['Cant. Garantías (Meses)']) || null,
          rentas_necesarias: this.parseChileanDecimal(unit['Rentas Necesarias']),
          link_listing: unit['Link Listing'] || null,
          parking_ids: null,
          storage_ids: null,
          parking_opcional: false,
          storage_opcional: false,
          piso: null,
          amoblado: false,
          comment_text: unit.Comentario || null
        };
        
        // Calcular renta mínima
        if (unitData.precio && unitData.rentas_necesarias) {
          unitData.renta_minima = Math.round(unitData.precio * unitData.rentas_necesarias);
        }
        
        supabaseUnits.push(unitData);
      });
    });
    
    this.stats.units = supabaseUnits.length;
    console.log(`✅ Transformados ${supabaseBuildings.length} edificios y ${supabaseUnits.length} unidades`);
    return { buildings: supabaseBuildings, units: supabaseUnits };
  }

  // Crear backup antes de la ingesta
  async createBackup() {
    if (!CONFIG.BACKUP_ENABLED) return true;
    
    console.log('\n💾 Creando backup...');
    
    try {
      const backupTime = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(process.cwd(), 'backups', backupTime);
      
      await fs.mkdir(backupDir, { recursive: true });
      
      // Backup edificios
      const { data: buildings } = await supabase
        .from('buildings')
        .select('*')
        .eq('provider', CONFIG.PROVIDER);
      
      if (buildings) {
        await fs.writeFile(
          path.join(backupDir, 'buildings.json'),
          JSON.stringify(buildings, null, 2)
        );
      }
      
      // Backup unidades
      const { data: units } = await supabase
        .from('units')
        .select('*')
        .eq('provider', CONFIG.PROVIDER);
      
      if (units) {
        await fs.writeFile(
          path.join(backupDir, 'units.json'),
          JSON.stringify(units, null, 2)
        );
      }
      
      console.log(`✅ Backup creado en: ${backupDir}`);
      return true;
    } catch (error) {
      console.error('❌ Error creando backup:', error.message);
      return false;
    }
  }

  // Cargar datos a Supabase con reintentos
  async loadToSupabase(data) {
    console.log('\n💾 Cargando datos a Supabase...');
    
    try {
      // Verificar edificios existentes
      const { data: existingBuildings } = await supabase
        .from('buildings')
        .select('id, source_building_id')
        .eq('provider', CONFIG.PROVIDER);
      
      const hasBuildings = existingBuildings && existingBuildings.length > 0;
      
      if (!hasBuildings) {
        console.log('🧹 Limpiando datos existentes...');
        await supabase.from('units').delete().eq('provider', CONFIG.PROVIDER);
        await supabase.from('buildings').delete().eq('provider', CONFIG.PROVIDER);
        
        // Insertar edificios
        console.log(`📍 Insertando ${data.buildings.length} edificios...`);
        const { error: buildingsError } = await supabase
          .from('buildings')
          .insert(data.buildings);
        
        if (buildingsError) {
          throw new Error(`Error insertando edificios: ${buildingsError.message}`);
        }
        
        console.log(`✅ Edificios insertados: ${data.buildings.length}`);
      } else {
        console.log('🏗️ Edificios existentes detectados, solo actualizando unidades...');
        await supabase.from('units').delete().eq('provider', CONFIG.PROVIDER);
        
        // Mapear IDs existentes
        const buildingCodeToId = new Map();
        existingBuildings.forEach(building => {
          buildingCodeToId.set(building.source_building_id, building.id);
        });
        
        // Actualizar building_id en unidades
        data.units.forEach(unit => {
          const buildingCode = unit.source_unit_id?.substring(0, unit.source_unit_id.length - 3);
          const realBuildingId = buildingCodeToId.get(buildingCode);
          if (realBuildingId) {
            unit.building_id = realBuildingId;
          }
        });
      }
      
      // Insertar unidades en lotes
      console.log(`🏠 Insertando ${data.units.length} unidades...`);
      let insertedUnits = 0;
      
      for (let i = 0; i < data.units.length; i += CONFIG.BATCH_SIZE) {
        const batch = data.units.slice(i, i + CONFIG.BATCH_SIZE);
        const batchNumber = Math.floor(i / CONFIG.BATCH_SIZE) + 1;
        
        let retries = 0;
        let success = false;
        
        while (retries < CONFIG.MAX_RETRIES && !success) {
          try {
            const { data: unitsData, error: unitsError } = await supabase
              .from('units')
              .insert(batch)
              .select();
            
            if (unitsError) {
              throw new Error(unitsError.message);
            }
            
            insertedUnits += unitsData.length;
            console.log(`   ✅ Lote ${batchNumber}: ${unitsData.length} unidades`);
            success = true;
            
          } catch (error) {
            retries++;
            console.log(`   ⚠️ Lote ${batchNumber} falló (intento ${retries}): ${error.message}`);
            
            if (retries >= CONFIG.MAX_RETRIES) {
              this.stats.errors.push(`Lote ${batchNumber}: ${error.message}`);
            } else {
              await new Promise(resolve => setTimeout(resolve, 1000 * retries));
            }
          }
        }
      }
      
      console.log(`✅ Total unidades insertadas: ${insertedUnits}`);
      return true;
      
    } catch (error) {
      console.error('❌ Error general en carga:', error.message);
      this.stats.errors.push(`Error general: ${error.message}`);
      return false;
    }
  }

  // Generar reporte final
  generateReport() {
    const duration = Math.round((Date.now() - this.startTime) / 1000);
    
    console.log('\n📊 REPORTE FINAL DE INGESTA');
    console.log('===========================');
    console.log(`⏱️  Duración: ${duration} segundos`);
    console.log(`📄 Filas procesadas: ${this.stats.processedRows}/${this.stats.totalRows}`);
    console.log(`🏗️  Edificios: ${this.stats.buildings}`);
    console.log(`🏠 Unidades: ${this.stats.units}`);
    console.log(`⚠️  Errores: ${this.stats.errors.length}`);
    
    if (this.stats.errors.length > 0) {
      console.log('\n❌ Errores encontrados:');
      this.stats.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    // Escribir reporte a archivo
    const reportPath = path.join(process.cwd(), 'reports', `ingesta-${Date.now()}.json`);
    fs.mkdir(path.dirname(reportPath), { recursive: true }).then(() => {
      fs.writeFile(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        duration,
        stats: this.stats,
        config: CONFIG
      }, null, 2));
    });
  }

  // Proceso principal
  async execute(csvFileName = 'assetplan-export.csv') {
    try {
      const csvPath = path.join(process.cwd(), 'data/sources', csvFileName);
      
      // 1. Verificar archivo
      await fs.access(csvPath);
      
      // 2. Crear backup
      if (CONFIG.BACKUP_ENABLED) {
        const backupSuccess = await this.createBackup();
        if (!backupSuccess) {
          console.log('⚠️ Backup falló, ¿continuar? (continuando automáticamente...)');
        }
      }
      
      // 3. Parsear CSV
      const rawUnits = await this.parseCSV(csvPath);
      
      // 4. Agrupar por edificios
      const buildings = this.groupByBuilding(rawUnits);
      
      // 5. Transformar formato
      const supabaseData = this.transformToSupabaseFormat(buildings);
      
      // 6. Cargar a Supabase
      const success = await this.loadToSupabase(supabaseData);
      
      // 7. Generar reporte
      this.generateReport();
      
      if (success) {
        console.log('\n🎉 ¡INGESTA COMPLETADA EXITOSAMENTE!');
        console.log('\n🔍 Verificar resultados con: pnpm run verify:real-data');
      } else {
        console.log('\n❌ La ingesta tuvo errores. Revisa el reporte arriba.');
      }
      
    } catch (error) {
      console.error('❌ Error fatal:', error.message);
      this.stats.errors.push(`Error fatal: ${error.message}`);
      this.generateReport();
      process.exit(1);
    }
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const csvFile = process.argv[2] || 'assetplan-export.csv';
  const ingesta = new IngestaMaster();
  ingesta.execute(csvFile);
}

export { IngestaMaster };
