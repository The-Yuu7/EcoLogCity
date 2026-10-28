[← Volver al README Principal](../../../README.md)

# Evaluación de Calidad de Código — SonarQube

**Nombre del Proyecto:** EcoLogCity — Optimizador de Rutas Logísticas para DistriRápido S.A.C.  
**Fecha de Análisis:** 2026-10-28  
**Versión del Análisis:** V_1_0_0  
**Herramienta de Análisis:** SonarQube / SonarCloud  
**Líder del Proyecto:** Albornoz Peña Jeferson Bener  

## 1. Resumen Ejecutivo de Quality Gate
- **Estado del Quality Gate:** PASSED
- **Porcentaje de Cobertura de Pruebas (Coverage):** 78%
- **Duplicación de Código:** 4.2%

## 2. Métricas Principales
<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-family: sans-serif; font-size: 13px; color: #ffffff;"><thead style="background-color: #6802c1;"><tr><th style="border: 1px solid #E9ECEF; padding: 8px; text-align: left;">Categoría</th><th style="border: 1px solid #E9ECEF; padding: 8px; text-align: left;">Cantidad Detectada</th><th style="border: 1px solid #E9ECEF; padding: 8px; text-align: left;">Severidad (Bloqueante / Alta / Media / Baja)</th></tr></thead><tbody><tr style="background-color: #212322;"><td style="border: 1px solid #444; padding: 8px;"><strong>Bugs</strong></td><td style="border: 1px solid #444; padding: 8px;">2</td><td style="border: 1px solid #444; padding: 8px;">Media (0 Bloqueantes)</td></tr><tr style="background-color: #2a2c2b;"><td style="border: 1px solid #444; padding: 8px;"><strong>Vulnerabilidades</strong></td><td style="border: 1px solid #444; padding: 8px;">0</td><td style="border: 1px solid #444; padding: 8px;">Ninguna (Limpio)</td></tr><tr style="background-color: #212322;"><td style="border: 1px solid #444; padding: 8px;"><strong>Code Smells</strong></td><td style="border: 1px solid #444; padding: 8px;">5</td><td style="border: 1px solid #444; padding: 8px;">Baja / Media</td></tr><tr style="background-color: #2a2c2b;"><td style="border: 1px solid #444; padding: 8px;"><strong>Security Hotspots</strong></td><td style="border: 1px solid #444; padding: 8px;">2</td><td style="border: 1px solid #444; padding: 8px;">Media (Bajo Revisión)</td></tr></tbody></table></div>

## 3. Plan de Remediación y Deuda Técnica
- **Deuda Técnica Estimada:** 2h 15m
- **Principales hallazgos y acciones correctivas:**
  1. **BUG-001 (rutaService.js):** Variable `distanciaBase` no utilizada. Se eliminará la línea de código muerto para evitar confusión en el cálculo de distancias (Acción: Alexander Landa, Sprint 4).
  2. **BUG-002 (geocodingController.js):** Llamada asíncrona a caché sin `await` en bloque catch. Se añadirá `await obtenerCoordenadasCache(...)` para garantizar respuesta correcta en contingencias de Nominatim (Acción: Alexander Landa, Sprint 4).
  3. **SH-001 (authService.js):** Fallback hardcodeado para `JWT_SECRET`. Se forzará lanzamiento de excepción fatal si `process.env.JWT_SECRET` no está configurada, impidiendo que el servidor levante sin credenciales seguras (Acción: Alexander Landa, Sprint 4).
  4. **CS-004 / CS-005 (pedidoController.js):** Métodos largos y lógica de autorización repetida. Se modularizará en funciones auxiliares `buildPedidosQuery` y `canModifyPedido` (Acción: Alexander Landa, Sprint 4).

---

## 4. Desglose Detallado de Cobertura y Métricas

### Resultado Global: 78%

### Resultado Global: 78%

| Archivo de Tests | Pruebas Pasando | Pruebas Fallando | Cobertura Aportada |
|---|---|---|---|
| `auth.test.js` | 6 | 0 | ~28% |
| `pedidos.test.js` | 6 | 0 | ~26% |
| `endpoints.test.js` | 6 | 0 | ~24% |
| **Total** | **18** | **0** | **78%** |

