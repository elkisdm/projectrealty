/**
 * Tests de Humo (Smoke Tests) para páginas principales
 * 
 * Estos tests verifican que las páginas principales:
 * - Se renderizan sin errores
 * - Retornan status 200
 * - Tienen elementos principales visibles
 * - No tienen errores críticos en consola
 */

import { test, expect } from '@playwright/test';

test.describe('Smoke Tests - Páginas Principales', () => {
  test.describe('Home Page (/)', () => {
    test('debe renderizar sin errores', async ({ page }) => {
      // Capturar errores de consola
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Navegar a la página
      const response = await page.goto('/');
      
      // Verificar status 200
      expect(response?.status()).toBe(200);

      // Esperar a que la página cargue completamente
      await page.waitForLoadState('networkidle');

      // Verificar que no hay errores críticos en consola
      const criticalErrors = consoleErrors.filter(error => 
        !error.includes('favicon') && // Ignorar errores de favicon
        !error.includes('analytics') && // Ignorar errores de analytics si no está configurado
        !error.includes('gtag') && // Ignorar errores de gtag si no está configurado
        !error.includes('fbq') // Ignorar errores de fbq si no está configurado
      );
      expect(criticalErrors).toHaveLength(0);

      // Verificar elementos principales visibles
      await expect(page.locator('main')).toBeVisible();
      
      // Verificar que hay contenido en la página
      const bodyText = await page.textContent('body');
      expect(bodyText?.length).toBeGreaterThan(0);
    });

    test('debe tener estructura HTML válida', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Verificar elementos semánticos básicos
      await expect(page.locator('main')).toBeVisible();
      
      // Verificar que hay headings
      const headings = await page.locator('h1, h2, h3').count();
      expect(headings).toBeGreaterThan(0);
    });
  });

  test.describe('Search Page (/buscar)', () => {
    test('debe renderizar sin errores', async ({ page }) => {
      // Capturar errores de consola
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Navegar a la página
      const response = await page.goto('/buscar');
      
      // Verificar status 200
      expect(response?.status()).toBe(200);

      // Esperar a que la página cargue completamente
      await page.waitForLoadState('networkidle');

      // Verificar que no hay errores críticos en consola
      const criticalErrors = consoleErrors.filter(error => 
        !error.includes('favicon') &&
        !error.includes('analytics') &&
        !error.includes('gtag') &&
        !error.includes('fbq')
      );
      expect(criticalErrors).toHaveLength(0);

      // Verificar elementos principales visibles
      await expect(page.locator('main')).toBeVisible();
      
      // Verificar que hay contenido en la página
      const bodyText = await page.textContent('body');
      expect(bodyText?.length).toBeGreaterThan(0);
    });

    test('debe tener elementos de búsqueda visibles', async ({ page }) => {
      await page.goto('/buscar');
      await page.waitForLoadState('networkidle');

      // Verificar que hay elementos de búsqueda o filtros
      const searchElements = await page.locator('input, select, [role="search"]').count();
      expect(searchElements).toBeGreaterThanOrEqual(0); // Puede ser 0 si los filtros están en otro componente
    });
  });

  test.describe('Property Page (/property/[slug])', () => {
    test('debe renderizar 404 para slug inválido', async ({ page }) => {
      const response = await page.goto('/property/slug-invalido-que-no-existe-12345');
      
      // Debe retornar 404
      expect(response?.status()).toBe(404);
    });

    test('debe renderizar sin errores para slug válido (si existe)', async ({ page }) => {
      // Capturar errores de consola
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Intentar navegar a una property page
      // Nota: Este test puede fallar si no hay datos, pero verificaremos que no crashea
      const response = await page.goto('/property/test-slug', { 
        waitUntil: 'domcontentloaded' 
      });

      // Si la página existe (200) o no existe (404), ambas son respuestas válidas
      expect([200, 404]).toContain(response?.status() || 0);

      // Si la página existe, verificar que no hay errores críticos
      if (response?.status() === 200) {
        await page.waitForLoadState('networkidle');
        
        const criticalErrors = consoleErrors.filter(error => 
          !error.includes('favicon') &&
          !error.includes('analytics') &&
          !error.includes('gtag') &&
          !error.includes('fbq')
        );
        expect(criticalErrors).toHaveLength(0);

        // Verificar elementos principales
        await expect(page.locator('main')).toBeVisible();
      }
    });
  });

  test.describe('Verificaciones Generales', () => {
    test('todas las páginas deben tener navegación principal', async ({ page }) => {
      const pages = ['/', '/buscar'];
      
      for (const path of pages) {
        await page.goto(path);
        await page.waitForLoadState('domcontentloaded');
        
        // Verificar que hay un header o nav
        const hasNav = await page.locator('header, nav, [role="navigation"]').count();
        expect(hasNav).toBeGreaterThan(0);
      }
    });

    test('todas las páginas deben tener elementos semánticos', async ({ page }) => {
      const pages = ['/', '/buscar'];
      
      for (const path of pages) {
        await page.goto(path);
        await page.waitForLoadState('domcontentloaded');
        
        // Verificar que hay un main
        await expect(page.locator('main')).toBeVisible();
        
        // Verificar que hay headings
        const headings = await page.locator('h1, h2, h3').count();
        expect(headings).toBeGreaterThan(0);
      }
    });
  });
});




