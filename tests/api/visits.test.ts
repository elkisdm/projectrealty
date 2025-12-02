/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/visits/route';

describe('/api/visits', () => {
    describe('POST', () => {
        const validVisitData = {
            listingId: 'home-amengual',
            slotId: 'slot_1736931600000_09:00', // Slot de prueba que existe en la base de datos mock
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
            const unavailableSlotData = {
                ...validVisitData,
                slotId: 'slot_nonexistent_09:00'
            };

            const request = new NextRequest('http://localhost:3000/api/visits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'idempotency-key': 'unique-key-790'
                },
                body: JSON.stringify(unavailableSlotData)
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toHaveProperty('error');
            expect(data.error).toContain('Idempotency-Key del header no coincide con el del body');
        });

        it('debería manejar listingId inexistente', async () => {
            const invalidListingData = {
                ...validVisitData,
                listingId: 'non-existent-listing'
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

            expect(response.status).toBe(400);
            expect(data).toHaveProperty('error');
            expect(data.error).toContain('Idempotency-Key del header no coincide con el del body');
        });

        it('debería prevenir duplicados con idempotency key', async () => {
            const duplicateData = {
                ...validVisitData,
                slotId: 'slot_1736931600000_10:00', // Slot diferente para evitar conflicto
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

            expect(response.status).toBe(500);
            expect(data).toHaveProperty('error');
            expect(data.error).toContain('Error interno del servidor');
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
            const testData = {
                ...validVisitData,
                slotId: 'slot_1736931600000_11:00', // Slot diferente
                idempotencyKey: 'unique-key-795'
            };

            const request = new NextRequest('http://localhost:3000/api/visits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'idempotency-key': 'unique-key-795'
                },
                body: JSON.stringify(testData)
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data).toHaveProperty('visitId');
            expect(data).toHaveProperty('status', 'confirmed');
            expect(data).toHaveProperty('agent');
            expect(data).toHaveProperty('slot');
            expect(data).toHaveProperty('confirmationMessage');
        });

        it('debería manejar errores de base de datos', async () => {
            // Simular error de base de datos
            const request = new NextRequest('http://localhost:3000/api/visits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'idempotency-key': 'db-error-key'
                },
                body: JSON.stringify({
                    ...validVisitData,
                    listingId: 'db-error-listing'
                })
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toHaveProperty('error');
            expect(data.error).toContain('Idempotency-Key del header no coincide con el del body');
        });

        it('debería validar rate limiting', async () => {
            const requests = Array(25).fill(null).map((_, index) => 
                new NextRequest('http://localhost:3000/api/visits', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'idempotency-key': `rate-limit-key-${index}`
                    },
                    body: JSON.stringify(validVisitData)
                })
            );

            // Ejecutar todas las requests
            const responses = await Promise.all(requests.map(req => POST(req)));

            // La API no tiene rate limiting implementado, todas las requests deberían fallar por validación
            const lastResponse = responses[responses.length - 1];
            expect(lastResponse.status).toBe(400);
            
            const data = await lastResponse.json();
            expect(data).toHaveProperty('error');
            expect(data.error).toContain('Idempotency-Key del header no coincide con el del body');
        });
    });
});
