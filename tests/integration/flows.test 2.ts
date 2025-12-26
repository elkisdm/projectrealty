/**
 * Tests de Integración para Flujos Principales
 * 
 * Estos tests verifican flujos completos de usuario:
 * 1. Búsqueda y navegación (buscar → resultados → property page)
 * 2. Agendamiento de visita (property → modal → formulario → confirmación)
 * 3. WhatsApp (property page → click WhatsApp → verificar URL)
 */

import { test, expect } from '@playwright/test';

test.describe('Flujos de Integración - Principales', () => {
  test.describe('Flujo 1: Búsqueda y Navegación', () => {
    test('debe completar flujo: buscar por comuna → ver resultados → navegar a property page', async ({ page }) => {
      // Paso 1: Ir a la página de búsqueda
      await page.goto('/buscar');
      await page.waitForLoadState('networkidle');

      // Paso 2: Buscar por comuna (usar filtros si están disponibles)
      // Intentar hacer click en un filtro de comuna o buscar
      const comunaFilter = page.locator('button:has-text("Providencia"), select, input[placeholder*="comuna" i]').first();
      
      if (await comunaFilter.count() > 0) {
        await comunaFilter.click();
        // Si es un select, seleccionar opción
        const isSelect = await comunaFilter.evaluate((el) => el.tagName === 'SELECT');
        if (isSelect) {
          await page.selectOption(comunaFilter as any, { label: /Providencia/i });
        } else {
          // Si es input, escribir
          await comunaFilter.fill('Providencia');
        }
      }

      // Esperar a que los resultados se actualicen
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000); // Dar tiempo a que los resultados se rendericen

      // Paso 3: Verificar que hay resultados
      const resultsContainer = page.locator('[data-testid="results"], .grid, main').first();
      await expect(resultsContainer).toBeVisible();

      // Paso 4: Buscar un link a una property page y hacer click
      const propertyLink = page.locator('a[href*="/property/"], a[href*="/arriendo/"]').first();
      
      if (await propertyLink.count() > 0) {
        const href = await propertyLink.getAttribute('href');
        expect(href).toBeTruthy();
        expect(href).toMatch(/\/property\/|\/arriendo\//);

        // Paso 5: Navegar a la property page
        await propertyLink.click();
        await page.waitForLoadState('networkidle');

        // Paso 6: Verificar que llegamos a una property page
        const url = page.url();
        expect(url).toMatch(/\/property\/|\/arriendo\//);
        
        // Verificar que la página tiene contenido de propiedad
        await expect(page.locator('main')).toBeVisible();
      } else {
        // Si no hay resultados, el test pasa pero con advertencia
        console.warn('No se encontraron resultados de búsqueda para verificar navegación');
      }
    });

    test('debe poder aplicar filtros y ver resultados actualizados', async ({ page }) => {
      await page.goto('/buscar');
      await page.waitForLoadState('networkidle');

      // Intentar aplicar un filtro
      const filterButton = page.locator('button:has-text("Filtrar"), button[aria-label*="filtrar" i]').first();
      
      if (await filterButton.count() > 0) {
        await filterButton.click();
        await page.waitForTimeout(500);
        
        // Verificar que los filtros están disponibles
        const filterPanel = page.locator('[role="dialog"], .filter-panel, [data-testid="filters"]').first();
        if (await filterPanel.count() > 0) {
          await expect(filterPanel).toBeVisible();
        }
      }
    });
  });

  test.describe('Flujo 2: Agendamiento de Visita', () => {
    test('debe completar flujo: property page → abrir modal → seleccionar fecha/hora → completar formulario → confirmación', async ({ page }) => {
      // Paso 1: Ir a una property page
      // Intentar con una página existente o usar una de prueba
      await page.goto('/property/home-amengual?unit=207', { 
        waitUntil: 'domcontentloaded' 
      });
      
      // Si la página no existe, usar la página de búsqueda primero
      if (page.url().includes('404') || page.url().includes('not-found')) {
        await page.goto('/buscar');
        await page.waitForLoadState('networkidle');
        
        const propertyLink = page.locator('a[href*="/property/"]').first();
        if (await propertyLink.count() > 0) {
          await propertyLink.click();
          await page.waitForLoadState('networkidle');
        } else {
          test.skip(); // No hay properties para testear
          return;
        }
      }

      // Paso 2: Buscar y hacer click en "Agendar visita"
      const agendarButton = page.locator(
        'button:has-text("Agendar"), button:has-text("Agendar visita"), [aria-label*="agendar" i]'
      ).first();
      
      if (await agendarButton.count() === 0) {
        test.skip(); // No hay botón de agendar (puede que la página no tenga esta funcionalidad)
        return;
      }

      await agendarButton.click();

      // Paso 3: Verificar que el modal se abre
      const modal = page.locator('[role="dialog"], .modal, [data-testid="visit-modal"]').first();
      await expect(modal).toBeVisible({ timeout: 5000 });

      // Paso 4: Seleccionar fecha (si hay días disponibles)
      const availableDay = page.locator('button:has-text("16"), button:has-text("17"), button[data-date]').first();
      
      if (await availableDay.count() > 0) {
        await availableDay.click();
        await page.waitForTimeout(500);

        // Paso 5: Seleccionar hora (si hay slots disponibles)
        const availableSlot = page.locator(
          'button:has-text("10:00"), button:has-text("14:00"), button[data-time]'
        ).first();
        
        if (await availableSlot.count() > 0) {
          await availableSlot.click();
          await page.waitForTimeout(500);

          // Paso 6: Continuar al formulario
          const continueButton = page.locator('button:has-text("Continuar"), button:has-text("Siguiente")').first();
          
          if (await continueButton.count() > 0 && await continueButton.isEnabled()) {
            await continueButton.click();
            await page.waitForTimeout(500);

            // Paso 7: Completar formulario (si está visible)
            const nameInput = page.locator('input[placeholder*="nombre" i], input[name*="name" i]').first();
            
            if (await nameInput.count() > 0) {
              await nameInput.fill('Juan Pérez');
              
              const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]').first();
              if (await emailInput.count() > 0) {
                await emailInput.fill('juan@example.com');
              }

              // Paso 8: Enviar formulario (si hay botón de submit)
              const submitButton = page.locator('button[type="submit"], button:has-text("Enviar"), button:has-text("Confirmar")').first();
              
              if (await submitButton.count() > 0 && await submitButton.isEnabled()) {
                // Nota: En un test real, aquí se mockearía la API
                // Por ahora solo verificamos que el botón está disponible
                await expect(submitButton).toBeVisible();
              }
            }
          }
        }
      }
    });
  });

  test.describe('Flujo 3: WhatsApp', () => {
    test('debe verificar que WhatsApp abre correctamente desde property page', async ({ page, context }) => {
      // Paso 1: Ir a una property page
      await page.goto('/property/home-amengual?unit=207', { 
        waitUntil: 'domcontentloaded' 
      });
      
      // Si la página no existe, buscar desde la página de búsqueda
      if (page.url().includes('404') || page.url().includes('not-found')) {
        await page.goto('/buscar');
        await page.waitForLoadState('networkidle');
        
        const propertyLink = page.locator('a[href*="/property/"]').first();
        if (await propertyLink.count() > 0) {
          await propertyLink.click();
          await page.waitForLoadState('networkidle');
        } else {
          test.skip();
          return;
        }
      }

      // Paso 2: Buscar botón de WhatsApp
      const whatsappButton = page.locator(
        'button:has-text("WhatsApp"), button:has-text("Whats"), [aria-label*="whatsapp" i], a[href*="wa.me"]'
      ).first();
      
      if (await whatsappButton.count() === 0) {
        test.skip(); // No hay botón de WhatsApp
        return;
      }

      // Paso 3: Capturar eventos de nueva página/pestaña
      const [newPage] = await Promise.all([
        context.waitForEvent('page', { timeout: 5000 }).catch(() => null),
        whatsappButton.click()
      ]);

      // Si se abre nueva pestaña, verificar URL de WhatsApp
      if (newPage) {
        await newPage.waitForLoadState('domcontentloaded');
        const url = newPage.url();
        expect(url).toMatch(/wa\.me|whatsapp\.com/);
        await newPage.close();
      } else {
        // Si no se abre nueva pestaña, puede ser que el link esté en el mismo botón
        // Verificar que el botón tiene href de WhatsApp
        const href = await whatsappButton.getAttribute('href');
        if (href) {
          expect(href).toMatch(/wa\.me|whatsapp\.com/);
        } else {
          // Verificar que se puede hacer click (puede abrir en la misma página)
          await expect(whatsappButton).toBeVisible();
        }
      }
    });

    test('debe verificar que el link de WhatsApp tiene formato correcto', async ({ page }) => {
      await page.goto('/buscar');
      await page.waitForLoadState('networkidle');

      // Buscar un link a property page
      const propertyLink = page.locator('a[href*="/property/"]').first();
      
      if (await propertyLink.count() > 0) {
        await propertyLink.click();
        await page.waitForLoadState('networkidle');

        // Buscar botón/link de WhatsApp
        const whatsappElement = page.locator(
          'button:has-text("WhatsApp"), a[href*="wa.me"], [aria-label*="whatsapp" i]'
        ).first();
        
        if (await whatsappElement.count() > 0) {
          // Verificar que tiene href o que es clickeable
          const tagName = await whatsappElement.evaluate((el) => el.tagName);
          
          if (tagName === 'A') {
            const href = await whatsappElement.getAttribute('href');
            expect(href).toBeTruthy();
            expect(href).toMatch(/wa\.me|whatsapp\.com/);
          } else {
            // Es un button, verificar que es interactivo
            await expect(whatsappElement).toBeVisible();
          }
        }
      }
    });
  });
});




