[← Volver al README principal](../../../README.md)

# Informe Técnico de Calidad de Software, Pruebas E2E y Monitoreo con Playwright

**Proyecto:** EcoLogCity — Plataforma de Optimización de Rutas Sostenibles de Última Milla (Huancayo)  
**Entorno de Evaluación:** Local & Staging/Producción en Render Cloud (`https://ecologcity.onrender.com`)  
**Versión:** 1.0.0 — Sprint 4  
**Responsables:** Quispe Aquino Junior (Frontend & UX) · Landa Rojas Alexander Nelson (Backend & Cloud) · Albornoz Peña Jeferson Bener (PM & QA)  

---

## 1. Configuración del Entorno de Pruebas

Para garantizar la robustez, fidelidad y compatibilidad entre plataformas del PMV EcoLogCity, se implementó una suite integral de pruebas automatizadas End-to-End (E2E) y de rendimiento empleando el framework de última generación **Playwright** (`v1.59+`).

### 1.1. Arquitectura de Carpetas de Prueba
La estructura de directorios sigue los estándares de la industria y la directiva de separación cliente/servidor del proyecto:

```text
frontend/
├── e2e/
│   ├── 01-auth.spec.ts              # Autenticación, control RBAC y ciclo de vida de sesión
│   ├── 02-pedidos.spec.ts           # Gestión de pedidos, validaciones y geocodificación
│   ├── 03-flota-rutas.spec.ts       # Visor Leaflet, gestión de vehículos y rutas VRPTW
│   ├── 04-resiliencia.spec.ts       # Disponibilidad, códigos HTTP y resiliencia ante cortes
│   └── 05-performance.spec.ts       # Métricas Core Web Vitals y latencia de endpoints REST
├── playwright-report/               # Reportes interactivos generados en formato HTML
├── test-results/                    # Trazas de depuración, grabaciones de video y capturas
├── playwright.config.ts             # Archivo central de configuración de la suite
└── package.json                     # Scripts y dependencias de ejecución de tests
```

### 1.2. Motores de Navegación Evaluados
Las pruebas se ejecutan de forma exhaustiva sobre los tres motores de renderizado web dominantes:
- **Chromium (`Desktop Chrome`):** Base de Google Chrome, Microsoft Edge, Opera y Brave (cobertura ~70% de usuarios corporativos).
- **Firefox (`Desktop Firefox`):** Motor Gecko, validando cumplimiento estricto de estándares W3C.
- **WebKit (`Desktop Safari`):** Motor de Apple Safari en macOS e iOS, asegurando compatibilidad multiplataforma en dispositivos táctiles y móviles de reparto.

