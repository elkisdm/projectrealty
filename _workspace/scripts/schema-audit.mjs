import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { createClient } from '@supabase/supabase-js';

async function ensureDir(p) {
  await mkdir(dirname(p), { recursive: true });
}

function mask(value) {
  if (!value) return '';
  const s = String(value);
  if (s.length <= 8) return '****';
  return `${s.slice(0, 2)}****${s.slice(-2)}`;
}

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { client: createClient(url, key, { auth: { persistSession: false } }), url, key };
}

async function existsTable(client, schema, table) {
  const { data, error } = await client
    .from('pg_tables')
    .select('schemaname, tablename')
    .eq('schemaname', schema)
    .eq('tablename', table)
    .limit(1);
  return !error && Array.isArray(data) && data.length === 1;
}

async function existsView(client, schema, view) {
  const { data, error } = await client
    .from('pg_views')
    .select('schemaname, viewname')
    .eq('schemaname', schema)
    .eq('viewname', view)
    .limit(1);
  return !error && Array.isArray(data) && data.length === 1;
}

async function existsMatView(client, schema, view) {
  // materialized views live in pg_matviews
  const { data, error } = await client
    .from('pg_matviews')
    .select('schemaname, matviewname')
    .eq('schemaname', schema)
    .eq('matviewname', view)
    .limit(1);
  return !error && Array.isArray(data) && data.length === 1;
}

async function existsTriggerOn(client, schema, table, trigger) {
  const { data, error } = await client
    .from('pg_trigger')
    .select('tgname')
    .eq('tgname', trigger)
    .limit(1);
  return !error && Array.isArray(data) && data.length === 1;
}

async function main() {
  const cfg = getClient();
  const mdLines = ['# Auditoría de Esquema', '', `- Fecha: ${new Date().toISOString()}`, `- URL: ${mask(cfg?.url)}`, ''];
  if (!cfg) {
    mdLines.push('FAIL: No hay credenciales para consultar esquema (SUPABASE_URL y KEY)');
    const mdPath = 'reports/SCHEMA_AUDIT.md';
    await ensureDir(mdPath);
    await writeFile(mdPath, mdLines.join('\n'), 'utf8');
    process.exitCode = 1;
    return;
  }
  const { client } = cfg;

  const checks = [];
  // Tablas
  for (const t of ['ingest_runs', 'units_history', 'units_snapshot_daily', 'buildings_snapshot_daily', 'leads', 'bookings']) {
    const ok = await existsTable(client, 'public', t);
    checks.push({ kind: 'table', name: t, pass: ok });
  }
  // Vistas
  for (const v of ['v_filters_available', 'v_exports_units_delta']) {
    const ok = await existsView(client, 'public', v);
    checks.push({ kind: 'view', name: v, pass: ok });
  }
  // Materialized views
  for (const mv of ['mv_price_drops_7d', 'mv_new_listings_24h']) {
    const ok = await existsMatView(client, 'public', mv);
    checks.push({ kind: 'matview', name: mv, pass: ok });
  }
  // Trigger
  const trgOk = await existsTriggerOn(client, 'public', 'units', 'trg_units_history');
  checks.push({ kind: 'trigger', name: 'trg_units_history', pass: trgOk });

  const allPass = checks.every(c => c.pass);
  mdLines.push('### Resultados', '', '| Tipo | Objeto | Estado |', '|------|--------|--------|');
  mdLines.push(...checks.map(c => `| ${c.kind} | ${c.name} | ${c.pass ? 'PASS' : 'FAIL'} |`));
  mdLines.push('', `**Estado general**: ${allPass ? 'PASS' : 'FAIL'}`);

  const mdPath = 'reports/SCHEMA_AUDIT.md';
  const jsonPath = 'reports/schema_audit.json';
  await ensureDir(mdPath);
  await ensureDir(jsonPath);
  await writeFile(mdPath, mdLines.join('\n'), 'utf8');
  await writeFile(jsonPath, JSON.stringify({ generatedAt: new Date().toISOString(), checks, allPass }, null, 2), 'utf8');

  if (!allPass) {
    console.error('Schema audit FAIL. Suggested fixes:');
    console.error('- Crear objetos faltantes o ajustar permisos de introspección.');
    console.error('- Verificar esquema public y pg_catalog exposure en Supabase.');
    process.exitCode = 1;
  } else {
    console.log('Schema audit PASS');
  }
}

main().catch((err) => {
  console.error('schema-audit failed:', err);
  process.exitCode = 1;
});


