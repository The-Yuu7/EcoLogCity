[← Volver al README Principal](../../../README.md)

# Revisión del Sprint

**Nombre del Proyecto:** EcoLogCity — Optimizador de Rutas Logísticas para DistriRápido S.A.C.  
**Sprint:** 3  
**Versión del Documento:** 1.0.0  
**Líder del Proyecto:** Albornoz Peña Jeferson Bener  
**Fecha de Revisión:** 28/10/2026  
**Lugar:** Huancayo, Perú  

**Equipo de Desarrollo:**

| Rol | Integrante |
|---|---|
| PM / Líder | Albornoz Peña Jeferson Bener |
| Backend / Arquitecto | Landa Rojas Alexander Nelson |
| Frontend / UX | Quispe Aquino Junior |

---

## Historias de Usuario Completadas en este Sprint

### US-005 — Página de Login con Autenticación JWT

| Campo | Detalle |
|---|---|
| **ID** | US-005 |
| **Tipo** | Historia de Usuario |
| **Título** | Página de inicio de sesión con autenticación JWT |
| **Descripción** | Como usuario del sistema, quiero acceder mediante una página de login segura para autenticarme y recibir un token JWT que me permita usar las funcionalidades protegidas de EcoLogCity. |
| **Responsable** | Quispe Aquino Junior (Frontend/UX) |
| **Estado** | ✅ Completado |

**Criterios de Aceptación Cumplidos:**

- [x] Existe una página `login.html` con formulario de correo y contraseña, estilizada de forma consistente con la identidad visual del proyecto.
- [x] Al enviar credenciales válidas, el servidor responde con un token JWT firmado (HS256) almacenado en `sessionStorage`.
- [x] Credenciales inválidas muestran un mensaje de error descriptivo en la interfaz sin exponer información sensible del servidor.
- [x] El formulario es completamente navegable por teclado (Tab / Enter).
- [x] Se redirige al dashboard principal (`index.html`) tras un login exitoso.
- [x] El script `session.js` verifica la existencia del token al cargar cualquier página protegida y redirige al login si no lo encuentra.

---

### US-006 — Control de Acceso Basado en Roles (RBAC)

| Campo | Detalle |
|---|---|
| **ID** | US-006 |
| **Tipo** | Historia de Usuario |
| **Título** | Control de acceso basado en roles ADMIN y USUARIO |
| **Descripción** | Como administrador, quiero que el sistema distinga entre roles `ADMIN` y `USUARIO` para que cada perfil acceda únicamente a las funciones que le corresponden, garantizando la seguridad de los datos de DistriRápido S.A.C. |
| **Responsable** | Landa Rojas Alexander Nelson (Backend/Arquitecto) |
| **Estado** | ✅ Completado |

**Criterios de Aceptación Cumplidos:**

- [x] El middleware `requireRole('ADMIN')` bloquea el acceso a rutas de gestión de vehículos para usuarios con rol `USUARIO`, respondiendo HTTP 403.
- [x] El dashboard de frontend renderiza elementos de interfaz de administración (panel de vehículos, botón "Agregar pedido manual") sólo cuando `payload.role === 'ADMIN'`.
- [x] Los usuarios con rol `USUARIO` ven únicamente sus propios pedidos en el directorio de órdenes.
- [x] El rol queda codificado dentro del payload del JWT y es verificado en cada petición protegida sin consultar la base de datos en cada request.
- [x] Las pruebas de integración validan que un token de `USUARIO` recibe 403 al acceder a endpoints de `ADMIN`.

---

### US-007 — Sistema de Autenticación Completo (hashPassword + signToken + verifyToken)

| Campo | Detalle |
|---|---|
| **ID** | US-007 |
| **Tipo** | Historia de Usuario |
| **Título** | Sistema de autenticación seguro con hashing scrypt y JWT HS256 |
| **Descripción** | Como arquitecto del sistema, quiero implementar funciones de seguridad robustas (`hashPassword`, `signToken`, `verifyToken`) para que las credenciales de los usuarios se almacenen y transmitan de forma segura. |
| **Responsable** | Landa Rojas Alexander Nelson (Backend/Arquitecto) |
| **Estado** | ✅ Completado |

**Criterios de Aceptación Cumplidos:**

- [x] `hashPassword(plain)` utiliza el algoritmo `scrypt` de Node.js crypto con salt aleatorio de 16 bytes; el hash resultante se almacena como `salt:hash` en la base de datos.
- [x] `verifyPassword(plain, stored)` reconstruye el hash con el mismo salt y compara con `timingSafeEqual` para prevenir ataques de timing.
- [x] `signToken(payload)` genera un JWT firmado con HS256 usando `JWT_SECRET` desde variables de entorno, con expiración configurable (por defecto 8h).
- [x] `verifyToken(token)` valida la firma y expiry; lanza error descriptivo si el token está expirado o manipulado.
- [x] El middleware `requireAuth` extrae el token del header `Authorization: Bearer <token>` y adjunta el payload al objeto `req.user`.
- [x] Ninguna contraseña en texto plano se persiste en la base de datos ni aparece en los logs.

