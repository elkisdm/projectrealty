import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAuthenticatedAdmin } from "@lib/admin/auth-middleware";
import { validateAdminRedirect } from "@lib/admin/validate-redirect";

// Rutas que requieren autenticación
const PROTECTED_ROUTES = ["/admin"];

// Excepciones: rutas que no requieren autenticación
const PUBLIC_ADMIN_ROUTES = ["/admin/login"];

// Verificar si una ruta está protegida
function isProtectedRoute(pathname: string): boolean {
  // Si es una ruta pública de admin, no proteger
  if (PUBLIC_ADMIN_ROUTES.some((route) => pathname === route)) {
    return false;
  }
  
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar si es una ruta protegida
  if (isProtectedRoute(pathname)) {
    const isAuthenticated = await isAuthenticatedAdmin(request);
    
    if (!isAuthenticated) {
      // Redirigir a página de login o devolver 401
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json(
          { error: "unauthorized", message: "Acceso no autorizado" },
          { 
            status: 401,
            headers: {
              'WWW-Authenticate': 'Bearer',
            },
          }
        );
      }

      // Para rutas de página, redirigir a login preservando la URL original
      // Validar pathname para prevenir open redirect attacks
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      if (pathname !== "/admin/login") {
        // Validar que el pathname sea seguro antes de agregarlo como redirect
        const safeRedirect = validateAdminRedirect(pathname, '/admin');
        url.searchParams.set("redirect", safeRedirect);
      }
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};