### 1.3. Configuración del Archivo `playwright.config.ts`
El archivo de configuración orquesta la ejecución paralela, la recolección de métricas y el arranque automático del servidor backend integrado durante las pruebas:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 7000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ['json', { outputFile: 'playwright-report/test-results.json' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:8000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'node ../backend/src/server.js',
    url: 'http://localhost:8000/api',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

---

## 2. Pruebas End-to-End (E2E) y Resultados de Ejecución

La suite abarca **20 casos de prueba por navegador**, totalizando **60 ejecuciones automatizadas** que cubren la totalidad de los flujos críticos del negocio logístico de DistriRápido S.A.C.

### 2.1. Matriz de Casos de Prueba Ejecutados

| ID Caso | Módulo Evaluado | Descripción del Escenario de Prueba | Chromium | Firefox | WebKit | Estado |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| **TC-AUTH-01** | Autenticación | Redirección automática hacia `login.html` al intentar ingresar a `index.html` sin sesión activa. | ✅ 0.58s | ✅ 2.60s | ✅ 1.20s | **PASS** |
| **TC-AUTH-02** | Autenticación | Rechazo de credenciales incorrectas y despliegue del mensaje de error accesible en la interfaz. | ✅ 0.41s | ✅ 1.50s | ✅ 0.86s | **PASS** |
| **TC-AUTH-03** | Autenticación | Inicio de sesión exitoso con rol `ADMIN` (`admin@ecologcity.pe`) y despliegue de módulos ejecutivos. | ✅ 0.84s | ✅ 2.20s | ✅ 3.40s | **PASS** |
| **TC-AUTH-04** | Autenticación / RBAC | Inicio de sesión como `USUARIO` (`usuario@ecologcity.pe`) y ocultamiento de módulos exclusivos de administración. | ✅ 0.98s | ✅ 1.80s | ✅ 4.10s | **PASS** |
| **TC-AUTH-05** | Autenticación | Cierre de sesión seguro (`#btn-cerrar-sesion`), purga de `localStorage` y retorno a `login.html`. | ✅ 1.20s | ✅ 1.60s | ✅ 3.70s | **PASS** |
| **TC-PED-01** | Pedidos | Renderizado correcto de la vista de órdenes de entrega y verificación de carga de registros en `#pedidos-tbody`. | ✅ 1.80s | ✅ 2.10s | ✅ 3.80s | **PASS** |
| **TC-PED-02** | Pedidos | Filtrado en tiempo real por texto mediante el campo de búsqueda `#input-buscar` con debounce. | ✅ 2.10s | ✅ 2.20s | ✅ 4.90s | **PASS** |
| **TC-PED-03** | Pedidos | Validación nativa de campos obligatorios (nombre, dirección, peso) en el formulario `#form-pedido`. | ✅ 1.90s | ✅ 2.20s | ✅ 4.30s | **PASS** |
| **TC-PED-04** | Pedidos / GIS | Geocodificación de dirección en Huancayo vía Nominatim y asignación de coordenadas lat/lon en el formulario. | ✅ 2.20s | ✅ 2.90s | ✅ 5.30s | **PASS** |
| **TC-MAP-01** | Cartografía Leaflet | Renderizado interactivo del contenedor Leaflet (`#map`) con clase `leaflet-container` y teselas cartográficas. | ✅ 1.00s | ✅ 2.40s | ✅ 3.90s | **PASS** |
| **TC-FLOTA-02** | Gestión de Flota | Acceso al catálogo de furgones de reparto y presencia del formulario de alta vehicular `#form-vehiculo`. | ✅ 0.96s | ✅ 1.60s | ✅ 3.40s | **PASS** |
| **TC-RUTAS-03** | Motor VRPTW | Acceso al directorio de rutas optimizadas (`#modulo-rutas`) con itinerarios agrupados por furgón. | ✅ 1.00s | ✅ 1.80s | ✅ 3.80s | **PASS** |
| **TC-PERFIL-04** | Perfil de Usuario | Visualización de datos de perfil en `#modulo-perfil` con precarga del nombre y correo del usuario activo. | ✅ 0.81s | ✅ 1.40s | ✅ 3.60s | **PASS** |
| **TC-RES-01** | Resiliencia HTTP | Verificación de respuestas estándar: HTTP 200 en `/api`, HTTP 401 sin token y HTTP 404 en rutas inexistentes. | ✅ 0.05s | ✅ 0.05s | ✅ 0.04s | **PASS** |
| **TC-RES-02** | Resiliencia Servidor | Inyección de error HTTP 500 vía `page.route()`; captura de excepción en cliente sin colapso de la aplicación. | ✅ 0.39s | ✅ 0.83s | ✅ 2.80s | **PASS** |
| **TC-RES-03** | Resiliencia Red | Simulación de corte de conectividad (offline); visualización de alerta amigable de conexión. | ✅ 0.40s | ✅ 0.97s | ✅ 2.80s | **PASS** |
| **TC-RES-04** | Resiliencia Sesión | Expiración o revocación de token JWT; captura automática por `apiFetch` y redirección inmediata a login. | ✅ 0.63s | ✅ 1.20s | ✅ 2.90s | **PASS** |
| **TC-PERF-01** | Rendimiento Web | Medición cuantitativa de Navigation Timing en `login.html`: TTFB y First Contentful Paint (FCP). | ✅ 0.31s | ✅ 0.69s | ✅ 2.50s | **PASS** |
| **TC-PERF-02** | Rendimiento Web | Medición cuantitativa de Navigation Timing en `index.html`: TTFB, FCP y DomContentLoaded en Dashboard. | ✅ 0.81s | ✅ 1.40s | ✅ 3.20s | **PASS** |
| **TC-PERF-03** | Latencia de APIs | Verificación de tiempos de respuesta de endpoints REST (`/api`, login, pedidos, flota), todos inferiores a 500 ms. | ✅ 0.12s | ✅ 0.13s | ✅ 0.11s | **PASS** |

### 2.2. Resumen Estadístico de Ejecución
- **Total de pruebas ejecutadas:** 60 pruebas (20 en Chromium, 20 en Firefox, 20 en WebKit).
- **Pruebas aprobadas (Passed):** 60 / 60 (**100.0% de tasa de éxito**).
- **Pruebas fallidas (Failed):** 0 (**0.0% de fallo**).
- **Tiempo total de ejecución consolidado:** ~2.1 minutos en entorno local / 3.4 minutos en pipeline CI/CD.

```text
=============================================================
           PLAYWRIGHT E2E SUITE EXECUTION SUMMARY
=============================================================
  [chromium] › 20 passed (21.4s)
  [firefox]  › 20 passed (35.4s)
  [webkit]   › 20 passed (1.1m)
-------------------------------------------------------------
  TOTAL: 60 passed (100% SUCCESS) | 0 failed | 0 skipped
=============================================================
```

---

## 3. Monitoreo Cuantitativo de Rendimiento y Web Vitals

A través de la API estándar del W3C `Navigation Timing API` y la extensión `Paint Timing API`, Playwright extrajo directamente de los motores de renderizado las métricas objetivas de experiencia de usuario y eficiencia de carga:

### 3.1. Métricas Core Web Vitals Registradas

| Métrica de Rendimiento | Descripción del Indicador | Valor Obtenido (Chromium) | Valor Obtenido (Firefox) | Valor Obtenido (WebKit) | Umbral Estándar de la Industria | Cumplimiento |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **TTFB (Time to First Byte)** | Tiempo desde la petición inicial hasta recibir el primer byte del servidor. | **3 ms – 4 ms** | **4 ms – 5 ms** | **3 ms** | < 200 ms | **Sobresaliente** |
| **FCP (First Contentful Paint)** | Tiempo en que el navegador renderiza el primer bloque de texto o elemento gráfico. | **180 ms – 192 ms** | **169 ms – 242 ms** | **47 ms – 242 ms** | < 1,000 ms | **Sobresaliente** |
| **DOMContentLoaded** | Tiempo en que el árbol DOM está completamente estructurado y analizado. | **209 ms – 304 ms** | **164 ms – 281 ms** | **38 ms – 234 ms** | < 1,500 ms | **Sobresaliente** |
| **Load Event Time** | Tiempo de carga completa de recursos (CSS, JS, iconos SVG y capas). | **255 ms – 610 ms** | **167 ms – 346 ms** | **44 ms – 342 ms** | < 2,500 ms | **Sobresaliente** |

> **Nota técnica Green IT:** El excepcional desempeño (TTFB < 5 ms y FCP < 250 ms) es resultado directo de la arquitectura de compresión dinámica Brotli/Gzip para paquetes mayores a 1 KB y la política de caché mediante validación ETag fuerte implementada en `backend/src/app.js`.

### 3.2. Medición de Tiempos de Respuesta de Endpoints API REST
Se evaluó el tiempo de respuesta ida y vuelta (Round-Trip Time) de las peticiones REST bajo autenticación con token Bearer JWT:

| Endpoint Evaluado | Método HTTP | Propósito Operativo | Tiempo de Respuesta Promedio | Límite Máximo Rúbrica | Estado |
| :--- | :---: | :--- | :---: | :---: | :---: |
| `/api` | `GET` | Metadatos y versión del servicio | **7 ms – 9 ms** | < 500 ms | **Sobresaliente** |
| `/api/v1/auth/login` | `POST` | Validación con scrypt + emisión JWT | **73 ms – 90 ms** | < 500 ms | **Sobresaliente** |
| `/api/v1/pedidos` | `GET` | Consulta con PostGIS filtrada por rol | **11 ms – 14 ms** | < 500 ms | **Sobresaliente** |
| `/api/v1/vehiculos` | `GET` | Catálogo de flota y capacidades activas | **6 ms – 7 ms** | < 500 ms | **Sobresaliente** |
| `/api/v1/rutas` | `GET` | Itinerarios del algoritmo Green VRP | **18 ms – 25 ms** | < 500 ms | **Sobresaliente** |

*El 100% de los endpoints evaluados responde en menos de 100 ms, superando holgadamente el criterio de aceptación de 500 ms establecido en la rúbrica oficial.*

---

## 4. Disponibilidad y Resiliencia del Sistema

### 4.1. Verificación de Códigos de Estado HTTP
- **Código 200 OK:** Respuestas a consultas de datos, login exitoso y entrega de recursos estáticos.
- **Código 201 Created:** Inserción exitosa de pedidos y registro de vehículos en flota.
- **Código 401 Unauthorized:** Bloqueo automático ante peticiones hacia endpoints protegidos sin token o con token expirado.
- **Código 403 Forbidden:** Restricción perimetral ante intentos de modificación de flota o usuarios por parte de operadores estándar.
- **Código 404 Not Found:** Captura controlada de rutas no mapeadas devolviendo cuerpo JSON estructurado (`{ ok: false, error: ... }`).

### 4.2. Tolerancia a Fallos e Interrupción de Conectividad
Mediante las capacidades avanzadas de emulación de Playwright (`page.route()`), se comprobó la resiliencia del PMV ante dos fallas de red frecuentes en el valle del Mantaro:
1. **Caída del Servicio Backend (HTTP 500):** La interfaz intercepta el fallo en el bloque `catch` de `session.js`/`app.js`, desactiva el estado de carga de los botones y despliega una notificación de error en color rojo sin generar excepciones no capturadas en consola (`0 unhandled rejections`).
2. **Pérdida de Conexión a Internet (Modo Offline / Red Abortada):** Al bloquear la transmisión de paquetes, la aplicación detecta la desconexión y notifica al usuario: *"No se pudo conectar con el servidor de EcoLogCity"*, manteniendo intacto el estado local de la sesión.

### 4.3. Disponibilidad y Uptime en Producción
En el entorno productivo de Render Cloud (`https://ecologcity.onrender.com`):
- **Protocolo Forzado:** HTTPS con cifrado TLS 1.3 garantizado.
- **Tasa de Uptime:** 99.8% de disponibilidad durante la ventana de evaluación del Sprint 4.
- **Manejo de Cold Starts:** Para mitigar el tiempo de inactividad del tier en la nube, se ajustó el timeout de arranque del servidor a 120 segundos y los comandos Jest incorporan los flags `--detectOpenHandles --forceExit`.

---

## 5. Evidencias del Reporte Automatizado de Playwright

El reporte interactivo oficial generado por Playwright se encuentra empaquetado en `frontend/playwright-report/index.html` (542 KB) y en `frontend/playwright-report/test-results.json` (31 KB). 

A continuación se documentan las trazas visuales de ejecución:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        PLAYWRIGHT TEST REPORT - ECOLogCity                             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  Browser Project: chromium  ..........................  20 / 20 passed [21.4s]         │
│  Browser Project: firefox   ..........................  20 / 20 passed [35.4s]         │
│  Browser Project: webkit    ..........................  20 / 20 passed [1m 06s]        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  TOTAL SUITE PASS RATE:                                                    100.0%      │
│  FAILED: 0  |  FLAKY: 0  |  SKIPPED: 0                                                 │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

*Los reportes completos son archivados automáticamente como artefactos en cada ejecución del pipeline de GitHub Actions (`tests.yml`) y pueden descargarse directamente desde la pestaña de Actions del repositorio.*

---

[← Volver al README principal](../../../README.md)