---

### US-008 — Endpoints de Gestión de Vehículos con Protección de Rol

| Campo | Detalle |
|---|---|
| **ID** | US-008 |
| **Tipo** | Historia de Usuario |
| **Título** | API de vehículos protegida por autenticación y rol ADMIN |
| **Descripción** | Como administrador, quiero poder crear, leer, actualizar y eliminar registros de vehículos de la flota de DistriRápido S.A.C. mediante una API REST protegida, para mantener el inventario actualizado. |
| **Responsable** | Landa Rojas Alexander Nelson (Backend/Arquitecto) |
| **Estado** | ✅ Completado |

**Criterios de Aceptación Cumplidos:**

- [x] `GET /api/vehiculos` requiere token válido (cualquier rol); devuelve lista completa de vehículos.
- [x] `POST /api/vehiculos`, `PUT /api/vehiculos/:id` y `DELETE /api/vehiculos/:id` requieren token con `role === 'ADMIN'`; devuelven 403 en caso contrario.
- [x] Todas las consultas SQL usan parámetros posicionales (`$1`, `$2`) previniendo inyección SQL.
- [x] Las respuestas siguen el estándar REST: 201 Created en POST, 200 OK en PUT/GET, 204 No Content en DELETE.
- [x] El frontend muestra el panel de vehículos con botones de acción únicamente cuando el usuario tiene rol `ADMIN`.

---

### US-009 — Directorio de Pedidos Filtrado por Rol de Usuario

| Campo | Detalle |
|---|---|
| **ID** | US-009 |
| **Tipo** | Historia de Usuario |
| **Título** | Directorio de órdenes filtrado según el rol del usuario autenticado |
| **Descripción** | Como usuario, quiero ver únicamente los pedidos que me corresponden según mi rol, para que los repartidores sólo vean sus propias órdenes y los administradores tengan visibilidad total de la operación. |
| **Responsable** | Quispe Aquino Junior (Frontend/UX) + Landa Rojas Alexander Nelson (Backend) |
| **Estado** | ✅ Completado |

**Criterios de Aceptación Cumplidos:**

- [x] `GET /api/pedidos` para un `ADMIN` devuelve todos los pedidos de la tabla.
- [x] `GET /api/pedidos` para un `USUARIO` devuelve sólo los pedidos donde `usuario_id = req.user.id`.
- [x] El frontend consume el endpoint usando `apiFetch` (wrapper que inyecta el header `Authorization: Bearer`) y renderiza la tabla de pedidos dinámicamente.
- [x] El filtrado ocurre en la capa de backend (SQL `WHERE`), no en el frontend, garantizando que los datos no filtrados nunca llegan al cliente.
- [x] Los pedidos muestran estado, dirección de destino y hora estimada de entrega.

---

### EN-002 — Migración SQL: Tabla `usuarios` y Vinculación de Pedidos

| Campo | Detalle |
|---|---|
| **ID** | EN-002 |
| **Tipo** | Tarea de Ingeniería (Engineering Task) |
| **Título** | Script de migración `002_usuarios_roles.sql` |
| **Descripción** | Crear el script de migración que establezca la tabla `usuarios` con soporte de roles y actualice la tabla `pedidos` para vincular cada orden a su usuario propietario. |
| **Responsable** | Landa Rojas Alexander Nelson (Backend/Arquitecto) |
| **Estado** | ✅ Completado |

**Criterios de Aceptación Cumplidos:**

- [x] El script `002_usuarios_roles.sql` crea la tabla `usuarios` con columnas: `id SERIAL PRIMARY KEY`, `correo VARCHAR UNIQUE NOT NULL`, `hash_contrasena TEXT NOT NULL`, `rol VARCHAR(10) CHECK (rol IN ('ADMIN','USUARIO')) NOT NULL`, `creado_en TIMESTAMP DEFAULT NOW()`.
- [x] Se agrega la columna `usuario_id INTEGER REFERENCES usuarios(id)` a la tabla `pedidos`.
- [x] El script es idempotente (`CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`).
- [x] La migración se aplica exitosamente en el entorno de Render (PostgreSQL 15) sin errores.
- [x] Se incluye un usuario semilla ADMIN para pruebas con contraseña hasheada.

---

### EN-003 — Suite de Pruebas de Integración con Supertest

| Campo | Detalle |
|---|---|
| **ID** | EN-003 |
| **Tipo** | Tarea de Ingeniería (Engineering Task) |
| **Título** | Pruebas de integración con Supertest: `auth.test.js`, `pedidos.test.js`, `endpoints.test.js` |
| **Descripción** | Implementar una suite completa de pruebas de integración que valide el flujo de autenticación, el control de acceso y la operación correcta de los endpoints principales. |
| **Responsable** | Landa Rojas Alexander Nelson (Backend/Arquitecto) |
| **Estado** | ✅ Completado |

