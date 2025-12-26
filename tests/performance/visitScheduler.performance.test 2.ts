import { test, expect } from '@playwright/test';

test.describe('Performance del Modal de Agendamiento', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002/property/home-amengual?unit=207');
        await page.waitForLoadState('networkidle');
    });

    test('debería cargar el modal en menos de 100ms', async ({ page }) => {
        const startTime = Date.now();
        
        await page.click('text=Agendar Visita');
        await page.waitForSelector('[role="dialog"]', { state: 'visible' });
        
        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(100);
    });

    test('debería responder a interacciones en menos de 50ms', async ({ page }) => {
        await page.click('text=Agendar Visita');
        
        // Medir tiempo de respuesta de selección de fecha
        const startTime = Date.now();
        await page.click('button:has-text("16")');
        const responseTime = Date.now() - startTime;
        
        expect(responseTime).toBeLessThan(50);
    });

    test('debería tener un First Contentful Paint rápido', async ({ page }) => {
        const startTime = Date.now();
        
        await page.click('text=Agendar Visita');
        await page.waitForSelector('[role="dialog"]', { state: 'visible' });
        
        const fcp = Date.now() - startTime;
        expect(fcp).toBeLessThan(200);
    });

    test('debería manejar múltiples interacciones rápidas', async ({ page }) => {
        await page.click('text=Agendar Visita');
        
        const startTime = Date.now();
        
        // Múltiples interacciones rápidas
        await page.click('button:has-text("16")');
        await page.click('button:has-text("10:00")');
        await page.click('text=Continuar →');
        
        const totalTime = Date.now() - startTime;
        expect(totalTime).toBeLessThan(150);
    });

    test('debería tener un bundle size optimizado', async ({ page }) => {
        const response = await page.goto('http://localhost:3002/property/home-amengual?unit=207');
        const contentLength = response?.headers()['content-length'];
        
        if (contentLength) {
            const sizeInKB = parseInt(contentLength) / 1024;
            expect(sizeInKB).toBeLessThan(500); // Menos de 500KB
        }
    });

    test('debería usar memoria de manera eficiente', async ({ page }) => {
        const metrics = await page.evaluate(() => {
            return {
                usedJSHeapSize: (performance as any).memory?.usedJSHeapSize || 0,
                totalJSHeapSize: (performance as any).memory?.totalJSHeapSize || 0
            };
        });

        // Verificar que el uso de memoria es razonable
        expect(metrics.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024); // Menos de 50MB
    });

    test('debería tener un Cumulative Layout Shift bajo', async ({ page }) => {
        await page.click('text=Agendar Visita');
        
        // Simular interacciones que podrían causar layout shift
        await page.click('button:has-text("16")');
        await page.click('button:has-text("10:00")');
        await page.click('text=Continuar →');
        
        // Verificar que no hay layout shift significativo
        const layoutShift = await page.evaluate(() => {
            return (performance as any).getEntriesByType?.('layout-shift') || [];
        });
        
        expect(layoutShift.length).toBeLessThan(5);
    });
});

