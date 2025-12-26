import { NextRequest, NextResponse } from 'next/server';
import { AvailabilityNotificationRequestSchema } from '@schemas/models';
import { createRateLimiter } from '@lib/rate-limit';
import { createSupabaseClient } from '@lib/supabase.mock';

// Rate limiter: 20 requests per 60 seconds
const rateLimiter = createRateLimiter({ windowMs: 60_000, max: 20 });

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0] || 
         request.headers.get('x-real-ip') || 
         'unknown';
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = await rateLimiter.check(clientIP);
    
    if (!rateLimitResult.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Demasiados intentos, prueba en un minuto',
          retryAfter: rateLimitResult.retryAfter 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.retryAfter?.toString() || '60'
          }
        }
      );
    }

    // Validar body
    const json = await request.json();
    const parsed = AvailabilityNotificationRequestSchema.safeParse(json);
    
    if (!parsed.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Revisa el email',
          issues: parsed.error.flatten() 
        },
        { status: 400 }
      );
    }

    const { email, phone, name, unitId } = parsed.data;

    // Crear cliente Supabase (real o mock)
    let supabase;
    try {
      supabase = createSupabaseClient();
    } catch (error) {
      if (error instanceof Error && error.message === 'server_misconfigured') {
        return NextResponse.json(
          { success: false, error: 'server_misconfigured' },
          { status: 500 }
        );
      }
      throw error;
    }

    // Insertar en waitlist con campo unitId opcional
    // Si unitId está presente, es una notificación específica para esa unidad
    // Si unitId es null, es una notificación general (comportamiento actual)
    const { error: _error } = await supabase
      .from('waitlist')
      .insert({
        email,
        phone: phone || null,
        name: name || null,
        source: unitId ? `availability-notification-${unitId}` : 'availability-notification',
        // Nota: Si la tabla waitlist tiene campo unit_id, se puede agregar aquí
        // unit_id: unitId || null,
      })
      .select()
      .single();

    if (_error) {
      // Si es un email duplicado, no es un error crítico
      if (_error.code === '23505') { // unique_violation
        return NextResponse.json(
          { success: true, message: 'Ya estás suscrito a las notificaciones' },
          { status: 200 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: 'Tuvimos un problema, intenta de nuevo' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: '¡Te notificaremos cuando la unidad esté disponible!' },
      { status: 200 }
    );

  } catch {
    return NextResponse.json(
      { success: false, error: 'Tuvimos un problema, intenta de nuevo' },
      { status: 500 }
    );
  }
}

