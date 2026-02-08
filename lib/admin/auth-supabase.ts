import 'server-only';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@lib/logger';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  created_at: string;
  updated_at: string;
}

export interface AdminSession {
  user: AdminUser;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

/**
 * Crea un cliente de Supabase Auth con configuración correcta para el servidor
 * Este cliente puede leer cookies de sesión del request
 */
export async function createSupabaseAuthClient(): Promise<SupabaseClient> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL y ANON KEY deben estar configurados');
  }

  const cookieStore = await cookies();
  
  // Supabase usa nombres de cookies específicos basados en el project ref
  // Formato: sb-<project-ref>-auth-token y sb-<project-ref>-auth-token.0
  const projectRef = supabaseUrl.split('//')[1]?.split('.')[0] || 'default';
  const accessTokenKey = `sb-${projectRef}-auth-token`;
  const refreshTokenKey = `sb-${projectRef}-auth-token.0`;
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storage: {
        getItem: (key: string) => {
          const accessVal = cookieStore.get(accessTokenKey)?.value ?? null;
          const refreshVal = cookieStore.get(refreshTokenKey)?.value ?? null;
          // Supabase getSession() puede esperar sesión en JSON para la clave principal
          if (key === accessTokenKey || key.includes('auth-token')) {
            if (accessVal && refreshVal) {
              return JSON.stringify({
                access_token: accessVal,
                refresh_token: refreshVal,
                expires_at: 0,
              });
            }
            return accessVal ?? null;
          }
          if (key.includes('refresh_token') || key === refreshTokenKey) {
            return refreshVal ?? null;
          }
          if (key.includes('access_token')) {
            return accessVal ?? null;
          }
          return cookieStore.get(key)?.value ?? null;
        },
        setItem: (key: string, value: string) => {
          // Las cookies se establecen en las API routes
          // Este storage es solo para lectura
        },
        removeItem: (key: string) => {
          // Las cookies se eliminan en las API routes
        },
      },
    },
  });
}

/**
 * Crea un cliente Supabase solo para Auth (sin cookies). Uso en login para evitar
 * depender de cookies() en API routes y posibles 500.
 */
function createAuthClientForLogin(): ReturnType<typeof createClient> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('SUPABASE_URL y (NEXT_PUBLIC_SUPABASE_ANON_KEY o SUPABASE_ANON_KEY) son requeridos');
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
}

/**
 * Inicia sesión de administrador con email y password
 * @param email Email del administrador
 * @param password Password del administrador
 * @returns Sesión del administrador o null si falla
 */
export async function signInAdmin(
  email: string,
  password: string
): Promise<AdminSession | null> {
  try {
    const client = createAuthClientForLogin();

    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session || !data.user) {
      logger.error('Error en signInAdmin:', error?.message);
      return null;
    }

    // Verificar que el usuario existe en admin_users (usa supabaseAdmin con service role)
    const adminUser = await getAdminUser(data.user.id);
    if (!adminUser) {
      logger.error('Usuario no encontrado en admin_users');
      return null;
    }

    return {
      user: adminUser,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at ?? 0,
    };
  } catch (error) {
    logger.error('Error inesperado en signInAdmin:', error);
    return null;
  }
}

/**
 * Cierra sesión del administrador
 */
export async function signOutAdmin(): Promise<void> {
  try {
    const client = await createSupabaseAuthClient();
    await client.auth.signOut();
  } catch (error) {
    logger.error('Error en signOutAdmin:', error);
    throw error;
  }
}

/**
 * Obtiene sesión admin a partir del access_token (cookie).
 * No usa getSession() ni storage; valida el JWT con Supabase y consulta admin_users.
 * Uso: verificación de sesión en API leyendo cookies del request.
 */
export async function getAdminSessionFromAccessToken(
  accessToken: string
): Promise<AdminSession | null> {
  try {
    const client = createAuthClientForLogin();
    const { data: { user }, error } = await client.auth.getUser(accessToken);

    if (error || !user) {
      return null;
    }

    const adminUser = await getAdminUser(user.id);
    if (!adminUser) {
      return null;
    }

    return {
      user: adminUser,
      access_token: accessToken,
      refresh_token: '',
      expires_at: 0,
    };
  } catch {
    return null;
  }
}

/**
 * Obtiene la sesión actual del administrador desde las cookies (vía createSupabaseAuthClient).
 * @returns Sesión del administrador o null si no hay sesión válida
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const client = await createSupabaseAuthClient();

    const { data: { session }, error } = await client.auth.getSession();

    if (error || !session || !session.user) {
      return null;
    }

    // Verificar que el usuario existe en admin_users
    const adminUser = await getAdminUser(session.user.id);
    if (!adminUser) {
      return null;
    }

    return {
      user: adminUser,
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at ?? 0,
    };
  } catch (error) {
    logger.error('Error en getAdminSession:', error);
    return null;
  }
}

/**
 * Refresca la sesión del administrador usando el refresh token
 * @returns Nueva sesión o null si falla
 */
export async function refreshAdminSession(): Promise<AdminSession | null> {
  try {
    const client = await createSupabaseAuthClient();
    
    const { data: { session }, error } = await client.auth.refreshSession();

    if (error || !session || !session.user) {
      return null;
    }

    // Verificar que el usuario existe en admin_users
    const adminUser = await getAdminUser(session.user.id);
    if (!adminUser) {
      return null;
    }

    return {
      user: adminUser,
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at ?? 0,
    };
  } catch (error) {
    logger.error('Error en refreshAdminSession:', error);
    return null;
  }
}

/**
 * Obtiene los datos del administrador desde la tabla admin_users
 * @param userId UUID del usuario de auth.users
 * @returns Datos del administrador o null si no existe
 */
export async function getAdminUser(userId: string): Promise<AdminUser | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .select('id, email, role, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      role: data.role as 'admin' | 'editor' | 'viewer',
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error) {
    logger.error('Error en getAdminUser:', error);
    return null;
  }
}

/**
 * Verifica si un usuario tiene un rol específico
 * @param userId UUID del usuario
 * @param requiredRole Rol requerido
 * @returns true si el usuario tiene el rol requerido
 */
export async function hasRole(
  userId: string,
  requiredRole: 'admin' | 'editor' | 'viewer'
): Promise<boolean> {
  const adminUser = await getAdminUser(userId);
  if (!adminUser) {
    return false;
  }

  const roleHierarchy: Record<string, number> = {
    viewer: 1,
    editor: 2,
    admin: 3,
  };

  return roleHierarchy[adminUser.role] >= roleHierarchy[requiredRole];
}

