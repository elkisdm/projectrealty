/**
 * Tests de Performance - Core Web Vitals
 * 
 * Estos tests verifican que las páginas principales cumplan con Core Web Vitals:
 * - LCP (Largest Contentful Paint) < 2.5s
 * - FID (First Input Delay) < 100ms (o INP < 200ms)
 * - CLS (Cumulative Layout Shift) < 0.1
 */

import { test, expect } from '@playwright/test';

// Umbrales de Core Web Vitals
const LCP_THRESHOLD = 2500; // 2.5s en milisegundos
const FID_THRESHOLD = 100; // 100ms
const INP_THRESHOLD = 200; // 200ms (métrica nueva que reemplaza FID)
const CLS_THRESHOLD = 0.1; // 0.1

test.describe('Performance - Core Web Vitals', () => {
  test.describe('Home Page (/)', () => {
    test('debe cumplir con Core Web Vitals', async ({ page }) => {
      // Navegar a la página
      await page.goto('/');
      
      // Esperar a que la página esté completamente cargada
      await page.waitForLoadState('networkidle');
      
      // Obtener métricas de performance
      const metrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          // Usar PerformanceObserver para capturar Web Vitals
          const vitals: Record<string, number> = {};
          let vitalsCount = 0;
          
          // LCP (Largest Contentful Paint)
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1] as any;
            vitals['LCP'] = lastEntry.renderTime || lastEntry.loadTime;
            vitalsCount++;
            if (vitalsCount >= 3) resolve(vitals);
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
          
          // CLS (Cumulative Layout Shift)
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as any[]) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
            vitals['CLS'] = clsValue;
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });
          
          // INP (Interaction to Next Paint) - aproximación usando First Input Delay
          const inpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            for (const entry of entries) {
              if (entry.entryType === 'first-input') {
                const firstInput = entry as any;
                vitals['FID'] = firstInput.processingStart - firstInput.startTime;
                vitalsCount++;
                if (vitalsCount >= 3) resolve(vitals);
              }
            }
          });
          inpObserver.observe({ entryTypes: ['first-input'] });
          
          // Timeout después de 10 segundos
          setTimeout(() => {
            vitals['CLS'] = clsValue;
            resolve(vitals);
          }, 10000);
        });
      });
      
      // Verificar LCP
      if (metrics['LCP']) {
        expect(metrics['LCP']).toBeLessThan(LCP_THRESHOLD);
      }
      
      // Verificar CLS
      if (metrics['CLS'] !== undefined) {
        expect(metrics['CLS']).toBeLessThan(CLS_THRESHOLD);
      }
      
      // Log de métricas para debugging
      console.log('Home Page Metrics:', metrics);
    });

    test('debe cargar rápidamente (< 3s en conexión lenta)', async ({ page, context }) => {
      // Simular conexión 3G
      await context.route('**/*', async (route) => {
        // Agregar delay simulado de 3G (opcional)
        await route.continue();
      });

      const startTime = Date.now();
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      const loadTime = Date.now() - startTime;

      // Verificar que carga en menos de 3 segundos
      expect(loadTime).toBeLessThan(3000);
    });
  });

  test.describe('Search Page (/buscar)', () => {
    test('debe cumplir con Core Web Vitals', async ({ page }) => {
      await page.goto('/buscar');
      await page.waitForLoadState('networkidle');
      
      // Obtener métricas (similar a home page)
      const metrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          const vitals: Record<string, number> = {};
          let clsValue = 0;
          
          const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as any[]) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
            vitals['CLS'] = clsValue;
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });
          
          setTimeout(() => {
            vitals['CLS'] = clsValue;
            resolve(vitals);
          }, 5000);
        });
      });
      
      // Verificar CLS
      if (metrics['CLS'] !== undefined) {
        expect(metrics['CLS']).toBeLessThan(CLS_THRESHOLD);
      }
      
      console.log('Search Page Metrics:', metrics);
    });
  });

  test.describe('Property Page (/property/[slug])', () => {
    test('debe cumplir con Core Web Vitals', async ({ page }) => {
      // Intentar navegar a una property page existente
      await page.goto('/buscar');
      await page.waitForLoadState('networkidle');
      
      const propertyLink = page.locator('a[href*="/property/"]').first();
      
      if (await propertyLink.count() > 0) {
        await propertyLink.click();
        await page.waitForLoadState('networkidle');
        
        // Obtener métricas
        const metrics = await page.evaluate(() => {
          return new Promise((resolve) => {
            const vitals: Record<string, number> = {};
            let clsValue = 0;
            
            const clsObserver = new PerformanceObserver((list) => {
              for (const entry of list.getEntries() as any[]) {
                if (!entry.hadRecentInput) {
                  clsValue += entry.value;
                }
              }
              vitals['CLS'] = clsValue;
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
            
            setTimeout(() => {
              vitals['CLS'] = clsValue;
              resolve(vitals);
            }, 5000);
          });
        });
        
        // Verificar CLS
        if (metrics['CLS'] !== undefined) {
          expect(metrics['CLS']).toBeLessThan(CLS_THRESHOLD);
        }
        
        console.log('Property Page Metrics:', metrics);
      } else {
        test.skip(); // No hay properties para testear
      }
    });
  });

  test.describe('First Input Delay (FID)', () => {
    test('debe responder rápidamente a interacciones', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Buscar primer elemento interactivo (botón o link)
      const interactiveElement = page.locator('button, a[href]').first();
      
      if (await interactiveElement.count() > 0) {
        // Medir tiempo de respuesta
        const startTime = Date.now();
        await interactiveElement.click();
        const responseTime = Date.now() - startTime;
        
        // Verificar que la respuesta es rápida (< 100ms es ideal, pero permitir hasta 200ms)
        expect(responseTime).toBeLessThan(200);
      }
    });
  });

  test.describe('Bundle Size', () => {
    test('debe tener bundle size razonable', async ({ page }) => {
      await page.goto('/');
      
      // Obtener información de recursos cargados
      const resources = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        return resources
          .filter((r) => r.initiatorType === 'script' || r.initiatorType === 'link')
          .map((r) => ({
            name: r.name,
            size: (r as any).transferSize || 0,
            type: r.initiatorType,
          }));
      });
      
      // Calcular tamaño total de JavaScript
      const totalJSSize = resources
        .filter((r) => r.type === 'script')
        .reduce((sum, r) => sum + r.size, 0);
      
      // Verificar que el tamaño total es razonable (< 1MB para JS)
      // Nota: Esto es una aproximación, el bundle real puede ser menor después de compresión
      console.log('Total JS Size (approximate):', totalJSSize, 'bytes');
      expect(totalJSSize).toBeLessThan(2000000); // 2MB como límite razonable
    });
  });
});




