# Hommie 0% Comisión

Plataforma de arriendo sin comisión - Next.js 15 + TypeScript + Supabase

---

## 🚀 Preparación para Producción

**Estado actual:** Proyecto funcional con errores bloqueantes menores  
**Plan de acción:** Ver `PLAN_SPRINTS_PRODUCCION.md` para plan completo

### Plan de Sprints (5 sprints, 20 microtareas)

📋 **Resumen rápido:** `SPRINTS_RESUMEN.md`  
📖 **Plan completo:** `PLAN_SPRINTS_PRODUCCION.md`

**Sprint 1 (CRÍTICO):** Corrección de errores TypeScript bloqueantes  
**Sprint 2:** Limpieza de código (lint, console.log, tipos)  
**Sprint 3:** Limpieza de estructura (carpetas de prueba, componentes)  
**Sprint 4:** Verificación y tests  
**Sprint 5:** Preparación para producción (documentación, checklist)

**Tiempo estimado:** 8-13 horas (2-3 días)  
**Próximo paso:** Comenzar Sprint 1, Microtarea 1.1

---

## Sistema de Feature Flags - Coming Soon

El proyecto usa un sistema de feature flags unificado que permite activar/desactivar el modo "coming soon" simplemente con commit & push.

### Toggle Unificado por Archivo

El sistema depende **ÚNICAMENTE** del archivo `config/feature-flags.json`:

```json
{
  "comingSoon": true
}
```

#### Activar Coming Soon
```bash
npm run coming-soon:on
git add config/feature-flags.json
git commit -m "chore(flags): coming soon ON"
git push origin main
```

#### Volver al sitio real
```bash
npm run coming-soon:off
git add config/feature-flags.json
git commit -m "chore(flags): coming soon OFF"
git push origin main
```

#### Edición Manual
También puedes editar manualmente `config/feature-flags.json`:
- `"comingSoon": true` → Muestra página de coming soon
- `"comingSoon": false` → Muestra landing real

### Flujo de Deploy

1. **Commit & Push** → Vercel detecta cambios
2. **Build automático** → Next.js lee `feature-flags.json`
3. **Deploy** → `/` redirige según el flag

### Verificación

```bash
# Verificar estado actual
curl -I https://tudominio.com

# Con comingSoon: true → 200 OK (página coming soon)
# Con comingSoon: false → 200 OK (landing real)
```

**Nota:** El sistema ignora `process.env.COMING_SOON` para mantener consistencia en deploy por commit & push.

## Ingesta y métricas (Supabase)

- Histórico en tiempo real vía trigger en `public.units_history`.
- Snapshot diario en `public.units_snapshot_daily` y `public.buildings_snapshot_daily`.
- Corridas de ingesta con métricas en `public.ingest_runs`.
- Señales de mercado:
  - `public.mv_price_drops_7d`: caída de precio ≥5% en 7 días.
  - `public.mv_new_listings_24h`: nuevas altas en 24h.
- Vistas de lectura directa:
  - `public.v_filters_available`, `public.v_exports_units_delta`.
- Retención: purga de `units_history` > 180 días.

### Script de ingesta

Variables requeridas:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Instala y ejecuta:
```bash
pnpm add @supabase/supabase-js
pnpm run ingest:assetplan
```

El script:
- Upserta `buildings`/`units` con provider `assetplan`.
- Soft-delete si falta en feed o `precio <= 1`.
- Actualiza `ingest_runs.*` (start/finish + contadores).
- Llama: `refresh_building_aggregates()`, `take_daily_snapshots(current_date)`,
  `refresh_market_views()`, `purge_units_history(180)`.

### Consultas de validación

```sql
select * from public.v_filters_available order by type, units desc;
select * from public.mv_price_drops_7d order by pct_drop desc limit 20;
select * from public.mv_new_listings_24h order by first_seen_available desc limit 20;
```

Rotación semanal por comuna:
```sql
select b.comuna,
       count(*) filter (where h.op='soft_delete' and h.changed_at>=now()-interval '7 days') as salieron,
       count(*) filter (where (h.new_state->>'disponible')::boolean = true and h.changed_at>=now()-interval '7 days') as entraron
from public.units_history h
join public.units u on u.id=h.unit_id
join public.buildings b on b.id=u.building_id
group by b.comuna
order by salieron desc;
```

Conversión 30 días:
```sql
select b.nombre,
       count(distinct l.id) as leads,
       count(distinct k.id) as bookings,
       round(100.0*count(distinct k.id)/nullif(count(distinct l.id),0),2) as conversion_pct
from public.leads l
left join public.bookings k on k.building_id=l.building_id and k.created_at >= now() - interval '30 days'
join public.buildings b on b.id=l.building_id
where l.created_at >= now() - interval '30 days'
group by b.nombre
order by conversion_pct desc nulls last;
```

### Acceso read-only externo

Concede SELECT solo a:
`units_snapshot_daily`, `buildings_snapshot_daily`, `mv_price_drops_7d`,
`mv_new_listings_24h`, `v_exports_units_delta`, `v_filters_available`.
No conceder acceso a `leads`/`bookings` (PII).

## 🚀 Rollback - Coming Soon Mode

### Para volver al sitio real desde modo "coming soon":

1. **En Vercel Dashboard:**
   - Ve a Project Settings → Environment Variables
   - Cambia `COMING_SOON` de `true` a `false` (o elimínala)
   - Guarda los cambios

2. **Redeploy automático:**
   - Vercel automáticamente redeployeará con la nueva configuración
   - O manualmente: `git push` para trigger un nuevo deploy

3. **Verificación:**
   - `/` → 200 OK (landing normal)
   - `/coming-soon` → 200 OK (accesible directamente)
   - Meta robots removido de coming-soon

### Comandos de verificación:

```bash
# Verificar estado actual
curl -I https://tu-dominio.com/

# Verificar coming-soon
curl -I https://tu-dominio.com/coming-soon

# Ejecutar smoke test completo
node scripts/smoke.mjs https://tu-dominio.com/
```

### Reporte de QA:
Ver `reports/COMING_SOON.md` para detalles completos del QA y checklist A11y.


