// Utility helpers for static audit tasks (Node 20, ESM)
// No external deps; safe file scanning, basic TS/TSX parsing, grep-like search, markdown writers

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';

export function getRepoRoot() {
  // Assume this script is run from repo root, but resolve safely
  try {
    const cwd = process.cwd();
    return cwd;
  } catch {
    return process.cwd();
  }
}

export function ensureDirSync(targetDirPath) {
  if (!fs.existsSync(targetDirPath)) {
    fs.mkdirSync(targetDirPath, { recursive: true });
  }
}

export function writeFileEnsuringDir(filePath, content) {
  ensureDirSync(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
}

export function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

export function getNowIso() {
  return new Date().toISOString();
}

const DEFAULT_IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'coverage',
  '.turbo',
  '.vercel',
]);

export function listFilesRecursive(rootDir, options = {}) {
  const {
    maxDepth = 99,
    includeExtensions = undefined, // e.g., ['.ts', '.tsx']
    ignoreDirs = DEFAULT_IGNORE_DIRS,
  } = options;

  const results = [];

  function walk(currentDir, depth) {
    if (depth > maxDepth) return;
    let dirents;
    try {
      dirents = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const dirent of dirents) {
      const name = dirent.name;
      if (name.startsWith('.DS_Store')) continue;
      const fullPath = path.join(currentDir, name);
      if (dirent.isDirectory()) {
        if (ignoreDirs && ignoreDirs.has(name)) continue;
        walk(fullPath, depth + 1);
      } else if (dirent.isFile()) {
        if (includeExtensions && !includeExtensions.some((ext) => name.endsWith(ext))) continue;
        results.push(fullPath);
      }
    }
  }

  walk(rootDir, 0);
  return results;
}

export function buildRepoTreeMarkdown(rootDir, levels = 3) {
  const ignoreDirs = new Set([...DEFAULT_IGNORE_DIRS]);
  const lines = ['````', rootDir];

  function walk(currentDir, depth) {
    if (depth > levels) return;
    let dirents;
    try {
      dirents = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }
    const entries = dirents
      .filter((d) => {
        if (d.name.startsWith('.')) return false;
        if (d.isDirectory() && ignoreDirs.has(d.name)) return false;
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    for (const d of entries) {
      const indent = '  '.repeat(depth + 1);
      const prefix = d.isDirectory() ? '📁' : '📄';
      lines.push(`${indent}${prefix} ${d.name}`);
      if (d.isDirectory()) {
        walk(path.join(currentDir, d.name), depth + 1);
      }
    }
  }

  walk(rootDir, 0);
  lines.push('````');
  return lines.join('\n');
}

export function readEnvFileIntoObject(filePath) {
  const env = {};
  const content = readFileSafe(filePath);
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx <= 0) return;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    env[key] = value;
  });
  return env;
}

export async function runCommandCapture(cmd, args = [], options = {}) {
  const maxBufferBytes = typeof options.maxBufferBytes === 'number' ? options.maxBufferBytes : 2 * 1024 * 1024; // 2MB per stream
  const logPath = options.logPath || null; // if provided, write full stream to file incrementally
  if (logPath) {
    ensureDirSync(path.dirname(logPath));
  }
  return new Promise((resolve) => {
    const child = spawn(cmd, args, {
      shell: false,
      env: options.env || process.env,
      cwd: options.cwd || process.cwd(),
    });
    let stdout = '';
    let stderr = '';
    let outBytes = 0;
    let errBytes = 0;
    const truncateNote = '\n[output truncated]\n';
    const maybeAppend = (current, chunk, bytes, isStdout) => {
      const str = String(chunk);
      if (logPath) {
        try { fs.appendFileSync(logPath, str); } catch {}
      }
      if (bytes >= maxBufferBytes) {
        return current; // already truncated
      }
      const remaining = maxBufferBytes - bytes;
      if (str.length <= remaining) {
        bytes += str.length;
        return [current + str, bytes];
      } else {
        bytes += remaining;
        return [current + str.slice(0, remaining) + truncateNote, bytes];
      }
    };
    child.stdout.on('data', (d) => {
      const res = maybeAppend(stdout, d, outBytes, true);
      if (Array.isArray(res)) { stdout = res[0]; outBytes = res[1]; }
    });
    child.stderr.on('data', (d) => {
      const res = maybeAppend(stderr, d, errBytes, false);
      if (Array.isArray(res)) { stderr = res[0]; errBytes = res[1]; }
    });
    child.on('close', (code) => resolve({ code, stdout, stderr, logPath }));
    child.on('error', () => resolve({ code: 1, stdout, stderr, logPath }));
  });
}

