// Importación de Supabase
import { createClient as createSupabaseClient, type SupabaseClient as SupabaseClientType } from '@supabase/supabase-js';
import { createMockSupabaseClient } from './supabase.mock';
import { logger } from './logger';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Función helper para crear cliente Supabase (real o mock según disponibilidad)
 * @param url - URL de Supabase
 * @param key - Clave de autenticación
 * @param options - Opciones de configuración del cliente
 * @returns Cliente Supabase (real o mock tipado como SupabaseClient)
 */
function createClient(
  url?: string, 
  key?: string, 
  options?: { auth: { persistSession: boolean } }
): SupabaseClientType {
  // Si no hay configuración, usar mock
  if (!supabaseUrl || !supabaseAnonKey || !url || !key) {
    if (!supabaseUrl || !supabaseAnonKey) {
      logger.warn('⚠️  Supabase no configurado, usando mock');
    }
    // Type assertion: mock implementa interfaz compatible con SupabaseClient
    return createMockSupabaseClient() as unknown as SupabaseClientType;
  }
  
  return createSupabaseClient(url, key, options);
}

// Cliente para uso público (cliente)
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    })
  : createClient(); // Mock si no hay configuración

// Cliente para uso del servidor (service role)
export const supabaseAdmin = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
      },
    })
  : createClient(); // Mock si no hay configuración

export type { SupabaseClientType as SupabaseClient };
