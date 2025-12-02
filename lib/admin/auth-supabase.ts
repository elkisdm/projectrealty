import 'server-only';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

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
export function createSupabaseAuthClient(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL y ANON KEY deben estar configurados');
  }

  const cookieStore = cookies();
  
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
          // Mapear keys de Supabase a nuestros nombres de cookies
          if (key.includes('access_token') || key === accessTokenKey) {
            return cookieStore.get(accessTokenKey)?.value ?? null;
          }
          if (key.includes('refresh_token') || key === refreshTokenKey) {
            return cookieStore.get(refreshTokenKey)?.value ?? null;
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
    const client = createSupabaseAuthClient();
    
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session || !data.user) {
      console.error('Error en signInAdmin:', error?.message);
      return null;
    }

    // Verificar que el usuario existe en admin_users
    const adminUser = await getAdminUser(data.user.id);
    if (!adminUser) {
      console.error('Usuario no encontrado en admin_users');
      return null;
    }

    return {
      user: adminUser,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at ?? 0,
    };
  } catch (error) {
    console.error('Error inesperado en signInAdmin:', error);
    return null;
  }
}

/**
 * Cierra sesión del administrador
 */
export async function signOutAdmin(): Promise<void> {
  try {
    const client = createSupabaseAuthClient();
    await client.auth.signOut();
  } catch (error) {
    console.error('Error en signOutAdmin:', error);
    throw error;
  }
}

/**
 * Obtiene la sesión actual del administrador desde las cookies
 * @returns Sesión del administrador o null si no hay sesión válida
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const client = createSupabaseAuthClient();
    
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
    console.error('Error en getAdminSession:', error);
    return null;
  }
}

/**
 * Refresca la sesión del administrador usando el refresh token
 * @returns Nueva sesión o null si falla
 */
export async function refreshAdminSession(): Promise<AdminSession | null> {
  try {
    const client = createSupabaseAuthClient();
    
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
    console.error('Error en refreshAdminSession:', error);
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
    console.error('Error en getAdminUser:', error);
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

