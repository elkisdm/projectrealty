import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@lib/supabase';

/**
 * Obtiene los nombres de cookies de Supabase basados en el project ref
 */
function getSupabaseCookieNames(): { accessToken: string; refreshToken: string } {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const projectRef = supabaseUrl.split('//')[1]?.split('.')[0] || 'default';
  
  return {
    accessToken: `sb-${projectRef}-auth-token`,
    refreshToken: `sb-${projectRef}-auth-token.0`,
  };
}

/**
 * Crea un cliente de Supabase para el middleware
 * El middleware no puede usar cookies() de Next.js, así que leemos directamente del request
 */
function createSupabaseClientForMiddleware(request: NextRequest) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const cookieNames = getSupabaseCookieNames();
  const accessToken = request.cookies.get(cookieNames.accessToken)?.value;
  const refreshToken = request.cookies.get(cookieNames.refreshToken)?.value;

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  // Si hay tokens, establecerlos en el cliente
  if (accessToken && refreshToken) {
    client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    } as any).catch(() => {
      // Ignorar errores al establecer sesión
    });
  }

  return client;
}

/**
 * Verifica si el request tiene una sesión válida de Supabase Auth
 * @param request Request de Next.js
 * @returns true si hay sesión válida y el usuario existe en admin_users
 */
export async function isAuthenticatedAdmin(request: NextRequest): Promise<boolean> {
  try {
    const client = createSupabaseClientForMiddleware(request);
    if (!client) {
      return false;
    }

    // Obtener sesión
    const { data: { session }, error } = await client.auth.getSession();

    if (error || !session || !session.user) {
      return false;
    }

    // Verificar que el usuario existe en admin_users
    const { data: adminUser } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('id', session.user.id)
      .single();

    return !!adminUser;
  } catch (error) {
    console.error('[MIDDLEWARE] Error verificando autenticación:', error);
    return false;
  }
}

/**
 * Obtiene la sesión de Supabase desde el request
 * @param request Request de Next.js
 * @returns Sesión o null
 */
export async function getSupabaseSessionFromRequest(request: NextRequest) {
  try {
    const client = createSupabaseClientForMiddleware(request);
    if (!client) {
      return null;
    }

    const { data: { session }, error } = await client.auth.getSession();

    if (error || !session) {
      return null;
    }

    return session;
  } catch (error) {
    console.error('[MIDDLEWARE] Error obteniendo sesión:', error);
    return null;
  }
}

