import { spawn } from 'node:child_process';
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

async function ensureDir(p) {
  await mkdir(dirname(p), { recursive: true });
}

function runCmd(cmd, args, opts = {}) {
  return new Promise((resolve) => {
    const start = Date.now();
    const child = spawn(cmd, args, { shell: false, stdio: ['ignore', 'pipe', 'pipe'], ...opts });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d.toString()));
    child.stderr.on('data', (d) => (stderr += d.toString()))
    child.on('close', (code) => {
      resolve({ code, stdout, stderr, ms: Date.now() - start });
    });
    child.on('error', (err) => {
      resolve({ code: 1, stdout, stderr: (stderr + '\n' + String(err)).trim(), ms: Date.now() - start });
    });
  });
}

function countWarnings(text) {
  const m = text.match(/\bwarning\b/gi);
  return m ? m.length : 0;
}

async function main() {
  const results = [];
  let warningsTotal = 0;

  // typecheck
  const typecheck = await runCmd('npx', ['tsc', '--noEmit']);
  warningsTotal += countWarnings(typecheck.stdout + '\n' + typecheck.stderr);
  results.push({ name: 'typecheck', pass: typecheck.code === 0, ms: typecheck.ms });
  if (typecheck.code !== 0) {
    await writeReport(results, warningsTotal);
    process.exitCode = 1;
    return;
  }

  // lint (if script exists)
  const lint = await runCmd('npm', ['run', '-s', 'lint']);
  const lintRan = !(lint.stderr.includes('Missing script: "lint"'));
  if (lintRan) {
    warningsTotal += countWarnings(lint.stdout + '\n' + lint.stderr);
    results.push({ name: 'lint', pass: lint.code === 0, ms: lint.ms });
    if (lint.code !== 0) {
      await writeReport(results, warningsTotal);
      process.exitCode = 1;
      return;
    }
  } else {
    results.push({ name: 'lint', pass: true, skipped: true, detail: 'no script' });
  }

  // tests
  const test = await runCmd('npm', ['test', '-s']);
  warningsTotal += countWarnings(test.stdout + '\n' + test.stderr);
  const testsSummary = extractJestSummary(test.stdout);
  results.push({ name: 'tests', pass: test.code === 0, ms: test.ms, summary: testsSummary });
  if (test.code !== 0) {
    await writeReport(results, warningsTotal);
    process.exitCode = 1;
    return;
  }

  // build
  const build = await runCmd('npm', ['run', '-s', 'build']);
  warningsTotal += countWarnings(build.stdout + '\n' + build.stderr);
  results.push({ name: 'build', pass: build.code === 0, ms: build.ms });
  if (build.code !== 0) {
    await writeReport(results, warningsTotal);
    process.exitCode = 1;
    return;
  }

  await writeReport(results, warningsTotal);
}

function extractJestSummary(out) {
  const line = out.split(/\r?\n/).reverse().find(l => /Tests?:/i.test(l));
  return line || '';
}

async function writeReport(results, warningsTotal) {
  const allPass = results.every(r => r.pass);
  const md = [
    '# QA Local',
    '',
    `- Fecha: ${new Date().toISOString()}`,
    '',
    '### Resultados',
    '',
    '| Check | Estado | Tiempo(ms) | Detalle |',
    '|-------|--------|------------|---------|',
    ...results.map(r => `| ${r.name} | ${r.pass ? 'PASS' : 'FAIL'} | ${r.ms ?? '-'} | ${r.summary || r.detail || ''} |`),
    '',
    `- Warnings totales: ${warningsTotal}`,
    '',
    `**Estado general**: ${allPass && warningsTotal === 0 ? 'PASS' : 'FAIL'}`,
  ].join('\n');

  const json = { generatedAt: new Date().toISOString(), results, warningsTotal, allPass: allPass && warningsTotal === 0 };
  const mdPath = 'reports/QA_LOCAL.md';
  const jsonPath = 'reports/qa_local.json';
  await ensureDir(mdPath);
  await ensureDir(jsonPath);
  await writeFile(mdPath, md, 'utf8');
  await writeFile(jsonPath, JSON.stringify(json, null, 2), 'utf8');

  if (!(allPass && warningsTotal === 0)) {
    console.error('QA Local failed. Suggested fixes:');
    for (const r of results) {
      if (!r.pass) console.error(`- Fix ${r.name} step (ver logs).`);
    }
    if (warningsTotal > 0) console.error('- Reduce warnings a 0 antes de release.');
  } else {
    console.log('QA Local PASS');
  }
}

main().catch((err) => {
  console.error('qa-local failed:', err);
  process.exitCode = 1;
});


