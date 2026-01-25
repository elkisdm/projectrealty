import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const SITE = process.argv[2] || process.env.SITE || 'http://localhost:3000';

async function fetchOnce(url) {
  const res = await fetch(url, { redirect: 'manual' });
  const text = await res.text();
  return { ok: res.ok, status: res.status, headers: Object.fromEntries(res.headers), text };
}

async function fetchSafe(url) {
  try {
    // Pequeño delay para evitar problemas de timing
    await new Promise(resolve => setTimeout(resolve, 100));
    return await fetchOnce(url);
  } catch (error) {
    return { ok: false, status: 0, headers: {}, text: '', error: error?.message || String(error) };
  }
}

function pickHeader(headers, key) {
  const k = Object.keys(headers).find(h => h.toLowerCase() === key.toLowerCase());
  return k ? headers[k] : undefined;
}

function extractCanonical(html) {
  const m = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  return m?.[1];
}

function extractMeta(html, prop) {
  const re = new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i');
  return html.match(re)?.[1];
}

function extractWhatsApp(html) {
  const m = html.match(/https?:\/\/wa\.me\/[0-9]+/i);
  return m?.[0];
}

function extractSitemapLocs(xml) {
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map(m => m[1]);
  return locs;
}

function extractRobotsMeta(html) {
  const m = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);
  return m?.[1];
}

async function ensureDir(p) {
  await mkdir(dirname(p), { recursive: true });
}

function normalizeUrl(u) {
  try {
    const url = new URL(u);
    // Ensure trailing slash for root
    if (url.pathname === '') url.pathname = '/';
    return url.toString();
  } catch {
    return u;
  }
}

function summarize(results) {
  const total = results.checks.length;
  const passed = results.checks.filter(c => c.pass).length;
  const cacheDetail = results.checks.find(c => c.name === 'home-cache-header')?.detail || 'n/a';
  const canonicalHome = results.checks.find(c => c.name === 'home-canonical')?.detail || 'n/a';
  const locCount = results.checks.find(c => c.name === 'sitemap-has-home')?.count ?? 0;
  const propCount = results.checks.find(c => c.name === 'sitemap-has-property')?.count ?? 0;
  const propertyUrl = results.propertySample?.url || 'n/a';
  const robotsAllow = results.checks.find(c => c.name === 'robots-allow-root')?.pass ? 'sí' : 'no';
  
  // Coming Soon specific checks
  const comingSoonRedirect = results.checks.find(c => c.name === 'coming-soon-redirect')?.pass ? 'sí' : 'no';
  const comingSoonContent = results.checks.find(c => c.name === 'coming-soon-content')?.pass ? 'sí' : 'no';
  const comingSoonNoindex = results.checks.find(c => c.name === 'coming-soon-noindex')?.pass ? 'sí' : 'no';
  const robotsDisallow = results.checks.find(c => c.name === 'robots-disallow-root')?.pass ? 'sí' : 'no';

  const lines = [
    `- **site**: ${results.site}`,
    `- **estado**: ${passed}/${total} PASS`,
    `- **home**: 1º=${results.checks.find(c => c.name === 'home-200-first')?.status || 'n/a'}, 2º=${results.checks.find(c => c.name === 'home-200-second')?.status || 'n/a'}, cache=${cacheDetail}`,
    `- **canonical home**: ${canonicalHome}`,
    `- **sitemap**: urls=${locCount}, propiedades=${propCount}`,
    `- **muestra propiedad**: ${propertyUrl}`,
    `- **robots Allow /**: ${robotsAllow}`,
    `- **coming soon redirect**: ${comingSoonRedirect}`,
    `- **coming soon content**: ${comingSoonContent}`,
    `- **coming soon noindex**: ${comingSoonNoindex}`,
    `- **robots Disallow /**: ${robotsDisallow}`,
  ];
  return lines.join('\n');
}

async function writeReports(results) {
  const jsonPath = 'reports/verify.json';
  const mdPath = 'reports/VERIFY.md';
  await ensureDir(jsonPath);
  await ensureDir(mdPath);

  const resumen = summarize(results);

  const md = [
    `# Smoke Test`,
    ``,
    `- Fecha: ${new Date().toISOString()}`,
    `- Sitio: ${results.site}`,
    ``,
    `### Resumen`,
    resumen,
    ``,
    `### Detalles`,
    '```json',
    JSON.stringify(results, null, 2),
    '```'
  ].join('\n');

  await writeFile(jsonPath, JSON.stringify(results, null, 2), 'utf8');
  await writeFile(mdPath, md, 'utf8');
}

