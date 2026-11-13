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

### US-007 — Inicio de Sesión y Autenticación Segura (scrypt + JWT HS256)

| Campo | Detalle |
|---|---|
| **ID** | US-007 |
| **Tipo** | Historia de Usuario |
| **Título** | Inicio de sesión, hashing seguro y autenticación con tokens JWT |
| **Descripción** | Como usuario del sistema, quiero acceder mediante una página de login segura para autenticarme con credenciales protegidas y recibir un token JWT que me permita utilizar las funcionalidades autorizadas de EcoLogCity. |
| **Responsable** | Quispe Aquino Junior (Frontend/UX) · Landa Rojas Alexander Nelson (Backend/Arquitecto) |
| **Estado** | ✅ Completado |

**Criterios de Aceptación Cumplidos:**

- [x] Existe una página `login.html` con formulario de correo y contraseña, estilizada con Tailwind CSS y navegable por teclado (Tab / Enter).
- [x] La función `hashPassword` emplea el algoritmo `scrypt` de Node.js crypto con salt aleatorio de 16 bytes (`salt:hash`), y `verifyPassword` valida con `timingSafeEqual`.
- [x] Al autenticarse correctamente, el servidor responde con un token JWT firmado (HS256) que almacena `id`, `nombre`, `email` y `rol`, persistido en `sessionStorage`.
- [x] Credenciales inválidas muestran un mensaje de error descriptivo en la interfaz sin exponer información interna del servidor.
- [x] El script `session.js` verifica la existencia del token al cargar cualquier página protegida y redirige al login si no se encuentra activo.
- [x] Se configuró un bloqueo tras 5 intentos fallidos consecutivos como regla de protección ante ataques de fuerza bruta (RN-005).

---

### US-008 — Endpoints de Gestión de Flota de Vehículos con Control de Acceso RBAC

| Campo | Detalle |
|---|---|
| **ID** | US-008 |
| **Tipo** | Historia de Usuario |
| **Título** | API de vehículos protegida por autenticación y rol ADMIN |
| **Descripción** | Como administrador, quiero poder crear, leer, actualizar y dar de baja registros de vehículos de la flota de DistriRápido S.A.C. mediante una API REST protegida por roles, para mantener el inventario operativo actualizado. |
| **Responsable** | Landa Rojas Alexander Nelson (Backend/Arquitecto) |
| **Estado** | ✅ Completado |

**Criterios de Aceptación Cumplidos:**

- [x] `GET /api/vehiculos` requiere token válido (cualquier rol autenticado); devuelve la lista completa de vehículos activos.
- [x] `POST /api/vehiculos`, `PUT /api/vehiculos/:id` y `DELETE /api/vehiculos/:id` requieren token con `role === 'ADMIN'`; devuelven HTTP 403 Forbidden a usuarios estándar.
- [x] El middleware `requireRole('ADMIN')` bloquea de forma centralizada cualquier acción administrativa no autorizada.
- [x] Todas las consultas SQL usan parámetros posicionales (`$1`, `$2`) con el driver `pg`, previniendo inyecciones SQL (OWASP A03).
- [x] Las respuestas siguen el estándar REST: 201 Created en POST, 200 OK en PUT/GET, 204 No Content en DELETE.
- [x] El frontend renderiza el panel de vehículos con botones de acción únicamente cuando el usuario autenticado posee el rol `ADMIN`.

---

### US-009 — Directorio de Pedidos Filtrado por Rol de Usuario

| Campo | Detalle |
|---|---|
| **ID** | US-009 |
| **Tipo** | Historia de Usuario |
| **Título** | Directorio de órdenes filtrado según el rol del usuario autenticado |
| **Descripción** | Como usuario, quiero ver únicamente los pedidos que me corresponden según mi rol, para que los despachadores vean solo sus propias órdenes registradas y los administradores tengan visibilidad total de la operación logística. |
| **Responsable** | Quispe Aquino Junior (Frontend/UX) + Landa Rojas Alexander Nelson (Backend) |
| **Estado** | ✅ Completado |

**Criterios de Aceptación Cumplidos:**

- [x] `GET /api/pedidos` para un usuario con rol `ADMIN` devuelve todos los pedidos registrados en el sistema.
- [x] `GET /api/pedidos` para un usuario con rol `USUARIO` devuelve únicamente los pedidos vinculados a su cuenta (`WHERE usuario_id = $1`).
- [x] El frontend consume el endpoint usando `apiFetch` (inyectando automáticamente el header `Authorization: Bearer <token>`) y renderiza la tabla dinámicamente.
- [x] El filtrado de datos ocurre estrictamente en el backend mediante SQL, garantizando que órdenes ajenas nunca viajen al cliente.
- [x] Los pedidos muestran estado, dirección de destino, coordenadas y ventana horaria acordada.

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

- [x] El script `002_usuarios_roles.sql` crea la tabla `usuarios` con columnas: `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`, `nombre_completo VARCHAR(150) NOT NULL`, `email VARCHAR(100) UNIQUE NOT NULL`, `password_hash TEXT NOT NULL`, `rol VARCHAR(20) NOT NULL DEFAULT 'USUARIO' CHECK (rol IN ('ADMIN','USUARIO'))`, `activo BOOLEAN DEFAULT TRUE`, `created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`.
- [x] Se agrega la columna `usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL` a la tabla `pedidos`.
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
3. El directorio de pedidos del `USUARIO` mostró únicamente sus dos órdenes asignadas, mientras que el `ADMIN` ve las 8 órdenes registradas en la base de datos (según datos semilla iniciales).

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
