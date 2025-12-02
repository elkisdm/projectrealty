import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@lib/admin/auth-supabase';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
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
    console.error('[AUTH] Error en verificación de sesión:', error);
    
    return NextResponse.json(
      { authenticated: false },
      { status: 200 }
    );
  }
}

