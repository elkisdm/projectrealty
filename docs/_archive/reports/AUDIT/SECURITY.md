# Seguridad (estática)

Generated at: 2025-08-12T00:46:21.228Z

### Variables de entorno (present/absent)
| Env Var | Status |
| --- | --- |
| SUPABASE_URL | absent |
| SUPABASE_ANON_KEY | absent |
| NEXT_PUBLIC_SITE_URL | absent |
| SUPABASE_SERVICE_ROLE_KEY | absent |

### Matches relevantes
| Archivo | Patrón | Snippet |
| --- | --- | --- |
| PULL_REQUEST.md | /service_role/gi | `SE=true SUPABASE_URL=your_supabase_url SUPABASE_ANON_KEY=your_anon_key [redacted]=your_service_role_key ``` ### 2. Ejecutar Migración ```bash no` |
| PULL_REQUEST.md | /service_role/gi | `our_supabase_url SUPABASE_ANON_KEY=your_anon_key [redacted]=your_service_role_key ``` ### 2. Ejecutar Migración ```bash node scripts/migrate-csv` |
| README.md | /process\.env\.[A-Z0-9_]+/g | `Con comingSoon: false → 200 OK (landing real) ``` **Nota:** El sistema ignora `process.env.COMING_SOON` para mantener consistencia en deploy por commit & push.` |
| README.md | /service_role/gi | `ías. ### Script de ingesta Variables requeridas: - `SUPABASE_URL` - `[redacted]` Instala y ejecuta: ```bash pnpm add @supabase/supabase-js pnp` |
| app/(catalog)/property/[slug]/page.tsx | /process\.env\.[A-Z0-9_]+/g | `g, 3);   // Build JSON-LD (Schema.org) for this property   const baseUrl =     process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "http://localhost:30` |
| app/(catalog)/property/[slug]/page.tsx | /process\.env\.[A-Z0-9_]+/g | `rg) for this property   const baseUrl =     process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "http://localhost:3000";   const canonicalUrl = `${baseU` |
| app/(catalog)/property/[slug]/page.tsx | /NEXT_PUBLIC_[A-Z0-9_]+/g | ` Build JSON-LD (Schema.org) for this property   const baseUrl =     process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "http://localhost:3000";   const` |
| app/api/debug/route.ts | /process\.env\.[A-Z0-9_]+/g | ` llamado");          // Verificar variables de entorno     const USE_SUPABASE = process.env.USE_SUPABASE === "true";          // Intentar consulta directa a Sup` |
| app/api/waitlist/route.ts | /process\.env\.[A-Z0-9_]+/g | `ente Supabase (usando service role key para bypass RLS)     const supabaseUrl = process.env.SUPABASE_URL;     const supabaseServiceKey = process.env.SUPABASE_SE` |
| app/api/waitlist/route.ts | /process\.env\.[A-Z0-9_]+/g | `   const supabaseUrl = process.env.SUPABASE_URL;     const supabaseServiceKey = process.env.[redacted];          if (!supabaseUrl || !supabaseSer` |
| app/api/waitlist/route.ts | /service_role/gi | `= process.env.SUPABASE_URL;     const supabaseServiceKey = process.env.[redacted];          if (!supabaseUrl || !supabaseServiceKey) {       cons` |
| app/propiedad/[id]/page.tsx | /process\.env\.[A-Z0-9_]+/g | `ow.location.href : undefined }) : "";               const canWhatsApp = Boolean(process.env.[redacted]) && Boolean(href);               return c` |
| app/propiedad/[id]/page.tsx | /NEXT_PUBLIC_[A-Z0-9_]+/g | `href : undefined }) : "";               const canWhatsApp = Boolean(process.env.[redacted]) && Boolean(href);               return canWhatsApp ?` |
| app/sitemap 2.ts | /process\.env\.[A-Z0-9_]+/g | `ync function sitemap(): Promise<MetadataRoute.Sitemap> {   const base = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");   const buildings ` |
| app/sitemap 2.ts | /NEXT_PUBLIC_[A-Z0-9_]+/g | ` sitemap(): Promise<MetadataRoute.Sitemap> {   const base = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");   const buildings = await getA` |
| app/sitemap.ts | /process\.env\.[A-Z0-9_]+/g | `ync function sitemap(): Promise<MetadataRoute.Sitemap> {   const base = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");   const buildings ` |
| app/sitemap.ts | /NEXT_PUBLIC_[A-Z0-9_]+/g | ` sitemap(): Promise<MetadataRoute.Sitemap> {   const base = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");   const buildings = await getA` |
| components/StickyMobileCTA.tsx | /process\.env\.[A-Z0-9_]+/g | `        aria-label="Contactar por WhatsApp"             aria-disabled={!Boolean(process.env.[redacted])}             disabled={!Boolean(process.` |
| components/StickyMobileCTA.tsx | /process\.env\.[A-Z0-9_]+/g | `Boolean(process.env.[redacted])}             disabled={!Boolean(process.env.[redacted])}             title={!Boolean(process.env` |
| components/StickyMobileCTA.tsx | /process\.env\.[A-Z0-9_]+/g | `={!Boolean(process.env.[redacted])}             title={!Boolean(process.env.[redacted]) ? "Pronto disponible" : undefined}      ` |
| components/StickyMobileCTA.tsx | /NEXT_PUBLIC_[A-Z0-9_]+/g | `-label="Contactar por WhatsApp"             aria-disabled={!Boolean(process.env.[redacted])}             disabled={!Boolean(process.env.NEXT_PUB` |
| components/StickyMobileCTA.tsx | /NEXT_PUBLIC_[A-Z0-9_]+/g | `ess.env.[redacted])}             disabled={!Boolean(process.env.[redacted])}             title={!Boolean(process.env.NEXT_PUBLIC` |
| components/StickyMobileCTA.tsx | /NEXT_PUBLIC_[A-Z0-9_]+/g | `rocess.env.[redacted])}             title={!Boolean(process.env.[redacted]) ? "Pronto disponible" : undefined}           >      ` |
| components/forms/BookingForm.tsx | /process\.env\.[A-Z0-9_]+/g | `d" ? window.location.href : undefined });           const canWhatsApp = Boolean(process.env.[redacted]) && Boolean(href);           return canWh` |
| components/forms/BookingForm.tsx | /NEXT_PUBLIC_[A-Z0-9_]+/g | `location.href : undefined });           const canWhatsApp = Boolean(process.env.[redacted]) && Boolean(href);           return canWhatsApp ? (  ` |
| components/marketing/ComingSoonHero.tsx | /process\.env\.[A-Z0-9_]+/g | `otion.button>               {/* Botón secundario "WhatsApp" */}               {process.env.[redacted] ? (                 <motion.a            ` |
| components/marketing/ComingSoonHero.tsx | /process\.env\.[A-Z0-9_]+/g | `PP_PHONE ? (                 <motion.a                   href={`https://wa.me/${process.env.[redacted]}?text=Hola%20me%20interesa%20el%20lanzami` |
| components/marketing/ComingSoonHero.tsx | /NEXT_PUBLIC_[A-Z0-9_]+/g | `>               {/* Botón secundario "WhatsApp" */}               {process.env.[redacted] ? (                 <motion.a                   href=` |
| components/marketing/ComingSoonHero.tsx | /NEXT_PUBLIC_[A-Z0-9_]+/g | `                 <motion.a                   href={`https://wa.me/${process.env.[redacted]}?text=Hola%20me%20interesa%20el%20lanzamiento`}      ` |
| components/marketing/ComingSoonHero.tsx | /NEXT_PUBLIC_[A-Z0-9_]+/g | `utton                   aria-disabled="true"                   title="Configura [redacted]"                   className="rounded-2xl px-6 py-3 f` |
| lib/data.ts | /process\.env\.[A-Z0-9_]+/g | `: number) => new Promise((res) => setTimeout(res, ms)); const simulateLatency = process.env.NODE_ENV !== "production"; function calculatePrecioDesde(units: Uni` |
| lib/data.ts | /process\.env\.[A-Z0-9_]+/g | `de entorno está habilitada, intentar leer desde Supabase   const USE_SUPABASE = process.env.USE_SUPABASE === "true";      console.log(`🔧 USE_SUPABASE: ${USE_SU` |
| lib/data.ts | /process\.env\.[A-Z0-9_]+/g | `   typeof process !== "undefined" && typeof process.env !== "undefined"       ? process.env.USE_ASSETPLAN_SOURCE === "true"       : false;   if (USE_ASSETPLAN_` |
| lib/seo/jsonld.ts | /dangerouslySetInnerHTML/ | `/**  * Utilidad para generar JSON-LD seguro sin usar dangerouslySetInnerHTML  * Previene ataques XSS al escapar correctamente el cont` |
| lib/seo/jsonld.ts | /dangerouslySetInnerHTML/ | `ace(/-->/g, "--\\u003E"); } /**  * Genera JSON-LD seguro para uso en React sin dangerouslySetInnerHTML  * @param obj - Objeto JSON-LD a serializar  * @returns ` |
| lib/site.ts | /process\.env\.[A-Z0-9_]+/g | `export const getBaseUrl = () =>   process.env.NEXT_PUBLIC_SITE_URL ??   (process.env.VERCEL_URL ? `https://${proce` |
| lib/site.ts | /process\.env\.[A-Z0-9_]+/g | `export const getBaseUrl = () =>   process.env.NEXT_PUBLIC_SITE_URL ??   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost` |
| lib/site.ts | /process\.env\.[A-Z0-9_]+/g | `=>   process.env.NEXT_PUBLIC_SITE_URL ??   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'); ` |
| lib/site.ts | /NEXT_PUBLIC_[A-Z0-9_]+/g | `export const getBaseUrl = () =>   process.env.NEXT_PUBLIC_SITE_URL ??   (process.env.VERCEL_URL ? `https://${process.env.VERCE` |
| lib/supabase.ts | /process\.env\.[A-Z0-9_]+/g | `import { createClient } from '@supabase/supabase-js'; const supabaseUrl = process.env.SUPABASE_URL; const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABA` |
| lib/supabase.ts | /process\.env\.[A-Z0-9_]+/g | `ase-js'; const supabaseUrl = process.env.SUPABASE_URL; const supabaseAnonKey = process.env.[redacted] || process.env.SUPABASE_ANON_KEY; cons` |
| lib/supabase.ts | /process\.env\.[A-Z0-9_]+/g | `ABASE_URL; const supabaseAnonKey = process.env.[redacted] || process.env.SUPABASE_ANON_KEY; const supabaseServiceKey = process.env.SUPABASE_S` |
| lib/supabase.ts | /process\.env\.[A-Z0-9_]+/g | `_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY; const supabaseServiceKey = process.env.[redacted]; if (!supabaseUrl) {   throw new Error('M` |
| lib/supabase.ts | /NEXT_PUBLIC_[A-Z0-9_]+/g | `nst supabaseUrl = process.env.SUPABASE_URL; const supabaseAnonKey = process.env.[redacted] || process.env.SUPABASE_ANON_KEY; const supabaseSe` |
| lib/supabase.ts | /service_role/gi | ` process.env.SUPABASE_ANON_KEY; const supabaseServiceKey = process.env.[redacted]; if (!supabaseUrl) {   throw new Error('Missing SUPABASE_URL e` |
| lib/whatsapp.ts | /process\.env\.[A-Z0-9_]+/g | ` propertyName?: string; comuna?: string; url?: string }) {   const p = phone ?? process.env.[redacted] ?? "";   const msg = `Hola, me interesa $` |
| lib/whatsapp.ts | /NEXT_PUBLIC_[A-Z0-9_]+/g | `e?: string; comuna?: string; url?: string }) {   const p = phone ?? process.env.[redacted] ?? "";   const msg = `Hola, me interesa ${propertyNam` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `ig Rocks Generated at: 2025-08-12T00:45:49.733Z - reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `ngerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `ngerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `ngerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `ngerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `ngerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `ngerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `ngerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `ngerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `ngerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `ngerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `ngerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `ngerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `ngerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `ngerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `ngerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `ngerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `ngerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `ngerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `ngerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `ngerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `ngerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `ngerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `ngerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `ngerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `ngerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `ngerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/EXEC_SUMMARY` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `rouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/EXEC_SUMMARY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/EXEC_SUMMARY` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `rouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/EXEC_SUMMARY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/EXEC_SUMMARY` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `rouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/EXEC_SUMMARY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/EXEC_SUMMARY` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `rouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/EXEC_SUMMARY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/EXEC_SUMMARY` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `rouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/EXEC_SUMMARY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/QUICK_WINS.m` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `gerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/QUICK_WINS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/QUICK_WINS.m` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `gerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/QUICK_WINS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/QUICK_WINS.m` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `gerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/QUICK_WINS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/QUICK_WINS.m` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `gerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/QUICK_WINS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/QUICK_WINS.m` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `gerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/QUICK_WINS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/QUICK_WINS.m` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `gerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/QUICK_WINS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/QUICK_WINS.m` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `gerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/QUICK_WINS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/QUICK_WINS.m` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `gerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/QUICK_WINS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/QUICK_WINS.m` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `gerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/QUICK_WINS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/QUICK_WINS.m` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `gerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/QUICK_WINS.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `erouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |
| reports/AUDIT/BIG_ROCKS.md | /dangerouslySetInnerHTML/ | `angerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización (>1h) - reports/AUDIT/SECURITY.md:` |

### Hallazgos
- [media] lib/seo/jsonld.ts: dangerouslySetInnerHTML requiere sanitización
- [media] lib/seo/jsonld.ts: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/BIG_ROCKS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/EXEC_SUMMARY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/EXEC_SUMMARY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/EXEC_SUMMARY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/EXEC_SUMMARY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/EXEC_SUMMARY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/QUICK_WINS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/QUICK_WINS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/QUICK_WINS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/QUICK_WINS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/QUICK_WINS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/QUICK_WINS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/QUICK_WINS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/QUICK_WINS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/QUICK_WINS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/QUICK_WINS.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/RISK_MATRIX.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] reports/AUDIT/SECURITY.md: dangerouslySetInnerHTML requiere sanitización
- [media] scripts/audit.mjs: dangerouslySetInnerHTML requiere sanitización
- [media] scripts/audit.mjs: dangerouslySetInnerHTML requiere sanitización
- [media] scripts/audit.mjs: dangerouslySetInnerHTML requiere sanitización
- [media] scripts/audit.mjs: dangerouslySetInnerHTML requiere sanitización
- [media] scripts/audit.mjs: dangerouslySetInnerHTML requiere sanitización
