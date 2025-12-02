import { createClient } from '@supabase/supabase-js';

// Mock Supabase client para testing local
export function createMockSupabaseClient() {
  return {
    from: (_table: string) => ({
      insert: (data: unknown) => ({
        select: () => ({
          single: () => Promise.resolve({
            data: { id: 'mock-id', ...(data as any) },
            error: null
          })
        }),
        then: (onResolve: (value: any) => any) => {
          const result = { data: { id: 'mock-id', ...(data as any) }, error: null };
          return Promise.resolve(result).then(onResolve);
        }
      }),
      select: (_query?: string) => ({
        limit: (_count: number) => Promise.resolve({
          data: [
            {
              id: 'mock-building-1',
              nombre: 'Edificio Mock',
              comuna: 'Las Condes',
              units: [
                { id: 'mock-unit-1', tipologia: '1D', precio: 500000, disponible: true }
              ]
            }
          ],
          error: null
        }),
        order: (_column: string, _options?: unknown) => Promise.resolve({
          data: [
            {
              id: 'mock-building-1',
              nombre: 'Edificio Mock',
              comuna: 'Las Condes',
              completeness_percentage: 85,
              cover_image_status: '✅',
              badges_status: '❌',
              service_level_status: '✅',
              amenities_status: '✅',
              gallery_status: '✅'
            }
          ],
          error: null
        }),
        eq: (_column: string, _value: unknown) => ({
          single: () => Promise.resolve({
            data: { id: 'mock-id', nombre: 'Mock', comuna: 'Las Condes' },
            error: null
          })
        })
      }),
      update: (_data: unknown) => ({
        eq: (_column: string, _value: unknown) => Promise.resolve({
          data: null,
          error: null
        })
      }),
      delete: () => ({
        eq: (_column: string, _value: unknown) => Promise.resolve({
          data: null,
          error: null
        })
      })
    })
  };
}

// Función para crear cliente Supabase real o mock
export function createSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // En producción, exigir configuración completa
  if (process.env.NODE_ENV === 'production') {
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('server_misconfigured');
    }
    return createClient(supabaseUrl, supabaseServiceKey);
  }
  
  // En desarrollo/testing, permitir mock si no hay configuración
  if (!supabaseUrl || !supabaseServiceKey) {
    // console.log('⚠️  Supabase no configurado, usando mock para testing');
    return createMockSupabaseClient();
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}