### Desglose por Módulo

| Módulo | Líneas Cubiertas | Líneas Totales | Cobertura |
|---|---|---|---|
| `authService.js` | 45 | 50 | 90% |
| `authController.js` | 22 | 25 | 88% |
| `requireAuth.js` (middleware) | 18 | 20 | 90% |
| `requireRole.js` (middleware) | 14 | 16 | 87.5% |
| `pedidoController.js` | 35 | 48 | 73% |
| `vehiculoController.js` | 28 | 34 | 82% |
| `rutaService.js` | 30 | 55 | 55% |
| `geocodingController.js` | 12 | 22 | 55% |
| **Promedio ponderado** | — | — | **78%** |

> [!NOTE]
> Los módulos `rutaService.js` y `geocodingController.js` tienen la cobertura más baja (55%) porque contienen lógica de cálculo de rutas y llamadas externas a Nominatim que requieren mocks más complejos. Se priorizarán en Sprint 4.

### Flujos Cubiertos por las Pruebas

**`auth.test.js`:**
- ✅ `POST /api/auth/login` con credenciales válidas → 200 + JWT
- ✅ `POST /api/auth/login` con contraseña inválida → 401
- ✅ `POST /api/auth/login` con usuario inexistente → 401
- ✅ `GET /api/pedidos` sin header Authorization → 401
- ✅ `GET /api/pedidos` con token expirado → 401
- ✅ `GET /api/pedidos` con token manipulado (firma inválida) → 401

**`pedidos.test.js`:**
- ✅ `GET /api/pedidos` con token ADMIN → 200 con todos los pedidos
- ✅ `GET /api/pedidos` con token USUARIO → 200 con solo pedidos propios
- ✅ `POST /api/pedidos` con token USUARIO → 201 Created
- ✅ `PUT /api/pedidos/:id` con token USUARIO (pedido propio) → 200
- ✅ `PUT /api/pedidos/:id` con token USUARIO (pedido ajeno) → 403
- ✅ `DELETE /api/pedidos/:id` con token USUARIO → 403

**`endpoints.test.js`:**
- ✅ `GET /api/vehiculos` con token USUARIO → 200
- ✅ `POST /api/vehiculos` con token USUARIO → 403
- ✅ `POST /api/vehiculos` con token ADMIN → 201
- ✅ `PUT /api/vehiculos/:id` con token USUARIO → 403
- ✅ `DELETE /api/vehiculos/:id` con token USUARIO → 403
- ✅ `DELETE /api/vehiculos/:id` con token ADMIN → 204

---

## 2. Bugs Detectados

### Bugs Bloqueantes: 0 ✅

No se detectaron bugs de severidad bloqueante. El sistema funciona correctamente en todos los flujos críticos.

### Bugs de Severidad Media: 2 ⚠️

#### BUG-001 — Variable no utilizada en `rutaService.js`

| Campo | Detalle |
|---|---|
| **ID** | BUG-001 |
| **Severidad** | Media |
| **Archivo** | `src/services/rutaService.js` |
| **Regla SonarQube** | `javascript:S1481` — Unused local variables should be removed |
| **Estado** | 🔴 Pendiente de resolución |

**Descripción:**  
Se declaró una variable `const distanciaBase` dentro de la función de cálculo de distancias que nunca es utilizada en el cuerpo de la función. Aunque no causa un fallo funcional visible, representa lógica muerta que confunde la lectura del código y podría indicar una función de cálculo incompleta.

```javascript
// rutaService.js — línea aprox. 47
function calcularDistanciaTotal(puntos) {
  const distanciaBase = 5.0; // ← VARIABLE NO UTILIZADA (BUG-001)
  let total = 0;
  for (let i = 0; i < puntos.length - 1; i++) {
    total += haversine(puntos[i], puntos[i + 1]);
  }
  return total;
}
```

**Corrección Propuesta:**  
Eliminar la línea `const distanciaBase = 5.0;` o determinar si era parte de una lógica pendiente (distancia mínima de cobro) e implementarla correctamente en Sprint 4.

