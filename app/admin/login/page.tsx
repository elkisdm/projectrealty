import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ShieldCheck, Building2, Sparkles } from "lucide-react";
import LoginForm from "@components/admin/LoginForm";
import { getAdminSession } from "@lib/admin/auth-supabase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Login | Admin",
  description: "Iniciar sesion en el panel administrativo",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginPage() {
  try {
    const session = await getAdminSession();
    if (session) {
      redirect("/admin");
    }
  } catch {
    // Sigue al formulario cuando no hay sesion valida
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-[var(--bg)] md:grid-cols-2">
      <section className="relative hidden overflow-hidden border-r border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)] p-10 md:block">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-violet/20 blur-3xl" />
        <div className="absolute -left-16 bottom-10 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-2)] px-3 py-1 text-xs text-[var(--subtext)]">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Entorno seguro para operaciones
          </div>
          <h1 className="mt-6 max-w-md text-4xl font-bold leading-tight text-[var(--text)]">
            Administra propiedades con una experiencia profesional.
          </h1>
          <p className="mt-4 max-w-md text-sm text-[var(--subtext)]">
            Controla edificios, unidades, media y completitud de inventario desde un panel unificado.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-[var(--text)]">
            <li className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-brand-violet" />
              Flujo de alta guiado y validaciones en tiempo real
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-violet" />
              Operaciones masivas, filtros y acciones por rol
            </li>
          </ul>
        </div>
      </section>

      <section className="flex items-center justify-center p-4 md:p-10">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-wide text-[var(--subtext)]">Panel administrativo</p>
            <h2 className="mt-1 text-2xl font-bold text-[var(--text)]">Iniciar sesion</h2>
            <p className="mt-1 text-sm text-[var(--subtext)]">Ingresa con tu cuenta autorizada para acceder al panel.</p>
          </div>
          <LoginForm />
        </div>
      </section>
    </div>
  );
}
