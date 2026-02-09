import { NextRequest } from 'next/server';
import { signOutAdmin } from '@lib/admin/auth-supabase';
import { clearSupabaseCookies } from '@lib/admin/supabase-cookies';
import { adminError, adminOk, createAdminMutationMeta } from '@lib/admin/contracts';
import { logger } from '@lib/logger';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(_request: NextRequest) {
  const requestMeta = createAdminMutationMeta();
  const responseHeaders = { "x-request-id": requestMeta.request_id };
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
  const response = logoutError
    ? adminError(
        "logout_failed",
        "Error al cerrar sesión en el servidor, pero las cookies fueron limpiadas",
        {
          status: 500,
          meta: requestMeta,
          headers: responseHeaders,
        }
      )
    : adminOk(
        { message: "Sesión cerrada correctamente" },
        { status: 200, meta: requestMeta, headers: responseHeaders }
      );

  return clearSupabaseCookies(response);
}
