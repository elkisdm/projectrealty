import { NextRequest } from 'next/server';
import { getAdminSessionFromAccessToken } from '@lib/admin/auth-supabase';
import { getSupabaseCookies } from '@lib/admin/supabase-cookies';
import { adminOk, createAdminMutationMeta } from '@lib/admin/contracts';
import { logger } from '@lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestMeta = createAdminMutationMeta();
  const responseHeaders = { "x-request-id": requestMeta.request_id };

  try {
    const { access_token } = getSupabaseCookies(request);

    if (!access_token) {
      return adminOk(
        { authenticated: false, user: null },
        { status: 200, meta: requestMeta, headers: responseHeaders }
      );
    }

    const session = await getAdminSessionFromAccessToken(access_token);

    if (!session) {
      return adminOk(
        { authenticated: false, user: null },
        { status: 200, meta: requestMeta, headers: responseHeaders }
      );
    }

    return adminOk(
      {
        authenticated: true,
        user: {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role,
        },
      },
      { status: 200, meta: requestMeta, headers: responseHeaders }
    );
  } catch (error) {
    logger.error('[AUTH] Error en verificación de sesión:', error);
    return adminOk(
      { authenticated: false, user: null },
      { status: 200, meta: requestMeta, headers: responseHeaders }
    );
  }
}







