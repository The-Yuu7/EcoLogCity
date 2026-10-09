# Registro de impedimentos

[← Volver al README Principal](../../../README.md)

**Nombre del Proyecto:** EcoLogCity
**Líder del Proyecto:** Albornoz Peña Jeferson Bener

| Impedimento # | Fecha de Registro | Descripción e Impacto | Prioridad | Reportado por | Fecha tope | Estado | Fecha de Resolución | Resolución/Comentarios |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| IMP-003 | 05/10/2026 | Sobrecarga de memoria al procesar combinaciones VRPTW puras para más de 15 pedidos (Explosión Combinatoria). Impacto: El backend se quedaba colgado sin respuesta. | Alta | Alexander Landa | 07/10/2026 | Resuelto | 06/10/2026 | Se implementó una heurística constructiva con validación dura de restricciones en lugar de fuerza bruta pura. |
| IMP-004 | 08/10/2026 | Los polígonos de rutas en Leaflet se sobreponían dificultando distinguir qué ruta pertenecía a qué vehículo. | Media | Junior Quispe | 09/10/2026 | Resuelto | 09/10/2026 | Se generó una paleta dinámica de colores para cada arreglo de ruta y se asignó un color único en la llamada de dibujo al OSRM. |

[← Volver al README Principal](../../../README.md)
