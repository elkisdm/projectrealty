import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromAccessToken } from '@lib/admin/auth-supabase';
import { getSupabaseCookies } from '@lib/admin/supabase-cookies';
import { logger } from '@lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { access_token } = getSupabaseCookies(request);

    if (!access_token) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const session = await getAdminSessionFromAccessToken(access_token);

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('[AUTH] Error en verificación de sesión:', error);
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}








