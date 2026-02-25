import { ContractError } from './errors';
import { createSupabaseAdminClient, createSupabaseAnonClient } from './supabase';

export type AdminRole = 'admin' | 'editor' | 'viewer';

export interface RequestAdmin {
  userId: string;
  email: string;
  role: AdminRole;
}

function parseBearer(request: Request): string | null {
  const auth = request.headers.get('authorization');
  if (!auth || !auth.toLowerCase().startsWith('bearer ')) return null;
  return auth.slice(7).trim();
}

export async function requireAdmin(request: Request, allowedRoles: AdminRole[]): Promise<RequestAdmin> {
  const token = parseBearer(request);
  if (!token) {
    throw new ContractError({
      code: 'UNAUTHORIZED',
      message: 'Missing bearer token',
    });
  }

  const anon = createSupabaseAnonClient();
  const {
    data: { user },
    error: authError,
  } = await anon.auth.getUser(token);

  if (authError || !user) {
    throw new ContractError({
      code: 'UNAUTHORIZED',
      message: 'Invalid session token',
    });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from('admin_users')
    .select('id, email, role')
    .eq('id', user.id)
    .single();

  if (error || !data) {
    throw new ContractError({
      code: 'FORBIDDEN',
      message: 'User is not registered in admin_users',
    });
  }

  const role = data.role as AdminRole;
  if (!allowedRoles.includes(role)) {
    throw new ContractError({
      code: 'FORBIDDEN',
      message: 'Insufficient role permissions',
      details: { role, allowedRoles },
    });
  }

  return {
    userId: data.id,
    email: data.email,
    role,
  };
}
