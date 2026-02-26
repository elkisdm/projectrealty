-- Registry of contract parties for reuse across contract flows

create table if not exists public.contract_parties (
  id uuid primary key default gen_random_uuid(),
  source_contract_id uuid references public.contracts(id) on delete set null,
  role text not null check (
    role in (
      'arrendador_propietario',
      'arrendadora',
      'arrendadora_representante',
      'propietario',
      'arrendatario',
      'arrendatario_representante_legal',
      'aval'
    )
  ),
  party_type text not null default 'unknown' check (party_type in ('natural', 'juridica', 'unknown')),
  display_name text not null,
  rut text not null,
  email text,
  phone text,
  nationality text,
  civil_status text,
  profession text,
  address text,
  meta_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references public.admin_users(id),
  unique (role, rut)
);

create index if not exists idx_contract_parties_rut on public.contract_parties(rut);
create index if not exists idx_contract_parties_role on public.contract_parties(role);
create index if not exists idx_contract_parties_updated_at_desc on public.contract_parties(updated_at desc);

alter table public.contract_parties enable row level security;

create policy "contract_parties_select_admin_editor_viewer" on public.contract_parties
for select using (public.current_admin_role() in ('admin', 'editor', 'viewer'));

create policy "contract_parties_insert_admin_editor" on public.contract_parties
for insert with check (public.current_admin_role() in ('admin', 'editor'));

create policy "contract_parties_update_admin" on public.contract_parties
for update using (public.current_admin_role() = 'admin')
with check (public.current_admin_role() = 'admin');

create policy "contract_parties_delete_admin" on public.contract_parties
for delete using (public.current_admin_role() = 'admin');

comment on table public.contract_parties is 'Registro reutilizable de implicados de contratos';

