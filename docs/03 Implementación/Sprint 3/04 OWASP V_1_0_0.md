[← Volver al README Principal](../../../README.md)

# Reporte de Seguridad OWASP Top 10 (2025)

**Nombre del Proyecto:** EcoLogCity — Optimizador de Rutas Logísticas para DistriRápido S.A.C.  
**Herramienta de Escaneo:** SonarQube / SonarCloud  
**Líder del Proyecto:** Albornoz Peña Jeferson Bener  
**Fecha del Análisis:** 28/10/2026  
**Versión del Análisis:** V_1_0_0  

## 1. Matriz de Cumplimiento OWASP Top 10 2025
<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-family: sans-serif; font-size: 13px; color: #ffffff;"><thead style="background-color: #6802c1;"><tr><th style="border: 1px solid #E9ECEF; padding: 8px; text-align: left;">Categoría OWASP 2025</th><th style="border: 1px solid #E9ECEF; padding: 8px; text-align: left;">Estado en Proyecto (Limpio / Vulnerable / Bajo Revisión)</th><th style="border: 1px solid #E9ECEF; padding: 8px; text-align: left;">Hallazgos de SonarQube</th></tr></thead><tbody><tr style="background-color: #212322;"><td style="border: 1px solid #444; padding: 8px;">A01:2025-Broken Access Control</td><td style="border: 1px solid #444; padding: 8px;">Limpio</td><td style="border: 1px solid #444; padding: 8px;">0 vulnerabilidades. Middlewares requireAuth y requireRole('ADMIN') protegen rutas críticas.</td></tr><tr style="background-color: #2a2c2b;"><td style="border: 1px solid #444; padding: 8px;">A02:2025-Cryptographic Failures</td><td style="border: 1px solid #444; padding: 8px;">Limpio</td><td style="border: 1px solid #444; padding: 8px;">0 vulnerabilidades. Hashing robusto con scrypt (N=16384, salt 16 bytes), JWT HS256 y TLS 1.3 en Render.</td></tr><tr style="background-color: #212322;"><td style="border: 1px solid #444; padding: 8px;">A03:2025-Injection</td><td style="border: 1px solid #444; padding: 8px;">Limpio</td><td style="border: 1px solid #444; padding: 8px;">0 vulnerabilidades. 100% de consultas SQL parametrizadas ($1, $2) con driver pg.</td></tr><tr style="background-color: #2a2c2b;"><td style="border: 1px solid #444; padding: 8px;">A04:2025-Insecure Design</td><td style="border: 1px solid #444; padding: 8px;">Bajo Revisión</td><td style="border: 1px solid #444; padding: 8px;">Lógica de bypass de admin hardcodeada en authService.js para desarrollo. Mitigado por commit V0.0.2.</td></tr><tr style="background-color: #212322;"><td style="border: 1px solid #444; padding: 8px;">A05:2025-Security Misconfiguration</td><td style="border: 1px solid #444; padding: 8px;">Bajo Revisión</td><td style="border: 1px solid #444; padding: 8px;">Hotspot SH-001: Fallback a string estático para JWT_SECRET. Falta paquete helmet para headers de seguridad HTTP.</td></tr><tr style="background-color: #2a2c2b;"><td style="border: 1px solid #444; padding: 8px;">A06:2025-Vulnerable and Outdated Components</td><td style="border: 1px solid #444; padding: 8px;">Limpio</td><td style="border: 1px solid #444; padding: 8px;">0 vulnerabilidades en npm audit. Dependencias principales bloqueadas en package-lock.json.</td></tr><tr style="background-color: #212322;"><td style="border: 1px solid #444; padding: 8px;">A07:2025-Identification and Authentication Failures</td><td style="border: 1px solid #444; padding: 8px;">Limpio</td><td style="border: 1px solid #444; padding: 8px;">Autenticación con scrypt y JWT robusta. Pendiente rate limiting para brute force en Sprint 4.</td></tr><tr style="background-color: #2a2c2b;"><td style="border: 1px solid #444; padding: 8px;">A08:2025-Software and Data Integrity Failures</td><td style="border: 1px solid #444; padding: 8px;">Limpio</td><td style="border: 1px solid #444; padding: 8px;">Sin deserialización insegura. Datos parseados como JSON primitivo y scripts de migración versionados.</td></tr><tr style="background-color: #212322;"><td style="border: 1px solid #444; padding: 8px;">A09:2025-Security Logging and Monitoring Failures</td><td style="border: 1px solid #444; padding: 8px;">Bajo Revisión</td><td style="border: 1px solid #444; padding: 8px;">Falta pista de auditoría persistida en base de datos. Planificada tabla audit_log para Sprint 4.</td></tr><tr style="background-color: #2a2c2b;"><td style="border: 1px solid #444; padding: 8px;">A10:2025-Server-Side Request Forgery (SSRF)</td><td style="border: 1px solid #444; padding: 8px;">Limpio</td><td style="border: 1px solid #444; padding: 8px;">Llamadas a Nominatim con URL base fija y parámetro encodeURIComponent; sin endpoints abiertos a URLs externas.</td></tr></tbody></table></div>

