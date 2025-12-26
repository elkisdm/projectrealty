import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

const REQUIRED_VARS = [
  { key: 'SUPABASE_URL', optional: false },
  { key: 'SUPABASE_SERVICE_ROLE_KEY', optional: false },
  { key: 'NEXT_PUBLIC_SITE_URL', optional: false },
  { key: 'NEXT_PUBLIC_GA_ID', optional: true },
];

function parseDotEnv(content) {
  const map = new Map();
  const lines = content.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    map.set(key, value);
  }
  return map;
}

async function loadDotEnvLocal() {
  const path = join(process.cwd(), '.env.local');
  if (!existsSync(path)) return new Map();
  try {
    const content = await readFile(path, 'utf8');
    return parseDotEnv(content);
  } catch {
    return new Map();
  }
}

function present(value) {
  return typeof value === 'string' && value.length > 0;
}

async function ensureDir(p) {
  await mkdir(dirname(p), { recursive: true });
}

async function main() {
  const envLocal = await loadDotEnvLocal();
  const rows = [];
  const json = {};

  for (const { key, optional } of REQUIRED_VARS) {
    const inProcess = process.env[key];
    const inFile = envLocal.get(key);
    const isPresent = present(inProcess) || present(inFile);
    rows.push({ key, present: isPresent ? 'present' : 'absent', optional: optional ? 'yes' : 'no', source: present(inProcess) ? 'env' : (present(inFile) ? '.env.local' : '-') });
    json[key] = { present: isPresent, optional, source: present(inProcess) ? 'env' : (present(inFile) ? '.env.local' : null) };
  }

  const mdLines = [
    '# QA Entorno',
    '',
    `- Fecha: ${new Date().toISOString()}`,
    '',
    '### Variables requeridas',
    '',
    '| Variable | Presencia | Opcional | Origen |',
    '|---------|-----------|----------|--------|',
    ...rows.map(r => `| ${r.key} | ${r.present} | ${r.optional} | ${r.source} |`),
    '',
    '_Nota: valores no mostrados por seguridad._',
  ];

  const mdPath = 'reports/QA_ENV.md';
  const jsonPath = 'reports/qa_env.json';
  await ensureDir(mdPath);
  await ensureDir(jsonPath);
  await writeFile(mdPath, mdLines.join('\n'), 'utf8');
  await writeFile(jsonPath, JSON.stringify({ generatedAt: new Date().toISOString(), vars: json }, null, 2), 'utf8');

  // Console table for quick view
  console.log('| Variable | Presencia | Opcional | Origen |');
  console.log('|---------|-----------|----------|--------|');
  for (const r of rows) console.log(`| ${r.key} | ${r.present} | ${r.optional} | ${r.source} |`);
}

main().catch((err) => {
  console.error('qa-env failed:', err);
  process.exitCode = 1;
});


