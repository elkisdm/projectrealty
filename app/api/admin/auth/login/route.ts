import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createRateLimiter } from '@lib/rate-limit';
import { signInAdmin } from '@lib/admin/auth-supabase';
import { setSupabaseCookies } from '@lib/admin/supabase-cookies';
import { adminError, adminOk, createAdminMutationMeta } from '@lib/admin/contracts';
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
  const requestMeta = createAdminMutationMeta();
  const responseHeaders = { "x-request-id": requestMeta.request_id };

  try {
    // Rate limiting
    const ipHeader = request.headers.get('x-forwarded-for');
    const ip = ipHeader ? ipHeader.split(',')[0].trim() : 'unknown';

    const rateLimitResult = await limiter.check(ip);
    if (!rateLimitResult.ok) {
      return adminError(
        "rate_limited",
        "Demasiados intentos. Por favor intenta más tarde.",
        {
          status: 429,
          details: { retryAfter: rateLimitResult.retryAfter },
          meta: requestMeta,
          headers: {
            ...responseHeaders,
            "Retry-After": String(rateLimitResult.retryAfter ?? 60),
          },
        }
      );
    }

    // Parsear y validar body
    const body = await request.json();
    const validatedData = LoginSchema.safeParse(body);

    if (!validatedData.success) {
      return adminError("validation_error", "Datos inválidos", {
        status: 400,
        details: validatedData.error.errors,
        meta: requestMeta,
        headers: responseHeaders,
      });
    }

    const { email, password } = validatedData.data;

    // Intentar login
    const session = await signInAdmin(email, password);

    if (!session) {
      // Logging sin password (solo email)
      logger.warn(`[AUTH] Intento de login fallido para: ${email}`);
      
      return adminError("unauthorized", "Email o password incorrectos", {
        status: 401,
        meta: requestMeta,
        headers: responseHeaders,
      });
    }

    // Logging exitoso (sin password)
    logger.log(`[AUTH] Login exitoso para: ${email} (${session.user.role})`);

    if (!session.access_token || !session.refresh_token) {
      logger.error('[AUTH] Sesión sin tokens:', { hasAccess: !!session.access_token, hasRefresh: !!session.refresh_token });
      return adminError("internal_error", "Error al crear sesión. Reintenta.", {
        status: 500,
        meta: requestMeta,
        headers: responseHeaders,
      });
    }

    const response = adminOk(
      {
        authenticated: true,
        user: {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role,
        },
      },
      { status: 200, meta: requestMeta, headers: responseHeaders }
    );

    setSupabaseCookies(response, session);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('[AUTH] Error inesperado en login:', error);

    return adminError(
      "internal_error",
      process.env.NODE_ENV === 'development' ? message : 'Error interno del servidor',
      {
        status: 500,
        meta: requestMeta,
        headers: responseHeaders,
      }
    );
  }
}












