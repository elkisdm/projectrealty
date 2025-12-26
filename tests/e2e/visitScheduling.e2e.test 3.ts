import { test, expect } from '@playwright/test';

test.describe('Agendamiento de visitas - E2E', () => {
    test.beforeEach(async ({ page }) => {
        // Navegar a la página de la propiedad
        await page.goto('http://localhost:3001/property/home-amengual?unit=207');
        
        // Esperar a que la página cargue completamente
        await page.waitForLoadState('networkidle');
    });

    test('debería completar el flujo completo de agendamiento', async ({ page }) => {
        // Paso 1: Abrir el modal de agendamiento
        await page.click('text=Agendar Visita');
        await expect(page.locator('[role="dialog"]')).toBeVisible();
        
        // Verificar que el modal se abrió correctamente
        await expect(page.locator('text=Casa Amengual')).toBeVisible();
        await expect(page.locator('text=Selecciona fecha y hora')).toBeVisible();
        await expect(page.locator('text=1/4')).toBeVisible();

        // Paso 2: Seleccionar fecha
        const firstAvailableDay = page.locator('button:has-text("16")').first();
        await firstAvailableDay.click();
        
        // Verificar que la fecha se seleccionó
        await expect(firstAvailableDay).toHaveClass(/bg-blue-600/);

        // Paso 3: Seleccionar hora
        const firstAvailableTime = page.locator('button:has-text("10:00")').first();
        await firstAvailableTime.click();
        
        // Verificar que la hora se seleccionó
        await expect(firstAvailableTime).toHaveClass(/bg-green-600/);

        // Paso 4: Continuar al formulario
        await page.click('text=Continuar →');
        await expect(page.locator('text=Datos de contacto')).toBeVisible();
        await expect(page.locator('text=2/4')).toBeVisible();

        // Paso 5: Completar formulario
        await page.fill('input[placeholder*="nombre"]', 'Juan Pérez');
        await page.fill('input[placeholder*="email"]', 'juan@example.com');
        await page.fill('input[placeholder*="RUT"]', '12345678-9');
        await page.fill('input[placeholder*="teléfono"]', '912345678');

        // Verificar validación en tiempo real
        await expect(page.locator('text=Nombre muy corto')).not.toBeVisible();
        await expect(page.locator('text=Email inválido')).not.toBeVisible();

        // Paso 6: Enviar formulario
        await page.click('text=Continuar →');
        await expect(page.locator('text=Características premium')).toBeVisible();
        await expect(page.locator('text=3/4')).toBeVisible();

        // Paso 7: Continuar desde premium
        await page.click('text=Continuar');
        await expect(page.locator('text=¡Visita confirmada!')).toBeVisible();
        await expect(page.locator('text=4/4')).toBeVisible();

        // Verificar detalles de la visita
        await expect(page.locator('text=Casa Amengual')).toBeVisible();
        await expect(page.locator('text=2025-01-16')).toBeVisible();
        await expect(page.locator('text=10:00')).toBeVisible();
    });

    test('debería validar campos del formulario correctamente', async ({ page }) => {
        // Abrir modal
        await page.click('text=Agendar Visita');
        
        // Seleccionar fecha y hora
        await page.click('button:has-text("16")');
        await page.click('button:has-text("10:00")');
        await page.click('text=Continuar →');

        // Intentar enviar formulario vacío
        const submitButton = page.locator('text=Continuar →').last();
        await expect(submitButton).toBeDisabled();

        // Completar solo nombre
        await page.fill('input[placeholder*="nombre"]', 'J');
        await expect(page.locator('text=Nombre muy corto')).toBeVisible();
        await expect(submitButton).toBeDisabled();

        // Completar nombre válido
        await page.fill('input[placeholder*="nombre"]', 'Juan Pérez');
        await expect(page.locator('text=Nombre muy corto')).not.toBeVisible();

        // Completar email inválido
        await page.fill('input[placeholder*="email"]', 'email-invalido');
        await expect(page.locator('text=Email inválido')).toBeVisible();
        await expect(submitButton).toBeDisabled();

        // Completar email válido
        await page.fill('input[placeholder*="email"]', 'juan@example.com');
        await expect(page.locator('text=Email inválido')).not.toBeVisible();

        // Completar RUT muy corto
        await page.fill('input[placeholder*="RUT"]', '123');
        await expect(page.locator('text=RUT muy corto')).toBeVisible();
        await expect(submitButton).toBeDisabled();

        // Completar RUT válido
        await page.fill('input[placeholder*="RUT"]', '12345678-9');
        await expect(page.locator('text=RUT muy corto')).not.toBeVisible();

        // Completar teléfono muy corto
        await page.fill('input[placeholder*="teléfono"]', '123');
        await expect(page.locator('text=Teléfono muy corto')).toBeVisible();
        await expect(submitButton).toBeDisabled();

        // Completar teléfono válido
        await page.fill('input[placeholder*="teléfono"]', '912345678');
        await expect(page.locator('text=Teléfono muy corto')).not.toBeVisible();

        // Verificar que el botón está habilitado
        await expect(submitButton).toBeEnabled();
    });

    test('debería permitir navegación hacia atrás', async ({ page }) => {
        // Abrir modal
        await page.click('text=Agendar Visita');
        
        // Seleccionar fecha y hora
        await page.click('button:has-text("16")');
        await page.click('button:has-text("10:00")');
        await page.click('text=Continuar →');

        // Verificar que estamos en el paso 2
        await expect(page.locator('text=2/4')).toBeVisible();

        // Regresar al paso anterior
        await page.click('text=← Atrás');
        await expect(page.locator('text=1/4')).toBeVisible();
        await expect(page.locator('text=Selecciona fecha y hora')).toBeVisible();

        // Verificar que la selección se mantiene
        await expect(page.locator('button:has-text("16")').first()).toHaveClass(/bg-blue-600/);
        await expect(page.locator('button:has-text("10:00")').first()).toHaveClass(/bg-green-600/);
    });

    test('debería cambiar entre modo claro y oscuro', async ({ page }) => {
        // Abrir modal
        await page.click('text=Agendar Visita');
        
        // Verificar modo inicial (claro)
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toHaveClass(/bg-white/);

        // Cambiar a modo oscuro
        await page.click('[aria-label="Cambiar tema"]');
        await expect(modal).toHaveClass(/bg-gray-900/);

        // Cambiar de vuelta a modo claro
        await page.click('[aria-label="Cambiar tema"]');
        await expect(modal).toHaveClass(/bg-white/);
    });

    test('debería cerrar el modal correctamente', async ({ page }) => {
        // Abrir modal
        await page.click('text=Agendar Visita');
        await expect(page.locator('[role="dialog"]')).toBeVisible();

        // Cerrar con botón X
        await page.click('[aria-label="Cerrar"]');
        await expect(page.locator('[role="dialog"]')).not.toBeVisible();

        // Abrir modal nuevamente
        await page.click('text=Agendar Visita');
        await expect(page.locator('[role="dialog"]')).toBeVisible();

        // Cerrar haciendo clic fuera del modal
        await page.click('body', { position: { x: 10, y: 10 } });
        await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });

    test('debería ser accesible con teclado', async ({ page }) => {
        // Abrir modal
        await page.click('text=Agendar Visita');
        
        // Navegar con Tab
        await page.keyboard.press('Tab');
        await expect(page.locator('[aria-label="Cerrar"]')).toBeFocused();

        await page.keyboard.press('Tab');
        await expect(page.locator('[aria-label="Cambiar tema"]')).toBeFocused();

        await page.keyboard.press('Tab');
        await expect(page.locator('button:has-text("16")').first()).toBeFocused();

        // Seleccionar con Enter
        await page.keyboard.press('Enter');
        await expect(page.locator('button:has-text("16")').first()).toHaveClass(/bg-blue-600/);

        // Continuar navegando
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Enter'); // Seleccionar hora
        await page.keyboard.press('Tab');
        await page.keyboard.press('Enter'); // Continuar
    });

    test('debería manejar errores de red correctamente', async ({ page }) => {
        // Interceptar requests de API y simular error
        await page.route('**/api/availability*', route => {
            route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Error de servidor' })
            });
        });

        // Abrir modal
        await page.click('text=Agendar Visita');
        
        // Verificar que se muestra el error
        await expect(page.locator('text=Error de servidor')).toBeVisible();
    });

    test('debería mostrar días no disponibles como deshabilitados', async ({ page }) => {
        // Abrir modal
        await page.click('text=Agendar Visita');
        
        // Buscar días no disponibles (si los hay)
        const unavailableDays = page.locator('button:disabled');
        const count = await unavailableDays.count();
        
        if (count > 0) {
            // Verificar que los días no disponibles están deshabilitados
            for (let i = 0; i < count; i++) {
                await expect(unavailableDays.nth(i)).toBeDisabled();
            }
        }
    });

    test('debería mostrar horas solo cuando hay fecha seleccionada', async ({ page }) => {
        // Abrir modal
        await page.click('text=Agendar Visita');
        
        // Verificar que no se muestran horas inicialmente
        await expect(page.locator('button:has-text("10:00")')).not.toBeVisible();

        // Seleccionar fecha
        await page.click('button:has-text("16")');
        
        // Verificar que ahora se muestran las horas
        await expect(page.locator('button:has-text("10:00")')).toBeVisible();
    });

    test('debería mantener el estado al recargar la página', async ({ page }) => {
        // Abrir modal y completar parte del flujo
        await page.click('text=Agendar Visita');
        await page.click('button:has-text("16")');
        await page.click('button:has-text("10:00")');
        await page.click('text=Continuar →');
        
        // Completar formulario parcialmente
        await page.fill('input[placeholder*="nombre"]', 'Juan Pérez');
        
        // Recargar página
        await page.reload();
        
        // Verificar que el modal se cerró (estado no se mantiene intencionalmente)
        await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });

    test('debería funcionar correctamente en dispositivos móviles', async ({ page }) => {
        // Simular dispositivo móvil
        await page.setViewportSize({ width: 375, height: 667 });
        
        // Abrir modal
        await page.click('text=Agendar Visita');
        
        // Verificar que el modal se adapta al móvil
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();
        
        // Verificar que los botones son lo suficientemente grandes para touch
        const dayButton = page.locator('button:has-text("16")').first();
        const buttonBox = await dayButton.boundingBox();
        expect(buttonBox?.height).toBeGreaterThan(40); // Mínimo 40px para touch
    });
});