**Responsable de Corrección:** Landa Rojas Alexander Nelson  
**Fecha Límite:** 04/11/2026

---

#### BUG-002 — `await` faltante en `geocodingController.js`

| Campo | Detalle |
|---|---|
| **ID** | BUG-002 |
| **Severidad** | Media |
| **Archivo** | `src/controllers/geocodingController.js` |
| **Regla SonarQube** | `javascript:S4123` — "await" should be used with "async" functions |
| **Estado** | 🔴 Pendiente de resolución |

**Descripción:**  
En el bloque `catch` del controlador de geocodificación, se llama a una función asíncrona de fallback sin usar `await`. Esto provoca que el controlador retorne antes de que el fallback complete su ejecución, resultando en respuestas vacías o con datos parciales cuando la API de Nominatim no está disponible.

```javascript
// geocodingController.js — bloque catch
} catch (error) {
  console.error('Nominatim no disponible:', error.message);
  const fallback = obtenerCoordenadasCache(direccion); // ← FALTA await (BUG-002)
  res.json({ coords: fallback, fuente: 'cache' });
}
```

**Corrección Propuesta:**
```javascript
} catch (error) {
  console.error('Nominatim no disponible:', error.message);
  const fallback = await obtenerCoordenadasCache(direccion); // ← CORRECCIÓN
  res.json({ coords: fallback, fuente: 'cache' });
}
```

**Responsable de Corrección:** Landa Rojas Alexander Nelson  
**Fecha Límite:** 04/11/2026

---

## 3. Code Smells

### Total Detectados: 5

| ID | Archivo | Descripción | Regla SonarQube | Esfuerzo Estimado |
|---|---|---|---|---|
| CS-001 | `rutaService.js` | Magic number: `5.0` usado sin constante nombrada | `javascript:S109` | 10 min |
| CS-002 | `rutaService.js` | Magic number: `6371` (radio de la Tierra en km) sin constante | `javascript:S109` | 10 min |
| CS-003 | `rutaService.js` | Magic number: `1000` (conversión de metros) sin constante | `javascript:S109` | 10 min |
| CS-004 | `pedidoController.js` | Función `listarPedidos` excede 40 líneas (complejidad cognitiva alta) | `javascript:S3776` | 45 min |
| CS-005 | `pedidoController.js` | Función `actualizarPedido` con lógica de autorización inline duplicada | `javascript:S1541` | 60 min |

**Deuda Técnica Total: 2h 15m**

### Detalle de Code Smells Críticos

#### CS-004 — Función `listarPedidos` Demasiado Larga

```javascript
// pedidoController.js — función listarPedidos (aprox. 52 líneas)
// La función combina: extracción de parámetros, lógica de autorización,
// construcción de query SQL condicional y formateo de respuesta.
// Debe dividirse en funciones auxiliares: buildQuery(), formatPedido()
```

**Refactoring Propuesto:** Extraer `buildPedidosQuery(userRole, userId)` y `formatPedidoResponse(rows)` como funciones privadas del módulo.

#### CS-005 — Lógica de Autorización Duplicada

La verificación `if (req.user.role !== 'ADMIN' && req.user.id !== pedido.usuario_id)` aparece tanto en `actualizarPedido` como en `eliminarPedido`. Debe extraerse a un helper `canModifyPedido(user, pedido)` reutilizable.

---

## 4. Vulnerabilidades de Seguridad

### Vulnerabilidades Confirmadas: 0 ✅

No se detectaron vulnerabilidades de seguridad confirmadas en el análisis del Sprint 3.

---

## 5. Security Hotspots

### Total Detectados: 2 (Requieren revisión humana)

> [!WARNING]
> Los Security Hotspots no son vulnerabilidades confirmadas, pero requieren revisión manual para determinar si representan un riesgo real en el contexto del sistema.

#### SH-001 — JWT_SECRET con Fallback a String Hardcodeado

| Campo | Detalle |
|---|---|
| **ID** | SH-001 |
| **Archivo** | `src/services/authService.js` |
| **Categoría OWASP** | A05 — Security Misconfiguration |
| **Regla SonarQube** | `javascript:S2068` — Hard-coded credentials |
| **Estado** | 🟡 Bajo revisión — Planificado para resolución en Sprint 4 |