export function toMarkdownTable(headers, rows) {
  const head = `| ${headers.join(' | ')} |`;
  const sep = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map((r) => `| ${r.map((c) => String(c).replace(/\n/g, ' ')).join(' | ')} |`).join('\n');
  return [head, sep, body].join('\n');
}

export function detectUseClientDirective(fileContent) {
  // Detect 'use client' at the very top (allow BOM and whitespace/comments)
  const firstNonBlank = fileContent.split(/\r?\n/).find((l) => l.trim().length > 0) || '';
  return /['"]use client['"];?/.test(firstNonBlank.trim());
}

export function detectMetadataExports(fileContent) {
  return /export\s+const\s+metadata\s*=/.test(fileContent) || /export\s+async\s+function\s+generateMetadata\s*\(/.test(fileContent);
}

export function detectRevalidateOrDynamic(fileContent) {
  const hasRevalidate = /export\s+const\s+revalidate\s*=/.test(fileContent);
  const hasDynamic = /export\s+const\s+dynamic\s*=\s*['"][^'"]+['"]/i.test(fileContent);
  const fetchRevalidate = /fetch\s*\([^)]*\{[^}]*next\s*:\s*\{[^}]*revalidate\s*:\s*\d+[^}]*\}[^}]*\}[^)]*\)/s.test(fileContent);
  return { hasRevalidate, hasDynamic, fetchRevalidate };
}

export function safeGrep(rootDir, patterns = [], options = {}) {
  const {
    includeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.md', '.json'],
    maxFileSizeBytes = 1.5 * 1024 * 1024, // skip very large files to avoid OOM
    maxMatches = 10000,
  } = options;
  const files = listFilesRecursive(rootDir, { includeExtensions, maxDepth: 99 });
  const matches = [];
  outer: for (const f of files) {
    const rel = path.relative(rootDir, f);
    if (rel.startsWith('node_modules') || rel.startsWith('.next')) continue;
    let stat;
    try {
      stat = fs.statSync(f);
    } catch { continue; }
    if (stat.size > maxFileSizeBytes) continue;
    let content = '';
    try {
      content = fs.readFileSync(f, 'utf8');
    } catch {
      continue;
    }
    for (const p of patterns) {
      const regex = p instanceof RegExp ? new RegExp(p.source, p.flags.includes('g') ? p.flags : p.flags + 'g') : new RegExp(p, 'g');
      let m;
      while ((m = regex.exec(content))) {
        const start = Math.max(0, m.index - 80);
        const end = Math.min(content.length, m.index + 80);
        const snippet = content.slice(start, end).replace(/[\r\n]+/g, ' ');
        matches.push({ file: rel, index: m.index, pattern: String(p), snippet });
        if (matches.length >= maxMatches) break outer;
      }
    }
  }
  return matches;
}

export function summarizeCmdOutput(stdout, stderr) {
  const out = `${stdout}\n${stderr}`;
  const errorCount = (out.match(/\berror\b/gi) || []).length;
  const warningCount = (out.match(/\bwarning\b/gi) || []).length;
  const failCount = (out.match(/\bFAIL\b/gi) || []).length;
  const passCount = (out.match(/\bPASS\b/gi) || []).length;
  return { errorCount, warningCount, failCount, passCount };
}

export function formatPresentAbsentEnv(keys, envObj) {
  const rows = keys.map((k) => [k, envObj[k] ? 'present' : 'absent']);
  return toMarkdownTable(['Env Var', 'Status'], rows);
}

