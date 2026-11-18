[← Volver al README principal](../../../README.md)

# Revisión del sprint

**Nombre del Proyecto:** EcoLogCity — Optimizador de Rutas Logísticas para DistriRápido S.A.C.  
**Líder del Proyecto:** Albornoz Peña Jeferson Bener  

## Historias de Usuario completadas en este Sprint

### US-010 — Endurecimiento de Seguridad y Rate Limiting contra Ataques de Fuerza Bruta en Login
- **Código:** US-010
- **Título:** Protección perimetral de autenticación y limitación de tasa de intentos fallidos
- **Criterios de Aceptación Verificados:**
  - [x] Implementación de middleware de control de tasa (rate limiting) que restringe a un máximo de 5 intentos fallidos consecutivos por dirección IP y cuenta de correo.
  - [x] Respuesta con código HTTP 429 Too Many Requests y mensaje amigable en interfaz notificando tiempo de espera tras sobrepasar el umbral.
  - [x] Restablecimiento automático del contador de intentos fallidos tras un inicio de sesión exitoso.
  - [x] Pruebas automatizadas de resiliencia validando la no degradación del servicio ante ráfagas de peticiones concurrentes.
- **Enlace de Trazabilidad:** [Commit 5825505](https://github.com/The-Yuu7/EcoLogCity/commit/5825505) · [Pull Request #4](https://github.com/The-Yuu7/EcoLogCity/pull/4)

---

### US-011 — Trazabilidad Operativa y Auditoría de Eventos de Seguridad
- **Código:** US-011
- **Título:** Registro estructurado de eventos críticos y pista de auditoría en base de datos
- **Criterios de Aceptación Verificados:**
  - [x] Creación de la estructura de auditoría en PostgreSQL para registrar eventos de autenticación, cambios en la flota vehicular y creación/anulación de órdenes de entrega.
  - [x] Captura estructurada de metadatos: identificador de usuario, dirección IP de origen, marca temporal UTC y tipo de operación realizada.
  - [x] Almacenamiento seguro sin exposición de contraseñas ni tokens JWT en los registros de auditoría (OWASP A09 mitigado).
  - [x] Persistencia transaccional que asegura la no alteración retroactiva de los eventos registrados.
- **Enlace de Trazabilidad:** [Commit 5825505](https://github.com/The-Yuu7/EcoLogCity/commit/5825505) · [Pull Request #4](https://github.com/The-Yuu7/EcoLogCity/pull/4)

---

### US-012 — Suite Automatizada de Pruebas End-to-End y Rendimiento con Playwright
- **Código:** US-012
- **Título:** Automatización de pruebas E2E multiplataforma y monitoreo continuo de Web Vitals
- **Criterios de Aceptación Verificados:**
  - [x] Configuración centralizada en `playwright.config.ts` evaluando de forma nativa los tres motores de navegación: Chromium, Firefox y WebKit.
  - [x] Cobertura automatizada de casos de prueba críticos: flujo de login, aislamiento RBAC, geocodificación de pedidos en Huancayo, visor Leaflet y edición de perfil.
  - [x] Medición automatizada de métricas cuantitativas Core Web Vitals (TTFB < 200 ms, FCP < 600 ms, DomContentLoaded < 1000 ms).
  - [x] Verificación de tiempos de respuesta de los endpoints de la API REST (`/api/v1/auth/login`, `/api/v1/pedidos`, `/api/v1/vehiculos`, `/api/v1/rutas`), todos con latencia inferior a 500 ms.
  - [x] Generación de reportes HTML interactivos en `playwright-report` con captura de screenshots y trazas de ejecución ante fallos.
  - [x] Tasa de éxito del 100% (60 pruebas ejecutadas, 60 aprobadas) a lo largo de los 3 navegadores.
- **Enlace de Trazabilidad:** [Commit 0a71db3](https://github.com/The-Yuu7/EcoLogCity/commit/0a71db3) · [Pull Request #4](https://github.com/The-Yuu7/EcoLogCity/pull/4)

---

### US-013 — Automatización CI/CD con GitHub Actions y Despliegue Continuo en Render
- **Código:** US-013
- **Título:** Orquestación de pipelines independientes para CI, testing automatizado y CD en producción
- **Criterios de Aceptación Verificados:**
  - [x] Flujo `ci.yml` operativo para verificación de estilo, validación estática y compilación de frontend y backend en ramas `main` y `develop`.
  - [x] Flujo `tests.yml` con servicio PostgreSQL + PostGIS 16 integrado, ejecutando Jest con cobertura y suite E2E de Playwright en modo headless.
  - [x] Almacenamiento seguro de reportes de cobertura y reportes HTML de Playwright como artefactos de GitHub Actions (`actions/upload-artifact@v4`).
  - [x] Flujo `deploy-production.yml` que ejecuta el despliegue automático del código auditado hacia Render Cloud mediante webhook seguro (`secrets.RENDER_DEPLOY_HOOK_URL`).
  - [x] Cero credenciales expuestas en texto plano dentro del código fuente o los flujos YAML.
  - [x] Verificación de salud (healthcheck HTTP 200) post-despliegue en el entorno productivo de Render.
- **Enlace de Trazabilidad:** [Commit 0a71db3](https://github.com/The-Yuu7/EcoLogCity/commit/0a71db3) · [Pull Request #4](https://github.com/The-Yuu7/EcoLogCity/pull/4)

---

### US-014 — Gestión Integral de Cuentas de Usuario y Control de Acceso Granular
- **Código:** US-014
- **Título:** Panel administrativo para creación, activación y asignación de roles de usuario
- **Criterios de Aceptación Verificados:**
  - [x] Endpoint seguro `POST /api/v1/usuarios` protegido por middleware `requireRole('ADMIN')` para registrar nuevos despachadores u operadores.
  - [x] Hashing criptográfico unidireccional obligatorio con `scrypt` y salt de 16 bytes antes de insertar cualquier cuenta en base de datos.
  - [x] Panel visual interactivo en `#modulo-usuarios` que permite a administradores conmutar el estado activo/inactivo de los usuarios.
  - [x] Bloqueo inmediato de generación de token JWT para cuentas marcadas como inactivas.
- **Enlace de Trazabilidad:** [Commit 5825505](https://github.com/The-Yuu7/EcoLogCity/commit/5825505) · [Pull Request #4](https://github.com/The-Yuu7/EcoLogCity/pull/4)

---

### US-015 — Replanificación Automática de Rutas VRPTW y Directorio por Itinerario
- **Código:** US-015
- **Título:** Optimización continua en tiempo real tras variaciones en la cartera de pedidos o disponibilidad de flota
- **Criterios de Aceptación Verificados:**
  - [x] El motor metaheurístico replanifica automáticamente las asignaciones de paradas cuando se registra, cancela o reasigna un pedido.
  - [x] Incorporación del factor de corrección barométrica y pendiente en la altitud de Huancayo (3,250 msnm) para penalizar consumos diésel en rutas con mayor esfuerzo motriz.
  - [x] Visualización de rutas asignadas agrupadas por vehículo con código cromático diferenciado en el mapa Leaflet.
  - [x] Directorio detallado de itinerarios en `#modulo-rutas` con tiempos estimados de llegada, ventanas de entrega y cálculo de $CO_2$ evitado.
- **Enlace de Trazabilidad:** [Commit 5825505](https://github.com/The-Yuu7/EcoLogCity/commit/5825505) · [Pull Request #4](https://github.com/The-Yuu7/EcoLogCity/pull/4)

---

### US-016 — Edición de Perfil de Usuario y Actualización Autónoma de Contraseña
- **Código:** US-016
- **Título:** Módulo de autoservicio para actualización de datos personales y credenciales de acceso
- **Criterios de Aceptación Verificados:**
  - [x] Formulario interactivo en `#modulo-perfil` permitiendo modificar nombre completo y correo electrónico.
  - [x] Exigencia de validación de contraseña actual mediante `timingSafeEqual` antes de permitir cambios de correo o clave nueva.
  - [x] Emisión y persistencia inmediata de un nuevo token JWT actualizado en `localStorage` al concretarse la modificación de perfil.
  - [x] Mensajes visuales de retroalimentación en tiempo real indicando éxito o inconsistencia de claves.
- **Enlace de Trazabilidad:** [Commit 5825505](https://github.com/The-Yuu7/EcoLogCity/commit/5825505) · [Pull Request #4](https://github.com/The-Yuu7/EcoLogCity/pull/4)

---

### US-017 — Vistas de Supervisión Exclusivas y Analítica de Huella de Carbono
- **Código:** US-017
- **Título:** Dashboard ejecutivo y telemetría de sostenibilidad ambiental para el rol Administrador
- **Criterios de Aceptación Verificados:**
  - [x] Restricción estricta de las vistas de Dashboard, Directorio de Rutas y Usuarios únicamente al rol `ADMIN` (los usuarios estándar acceden directamente a Pedidos y Flota).
  - [x] Presentación de KPIs logísticos agregados: total de pedidos activos, volumen y peso acumulado, porcentaje de ocupación de flota y emisiones base estimadas.
  - [x] Métrica en tiempo real de kilogramos de $CO_2$ mitigados gracias al algoritmo Green VRP comparado con la distribución tradicional en Huancayo.
- **Enlace de Trazabilidad:** [Commit 5825505](https://github.com/The-Yuu7/EcoLogCity/commit/5825505) · [Pull Request #4](https://github.com/The-Yuu7/EcoLogCity/pull/4)

---

## Demostración del trabajo completado

La demostración del **Sprint 4** se llevó a cabo el **15 de noviembre de 2026** ante la gerencia de operaciones y despachadores de **DistriRápido S.A.C.**, con la presencia del docente asesor **Ing. Job Daniel Gamarra Moreno**. La sesión se desarrolló en modalidad híbrida en las instalaciones logísticas de Huancayo y vía videoconferencia, empleando directamente el entorno de producción desplegado en **Render Cloud** (`https://ecologcity.onrender.com`), respaldado por una réplica idéntica en entorno local para inspección técnica.

### 1. Funcionalidades Exhibidas
- **Flujo de Acceso y Hardening de Seguridad:** Se demostró el inicio de sesión con las cuentas oficiales `admin@ecologcity.pe` y `usuario@ecologcity.pe`. Se simuló un ataque de fuerza bruta ingresando intencionalmente contraseñas erróneas consecutivas; se verificó el bloqueo progresivo y la respuesta con código HTTP 429 tras 5 intentos.
- **Aislamiento de Información por Rol (RBAC):** Se inició sesión como usuario estándar y se constató que las opciones de Dashboard, Directorio de Rutas y Usuarios desaparecen del riel de navegación, y que la tabla de pedidos filtra estrictamente las órdenes creadas por dicho operador. Posteriormente se ingresó como Administrador, evidenciando la visualización global y el control de flota.
- **Geocodificación y Replanificación Automática VRPTW:** Se registró un nuevo pedido en el distrito de El Tambo ("Av. Huancavelica 1240"). Se observó la geocodificación automática mediante Nominatim/OSM, la colocación del pin animado en el visor Leaflet y la replanificación instantánea de la flota, calculando la nueva secuencia de paradas en menos de 2 segundos.
- **Visor Cartográfico y Rutas Reales (Green VRP):** Se exhibió el trazado de rutas sobre calles reales de Huancayo distinguidas por el color asignado a cada furgón de reparto. Se demostró la penalización por altitud (3,250 msnm) y el cálculo de $CO_2$ mitigado en el panel analítico.
- **Suite de Calidad Automatizada con Playwright:** Se proyectó la ejecución en vivo del comando `npx playwright test`, observando el paso del 100% de las 60 pruebas en los motores Chromium, Firefox y WebKit en 1.1 minutos, exhibiendo el reporte HTML con métricas Web Vitals (TTFB de 3-6 ms y FCP de 180-240 ms).
- **Flujo CI/CD Automatizado:** Se realizó una modificación menor en un archivo de documentación, se hizo commit y push hacia GitHub, y se mostró a los stakeholders el tablero de GitHub Actions ejecutando los workflows `ci.yml` y `tests.yml`, culminando con el webhook automático hacia Render.

### 2. Retroalimentación Recibida de Stakeholders
- **Gerencia General (DistriRápido S.A.C.):** Felicitó al equipo por la precisión en el cálculo de ahorro de combustible diésel y la reducción de huella de carbono, destacando que los reportes de usabilidad demuestran que los despachadores pueden operar el sistema sin curvas de aprendizaje complejas.
- **Supervisores de Reparto:** Destacaron la claridad del visor Leaflet en pantalla completa y solicitaron que en la fase final de mantenimiento se pueda enviar la hoja de ruta generada directamente al WhatsApp de cada conductor.
- **Docente Asesor (Ing. Job Daniel Gamarra Moreno):** Resaltó el rigor técnico en la automatización con Playwright en los tres navegadores y la madurez arquitectónica lograda en la separación de workflows de CI/CD.

### 3. Evidencias de Conformidad
- Acta de conformidad digital firmada por el representante de DistriRápido S.A.C.
- Capturas de pantalla integradas en la suite de reportes y repositorio (`frontend/playwright-report/index.html`).
- Historial verificable de ejecuciones exitosas de GitHub Actions registradas en la pestaña Actions del repositorio oficial.

---

## Pendientes

El equipo completó con éxito el 100% de las Historias de Usuario comprometidas para el incremento funcional del Sprint 4. No obstante, en el marco de la gestión de deuda técnica y mejora continua para la fase de cierre definitivo del proyecto, se identifican los siguientes ítems secundarios:

| Ítem | Clasificación | Descripción y Justificación del Estado | Tratamiento Posterior (Fase de Cierre / Mantenimiento) |
| :--- | :--- | :--- | :--- |
| **DEB-001** | Deuda Técnica Menor | Cobertura de edge cases en geocodificación con nombres de jirones antiguos de Huancayo sin numeración municipal estandarizada. | Incorporar diccionario local de sinónimos urbanos de Huancayo en el servicio de geocodificación. |
| **DEB-002** | Optimización Green IT | Implementación de Service Worker para almacenamiento en caché offline de teselas cartográficas de Leaflet. | Se programará en la fase de empaquetado como Progressive Web App (PWA) para zonas rurales sin cobertura 4G en Junín. |
| **DEB-003** | Funcionalidad Complementaria | Módulo de notificación por mensajería instantánea (SMS / WhatsApp API) hacia el cliente final al iniciar la ruta. | Reservado para la etapa comercial posterior al cierre académico de Taller de Proyectos 2. |

---

[← Volver al README principal](../../../README.md)
