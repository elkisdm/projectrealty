import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter } from '@lib/rate-limit';
import { logger } from '@lib/logger';
import {
  CancelWindowExpiredError,
  getVisitRepository,
  InvalidVisitTransitionError,
  VisitNotFoundError,
} from '@lib/visits/repository';

const rateLimiter = createRateLimiter({ windowMs: 60_000, max: 10 });

const cancelBodySchema = z.object({
  reason: z.string().min(1).max(280).optional(),
  actorId: z.string().min(1).optional(),
});

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const ip = getClientIp(request);
    const rate = await rateLimiter.check(ip);
    if (!rate.ok) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: rate.retryAfter },
        {
          status: 429,
          headers: {
            'Retry-After': rate.retryAfter?.toString() || '60',
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Window': '60',
          },
        }
      );
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'visitId es requerido' }, { status: 400 });
    }

    let payload: { reason?: string; actorId?: string } = {};
    try {
      const body = await request.json();
      const parsed = cancelBodySchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.errors }, { status: 400 });
      }
      payload = parsed.data;
    } catch {
      // Body opcional: si no viene, se cancela sin razón.
    }

    const repository = getVisitRepository();
    const result = await repository.cancelVisit({
      visitId: id,
      reason: payload.reason,
      actorType: 'user',
      actorId: payload.actorId,
    });

    return NextResponse.json(
      {
        success: true,
        visitId: result.visit.id,
        status: result.visit.status,
        message: 'Visita cancelada correctamente',
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('❌ Error cancelando visita:', error);

    if (error instanceof VisitNotFoundError) {
      return NextResponse.json({ error: 'Visita no encontrada', code: 'VISIT_NOT_FOUND' }, { status: 404 });
    }

    if (error instanceof CancelWindowExpiredError) {
      return NextResponse.json(
        {
          error: 'La visita está fuera de la ventana de cancelación',
          code: 'CANCEL_WINDOW_EXPIRED',
        },
        { status: 409 }
      );
    }

    if (error instanceof InvalidVisitTransitionError) {
      return NextResponse.json(
        {
          error: 'La visita no puede ser cancelada en su estado actual',
          code: 'INVALID_VISIT_TRANSITION',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        message: 'No se pudo cancelar la visita. Intenta nuevamente.',
      },
      { status: 500 }
    );
  }
}
