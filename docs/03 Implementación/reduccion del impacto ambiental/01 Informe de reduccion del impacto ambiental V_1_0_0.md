[← Volver al README Principal](../../../README.md)

# Informe de Reducción del Impacto Ambiental (Green IT)

**Nombre del Proyecto:** EcoLogCity — Optimizador de Rutas Logísticas para DistriRápido S.A.C.  
**Fecha:** 2026-11-13  
**Versión:** V_1_0_0  
**Stack auditado:** Node.js + Express 4, PostgreSQL 16 / PostGIS 3.4 (`pg`), frontend HTML + JavaScript sin framework con Tailwind CSS y Leaflet 1.9.4  
**Líder del Proyecto:** Albornoz Peña Jeferson Bener  

## 1. Propósito

Reducir los recursos que consume EcoLogCity en cada visita —bytes por la red, trabajo de CPU en el navegador y carga sobre PostgreSQL— sin cambiar el comportamiento funcional. Cada byte que no viaja y cada cálculo que no se repite reduce la energía usada en el servidor, la red y el dispositivo del usuario.

## 2. Metodología de medición

| Aspecto | Cómo se midió |
|---|---|
| Peso de página | Script Node.js que descarga el HTML y todos los `<script src>` y `<link href>` que referencia, con `Accept-Encoding: br, gzip`, y suma los bytes realmente transferidos. Mismo equipo y mismo servidor (`node src/server.js`) antes y después. |
| Caché | Cabeceras `Cache-Control` y `ETag` de cada respuesta; prueba de revalidación con `If-None-Match`. |
| Emisiones de CO2 | Librería oficial `@tgwf/co2` (Green Web Foundation), **Sustainable Web Design Model v4**, función `perVisit` con sus supuestos por defecto. |
| Pruebas funcionales | Suite Jest del backend (`npm test`), ejecutada antes y después de los cambios. |

**Límites de esta medición (declarados con transparencia):**
- No se ejecutó Google Lighthouse: el equipo de medición no tenía Chrome/Chromium. Por eso este informe **no reporta** puntajes Lighthouse, FCP, LCP, TBT ni CLS.
- No había PostgreSQL disponible durante la medición, así que **no se midieron** tiempos de respuesta de la API ni planes `EXPLAIN`. Las mejoras de base de datos se justifican por diseño (sección 4) y quedan pendientes de medición (sección 7).
- El peso de página no incluye las teselas del mapa ni las llamadas a la API y a OSRM, que dependen de la sesión y de los datos.

## 3. Diagnóstico inicial

1. **Tailwind Play CDN en producción.** `index.html` y `login.html` cargaban `https://cdn.tailwindcss.com`: 104.7 KB comprimidos (unos 400 KB de JavaScript sin comprimir) que, en cada visita, analizaban el DOM y generaban el CSS en el navegador. Era el 39% del peso de `index.html` y el 89% del de `login.html`, además de bloquear el renderizado.
2. **Sin compresión HTTP.** Express servía HTML, CSS, JS y JSON sin comprimir (`app.js`: 68.2 KB; `index.html`: 43.3 KB).
3. **Sin caché efectiva.** Los estáticos salían con `Cache-Control: public, max-age=0`, de modo que cada navegación volvía a consultar todos los archivos.
4. **Scripts bloqueantes.** Leaflet, `session.js` y `app.js` se cargaban sin `defer`; Leaflet, además, desde el `<head>`.
5. **`SELECT *` y `SELECT p.*`.** El listado de pedidos y el motor VRP traían columnas que nadie usa (`cliente_email`, `observaciones`, `updated_at`, `usuario_id`, `tiempo_servicio_min`…).
6. **Faltaban índices** para el orden por fecha del listado, la selección de pedidos pendientes del motor VRP y la flota activa.
7. **Sin paginación disponible** en `GET /api/v1/pedidos`.
8. **Petición repetida a OSRM.** Al abrir el mismo pedido varias veces, el trazado de la ruta se pedía de nuevo al servidor externo.

## 4. Optimizaciones implementadas