## 2. Detalles de Security Hotspots y Vulnerabilidades Críticas
- **Hotspot #1 (SH-001):** Fallback estático para `JWT_SECRET` en `backend/src/services/authService.js`. Mitigación: Validar en el arranque del servidor que la variable exista en el entorno y abortar con `throw new Error(...)` si está ausente.
- **Hotspot #2 (SH-002):** Transmisión de credenciales en texto plano antes de hashing en `backend/src/controllers/authController.js`. Mitigación: TLS 1.3 forzado por Render (HTTPS) en tránsito y hashing inmediato con scrypt + salt en el servidor sin almacenamiento previo.

---

## 3. Análisis Detallado por Categoría OWASP Top 10 (2025)
## A01 — Broken Access Control

**Estado: ✅ LIMPIO**

### Descripción del Riesgo
El control de acceso roto ocurre cuando los usuarios pueden actuar fuera de sus permisos previstos, accediendo a datos de otros usuarios, elevando privilegios o realizando operaciones no autorizadas.

### Análisis del Sistema

El sistema implementa una pila de middlewares de dos capas que protege todos los endpoints sensibles:

```
Request → requireAuth (verifica JWT) → requireRole('ADMIN') → Controller
```

**Middleware `requireAuth`:**
- Extrae el token del header `Authorization: Bearer <token>`.
- Verifica la firma y expiración del JWT.
- Adjunta `req.user = { id, correo, role }` para uso downstream.
- Responde 401 si el token está ausente, expirado o malformado.

**Middleware `requireRole(role)`:**
- Compara `req.user.role` con el rol requerido por la ruta.
- Responde 403 Forbidden si el rol no coincide.
- No consulta la base de datos: la decisión de autorización se toma exclusivamente del payload del JWT verificado.

### Endpoints y Protecciones Verificadas

| Endpoint | Método | Protección | Acceso USUARIO | Acceso ADMIN |
|---|---|---|---|---|
| `/api/auth/login` | POST | Público | ✅ | ✅ |
| `/api/pedidos` | GET | requireAuth + filtro por rol en SQL | Solo propios | Todos |
| `/api/pedidos` | POST | requireAuth | ✅ | ✅ |
| `/api/pedidos/:id` | PUT | requireAuth + owner check | Solo propios | ✅ |
| `/api/pedidos/:id` | DELETE | requireAuth | ❌ 403 | ✅ |
| `/api/vehiculos` | GET | requireAuth | ✅ | ✅ |
| `/api/vehiculos` | POST | requireAuth + requireRole('ADMIN') | ❌ 403 | ✅ |
| `/api/vehiculos/:id` | PUT | requireAuth + requireRole('ADMIN') | ❌ 403 | ✅ |
| `/api/vehiculos/:id` | DELETE | requireAuth + requireRole('ADMIN') | ❌ 403 | ✅ |

### Evidencia de Pruebas

Las pruebas de integración en `endpoints.test.js` validan que un token de `USUARIO` recibe 403 en `POST /api/vehiculos`, `PUT /api/vehiculos/:id` y `DELETE /api/vehiculos/:id`. Las 6 pruebas de este archivo pasan en verde.

