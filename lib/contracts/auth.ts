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

function parseAdminToken(request: Request): string | null {
  const headerToken = request.headers.get('x-admin-token');
  if (headerToken) return headerToken.trim();

  const cookieHeader = request.headers.get('cookie') ?? '';
  const raw = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('admin-token='));

  if (!raw) return null;
  const value = raw.slice('admin-token='.length).trim();
  return value || null;
}

async function pickFallbackAdmin(allowedRoles: AdminRole[]): Promise<RequestAdmin> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from('admin_users')
    .select('id, email, role')
    .in('role', allowedRoles)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    throw new ContractError({
      code: 'FORBIDDEN',
      message: 'No existe usuario admin/editor/viewer en admin_users para operar contratos',
      hint: 'Crea un usuario en admin_users o autentica con bearer de Supabase.',
    });
  }

  return {
    userId: data.id,
    email: data.email,
    role: data.role as AdminRole,
  };
}

export async function requireAdmin(request: Request, allowedRoles: AdminRole[]): Promise<RequestAdmin> {
  const token = parseBearer(request);

  if (token) {
    const anon = createSupabaseAnonClient();
    const {
      data: { user },
      error: authError,
    } = await anon.auth.getUser(token);

    if (authError || !user) {
      throw new ContractError({
        code: 'UNAUTHORIZED',
        message: 'Invalid bearer session token',
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

  const adminToken = parseAdminToken(request);
  const configuredAdminToken = process.env.ADMIN_TOKEN;
  if (adminToken && configuredAdminToken && adminToken === configuredAdminToken) {
    return pickFallbackAdmin(allowedRoles);
  }

  const allowDevBypass =
    process.env.NODE_ENV === 'development' &&
    process.env.ALLOW_DEV_CONTRACTS_AUTH_BYPASS !== '0' &&
    process.env.ALLOW_DEV_CONTRACTS_AUTH_BYPASS !== 'false';

  if (allowDevBypass) {
    return pickFallbackAdmin(allowedRoles);
  }

  throw new ContractError({
    code: 'UNAUTHORIZED',
    message: 'Missing bearer token',
    hint: 'Envía Authorization: Bearer <supabase_jwt> o x-admin-token válido (ADMIN_TOKEN).',
  });
}
