import { test, expect } from '@playwright/test';

test.describe('Disponibilidad, Manejo de Códigos HTTP y Resiliencia de Red', () => {

  test('TC-RES-01: Verificación de códigos de estado HTTP de la API REST', async ({ request }) => {
    // 1. Healthcheck o endpoint base debe responder 200 OK
    const resBase = await request.get('/api');
    expect(resBase.status()).toBe(200);
    const jsonBase = await resBase.json();
    expect(jsonBase.nombre).toContain('EcoLogCity');

    // 2. Endpoint protegido sin token debe responder 401 Unauthorized
    const res401 = await request.get('/api/v1/pedidos');
    expect(res401.status()).toBe(401);

    // 3. Ruta no existente a nivel servidor debe responder 404 Not Found controlado
    const res404 = await request.get('/api/ruta-que-no-existe-404');
    expect(res404.status()).toBe(404);
    const json404 = await res404.json();
    expect(json404.ok).toBe(false);
  });

  test('TC-RES-02: Resiliencia ante error 500 del servidor backend sin colapso de interfaz', async ({ page }) => {
    // Simular error 500 en la API de login
    await page.route('**/api/v1/auth/login', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, error: 'Error interno simulado para prueba de resiliencia' }),
      });
    });

    await page.goto('/login.html');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login.html');

    await page.fill('#email', 'admin@ecologcity.pe');
    await page.fill('#password', 'Admin2026!');
    await page.click('#btn-login');

    // La interfaz debe capturar el error y mostrar mensaje sin crash de JS
    const alertError = page.locator('#login-error');
    await expect(alertError).toBeVisible({ timeout: 5000 });
    await expect(alertError).toContainText(/Error interno/i);
  });

  test('TC-RES-03: Resiliencia ante desconexión de red / falla de conectividad', async ({ page }) => {
    // Simular aborto total de red en la llamada al backend
    await page.route('**/api/v1/auth/login', route => route.abort('failed'));

    await page.goto('/login.html');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login.html');

    await page.fill('#email', 'admin@ecologcity.pe');
    await page.fill('#password', 'Admin2026!');
    await page.click('#btn-login');

    // Debe mostrar mensaje de error de conexión en la UI
    const alertError = page.locator('#login-error');
    await expect(alertError).toBeVisible({ timeout: 5000 });
    await expect(alertError).toContainText(/No se pudo conectar/i);
  });

  test('TC-RES-04: Expiración de sesión o token revocado redirige controladamente', async ({ page }) => {
    // Simular token expirado / inválido
    await page.goto('/login.html');
    await page.evaluate(() => {
      localStorage.setItem('ecologcity_sesion', JSON.stringify({
        token: 'token-falso-expirado-12345',
        usuario: { id: 'test-id', email: 'test@ecologcity.pe', rol: 'ADMIN', nombre: 'Test' }
      }));
    });

    // Simular que cualquier petición con ese token responde 401
    await page.route('**/api/v1/**', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, error: 'Token inválido o expirado' }),
      });
    });

    await page.goto('/index.html');
    // El frontend al recibir 401 en apiFetch debe limpiar y redirigir
    await page.waitForURL(/.*login\.html/, { timeout: 8000 });
    await expect(page).toHaveURL(/.*login\.html/);
  });

});
