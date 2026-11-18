import { test, expect } from '@playwright/test';

test.describe('Monitoreo de Rendimiento, Web Vitals y Latencia de APIs', () => {

  test('TC-PERF-01: Métricas de carga y Web Vitals en login.html (TTFB, FCP)', async ({ page }) => {
    const response = await page.goto('/login.html', { waitUntil: 'load' });
    expect(response?.status()).toBe(200);

    // Extraer métricas reales de Navigation Timing API del navegador
    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');

      return {
        ttfb: nav ? Math.round(nav.responseStart - nav.requestStart) : 0,
        domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd - nav.startTime) : 0,
        loadTime: nav ? Math.round(nav.loadEventEnd - nav.startTime) : 0,
        fcp: fcp ? Math.round(fcp.startTime) : 0,
      };
    });

    console.log('📊 Métricas Web Vitals - login.html:', JSON.stringify(metrics, null, 2));

    // Validar umbrales óptimos de rendimiento Green IT
    expect(metrics.ttfb).toBeLessThan(1000); // Meta < 500 ms en entornos ideales
    expect(metrics.domContentLoaded).toBeLessThan(2500);
  });

  test('TC-PERF-02: Métricas de carga y Web Vitals en Dashboard index.html', async ({ page }) => {
    // Autenticarse primero
    await page.goto('/login.html');
    await page.fill('#email', 'admin@ecologcity.pe');
    await page.fill('#password', 'Admin2026!');
    await page.click('#btn-login');
    await page.waitForURL(/.*index\.html/, { timeout: 8000 });

    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');

      return {
        ttfb: nav ? Math.round(nav.responseStart - nav.requestStart) : 0,
        domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd - nav.startTime) : 0,
        loadTime: nav ? Math.round(nav.loadEventEnd - nav.startTime) : 0,
        fcp: fcp ? Math.round(fcp.startTime) : 0,
      };
    });

    console.log('📊 Métricas Web Vitals - index.html:', JSON.stringify(metrics, null, 2));
    expect(metrics.domContentLoaded).toBeLessThan(3500);
  });

  test('TC-PERF-03: Tiempos de respuesta de endpoints API REST (< 500 ms)', async ({ request }) => {
    // 1. Endpoint /api (información)
    const t0 = Date.now();
    const resInfo = await request.get('/api');
    const durInfo = Date.now() - t0;
    expect(resInfo.status()).toBe(200);
    expect(durInfo).toBeLessThan(500);

    // 2. Endpoint /api/v1/auth/login
    const tLogin = Date.now();
    const resLogin = await request.post('/api/v1/auth/login', {
      data: { email: 'admin@ecologcity.pe', password: 'Admin2026!' },
    });
    const durLogin = Date.now() - tLogin;
    expect(resLogin.status()).toBe(200);
    expect(durLogin).toBeLessThan(500);
    const loginData = await resLogin.json();
    const token = loginData.data.token;

    // 3. Endpoint /api/v1/pedidos (con token de autenticación)
    const tPedidos = Date.now();
    const resPedidos = await request.get('/api/v1/pedidos', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const durPedidos = Date.now() - tPedidos;
    expect(resPedidos.status()).toBe(200);
    expect(durPedidos).toBeLessThan(500);

    // 4. Endpoint /api/v1/vehiculos
    const tVehiculos = Date.now();
    const resVehiculos = await request.get('/api/v1/vehiculos', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const durVehiculos = Date.now() - tVehiculos;
    expect(resVehiculos.status()).toBe(200);
    expect(durVehiculos).toBeLessThan(500);

    console.log(`⏱️ Latencias API: Info=${durInfo}ms, Login=${durLogin}ms, Pedidos=${durPedidos}ms, Vehiculos=${durVehiculos}ms (Todas < 500ms)`);
  });

});
