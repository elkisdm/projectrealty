"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { createOptimizedQueryClient } from "@lib/react-query";
import { ErrorBoundary } from "@components/admin/ErrorBoundary";
import { useAdminAuth } from "@hooks/useAdminAuth";
import React from "react";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/buildings", label: "Edificios", icon: "🏢" },
    { href: "/admin/units", label: "Unidades", icon: "🏠" },
    { href: "/admin/flags", label: "Feature Flags", icon: "🚩" },
    { href: "/admin/completeness", label: "Completitud", icon: "✅" },
];

function LoadingFallback() {
    return (
        <div className="container mx-auto px-4 md:px-6 py-8">
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-[var(--soft)] rounded w-1/3"></div>
                <div className="h-64 bg-[var(--soft)] rounded-2xl"></div>
            </div>
        </div>
    );
}

function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoadingSession } = useAdminAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoadingSession && !isAuthenticated) {
            router.push('/admin/login');
        }
    }, [isAuthenticated, isLoadingSession, router]);

    if (isLoadingSession) {
        return (
            <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-violet mx-auto mb-4"></div>
                    <p className="text-[var(--subtext)]">Verificando sesión...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // El redirect se maneja en el useEffect
    }

    return <>{children}</>;
}

function NavBar() {
    const { user, logout, isLoggingOut } = useAdminAuth();

    return (
        <nav className="border-b border-white/10 bg-[var(--soft)]/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-[var(--text)]">Panel de Control</h1>
                    </div>
                    <div className="flex items-center gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="px-3 py-2 rounded-lg text-sm font-medium text-[var(--subtext)] hover:text-[var(--text)] hover:bg-[var(--soft)] transition-colors focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
                            >
                                <span className="mr-1.5">{item.icon}</span>
                                <span className="hidden sm:inline">{item.label}</span>
                            </Link>
                        ))}
                        {user && (
                            <div className="ml-4 flex items-center gap-3 border-l border-white/10 pl-4">
                                <span className="text-sm text-[var(--subtext)] hidden sm:inline">
                                    {user.email}
                                </span>
                                <button
                                    onClick={() => {
                                        logout().catch((err) => {
                                            // El error ya está manejado en el mutation's onError
                                            // Solo prevenimos el unhandled promise rejection
                                            console.error('Error en logout:', err);
                                        });
                                    }}
                                    disabled={isLoggingOut}
                                    className="px-3 py-2 rounded-lg text-sm font-medium text-[var(--subtext)] hover:text-[var(--text)] hover:bg-[var(--soft)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
                                >
                                    {isLoggingOut ? 'Cerrando...' : 'Cerrar sesión'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
    const [queryClient] = React.useState(() => createOptimizedQueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <div className="min-h-screen bg-[var(--bg)] -mt-16 -mb-16">
                {/* Ocultar Header y Footer del layout raíz usando CSS */}
                <style dangerouslySetInnerHTML={{
                    __html: `
          header,
          footer {
            display: none !important;
          }
          main#main-content {
            padding: 0 !important;
            margin: 0 !important;
          }
        `}} />
                <AuthGuard>
                    {/* Navigation */}
                    <NavBar />

                    {/* Main Content */}
                    <div className="min-h-[calc(100vh-4rem)]">
                        <ErrorBoundary>
                            <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
                        </ErrorBoundary>
                    </div>
                </AuthGuard>

                {/* Toast Notifications */}
                <Toaster
                    position="top-right"
                    richColors
                    closeButton
                    toastOptions={{
                        style: {
                            background: "var(--soft)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "var(--text)",
                        },
                    }}
                />
            </div>
        </QueryClientProvider>
    );
}

