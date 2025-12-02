import { NextRequest } from 'next/server';
import { middleware } from '../../middleware';
import { isAuthenticatedAdmin } from '../../lib/admin/auth-middleware';

// Mock del módulo auth-middleware
jest.mock('../../lib/admin/auth-middleware', () => ({
  isAuthenticatedAdmin: jest.fn(),
}));

describe('middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockRequest = (pathname: string): NextRequest => {
    const url = new URL(`http://localhost:3000${pathname}`);
    return {
      nextUrl: url,
      cookies: {
        get: jest.fn(),
        set: jest.fn(),
        delete: jest.fn(),
        has: jest.fn(),
        clear: jest.fn(),
        getAll: jest.fn(),
      },
      headers: new Headers(),
    } as unknown as NextRequest;
  };

  describe('Rutas protegidas', () => {
    it('debería permitir acceso a /admin/login sin autenticación', async () => {
      const request = createMockRequest('/admin/login');
      const response = await middleware(request);
      
      expect(response.status).toBe(200);
      expect(isAuthenticatedAdmin).not.toHaveBeenCalled();
    });

    it('debería requerir autenticación para /admin', async () => {
      (isAuthenticatedAdmin as jest.Mock).mockResolvedValue(false);
      
      const request = createMockRequest('/admin');
      const response = await middleware(request);
      
      expect(isAuthenticatedAdmin).toHaveBeenCalled();
      expect(response.status).toBe(307); // Redirect
    });

    it('debería permitir acceso a /admin si está autenticado', async () => {
      (isAuthenticatedAdmin as jest.Mock).mockResolvedValue(true);
      
      const request = createMockRequest('/admin');
      const response = await middleware(request);
      
      expect(isAuthenticatedAdmin).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('debería requerir autenticación para /admin/buildings', async () => {
      (isAuthenticatedAdmin as jest.Mock).mockResolvedValue(false);
      
      const request = createMockRequest('/admin/buildings');
      const response = await middleware(request);
      
      expect(isAuthenticatedAdmin).toHaveBeenCalled();
      expect(response.status).toBe(307); // Redirect
    });
  });

  describe('API routes', () => {
    it('debería retornar 401 para /api/admin/stats sin autenticación', async () => {
      (isAuthenticatedAdmin as jest.Mock).mockResolvedValue(false);
      
      const request = createMockRequest('/api/admin/stats');
      const response = await middleware(request);
      
      expect(isAuthenticatedAdmin).toHaveBeenCalled();
      expect(response.status).toBe(401);
      
      const json = await response.json();
      expect(json.error).toBe('unauthorized');
    });

    it('debería permitir acceso a /api/admin/stats si está autenticado', async () => {
      (isAuthenticatedAdmin as jest.Mock).mockResolvedValue(true);
      
      const request = createMockRequest('/api/admin/stats');
      const response = await middleware(request);
      
      expect(isAuthenticatedAdmin).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe('Rutas públicas', () => {
    it('debería permitir acceso a rutas que no empiezan con /admin', async () => {
      const request = createMockRequest('/');
      const response = await middleware(request);
      
      expect(isAuthenticatedAdmin).not.toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('debería permitir acceso a /api/buildings (no admin)', async () => {
      const request = createMockRequest('/api/buildings');
      const response = await middleware(request);
      
      expect(isAuthenticatedAdmin).not.toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe('Redirect con query params', () => {
    it('debería preservar URL original en redirect a login', async () => {
      (isAuthenticatedAdmin as jest.Mock).mockResolvedValue(false);
      
      const request = createMockRequest('/admin/buildings');
      const response = await middleware(request);
      
      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/admin/login');
      expect(location).toContain('redirect=/admin/buildings');
    });
  });
});

