import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

async function ensureDir(p) {
  await mkdir(dirname(p), { recursive: true });
}

async function readJsonSafe(p, fallback) {
  try {
    const s = await readFile(p, 'utf8');
    return JSON.parse(s);
  } catch {
    return fallback;
  }
}

async function readMdSafe(p) {
  try {
    return await readFile(p, 'utf8');
  } catch {
    return '';
  }
}

function parseEnvPresence(md) {
  const lines = md.split(/\r?\n/);
  const map = {};
  for (const l of lines) {
    const m = l.match(/^\|\s*(\w+)\s*\|\s*(present|absent)\s*\|/i);
    if (m) map[m[1]] = m[2] === 'present';
  }
  return map;
}

function pickSummaryFromSmoke(md) {
  const idx = md.indexOf('### Resumen');
  if (idx === -1) return '';
  return md.slice(idx).split('\n').slice(1, 10).join('\n').trim();
}

async function main() {
  const envMd = await readMdSafe('reports/QA_ENV.md');
  const local = await readJsonSafe('reports/qa_local.json', { allPass: false, warningsTotal: 999 });
  const supabase = await readJsonSafe('reports/qa_supabase.json', { allPass: false });
  const schema = await readJsonSafe('reports/schema_audit.json', { allPass: false });
  const smokeMd = await readMdSafe('reports/VERIFY.md');

  const envPresence = parseEnvPresence(envMd);
  const envPass = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'NEXT_PUBLIC_SITE_URL'].every(k => !!envPresence[k]);
  const smokeSummary = pickSummaryFromSmoke(smokeMd);

  const allPass = Boolean(envPass && local.allPass && supabase.allPass && schema.allPass && /\bPASS\b/.test(smokeMd));

  const mdLines = [
    '# Release Checks',
    '',
    '### Resumen',
    '',
    `- **ENV**: ${envPass ? 'PASS' : 'FAIL'} (requeridas presentes)` ,
    `- **QA_LOCAL**: ${local.allPass ? 'PASS' : 'FAIL'} (warnings=${local.warningsTotal ?? 'n/a'})`,
    `- **QA_SUPABASE**: ${supabase.allPass ? 'PASS' : 'FAIL'}`,
    `- **VERIFY (smoke)**: ${/\bPASS\b/.test(smokeMd) ? 'PASS' : 'FAIL'}`,
    `- **SCHEMA_AUDIT**: ${schema.allPass ? 'PASS' : 'FAIL'}`,
    '',
    `**GO/NO-GO**: ${allPass ? 'GO' : 'NO-GO'}`,
    '',
    '### Detalles Smoke',
    smokeSummary || '(sin resumen)'
  ];

  const mdPath = 'reports/RELEASE_CHECKS.md';
  await ensureDir(mdPath);
  await writeFile(mdPath, mdLines.join('\n'), 'utf8');
}

main().catch((err) => {
  console.error('release-checks failed:', err);
  process.exitCode = 1;
});


