import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateAdminRedirect } from "@lib/admin/validate-redirect";
import { featureFlags } from "./config/feature-flags";

// Rutas que requieren autenticación
const PROTECTED_ROUTES = ["/admin", "/api/admin"];

// Excepciones: rutas de admin públicas
const PUBLIC_ADMIN_ROUTES = [
  "/admin/login",
  "/api/admin/auth/login",
  "/api/admin/auth/session",
  "/api/admin/auth/logout",
];

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

// Verificar sesión admin llamando al endpoint oficial de sesión
async function isAuthenticatedAdmin(request: NextRequest): Promise<boolean> {
  try {
    const sessionUrl = new URL("/api/admin/auth/session", request.nextUrl.origin);
    const response = await fetch(sessionUrl, {
      method: "GET",
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return false;
    }

    const data = (await response.json()) as { authenticated?: boolean };
    return data.authenticated === true;
  } catch {
    return false;
  }
}

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
  if (pathname === "/cv") return true;

  // Rutas de propiedad (legacy y nueva estructura SEO)
  if (pathname.startsWith("/property/")) return true;
  if (pathname.startsWith("/arriendo/departamento/")) return true;

  // Rutas Tree (link-in-bio)
  if (pathname.startsWith("/tree")) return true;

  // APIs MVP
  if (pathname.startsWith("/api/buildings")) return true;
  if (pathname.startsWith("/api/availability")) return true;
  if (pathname.startsWith("/api/visits")) return true;
  if (pathname.startsWith("/api/tree")) return true;
  if (pathname.startsWith("/api/templates")) return true;
  if (pathname.startsWith("/api/contracts")) return true;

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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // En desarrollo: bypass para evitar colgues (HMR, chunks). MVP/admin siguen en build/producción.
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

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
    const isAuthenticated = await isAuthenticatedAdmin(request);

    if (!isAuthenticated) {
      // Para APIs admin, devolver 401
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json(
          { error: "unauthorized", message: "Acceso no autorizado" },
          {
            status: 401,
            headers: {
              "WWW-Authenticate": "Bearer",
            },
          }
        );
      }

      // Para rutas de página, redirigir a login preservando la URL original
      // Validar pathname para prevenir open redirect attacks
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      if (pathname !== "/admin/login") {
        const safeRedirect = validateAdminRedirect(pathname, "/admin");
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
     * Excluir todo _next (chunks, HMR, static, image) y favicon.
     * Evita que middleware corra en cada asset y pueda colgar dev.
     */
    "/((?!_next|favicon\\.ico).*)",
  ],
};
