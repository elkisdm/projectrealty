-- Private buckets for contracts MVP

insert into storage.buckets (id, name, public)
values ('templates', 'templates', false)
on conflict (id) do update set public = excluded.public;

insert into storage.buckets (id, name, public)
values ('contracts', 'contracts', false)
on conflict (id) do update set public = excluded.public;

-- storage policies
create policy if not exists "templates_bucket_auth_read" on storage.objects
for select to authenticated
using (bucket_id = 'templates');

create policy if not exists "templates_bucket_service_write" on storage.objects
for all to service_role
using (bucket_id = 'templates')
with check (bucket_id = 'templates');

create policy if not exists "contracts_bucket_auth_read" on storage.objects
for select to authenticated
using (bucket_id = 'contracts');

create policy if not exists "contracts_bucket_service_write" on storage.objects
for all to service_role
using (bucket_id = 'contracts')
with check (bucket_id = 'contracts');
