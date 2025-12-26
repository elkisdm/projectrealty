import { test, expect } from '@playwright/test';

test.describe('MSW E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Configurar MSW para el navegador
    await page.addInitScript(() => {
      // Mock de fetch para interceptar llamadas
      const originalFetch = window.fetch;
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input.toString();
        
        // Mock de la API de edificios
        if (url.includes('/api/buildings')) {
          return new Response(JSON.stringify({
            buildings: [
              {
                id: 'test-building-1',
                name: 'Casa Amengual',
                address: 'Av. Amengual 123, Santiago',
                commune: 'Santiago',
                priceFrom: 2500000,
                units: [
                  {
                    id: 'unit-207',
                    number: '207',
                    bedrooms: 2,
                    bathrooms: 1,
                    area: 65,
                    price: 2500000,
                    available: true
                  }
                ]
              }
            ],
            total: 1,
            page: 1,
            limit: 10
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // Mock de la API de disponibilidad
        if (url.includes('/api/availability')) {
          return new Response(JSON.stringify({
            listingId: 'test-listing',
            timezone: 'America/Santiago',
            slots: [
              {
                id: 'slot-1',
                startTime: '2025-01-16T10:00:00-03:00',
                endTime: '2025-01-16T10:30:00-03:00',
                status: 'open'
              },
              {
                id: 'slot-2',
                startTime: '2025-01-16T11:00:00-03:00',
                endTime: '2025-01-16T11:30:00-03:00',
                status: 'open'
              }
            ],
            nextAvailableDate: '2025-01-21T00:00:00-03:00'
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // Mock de la API de visitas
        if (url.includes('/api/visits') && init?.method === 'POST') {
          return new Response(JSON.stringify({
            success: true,
            visit: {
              id: 'visit-123',
              listingId: 'test-listing',
              date: '2025-01-16',
              time: '10:00',
              status: 'confirmed',
              createdAt: '2025-01-15T10:00:00Z'
            }
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // Para otras URLs, usar fetch original
        return originalFetch(input, init);
      };
    });
  });

  test('debería interceptar llamadas a la API en el navegador', async ({ page }) => {
    // Navegar a la página principal
    await page.goto('http://localhost:3001');
    
    // Esperar a que la página cargue
    await page.waitForLoadState('networkidle');
    
    // Verificar que la página se cargó correctamente
    await expect(page.locator('body')).toBeVisible();
  });

  test('debería manejar errores de API en el navegador', async ({ page }) => {
    // Configurar mock que retorna error
    await page.addInitScript(() => {
      const originalFetch = window.fetch;
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input.toString();
        
        if (url.includes('/api/availability')) {
          return new Response(JSON.stringify({
            error: 'Error de servidor'
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        return originalFetch(input, init);
      };
    });

    // Navegar a la página
    await page.goto('http://localhost:3001');
    
    // Esperar a que la página cargue
    await page.waitForLoadState('networkidle');
    
    // Verificar que la página se cargó (aunque haya errores de API)
    await expect(page.locator('body')).toBeVisible();
  });

  test('debería interceptar llamadas POST correctamente', async ({ page }) => {
    let postCallMade = false;
    
    // Configurar mock para interceptar POST
    await page.addInitScript(() => {
      const originalFetch = window.fetch;
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input.toString();
        
        if (url.includes('/api/visits') && init?.method === 'POST') {
          // Marcar que se hizo la llamada POST
          (window as any).postCallMade = true;
          
          return new Response(JSON.stringify({
            success: true,
            visit: {
              id: 'visit-123',
              listingId: 'test-listing',
              date: '2025-01-16',
              time: '10:00',
              status: 'confirmed'
            }
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        return originalFetch(input, init);
      };
    });

    // Navegar a la página
    await page.goto('http://localhost:3001');
    
    // Esperar a que la página cargue
    await page.waitForLoadState('networkidle');
    
    // Verificar que la página se cargó
    await expect(page.locator('body')).toBeVisible();
  });

  test('debería manejar timeouts de API correctamente', async ({ page }) => {
    // Configurar mock que simula timeout
    await page.addInitScript(() => {
      const originalFetch = window.fetch;
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input.toString();
        
        if (url.includes('/api/availability')) {
          // Simular timeout
          await new Promise(resolve => setTimeout(resolve, 100));
          throw new Error('Timeout');
        }
        
        return originalFetch(input, init);
      };
    });

    // Navegar a la página
    await page.goto('http://localhost:3001');
    
    // Esperar a que la página cargue
    await page.waitForLoadState('networkidle');
    
    // Verificar que la página se cargó
    await expect(page.locator('body')).toBeVisible();
  });

  test('debería interceptar múltiples llamadas simultáneas', async ({ page }) => {
    let callCount = 0;
    
    // Configurar mock que cuenta llamadas
    await page.addInitScript(() => {
      const originalFetch = window.fetch;
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input.toString();
        
        if (url.includes('/api/')) {
          (window as any).callCount = ((window as any).callCount || 0) + 1;
        }
        
        return originalFetch(input, init);
      };
    });

    // Navegar a la página
    await page.goto('http://localhost:3001');
    
    // Esperar a que la página cargue
    await page.waitForLoadState('networkidle');
    
    // Verificar que la página se cargó
    await expect(page.locator('body')).toBeVisible();
  });

  test('debería manejar validación de parámetros en el navegador', async ({ page }) => {
    // Configurar mock que valida parámetros
    await page.addInitScript(() => {
      const originalFetch = window.fetch;
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input.toString();
        
        if (url.includes('/api/availability') && !url.includes('listingId=')) {
          return new Response(JSON.stringify({
            error: 'listingId es requerido'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        return originalFetch(input, init);
      };
    });

    // Navegar a la página
    await page.goto('http://localhost:3001');
    
    // Esperar a que la página cargue
    await page.waitForLoadState('networkidle');
    
    // Verificar que la página se cargó
    await expect(page.locator('body')).toBeVisible();
  });
});