**Criterios de Aceptación Cumplidos:**

- [x] `auth.test.js`: valida login exitoso (200 + token), login con contraseña inválida (401), login con usuario inexistente (401) y acceso a ruta protegida sin token (401).
- [x] `pedidos.test.js`: valida que `USUARIO` sólo recibe sus pedidos, que `ADMIN` recibe todos, y que un token expirado recibe 401.
- [x] `endpoints.test.js`: valida el acceso a `/api/vehiculos` con rol `USUARIO` (403 en POST/PUT/DELETE) y con rol `ADMIN` (201/200/204).
- [x] Total: **18 pruebas pasando** en las 3 suites, cobertura del **78%**.
- [x] Se configuraron los flags `--detectOpenHandles --forceExit` para manejar el comportamiento de cold-start del tier gratuito de Render.

---

## Demostración del Trabajo Completado

La demostración del Sprint 3 se realizó ante los stakeholders de DistriRápido S.A.C. el 28/10/2026. A continuación se describe el flujo demostrado:

### Escenario 1 — Flujo de Login y Autenticación

1. El facilitador abrió `login.html` en el navegador y mostró el formulario de acceso.
2. Se introdujeron credenciales inválidas → el sistema mostró el mensaje: *"Correo o contraseña incorrectos. Por favor, verifique sus datos."*
3. Se introdujeron las credenciales del usuario `ADMIN` → el sistema generó un token JWT, lo almacenó en `sessionStorage` y redirigió al dashboard `index.html`.
4. Se inspeccionó el token en las DevTools del navegador, decodificando el payload para mostrar el campo `role: "ADMIN"` y el tiempo de expiración.

### Escenario 2 — Dashboard con Control de Acceso por Rol

1. Con sesión de `ADMIN` activa: se mostró el panel completo con botones de "Gestión de Vehículos" y "Agregar Pedido".
2. Se cerró sesión y se inició con credenciales de `USUARIO` → el dashboard ocultó automáticamente los controles administrativos.
3. El directorio de pedidos del `USUARIO` mostró únicamente sus dos órdenes asignadas, mientras que el `ADMIN` ve las 7 órdenes totales en la base de datos.

### Escenario 3 — API REST Protegida (demostración con Postman)

1. `POST /api/auth/login` con credenciales válidas → respuesta 200 con JWT.
2. `POST /api/vehiculos` sin header `Authorization` → respuesta 401 Unauthorized.
3. `POST /api/vehiculos` con token de `USUARIO` → respuesta 403 Forbidden.
4. `POST /api/vehiculos` con token de `ADMIN` → respuesta 201 Created con el nuevo vehículo.
5. `DELETE /api/vehiculos/3` con token de `ADMIN` → respuesta 204 No Content.

### Escenario 4 — Suite de Pruebas Automatizadas

Se ejecutó `npm test` en vivo ante los stakeholders, mostrando la salida de Jest con las **18 pruebas en verde** distribuidas en `auth.test.js`, `pedidos.test.js` y `endpoints.test.js`. Se destacó el reporte de cobertura del 78%.

---

## Feedback de Stakeholders

| Observación | Prioridad | Acción |
|---|---|---|
| Solicitan pantalla de recuperación de contraseña para repartidores olvidadizos. | Alta | Incluida en backlog Sprint 4 (US-010). |
| Piden que el login muestre el logo de DistriRápido S.A.C. | Media | Tarea de diseño asignada a Sprint 4. |
| Preguntan si el sistema resiste múltiples intentos de login fallidos. | Alta | Protección brute-force planificada para Sprint 4 (US-011). |

---

## Pendientes y Backlog Sprint 4

Los siguientes ítems no formaron parte del Sprint 3 y se trasladan al siguiente ciclo:

| ID | Descripción | Justificación del Aplazamiento |
|---|---|---|
| US-010 | Flujo de recuperación y restablecimiento de contraseña vía correo electrónico | Dependencia de servicio SMTP externo; fuera del alcance del Sprint 3 |
| US-011 | Protección contra fuerza bruta (bloqueo tras N intentos fallidos) | Identificado como deuda de seguridad en Sprint 3; prioridad alta para Sprint 4 |
| US-012 | Registro de auditoría estructurado (audit logging) | Detectado como hotspot A09 OWASP; requiere definir esquema de logs |
| US-013 | Pipeline CI/CD con GitHub Actions para despliegue automático en Render | Eficiencia de proceso; planificado tras estabilización del sistema auth |
| IMP-007 | Implementar `role=main` y landmarks ARIA en todas las páginas | Hallazgo WCAG 4.1.2; corrección de accesibilidad pendiente |
| IMP-008 | Agregar protección CSRF en formulario de login | Buenas prácticas OWASP A04; revisión de diseño pendiente |
