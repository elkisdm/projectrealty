import { NextRequest, NextResponse } from 'next/server';
import { signOutAdmin } from '@lib/admin/auth-supabase';
import { clearSupabaseCookies } from '@lib/admin/supabase-cookies';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Cerrar sesión en Supabase
    await signOutAdmin();

    // Crear respuesta
    const response = NextResponse.json(
      { success: true, message: 'Sesión cerrada correctamente' },
      { status: 200 }
    );

    // Limpiar cookies
    return clearSupabaseCookies(response);
  } catch (error) {
    console.error('[AUTH] Error en logout:', error);
    
    // Aún así limpiar cookies aunque haya error
    const response = NextResponse.json(
      { success: true, message: 'Sesión cerrada' },
      { status: 200 }
    );

    return clearSupabaseCookies(response);
  }
}

