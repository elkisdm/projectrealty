-- Core (si ya existen, no pasa nada por 'if not exists')
create extension if not exists pgcrypto;

create table if not exists public.buildings (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'assetplan',
  source_building_id text not null,
  slug text not null,
  nombre text not null,
  comuna text not null,
  direccion text,
  precio_desde integer,
  has_availability boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create unique index if not exists uq_buildings_provider_source on public.buildings(provider, source_building_id);

create table if not exists public.units (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'assetplan',
  source_unit_id text not null,
  building_id uuid not null references public.buildings(id) on delete cascade,
  unidad text not null,
  tipologia text,
  bedrooms int, bathrooms int,
  area_m2 numeric, area_interior_m2 numeric, area_exterior_m2 numeric,
  orientacion text, pet_friendly boolean,
  precio integer, gastos_comunes integer,
  disponible boolean default true,
  status text not null default 'unknown' check (status in ('available','inactive','unknown','reserved','rented')),
  promotions text[] not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create unique index if not exists uq_units_provider_source on public.units(provider, source_unit_id);

-- Lectura pública para UI
alter table public.buildings enable row level security;
alter table public.units enable row level security;
create policy if not exists read_buildings on public.buildings for select using (true);
create policy if not exists read_units on public.units for select using (true);

-- Filtros por disponibilidad (UI)
create or replace view public.v_filters_available as
with avail as (
  select u.*, b.comuna
  from public.units u
  join public.buildings b on b.id = u.building_id
  where u.disponible = true and coalesce(u.precio,0) > 1
)
select 'comuna'::text as type, comuna as value, count(*) as units
from avail group by comuna
union all
select 'tipologia'::text as type, tipologia as value, count(*) as units
from avail where tipologia is not null group by tipologia;

-- Agregados building (precioDesde/stock) usados por QA
create or replace function public.refresh_building_aggregates()
returns void language sql as $$
  update public.buildings b set
    has_availability = exists (select 1 from public.units u where u.building_id=b.id and u.disponible and coalesce(u.precio,0) > 1),
    precio_desde = (select min(precio) from public.units u where u.building_id=b.id and u.disponible and coalesce(u.precio,0) > 1),
    updated_at = now();
$$;


