/**
 * Utilidades de autenticación para el panel de administración
 * 
 * @deprecated Este módulo está deprecado. Usa @lib/admin/auth-supabase.ts en su lugar.
 * 
 * NOTA: Esta es una implementación básica que será reemplazada por Supabase Auth.
 * Las funciones aquí se mantienen temporalmente para evitar breaking changes durante
 * la migración, pero NO deben usarse en nuevo código.
 * 
 * Migración:
 * - verifyAdminToken() -> getAdminSession() de auth-supabase.ts
 * - getAdminTokenFromRequest() -> getSupabaseCookies() de supabase-cookies.ts
 * - isAuthenticatedRequest() -> getAdminSession() de auth-supabase.ts
 * - unauthorizedResponse() -> NextResponse.json con status 401
 */

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

/**
 * Verifica si el token proporcionado es válido
 * 
 * @deprecated Usa getAdminSession() de @lib/admin/auth-supabase.ts en su lugar
 */
export function verifyAdminToken(token: string | null | undefined): boolean {
  if (!ADMIN_TOKEN) {
    // En desarrollo, si no hay token configurado, permitir acceso
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console -- Development warning for missing token
      console.warn("⚠️ ADMIN_TOKEN no configurado. Acceso permitido en desarrollo.");
      return true;
    }
    return false;
  }

  return token === ADMIN_TOKEN;
}

/**
 * Obtiene el token del request (header o cookie)
 * 
 * @deprecated Usa getSupabaseCookies() de @lib/admin/supabase-cookies.ts en su lugar
 */
export function getAdminTokenFromRequest(request: Request): string | null {
  // Intentar obtener de header
  const authHeader = request.headers.get("x-admin-token");
  if (authHeader) {
    return authHeader;
  }

  // Intentar obtener de cookie
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    return cookies["admin-token"] || null;
  }

  return null;
}

/**
 * Verifica si el request tiene autenticación válida
 * 
 * @deprecated Usa getAdminSession() de @lib/admin/auth-supabase.ts en su lugar
 */
export function isAuthenticatedRequest(request: Request): boolean {
  const token = getAdminTokenFromRequest(request);
  return verifyAdminToken(token);
}

/**
 * Respuesta de error de autenticación
 * 
 * @deprecated Usa NextResponse.json con status 401 directamente en las API routes
 */
export function unauthorizedResponse() {
  return Response.json(
    { error: "unauthorized", message: "Acceso no autorizado" },
    { status: 401 }
  );
}

