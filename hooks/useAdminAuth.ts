'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

interface SessionData {
  authenticated: boolean;
  user?: AdminUser | null;
}

interface ApiErrorData {
  code: string;
  message: string;
}

interface AdminApiResponse<T> {
  success: boolean;
  data: T | null;
  meta: unknown;
  error: ApiErrorData | null;
}

interface LogoutData {
  message?: string;
}

const SESSION_FETCH_TIMEOUT_MS = 10_000;

// Función para obtener sesión (credentials para enviar cookies)
async function fetchSession(): Promise<SessionData> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SESSION_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch('/api/admin/auth/session', {
      credentials: 'include',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return { authenticated: false };
    }

    const payload = (await response.json()) as AdminApiResponse<SessionData>;
    if (!payload.success || !payload.data) {
      return { authenticated: false };
    }

    return payload.data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('La verificación de sesión tardó demasiado. Revisa tu conexión.');
    }
    throw err;
  }
}

// Función para login (credentials para recibir Set-Cookie)
async function loginUser(email: string, password: string): Promise<SessionData> {
  const response = await fetch('/api/admin/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const payload = (await response.json()) as AdminApiResponse<SessionData>;

  if (!response.ok) {
    // Crear un Error con el código de error como propiedad para facilitar la detección
    const error = new Error(payload.error?.message || 'Error al iniciar sesión');
    // Agregar el código de error como propiedad para facilitar la detección
    (error as Error & { code?: string }).code = payload.error?.code;
    throw error;
  }

  if (!payload.success || !payload.data) {
    throw new Error('Respuesta inválida de login');
  }

  return payload.data;
}

// Función para logout
async function logoutUser(): Promise<{ success: boolean; message?: string; errorCode?: string }> {
  const response = await fetch('/api/admin/auth/logout', {
    method: 'POST',
  });

  const payload = (await response.json()) as AdminApiResponse<LogoutData>;

  if (!response.ok) {
    const errorMessage = payload.error?.message || 'Error al cerrar sesión';
    const error = new Error(errorMessage);
    // Agregar el código de error como propiedad
    (error as Error & { code?: string }).code = payload.error?.code;
    throw error;
  }

  return {
    success: payload.success,
    message: payload.data?.message,
    errorCode: payload.error?.code,
  };
}

export function useAdminAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Query para verificar sesión
  const {
    data: sessionData,
    isLoading: isLoadingSession,
    error: sessionError,
  } = useQuery({
    queryKey: ['admin', 'auth', 'session'],
    queryFn: fetchSession,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 1,
    refetchOnWindowFocus: true,
  });

  // Mutation para login
  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginUser(email, password),
    onSuccess: () => {
      // Invalidar query de sesión para refrescar
      queryClient.invalidateQueries({ queryKey: ['admin', 'auth', 'session'] });
      toast.success('Sesión iniciada correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al iniciar sesión');
    },
  });

  // Mutation para logout
  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: (data) => {
      // Limpiar todas las queries de admin
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.clear();
      
      // Si el logout fue parcialmente exitoso (cookies limpiadas pero error en servidor)
      if (!data.success) {
        toast.warning('Sesión cerrada localmente, pero hubo un problema en el servidor');
      } else {
        toast.success('Sesión cerrada correctamente');
      }
      
      router.push('/admin/login');
      router.refresh();
    },
    onError: (error: Error) => {
      // Si las cookies fueron limpiadas pero hubo error, aún redirigir
      // pero mostrar mensaje de advertencia
      const errorCode = 'code' in error ? (error as Error & { code?: string }).code : null;
      if (errorCode === 'logout_failed' || error.message.includes('cookies fueron limpiadas')) {
        toast.warning('Sesión cerrada localmente, pero hubo un problema en el servidor');
        queryClient.invalidateQueries({ queryKey: ['admin'] });
        queryClient.clear();
        router.push('/admin/login');
        router.refresh();
      } else {
        toast.error(error.message || 'Error al cerrar sesión');
      }
    },
  });

  // Funciones helper
  const login = async (email: string, password: string) => {
    return loginMutation.mutateAsync({ email, password });
  };

  const logout = async () => {
    return logoutMutation.mutateAsync();
  };

  const checkSession = async () => {
    return queryClient.fetchQuery({
      queryKey: ['admin', 'auth', 'session'],
      queryFn: fetchSession,
    });
  };

  return {
    // Estado de sesión
    user: sessionData?.user,
    isAuthenticated: sessionData?.authenticated ?? false,
    isLoading: isLoadingSession || loginMutation.isPending || logoutMutation.isPending,
    isLoadingSession,
    error: sessionError || loginMutation.error || logoutMutation.error,
    
    // Funciones
    login,
    logout,
    checkSession,
    
    // Estados de mutations
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
