# Registro de impedimentos

[← Volver al README Principal](../../../README.md)

**Nombre del Proyecto:** EcoLogCity
**Líder del Proyecto:** Albornoz Peña Jeferson Bener

## Registro de impedimentos

| Impedimento # | Fecha de Registro | Descripción | Impacto en el proyecto | Prioridad | Reportado por | Fecha tope | Estado | Fecha de Resolución | Resolución/Comentarios |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| IMP-003 | 05/10/2026 | Explosión combinatoria al calcular rutas VRPTW por fuerza bruta: el número de combinaciones crece factorialmente con la cantidad de pedidos. | El proceso de optimización superaba la memoria disponible a partir de 15 pedidos; el backend quedaba sin respuesta y el despachador no recibía rutas. | Alta | Alexander Landa | 07/10/2026 | Resuelto | 06/10/2026 | Se reemplazó la fuerza bruta por una heurística constructiva con validación dura de capacidad y ventanas horarias. Cambio en `backend/src/services/rutaService.js`. |
| IMP-004 | 08/10/2026 | Las polilíneas de las rutas en Leaflet se superponían en el mapa. | El despachador no podía distinguir qué ruta pertenecía a cada vehículo al revisar el plan. | Media | Junior Quispe | 09/10/2026 | Resuelto | 09/10/2026 | Se generó una paleta dinámica de colores y se asignó un color único a cada ruta en la llamada de dibujo a OSRM. |

## Historial de estados

Trazabilidad de cada impedimento. Cada cambio de estado queda registrado con su fecha.

| Impedimento # | Fecha | Cambio de estado | Comentario |
| :--- | :--- | :--- | :--- |
| IMP-003 | 05/10/2026 | (nuevo) → Abierto | Reportado por Alexander Landa durante las pruebas con más de 15 pedidos. |
| IMP-003 | 06/10/2026 | Abierto → Resuelto | Heurística constructiva implementada y validada antes de la fecha tope (07/10/2026). |
| IMP-004 | 08/10/2026 | (nuevo) → Abierto | Reportado por Junior Quispe al revisar el mapa con varias rutas activas. |
| IMP-004 | 09/10/2026 | Abierto → Resuelto | Color único por ruta aplicado; resuelto el mismo día del reporte. |

[← Volver al README Principal](../../../README.md)