**Código Problemático:**
```javascript
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-ecologcity-2026';
//                                            ↑ HOTSPOT SH-001: secret hardcodeado
```

**Análisis de Riesgo:**  
En producción (Render), `process.env.JWT_SECRET` está configurado como variable de entorno y el fallback nunca se activa. Sin embargo, en entornos de desarrollo donde el `.env` no está configurado, el sistema funciona con un secret conocido públicamente (si el código es open source), permitiendo que cualquier persona genere tokens válidos.

**Corrección Propuesta:**
```javascript
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('Variable de entorno JWT_SECRET no configurada. El servidor no puede iniciar.');
}
```

**Responsable:** Landa Rojas Alexander Nelson | **Fecha Límite:** 04/11/2026

---

#### SH-002 — Contraseña Transmitida como String Previo al Hash

| Campo | Detalle |
|---|---|
| **ID** | SH-002 |
| **Archivo** | `src/controllers/authController.js` |
| **Categoría OWASP** | A02 — Cryptographic Failures |
| **Regla SonarQube** | `javascript:S2076` — Values passed to OS commands should be sanitized |
| **Estado** | 🟡 Bajo revisión — Aceptado con mitigación (HTTPS) |

**Descripción:**  
La contraseña llega al backend como texto plano en el body del request POST antes de ser hasheada. SonarQube marca esto como hotspot porque si la transmisión no es cifrada, la contraseña quedaría expuesta.

**Análisis de Riesgo:**  
En el entorno de producción (Render), toda comunicación ocurre sobre HTTPS/TLS, por lo que la contraseña está cifrada en tránsito. La transmisión de contraseñas en texto plano al servidor para su posterior hashing en el servidor es el patrón estándar de autenticación web (el hashing en el cliente no aporta seguridad adicional si el hash se convierte en el "secreto"). **El hotspot es aceptado con la condición de que HTTPS esté garantizado.**

**Mitigación Documentada:**  
- Render fuerza HTTPS en todos los deploys (HTTP redirige a HTTPS automáticamente).
- El archivo `docs/arquitectura/decisiones.md` documenta esta decisión.

---

## 6. Duplicación de Código

### Porcentaje de Duplicación: 4.2% ✅

El umbral acceptable del proyecto es ≤ 5%. El 4.2% está dentro del límite.

| Bloque Duplicado | Archivo 1 | Archivo 2 | Líneas |
|---|---|---|---|
| Lógica de autorización owner-check | `pedidoController.js:78` | `pedidoController.js:112` | 4 líneas |
| Formato de respuesta de error 4xx | `authController.js:34` | `vehiculoController.js:56` | 3 líneas |

**Acción:** Extraer `canModifyPedido()` y `errorResponse()` como helpers en `src/utils/` en Sprint 4.

---

## 7. Plan de Remediación

| ID | Tipo | Archivo | Acción | Responsable | Sprint |
|---|---|---|---|---|---|
| BUG-001 | Bug Media | `rutaService.js` | Eliminar variable `distanciaBase` no utilizada | Landa Rojas | Sprint 4 |
| BUG-002 | Bug Media | `geocodingController.js` | Agregar `await` al llamado de `obtenerCoordenadasCache` | Landa Rojas | Sprint 4 |
| CS-001..003 | Code Smell | `rutaService.js` | Extraer magic numbers a constantes nombradas en la cabecera del archivo | Landa Rojas | Sprint 4 |
| CS-004..005 | Code Smell | `pedidoController.js` | Refactorizar funciones largas; extraer helpers | Landa Rojas | Sprint 4 |
| SH-001 | Security Hotspot | `authService.js` | Eliminar fallback hardcodeado; lanzar error si JWT_SECRET no está configurado | Landa Rojas | Sprint 4 |
| SH-002 | Security Hotspot | `authController.js` | Documentar aceptación del patrón + garantizar HTTPS en producción | Albornoz | Sprint 4 |


[← Volver al README Principal](../../../README.md)
