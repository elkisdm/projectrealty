import { createClient } from '@supabase/supabase-js';

// Datos mock completos para admin y buildings
const mockAdminData = { 
  id: 'mock-id', 
  nombre: 'Mock', 
  comuna: 'Las Condes',
  email: 'mock@example.com',
  role: 'admin',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const mockBuildingData = {
  id: 'mock-building-1',
  nombre: 'Edificio Mock',
  comuna: 'Las Condes',
  completeness_percentage: 85,
  cover_image_status: '✅',
  badges_status: '❌',
  service_level_status: '✅',
  amenities_status: '✅',
  gallery_status: '✅',
  units: [
    { id: 'mock-unit-1', tipologia: '1D', precio: 500000, disponible: true }
  ]
};

type ChainableQuery = {
  select: (query?: string) => ChainableQuery;
  insert: (data: unknown) => ChainableQuery;
  update: (data: unknown) => ChainableQuery;
  delete: () => ChainableQuery;
  eq: (column: string, value: unknown) => ChainableQuery;
  neq: (column: string, value: unknown) => ChainableQuery;
  ilike: (column: string, pattern: string) => ChainableQuery;
  like: (column: string, pattern: string) => ChainableQuery;
  or: (filters: string) => ChainableQuery;
  and: (filters: string) => ChainableQuery;
  in: (column: string, values: unknown[]) => ChainableQuery;
  is: (column: string, value: unknown) => ChainableQuery;
  gte: (column: string, value: unknown) => ChainableQuery;
  lte: (column: string, value: unknown) => ChainableQuery;
  gt: (column: string, value: unknown) => ChainableQuery;
  lt: (column: string, value: unknown) => ChainableQuery;
  range: (from: number, to: number) => ChainableQuery;
  order: (column: string, options?: { ascending?: boolean }) => ChainableQuery;
  limit: (count: number) => ChainableQuery;
  single: () => Promise<{ data: typeof mockAdminData | null; error: null }>;
  maybeSingle: () => Promise<{ data: typeof mockAdminData | null; error: null }>;
  then: <T>(onResolve: (value: { data: unknown[]; error: null; count: number }) => T) => Promise<T>;
  // Allow direct await
  data?: unknown[];
  error?: null;
  count?: number;
};

// Mock Supabase client para testing local
export function createMockSupabaseClient() {
  // Crear objeto chainable que retorna a sí mismo para todos los métodos de filtrado
  const createChainable = (): ChainableQuery => {
    const chainable: ChainableQuery = {
      select: () => chainable,
      insert: () => chainable,
      update: () => chainable,
      delete: () => chainable,
      eq: () => chainable,
      neq: () => chainable,
      ilike: () => chainable,
      like: () => chainable,
      or: () => chainable,
      and: () => chainable,
      in: () => chainable,
      is: () => chainable,
      gte: () => chainable,
      lte: () => chainable,
      gt: () => chainable,
      lt: () => chainable,
      range: () => chainable,
      order: () => chainable,
      limit: () => chainable,
      single: () => Promise.resolve({ data: mockAdminData, error: null }),
      maybeSingle: () => Promise.resolve({ data: mockAdminData, error: null }),
      then: (onResolve) => {
        const result = { data: [mockBuildingData], error: null, count: 1 };
        return Promise.resolve(result).then(onResolve);
      }
    };
    
    return chainable;
  };

  return {
    from: (_table: string) => createChainable()
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
    return createMockSupabaseClient();
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}
