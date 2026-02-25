#!/usr/bin/env node

/**
 * Verifica la conexión con la BD para el flujo de puntos de interés (NearbyAmenitiesSection).
 * Comprueba: variables de entorno, tabla building_nearby_amenities y opcionalmente la API.
 *
 * Uso:
 *   pnpm run verify:nearby-amenities
 *   node scripts/tools/verify-nearby-amenities-connection.mjs [baseUrl]
 *
 * Si se pasa baseUrl (ej: http://localhost:3000), se hace una petición GET a
 * /api/nearby-amenities?buildingId=bld-condominio-parque-mackenna
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..', '..');

const envPath = join(ROOT, '.env.local');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function ok(msg) {
  log(`✅ ${msg}`, 'green');
}

function fail(msg) {
  log(`❌ ${msg}`, 'red');
}

function warn(msg) {
  log(`⚠️  ${msg}`, 'yellow');
}

function section(title) {
  log(`\n--- ${title} ---`, 'cyan');
}

async function checkEnv() {
  section('Variables de entorno');
  const hasUrl = Boolean(supabaseUrl);
  const hasKey = Boolean(supabaseServiceKey);
  log(`SUPABASE_URL: ${hasUrl ? 'configurado' : 'FALTA'}`, hasUrl ? 'green' : 'red');
  log(`SUPABASE_SERVICE_ROLE_KEY: ${hasKey ? 'configurado' : 'FALTA'}`, hasKey ? 'green' : 'red');
  if (!hasUrl || !hasKey) {
    warn('En deploy, configura SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY para que carguen los puntos de interés.');
    return false;
  }
  ok('Conexión a BD disponible (isSupabaseConfigured = true)');
  return true;
}

async function checkTable() {
  section('Tabla building_nearby_amenities');
  if (!supabaseUrl || !supabaseServiceKey) {
    warn('Saltando: no hay credenciales.');
    return false;
  }
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
  try {
    const { data, error } = await supabase
      .from('building_nearby_amenities')
      .select('id, building_id, category, subcategory, name')
      .limit(5);

    if (error) {
      const code = error.code || '';
      if (code === '42P01' || (error.message && error.message.includes('does not exist'))) {
        fail('La tabla building_nearby_amenities no existe.');
        log('  Ejecuta en Supabase: config/supabase/migration-nearby-amenities.sql', 'yellow');
        log('  Luego (opcional): config/supabase/seed-parque-mackenna-amenities.sql', 'yellow');
      } else {
        fail(`Error: ${error.message}`);
      }
      return false;
    }
    ok('Tabla existe y es accesible.');
    const count = data?.length ?? 0;
    if (count === 0) {
      warn('La tabla está vacía. Ejecuta seed-parque-mackenna-amenities.sql para Condominio Parque Mackenna.');
    } else {
      log(`  Muestra: ${count} fila(s). Building IDs: ${[...new Set((data || []).map((r) => r.building_id))].join(', ')}`, 'cyan');
    }
    return true;
  } catch (err) {
    fail(`Excepción: ${err.message}`);
    return false;
  }
}

async function checkParqueMackenna() {
  section('Datos para Condominio Parque Mackenna');
  if (!supabaseUrl || !supabaseServiceKey) return false;
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
  const buildingId = 'bld-condominio-parque-mackenna';
  try {
    const { data, error } = await supabase
      .from('building_nearby_amenities')
      .select('id, category, subcategory, name')
      .eq('building_id', buildingId)
      .limit(20);

    if (error) {
      warn(`No se pudo consultar: ${error.message}`);
      return false;
    }
    const total = data?.length ?? 0;
    if (total === 0) {
      warn(`No hay filas para building_id="${buildingId}". Ejecuta seed-parque-mackenna-amenities.sql`);
      return false;
    }
    ok(`${total} punto(s) de interés para ${buildingId}`);
    return true;
  } catch (err) {
    warn(err.message);
    return false;
  }
}

async function checkApi(baseUrl) {
  section('API GET /api/nearby-amenities');
  const url = `${baseUrl.replace(/\/$/, '')}/api/nearby-amenities?buildingId=bld-condominio-parque-mackenna`;
  try {
    const res = await fetch(url);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      fail(`HTTP ${res.status}`);
      if (body.error) log(`  ${body.error}`, 'red');
      return false;
    }
    const hasData = body.data != null && typeof body.data === 'object';
    if (hasData) {
      const t = body.data.transporte;
      const count = (t?.metro?.length ?? 0) + (t?.paraderos?.length ?? 0) + 0;
      ok(`API responde OK. Datos recibidos (ej. transporte: ${count} ítems).`);
    } else {
      warn('API responde 200 pero data es null. Revisa logs del servidor (SUPABASE_* o tabla inexistente).');
    }
    return hasData;
  } catch (err) {
    fail(`Request falló: ${err.message}`);
    warn(`¿Está el servidor corriendo en ${baseUrl}? (pnpm dev)`);
    return false;
  }
}

async function main() {
  log('\n🔍 Verificación conexión: Puntos de interés (NearbyAmenitiesSection)\n', 'bold');

  const envOk = await checkEnv();
  const tableOk = await checkTable();
  await checkParqueMackenna();

  const baseUrl = process.argv[2];
  if (baseUrl) {
    await checkApi(baseUrl);
  } else {
    log('\n💡 Para probar la API en vivo: pnpm run verify:nearby-amenities -- http://localhost:3000', 'cyan');
  }

  section('Resumen');
  if (!envOk) {
    fail('Configura SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local (y en el entorno de deploy).');
    process.exit(1);
  }
  if (!tableOk) {
    fail('Tabla building_nearby_amenities faltante o inaccesible. Ejecuta migration-nearby-amenities.sql.');
    process.exit(1);
  }
  ok('Conexión para puntos de interés verificada.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
