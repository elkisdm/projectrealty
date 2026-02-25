# Admin UI Rework Guide (Shadcn)

## Objetivo
Estandarizar `/admin` y `/admin/login` con `shadcn/ui`, conservando lógica y contratos backend.

## Patrones oficiales
- Layout/shell: `AdminShell`, `AdminSidebar`, `AdminTopbar` con `Sheet`, `DropdownMenu`, `Badge`, `Separator`.
- Estados:
  - Error: `Alert` (`ErrorState`)
  - Empty: `Card` (`EmptyState`)
  - Permission: `Alert` (`PermissionState`)
  - Status: `Badge` (`StatusBadge`)
- Confirmaciones: `AlertDialog` (`ConfirmDialog`).
- Tablas admin: `DataGrid` con `@tanstack/react-table` + `Table`, `Checkbox`, `Button`.
- Formularios auth: `react-hook-form + zod + shadcn Form`.

## Reglas de implementación
1. Evitar componentes nuevos en `components/admin/ui` que dupliquen primitives de `components/ui`.
2. Reutilizar `PageHeader`, `StatusBadge`, `ErrorState`, `EmptyState` como capa de dominio.
3. No renderizar errores crudos: usar helper de normalización de errores cliente.
4. Mantener semántica de permisos `viewer/editor/admin` en acciones y navegación.

## Checklist por pantalla
- Layout y navegación responsive
- Loading/empty/error states unificados
- Focus visible y navegación por teclado
- Paridad funcional con filtros/acciones existentes
