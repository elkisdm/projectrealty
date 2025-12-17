import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { createClient } from '@supabase/supabase-js';

function mask(value) {
  if (!value) return '';
  const s = String(value);
  if (s.length <= 8) return '****';
  return `${s.slice(0, 2)}****${s.slice(-2)}`;
}

async function ensureDir(p) {
  await mkdir(dirname(p), { recursive: true });
}

function getSupabaseClients() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const anon = url && anonKey ? createClient(url, anonKey, { auth: { persistSession: false } }) : null;
  const service = url && serviceRoleKey ? createClient(url, serviceRoleKey, { auth: { persistSession: false } }) : null;
  return { anon, service, url, anonKey, serviceRoleKey };
}

async function tryQuery(client, fn) {
  if (!client) return { error: new Error('client not configured') };
  try {
    return await fn(client);
  } catch (error) {
    return { error };
  }
}

async function runReadChecks(client) {
  const results = [];

  // a) SELECT 1 from public.buildings limit 1
  try {
    const { data, error } = await client.from('buildings').select('id', { count: 'exact', head: true }).limit(1);
    results.push({ name: 'buildings_select1', pass: !error, detail: error ? String(error.message || error) : 'ok' });
  } catch (e) {
    results.push({ name: 'buildings_select1', pass: false, detail: String(e) });
  }

  // b) SELECT count(*) from public.units
  try {
    const { count, error } = await client.from('units').select('*', { count: 'exact', head: true });
    results.push({ name: 'units_count', pass: !error, count: typeof count === 'number' ? count : null, detail: error ? String(error.message || error) : 'ok' });
  } catch (e) {
    results.push({ name: 'units_count', pass: false, detail: String(e) });
  }

  // c) SELECT * from public.v_filters_available limit 5
  try {
    const { data, error } = await client.from('v_filters_available').select('*').limit(5);
    results.push({ name: 'v_filters_available_sample', pass: !error, rows: Array.isArray(data) ? data.length : 0, detail: error ? String(error.message || error) : 'ok' });
  } catch (e) {
    results.push({ name: 'v_filters_available_sample', pass: false, detail: String(e) });
  }

  // d) check functions existence
  try {
    const fnNames = ['refresh_building_aggregates', 'take_daily_snapshots', 'refresh_market_views'];
    const { data, error } = await client.rpc('pg_catalog.pg_proc_list', {});
    // Not all instances will have helper; fallback to manual query via http
    let names = [];
    if (error || !Array.isArray(data)) {
      // Fallback: query pg_proc via rest; using supabase-js: from('pg_proc') is not allowed, fallback via RPC select
      const { data: procs, error: err2 } = await client.from('pg_proc').select('proname');
      if (!err2 && Array.isArray(procs)) names = procs.map((r) => r.proname);
    } else {
      names = data.map((r) => r.proname || r.name).filter(Boolean);
    }
    const exist = Object.fromEntries(fnNames.map(n => [n, names.some(x => x === n)]));
    results.push({ name: 'functions_exist', pass: fnNames.every(n => exist[n]), details: exist });
  } catch (e) {
    results.push({ name: 'functions_exist', pass: false, detail: String(e) });
  }

  return results;
}

async function main() {
  const { anon, service, url, anonKey, serviceRoleKey } = getSupabaseClients();
  const meta = {
    urlMasked: mask(url),
    anonKeyMasked: mask(anonKey),
    serviceRoleKeyMasked: mask(serviceRoleKey),
  };

  let checks = await runReadChecks(anon);
  if (checks.some(c => c.pass === false)) {
    const retry = await runReadChecks(service);
    // If retry with service has more passes, prefer it
    const passCountA = checks.filter(c => c.pass).length;
    const passCountB = retry.filter(c => c.pass).length;
    if (passCountB > passCountA) checks = retry;
  }

  const allPass = checks.every(c => c.pass);

  const mdLines = [
    '# QA Supabase',
    '',
    `- Fecha: ${new Date().toISOString()}`,
    `- URL: ${meta.urlMasked}`,
    '',
    '### Resultados',
    '',
    '| Check | Estado | Detalle |',
    '|-------|--------|---------|',
    ...checks.map(c => `| ${c.name} | ${c.pass ? 'PASS' : 'FAIL'} | ${c.detail || c.count || c.rows || JSON.stringify(c.details || {})} |`),
    '',
    `**Estado general**: ${allPass ? 'PASS' : 'FAIL'}`,
  ];

  const json = { generatedAt: new Date().toISOString(), meta, checks, allPass };

  const mdPath = 'reports/QA_SUPABASE.md';
  const jsonPath = 'reports/qa_supabase.json';
  await ensureDir(mdPath);
  await ensureDir(jsonPath);
  await writeFile(mdPath, mdLines.join('\n'), 'utf8');
  await writeFile(jsonPath, JSON.stringify(json, null, 2), 'utf8');

  if (!allPass) {
    console.error('QA Supabase failed. Suggested fixes:');
    console.error('- Verifica credenciales y roles de lectura (anon) y service role.');
    console.error('- Revisa existencia de tablas/vistas requeridas y permisos: buildings, units, v_filters_available.');
    console.error('- Verifica funciones en DB o crea stubs si no aplican.');
    process.exitCode = 1;
  } else {
    console.log('QA Supabase PASS');
  }
}

main().catch((err) => {
  console.error('qa-supabase failed:', err);
  process.exitCode = 1;
});


