# Retrospectiva del sprint

[← Volver al README Principal](../../../README.md)

**Nombre del Proyecto:** EcoLogCity
**Líder del Proyecto:** Albornoz Peña Jeferson Bener

## ¿Qué aprendimos?
Resolver el ruteo de vehículos (VRP) exige equilibrar tiempo de cálculo y calidad de la solución. La fuerza bruta no escala: a partir de 15 pedidos el proceso agotaba la memoria (IMP-003), y pasar a una heurística constructiva resolvió el problema con una solución aceptable en tiempo razonable. También aprendimos a consumir OSRM para trazar rutas en calles reales y a manejar sus fallos con un fallback de polilínea.

## ¿Qué estamos haciendo bien?
La separación Frontend–Backend permitió que el desarrollo de la API en Node avanzara en paralelo con la visualización de rutas en Leaflet, sin conflictos en el mismo código. Los impedimentos se registraron con fecha y se resolvieron dentro de la fecha tope en los dos casos.

## ¿Qué podemos hacer mejor?

### Personas
Mantener el enfoque cuando los algoritmos fallan. En Sprint 2 la reacción frente a IMP-003 fue cambiar de estrategia en lugar de insistir con la fuerza bruta. Lo siguiente es avisar el mismo día cuando un algoritmo no responde, como ya se planteó en el Sprint 1.

### Relaciones
Hacer revisiones de código cruzadas entre Frontend y Backend antes de integrar las coordenadas del backend al mapa. Se acordará en cada integración quién revisa (Frontend revisa el consumo de la API y Backend revisa el formato de las coordenadas), y la revisión se registra en el Pull Request.

### Procesos
Probar la optimización con carga controlada antes de cada demo: pedidos en lotes de 10, 15 y 20, midiendo el tiempo de respuesta del endpoint de optimización. Hoy no existen pruebas automatizadas para `rutaService.js` en `backend/tests/`, por lo que esta práctica no está cubierta.

### Herramientas
Usar Postman para validar las rutas calculadas por el backend antes de integrarlas al Frontend, guardando las peticiones como colección compartida del equipo.

## Seguimiento de acciones de Sprint 1

| Acción (Sprint 1) | Estado verificado | Observación |
| :--- | :--- | :--- |
| Configurar ESLint y Prettier en el repositorio | Pendiente | No hay archivos de configuración de ESLint ni Prettier en el repositorio. |
| Script automatizado de datos falsos (seeds) | Cumplida | `backend/src/scripts/initDb.js` ejecuta `database/seeds/001_seed_pedidos_huancayo.sql`. |
| Stand-ups diarios de máximo 10–15 minutos | No verificable en el repositorio | Requiere confirmación del equipo. |

## Acciones a realizar (Sprint 3)

| # | Eje | Acción | Responsable (propuesto) | Indicador de cumplimiento |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Procesos | Crear pruebas automatizadas para `rutaService.js` con lotes de 10, 15 y 20 pedidos. | Landa Rojas Alexander Nelson | Pruebas en `backend/tests/` ejecutándose con `npm test` y pasando para los tres tamaños de lote. |
| 2 | Herramientas | Configurar ESLint y Prettier en el repositorio y aplicarlos al código existente. | Quispe Aquino Junior | Archivos de configuración en el repositorio y un commit sin errores de lint. |
| 3 | Relaciones | Definir al inicio de cada integración quién revisa Frontend y quién revisa Backend. | Albornoz Peña Jeferson Bener | Cada Pull Request de integración con una revisión cruzada registrada. |
| 4 | Procesos | Dejar un registro de impedimentos actualizado durante el sprint, no solo al cierre. | Albornoz Peña Jeferson Bener | Cada impedimento con fecha de registro y al menos un cambio de estado en el historial. |

[← Volver al README Principal](../../../README.md)
