import { NextRequest, NextResponse } from "next/server";
import type { AdminRole } from "@lib/admin/contracts";
import { getAdminSessionFromAccessToken, type AdminSession } from "@lib/admin/auth-supabase";
import { getSupabaseCookies } from "@lib/admin/supabase-cookies";

const roleLevel: Record<AdminRole, number> = {
  viewer: 1,
  editor: 2,
  admin: 3,
};

function unauthorizedResponse() {
  return NextResponse.json(
    {
      success: false,
      data: null,
      meta: null,
      error: {
        code: "unauthorized",
        message: "Acceso no autorizado",
      },
    },
    { status: 401 }
  );
}

function forbiddenResponse(requiredRole: AdminRole) {
  return NextResponse.json(
    {
      success: false,
      data: null,
      meta: null,
      error: {
        code: "forbidden",
        message: `Rol insuficiente. Se requiere ${requiredRole}`,
      },
    },
    { status: 403 }
  );
}

export async function requireAdminSession(
  request: NextRequest,
  requiredRole: AdminRole = "viewer"
): Promise<{ session: AdminSession; response: null } | { session: null; response: NextResponse }> {
  const { access_token } = getSupabaseCookies(request);

  if (!access_token) {
    return { session: null, response: unauthorizedResponse() };
  }

  const session = await getAdminSessionFromAccessToken(access_token);
  if (!session) {
    return { session: null, response: unauthorizedResponse() };
  }

  if (roleLevel[session.user.role] < roleLevel[requiredRole]) {
    return { session: null, response: forbiddenResponse(requiredRole) };
  }

  return { session, response: null };
}
