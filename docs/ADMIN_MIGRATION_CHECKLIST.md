# Checklist de Migraciones Admin (Iteración 2)

## Orden sugerido
1. `20250115_create_admin_users.sql`
2. `20250120_add_unit_images.sql`
3. `20250206_add_unit_videos.sql`
4. `20250206_create_storage_buckets.sql`
5. `20250206_create_unit_storage_folders.sql`
6. `20260208_consolidate_admin_panel_media_rbac.sql`
7. `20260209_add_publication_wizard_fields.sql`

## Validaciones previas
- Confirmar buckets: `admin-media`, `building-media`, `unit-media`.
- Confirmar tablas: `buildings`, `units`, `unit_media`, `building_media`, `admin_activity_log`, `admin_users`.
- Confirmar índices en `units(building_id, publication_status, price)`.

## Smoke post-migración
- `GET /api/admin/auth/session` responde contrato `{ success, data, meta, error }`.
- `GET /api/admin/units?page=1&page_size=20` retorna `meta.total` y paginación válida.
- `GET /api/admin/buildings?page=1&page_size=20` retorna `meta.total` y paginación válida.
- `POST /api/admin/media/upload-url` para imagen válida responde 201.
- Flujo wizard crea borrador, guarda paso y publica.
