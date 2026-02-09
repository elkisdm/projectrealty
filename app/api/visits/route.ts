import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter } from '@lib/rate-limit';
import { logger } from '@lib/logger';
import type { Agent, CreateVisitRequest, CreateVisitResponse } from '@/types/visit';
import { getVisitRepository, SlotUnavailableError } from '@lib/visits/repository';

const rateLimiter = createRateLimiter({ windowMs: 60_000, max: 10 });

const createVisitSchema = z.object({
  listingId: z.string().min(1, 'listingId es requerido'),
  slotId: z.string().min(1, 'slotId es requerido'),
  userId: z.string().min(1, 'userId es requerido'),
  channel: z.enum(['whatsapp', 'web']).optional().default('web'),
  idempotencyKey: z.string().min(1, 'idempotencyKey es requerido'),
  contactData: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      rut: z.string().optional(),
    })
    .optional(),
});

const mockAgents: Record<string, Agent> = {
  agent_001: {
    id: 'agent_001',
    name: 'María González',
    phone: '+56912345678',
    whatsappNumber: '+56912345678',
    email: 'maria@hommie.cl',
  },
  agent_002: {
    id: 'agent_002',
    name: 'Carlos Silva',
    phone: '+56987654321',
    whatsappNumber: '+56987654321',
    email: 'carlos@hommie.cl',
  },
};

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimitResult = await rateLimiter.check(ip);
    if (!rateLimitResult.ok) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: rateLimitResult.retryAfter },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Window': '60',
          },
        }
      );
    }

    const idempotencyKey = request.headers.get('idempotency-key');
    if (!idempotencyKey) {
      return NextResponse.json({ error: 'Header Idempotency-Key es requerido' }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
    }

    const validation = createVisitSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const visitData = validation.data;
    if (visitData.idempotencyKey !== idempotencyKey) {
      return NextResponse.json({ error: 'Idempotency-Key del header no coincide con el del body' }, { status: 400 });
    }

    const repository = getVisitRepository();
    const { visit, slot } = await repository.createVisit(visitData as CreateVisitRequest & { channel: 'web' | 'whatsapp' });

    const agent = mockAgents[visit.agentId] || mockAgents.agent_001;
    const response: CreateVisitResponse = {
      visitId: visit.id,
      status: visit.status === 'confirmed' ? 'confirmed' : 'pending',
      agent: {
        name: agent.name,
        phone: agent.phone,
        whatsappNumber: agent.whatsappNumber,
      },
      slot: {
        startTime: slot.startTime,
        endTime: slot.endTime,
      },
      confirmationMessage: `¡Perfecto! Tu visita ha sido confirmada para el ${new Date(slot.startTime).toLocaleDateString(
        'es-CL'
      )} a las ${new Date(slot.startTime).toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit',
      })}. Te contactaremos por WhatsApp para confirmar los detalles.`,
    };

    logger.log(`✅ Visita creada: ${visit.id} para listing ${visit.listingId} en slot ${visit.slotId}`);

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    logger.error('❌ Error creando visita:', error);

    if (error instanceof SlotUnavailableError) {
      return NextResponse.json(
        {
          error: 'Slot no disponible',
          message: 'El horario seleccionado ya no está disponible. Por favor, selecciona otro horario.',
          code: 'SLOT_UNAVAILABLE',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        message: 'No se pudo crear la visita. Por favor, intenta nuevamente.',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId es requerido' }, { status: 400 });
    }

    const repository = getVisitRepository();
    const data = await repository.getVisitsByUser(userId);
    return NextResponse.json(data);
  } catch (error) {
    logger.error('❌ Error obteniendo visitas:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
