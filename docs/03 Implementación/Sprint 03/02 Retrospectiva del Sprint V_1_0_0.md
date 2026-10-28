[← Volver al README Principal](../../../README.md)

# Retrospectiva del Sprint

**Nombre del Proyecto:** EcoLogCity — Optimizador de Rutas Logísticas para DistriRápido S.A.C.  
**Sprint:** 3  
**Versión del Documento:** 1.0.0  
**Líder del Proyecto:** Albornoz Peña Jeferson Bener  
**Fecha de Retrospectiva:** 28/10/2026  
**Lugar:** Huancayo, Perú  
**Metodología:** Start-Stop-Continue + Plan de Acción SMART  

**Equipo Participante:**

| Rol | Integrante |
|---|---|
| PM / Líder | Albornoz Peña Jeferson Bener |
| Backend / Arquitecto | Landa Rojas Alexander Nelson |
| Frontend / UX | Quispe Aquino Junior |

---

## ¿Qué Aprendimos?

El Sprint 3 fue el más técnicamente exigente del proyecto hasta la fecha. El equipo adquirió conocimientos profundos en las siguientes áreas:

### Autenticación JWT sin Librerías de Terceros

Implementar la firma y verificación de tokens JWT manualmente usando únicamente el módulo `crypto` de Node.js nos permitió entender a fondo el estándar RFC 7519. Aprendimos a construir el header, payload y firma en Base64URL, y comprendimos por qué la elección del algoritmo (HS256 vs RS256) impacta directamente en la arquitectura de microservicios. Este conocimiento profundo sería imposible de adquirir usando una librería como `jsonwebtoken` sin leer su código fuente.

### Hashing de Contraseñas con scrypt

Descubrimos que bcrypt, aunque ampliamente usado, ya no es la recomendación de NIST para nuevas implementaciones. El uso de `scrypt` con salt aleatorio de 16 bytes y comparación con `crypto.timingSafeEqual` nos enseñó el concepto de timing attacks: por qué una comparación directa de strings (`===`) es vulnerable y cómo `timingSafeEqual` mitiga ese vector de ataque garantizando tiempo de ejecución constante independientemente del resultado.

### Pruebas de Integración con Supertest

Aprendimos a estructurar pruebas de integración que levanten el servidor Express real, ejecuten peticiones HTTP reales y validen respuestas completas (status code, headers, body JSON). La diferencia clave respecto a las pruebas unitarias es que Supertest prueba el sistema tal como lo experimentaría un cliente real, incluyendo el middleware stack completo.

### Gestión de Handles Abiertos en Jest

Identificamos que Jest puede quedar colgado si la aplicación mantiene conexiones abiertas al pool de PostgreSQL después de los tests. Aprendimos a usar `--detectOpenHandles` para identificar el origen y `--forceExit` como solución pragmática mientras se implementa el cierre explícito de conexiones en el hook `afterAll`.

### Variables de Entorno y Configuración Segura

El incidente del JWT_SECRET hardcodeado nos enseñó a tratar los secretos desde el día 0 con `dotenv` en desarrollo y variables de entorno reales en producción, nunca con valores por defecto en código fuente.

---

## ¿Qué Estamos Haciendo Bien?

### Arquitectura Modular y Separación de Responsabilidades

El equipo mantiene una separación clara entre capas: `routes/` define paths y middlewares, `controllers/` maneja la lógica HTTP, `services/` contiene la lógica de negocio y `repositories/` abstrae las consultas SQL. Esta estructura permitió que los tres integrantes trabajaran en paralelo sin conflictos de merge significativos.

### Consultas SQL Parametrizadas

El 100% de las consultas a la base de datos en este sprint usan parámetros posicionales (`$1`, `$2`, ...) con el driver `pg` de Node.js. Esto garantiza protección contra inyección SQL sin necesidad de un ORM y fue confirmado en el análisis OWASP como A03 LIMPIO.

### Cobertura de Pruebas

Alcanzar un 78% de cobertura en el primer sprint con pruebas de integración es un logro significativo. Las 18 pruebas pasando cubren los flujos críticos: autenticación, autorización y operaciones CRUD de vehículos y pedidos.

### Revisión de Código entre Pares

La práctica de revisión de código antes de mergear a `main` permitió detectar el problema del `missing await` en `geocodingController` antes de que llegara a producción, reduciendo los bugs bloqueantes a cero.

### Documentación Técnica Paralela al Desarrollo

El equipo documentó las decisiones de arquitectura (ADRs informales) en los comentarios de los Pull Requests, lo que facilita el onboarding y la comprensión del contexto de cada decisión técnica.

---

## ¿Qué Podemos Hacer Mejor?

### Personas

**Situación identificada:** Durante la implementación de IMP-005 (integración de `session.js` y `apiFetch`), el frontend asumió un formato de header de autorización diferente al que el backend esperaba. El bloqueante se descubrió tardíamente porque el integrante afectado no comunicó la dificultad hasta el día siguiente.

**Acciones de mejora:**

- **Comunicar bloqueos el mismo día** en que ocurren, sin esperar a la daily del día siguiente. Un mensaje en el canal del equipo es suficiente; no se requiere una reunión formal.
- Cada integrante debe distinguir entre "estoy investigando" (máximo 2 horas) y "estoy bloqueado" (comunicación inmediata al equipo).
- El PM (Albornoz) realizará check-ins breves a las 3pm de los días de trabajo para identificar bloqueos de forma proactiva.

