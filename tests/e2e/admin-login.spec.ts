import { test, expect } from '@playwright/test';

test.describe('Admin Login - E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de login
    await page.goto('http://localhost:3000/admin/login');
    await page.waitForLoadState('networkidle');
  });

  test('debería mostrar el formulario de login', async ({ page }) => {
    // Verificar que el formulario está visible
    await expect(page.locator('h1:has-text("Panel de Control")')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Iniciar sesión")')).toBeVisible();
  });

  test('debería validar email inválido', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    // Intentar enviar con email inválido
    await emailInput.fill('email-invalido');
    await passwordInput.fill('password123');
    await emailInput.blur();

    // Verificar mensaje de error
    await expect(page.locator('text=Email inválido')).toBeVisible();
  });

  test('debería validar password requerido', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    // Llenar solo email
    await emailInput.fill('admin@example.com');
    await passwordInput.fill('');
    await passwordInput.blur();

    // Verificar mensaje de error
    await expect(page.locator('text=Password requerido')).toBeVisible();
  });

  test('debería mostrar error con credenciales inválidas', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button:has-text("Iniciar sesión")');

    // Intentar login con credenciales inválidas
    await emailInput.fill('invalid@example.com');
    await passwordInput.fill('wrongpassword');
    await submitButton.click();

    // Verificar mensaje de error
    await expect(page.locator('text=Email o password incorrectos')).toBeVisible({ timeout: 5000 });
  });

  test('debería redirigir a /admin después de login exitoso', async ({ page, context }) => {
    // Mock de la respuesta de login exitoso
    await context.route('**/api/admin/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            id: 'test-user-id',
            email: 'admin@example.com',
            role: 'admin',
          },
        }),
        headers: {
          'Set-Cookie': 'sb-access-token=test-token; Path=/; HttpOnly',
        },
      });
    });

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button:has-text("Iniciar sesión")');

    await emailInput.fill('admin@example.com');
    await passwordInput.fill('password123');
    await submitButton.click();

    // Verificar redirect a /admin
    await expect(page).toHaveURL(/\/admin/, { timeout: 5000 });
  });

  test('debería mostrar estado de loading durante login', async ({ page, context }) => {
    // Mock de respuesta lenta
    await context.route('**/api/admin/auth/login', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: { id: 'test', email: 'admin@example.com', role: 'admin' },
        }),
      });
    });

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button:has-text("Iniciar sesión")');

    await emailInput.fill('admin@example.com');
    await passwordInput.fill('password123');
    await submitButton.click();

    // Verificar que el botón muestra estado de loading
    await expect(page.locator('button:has-text("Iniciando sesión...")')).toBeVisible();
  });

  test('debería preservar URL de redirect después de login', async ({ page, context }) => {
    // Navegar a una ruta protegida primero
    await page.goto('http://localhost:3000/admin/buildings');
    
    // Debería redirigir a login
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.url()).toContain('redirect=/admin/buildings');

    // Mock de login exitoso
    await context.route('**/api/admin/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: { id: 'test', email: 'admin@example.com', role: 'admin' },
        }),
      });
    });

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button:has-text("Iniciar sesión")');

    await emailInput.fill('admin@example.com');
    await passwordInput.fill('password123');
    await submitButton.click();

    // Debería redirigir a la URL original
    await expect(page).toHaveURL(/\/admin\/buildings/, { timeout: 5000 });
  });
});












