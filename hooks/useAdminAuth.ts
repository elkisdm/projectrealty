'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

interface SessionResponse {
  authenticated: boolean;
  user?: AdminUser;
}

interface LoginResponse {
  success: boolean;
  user?: AdminUser;
  error?: string;
  message?: string;
}

interface LogoutResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Función para obtener sesión
async function fetchSession(): Promise<SessionResponse> {
  const response = await fetch('/api/admin/auth/session');
  
  if (!response.ok) {
    return { authenticated: false };
  }

  const data = (await response.json()) as SessionResponse;
  return data;
}

// Función para login
async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch('/api/admin/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = (await response.json()) as LoginResponse;

  if (!response.ok) {
    // Crear un Error con el código de error como propiedad para facilitar la detección
    const error = new Error(data.message || data.error || 'Error al iniciar sesión');
    // Agregar el código de error como propiedad para facilitar la detección
    (error as Error & { code?: string }).code = data.error;
    throw error;
  }

  return data;
}

// Función para logout
async function logoutUser(): Promise<LogoutResponse> {
  const response = await fetch('/api/admin/auth/logout', {
    method: 'POST',
  });

  const data = (await response.json()) as LogoutResponse;

  if (!response.ok) {
    const errorMessage = data.message || data.error || 'Error al cerrar sesión';
    const error = new Error(errorMessage);
    // Agregar el código de error como propiedad
    (error as Error & { code?: string }).code = data.error;
    throw error;
  }

  return data;
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