---

### Relaciones

**Situación identificada:** El acuerdo implícito sobre el formato de las peticiones autenticadas (si el token va en header, cookie o query param) no fue documentado ni discutido explícitamente antes de que cada integrante comenzara a codificar. Esto generó el impedimento IMP-005 y horas de depuración.

**Acciones de mejora:**

- **Contrato de API previo al desarrollo:** Antes de comenzar cualquier historia que involucre comunicación frontend-backend, el equipo debe definir y documentar el contrato en el README de la ruta correspondiente: método HTTP, headers requeridos, formato del body de request, formato del body de response, códigos de error posibles.
- Este contrato debe ser revisado y firmado (comentado con ✅) por al menos un integrante de cada capa antes de comenzar la implementación.
- Usar el estándar OpenAPI/Swagger para formalizar contratos en Sprint 4.

---

### Procesos

**Situación identificada:** Las pruebas de integración del middleware de autenticación (`requireAuth`, `requireRole`) se escribieron después de que los endpoints ya estaban implementados. Esto hizo que algunos comportamientos edge-case (token expirado, token malformado, rol incorrecto) se descubrieran en la fase de testing en lugar de en el diseño.

**Acciones de mejora:**

- **Adoptar el enfoque Test-First para middleware de seguridad:** Escribir los tests de `requireAuth` y `requireRole` antes de implementar los endpoints que los usan. Esto fuerza a pensar en todos los casos negativos desde el diseño.
- Agregar una checklist de "casos edge de seguridad" al template de Pull Request: token ausente, token expirado, token con firma inválida, rol insuficiente.
- Definir una "Definition of Done" explícita que incluya: "los tests de integración para los nuevos endpoints están escritos y pasando."

---

### Herramientas

**Situación identificada:** La variable no utilizada en `rutaService.js` fue detectada recién en el análisis SonarQube post-sprint, no durante el desarrollo. ESLint habría capturado este code smell en el IDE en tiempo real, antes del commit.

**Acciones de mejora:**

- **Configurar ESLint esta semana** con las reglas `no-unused-vars: error` y `require-await: error`. Integrar con los editores de código de cada integrante (extensión ESLint para VS Code).
- Agregar `eslint --max-warnings=0` como paso previo al commit usando Husky (git hooks), para que un commit con warnings de ESLint sea rechazado automáticamente.
- Evaluar la integración de SonarCloud (versión gratuita para proyectos open source) directamente en los Pull Requests de GitHub para obtener feedback de calidad antes del merge, no después.

---

### Acciones a Realizar

Las siguientes acciones fueron acordadas por el equipo al cierre de la retrospectiva, con responsable y fecha límite definidos:

| # | Acción | Responsable | Fecha Límite | Criterio de Éxito |
|---|---|---|---|---|
| 1 | Configurar ESLint con reglas `no-unused-vars` y `require-await` + integración VS Code | Landa Rojas Alexander | 04/11/2026 | `npm run lint` pasa sin warnings en el repositorio |
| 2 | Agregar Husky pre-commit hook que ejecute `eslint --max-warnings=0` | Landa Rojas Alexander | 04/11/2026 | Commits con warnings son rechazados automáticamente |
| 3 | Implementar middleware de protección brute-force (bloqueo tras 5 intentos fallidos, timeout 15min) | Landa Rojas Alexander | 11/11/2026 | Test de integración: 6to intento devuelve 429 Too Many Requests |
| 4 | Implementar registro de auditoría estructurado (audit logging) para eventos de autenticación y acciones CRUD | Landa Rojas Alexander | 11/11/2026 | Tabla `audit_log` en BD con eventos: login, logout, create, update, delete |
| 5 | Documentar contrato de API auth en formato OpenAPI/Swagger para Sprint 4 | Albornoz Peña Jeferson | 04/11/2026 | Archivo `openapi.yaml` disponible en `/docs` y revisado por el equipo |
| 6 | Configurar check-in diario a las 3pm para detección temprana de bloqueos | Albornoz Peña Jeferson | A partir del 29/10/2026 | Consistencia: check-ins realizados todos los días de trabajo del Sprint 4 |
| 7 | Reemplazar el fallback hardcodeado de `JWT_SECRET` por un error explícito en arranque | Landa Rojas Alexander | 04/11/2026 | El servidor lanza `Error: JWT_SECRET no configurado` y no arranca si la variable está ausente |

---

## Índice de Satisfacción del Equipo (Sprint Health)

Al cierre de la retrospectiva, cada integrante calificó el Sprint 3 en una escala del 1 al 5:

| Dimensión | Albornoz (PM) | Landa (Backend) | Quispe (Frontend) | Promedio |
|---|---|---|---|---|
| Calidad del trabajo entregado | 4 | 5 | 4 | **4.3** |
| Comunicación interna del equipo | 3 | 3 | 3 | **3.0** |
| Carga de trabajo equilibrada | 4 | 4 | 3 | **3.7** |
| Aprendizaje técnico obtenido | 5 | 5 | 4 | **4.7** |
| Satisfacción general con el Sprint | 4 | 4 | 4 | **4.0** |

> [!NOTE]
> La dimensión de Comunicación (3.0/5) es la más baja y es directamente abordada por las acciones #5 y #6 del plan de mejora. Se establecerá como métrica de seguimiento en la retrospectiva del Sprint 4.
