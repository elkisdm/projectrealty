/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST as createVisit } from '@/app/api/visits/route';
import { POST as cancelVisit } from '@/app/api/visits/[id]/cancel/route';
import { POST as rescheduleVisit } from '@/app/api/visits/[id]/reschedule/route';

jest.mock('@/lib/rate-limit', () => ({
  createRateLimiter: () => ({
    check: jest.fn().mockResolvedValue({ ok: true }),
  }),
}));

function ctx(id: string) {
  return { params: Promise.resolve({ id }) };
}

async function createVisitFor(slotId: string, idempotencyKey: string) {
  const body = {
    listingId: 'home-amengual',
    slotId,
    userId: `user-${idempotencyKey}`,
    channel: 'web',
    idempotencyKey,
  };

  const request = new NextRequest('http://localhost:3000/api/visits', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'idempotency-key': idempotencyKey,
    },
    body: JSON.stringify(body),
  });

  const response = await createVisit(request);
  const json = await response.json();
  return { response, json };
}

describe('/api/visits/:id cancel/reschedule', () => {
  it('cancela una visita activa', async () => {
    const created = await createVisitFor('mock-slot-2035-01-10-10:00', 'cancel-flow-1');
    expect(created.response.status).toBe(201);

    const request = new NextRequest('http://localhost:3000/api/visits/any/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'No puedo asistir' }),
    });
    const response = await cancelVisit(request, ctx(created.json.visitId));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toMatchObject({
      success: true,
      visitId: created.json.visitId,
      status: 'canceled',
    });
  });

  it('rechaza cancelar dos veces la misma visita', async () => {
    const created = await createVisitFor('mock-slot-2035-01-10-11:00', 'cancel-flow-2');
    expect(created.response.status).toBe(201);

    const request = new NextRequest('http://localhost:3000/api/visits/any/cancel', { method: 'POST' });
    const first = await cancelVisit(request, ctx(created.json.visitId));
    expect(first.status).toBe(200);

    const second = await cancelVisit(request, ctx(created.json.visitId));
    const secondJson = await second.json();

    expect(second.status).toBe(409);
    expect(secondJson.code).toBe('INVALID_VISIT_TRANSITION');
  });

  it('reagenda una visita a un nuevo slot abierto', async () => {
    const created = await createVisitFor('mock-slot-2035-01-10-12:00', 'reschedule-flow-1');
    expect(created.response.status).toBe(201);

    const request = new NextRequest('http://localhost:3000/api/visits/any/reschedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slotId: 'mock-slot-2035-01-10-12:30',
        reason: 'Cambio de horario',
      }),
    });
    const response = await rescheduleVisit(request, ctx(created.json.visitId));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.visitId).toBe(created.json.visitId);
    expect(json.slot.id).toBe('mock-slot-2035-01-10-12:30');
  });

  it('rechaza reagendar hacia slot ocupado', async () => {
    const base = await createVisitFor('mock-slot-2035-01-10-13:00', 'reschedule-flow-2');
    const occupied = await createVisitFor('mock-slot-2035-01-10-14:00', 'reschedule-flow-3');
    expect(base.response.status).toBe(201);
    expect(occupied.response.status).toBe(201);

    const request = new NextRequest('http://localhost:3000/api/visits/any/reschedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slotId: 'mock-slot-2035-01-10-14:00',
      }),
    });
    const response = await rescheduleVisit(request, ctx(base.json.visitId));
    const json = await response.json();

    expect(response.status).toBe(409);
    expect(json.code).toBe('SLOT_UNAVAILABLE');
  });
});
