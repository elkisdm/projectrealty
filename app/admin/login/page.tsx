import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getAdminSession } from '@lib/admin/auth-supabase';
import LoginForm from '@components/admin/LoginForm';

export const metadata: Metadata = {
  title: 'Login | Admin',
  description: 'Iniciar sesión en el panel de administración',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginPage() {
  // Verificar si ya está autenticado
  const session = await getAdminSession();
  
  if (session) {
    // Si ya está autenticado, redirigir al dashboard
    redirect('/admin');
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--text)] mb-2">
            Panel de Control
          </h1>
          <p className="text-[var(--subtext)]">
            Inicia sesión para acceder al sistema de administración
          </p>
        </div>

        <div className="rounded-2xl bg-[var(--soft)]/90 ring-1 ring-white/10 p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}












