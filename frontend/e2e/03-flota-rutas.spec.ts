import { test, expect } from '@playwright/test';

test.describe('Visor Cartográfico Leaflet, Gestión de Flota y Rutas (US-002, US-004, US-008, US-015)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login.html');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login.html');

    await page.fill('#email', 'admin@ecologcity.pe');
    await page.fill('#password', 'Admin2026!');
    await page.click('#btn-login');
    await page.waitForURL(/.*index\.html/, { timeout: 8000 });
  });

  test('TC-MAP-01: Renderizado del visor cartográfico Leaflet en Pedidos', async ({ page }) => {
    await page.click('[data-modulo="pedidos"]');
    await expect(page.locator('#modulo-pedidos')).toBeVisible();

    // El contenedor del mapa interactivo de Leaflet debe existir y ser visible
    const mapaContainer = page.locator('#map');
    await expect(mapaContainer).toBeVisible({ timeout: 6000 });
    await expect(mapaContainer).toHaveClass(/leaflet-container/);
  });

  test('TC-FLOTA-02: Acceso a la gestión de flota y visualización de vehículos', async ({ page }) => {
    await page.click('[data-modulo="flota"]');
    await expect(page.locator('#modulo-flota')).toBeVisible();

    // Comprobar que el módulo de flota esté visible y contenga su formulario
    const formVehiculo = page.locator('#form-vehiculo');
    await expect(formVehiculo).toBeVisible();
  });

  test('TC-RUTAS-03: Directorio de rutas optimizadas (Green VRP / VRPTW Huancayo)', async ({ page }) => {
    await page.click('[data-modulo="rutas"]');
    await expect(page.locator('#modulo-rutas')).toBeVisible();

    const moduloRutas = page.locator('#modulo-rutas');
    await expect(moduloRutas).toBeVisible();
  });

  test('TC-PERFIL-04: Visualización y edición del perfil de usuario (US-016)', async ({ page }) => {
    await page.click('[data-modulo="perfil"]');
    await expect(page.locator('#modulo-perfil')).toBeVisible();

    const formPerfil = page.locator('#form-perfil');
    await expect(formPerfil).toBeVisible();

    // El nombre y correo deben estar en la vista
    const nombreElem = page.locator('#perfil-nombre');
    await expect(nombreElem).toBeVisible();
    const textoNombre = await nombreElem.textContent();
    expect(textoNombre?.trim().length).toBeGreaterThan(0);

    const inputNombre = page.locator('#p-nombre');
    await expect(inputNombre).toBeVisible();
  });

});
