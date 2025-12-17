import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateAdminRedirect } from "@lib/admin/validate-redirect";
import { featureFlags } from "./config/feature-flags";

// Función de autenticación compatible con Edge Runtime
function isAuthenticatedAdmin(request: NextRequest): boolean {
  const adminToken = process.env.ADMIN_TOKEN;
  
  // En desarrollo, si no hay token configurado, permitir acceso
  if (process.env.NODE_ENV === "development" && !adminToken) {
    return true;
  }
  
  // Si no hay token configurado en producción, denegar acceso
  if (!adminToken) {
    return false;
  }
  
  // Verificar token en header
  const headerToken = request.headers.get("x-admin-token");
  if (headerToken === adminToken) {
    return true;
  }
  
  // Verificar token en cookie
  const cookieToken = request.cookies.get("admin-token")?.value;
  if (cookieToken === adminToken) {
    return true;
  }
  
  return false;
}

// Rutas que requieren autenticación
const PROTECTED_ROUTES = ["/admin"];

// Excepciones: rutas que no requieren autenticación
const PUBLIC_ADMIN_ROUTES = ["/admin/login"];

// Rutas MVP activas (siempre permitidas)
const MVP_ROUTES = [
  "/",
  "/buscar",
  "/search",
  "/property",
  "/api/buildings",
  "/api/availability",
  "/api/visits",
];

// Rutas deshabilitadas en MVP (retornan 404)
const DISABLED_ROUTES = [
  "/coming-soon",
  "/arrienda-sin-comision",
  "/flash-videos",
  "/landing-v2",
  "/cotizador",
  "/agendamiento",
  "/agendamiento-mejorado",
  "/propiedad",
];

// Verificar si una ruta está protegida
function isProtectedRoute(pathname: string): boolean {
  // Si es una ruta pública de admin, no proteger
  if (PUBLIC_ADMIN_ROUTES.some((route) => pathname === route)) {
    return false;
  }
  
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

// Verificar si una ruta está deshabilitada en MVP
function isDisabledRoute(pathname: string): boolean {
  return DISABLED_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

// Verificar si una ruta es MVP válida
function isMvpRoute(pathname: string): boolean {
  // Rutas exactas MVP
  if (pathname === "/") return true;
  if (pathname === "/buscar" || pathname === "/search") return true;
  
  // Rutas de propiedad (legacy y nueva estructura SEO)
  if (pathname.startsWith("/property/")) return true;
  if (pathname.startsWith("/arriendo/departamento/")) return true;
  
  // APIs MVP
  if (pathname.startsWith("/api/buildings")) return true;
  if (pathname.startsWith("/api/availability")) return true;
  if (pathname.startsWith("/api/visits")) return true;
  
  // APIs admin siempre permitidas (para uso interno)
  if (pathname.startsWith("/api/admin")) return true;
  
  // Rutas admin siempre permitidas (para uso interno)
  if (pathname.startsWith("/admin")) return true;
  
  // Archivos estáticos y assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".json") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return true;
  }
  
  return false;
}

// Función para leer feature flags desde el módulo TypeScript
function readFeatureFlag(flagName: keyof typeof featureFlags): boolean {
  return Boolean(featureFlags[flagName]);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar modo MVP
  const mvpMode = readFeatureFlag("mvpMode");
  
  if (mvpMode) {
    // Si es una ruta deshabilitada, retornar 404
    if (isDisabledRoute(pathname)) {
      return new NextResponse(null, { status: 404 });
    }
    
    // Si no es una ruta MVP válida y no es admin/estática, retornar 404
    if (!isMvpRoute(pathname)) {
      return new NextResponse(null, { status: 404 });
    }
  }

  // Verificar si es una ruta protegida (admin)
  if (isProtectedRoute(pathname)) {
    const isAuthenticated = isAuthenticatedAdmin(request);
    
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
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

