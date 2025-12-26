#!/usr/bin/env node
/**
 * Script de diagnóstico para verificar comunas en Supabase
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY o SUPABASE_ANON_KEY deben estar configurados');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugCommunes() {
  console.log('🔍 Verificando comunas en Supabase...\n');

  try {
    // Obtener edificios con sus unidades
    const { data: buildingsData, error: buildingsError } = await supabase
      .from('buildings')
      .select(`
        id,
        name,
        comuna,
        units!left (
          id,
          disponible
        )
      `)
      .limit(20);

    if (buildingsError) {
      console.error('❌ Error obteniendo edificios:', buildingsError);
      return;
    }

    if (!buildingsData || buildingsData.length === 0) {
      console.log('⚠️  No se encontraron edificios en Supabase');
      return;
    }

    console.log(`✅ Se encontraron ${buildingsData.length} edificios\n`);

    // Analizar comunas
    const comunasMap = new Map();
    const edificiosSinComuna = [];
    const edificiosConUnidades = [];

    for (const building of buildingsData) {
      const comuna = building.comuna;
      const unidades = building.units || [];
      const unidadesDisponibles = unidades.filter(u => u.disponible).length;

      if (!comuna || comuna.trim() === '') {
        edificiosSinComuna.push({
          id: building.id,
          name: building.name,
          unidades: unidades.length,
          unidadesDisponibles,
        });
      } else {
        if (!comunasMap.has(comuna)) {
          comunasMap.set(comuna, {
            count: 0,
            edificios: [],
          });
        }
        const entry = comunasMap.get(comuna);
        entry.count++;
        entry.edificios.push({
          id: building.id,
          name: building.name,
          unidades: unidades.length,
          unidadesDisponibles,
        });
      }

      if (unidades.length > 0) {
        edificiosConUnidades.push({
          id: building.id,
          name: building.name,
          comuna: comuna || '(vacío)',
          unidades: unidades.length,
        });
      }
    }

    // Mostrar resultados
    console.log('📊 Resumen de comunas:');
    console.log(`   Total edificios: ${buildingsData.length}`);
    console.log(`   Edificios con comuna: ${buildingsData.length - edificiosSinComuna.length}`);
    console.log(`   Edificios sin comuna: ${edificiosSinComuna.length}`);
    console.log(`   Comunas únicas: ${comunasMap.size}\n`);

    if (comunasMap.size > 0) {
      console.log('🏘️  Comunas encontradas:');
      for (const [comuna, data] of comunasMap.entries()) {
        console.log(`   - ${comuna}: ${data.count} edificio(s)`);
        if (data.count <= 3) {
          data.edificios.forEach(e => {
            console.log(`     • ${e.name} (${e.unidades} unidades, ${e.unidadesDisponibles} disponibles)`);
          });
        }
      }
      console.log('');
    }

    if (edificiosSinComuna.length > 0) {
      console.log('⚠️  Edificios sin comuna:');
      edificiosSinComuna.slice(0, 10).forEach(e => {
        console.log(`   - ${e.name} (ID: ${e.id}, ${e.unidades} unidades)`);
      });
      if (edificiosSinComuna.length > 10) {
        console.log(`   ... y ${edificiosSinComuna.length - 10} más`);
      }
      console.log('');
    }

    // Verificar edificios con unidades (los que deberían aparecer en el home)
    console.log(`📦 Edificios con unidades: ${edificiosConUnidades.length}`);
    if (edificiosConUnidades.length > 0) {
      const comunasConUnidades = new Set(
        edificiosConUnidades
          .map(e => e.comuna)
          .filter(c => c && c !== '(vacío)')
      );
      console.log(`   Comunas con unidades disponibles: ${Array.from(comunasConUnidades).join(', ')}`);
    }

    // Verificar si hay edificios con unidades pero sin comuna
    const edificiosConUnidadesSinComuna = edificiosConUnidades.filter(
      e => !e.comuna || e.comuna === '(vacío)'
    );
    if (edificiosConUnidadesSinComuna.length > 0) {
      console.log(`\n⚠️  PROBLEMA: ${edificiosConUnidadesSinComuna.length} edificio(s) con unidades pero sin comuna:`);
      edificiosConUnidadesSinComuna.forEach(e => {
        console.log(`   - ${e.name} (ID: ${e.id})`);
      });
      console.log('\n💡 Solución: Estos edificios necesitan tener el campo "comuna" actualizado en Supabase');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugCommunes()
  .then(() => {
    console.log('\n✅ Diagnóstico completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
