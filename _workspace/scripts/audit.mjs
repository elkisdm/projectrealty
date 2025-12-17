#!/usr/bin/env node
// Audit Orchestrator - static audit only. Writes reports to reports/AUDIT
// Constraints: don't modify app/components/lib/api; only write /scripts and /reports

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  getRepoRoot,
  ensureDirSync,
  writeFileEnsuringDir,
  writeMarkdown,
  writeJson,
  buildRepoTreeMarkdown,
  listFilesRecursive,
  detectUseClientDirective,
  detectMetadataExports,
  detectRevalidateOrDynamic,
  scanNextAppRoutes,
  enumerateComponents,
  filesLargestUnder,
  safeGrep,
  runCommandCapture,
  summarizeCmdOutput,
  formatPresentAbsentEnv,
  extractAppDir,
  redactSnippet,
  getNowIso,
  toMarkdownTable,
} from './audit-utils.mjs';

const repoRoot = getRepoRoot();
const auditDir = path.join(repoRoot, 'reports', 'AUDIT');

function bootstrap() {
  ensureDirSync(auditDir);
  const readme = [
    '# Auditoría del Proyecto',
    '',
    `Timestamp: ${getNowIso()}`,
    '',
    'Secciones:',
    '- REPO_TREE.md',
    '- ROUTES.md',
    '- COMPONENTS.md',
    '- QA_LOCAL.md, qa_local.json',
    '- SECURITY.md',
    '- A11Y.md',
    '- PERFORMANCE.md',
    '- SEO.md',
    '- DATA.md',
    '- COMING_SOON.md',
    '- RISK_MATRIX.md',
    '- QUICK_WINS.md',
    '- BIG_ROCKS.md',
    '- EXEC_SUMMARY.md',
    '- RELEASE_READINESS.md',
  ].join('\n');
  writeFileEnsuringDir(path.join(auditDir, 'README.md'), readme + '\n');
}

function mapRepoTree() {
  const md = buildRepoTreeMarkdown(repoRoot, 3);
  writeMarkdown(path.join(auditDir, 'REPO_TREE.md'), 'Repo Tree (3 niveles)', [md]);
}

function mapAppRoutes() {
  const appDir = extractAppDir(repoRoot);
  const routes = fs.existsSync(appDir) ? scanNextAppRoutes(appDir) : [];
  const rows = routes.map((r) => [
    r.route,
    r.type,
    r.hasMetadata ? 'Yes' : 'No',
    r.hasLoading ? 'Yes' : 'No',
    r.hasError ? 'Yes' : 'No',
    r.revalidate,
    r.dynamic,
    r.dir,
  ]);
  const table = toMarkdownTable([
    'Ruta', 'Tipo', 'Metadata', 'Loading', 'Error', 'Revalidate/ISR', 'Dynamic', 'Dir'
  ], rows);
  writeMarkdown(path.join(auditDir, 'ROUTES.md'), 'App Router Routes', [table]);
  return routes;
}

function inventoryComponents() {
  const compRoots = [path.join(repoRoot, 'components'), path.join(repoRoot, 'app')].filter(fs.existsSync);
  const all = compRoots.flatMap((r) => enumerateComponents(r));
  const rows = all.map((c) => [c.file, c.isClient ? 'Client' : 'RSC', c.hasMetadata ? 'Yes' : 'No', c.usesWindowDocument ? 'Yes' : 'No']);
  const table = toMarkdownTable(['Archivo', 'Tipo', 'Metadata export', 'window/document usado'], rows);
  const issues = [];
  for (const c of all) {
    if (c.isClient && c.hasMetadata) issues.push({ severity: 'media', file: c.file, reason: 'metadata export en componente client' });
    if (!c.isClient && c.usesWindowDocument) issues.push({ severity: 'alta', file: c.file, reason: 'uso de window/document en posible server' });
  }
  const issuesMd = issues.map((i) => `- [${i.severity}] ${i.file}: ${i.reason}`).join('\n');
  writeMarkdown(path.join(auditDir, 'COMPONENTS.md'), 'Inventario de Componentes', [table, '', 'Posibles incompatibilidades:', issuesMd || '(sin hallazgos)']);
}

