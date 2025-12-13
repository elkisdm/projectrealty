import { NextRequest, NextResponse } from 'next/server';
// import { z } from 'zod';
import { WaitlistRequestSchema } from '@schemas/models';
import { createRateLimiter } from '@lib/rate-limit';
import { createSupabaseClient } from '@lib/supabase.mock';

// Rate limiter: 20 requests per 60 seconds
const rateLimiter = createRateLimiter({ windowMs: 60_000, max: 20 });

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0] || 
         request.headers.get('x-real-ip') || 
         'unknown';
}

export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (process.env.NODE_ENV === 'production') {
      if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json(
          { ok: false, error: 'server_misconfigured' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'health_check_failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = await rateLimiter.check(clientIP);
    
    if (!rateLimitResult.ok) {
      // console.log(`Rate limit exceeded for IP: ${clientIP.substring(0, 8)}...`);
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
    const parsed = WaitlistRequestSchema.safeParse(json);
    
    if (!parsed.success) {
      // console.log(`Validation failed for IP: ${clientIP.substring(0, 8)}...`);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Revisa el email',
          issues: parsed.error.flatten() 
        },
        { status: 400 }
      );
    }

    const { email, phone, name, contactMethod, source } = parsed.data;

    // Crear cliente Supabase (real o mock)
    let supabase;
    try {
      supabase = createSupabaseClient();
    } catch (error) {
      if (error instanceof Error && error.message === 'server_misconfigured') {
        // console.error('❌ Supabase no configurado en producción');
        return NextResponse.json(
          { success: false, error: 'server_misconfigured' },
          { status: 500 }
        );
      }
      throw error;
    }

    // Insertar en waitlist con campos extendidos
    const { error: _error } = await supabase
      .from('waitlist')
      .insert({
        email,
        phone: phone || null,
        name: name || null,
        contact_method: contactMethod || null,
        source: source || 'how-it-works'
      })
      .select()
      .single();

    if (_error) {
      // console.error(`DB insert failed for IP: ${clientIP.substring(0, 8)}..., code: ${_error.code}`);
      
      // Si es un email duplicado, no es un error crítico
      if (_error.code === '23505') { // unique_violation
        return NextResponse.json(
          { success: true, message: 'Ya estás en la lista de espera' },
          { status: 200 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: 'Tuvimos un problema, intenta de nuevo' },
        { status: 500 }
      );
    }

    // console.log(`Waitlist insert successful for IP: ${clientIP.substring(0, 8)}...`);
    return NextResponse.json(
      { success: true, message: '¡Te agregamos a la lista de espera!' },
      { status: 200 }
    );

  } catch {
    // console.error(`Unexpected error for IP: ${getClientIP(request).substring(0, 8)}...`);
    return NextResponse.json(
      { success: false, error: 'Tuvimos un problema, intenta de nuevo' },
      { status: 500 }
    );
  }
}