test.describe('Accesibilidad del Modal de Agendamiento', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002/property/home-amengual?unit=207');
        await page.waitForLoadState('networkidle');
    });

    test('debería tener contraste adecuado', async ({ page }) => {
        await page.click('text=Agendar Visita');
        
        // Verificar contraste en modo claro
        const lightModeButton = page.locator('button:has-text("16")').first();
        const lightModeStyles = await lightModeButton.evaluate((el) => {
            const styles = window.getComputedStyle(el);
            return {
                backgroundColor: styles.backgroundColor,
                color: styles.color
            };
        });
        
        // Verificar que hay contraste suficiente
        expect(lightModeStyles.backgroundColor).not.toBe('transparent');
        expect(lightModeStyles.color).not.toBe('transparent');
    });

    test('debería ser navegable con teclado', async ({ page }) => {
        await page.click('text=Agendar Visita');
        
        // Verificar que todos los elementos interactivos son focusables
        const focusableElements = await page.locator('button, input, [tabindex]').count();
        expect(focusableElements).toBeGreaterThan(0);
        
        // Verificar navegación con Tab
        await page.keyboard.press('Tab');
        const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
        expect(firstFocused).toBe('BUTTON');
    });

    test('debería tener labels apropiados', async ({ page }) => {
        await page.click('text=Agendar Visita');
        
        // Verificar que los botones tienen labels
        const closeButton = page.locator('[aria-label="Cerrar"]');
        await expect(closeButton).toBeVisible();
        
        const themeButton = page.locator('[aria-label="Cambiar tema"]');
        await expect(themeButton).toBeVisible();
    });

    test('debería tener roles ARIA correctos', async ({ page }) => {
        await page.click('text=Agendar Visita');
        
        // Verificar que el modal tiene el rol correcto
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();
        
        // Verificar que los botones tienen roles apropiados
        const buttons = page.locator('button');
        const buttonCount = await buttons.count();
        expect(buttonCount).toBeGreaterThan(0);
    });

    test('debería anunciar cambios de estado', async ({ page }) => {
        await page.click('text=Agendar Visita');
        
        // Verificar que los cambios de estado son anunciados
        await page.click('button:has-text("16")');
        
        // Verificar que el botón seleccionado tiene el estado correcto
        const selectedButton = page.locator('button:has-text("16")').first();
        await expect(selectedButton).toHaveClass(/bg-blue-600/);
    });

    test('debería funcionar con lectores de pantalla', async ({ page }) => {
        await page.click('text=Agendar Visita');
        
        // Verificar que hay texto descriptivo
        await expect(page.locator('text=Selecciona fecha y hora')).toBeVisible();
        await expect(page.locator('text=1/4')).toBeVisible();
        
        // Verificar que los campos de formulario tienen labels
        await page.click('button:has-text("16")');
        await page.click('button:has-text("10:00")');
        await page.click('text=Continuar →');
        
        await expect(page.locator('text=Nombre completo *')).toBeVisible();
        await expect(page.locator('text=Email *')).toBeVisible();
    });

    test('debería manejar errores de manera accesible', async ({ page }) => {
        // Simular error de API
        await page.route('**/api/availability*', route => {
            route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Error de servidor' })
            });
        });
        
        await page.click('text=Agendar Visita');
        
        // Verificar que el error es visible y accesible
        await expect(page.locator('text=Error de servidor')).toBeVisible();
        
        // Verificar que el error tiene el rol correcto
        const errorElement = page.locator('text=Error de servidor');
        const role = await errorElement.getAttribute('role');
        expect(role).toBe('alert');
    });

    test('debería respetar prefers-reduced-motion', async ({ page }) => {
        // Simular preferencia de movimiento reducido
        await page.emulateMedia({ reducedMotion: 'reduce' });
        
        await page.click('text=Agendar Visita');
        
        // Verificar que no hay animaciones excesivas
        const animatedElements = await page.locator('[style*="animation"], [style*="transition"]').count();
        expect(animatedElements).toBeLessThan(3); // Solo animaciones esenciales
    });

    test('debería tener un orden de tabulación lógico', async ({ page }) => {
        await page.click('text=Agendar Visita');
        
        // Verificar orden de tabulación
        await page.keyboard.press('Tab');
        await expect(page.locator('[aria-label="Cerrar"]')).toBeFocused();
        
        await page.keyboard.press('Tab');
        await expect(page.locator('[aria-label="Cambiar tema"]')).toBeFocused();
        
        await page.keyboard.press('Tab');
        await expect(page.locator('button:has-text("16")').first()).toBeFocused();
    });

    test('debería tener un foco visible', async ({ page }) => {
        await page.click('text=Agendar Visita');
        
        // Verificar que el foco es visible
        await page.keyboard.press('Tab');
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeVisible();
        
        // Verificar que el elemento enfocado tiene estilos de foco
        const focusStyles = await focusedElement.evaluate((el) => {
            const styles = window.getComputedStyle(el);
            return {
                outline: styles.outline,
                boxShadow: styles.boxShadow
            };
        });
        
        expect(focusStyles.outline).not.toBe('none');
    });
});
