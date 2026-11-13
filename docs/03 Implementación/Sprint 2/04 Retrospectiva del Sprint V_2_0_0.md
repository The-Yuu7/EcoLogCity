# Retrospectiva del sprint

[← Volver al README Principal](../../../README.md)

> ⚠️ **Nota de versión:** Este documento corresponde a la versión preliminar histórica `V_2_0_0`. Ha sido superado por la versión oficial vigente aprobada: [04 Retrospectiva del Sprint V_2_0_1.md](04%20Retrospectiva%20del%20Sprint%20V_2_0_1.md).

**Nombre del Proyecto:** EcoLogCity
**Líder del Proyecto:** Albornoz Peña Jeferson Bener

## ¿Qué aprendimos?
Aprendimos que resolver el problema de ruteo de vehículos (VRP) exige un balance estricto entre tiempo de cálculo y óptimo matemático. Comprendimos cómo consumir servicios cartográficos avanzados (OSRM) e integrarlos con algoritmos locales.

## ¿Qué estamos haciendo bien?
La segregación de arquitectura Frontend-Backend nos permitió que el desarrollo de API trabaje en Node, mientras el UI trace rutas complejas en Leaflet sin chocar en el mismo código.

## ¿Qué podemos hacer mejor?
### Personas
Mantener el enfoque cuando los algoritmos matemáticos fallan, evitando la frustración.
### Relaciones
Hacer revisiones de código cruzadas (Pair Programming) al integrar las coordenadas del backend al mapa.
### Procesos
Implementar pruebas de carga simulando pedidos masivos para probar la resistencia del algoritmo.
### Herramientas
Usar Postman de forma más intensiva para debugear las rutas matemáticas antes de integrarlas al Frontend.

### Acciones a realizar
1. Ejecutar tests de stress a la API de optimización.
2. Limpiar el código base eliminando logs residuales.

[← Volver al README Principal](../../../README.md)