### 4.1 Tailwind compilado en lugar del Play CDN
- `frontend/tailwind.config.js`: la paleta de marca pasa de `theme.js` a la configuración de compilación.
- `npm run build:css` (Tailwind 3.4.19) genera `frontend/public/tailwind.css` (21.7 KB minificado; 4.0 KB con Brotli) con **solo** las clases que aparecen en `public/**/*.html` y `public/**/*.js`.
- `theme.js` queda solo con `window.MARCA` (colores para el mapa): 2.5 KB → 0.65 KB.
- Se verificó que `app.js` no arma nombres de clase dinámicamente (por ejemplo `bg-${color}`), así que la compilación no omite estilos.

### 4.2 Compresión Brotli/Gzip en Express
`backend/src/app.js` incorpora el middleware `compression` (umbral de 1 KB), que negocia Brotli o Gzip según el navegador. Ejemplo: `app.js` pasa de 68.2 KB a 15.8 KB transferidos.

### 4.3 Estrategia de caché
- HTML: `Cache-Control: no-cache` + `ETag` fuerte. El navegador revalida y recibe **304 sin cuerpo** si nada cambió (verificado: `app.js` revalidado → HTTP 304, 0 bytes).
- CSS/JS: `public, max-age=3600`. No se usa `immutable` de un año porque los archivos no llevan hash en el nombre y un despliegue nuevo debe verse en menos de una hora.
- API: `Cache-Control: private, no-cache` con ETag, para que las consultas repetidas sin cambios respondan 304.

### 4.4 Carga diferida de scripts
`defer` en Leaflet, `theme.js`, `session.js` y `app.js` en `index.html`, y en `theme.js` en `login.html`. El HTML se analiza sin bloqueos y el orden de ejecución se conserva. En `login.html`, `session.js` sigue siendo síncrono porque lo usa un script inline. Se añadió `preconnect` a `unpkg.com` y `router.project-osrm.org`.

### 4.5 Proyección de columnas en PostgreSQL
- `pedidoService.listarPedidos`: `SELECT p.*` → 16 columnas explícitas (`COLUMNAS_LISTADO`), las que usan el mapa, la tabla y el resumen. El detalle por ID conserva el registro completo.
- `rutaService`: `SELECT * FROM pedidos` → solo las 12 columnas que usa el motor VRP.
- `vehiculos` mantiene `SELECT *`, porque el objeto completo del vehículo se envía al frontend en cada ruta.

### 4.6 Índices (migración `003_indices_green_it.sql`)
| Índice | Consulta que atiende |
|---|---|
| `idx_pedidos_created_at` | `ORDER BY created_at DESC` del listado |
| `idx_pedidos_usuario_created` | Listado de un usuario con rol USUARIO |
| `idx_pedidos_pendientes_vrp` (parcial) | Pedidos `REGISTRADO`/`PLANIFICADO` ordenados por prioridad y ventana (motor VRP) |
| `idx_vehiculos_activos_capacidad` (parcial) | Flota activa ordenada por capacidad |

La migración se registró en `autoMigrate.js` e `initDb.js` y es idempotente (`IF NOT EXISTS`).

### 4.7 Paginación opcional en `GET /api/v1/pedidos`
- Con `?page=N&limit=M` (por defecto 50, máximo 200) responde `{ data, pagination: { total, page, limit, totalPages } }`. El total sale de `COUNT(*) OVER()` en la misma consulta, sin un segundo viaje a la base de datos.
- Sin `page`, el comportamiento anterior se mantiene. El mapa necesita todas las paradas pendientes, por eso la paginación es opcional. `limit` queda acotado a 200.

### 4.8 Caché del trazado OSRM para un pedido
La vista de un pedido individual ahora usa `trazadoRuta()`, que ya cacheaba los trazados de las rutas. Abrir de nuevo el mismo pedido no genera otra petición externa.

## 5. Resultados medidos

### 5.1 Peso transferido por carga en frío (sin caché del navegador)

| Página | Antes | Después | Variación |
|---|---|---|---|
| `index.html` (panel principal) | 267.2 KB · 8 peticiones | 74.7 KB · 8 peticiones | **−72.0%** |
| `login.html` | 117.6 KB · 5 peticiones | 8.6 KB · 5 peticiones | **−92.7%** |

Detalle por recurso de `index.html`:

