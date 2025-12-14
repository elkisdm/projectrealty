import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Cargar variables de entorno
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan credenciales de Supabase en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Función para limpiar precios (eliminar .00 y convertir a entero)
function cleanPrice(value) {
  if (!value) return 0;
  return parseInt(value.toString().replace('.00', '').replace(/[^0-9]/g, ''), 10) || 0;
}

// Función para normalizar booleanos (Si/No/Yes/No -> true/false)
function parseBoolean(value) {
  if (!value) return false;
  const normalized = value.toString().toLowerCase().trim();
  return normalized === 'si' || normalized === 's' || normalized === 'yes' || normalized === 'y' || normalized === '1';
}

// Función para parsear números decimales
function cleanFloat(value) {
  if (!value) return 0;
  return parseFloat(value.toString().replace(',', '.')) || 0;
}

async function importCSV(filePath) {
  try {
    console.log(`📖 Leyendo archivo CSV: ${filePath}`);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Parsear CSV con headers
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ';', // El CSV de Assetplan usa ; como separador
      trim: true
    });

    console.log(`📊 Procesando ${records.length} registros...`);

    let processedCount = 0;
    let errorCount = 0;

    for (const record of records) {
      try {
        // Mapeo y transformación de datos
        const op = record['OP'];
        if (!op) continue; // Saltar si no hay ID

        const price = cleanPrice(record['Arriendo Total']);
        const gc = cleanPrice(record['GC Total']);
        
        // Determinar ID del edificio basado en el nombre del condominio o CSV anterior
        // Por ahora, asumiremos que el building_id ya existe o se puede inferir del OP (ej: GMND -> guillermo-mann)
        // O mejor: buscar el edificio por nombre 'Condominio' primero
        let buildingId = null;
        
        if (record['Condominio']) {
           const { data: buildingData } = await supabase
             .from('buildings')
             .select('id')
             .ilike('name', `%${record['Condominio']}%`)
             .limit(1)
             .single();
           
           if (buildingData) buildingId = buildingData.id;
        }

        // Si no encontramos building, loguear warning pero intentar insertar con null (fallará por FK) o saltar
        if (!buildingId) {
            console.warn(`⚠️ No se encontró edificio para: ${record['Condominio']} (OP: ${op}). Saltando...`);
            continue; 
        }

        const unitData = {
          id: op, // Usamos OP como ID único
          building_id: buildingId,
          tipologia: record['Tipologia'] || 'Desconocida',
          price: price,
          gc: gc,
          // total_mensual es calculado automáticamente por columna generada en DB, no lo enviamos
          m2: cleanPrice(record['m2 Depto']), // A veces viene como entero
          estacionamiento: parseBoolean(record['Estac']) || (!!record['Estac'] && record['Estac'].trim().length > 0),
          bodega: parseBoolean(record['Bod']) || (!!record['Bod'] && record['Bod'].trim().length > 0), 
          disponible: record['Estado'] === 'Lista para arrendar',
          
          // Nuevos campos
          orientacion: record['Orientacion'],
          m2_terraza: cleanFloat(record['m2 Terraza']),
          descuento_porcentaje: cleanFloat(record['% Descuento']),
          meses_descuento: parseInt(record['Cant. Meses Descuento']) || 0,
          garantia_meses: parseInt(record['Cant. Garantías (Meses)']) || 1,
          garantia_cuotas: parseInt(record['Cuotas Garantía']) || 1,
          rentas_necesarias: cleanFloat(record['Rentas Necesarias']) || 3,
          pet_friendly: parseBoolean(record['Acepta Mascotas?']),
          reajuste_meses: parseInt(record['Reajuste por contrato']) || 3,
          link_listing: record['Link Listing'],
          
          // Lógica de negocio: Estacionamiento y Bodega opcionales en MF
          parking_optional: true, // Default para este feed según contexto
          storage_optional: true, // Default para este feed según contexto
          
          updated_at: new Date()
        };

        // Upsert en Supabase
        const { error } = await supabase
          .from('units')
          .upsert(unitData, { onConflict: 'id' });

        if (error) {
          console.error(`❌ Error insertando unidad ${op}:`, error.message);
          errorCount++;
        } else {
          processedCount++;
          if (processedCount % 10 === 0) process.stdout.write('.');
        }

      } catch (err) {
        console.error(`❌ Error procesando registro ${record['OP']}:`, err);
        errorCount++;
      }
    }

    console.log(`\n✅ Importación completada.`);
    console.log(`   Procesados: ${processedCount}`);
    console.log(`   Errores: ${errorCount}`);

  } catch (error) {
    console.error('❌ Error fatal en importación:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
const csvPath = process.argv[2];
if (csvPath) {
  importCSV(csvPath);
} else {
  console.log('Uso: node scripts/import-assetplan-csv.mjs <ruta-al-csv>');
}
