import { NextRequest, NextResponse } from 'next/server';
import { signOutAdmin } from '@lib/admin/auth-supabase';
import { clearSupabaseCookies } from '@lib/admin/supabase-cookies';
import { logger } from '@lib/logger';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(_request: NextRequest) {
  let logoutError: Error | null = null;

  try {
    // Cerrar sesión en Supabase
    await signOutAdmin();
  } catch (error) {
    logger.error('[AUTH] Error en logout:', error);
    logoutError = error instanceof Error ? error : new Error('Error desconocido al cerrar sesión');
  }

  // Siempre limpiar cookies, incluso si hubo error en signOutAdmin
  // Esto asegura que el cliente no pueda seguir usando la sesión
  const response = NextResponse.json(
    logoutError
      ? {
          success: false,
          error: 'logout_failed',
          message: 'Error al cerrar sesión en el servidor, pero las cookies fueron limpiadas',
        }
      : {
          success: true,
          message: 'Sesión cerrada correctamente',
        },
    { status: logoutError ? 500 : 200 }
  );

  return clearSupabaseCookies(response);
}

