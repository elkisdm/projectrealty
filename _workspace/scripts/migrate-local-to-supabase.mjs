import { createClient } from '@supabase/supabase-js';
import { readFile } from 'node:fs/promises';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: '.env.local' });

async function migrateLocalToSupabase() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !serviceRoleKey) {
    console.error('❌ Faltan variables de entorno: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
    console.log('💡 Agrega estas variables a tu .env.local:');
    console.log('SUPABASE_URL=https://tu-proyecto.supabase.co');
    console.log('SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key');
    process.exit(1);
  }

  console.log('🔗 Conectando a Supabase con SERVICE ROLE...');
  const supabase = createClient(url, serviceRoleKey);

  try {
    // Leer datos locales
    console.log('📖 Leyendo datos locales...');
    const localData = JSON.parse(await readFile('data/buildings.json', 'utf8'));
    console.log(`📊 Encontrados ${localData.length} edificios locales`);

    // Migrar edificios
    console.log('🏗️ Migrando edificios...');
    for (const building of localData) {
      const { id, units, address, name, ...otherData } = building;
      
      // Generar UUID para el edificio
      const buildingUUID = randomUUID();
      
      // Mapear campos locales a campos de Supabase
      const buildingData = {
        id: buildingUUID,
        source_building_id: id,
        provider: 'local',
        slug: building.slug || id,
        nombre: name, // mapear 'name' a 'nombre'
        comuna: building.comuna,
        direccion: address, // mapear 'address' a 'direccion'
        precio_desde: building.precioDesde || null,
        has_availability: Array.isArray(units) && units.some(u => u.disponible)
      };
      
      // Insertar edificio
      const { error: buildingError } = await supabase
        .from('buildings')
        .insert(buildingData);
      
      if (buildingError) {
        console.error(`❌ Error insertando edificio ${id}:`, buildingError.message);
        continue;
      }
      
      console.log(`✅ Edificio ${id} migrado (UUID: ${buildingUUID})`);
      
      // Insertar unidades
      if (units && units.length > 0) {
        for (const unit of units) {
          const unitUUID = randomUUID();
          const unitData = {
            id: unitUUID,
            source_unit_id: unit.id,
            provider: 'local',
            building_id: buildingUUID,
            unidad: unit.id,
            tipologia: unit.tipologia,
            bedrooms: unit.bedrooms || null,
            bathrooms: unit.bathrooms || null,
            area_m2: unit.m2 || null,
            precio: unit.price || null,
            disponible: unit.disponible || false,
            status: unit.disponible ? 'available' : 'unavailable'
          };
          
          const { error: unitError } = await supabase
            .from('units')
            .insert(unitData);
          
          if (unitError) {
            console.error(`❌ Error insertando unidad ${unit.id}:`, unitError.message);
          }
        }
        console.log(`✅ ${units.length} unidades migradas para ${id}`);
      }
    }

    console.log('🎉 Migración completada!');
    
    // Verificar datos
    console.log('🔍 Verificando datos...');
    const { count: buildingsCount } = await supabase
      .from('buildings')
      .select('*', { count: 'exact', head: true });
    
    const { count: unitsCount } = await supabase
      .from('units')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 Resultado: ${buildingsCount} edificios, ${unitsCount} unidades`);

  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    process.exit(1);
  }
}

migrateLocalToSupabase();