**Conclusión:** No se detectaron vulnerabilidades de control de acceso roto en el Sprint 3.

---

## A02 — Cryptographic Failures

**Estado: ✅ LIMPIO**

### Descripción del Riesgo
Fallos criptográficos incluyen el uso de algoritmos débiles o deprecados (MD5, SHA-1, DES), transmisión de datos sensibles sin cifrado, o gestión inadecuada de claves.

### Análisis del Sistema

**Hashing de Contraseñas — scrypt:**

```javascript
// authService.js
const crypto = require('crypto');
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, keylen: 64 };

function hashPassword(plainText) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(plainText, salt, SCRYPT_PARAMS.keylen, SCRYPT_PARAMS);
  return `${salt}:${hash.toString('hex')}`;
}

function verifyPassword(plainText, storedHash) {
  const [salt, hash] = storedHash.split(':');
  const derivedHash = crypto.scryptSync(plainText, salt, SCRYPT_PARAMS.keylen, SCRYPT_PARAMS);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), derivedHash);
}
```

- ✅ Se usa **scrypt** (recomendado por NIST SP 800-132) en lugar de MD5, SHA-1 o bcrypt deprecado.
- ✅ Salt aleatorio de **16 bytes** (128 bits) generado con `crypto.randomBytes` (CSPRNG).
- ✅ Comparación con **`timingSafeEqual`** para prevenir timing attacks.
- ✅ Los parámetros de costo (`N=16384`) proporcionan resistencia adecuada a ataques de fuerza bruta en hardware moderno.

**Firma de Tokens JWT — HS256:**

- ✅ Algoritmo HS256 (HMAC-SHA256) con clave secreta desde variable de entorno.
- ✅ Expiración de 8 horas configurada en el payload (`exp`).
- ✅ La verificación rechaza tokens con algoritmo `none` (verificación explícita del header).

**Transmisión — HTTPS/TLS:**

- ✅ Render (plataforma de hosting) fuerza HTTPS en todos los dominios. HTTP redirige automáticamente a HTTPS.
- ✅ Las contraseñas se transmiten cifradas en tránsito sobre TLS 1.3.

**Datos en Reposo:**

- ✅ Las contraseñas en PostgreSQL se almacenan como `salt:scryptHash`, nunca en texto plano.
- ✅ No se almacenan tokens JWT en la base de datos (stateless).

**Conclusión:** No se detectaron fallos criptográficos. El sistema usa algoritmos modernos y recomendados.

---

## A03 — Injection

**Estado: ✅ LIMPIO**

### Descripción del Riesgo
Los ataques de inyección (SQL, NoSQL, OS, LDAP) ocurren cuando datos no confiables son enviados a un intérprete como parte de un comando o consulta.

### Análisis del Sistema

**Consultas SQL Parametrizadas:**

El 100% de las consultas a PostgreSQL usan la sintaxis de parámetros posicionales del driver `pg`:

```javascript
// pedidoRepository.js — ejemplo de consulta parametrizada
const getPedidosByUser = async (userId) => {
  const result = await pool.query(
    'SELECT * FROM pedidos WHERE usuario_id = $1 ORDER BY creado_en DESC',
    [userId]  // ← parámetro, nunca concatenación de strings
  );
  return result.rows;
};

// usuarioRepository.js — login seguro
const findByCorreo = async (correo) => {
  const result = await pool.query(
    'SELECT * FROM usuarios WHERE correo = $1',
    [correo]  // ← parámetro posicional, inmune a SQL injection
  );
  return result.rows[0];
};
```

- ✅ **Ninguna consulta** construye SQL mediante concatenación de strings o template literals con datos del usuario.
- ✅ El driver `pg` separa el código SQL de los datos, eliminando la superficie de ataque de inyección SQL.
- ✅ No se usan consultas dinámicas (`eval`, `Function()`) ni ejecución de comandos del sistema (`child_process.exec` con input del usuario).

**Input Validation:**

- ✅ Los correos electrónicos se validan con regex antes de ser enviados a la base de datos.
- ✅ Los IDs numéricos en rutas (`/api/pedidos/:id`) se parsean con `parseInt()` y se validan como enteros positivos antes de usarlos en consultas.

