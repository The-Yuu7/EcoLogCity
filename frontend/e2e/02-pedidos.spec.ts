import { test, expect } from '@playwright/test';

test.describe('Módulo de Pedidos, Geocodificación y Filtros (US-001, US-009)', () => {

  test.beforeEach(async ({ page }) => {
    // Autenticarse como administrador antes de cada prueba
    await page.goto('/login.html');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login.html');

    await page.fill('#email', 'admin@ecologcity.pe');
    await page.fill('#password', 'Admin2026!');
    await page.click('#btn-login');
    await page.waitForURL(/.*index\.html/, { timeout: 8000 });
  });

  test('TC-PED-01: Carga correcta del módulo de pedidos y renderizado de la tabla', async ({ page }) => {
    await page.click('[data-modulo="pedidos"]');
    await expect(page.locator('#modulo-pedidos')).toBeVisible();

    const tbody = page.locator('#pedidos-tbody');
    await expect(tbody).toBeVisible();

    // Debe contener filas en el cuerpo de la tabla
    const filas = page.locator('#pedidos-tbody tr');
    await expect(filas.first()).toBeVisible({ timeout: 6000 });
    const count = await filas.count();
    expect(count).toBeGreaterThan(0);
  });

  test('TC-PED-02: Filtro de búsqueda en tiempo real por texto', async ({ page }) => {
    await page.click('[data-modulo="pedidos"]');
    await page.waitForSelector('#pedidos-tbody tr', { timeout: 6000 });

    const inputBuscar = page.locator('#input-buscar');
    await expect(inputBuscar).toBeVisible();

    // Filtrar por término
    await inputBuscar.fill('Huancayo');
    await page.waitForTimeout(400);

    const filas = page.locator('#pedidos-tbody tr');
    const count = await filas.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('TC-PED-03: Validación de campos obligatorios en el formulario de nuevo pedido', async ({ page }) => {
    await page.click('[data-modulo="pedidos"]');
    await expect(page.locator('#modulo-pedidos')).toBeVisible();

    // Limpiar campo cliente y verificar validación
    const clienteInput = page.locator('#cliente_nombre');
    await clienteInput.fill('');

    const btnSubmit = page.locator('#btn-submit');
    await btnSubmit.click();

    const esInvalido = await clienteInput.evaluate((el: HTMLInputElement) => !el.checkValidity());
    expect(esInvalido).toBeTruthy();
  });

  test('TC-PED-04: Geocodificación de dirección en Huancayo', async ({ page }) => {
    await page.click('[data-modulo="pedidos"]');

    const direccionInput = page.locator('#direccion_texto');
    await direccionInput.fill('Calle Real 450, Huancayo');
    const btnGeo = page.locator('#btn-geocodificar');
    await btnGeo.click();

    // El sistema debe asignar coordenadas en lat/lon
    await page.waitForTimeout(1000);
    const latVal = await page.locator('#latitud').inputValue();
    const lonVal = await page.locator('#longitud').inputValue();

    expect(latVal).not.toBe('');
    expect(lonVal).not.toBe('');
  });

});