| Recurso | Antes | Después |
|---|---|---|
| `index.html` | 43.3 KB (sin comprimir) | 7.1 KB (Brotli) |
| Tailwind | 104.7 KB (Play CDN, JS) | 4.0 KB (`tailwind.css`, Brotli) |
| `app.js` | 68.2 KB | 15.8 KB |
| `theme.js` + `theme.css` + `session.js` | 11.2 KB | 3.4 KB |
| Leaflet JS + CSS (unpkg) | 46.2 KB | 46.2 KB (sin cambios) |

Tras los cambios, Leaflet es el 62% de lo que queda. Es la librería del mapa y ya llega comprimida y con caché de un año desde unpkg.

### 5.2 Visitas repetidas
- Antes: con `max-age=0` el navegador revalidaba todos los estáticos en cada visita, y como Express ya emitía ETag, la mayoría respondía 304.
- Después: CSS/JS se sirven desde la caché local durante una hora sin ninguna petición; el HTML responde 304 con 0 bytes si no cambió.

### 5.3 Trabajo de CPU en el navegador
Se eliminó la ejecución de unos 400 KB de JavaScript (el compilador de Tailwind) en cada carga de página. **No se cuantificó** su efecto en tiempo de bloqueo (TBT) por falta de Lighthouse; queda pendiente (sección 7).

### 5.4 Emisiones estimadas (SWDM v4, `@tgwf/co2`)

| Página | Antes (g CO2e/visita) | Después (g CO2e/visita) | Reducción |
|---|---|---|---|
| `index.html` | 0.0405 | 0.0113 | −72% |
| `login.html` | 0.0178 | 0.0013 | −93% |

**Ejemplo ilustrativo (no es tráfico real):** por cada 10 000 visitas al panel principal se evitarían ≈ 0.29 kg CO2e (0.0292 g × 10 000). El ahorro real depende del tráfico de DistriRápido, que no se ha medido.

### 5.5 Pruebas funcionales
`npm test` en el backend: **43 aprobadas, 7 fallidas**, con resultado **idéntico antes y después** de los cambios. Las 7 fallas son pruebas de integración que necesitan PostgreSQL (`Error al consultar usuarios en BD`, respuestas 500), que no estaba disponible al medir. Los cambios no introdujeron regresiones en las pruebas que pueden ejecutarse sin base de datos.

## 6. Archivos modificados

| Archivo | Cambio |
|---|---|
| `backend/src/app.js` | `compression`, ETag fuerte y cabeceras de caché para estáticos y API |
| `backend/src/services/pedidoService.js` | Proyección de columnas y paginación opcional |
| `backend/src/controllers/pedidoController.js` | Parámetro `page` y respuesta con `pagination` |
| `backend/src/services/rutaService.js` | Proyección de columnas del motor VRP |
| `backend/src/scripts/autoMigrate.js`, `initDb.js` | Registro de la migración 003 |
| `database/migrations/003_indices_green_it.sql` | Índices nuevos |
| `frontend/tailwind.config.js`, `frontend/src/tailwind.input.css`, `frontend/public/tailwind.css` | Compilación de Tailwind |
| `frontend/public/theme.js` | Solo `window.MARCA` |
| `frontend/public/index.html`, `login.html` | CSS compilado, `defer`, `preconnect` |
| `frontend/public/app.js` | Caché del trazado OSRM para un pedido |

## 7. Pendientes y próximos pasos

1. **Revisión visual** de `index.html` y `login.html` tras el cambio a Tailwind compilado. `theme.css` se carga ahora después de Tailwind; antes, el CDN inyectaba sus estilos al final.
2. Ejecutar **Lighthouse** (móvil y escritorio) sobre ambas páginas para obtener FCP, LCP, TBT, CLS y el puntaje de rendimiento antes/después.
3. Con PostgreSQL levantado: `EXPLAIN ANALYZE` del listado de pedidos y del motor VRP con y sin la migración 003, y tiempos de respuesta de `GET /api/v1/pedidos` y `GET /api/v1/rutas`.
4. Volver a ejecutar `npm test` con la base de datos para confirmar las 50 pruebas.
5. Recompilar el CSS (`npm --prefix frontend run build:css`) cada vez que se agreguen clases nuevas en el HTML o el JS.
