import type { AdminRole } from "@/types/admin-ui";

export const roleLevel: Record<AdminRole, number> = {
  viewer: 1,
  editor: 2,
  admin: 3,
};

export function canAccess(currentRole: AdminRole, minRole: AdminRole) {
  return roleLevel[currentRole] >= roleLevel[minRole];
}

