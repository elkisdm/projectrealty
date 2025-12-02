/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/availability/route';

// Mock de datos
const mockAvailabilityData = {
    listingId: 'test-listing',
    timezone: 'America/Santiago',
    slots: [
        {
            id: 'slot-1',
            startTime: '2025-01-16T10:00:00-03:00',
            endTime: '2025-01-16T10:30:00-03:00',
            status: 'open' as const
        },
        {
            id: 'slot-2',
            startTime: '2025-01-16T11:00:00-03:00',
            endTime: '2025-01-16T11:30:00-03:00',
            status: 'open' as const
        },
        {
            id: 'slot-3',
            startTime: '2025-01-17T10:00:00-03:00',
            endTime: '2025-01-17T10:30:00-03:00',
            status: 'open' as const
        }
    ],
    nextAvailableDate: '2025-01-21T00:00:00-03:00'
};

describe('/api/availability', () => {
    describe('GET', () => {
        it('debería retornar disponibilidad correctamente', async () => {
            const request = new NextRequest('http://localhost:3000/api/availability?listingId=test-listing&start=2025-01-15T00:00:00-03:00&end=2025-01-20T00:00:00-03:00');
            
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toHaveProperty('listingId', 'test-listing');
            expect(data).toHaveProperty('timezone', 'America/Santiago');
            expect(data).toHaveProperty('slots');
            expect(data).toHaveProperty('nextAvailableDate');
            expect(Array.isArray(data.slots)).toBe(true);
        });

        it('debería filtrar slots por rango de fechas', async () => {
            const request = new NextRequest('http://localhost:3000/api/availability?listingId=test-listing&start=2025-01-16T00:00:00-03:00&end=2025-01-16T23:59:59-03:00');
            
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            
            // Verificar que solo se incluyen slots del 16 de enero
            data.slots.forEach((slot: any) => {
                expect(slot.startTime).toMatch(/2025-01-16/);
            });
        });

        it('debería manejar parámetros faltantes', async () => {
            const request = new NextRequest('http://localhost:3000/api/availability');
            
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toHaveProperty('error');
            expect(data.error).toContain('listingId');
        });

        it('debería validar formato de fechas', async () => {
            const request = new NextRequest('http://localhost:3000/api/availability?listingId=test-listing&start=invalid-date&end=2025-01-20T00:00:00-03:00');
            
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toHaveProperty('error');
            expect(data.error).toContain('fecha');
        });

        it('debería manejar listingId inexistente', async () => {
            const request = new NextRequest('http://localhost:3000/api/availability?listingId=non-existent&start=2025-01-15T00:00:00-03:00&end=2025-01-20T00:00:00-03:00');
            
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data).toHaveProperty('error');
            expect(data.error).toContain('no encontrado');
        });

        it('debería retornar slots disponibles únicamente', async () => {
            const request = new NextRequest('http://localhost:3000/api/availability?listingId=test-listing&start=2025-01-15T00:00:00-03:00&end=2025-01-20T00:00:00-03:00');
            
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            
            // Verificar que todos los slots tienen status 'open'
            data.slots.forEach((slot: any) => {
                expect(slot.status).toBe('open');
            });
        });

        it('debería calcular nextAvailableDate correctamente', async () => {
            const request = new NextRequest('http://localhost:3000/api/availability?listingId=test-listing&start=2025-01-15T00:00:00-03:00&end=2025-01-20T00:00:00-03:00');
            
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.nextAvailableDate).toBeDefined();
            
            // Verificar que nextAvailableDate es una fecha válida
            const nextDate = new Date(data.nextAvailableDate);
            expect(nextDate).toBeInstanceOf(Date);
            expect(nextDate.getTime()).not.toBeNaN();
        });

        it('debería manejar timezone correctamente', async () => {
            const request = new NextRequest('http://localhost:3000/api/availability?listingId=test-listing&start=2025-01-15T00:00:00-03:00&end=2025-01-20T00:00:00-03:00');
            
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.timezone).toBe('America/Santiago');
        });

        it('debería retornar array vacío cuando no hay slots disponibles', async () => {
            const request = new NextRequest('http://localhost:3000/api/availability?listingId=test-listing&start=2025-12-01T00:00:00-03:00&end=2025-12-31T00:00:00-03:00');
            
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.slots).toEqual([]);
        });

        it('debería incluir headers CORS correctos', async () => {
            const request = new NextRequest('http://localhost:3000/api/availability?listingId=test-listing&start=2025-01-15T00:00:00-03:00&end=2025-01-20T00:00:00-03:00');
            
            const response = await GET(request);

            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
            expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, OPTIONS');
            expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization');
        });
    });
});
