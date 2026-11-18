import { test, expect } from '@playwright/test';

test.describe('Autenticación y Control de Acceso RBAC (US-007, US-009, US-014)', () => {

  test('TC-AUTH-01: Redirección automática a login.html al acceder a index.html sin sesión', async ({ page }) => {
    await page.goto('/index.html');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/index.html');
    await expect(page).toHaveURL(/.*login\.html/);
    await expect(page.locator('#form-login')).toBeVisible();
  });

  test('TC-AUTH-02: Rechazo de credenciales inválidas y visualización de mensaje de error accesible', async ({ page }) => {
    await page.goto('/login.html');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login.html');

    await page.fill('#email', 'invalido@ecologcity.pe');
    await page.fill('#password', 'ClaveErronea123!');
    await page.click('#btn-login');

    const alertError = page.locator('#login-error');
    await expect(alertError).toBeVisible({ timeout: 5000 });
    await expect(alertError).not.toBeEmpty();
  });

  test('TC-AUTH-03: Inicio de sesión exitoso como ADMIN y habilitación de módulos exclusivos', async ({ page }) => {
    await page.goto('/login.html');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login.html');

    await page.fill('#email', 'admin@ecologcity.pe');
    await page.fill('#password', 'Admin2026!');
    await page.click('#btn-login');

    // Redirección exitosa a index.html
    await page.waitForURL(/.*index\.html/, { timeout: 8000 });
    await expect(page.locator('#sesion-nombre')).toBeVisible();
    await expect(page.locator('#sesion-rol')).toHaveText(/ADMIN/i);

    // Módulos de administración deben ser visibles
    await expect(page.locator('[data-modulo="dashboard"]')).toBeVisible();
    await expect(page.locator('[data-modulo="rutas"]')).toBeVisible();
    await expect(page.locator('[data-modulo="usuarios"]')).toBeVisible();
  });

  test('TC-AUTH-04: Inicio de sesión como USUARIO estándar y restricción de módulos (RBAC)', async ({ page }) => {
    await page.goto('/login.html');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login.html');

    await page.fill('#email', 'usuario@ecologcity.pe');
    await page.fill('#password', 'Usuario2026!');
    await page.click('#btn-login');

    await page.waitForURL(/.*index\.html/, { timeout: 8000 });
    await expect(page.locator('#sesion-rol')).toHaveText(/USUARIO/i);

    // Módulos exclusivos de ADMIN deben permanecer ocultos para USUARIO
    await expect(page.locator('[data-modulo="dashboard"]')).toBeHidden();
    await expect(page.locator('[data-modulo="rutas"]')).toBeHidden();
    await expect(page.locator('[data-modulo="usuarios"]')).toBeHidden();

    // Módulos permitidos deben estar visibles
    await expect(page.locator('[data-modulo="pedidos"]')).toBeVisible();
    await expect(page.locator('[data-modulo="flota"]')).toBeVisible();
  });

  test('TC-AUTH-05: Cierre de sesión seguro y eliminación de credenciales en almacenamiento local', async ({ page }) => {
    await page.goto('/login.html');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login.html');

    await page.fill('#email', 'admin@ecologcity.pe');
    await page.fill('#password', 'Admin2026!');
    await page.click('#btn-login');
    await page.waitForURL(/.*index\.html/, { timeout: 8000 });

    // Cerrar sesión
    await page.click('#btn-cerrar-sesion');
    await page.waitForURL(/.*login\.html/, { timeout: 8000 });

    // Verificar que localStorage se haya limpiado
    const sesionEnStorage = await page.evaluate(() => localStorage.getItem('ecologcity_sesion'));
    expect(sesionEnStorage).toBeNull();
  });

});
