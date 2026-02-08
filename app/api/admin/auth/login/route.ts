import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter } from '@lib/rate-limit';
import { signInAdmin } from '@lib/admin/auth-supabase';
import { setSupabaseCookies } from '@lib/admin/supabase-cookies';
import { logger } from '@lib/logger';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Rate limiting: 5 intentos por minuto por IP
const limiter = createRateLimiter({ windowMs: 60_000, max: 5 });

// Schema para validación de login
const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Password requerido'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ipHeader = request.headers.get('x-forwarded-for');
    const ip = ipHeader ? ipHeader.split(',')[0].trim() : 'unknown';

    const rateLimitResult = await limiter.check(ip);
    if (!rateLimitResult.ok) {
      return NextResponse.json(
        { 
          error: 'rate_limited', 
          message: 'Demasiados intentos. Por favor intenta más tarde.',
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimitResult.retryAfter ?? 60) },
        }
      );
    }

    // Parsear y validar body
    const body = await request.json();
    const validatedData = LoginSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { 
          error: 'validation_error', 
          message: 'Datos inválidos',
          details: validatedData.error.errors,
        },
        { status: 400 }
      );
    }

    const { email, password } = validatedData.data;

    // Intentar login
    const session = await signInAdmin(email, password);

    if (!session) {
      // Logging sin password (solo email)
      logger.warn(`[AUTH] Intento de login fallido para: ${email}`);
      
      return NextResponse.json(
        { 
          error: 'invalid_credentials', 
          message: 'Email o password incorrectos',
        },
        { status: 401 }
      );
    }

    // Logging exitoso (sin password)
    logger.log(`[AUTH] Login exitoso para: ${email} (${session.user.role})`);

    if (!session.access_token || !session.refresh_token) {
      logger.error('[AUTH] Sesión sin tokens:', { hasAccess: !!session.access_token, hasRefresh: !!session.refresh_token });
      return NextResponse.json(
        { error: 'internal_error', message: 'Error al crear sesión. Reintenta.' },
        { status: 500 }
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role,
        },
      },
      { status: 200 }
    );

    setSupabaseCookies(response, session);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('[AUTH] Error inesperado en login:', error);

    return NextResponse.json(
      {
        error: 'internal_error',
        message: process.env.NODE_ENV === 'development' ? message : 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}