async function main() {
  const results = { site: SITE, checks: [], propertySample: {} };

  // 1) Home twice
  const home1 = await fetchSafe(`${SITE}/`);
  const home2 = await fetchSafe(`${SITE}/`);
  const cacheHeader = pickHeader(home2.headers || {}, 'x-vercel-cache');
  const canonicalHome = home2.ok ? extractCanonical(home2.text) : undefined;
  const cacheVerdict = cacheHeader ? (/(HIT|STALE)/i.test(cacheHeader) ? 'HIT' : 'MISS o sin header') : 'no header';

  results.checks.push(
    { name: 'home-200-first', pass: home1.ok && home1.status === 200, status: home1.status, error: home1.error },
    { name: 'home-200-second', pass: home2.ok && home2.status === 200, status: home2.status, error: home2.error },
    { name: 'home-cache-header', pass: !!cacheHeader, detail: cacheHeader || 'no header' },
    { name: 'home-cache-hit', pass: /HIT/i.test(cacheHeader || ''), detail: cacheVerdict },
    { name: 'home-canonical', pass: !!canonicalHome && canonicalHome.startsWith(SITE), detail: canonicalHome || 'not found' }
  );

  // 2) Coming Soon redirect check
  const locationHeader = pickHeader(home1.headers || {}, 'location');
  const isRedirect = home1.status >= 300 && home1.status < 400;
  const redirectsToComingSoon = locationHeader && locationHeader.includes('/coming-soon');
  
  results.checks.push(
    { name: 'coming-soon-redirect', pass: isRedirect && redirectsToComingSoon, status: home1.status, detail: locationHeader || 'no location header' }
  );

  // 3) Coming Soon page content check
  const comingSoon = await fetchSafe(`${SITE}/coming-soon`);
  const hasComingSoonContent = comingSoon.ok && (
    comingSoon.text.includes('Próximamente') || 
    comingSoon.text.includes('Muy pronto') ||
    comingSoon.text.includes('coming soon')
  );
  const robotsMeta = comingSoon.ok ? extractRobotsMeta(comingSoon.text) : undefined;
  const hasNoindex = robotsMeta && robotsMeta.toLowerCase().includes('noindex');
  
  results.checks.push(
    { name: 'coming-soon-200', pass: comingSoon.ok && comingSoon.status === 200, status: comingSoon.status, error: comingSoon.error },
    { name: 'coming-soon-content', pass: hasComingSoonContent, detail: hasComingSoonContent ? 'contains coming soon text' : 'missing coming soon text' },
    { name: 'coming-soon-noindex', pass: hasNoindex, detail: robotsMeta || 'no robots meta' }
  );

  // 4) Sitemap
  const sm = await fetchSafe(`${SITE}/sitemap.xml`);
  const locs = sm.ok ? extractSitemapLocs(sm.text) : [];
  const propertyUrls = locs.filter(u => /\/property\//.test(u));
  const normalizedHome = normalizeUrl(`${SITE}/`);
  const hasHome = locs.some(u => normalizeUrl(u) === normalizedHome);
  results.checks.push(
    { name: 'sitemap-200', pass: sm.ok && sm.status === 200, status: sm.status, error: sm.error },
    { name: 'sitemap-has-home', pass: hasHome, count: locs.length },
    { name: 'sitemap-has-property', pass: propertyUrls.length > 0, count: propertyUrls.length }
  );

  // 5) Property sample
  let propDetail = {};
  if (propertyUrls.length > 0) {
    const propertyUrl = propertyUrls[0];
    const prop = await fetchSafe(propertyUrl);
    const ogTitle = prop.ok ? extractMeta(prop.text, 'og:title') : undefined;
    const ogImage = prop.ok ? extractMeta(prop.text, 'og:image') : undefined;
    const canonicalProp = prop.ok ? extractCanonical(prop.text) : undefined;
    const wa = prop.ok ? extractWhatsApp(prop.text) : undefined;

    propDetail = {
      url: propertyUrl,
      status: prop.status,
      ogTitle,
      ogImage,
      canonical: canonicalProp,
      whatsapp: wa || null,
    };

    results.checks.push(
      { name: 'property-200', pass: prop.ok && prop.status === 200, status: prop.status, url: propertyUrl, error: prop.error },
      { name: 'property-og-title', pass: !!ogTitle, detail: ogTitle || 'not found' },
      { name: 'property-og-image', pass: !!ogImage, detail: ogImage || 'not found' },
      { name: 'property-canonical', pass: !!canonicalProp && canonicalProp.startsWith(SITE), detail: canonicalProp || 'not found' },
      { name: 'property-whatsapp', pass: !!wa, detail: wa || 'no encontrado (posible dinámico)' }
    );
  } else {
    results.checks.push({ name: 'property-sample-skipped', pass: false, detail: 'No hay URLs /property/ en sitemap' });
  }
  results.propertySample = propDetail;

  // 6) Robots
  const robots = await fetchSafe(`${SITE}/robots.txt`);
  const allowRoot = robots.ok ? /\bAllow:\s*\/$/im.test(robots.text) || /\bAllow:\s*\/\b/im.test(robots.text) : false;
  const disallowRoot = robots.ok ? /\bDisallow:\s*\/$/im.test(robots.text) || /\bDisallow:\s*\/\b/im.test(robots.text) : false;
  
  results.checks.push(
    { name: 'robots-200', pass: robots.ok && robots.status === 200, status: robots.status, error: robots.error },
    { name: 'robots-allow-root', pass: allowRoot, detail: allowRoot ? 'Allow: /' : 'No Allow: /' },
    { name: 'robots-disallow-root', pass: disallowRoot, detail: disallowRoot ? 'Disallow: /' : 'No Disallow: /' }
  );

  await writeReports(results);

  // Console summary
  console.log('--- Smoke Test Resumen ---');
  console.log(summarize(results));
  
  // Exit with error code if any checks failed
  const failedChecks = results.checks.filter(c => !c.pass);
  if (failedChecks.length > 0) {
    console.log('\n--- Failed Checks ---');
    failedChecks.forEach(check => {
      console.log(`❌ ${check.name}: ${check.detail || check.error || 'failed'}`);
    });
    process.exitCode = 1;
  } else {
    console.log('\n✅ All checks passed!');
  }
}

main().catch(async (err) => {
  const fallback = { site: SITE, checks: [{ name: 'fatal', pass: false, detail: String(err) }] };
  try {
    await writeReports(fallback);
  } catch {}
  console.error('Smoke test failed:', err);
  process.exitCode = 1;
});