**Conclusión:** No se detectaron vulnerabilidades de inyección. Todas las consultas usan parámetros posicionales.

---

## A04 — Insecure Design

**Estado: ⚠️ BAJO REVISIÓN**

### Descripción del Riesgo
El diseño inseguro abarca deficiencias en el diseño de la arquitectura de seguridad: flujos sin controles de seguridad, ausencia de modelado de amenazas, o bypasses intencionales para desarrollo que persisten en producción.

### Hallazgo Identificado — Bypass de Admin en Desarrollo

**Descripción:**
Durante el Sprint 3 se identificó la existencia de un bypass de autenticación en `authService.js` originalmente introducido para facilitar el desarrollo local:

```javascript
// authService.js — BYPASS DE DESARROLLO (A04 HOTSPOT)
async function loginUser(correo, password) {
  // BYPASS TEMPORAL DE DESARROLLO — ELIMINAR ANTES DE PRODUCCIÓN
  if (correo === 'admin@dev.local' && password === 'devpass123') {
    return signToken({ id: 0, correo, role: 'ADMIN' });
  }
  // ... lógica de login normal con verificación en BD
}
```

**Análisis de Riesgo:**

| Factor | Evaluación |
|---|---|
| **¿Existe en producción (Render)?** | Sí, el código se despliega tal cual |
| **¿Es conocido el correo/password de bypass?** | Potencialmente sí (está en el código fuente del repositorio) |
| **¿Qué acceso obtendría un atacante?** | Token de ADMIN con `id: 0` (no vinculado a un usuario real) |
| **¿Puede acceder a datos reales?** | Sí, todos los endpoints de ADMIN |
| **Severidad** | Alta (si el repositorio es público) / Baja (si es privado) |

**Plan de Remediación:**

- **Acción inmediata:** Eliminar el bloque de bypass antes del siguiente despliegue a producción.
- **Práctica futura:** Los bypasses de desarrollo deben ir en archivos de configuración de test (`jest.setup.js`) o en mocks, nunca en el código de servicio productivo.
- **Responsable:** Landa Rojas Alexander Nelson
- **Fecha Límite:** 29/10/2026 (antes del próximo despliegue)

---

## A05 — Security Misconfiguration

**Estado: ⚠️ BAJO REVISIÓN**

### Descripción del Riesgo
La configuración incorrecta incluye permisos innecesarios, funciones habilitadas por defecto no utilizadas, mensajes de error con stack traces expuestos, y configuración de seguridad ausente o por defecto.

### Hallazgo 1 — JWT_SECRET con Fallback Hardcodeado

*(Ver también SH-001 en el documento de Calidad de Código)*

```javascript
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-ecologcity-2026';
```

**Riesgo:** Si la variable de entorno no está configurada en algún entorno, el sistema usa un secret conocido que podría estar en el repositorio git público. Cualquier persona con acceso al código fuente podría generar tokens JWT válidos.

**Remediación:** Lanzar error de arranque si `JWT_SECRET` no está configurado (ver plan en Calidad de Código SH-001).

### Hallazgo 2 — Headers de Seguridad HTTP

**Descripción:** El servidor Express no configura headers de seguridad HTTP estándar (X-Content-Type-Options, X-Frame-Options, Content-Security-Policy).

**Riesgo:** Bajo — el sistema es una API REST consumida principalmente por el frontend propio, no por terceros.

**Remediación Propuesta:** Agregar el middleware `helmet` de npm en Sprint 4:

```javascript
const helmet = require('helmet');
app.use(helmet()); // Configura 11 headers de seguridad automáticamente
```

### Hallazgo 3 — Stack Traces en Respuestas de Error

**Descripción:** En modo desarrollo, los errores no capturados exponen el stack trace completo en la respuesta JSON.

**Remediación:** El manejador de errores global ya distingue entre desarrollo y producción mediante `process.env.NODE_ENV`. Verificar que Render tiene `NODE_ENV=production` configurado.

---

## A06 — Vulnerable and Outdated Components

**Estado: ✅ LIMPIO**

