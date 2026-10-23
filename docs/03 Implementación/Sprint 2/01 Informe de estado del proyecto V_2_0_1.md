# Informe de estado del proyecto

[← Volver al README Principal](../../../README.md)

**Nombre del Proyecto:** EcoLogCity
**Líder del Proyecto:** Albornoz Peña Jeferson Bener

## Historias de Usuario completadas en este Sprint
- **US-003**: Motor de Optimización de Rutas (VRPTW & Green VRP), implementado como heurística constructiva (greedy) con validación de restricciones de capacidad y ventanas horarias.
- **US-004**: Trazado de Rutas en Calles Reales (OSRM).
- **US-005**: Cálculo de penalización atmosférica y reducción de emisiones de CO2 (factor de altitud de Huancayo incluido).
- **US-007**: Inicio de Sesión y Control de Acceso por Roles (Administrador y Usuario).
- **US-008**: Gestión de Flota de Vehículos (registrar, dar de baja y reactivar).
- **US-009**: Directorio de Pedidos por Rol (el usuario ve sus pedidos; el administrador ve el directorio general).

## Demostración del trabajo completado
Demostración a los stakeholders:
- Inicio de sesión con la cuenta de administrador y con la cuenta de usuario, mostrando qué ve cada rol.
- Con el usuario: registro de un pedido que aparece solo en "Mis Pedidos Registrados".
- Con el administrador: el "Directorio General de Pedidos" muestra todos los pedidos y quién registró cada uno.
- Con el administrador: registro de un vehículo en "Gestión de Flota" y baja de otro; el dashboard recalcula la ocupación de la flota activa.
- Activación del botón "Optimizar Rutas (Green VRP)", disponible solo para el administrador.
- El algoritmo agrupó los pedidos por capacidad de vehículo y ventanas de tiempo.
- Las rutas se trazaron sobre calles reales en Leaflet usando OSRM, con un color distinto por vehículo.
- Se mostró el ahorro logístico y el impacto ambiental estimado (Green VRP).

## Pendientes
- Exportar la hoja de ruta (manifiesto) a PDF.
- Pulir el diseño responsivo del dashboard para uso en tablets de almacén.
- Despliegue productivo en servidor cloud.

[← Volver al README Principal](../../../README.md)
