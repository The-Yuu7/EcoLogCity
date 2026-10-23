# Revisión del sprint

[← Volver al README Principal](../../../README.md)

**Nombre del Proyecto:** EcoLogCity
**Líder del Proyecto:** Albornoz Peña Jeferson Bener

## Historias de Usuario completadas en este Sprint

| ID | Título | Criterio de aceptación | Resultado | Evidencia |
| :--- | :--- | :--- | :--- | :--- |
| US-003 | Motor de Optimización de Rutas (VRPTW & Green VRP) | El botón "Optimizar Rutas" agrupa los pedidos pendientes respetando la capacidad de cada vehículo y sus ventanas horarias. | Cumplido. Se implementó como heurística constructiva (greedy). | Commit `6502a16` (motor VRP). |
| US-004 | Trazado de Rutas en Calles Reales (OSRM) | Las rutas calculadas se dibujan sobre calles reales en Leaflet, con un color distinto por vehículo. | Cumplido. Se agregó un fallback de polilínea si OSRM no responde. | Commits `d280af1` (OSRM por HTTPS y fallback) y `4e14b58` (ruta individual desde el local). |
| US-005 | Cálculo de penalización atmosférica y reducción de emisiones de CO2 | El sistema muestra las emisiones evitadas estimadas y el impacto ambiental de la ruta optimizada. | Cumplido. Las emisiones se calculan en el backend y se muestran en el reporte Green VRP. | `backend/src/services/rutaService.js` (métricas Green VRP). |
| US-007 | Inicio de Sesión y Control de Acceso por Roles | Sin sesión no se accede al panel; con credenciales inválidas se muestra un error; el rol USUARIO no puede optimizar rutas ni modificar la flota. | Cumplido. Contraseñas cifradas con scrypt y sesión con token firmado. | `backend/src/middleware/auth.js`, `frontend/public/login.html`, `backend/tests/auth.test.js` (11 pruebas). |
| US-008 | Gestión de Flota de Vehículos | El administrador registra vehículos, los da de baja y los reactiva; el motor de rutas solo usa los activos; el usuario consulta la flota sin modificarla. | Cumplido. Amplía la consulta de flota del Sprint 1. | `backend/src/services/vehiculoService.js`; `POST /api/v1/vehiculos` y `PATCH /api/v1/vehiculos/:id/estado`. |
| US-009 | Directorio de Pedidos por Rol | Cada usuario ve y cancela solo los pedidos que registró; el administrador ve el directorio general con la columna "Registrado por". Los indicadores del dashboard se calculan sobre los pedidos visibles para cada rol. | Cumplido. | `database/migrations/002_usuarios_roles.sql` (propietario del pedido); `backend/src/services/pedidoService.js`. |

## Demostración del trabajo completado
Demostración a los stakeholders:
1. Se intentó entrar al panel sin sesión y el sistema redirigió al inicio de sesión.
2. Con la cuenta de usuario se registró un pedido en El Tambo; apareció en "Mis Pedidos Registrados" y el botón de optimización no estaba disponible.
3. Con la cuenta de administrador se abrió el "Directorio General de Pedidos" y se verificó quién registró cada pedido.
4. En "Gestión de Flota" se registró un vehículo y se dio de baja otro; el indicador de carga acumulada recalculó la ocupación sobre la flota activa.
5. Al presionar "Optimizar Rutas", el backend calculó las secuencias de ruta con los vehículos activos.
6. Las rutas se trazaron sobre la cartografía, cada una con su color, y se mostró el ahorro de distancia y las emisiones evitadas en el reporte Green VRP.

**Lo que no se completó en la demo:** la exportación del manifiesto a PDF y el diseño responsivo para tablets (ver Pendientes).

## Pendientes
- Exportar la hoja de ruta (manifiesto) a PDF.
- Pulir el diseño responsivo del dashboard para uso en tablets de almacén.
- Despliegue productivo en servidor cloud.

[← Volver al README Principal](../../../README.md)
