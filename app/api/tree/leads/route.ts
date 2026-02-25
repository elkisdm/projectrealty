import { NextRequest, NextResponse } from 'next/server';
import { TreeLeadRequestSchema } from '@schemas/tree';
import { createRateLimiter } from '@lib/rate-limit';
import { createSupabaseClient } from '@lib/supabase.mock';
import { logger } from '@lib/logger';

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
      logger.log(`Rate limit exceeded for IP: ${clientIP.substring(0, 8)}...`);
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
    const parsed = TreeLeadRequestSchema.safeParse(json);

    if (!parsed.success) {
      logger.log(`Validation failed for IP: ${clientIP.substring(0, 8)}...`);
      return NextResponse.json(
        {
          success: false,
          error: 'Revisa los datos ingresados',
          issues: parsed.error.flatten()
        },
        { status: 400 }
      );
    }

    const { flow, payload, name, whatsapp, email, utm_source, utm_medium, utm_campaign, utm_content, utm_term, referrer } = parsed.data;

    // Crear cliente Supabase (real o mock)
    let supabase;
    try {
      supabase = createSupabaseClient();
    } catch (error) {
      if (error instanceof Error && error.message === 'server_misconfigured') {
        logger.error('❌ Supabase no configurado en producción');
        return NextResponse.json(
          { success: false, error: 'server_misconfigured' },
          { status: 500 }
        );
      }
      throw error;
    }

    // Insertar en leads
    const { data: leadData, error: _error } = await supabase
      .from('leads')
      .insert({
        flow,
        name,
        whatsapp,
        email: email || null,
        payload,
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
        utm_content: utm_content || null,
        utm_term: utm_term || null,
        referrer: referrer || null,
        status: 'new'
      })
      .select()
      .single();

    if (_error) {
      logger.error(`DB insert failed for IP: ${clientIP.substring(0, 8)}..., code: ${_error.code}`);

      // Si es un error de constraint, no es crítico pero logueamos
      if (_error.code === '23505') { // unique_violation
        return NextResponse.json(
          { success: true, message: 'Tu solicitud ya fue registrada' },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { success: false, error: 'Tuvimos un problema, intenta de nuevo' },
        { status: 500 }
      );
    }

    logger.log(`Tree lead insert successful for IP: ${clientIP.substring(0, 8)}..., flow: ${flow}, leadId: ${leadData?.id}`);
    return NextResponse.json(
      {
        success: true,
        message: '¡Gracias por tu interés! Te contactaremos pronto.',
        leadId: leadData?.id
      },
      { status: 200 }
    );

  } catch (error) {
    logger.error(`Unexpected error for IP: ${getClientIP(request).substring(0, 8)}...`);
    return NextResponse.json(
      { success: false, error: 'Tuvimos un problema, intenta de nuevo' },
      { status: 500 }
    );
  }
}