export function humanBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(1)} ${units[i]}`;
}

export function scanNextAppRoutes(appDir) {
  const files = listFilesRecursive(appDir, { includeExtensions: ['.tsx', '.ts'], maxDepth: 20 });
  const pages = files.filter((f) => /\/(page|layout|error|loading)\.tsx?$/.test(f));
  const byDir = new Map();
  for (const f of pages) {
    const dir = path.dirname(f);
    const base = path.basename(f);
    if (!byDir.has(dir)) byDir.set(dir, new Set());
    byDir.get(dir).add(base);
  }

  function segmentToRoute(segment) {
    // convert app subpath segments like (group), [id] to route path
    if (segment.startsWith('(') && segment.endsWith(')')) return '';
    return segment
      .replace(/%5B/g, '[')
      .replace(/%5D/g, ']')
      .replace(/\[\[\.\.\.\w+\]\]/g, ':splat?')
      .replace(/\[\.\.\.\w+\]/g, ':splat')
      .replace(/\[(\w+)\]/g, ':$1');
  }

  const routes = [];
  for (const [dir, set] of byDir.entries()) {
    const rel = path.relative(appDir, dir);
    const segments = rel.split(path.sep).filter(Boolean);
    const route = '/' + segments.map(segmentToRoute).filter(Boolean).join('/');
    const hasPage = set.has('page.tsx') || set.has('page.ts');
    const hasLayout = set.has('layout.tsx') || set.has('layout.ts');
    const hasError = set.has('error.tsx') || set.has('error.ts');
    const hasLoading = set.has('loading.tsx') || set.has('loading.ts');
    const fileForType = hasPage
      ? path.join(dir, hasPage === true ? 'page.tsx' : 'page.ts')
      : hasLayout
        ? path.join(dir, hasLayout === true ? 'layout.tsx' : 'layout.ts')
        : path.join(dir, [...set][0]);
    const fc = readFileSafe(fileForType);
    const isClient = detectUseClientDirective(fc);
    const hasMetadata = detectMetadataExports(fc);
    const { hasRevalidate, hasDynamic, fetchRevalidate } = detectRevalidateOrDynamic(fc);
    routes.push({
      route,
      dir: path.relative(getRepoRoot(), dir),
      type: isClient ? 'Client' : 'RSC',
      hasPage,
      hasLayout,
      hasError,
      hasLoading,
      hasMetadata,
      revalidate: hasRevalidate || fetchRevalidate ? 'Yes' : 'No',
      dynamic: hasDynamic ? 'Yes' : 'No',
    });
  }
  routes.sort((a, b) => a.route.localeCompare(b.route));
  return routes;
}

export function enumerateComponents(rootDir) {
  const files = listFilesRecursive(rootDir, { includeExtensions: ['.tsx'], maxDepth: 20 });
  return files.map((f) => {
    const content = readFileSafe(f);
    const isClient = detectUseClientDirective(content);
    const hasMetadata = detectMetadataExports(content);
    const usesWindowDocument = /\b(window|document)\b/.test(content);
    return {
      file: path.relative(getRepoRoot(), f),
      folder: path.relative(getRepoRoot(), path.dirname(f)),
      isClient,
      hasMetadata,
      usesWindowDocument,
    };
  });
}

export function filesLargestUnder(dir, max = 50) {
  const results = [];
  const files = listFilesRecursive(dir, { includeExtensions: undefined, maxDepth: 20 });
  for (const f of files) {
    try {
      const st = fs.statSync(f);
      if (st.isFile()) results.push({ file: path.relative(getRepoRoot(), f), size: st.size });
    } catch {}
  }
  results.sort((a, b) => b.size - a.size);
  return results.slice(0, max);
}

export function writeMarkdown(filePath, title, bodyLines = []) {
  const content = [
    `# ${title}`,
    '',
    `Generated at: ${getNowIso()}`,
    '',
    ...bodyLines,
    '',
  ].join('\n');
  writeFileEnsuringDir(filePath, content);
}

export function writeJson(filePath, obj) {
  writeFileEnsuringDir(filePath, JSON.stringify(obj, null, 2));
}

export function countRoutes(routes) {
  return routes.length;
}

export function extractAppDir(repoRoot) {
  const primary = path.join(repoRoot, 'app');
  if (fs.existsSync(primary)) return primary;
  // fallback: monorepo style not expected here, but attempt arriendo-zero/app
  const alt = path.join(repoRoot, 'arriendo-zero', 'app');
  if (fs.existsSync(alt)) return alt;
  return primary; // may not exist; callers should guard
}

export function redactSnippet(snippet) {
  // ensure we do not leak secrets; very naive: replace long tokens
  return snippet.replace(/[A-Za-z0-9_\-]{24,}/g, '[redacted]');
}