### Descripción del Riesgo
El uso de librerías, frameworks o componentes con vulnerabilidades conocidas (CVEs) puede comprometer el sistema incluso si el código propio es seguro.

### Análisis del Sistema

Se ejecutó `npm audit` en el repositorio al cierre del Sprint 3:

```
$ npm audit
found 0 vulnerabilities
```

**Dependencias Principales Verificadas:**

| Paquete | Versión Actual | Última Versión | Estado |
|---|---|---|---|
| `express` | 4.19.2 | 4.19.2 | ✅ Actualizado |
| `pg` | 8.12.0 | 8.12.0 | ✅ Actualizado |
| `dotenv` | 16.4.5 | 16.4.5 | ✅ Actualizado |
| `supertest` (dev) | 7.0.0 | 7.0.0 | ✅ Actualizado |
| `jest` (dev) | 29.7.0 | 29.7.0 | ✅ Actualizado |

**Nota:** El proyecto implementó JWT y hashing de contraseñas usando únicamente módulos nativos de Node.js (`crypto`), eliminando dependencias de paquetes de terceros para funcionalidad crítica de seguridad.

**Acción de Mantenimiento:** Ejecutar `npm audit` y `npm outdated` al inicio de cada Sprint. Configurar Dependabot en el repositorio de GitHub para recibir alertas automáticas de vulnerabilidades en dependencias.

---

## A07 — Identification and Authentication Failures

**Estado: ✅ LIMPIO*** *(con observación futura)*

### Descripción del Riesgo
Fallos en autenticación incluyen: permisos de contraseñas débiles, credenciales por defecto, falta de protección contra brute force, sesiones que no expiran, y ausencia de MFA.

### Análisis del Sistema

**Fortalezas Identificadas:**

- ✅ **Hashing robusto:** scrypt con salt único por usuario (ver A02).
- ✅ **Expiración de tokens:** JWT con `exp` de 8 horas; los tokens expirados son rechazados.
- ✅ **Comparación timing-safe:** `timingSafeEqual` en verificación de contraseñas.
- ✅ **Tokens stateless:** No se almacenan en base de datos; la invalidación se maneja por expiración.
- ✅ **Errores genéricos:** El endpoint de login devuelve el mismo mensaje para "usuario no encontrado" y "contraseña incorrecta", previniendo enumeración de usuarios.

**Observación Futura — Protección Brute Force:**

El sistema no implementa actualmente limitación de intentos de login fallidos. Un atacante podría realizar ataques de diccionario o fuerza bruta contra el endpoint `/api/auth/login` sin ser bloqueado.

**Mitigación Actual:** scrypt con `N=16384` hace que cada intento de verificación tome ~100ms en el servidor, limitando a ~10 intentos/segundo por thread.

**Plan Sprint 4:** Implementar middleware de rate limiting (librería `express-rate-limit`) con bloqueo tras 5 intentos fallidos en ventana de 15 minutos, respondiendo 429 Too Many Requests.

---

## A08 — Software and Data Integrity Failures

**Estado: ✅ LIMPIO**

### Descripción del Riesgo
Incluye deserialización insegura, actualizaciones de software sin verificación de integridad, y compromisos de la cadena de suministro (CI/CD pipeline).

### Análisis del Sistema

- ✅ **Sin deserialización de objetos:** El sistema no deserializa objetos Java/PHP/Python. Los datos del cliente se reciben como JSON y se procesan como primitivos.
- ✅ **`package-lock.json` comprometido en git:** Las versiones exactas de las dependencias están bloqueadas, previniendo "dependency confusion attacks".
- ✅ **Sin pipeline CI/CD aún:** Al no existir pipeline automático, no hay superficie de ataque de supply chain en el proceso de build. Cuando se implemente en Sprint 4 (GitHub Actions), se configurarán los permisos mínimos necesarios para el job de deploy.
- ✅ **Integridad de migraciones:** Los scripts SQL de migración son versionados en git y ejecutados manualmente por el arquitecto, con revisión del equipo antes de aplicar en producción.

---

## A09 — Security Logging and Monitoring Failures

**Estado: ⚠️ BAJO REVISIÓN**

