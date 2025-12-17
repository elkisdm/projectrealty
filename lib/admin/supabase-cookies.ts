import { NextRequest, NextResponse } from 'next/server';
import type { AdminSession } from './auth-supabase';

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
 * Obtiene las cookies de sesión de Supabase desde el request
 * @param request Request de Next.js
 * @returns Objeto con access_token y refresh_token o null
 */
export function getSupabaseCookies(request: NextRequest): {
  access_token: string | null;
  refresh_token: string | null;
} {
  const cookieNames = getSupabaseCookieNames();
  const accessToken = request.cookies.get(cookieNames.accessToken)?.value ?? null;
  const refreshToken = request.cookies.get(cookieNames.refreshToken)?.value ?? null;

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
  };
}

/**
 * Establece las cookies de sesión de Supabase en la respuesta
 * @param response Response de Next.js
 * @param session Sesión del administrador
 * @returns Response con cookies establecidas
 */
export function setSupabaseCookies(
  response: NextResponse,
  session: AdminSession
): NextResponse {
  const isProduction = process.env.NODE_ENV === 'production';
  const maxAge = 60 * 60 * 24 * 7; // 7 días
  const cookieNames = getSupabaseCookieNames();

  // Cookie para access token
  response.cookies.set(cookieNames.accessToken, session.access_token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge,
    path: '/',
  });

  // Cookie para refresh token
  response.cookies.set(cookieNames.refreshToken, session.refresh_token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: maxAge * 2, // Refresh token dura más
    path: '/',
  });

  return response;
}

/**
 * Limpia las cookies de sesión de Supabase
 * @param response Response de Next.js
 * @returns Response con cookies eliminadas
 */
export function clearSupabaseCookies(response: NextResponse): NextResponse {
  const cookieNames = getSupabaseCookieNames();
  response.cookies.delete(cookieNames.accessToken);
  response.cookies.delete(cookieNames.refreshToken);

  return response;
}

/**
 * Verifica si las cookies de sesión están presentes
 * @param request Request de Next.js
 * @returns true si hay cookies de sesión
 */
export function hasSupabaseCookies(request: NextRequest): boolean {
  const cookies = getSupabaseCookies(request);
  return cookies.access_token !== null && cookies.refresh_token !== null;
}

