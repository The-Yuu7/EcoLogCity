# Revisión del sprint

[← Volver al README Principal](../../../README.md)

**Nombre del Proyecto:** EcoLogCity
**Líder del Proyecto:** Albornoz Peña Jeferson Bener

## Historias de Usuario completadas en este Sprint

| ID | Título | Criterio de aceptación | Resultado | Evidencia |
| :--- | :--- | :--- | :--- | :--- |
| US-001 | Geocodificación Automática de Direcciones en Huancayo | Una dirección válida de Huancayo se convierte en coordenadas; una ambigua muestra sugerencias. | Cumplido. | `backend/tests/geocoding.test.js` (escenarios BDD 1 y 2). |
| US-002 | Visualización de Pedidos en Mapa Interactivo y Directorio de Pedidos | Cada pedido aparece en el mapa con color según prioridad y en el directorio con búsqueda y filtro por distrito. | Cumplido. | Commit `c47ea2d` (rediseño de la interfaz). |
| US-006 | Dashboard de Indicadores Operativos | El panel muestra pedidos registrados, carga acumulada, emisión diésel base y gasto estimado de la flota, y se actualiza al registrar o cancelar un pedido. | Cumplido. | Commit `c47ea2d`; endpoint `GET /api/v1/pedidos/stats`. |
| EN-001 | Modelado y despliegue de Base de Datos Espacial (PostGIS) | Las tablas de pedidos, zonas, vehículos y conductores se crean con un solo comando. | Cumplido. | `database/migrations/001_init_postgis_schema.sql`; `npm run db:init`. |

## Demostración del trabajo completado
Demostración a los stakeholders:
1. Se registró un pedido nuevo y se validó que el sistema rechaza una ventana horaria inválida.
2. Se ajustaron las coordenadas arrastrando el marcador en el mapa (drag & drop).
3. Se buscó el pedido en el directorio y se filtró por distrito.
4. Se comprobó que los indicadores del dashboard cambian al registrar y al cancelar un pedido.
5. Se consultó la flota de vehículos y sus capacidades.

**Lo que no se completó en la demo:** la optimización de rutas y el control de acceso por roles (ver Pendientes).

## Pendientes
- Motor de optimización de rutas (VRPTW & Green VRP), programado para el Sprint 2.
- Inicio de sesión y roles (administrador y usuario), programado para el Sprint 2.
- Exportación del manifiesto de ruta a PDF.
- Despliegue productivo en servidor cloud.

[← Volver al README Principal](../../../README.md)
