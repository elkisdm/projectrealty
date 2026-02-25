import type { AdminRole } from "@lib/admin/contracts";
import { getAdminDbClient } from "@lib/admin/repositories/client";
import { getTableColumns, pickKnownColumns } from "@lib/admin/repositories/table-columns";

export async function logAdminActivity({
  actorId,
  actorEmail,
  actorRole,
  action,
  entity,
  entityId,
  metadata,
}: {
  actorId: string;
  actorEmail: string;
  actorRole: AdminRole;
  action: string;
  entity: string;
  entityId: string;
  metadata?: unknown;
}) {
  try {
    const client = getAdminDbClient();
    const columns = await getTableColumns("admin_activity_log");

    const payload = pickKnownColumns(
      {
        actor_id: actorId,
        actor_email: actorEmail,
        actor_role: actorRole,
        action,
        entity,
        entity_id: entityId,
        metadata: metadata ?? null,
      },
      columns
    );

    const { error } = await client.from("admin_activity_log").insert(payload);

    if (error) {
      // Logging best-effort: no romper flujos de negocio por auditoría.
      return;
    }
  } catch {
    return;
  }
}
