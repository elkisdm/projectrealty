/**
 * Script de migración: Poblar bedrooms y bathrooms desde tipología
 * 
 * Este script actualiza todas las unidades que tienen bedrooms: null o bathrooms: null
 * extrayendo estos valores de la tipología (ej: "1D1B" -> bedrooms: 1, bathrooms: 1)
 */

import { supabaseAdmin } from '@/lib/supabase';

function extractBedroomsFromTipologia(tipologia: string | null): number | null {
  if (!tipologia) return null;
  const tipologiaLower = tipologia.toLowerCase();
  if (tipologiaLower.includes('estudio') || tipologiaLower.includes('studio')) return 0;
  const match = tipologia.match(/^(\d+)D/);
  if (match) return parseInt(match[1], 10);
  return null;
}

function extractBathroomsFromTipologia(tipologia: string | null): number | null {
  if (!tipologia) return null;
  const match = tipologia.match(/(\d+)B$/);
  if (match) return parseInt(match[1], 10);
  // Si no tiene formato XDXB, intentar extraer de otros formatos
  if (tipologia.toLowerCase().includes('1b')) return 1;
  if (tipologia.toLowerCase().includes('2b')) return 2;
  return null;
}

async function migrateBedroomsFromTipologia() {
  const supabase = supabaseAdmin;
  
  console.log('🔍 Buscando unidades con bedrooms o bathrooms null...');
  
  // Obtener todas las unidades que tienen bedrooms o bathrooms null
  const { data: units, error: fetchError } = await supabase
    .from('units')
    .select('id, tipologia, bedrooms, bathrooms')
    .or('bedrooms.is.null,bathrooms.is.null');
  
  if (fetchError) {
    console.error('❌ Error obteniendo unidades:', fetchError.message);
    return;
  }
  
  if (!units || units.length === 0) {
    console.log('✅ No hay unidades que necesiten migración');
    return;
  }
  
  console.log(`📊 Encontradas ${units.length} unidades para migrar`);
  
  let updated = 0;
  let skipped = 0;
  const errors: Array<{ id: string; error: string }> = [];
  
  for (const unit of units) {
    const bedroomsFromTipologia = extractBedroomsFromTipologia(unit.tipologia);
    const bathroomsFromTipologia = extractBathroomsFromTipologia(unit.tipologia);
    
    // Solo actualizar si podemos extraer valores de la tipología
    const shouldUpdateBedrooms = unit.bedrooms === null && bedroomsFromTipologia !== null;
    const shouldUpdateBathrooms = unit.bathrooms === null && bathroomsFromTipologia !== null;
    
    if (!shouldUpdateBedrooms && !shouldUpdateBathrooms) {
      skipped++;
      continue;
    }
    
    const updates: { bedrooms?: number; bathrooms?: number } = {};
    if (shouldUpdateBedrooms) {
      updates.bedrooms = bedroomsFromTipologia!;
    }
    if (shouldUpdateBathrooms) {
      updates.bathrooms = bathroomsFromTipologia!;
    }
    
    const { error: updateError } = await supabase
      .from('units')
      .update(updates)
      .eq('id', unit.id);
    
    if (updateError) {
      errors.push({ id: unit.id, error: updateError.message });
      console.error(`❌ Error actualizando unidad ${unit.id}:`, updateError.message);
    } else {
      updated++;
      console.log(`✅ Actualizada unidad ${unit.id}: tipologia="${unit.tipologia}" -> bedrooms=${updates.bedrooms ?? unit.bedrooms}, bathrooms=${updates.bathrooms ?? unit.bathrooms}`);
    }
  }
  
  console.log('\n📊 Resumen de migración:');
  console.log(`  ✅ Actualizadas: ${updated}`);
  console.log(`  ⏭️  Omitidas (no se pudo extraer de tipología): ${skipped}`);
  console.log(`  ❌ Errores: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n❌ Errores detallados:');
    errors.forEach(({ id, error }) => {
      console.log(`  - ${id}: ${error}`);
    });
  }
  
  console.log('\n✅ Migración completada');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  migrateBedroomsFromTipologia()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error ejecutando script:', error);
      process.exit(1);
    });
}

export { migrateBedroomsFromTipologia };