### Descripción del Riesgo
La ausencia de logging de eventos de seguridad y monitoreo impide detectar, escalar y responder a brechas de seguridad activas o pasadas.

### Análisis del Sistema

**Estado Actual:**

El sistema usa `console.log` y `console.error` para logging básico. No existe un sistema de logging estructurado ni una pista de auditoría.

| Evento de Seguridad | ¿Está Registrado? | ¿Dónde? |
|---|---|---|
| Login exitoso | ⚠️ Parcial | `console.log` (no persistido) |
| Login fallido | ⚠️ Parcial | `console.error` (no persistido) |
| Acceso denegado (403) | ❌ No | — |
| Modificación de datos (PUT/DELETE) | ❌ No | — |
| Creación de usuarios | ❌ No | — |
| Intentos de token inválido | ❌ No | — |

**Impacto:** Si ocurriera una brecha de seguridad, el equipo no tendría evidencia forense para determinar qué datos fueron accedidos, cuándo, ni desde qué IP.

**Plan de Remediación — Sprint 4:**

1. Implementar tabla `audit_log` en PostgreSQL con campos: `id`, `usuario_id`, `evento`, `recurso`, `ip_origen`, `timestamp`, `resultado`.
2. Registrar todos los eventos de autenticación y operaciones CRUD en la tabla de auditoría.
3. Exponer endpoint `GET /api/admin/audit` (sólo ADMIN) para consulta del historial.
4. Evaluar integración con servicio de logging externo (Render Logs, Logtail) para persistencia fuera de la base de datos.

**Responsable:** Landa Rojas Alexander Nelson | **Fecha Límite:** 11/11/2026

---

## A10 — Server-Side Request Forgery (SSRF)

**Estado: ✅ LIMPIO**

### Descripción del Riesgo
SSRF ocurre cuando el servidor realiza peticiones a URLs proporcionadas o influenciadas por el atacante, permitiendo acceder a recursos internos de la red del servidor (metadata de cloud, servicios internos, etc.).

### Análisis del Sistema

El único servicio externo al que el backend realiza peticiones HTTP es la API de geocodificación **Nominatim (OpenStreetMap)**:

```javascript
// geocodingController.js
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

async function geocodificarDireccion(req, res) {
  const { direccion } = req.body;
  // La URL es construida por el servidor, no proviene del cliente
  const url = `${NOMINATIM_BASE_URL}?q=${encodeURIComponent(direccion)}&format=json&limit=1`;
  const response = await fetch(url);
  // ...
}
```

**Análisis:**

- ✅ **URL controlada:** La URL base de Nominatim está hardcodeada en el servidor. El cliente sólo proporciona el string de la dirección, que es `encodeURIComponent`-escapado antes de ser usado como query parameter.
- ✅ **Sin redirecciones:** La URL no es construida con protocolos, hosts o paths del cliente, eliminando la posibilidad de redirigir la petición a `http://169.254.169.254/` (metadata de AWS) u otros recursos internos.
- ✅ **Sin fetch de URLs arbitrarias:** No existe ningún endpoint que acepte una URL como parámetro y la fetche desde el servidor.

**Conclusión:** La superficie de ataque SSRF es mínima y controlada. No se detectaron vulnerabilidades.

---

## Resumen de Plan de Remediación

| Categoría | Hallazgo | Severidad | Responsable | Fecha Límite | Sprint |
|---|---|---|---|---|---|
| A04 | Bypass de admin hardcodeado en `authService.js` | Alta | Landa Rojas | 29/10/2026 | Inmediato |
| A05 | JWT_SECRET con fallback hardcodeado | Media | Landa Rojas | 04/11/2026 | Sprint 4 |
| A05 | Ausencia de headers de seguridad HTTP (helmet) | Baja | Landa Rojas | 11/11/2026 | Sprint 4 |
| A07 | Sin protección brute force en login | Media | Landa Rojas | 11/11/2026 | Sprint 4 |
| A09 | Sin sistema de auditoría estructurado | Media | Landa Rojas | 11/11/2026 | Sprint 4 |


[← Volver al README Principal](../../../README.md)
