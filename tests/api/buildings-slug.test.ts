/**
 * @jest-environment node
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { GET } from '@/app/api/buildings/[slug]/route';
import { UnitDetailResponse, UnitSchema } from '@/schemas/models';
import type { Unit } from '@/schemas/models';

// Mock del processor
let mockGetUnitBySlug: jest.Mock;

jest.mock('@/lib/supabase-data-processor', () => {
  const mockGetUnitBySlug = jest.fn();
  return {
    getSupabaseProcessor: jest.fn().mockResolvedValue({
      getUnitBySlug: mockGetUnitBySlug,
    }),
    // Exportar para poder acceder desde los tests
    __mockGetUnitBySlug: mockGetUnitBySlug,
  };
});

// Obtener referencia al mock después de que jest.mock se ejecute
beforeAll(() => {
  const processorModule = require('@/lib/supabase-data-processor');
  mockGetUnitBySlug = processorModule.__mockGetUnitBySlug;
});

// Mock del rate limiter - por defecto permite todas las requests
let mockRateLimiterCheck: jest.Mock;

jest.mock('@lib/rate-limit', () => {
  const mockCheck = jest.fn().mockResolvedValue({ ok: true });
  return {
    createRateLimiter: jest.fn(() => ({
      check: mockCheck,
    })),
    __mockCheck: mockCheck,
  };
});

beforeAll(() => {
  const rateLimitModule = require('@lib/rate-limit');
  mockRateLimiterCheck = rateLimitModule.__mockCheck;
});

// Mock del logger
jest.mock('@lib/logger', () => ({
  logger: {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('GET /api/buildings/[slug]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Resetear mocks a valores por defecto
    mockRateLimiterCheck.mockResolvedValue({ ok: true });
  });

  const createRequest = (slug: string) => {
    return new Request(`http://localhost:3000/api/buildings/${slug}`);
  };

  const createContext = (slug: string) => ({
    params: Promise.resolve({ slug }),
  });

  const mockUnit: Unit = {
    id: 'unit-123',
    slug: 'edificio-test-unidad-123',
    codigoUnidad: '101',
    buildingId: 'building-456',
    tipologia: 'Estudio',
    price: 500000,
    disponible: true,
    dormitorios: 1,
    banos: 1,
    garantia: 500000,
    gastoComun: 50000,
    images: ['/images/unit-123.jpg'],
  };

  const mockBuilding = {
    id: 'building-456',
    name: 'Edificio Test',
    slug: 'edificio-test',
    comuna: 'Providencia',
    address: 'Av. Test 123',
    amenities: ['Piscina', 'Gimnasio'],
    gallery: ['/images/building-1.jpg', '/images/building-2.jpg'],
  };

  const mockSimilarUnit: Unit = {
    id: 'unit-789',
    slug: 'edificio-test-unidad-789',
    codigoUnidad: '102',
    buildingId: 'building-456',
    tipologia: 'Estudio',
    price: 520000,
    disponible: true,
    dormitorios: 1,
    banos: 1,
    garantia: 520000,
    gastoComun: 50000,
    images: ['/images/unit-789.jpg'],
  };

  describe('Respuesta del endpoint', () => {
    test('GET con slug válido retorna unit + building', async () => {
      mockGetUnitBySlug.mockResolvedValue({
        unit: mockUnit,
        building: mockBuilding,
      });

      const request = createRequest('edificio-test-unidad-123');
      const context = createContext('edificio-test-unidad-123');
      const response = await GET(request, context);
      const data = await response.json() as UnitDetailResponse;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('unit');
      expect(data).toHaveProperty('building');
      expect(data.unit.id).toBe('unit-123');
      expect(data.building.id).toBe('building-456');
      expect(data.building.amenities).toEqual(['Piscina', 'Gimnasio']);
      expect(data.building.gallery).toEqual(['/images/building-1.jpg', '/images/building-2.jpg']);
    });

    test('GET con slug válido incluye unidades similares si existen', async () => {
      mockGetUnitBySlug.mockResolvedValue({
        unit: mockUnit,
        building: mockBuilding,
        similarUnits: [mockSimilarUnit],
      });

      const request = createRequest('edificio-test-unidad-123');
      const context = createContext('edificio-test-unidad-123');
      const response = await GET(request, context);
      const data = await response.json() as UnitDetailResponse;

      expect(response.status).toBe(200);
      expect(data.similarUnits).toBeDefined();
      expect(Array.isArray(data.similarUnits)).toBe(true);
      expect(data.similarUnits?.length).toBe(1);
      expect(data.similarUnits?.[0].id).toBe('unit-789');
    });

    test('GET con slug válido no incluye similarUnits si está vacío', async () => {
      mockGetUnitBySlug.mockResolvedValue({
        unit: mockUnit,
        building: mockBuilding,
        similarUnits: [],
      });

      const request = createRequest('edificio-test-unidad-123');
      const context = createContext('edificio-test-unidad-123');
      const response = await GET(request, context);
      const data = await response.json() as UnitDetailResponse;

      expect(response.status).toBe(200);
      expect(data.similarUnits).toBeUndefined();
    });

    test('unit cumple con UnitSchema', async () => {
      mockGetUnitBySlug.mockResolvedValue({
        unit: mockUnit,
        building: mockBuilding,
      });

      const request = createRequest('edificio-test-unidad-123');
      const context = createContext('edificio-test-unidad-123');
      const response = await GET(request, context);
      const data = await response.json() as UnitDetailResponse;

      expect(response.status).toBe(200);
      const validation = UnitSchema.safeParse(data.unit);
      expect(validation.success).toBe(true);
    });
  });

  describe('Manejo de errores', () => {
    test('GET con slug inválido retorna 404', async () => {
      mockGetUnitBySlug.mockResolvedValue(null);

      const request = createRequest('slug-inexistente');
      const context = createContext('slug-inexistente');
      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Unidad no encontrada');
    });

    test('GET con slug vacío retorna 400', async () => {
      const request = createRequest('');
      const context = createContext('');
      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Parámetros inválidos');
      expect(data).toHaveProperty('details');
    });
  });

  describe('Rate limiting', () => {
    test('Rate limiting retorna 429 después de exceder límite', async () => {
      mockRateLimiterCheck.mockResolvedValue({
        ok: false,
        retryAfter: 60,
      });

      const request = createRequest('edificio-test-unidad-123');
      const context = createContext('edificio-test-unidad-123');
      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Rate limit exceeded');
      expect(response.headers.get('Retry-After')).toBe('60');
      expect(response.headers.get('X-RateLimit-Limit')).toBe('20');
    });
  });

  describe('Unidades similares', () => {
    test('Unidades similares excluyen unidad actual', async () => {
      mockGetUnitBySlug.mockResolvedValue({
        unit: mockUnit,
        building: mockBuilding,
        similarUnits: [mockSimilarUnit],
      });

      const request = createRequest('edificio-test-unidad-123');
      const context = createContext('edificio-test-unidad-123');
      const response = await GET(request, context);
      const data = await response.json() as UnitDetailResponse;

      expect(response.status).toBe(200);
      if (data.similarUnits) {
        const currentUnitInSimilar = data.similarUnits.some(u => u.id === mockUnit.id);
        expect(currentUnitInSimilar).toBe(false);
      }
    });

    test('Unidades similares limitadas a máximo 6', async () => {
      // El código real limita a 6 unidades similares (ver getUnitBySlug en supabase-data-processor.ts)
      // El mock debe retornar 6 unidades para simular el comportamiento real
      const manySimilarUnits = Array.from({ length: 6 }, (_, i) => ({
        ...mockSimilarUnit,
        id: `unit-${i}`,
        slug: `edificio-test-unidad-${i}`,
      }));

      mockGetUnitBySlug.mockResolvedValue({
        unit: mockUnit,
        building: mockBuilding,
        similarUnits: manySimilarUnits,
      });

      const request = createRequest('edificio-test-unidad-123');
      const context = createContext('edificio-test-unidad-123');
      const response = await GET(request, context);
      const data = await response.json() as UnitDetailResponse;

      expect(response.status).toBe(200);
      if (data.similarUnits) {
        expect(data.similarUnits.length).toBeLessThanOrEqual(6);
        expect(data.similarUnits.length).toBe(6);
      }
    });
  });

  describe('Información del edificio', () => {
    test('Building incluye campos requeridos: id, name, slug, address, comuna, amenities, gallery', async () => {
      mockGetUnitBySlug.mockResolvedValue({
        unit: mockUnit,
        building: mockBuilding,
      });

      const request = createRequest('edificio-test-unidad-123');
      const context = createContext('edificio-test-unidad-123');
      const response = await GET(request, context);
      const data = await response.json() as UnitDetailResponse;

      expect(response.status).toBe(200);
      expect(data.building).toHaveProperty('id');
      expect(data.building).toHaveProperty('name');
      expect(data.building).toHaveProperty('slug');
      expect(data.building).toHaveProperty('address');
      expect(data.building).toHaveProperty('comuna');
      expect(data.building).toHaveProperty('amenities');
      expect(data.building).toHaveProperty('gallery');
      expect(Array.isArray(data.building.amenities)).toBe(true);
      expect(Array.isArray(data.building.gallery)).toBe(true);
    });

    test('Building maneja arrays vacíos para amenities y gallery', async () => {
      mockGetUnitBySlug.mockResolvedValue({
        unit: mockUnit,
        building: {
          ...mockBuilding,
          amenities: [],
          gallery: [],
        },
      });

      const request = createRequest('edificio-test-unidad-123');
      const context = createContext('edificio-test-unidad-123');
      const response = await GET(request, context);
      const data = await response.json() as UnitDetailResponse;

      expect(response.status).toBe(200);
      expect(data.building.amenities).toEqual([]);
      expect(data.building.gallery).toEqual([]);
    });
  });

  describe('Manejo de errores del servidor', () => {
    test('Error interno del servidor retorna 500', async () => {
      mockGetUnitBySlug.mockRejectedValue(new Error('Database error'));

      const request = createRequest('edificio-test-unidad-123');
      const context = createContext('edificio-test-unidad-123');
      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Error interno del servidor');
    });
  });
});


