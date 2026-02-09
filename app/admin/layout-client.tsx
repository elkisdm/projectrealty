"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Toaster } from "sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { LayoutDashboard, Building2, Home, Flag, CheckCircle2, PlusSquare } from "lucide-react";
import React from "react";
import { createOptimizedQueryClient } from "@lib/react-query";
import { ErrorBoundary } from "@components/admin/ErrorBoundary";
import { useAdminAuth } from "@hooks/useAdminAuth";
import { logger } from "@lib/logger";
import { AdminShell } from "@components/admin/ui/AdminShell";
import type { AdminNavItem } from "@/types/admin-ui";

const navItems: AdminNavItem[] = [
  { key: "dashboard", href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, minRole: "viewer" },
  { key: "buildings", href: "/admin/buildings", label: "Edificios", icon: <Building2 className="h-4 w-4" />, minRole: "viewer" },
  { key: "units", href: "/admin/units", label: "Unidades", icon: <Home className="h-4 w-4" />, minRole: "viewer" },
  { key: "new-listing", href: "/admin/listar-propiedad", label: "Listar propiedad", icon: <PlusSquare className="h-4 w-4" />, minRole: "editor" },
  { key: "completeness", href: "/admin/completeness", label: "Completitud", icon: <CheckCircle2 className="h-4 w-4" />, minRole: "viewer" },
  { key: "flags", href: "/admin/flags", label: "Feature Flags", icon: <Flag className="h-4 w-4" />, minRole: "admin" },
];

function LoadingFallback() {
  return (
    <div className="space-y-4">
      <div className="h-9 w-1/3 animate-pulse rounded-lg bg-[var(--admin-surface-2)]" />
      <div className="h-64 animate-pulse rounded-2xl bg-[var(--admin-surface-2)]" />
    </div>
  );
}

function AuthenticatedContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated, isLoadingSession, isLoggingOut, error: sessionError } = useAdminAuth();

  useEffect(() => {
    if (!isLoadingSession && !isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, isLoadingSession, router]);

  if (isLoadingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-brand-violet" />
          <p className="text-sm text-[var(--subtext)]">Verificando sesion...</p>
        </div>
      </div>
    );
  }

  if (sessionError && !isAuthenticated) {
    const message = sessionError instanceof Error ? sessionError.message : "Error al verificar sesion";
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <div className="max-w-md rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-center">
          <p className="text-sm font-medium text-amber-200">{message}</p>
          <p className="mt-2 text-xs text-[var(--subtext)]">Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AdminShell
      navItems={navItems}
      role={user?.role || "viewer"}
      email={user?.email}
      pathname={pathname}
      onLogout={() => {
        logout().catch((error) => {
          logger.error("Error en logout:", error);
        });
      }}
      isLoggingOut={isLoggingOut}
    >
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
      </ErrorBoundary>
    </AdminShell>
  );
}

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => createOptimizedQueryClient());
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  const hideRootShell = (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          header,
          footer {
            display: none !important;
          }
          main#main-content {
            padding: 0 !important;
            margin: 0 !important;
          }
        `,
      }}
    />
  );

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-[var(--bg)] -mb-16">
        {hideRootShell}
        {isLoginPage ? children : <AuthenticatedContent>{children}</AuthenticatedContent>}
      </div>
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: "var(--admin-surface-1)",
            border: "1px solid var(--admin-border-subtle)",
            color: "var(--text)",
          },
        }}
      />
    </QueryClientProvider>
  );
}