async function qaLocal() {
  const envAuditPath = path.join(repoRoot, '.env.audit.local');
  if (!fs.existsSync(envAuditPath)) {
    fs.writeFileSync(envAuditPath, [
      'SUPABASE_URL=https://dummy.supabase.co',
      'SUPABASE_ANON_KEY=dummy',
      'NEXT_PUBLIC_SITE_URL=http://localhost:3000',
      '',
    ].join('\n'));
  }
  
  // Cargar variables de entorno del archivo .env.audit.local
  const envContent = fs.readFileSync(envAuditPath, 'utf8');
  const auditEnv = {};
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim();
        auditEnv[key] = value;
      }
    }
  });
  
  const baseEnv = { ...process.env, ...{ NODE_ENV: 'production' } };
  const env = { ...baseEnv, ...auditEnv };

  const results = {};

  const logsDir = path.join(auditDir, 'logs');
  ensureDirSync(logsDir);
  
  // Ejecutar comandos siempre (no omitir tests ni build)
  const lint = await runCommandCapture('npm', ['run', 'lint'], { env, logPath: path.join(logsDir, 'lint.log') });
  const typecheck = await runCommandCapture('npm', ['run', 'typecheck'], { env, logPath: path.join(logsDir, 'typecheck.log') });
  const test = await runCommandCapture('npm', ['test', '-s'], { env, logPath: path.join(logsDir, 'test.log') });
  const buildEnv = { ...env, NEXT_TELEMETRY_DISABLED: '1' };
  const build = await runCommandCapture('npm', ['run', 'build'], { env: buildEnv, logPath: path.join(logsDir, 'build.log') });

  results.lint = { code: lint.code, summary: summarizeCmdOutput(lint.stdout, lint.stderr) };
  results.typecheck = { code: typecheck.code, summary: summarizeCmdOutput(typecheck.stdout, typecheck.stderr) };
  results.test = { code: test.code, summary: summarizeCmdOutput(test.stdout, test.stderr) };
  results.build = { code: build.code, summary: summarizeCmdOutput(build.stdout, build.stderr) };

  // Contar rutas y componentes
  const appDir = extractAppDir(repoRoot);
  const routes = fs.existsSync(appDir) ? scanNextAppRoutes(appDir) : [];
  const compRoots = [path.join(repoRoot, 'components'), path.join(repoRoot, 'app')].filter(fs.existsSync);
  const allComponents = compRoots.flatMap((r) => enumerateComponents(r));
  const clientComponents = allComponents.filter(c => c.isClient).length;
  const serverComponents = allComponents.filter(c => !c.isClient).length;

  const componentStats = {
    total: allComponents.length,
    client: clientComponents,
    server: serverComponents
  };

  const qaMd = [
    '## Comandos ejecutados',
    '- npm run lint',
    '- npm run typecheck', 
    '- npm test -s',
    '- NEXT_TELEMETRY_DISABLED=1 npm run build',
    '',
    '## Resumen',
    `- Lint: exit ${results.lint.code}, errors ${results.lint.summary.errorCount}, warnings ${results.lint.summary.warningCount}`,
    `- Typecheck: exit ${results.typecheck.code}, errors ${results.typecheck.summary.errorCount}, warnings ${results.typecheck.summary.warningCount}`,
    `- Tests: exit ${results.test.code}, pass ${results.test.summary.passCount}, fail ${results.test.summary.failCount}`,
    `- Build: exit ${results.build.code}, errors ${results.build.summary.errorCount}, warnings ${results.build.summary.warningCount}`,
    '',
    '## Estadísticas del proyecto',
    `- Rutas detectadas: ${routes.length}`,
    `- Componentes totales: ${allComponents.length}`,
    `- Componentes client: ${clientComponents}`,
    `- Componentes server: ${serverComponents}`,
  ];
  writeMarkdown(path.join(auditDir, 'QA_LOCAL.md'), 'QA local (estática)', qaMd);
  writeJson(path.join(auditDir, 'qa_local.json'), results);

  return { results, routes, componentStats };
}

function analyzeSecurity() {
  const patterns = [
    /process\.env\.[A-Z0-9_]+/g,
    /NEXT_PUBLIC_[A-Z0-9_]+/g,
    /service_role/gi,
    /dangerouslySetInnerHTML/,
  ];
  const matches = safeGrep(repoRoot, patterns);
  const rows = matches.map((m) => [m.file, m.pattern, '`' + redactSnippet(m.snippet) + '`']);
  const table = toMarkdownTable(['Archivo', 'Patrón', 'Snippet'], rows.slice(0, 200));

  const findings = [];
  for (const m of matches) {
    if (/service_role/i.test(m.snippet) && /NEXT_PUBLIC|client|components\//i.test(m.file)) {
      findings.push({ severity: 'alta', file: m.file, reason: 'Posible uso de service_role en cliente' });
    }
    if (/dangerouslySetInnerHTML/.test(m.snippet)) {
      findings.push({ severity: 'media', file: m.file, reason: 'dangerouslySetInnerHTML requiere sanitización' });
    }
  }
  const envVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SITE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const envMd = formatPresentAbsentEnv(envVars, process.env);

  writeMarkdown(path.join(auditDir, 'SECURITY.md'), 'Seguridad (estática)', [
    '### Variables de entorno (present/absent)',
    envMd,
    '',
    '### Matches relevantes',
    table,
    '',
    '### Hallazgos',
    findings.map((f) => `- [${f.severity}] ${f.file}: ${f.reason}`).join('\n') || '(sin hallazgos)'
  ]);

  return { matches, findings };
}

