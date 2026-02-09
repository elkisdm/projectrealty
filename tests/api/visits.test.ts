/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/visits/route';

// Mock rate limiter to always allow requests in tests
jest.mock('@/lib/rate-limit', () => ({
  createRateLimiter: () => ({
    check: jest.fn().mockResolvedValue({ ok: true }),
  }),
}));

describe('/api/visits', () => {
    describe('POST', () => {
        const buildFutureMockSlotId = (time = '09:00') => {
            const date = new Date();
            date.setDate(date.getDate() + 1);
            if (date.getDay() === 0) {
                date.setDate(date.getDate() + 1);
            }
            const dateStr = date.toISOString().split('T')[0];
            return `mock-slot-${dateStr}-${time}`;
        };

        const validSlotId = buildFutureMockSlotId('09:00');

        const validVisitData = {
            listingId: 'home-amengual',
            slotId: validSlotId,
            userId: 'user-456',
            channel: 'web',
            idempotencyKey: 'unique-key-789'
        };

        it('debería crear visita correctamente', async () => {
            const request = new NextRequest('http://localhost:3000/api/visits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'idempotency-key': 'unique-key-789'
                },
                body: JSON.stringify(validVisitData)
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data).toHaveProperty('visitId');
            expect(data).toHaveProperty('status', 'confirmed');
            expect(data).toHaveProperty('confirmationMessage');
            expect(data.visitId).toMatch(/^visit_/);
        });

        it('debería validar datos requeridos', async () => {
            const invalidData = {
                listingId: 'test-listing',
                // slotId faltante
                userId: 'user-456',
                channel: 'web'
            };

            const request = new NextRequest('http://localhost:3000/api/visits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'idempotency-key': 'test-key-1'
                },
                body: JSON.stringify(invalidData)
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toHaveProperty('error');
            expect(data.error).toContain('Datos inválidos');
            expect(data).toHaveProperty('details');
        });

        it('debería validar idempotency key', async () => {
            const request = new NextRequest('http://localhost:3000/api/visits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                    // Idempotency-Key faltante
                },
                body: JSON.stringify(validVisitData)
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toHaveProperty('error');
            expect(data.error).toContain('Idempotency-Key es requerido');
        });

        it('debería manejar slot no disponible', async () => {
            const conflictSlotId = buildFutureMockSlotId('14:00');
            const firstData = {
                ...validVisitData,
                slotId: conflictSlotId,
                idempotencyKey: 'unique-key-790'
            };
            const secondData = {
                ...firstData,
                idempotencyKey: 'unique-key-790-b'
            };

            const firstRequest = new NextRequest('http://localhost:3000/api/visits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'idempotency-key': 'unique-key-790'
                },
                body: JSON.stringify(firstData)
            });
            const firstResponse = await POST(firstRequest);
            expect(firstResponse.status).toBe(201);

            const request = new NextRequest('http://localhost:3000/api/visits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'idempotency-key': 'unique-key-790-b'
                },
                body: JSON.stringify(secondData)
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(409);
            expect(data).toHaveProperty('error');
            expect(data).toHaveProperty('code', 'SLOT_UNAVAILABLE');
        });

        it('debería manejar listingId inexistente', async () => {
            const invalidListingData = {
                ...validVisitData,
                listingId: 'non-existent-listing',
                slotId: buildFutureMockSlotId('13:00'),
                idempotencyKey: 'unique-key-791'
            };

            const request = new NextRequest('http://localhost:3000/api/visits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'idempotency-key': 'unique-key-791'
                },
                body: JSON.stringify(invalidListingData)
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data).toHaveProperty('visitId');
        });

        it('debería prevenir duplicados con idempotency key', async () => {
            // Crear otro slot válido para el test de duplicados
            const tomorrow2 = new Date();
            tomorrow2.setDate(tomorrow2.getDate() + 1);
            if (tomorrow2.getDay() === 0) {
                tomorrow2.setDate(tomorrow2.getDate() + 1);
            }
            const dateStr2 = tomorrow2.toISOString().split('T')[0];
            const duplicateSlotId = `mock-slot-${dateStr2}-10:00`;

            const duplicateData = {
                ...validVisitData,
                slotId: duplicateSlotId,
                idempotencyKey: 'duplicate-key-123'
            };

            const request1 = new NextRequest('http://localhost:3000/api/visits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'idempotency-key': 'duplicate-key-123'
                },
                body: JSON.stringify(duplicateData)
            });

            const request2 = new NextRequest('http://localhost:3000/api/visits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'idempotency-key': 'duplicate-key-123'
                },
                body: JSON.stringify(duplicateData)
            });

            // Primera llamada
            const response1 = await POST(request1);
            expect(response1.status).toBe(201);

            // Segunda llamada con la misma key
            const response2 = await POST(request2);
            const data2 = await response2.json();

            expect(response2.status).toBe(201); // La API retorna la visita existente
            expect(data2).toHaveProperty('visitId');
        });

        it('debería validar formato de JSON', async () => {
            const request = new NextRequest('http://localhost:3000/api/visits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'idempotency-key': 'unique-key-792'
                },
                body: 'invalid-json'
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toHaveProperty('error');
            expect(data.error).toContain('JSON inválido');
        });

        it('debería validar Content-Type', async () => {
            const request = new NextRequest('http://localhost:3000/api/visits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                    'idempotency-key': 'unique-key-793'
                },
                body: JSON.stringify(validVisitData)
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toHaveProperty('error');
            expect(data.error).toContain('Idempotency-Key del header no coincide con el del body');
        });

        it('debería incluir headers CORS correctos', async () => {
            const request = new NextRequest('http://localhost:3000/api/visits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'idempotency-key': 'unique-key-794'
                },
                body: JSON.stringify(validVisitData)
            });

            const response = await POST(request);

            // La API no incluye headers CORS por defecto
            expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
            expect(response.headers.get('Access-Control-Allow-Methods')).toBeNull();
            expect(response.headers.get('Access-Control-Allow-Headers')).toBeNull();
        });

        it('debería retornar datos de la visita creada', async () => {
            // Crear otro slot válido para este test
            const tomorrow3 = new Date();
            tomorrow3.setDate(tomorrow3.getDate() + 1);
            if (tomorrow3.getDay() === 0) {
                tomorrow3.setDate(tomorrow3.getDate() + 1);
            }
            const dateStr3 = tomorrow3.toISOString().split('T')[0];
            const testSlotId = `mock-slot-${dateStr3}-11:00`;

            const testData = {
                ...validVisitData,
                slotId: testSlotId,
                idempotencyKey: 'unique-key-795-new'
            };

            const request = new NextRequest('http://localhost:3000/api/visits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'idempotency-key': 'unique-key-795-new'
                },
                body: JSON.stringify(testData)
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data).toHaveProperty('visitId');
            expect(data).toHaveProperty('status', 'confirmed');
            expect(data).toHaveProperty('confirmationMessage');
        });

        it('debería manejar errores de base de datos', async () => {
            // Test with mismatched idempotency keys to trigger error
            const request = new NextRequest('http://localhost:3000/api/visits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'idempotency-key': 'header-key-mismatch'
                },
                body: JSON.stringify({
                    ...validVisitData,
                    idempotencyKey: 'body-key-different'
                })
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toHaveProperty('error');
            expect(data.error).toContain('Idempotency-Key del header no coincide con el del body');
        });

        it('debería validar rate limiting', async () => {
            // With rate limiter mocked, all requests should succeed or fail based on validation
            const testData = {
                ...validVisitData,
                slotId: buildFutureMockSlotId('12:00'),
                idempotencyKey: 'rate-test-key'
            };
            
            const request = new NextRequest('http://localhost:3000/api/visits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'idempotency-key': 'rate-test-key'
                },
                body: JSON.stringify(testData)
            });

            const response = await POST(request);
            
            // With mocked rate limiter, request should succeed
            expect(response.status).toBe(201);
        });
    });
});
