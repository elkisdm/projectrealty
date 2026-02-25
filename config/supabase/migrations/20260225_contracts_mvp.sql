-- Contracts MVP: templates, contracts, contract_events + RLS

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  version text not null,
  docx_path text not null,
  docx_sha256 text not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  created_by uuid not null references public.admin_users(id),
  unique (name, version)
);

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.templates(id),
  template_version text not null,
  status text not null check (status in ('issued', 'void')),
  payload_json jsonb not null,
  replacements_json jsonb,
  request_hash_sha256 text not null,
  pdf_path text not null,
  hash_sha256 text not null,
  created_at timestamptz not null default now(),
  created_by uuid not null references public.admin_users(id)
);

create table if not exists public.contract_events (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  type text not null check (type in ('issued', 'downloaded', 'voided', 'sent')),
  meta_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_contracts_template_id on public.contracts(template_id);
create index if not exists idx_contracts_created_at_desc on public.contracts(created_at desc);
create index if not exists idx_contracts_request_hash on public.contracts(request_hash_sha256);
create index if not exists idx_contracts_status on public.contracts(status);
create index if not exists idx_contract_events_contract_id on public.contract_events(contract_id);
create index if not exists idx_contract_events_type on public.contract_events(type);
create index if not exists idx_contract_events_created_at_desc on public.contract_events(created_at desc);

alter table public.templates enable row level security;
alter table public.contracts enable row level security;
alter table public.contract_events enable row level security;

create or replace function public.current_admin_role()
returns text
language sql
stable
as $$
  select role::text from public.admin_users where id = auth.uid() limit 1;
$$;

-- templates
create policy "templates_select_admin_editor_viewer" on public.templates
for select using (public.current_admin_role() in ('admin', 'editor', 'viewer'));

create policy "templates_insert_admin_editor" on public.templates
for insert with check (public.current_admin_role() in ('admin', 'editor'));

create policy "templates_update_admin" on public.templates
for update using (public.current_admin_role() = 'admin') with check (public.current_admin_role() = 'admin');

create policy "templates_delete_admin" on public.templates
for delete using (public.current_admin_role() = 'admin');

-- contracts
create policy "contracts_select_admin_editor_viewer" on public.contracts
for select using (public.current_admin_role() in ('admin', 'editor', 'viewer'));

create policy "contracts_insert_admin_editor" on public.contracts
for insert with check (public.current_admin_role() in ('admin', 'editor'));

create policy "contracts_update_admin_not_issued" on public.contracts
for update using (
  public.current_admin_role() = 'admin'
  and status <> 'issued'
)
with check (
  public.current_admin_role() = 'admin'
  and status <> 'issued'
);

create policy "contracts_delete_admin_not_issued" on public.contracts
for delete using (public.current_admin_role() = 'admin' and status <> 'issued');

-- contract_events
create policy "contract_events_select_admin_editor_viewer" on public.contract_events
for select using (public.current_admin_role() in ('admin', 'editor', 'viewer'));

create policy "contract_events_insert_admin_editor" on public.contract_events
for insert with check (public.current_admin_role() in ('admin', 'editor'));

create policy "contract_events_update_admin" on public.contract_events
for update using (public.current_admin_role() = 'admin') with check (public.current_admin_role() = 'admin');

create policy "contract_events_delete_admin" on public.contract_events
for delete using (public.current_admin_role() = 'admin');

comment on table public.templates is 'Plantillas DOCX versionadas para emisión de contratos';
comment on table public.contracts is 'Contratos emitidos inmutables (excepto estados no-issued)';
comment on table public.contract_events is 'Eventos de auditoría de contratos';