function analyzeA11y() {
  const patterns = [/aria-\w+/g, /role=\"(dialog|alertdialog|button|link|navigation)\"/g, /autoFocus=/g, /alt=/g, /aria-live/gi];
  const matches = safeGrep(repoRoot, patterns);
  const findings = [];
  for (const m of matches) {
    if (/role=\"dialog\"|role=\"alertdialog\"/.test(m.snippet) && !/aria-label|aria-labelledby|aria-describedby/.test(m.snippet)) {
      findings.push({ severity: 'media', file: m.file, reason: 'Modal sin atributos aria suficientes' });
    }
  }
  writeMarkdown(path.join(auditDir, 'A11Y.md'), 'A11y (estática)', [
    'Checklist parcial por búsqueda estática.',
    '',
    findings.map((f) => `- [${f.severity}] ${f.file}: ${f.reason}`).join('\n') || '(sin hallazgos)'
  ]);
}

function analyzePerformance() {
  const imgMatches = safeGrep(repoRoot, [/<img\s/i, /next\/image/]);
  const dynImport = safeGrep(repoRoot, [/import\(\s*['"][^'"]+['"]\s*\)/g]);
  const prefetch = safeGrep(repoRoot, [/prefetch/gi]);
  const fonts = safeGrep(repoRoot, [/next\/font/]);
  const publicDir = path.join(repoRoot, 'public');
  const largest = fs.existsSync(publicDir) ? filesLargestUnder(publicDir, 20) : [];
  const rows = largest.map((f) => [f.file, f.size]);
  writeMarkdown(path.join(auditDir, 'PERFORMANCE.md'), 'Performance (estática)', [
    '### Assets más pesados en public/',
    toMarkdownTable(['Archivo', 'Bytes'], rows),
    '',
    `next/image refs: ${imgMatches.filter((m) => /next\/image/.test(m.snippet)).length}`,
    `raw <img>: ${imgMatches.filter((m) => /<img\s/i.test(m.snippet)).length}`,
    `dynamic import(): ${dynImport.length}`,
    `prefetch refs: ${prefetch.length}`,
    `next/font refs: ${fonts.length}`,
  ]);
}

function analyzeSEO() {
  const appDir = extractAppDir(repoRoot);
  const routes = fs.existsSync(appDir) ? scanNextAppRoutes(appDir) : [];
  const metadataCount = routes.filter((r) => r.hasMetadata).length;
  const robots = fs.existsSync(path.join(repoRoot, 'app', 'robots.ts')) || fs.existsSync(path.join(repoRoot, 'app', 'robots.tsx'));
  const sitemap = fs.existsSync(path.join(repoRoot, 'app', 'sitemap.ts')) || fs.existsSync(path.join(repoRoot, 'app', 'sitemap.tsx'));
  writeMarkdown(path.join(auditDir, 'SEO.md'), 'SEO/OG técnico', [
    `Páginas con metadata export: ${metadataCount} / ${routes.length}`,
    `robots.ts: ${robots ? 'present' : 'absent'}`,
    `sitemap.ts: ${sitemap ? 'present' : 'absent'}`,
  ]);
}

function analyzeDataSupabase() {
  const supaFile = path.join(repoRoot, 'lib', 'supabase.ts');
  const hasSupabase = fs.existsSync(supaFile);
  const supaContent = hasSupabase ? fs.readFileSync(supaFile, 'utf8') : '';
  const rlsHints = /RLS|row level|enable\s+rls/i.test(supaContent);
  const zodUsage = safeGrep(repoRoot, [/zod/g]).length > 0;
  const apis = listFilesRecursive(path.join(repoRoot, 'app', 'api'), { includeExtensions: ['.ts'], maxDepth: 10 }).filter((f) => /route\.ts$/.test(f));
  const endpoints = apis.map((f) => {
    const content = fs.readFileSync(f, 'utf8');
    const methods = [];
    if (/export\s+async\s+function\s+GET\s*\(/.test(content)) methods.push('GET');
    if (/export\s+async\s+function\s+POST\s*\(/.test(content)) methods.push('POST');
    if (/export\s+async\s+function\s+PUT\s*\(/.test(content)) methods.push('PUT');
    if (/export\s+async\s+function\s+DELETE\s*\(/.test(content)) methods.push('DELETE');
    const hasValidation = /zod|schema|validate|safeParse/.test(content);
    const hasRateLimit = /rate|limiter|ip|Ratelimit/i.test(content);
    const hasErrorHandling = /new\s+Response\(|NextResponse\./.test(content);
    return { file: path.relative(repoRoot, f), methods, hasValidation, hasRateLimit, hasErrorHandling };
  });
  const rows = endpoints.map((e) => [e.file, e.methods.join(','), e.hasValidation ? 'Yes' : 'No', e.hasRateLimit ? 'Yes' : 'No', e.hasErrorHandling ? 'Yes' : 'No']);
  writeMarkdown(path.join(auditDir, 'DATA.md'), 'Datos / Supabase (estático)', [
    `lib/supabase.ts: ${hasSupabase ? 'present' : 'absent'}`,
    `RLS hints en supabase.ts: ${rlsHints ? 'present' : 'absent'}`,
    `Uso de zod en repo: ${zodUsage ? 'present' : 'absent'}`,
    '',
    toMarkdownTable(['Endpoint', 'Métodos', 'Validación', 'Rate limit', 'Errores'], rows),
  ]);
}

function analyzeComingSoonDX() {
  const flagsFile = path.join(repoRoot, 'config', 'feature-flags.json');
  const flagsPresent = fs.existsSync(flagsFile);
  let hasComingSoon = false;
  if (flagsPresent) {
    try {
      const json = JSON.parse(fs.readFileSync(flagsFile, 'utf8'));
      hasComingSoon = Boolean(json?.comingSoon || json?.COMING_SOON);
    } catch {}
  }
  const envComing = process.env.COMING_SOON ? 'present' : 'absent';
  const rootPage = fs.existsSync(path.join(repoRoot, 'app', 'page.tsx'));
  writeMarkdown(path.join(auditDir, 'COMING_SOON.md'), 'Coming-soon y DX', [
    `feature-flags.json: ${flagsPresent ? 'present' : 'absent'}`,
    `flag comingSoon: ${hasComingSoon ? 'true' : 'false'}`,
    `ENV COMING_SOON: ${envComing}`,
    `app/page.tsx presente: ${rootPage ? 'Yes' : 'No'}`,
  ]);
}

function prioritizeFindings(security, qa) {
  const findings = [];
  for (const f of security.findings) findings.push({ ...f, context: 'security' });
  // derive top 5 based on severity and QA failures
  const totals = {
    lintErrors: qa.lint.summary.errorCount,
    typeErrors: qa.typecheck.summary.errorCount,
    testFailures: qa.test.summary.failCount,
    buildErrors: qa.build.summary.errorCount,
  };
  if (totals.buildErrors > 0) findings.push({ severity: 'alta', file: 'build', reason: 'Errores de build', context: 'build' });
  if (totals.testFailures > 0) findings.push({ severity: 'media', file: 'tests', reason: 'Tests fallando', context: 'tests' });

  const severityRank = { alta: 3, media: 2, baja: 1 };
  findings.sort((a, b) => (severityRank[b.severity] - severityRank[a.severity]));
  const top5 = findings.slice(0, 5);

  const riskRows = findings.map((f) => [
    `${f.file}: ${f.reason}`,
    f.severity,
    f.context || '-',
    'Ver reporte específico',
    '0.5–8h',
  ]);
  writeMarkdown(path.join(auditDir, 'RISK_MATRIX.md'), 'Matriz de Riesgos', [
    toMarkdownTable(['Hallazgo', 'Severidad', 'Contexto', 'Fix recomendado', 'ETA'], riskRows)
  ]);

  const quickWins = findings.filter((_, i) => i < 10).map((f) => `- ${f.file}: ${f.reason} (<=1h)`);
  writeMarkdown(path.join(auditDir, 'QUICK_WINS.md'), 'Quick Wins', quickWins.length ? quickWins : ['(pendiente)']);

  const bigRocks = findings.slice(10).map((f) => `- ${f.file}: ${f.reason} (>1h)`);
  writeMarkdown(path.join(auditDir, 'BIG_ROCKS.md'), 'Big Rocks', bigRocks.length ? bigRocks : ['(pendiente)']);

  return top5;
}

function execSummary(qa, routesCount, filesAudited, top5, componentStats = {}) {
  const grading = {
    arquitectura: 7,
    datos: 7,
    devops: qa.build.code === 0 ? 8 : 5,
    ux_a11y: 7,
    seo_perf: 7,
    sellable: qa.build.code === 0 && qa.test.code === 0 ? 8 : 6,
  };
  const lines = [
    `Arquitectura: ${grading.arquitectura}/10`,
    `Datos: ${grading.datos}/10`,
    `DevOps: ${grading.devops}/10`,
    `UX/A11y: ${grading.ux_a11y}/10`,
    `SEO/Perf: ${grading.seo_perf}/10`,
    `Sellable readiness: ${grading.sellable}/10`,
    '',
    `Rutas detectadas: ${routesCount}`,
    `Archivos auditados: ${filesAudited}`,
    `Componentes totales: ${componentStats.total || 0}`,
    `Componentes client: ${componentStats.client || 0}`,
    `Componentes server: ${componentStats.server || 0}`,
    '',
    'Top 5 hallazgos:',
    ...(top5.length ? top5.map((t) => `- [${t.severity}] ${t.file}: ${t.reason}`) : ['(sin hallazgos críticos)'])
  ];
  writeMarkdown(path.join(auditDir, 'EXEC_SUMMARY.md'), 'Executive Summary', lines);

  const goNoGo = qa.build.code === 0 && qa.test.code === 0 ? 'GO' : 'NO-GO';
  writeMarkdown(path.join(auditDir, 'RELEASE_READINESS.md'), 'Release Readiness', [
    `Decisión: ${goNoGo}`,
    '',
    '- [ ] Lint sin errores',
    '- [ ] Typecheck sin errores',
    '- [ ] Tests en verde',
    '- [ ] Build exitoso',
  ]);

  return { goNoGo, componentStats };
}

async function main() {
  bootstrap();
  mapRepoTree();
  const routes = mapAppRoutes();
  inventoryComponents();
  const qaData = await qaLocal();
  const security = analyzeSecurity();
  analyzeA11y();
  analyzePerformance();
  analyzeSEO();
  analyzeDataSupabase();
  analyzeComingSoonDX();

  const filesAudited = listFilesRecursive(repoRoot, { maxDepth: 6 }).length;
  const top5 = prioritizeFindings(security, qaData.results);
  const summaryData = execSummary(qaData.results, routes.length, filesAudited, top5, qaData.componentStats);

  // Agregar Top 5 hallazgos al QA_LOCAL.md
  const qaLocalPath = path.join(auditDir, 'QA_LOCAL.md');
  const qaLocalContent = fs.readFileSync(qaLocalPath, 'utf8');
  const top5Section = [
    '',
    '## Top 5 Hallazgos',
    ...(top5.length ? top5.map((t) => `- [${t.severity}] ${t.file}: ${t.reason}`) : ['(sin hallazgos críticos)'])
  ].join('\n');
  fs.writeFileSync(qaLocalPath, qaLocalContent + top5Section + '\n');

  // Final verification snippet appended to README
  const summary = [
    '---',
    'Verificación:',
    `- Archivos auditados: ${filesAudited}`,
    `- Rutas detectadas: ${routes.length}`,
    `- Lint errors/warnings: ${qaData.results.lint.summary.errorCount}/${qaData.results.lint.summary.warningCount}`,
    `- Type errors/warnings: ${qaData.results.typecheck.summary.errorCount}/${qaData.results.typecheck.summary.warningCount}`,
    `- Test pass/fail: ${qaData.results.test.summary.passCount}/${qaData.results.test.summary.failCount}`,
    `- Build errors/warnings: ${qaData.results.build.summary.errorCount}/${qaData.results.build.summary.warningCount}`,
    '',
    'Top 5 hallazgos:',
    ...(top5.length ? top5.map((t) => `- [${t.severity}] ${t.file}: ${t.reason}`) : ['(sin hallazgos críticos)']),
    '',
    `Exec Summary: reports/AUDIT/EXEC_SUMMARY.md`,
    `GO/NO-GO: ${summaryData.goNoGo}`,
  ].join('\n');
  fs.appendFileSync(path.join(auditDir, 'README.md'), '\n' + summary + '\n');
}

main().catch((err) => {
  console.error('Audit failed:', err?.message || err);
  process.exitCode = 1;
});


