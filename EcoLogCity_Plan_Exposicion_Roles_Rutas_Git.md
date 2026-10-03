# EcoLogCity — Plan de Exposición Técnica del Sprint 1
### Asignación de Rutas de Git, Roles de Desarrollo y Guion de Defensa del Incremento Técnico

| Campo | Detalle |
| :--- | :--- |
| **Proyecto / Sistema** | **EcoLogCity** (Optimizador VRPTW & Green VRP para Distribución Urbana) |
| **Empresa Patrocinadora** | **DistriRápido S.A.C.** · Huancayo, Junín (3,250 msnm) |
| **Alcance de la Defensa** | **Exclusivo Sprint 1** (Incremento de Software, Arquitectura y Calidad en Git — *Documentos previos de Inicio y Jira ya evaluados*) |
| **Metodología & Estándar** | **Scrum + Git Flow** · Definition of Done (DoD $\ge 80\%$) · ISO 14083 |
| **Estado de Implementación** | **Sprint 1 Completado al 100%** · Cobertura DoD: **87.83%** · PostgreSQL + PostGIS Activo |
| **Modalidad de Exposición** | **Defensa Técnica Tripartita (3 Integrantes)** · Tiempo total sugerido: **24 – 27 minutos** |

---

## 1. Matriz Maestra de Roles y Distribución de Tiempos (Sprint 1)

Para garantizar una sustentación académica y técnica sólida, estructurada y equilibrada ante el jurado evaluador, la defensa se concentra **exclusivamente en el Incremento Técnico y Calidad de Código del Sprint 1**. Dado que la documentación inicial del proyecto (Acta de Constitución, Matriz de Interesados y configuración de Jira) ya fue expuesta y calificada previamente, cada integrante defiende de manera directa las rutas de código, pruebas, artefactos de configuración y comandos de Git que implementó en este Sprint 1:

| Integrante / Expositor | Rol Oficial en el Sprint 1 | Rutas Git Clave Asignadas | Demostración Práctica Asignada | Tiempo Sugerido |
| :--- | :--- | :--- | :--- | :---: |
| **1. Albornoz Peña<br>Jeferson Bener** | **Líder Técnico & Scrum Master**<br>Director del Proyecto (PM) | • `README.md`<br>• `.gitignore`, `.env.example`<br>• `Guion_Exposicion_Mejorado.md`<br>• Consola Git (`status`, `branch`, `log`) | Presentación del Sprint 1 Goal, alcance de Historias de Usuario (`EP-01`, `US-001`, `EN-001`), cumplimiento del Definition of Done (DoD $\ge 80\%$), gobernanza de Git Flow y trazabilidad de commits. | **7 – 8 min** |
| **2. Landa Rojas<br>Alexander Nelson** | **Arquitecto Backend & DevOps**<br>QA Engineer | • `database/migrations/001_init_postgis_schema.sql`<br>• `database/seeds/001_seed_pedidos_huancayo.sql`<br>• `backend/src/config/db.js`<br>• `backend/src/server.js`, `app.js`<br>• `backend/src/routes/api.js`<br>• `backend/src/controllers/pedidoController.js`<br>• `backend/src/services/pedidoService.js`<br>• `backend/tests/` (`pedidos.test.js`, `endpoints.test.js`)<br>• `docker-compose.yml`, `.github/workflows/ci.yml` | Explicación del modelo PostGIS con restricciones de ventana horaria, endpoints CRUD, ejecución en vivo en terminal de `npm run test:coverage` (87.83% DoD) y pipeline CI/CD automatizado. | **8 – 9 min** |
| **3. Quispe Aquino<br>Junior** | **Frontend Developer / UX/UI**<br>Especialista en Geocodificación / Motor VRP | • `backend/src/services/geocodingService.js`<br>• `backend/src/controllers/geocodingController.js`<br>• `backend/tests/geocoding.test.js`<br>• `frontend/public/index.html`<br>• `frontend/public/app.js`<br>• `frontend/package.json` | Demostración en vivo en navegador (`http://localhost:8000`), geocodificación automática en Huancayo, ajuste manual con marcador Drag & Drop en Leaflet, actualización de KPIs en tiempo real y preparación de insumos para el motor VRP de Sprint 2. | **8 – 9 min** |

> [!TIP]
> **Estrategia de Transición Fluida:** Cada integrante debe conectar su conclusión con la apertura del siguiente:
> 1. **Jeferson (Líder Técnico):** Define el Sprint 1 Goal, el DoD alcanzado y la salud del repositorio Git $\rightarrow$ Da pase a Alexander para la arquitectura y calidad técnica backend.
> 2. **Alexander (Backend/QA):** Demuestra la base de datos PostGIS, la API REST y la cobertura de pruebas del 87.83% en consola $\rightarrow$ Da pase a Junior para la experiencia de usuario en navegador.
> 3. **Junior (Frontend/Geocoding):** Demuestra la aplicación web en vivo en Huancayo, la georreferenciación y los insumos listos para el motor VRP del Sprint 2 $\rightarrow$ Abre la ronda de preguntas técnicas.

---

## 2. Parte 1 — Gestión del Sprint 1, Gobernanza Git y Calidad Técnica

* **Expositor:** **Albornoz Peña Jeferson Bener**
* **Rol Oficial en el Sprint:** Líder Técnico & Scrum Master / Director del Proyecto (PM)
* **Tiempo:** 7 a 8 minutos (Apertura de la Defensa Técnica del Sprint 1)
* **Enfoque:** Sprint 1 Goal, Desglose del Sprint Backlog (`EP-01`, `US-001`, `EN-001`), Definition of Done (DoD), Estructura del Repositorio y Git Flow.

### 2.1. ¿Qué Hizo en el Sprint 1? (Responsabilidades y Logros)
* **Definición del Sprint 1 Goal:** Establecimiento de la meta del Sprint: *"Desplegar el núcleo arquitectónico (PostgreSQL + PostGIS e infraestructura CI/CD) e implementar el módulo básico de gestión y geocodificación de pedidos para Huancayo, habilitando los insumos de peso, volumen y ventanas de tiempo para el motor VRP del Sprint 2"*.
* **Estructuración y Gestión del Sprint 1 Backlog:**
  * **Épica `EP-01` (Gestión y Validación de Pedidos):** Descomposición funcional para la captura estandarizada de requerimientos de despacho.
  * **Historia de Usuario `US-001` (Geocodificación con Ventanas de Tiempo):** Redacción de criterios BDD Gherkin (Escenario 1: dirección unívoca con resolución GPS automática; Escenario 2: dirección ambigua con asistencia interactiva).
  * **Enabler Técnico `EN-001` (Infraestructura Espacial):** Requerimiento arquitectónico de base de datos relacional y espacial PostgreSQL + PostGIS.
* **Establecimiento y Cumplimiento del Definition of Done (DoD):** Definición de los criterios de aceptación para declarar el incremento como terminado: cobertura de código mínima del 80% (superada al **87.83%**), 100% de pruebas en verde, cero deuda técnica en el core y pipeline de CI/CD automatizado en GitHub Actions.
* **Gobernanza del Repositorio Git y Políticas de Configuración:**
  * Estructuración del árbol de directorios del proyecto (`backend/`, `database/`, `frontend/`, `.github/`).
  * Blindaje de seguridad en `.gitignore` para impedir la subida de `node_modules`, archivos `.env` y temporales.
  * Parametrización en `.env.example` para la configuración limpia del puerto 8000, credenciales de PostGIS y variables de entorno seguras.
  * Redacción del `README.md` como guía operativa de despliegue rápido.
* **Auditoría Técnica y Memoria del Sprint 1 (`Guion_Exposicion_Mejorado.md`):** Consolidación de la viabilidad técnica a costo cero en licencias (uso de PostgreSQL 17 local y Nominatim OpenStreetMap sin APIs de pago comerciales).

### 2.2. Rutas de Git que DEBE Exponer y Explicar

| Ruta en el Repositorio Git | Tipo de Artefacto | Aspecto Crítico que Debe Explicar en Pantalla |
| :--- | :--- | :--- |
| `README.md` | Documentación Raíz Markdown | Portada técnica del Sprint 1: stack tecnológico (Node.js 22, Express, PostgreSQL 17, PostGIS, Leaflet), arquitectura por capas y comandos de arranque rápido. |
| `.gitignore`<br>`.env.example` | Seguridad y Configuración Git | Exclusión estricta de `node_modules` y credenciales privadas; parametrización de variables de entorno seguras (`PORT=8000`, `DB_HOST`, `DB_PORT=5432`). |
| `Guion_Exposicion_Mejorado.md` | Memoria Técnica del Sprint 1 | Análisis de viabilidad técnica a costo S/ 0 en licencias, diagnóstico de requisitos locales y certificación del 100% de objetivos del Sprint 1. |
| **Terminal / Consola Git**<br>*(Comandos de Inspección)* | Verificación de Repositorio en Vivo | Ejecución en vivo de `git status`, `git branch -a` y `git log --oneline -n 5` para evidenciar un árbol de trabajo limpio, ramas ordenadas y el commit de cierre `spring1.v1`. |

### 2.3. Guion de Exposición Minuto a Minuto

* **Minuto 0:00 – 2:00 (Apertura del Sprint 1 y Sprint Goal):**
  > *"Buenos días estimado jurado y profesor. Habiendo superado y sustentado en la etapa previa toda la documentación de inicio y planificación del proyecto, el día de hoy presentamos la defensa técnica del **Incremento de Software del Sprint 1** de EcoLogCity. El objetivo central (Sprint Goal) de este primer sprint fue desplegar el núcleo arquitectónico de persistencia espacial en PostgreSQL con PostGIS y la infraestructura de CI/CD, implementando a su vez el módulo de registro y geocodificación de pedidos para Huancayo, dejando preparados con precisión de coordenadas, volumen y ventanas de tiempo los insumos requeridos por el motor heurístico del Sprint 2."*

* **Minuto 2:00 – 4:30 (Sprint Backlog, Criterios BDD y Definition of Done):**
  > *"El alcance comprometido para este Sprint 1 se concentró en la Épica `EP-01` y la Historia de Usuario `US-001`, junto al enabler técnico `EN-001`. Diseñamos la historia bajo el estándar BDD Gherkin: si un despachador ingresa una dirección unívoca de Huancayo, el sistema resuelve de forma inmediata sus coordenadas GPS; si la dirección es ambigua, el sistema despliega opciones y permite asistencia en mapa. Para considerar el sprint terminado, nuestro Definition of Done (DoD) exigió una cobertura de pruebas mínima del 80%, base de datos espacial operativa y validaciones a nivel de base de datos. Como verán hoy, no solo cumplimos el DoD, sino que alcanzamos un 87.83% de cobertura automatizada."*

* **Minuto 4:30 – 7:00 (Gobernanza Git, Repositorio y Pase al Backend):**
  > *"Como responsable de la gobernanza técnica en Git, estructuré el repositorio asegurando que los archivos sensibles y dependencias no se filtren mediante el `.gitignore`, y definiendo una plantilla reproducible en `.env.example`. En `README.md` documentamos la arquitectura del incremento y en `Guion_Exposicion_Mejorado.md` acreditamos que la solución opera con cero costo de licencias externas. En pantalla observan con `git status` y `git log` que nuestro árbol de trabajo se encuentra limpio y versionado bajo el commit `spring1.v1`. A continuación, cedo la palabra a Alexander Landa, quien sustentará el diseño de la base de datos PostGIS, la API REST y la ejecución en vivo de las pruebas del DoD."*

---

## 3. Parte 2 — Arquitectura Backend, Base de Datos PostGIS y Calidad (DoD & CI/CD)

* **Expositor:** **Landa Rojas Alexander Nelson**
* **Rol Oficial en el Sprint:** Arquitecto de Software & Backend Developer / QA & DevOps Engineer
* **Tiempo:** 8 a 9 minutos (Núcleo de Datos, API REST, DoD y CI/CD)
* **Enfoque:** Modelado Espacial PostGIS, Servicios Node.js, Cobertura Jest (87.83%) y Contenedores Docker.

### 3.1. ¿Qué Hizo en el Sprint 1? (Responsabilidades y Logros)
* **Diseño e Implementación de la Base de Datos Espacial (`database/migrations`):** Configuración de PostgreSQL 17 con extensión PostGIS para cálculo de distancias geodésicas. Creación de la tabla `pedidos` con UUIDs, índices B-tree y espaciales sobre latitud/longitud, estado y distrito.
* **Reglas de Negocio en DDL y Validaciones:** Implementación de la restricción de integridad `check_ventanas_horarias` que impide registrar pedidos donde `ventana_fin <= ventana_inicio`, así como checks de `peso_kg > 0` y `volumen_m3 > 0`.
* **Carga de Semillas Georreferenciadas (`database/seeds`):** Script SQL con los cuadrantes de cobertura de Huancayo, El Tambo y Chilca, más 8 pedidos reales geolocalizados en el valle del Mantaro.
* **Desarrollo de la API REST Modular (`backend/src/`):** Arquitectura limpia en capas (Config, Routes, Controllers, Services). Implementación del CRUD de pedidos, validación de esquemas con Zod y endpoint de agregación analítica `GET /api/v1/pedidos/stats`.
* **Infraestructura y Contenerización:** Configuración de `docker-compose.yml` con la imagen oficial `postgis/postgis:16-3.4` y el servicio de backend para garantizar reproducibilidad en cualquier entorno operativo.
* **Pipeline de Integración Continua (`.github/workflows/ci.yml`):** Workflow automatizado que en cada Pull Request despliega PostgreSQL, corre migraciones y ejecuta la suite de pruebas validando el DoD.
* **Aseguramiento de Calidad y Suite de Pruebas (DoD $\ge 80\%$):** Programación de pruebas con Jest y Supertest en `backend/tests/` (`pedidos.test.js` y `endpoints.test.js`), logrando **87.83% de cobertura de líneas**, 100% en lógica de pedidos y 26/26 pruebas aprobadas.

### 3.2. Rutas de Git que DEBE Exponer y Explicar

| Ruta en el Repositorio Git | Tipo de Artefacto | Aspecto Crítico que Debe Explicar en Pantalla |
| :--- | :--- | :--- |
| `database/migrations/001_init_postgis_schema.sql` | Script DDL PostgreSQL + PostGIS | Tabla `pedidos`: UUID, latitud/longitud, `peso_kg`, `volumen_m3` y el `CONSTRAINT check_ventanas_horarias`. |
| `database/seeds/001_seed_pedidos_huancayo.sql` | Semillas SQL de Prueba | Inserciones de zonas de cobertura (Huancayo, El Tambo, Chilca) y los pedidos reales georreferenciados. |
| `backend/src/config/db.js` | Conexión a Base de Datos | Cliente `pg.Pool` con reconexión automática y soporte de variables de entorno (`DB_HOST`, `DB_PORT`, etc.). |
| `backend/src/server.js`<br>`backend/src/app.js` | Núcleo Servidor Express | Configuración de Express, middlewares `cors`, `express.json()`, y montaje del enrutador bajo `/api/v1`. |
| `backend/src/routes/api.js` | Enrutador REST Express | Endpoints: `POST /pedidos`, `GET /pedidos`, `GET /pedidos/stats`, `PATCH /pedidos/:id/cancelar` y `GET /health`. |
| `backend/src/controllers/pedidoController.js` | Controlador HTTP | Validación HTTP y control de códigos de respuesta REST (`201 Created`, `400 Bad Request`, `404 Not Found`). |
| `backend/src/services/pedidoService.js` | Lógica de Negocio y SQL | Consultas parametrizadas (`$1, $2`) que previenen inyección SQL y el cálculo agregativo de stats (peso total y volumen). |
| `backend/tests/pedidos.test.js`<br>`backend/tests/endpoints.test.js` | Suites de Pruebas Jest | Casos de prueba: creación válida, rechazo por ventana horaria invertida y cálculo de métricas agregadas. |
| `docker-compose.yml`<br>`.github/workflows/ci.yml` | DevOps & CI/CD Pipeline | Portabilidad de PostGIS y el pipeline automatizado de GitHub Actions que valida el DoD en cada Pull Request. |

### 3.3. Guion de Exposición y Demostración en Vivo

* **Minuto 0:00 – 2:30 (Base de Datos Espacial PostGIS):**
  > *"Gracias Jeferson. Como Arquitecto Backend, diseñé la persistencia sobre PostgreSQL y PostGIS en `database/migrations/001_init_postgis_schema.sql`. Para soportar el algoritmo VRPTW, no basta una base de datos relacional genérica: modelamos coordenadas de alta precisión y una restricción a nivel DDL: `CONSTRAINT check_ventanas_horarias CHECK (ventana_fin > ventana_inicio)`. Si un despachador intenta ingresar una entrega con hora fin previa a la de inicio, la base de datos aborta la transacción por integridad."*

* **Minuto 2:30 – 5:00 (Arquitectura de la API REST en Node.js):**
  > *"En `backend/src/` estructuré una arquitectura en capas limpias. En `routes/api.js` definí los endpoints REST bajo la versión 1. El `pedidoController.js` gestiona la validación HTTP y `pedidoService.js` ejecuta consultas transaccionales con parámetros para evitar inyecciones SQL. Además, implementé `GET /api/v1/pedidos/stats`, un endpoint que suma en tiempo real el peso acumulado en kg y el volumen en metros cúbicos, insumos obligatorios para que el algoritmo verifique la capacidad de carga de los camiones de DistriRápido."*

* **Minuto 5:00 – 7:30 (Demostración en Vivo: Cobertura Jest 87.83% y DoD):**
  > *"Para certificar formalmente el Definition of Done (DoD $\ge 80\%$), construí 26 pruebas automatizadas con Jest y Supertest en `backend/tests/`. Voy a ejecutar en vivo el comando de cobertura en la terminal:"*
  ```powershell
  cd C:\Users\USER\Desktop\EcoLogCity\backend
  npm run test:coverage
  ```

* **Minuto 7:30 – 8:30 (CI/CD y Pase a Frontend):**
  > *"Como observan en la consola, se aprobaron las 26 pruebas con 87.83% de cobertura en líneas y 100% en el servicio de pedidos, superando con creces la meta del 80%. Adicionalmente, el archivo `.github/workflows/ci.yml` replica este proceso automáticamente en la nube de GitHub Actions. Ahora doy el pase a Junior Quispe, quien explicará el motor de geocodificación OSM y la interfaz interactiva de usuario."*

---

## 4. Parte 3 — Geocodificación Inteligente, Interfaz Web y Preparación VRP

* **Expositor:** **Quispe Aquino Junior**
* **Rol Oficial en el Sprint:** Frontend Developer / UX/UI Designer & Especialista en Geocodificación / Motor VRP
* **Tiempo:** 8 a 9 minutos (Geocodificación OSM, Frontend Leaflet y Demostración Web)
* **Enfoque:** Resolución BDD Gherkin (`US-001`), Visor Cartográfico Leaflet, Drag & Drop y Preparación VRP.

### 4.1. ¿Qué Hizo en el Sprint 1? (Responsabilidades y Logros)
* **Motor de Geocodificación Automática para Huancayo (`backend/src/services/geocodingService.js`):** Implementación de un servicio híbrido que utiliza un diccionario local de coordenadas para direcciones críticas y el servicio Nominatim de OpenStreetMap delimitado por el bounding box de Huancayo (-12.0678, -75.2098).
* **Cumplimiento de Escenarios BDD Gherkin (`US-001`):** Programación del Escenario 1 (dirección unívoca devuelve coordenadas exactas de inmediato) y Escenario 2 (dirección ambigua devuelve hasta 5 sugerencias e invita al ajuste manual).
* **Geocodificación Reversa:** Algoritmo para obtener nombre de calle y distrito cuando el usuario arrastra un punto en el mapa.
* **Diseño de la Interfaz Web Responsiva (`frontend/public/index.html`):** Maquetación moderna utilizando Tailwind CSS, con distribución de dos columnas (panel de registro a la izquierda y visor cartográfico interactivo a la derecha).
* **Visor Cartográfico Interactivo con Leaflet (`frontend/public/app.js`):** Renderizado dinámico de mapas en tiempo real. Marcador azul del Almacén Central de DistriRápido, marcadores de pedidos existentes y un marcador rojo móvil (Drag & Drop) para corrección manual de ubicación.
* **Panel de Indicadores Clave (KPIs) en Tiempo Real:** Tarjetas interactivas que consumen la API de estadísticas y muestran la carga total (kg), volumen total ($m^3$) y pedidos pendientes.
* **Preparación de Insumos para el Algoritmo VRP (Sprint 2):** Estructuración del payload de pedidos con ventanas temporales y ubicaciones precisas para alimentar la metaheurística del siguiente sprint.

### 4.2. Rutas de Git que DEBE Exponer y Explicar

| Ruta en el Repositorio Git | Tipo de Artefacto | Aspecto Crítico que Debe Explicar en Pantalla |
| :--- | :--- | :--- |
| `backend/src/services/geocodingService.js` | Servicio Lógico de Georreferenciación | Nominatim con bounding box de Huancayo, geocodificación reversa y resolución interactiva de ambigüedad. |
| `backend/src/controllers/geocodingController.js` | Controlador HTTP Geocoding | Endpoints `GET /api/v1/geocodificar?q=...` y `GET /api/v1/geocodificar/reversa?lat=...&lon=...` |
| `backend/tests/geocoding.test.js` | Pruebas Unitarias de Georreferenciación | Tests de Jest que validan direcciones reales de Huancayo y el fallback seguro cuando la dirección no existe. |
| `frontend/public/index.html` | Interfaz de Usuario (SPA) | Arquitectura visual: panel de control Tailwind CSS, contenedor `#map` para Leaflet, KPIs y modal de sugerencias. |
| `frontend/public/app.js` | Controlador del Cliente JS | Inicialización de Leaflet `L.map()`, eventos `dragend` del marcador rojo y los `fetch()` asíncronos hacia la API. |
| `frontend/package.json` | Configuración Frontend | App ligera, sin frameworks pesados, optimizada para responder en milisegundos en computadoras de despacho. |

### 4.3. Guion de Exposición y Demostración en Navegador

* **Minuto 0:00 – 2:00 (El Reto de la Geocodificación en Huancayo):**
  > *"Gracias Alexander. En Huancayo, la geocodificación comercial tradicional como Google Maps es costosa y muchas veces no ubica pasajes o jirones locales. Para cumplir la Historia `US-001`, implementé en `backend/src/services/geocodingService.js` un motor basado en OpenStreetMap Nominatim parametrizado exclusivamente para Huancayo (-12.06, -75.20). Esto evita cobros por API tokens y garantiza georreferenciación exacta y geocodificación reversa gratuita."*

* **Minuto 2:00 – 6:00 (Demostración en Vivo en la Aplicación Web `http://localhost:8000`):**
  > *"Voy a compartir la pantalla del navegador con la aplicación corriendo en `localhost:8000`. Observen el mapa interactivo en Leaflet: en el centro se ubica el Almacén Central de DistriRápido y en azul los pedidos ya registrados en la base de datos de Huancayo. Ahora haré una demostración de registro en vivo:*
  > 1. *Escribo en dirección: 'Av. Giráldez 150, Huancayo' y hago click en '🔍 Ubicar'.*
  > 2. *El motor ubica inmediatamente el punto exacto y mueve el marcador rojo interactivo.*
  > 3. *Demostración Drag & Drop: si la numeración es imprecisa, arrastro el marcador rojo por el mapa y verán cómo las coordenadas se actualizan automáticamente.*
  > 4. *Completo el cliente 'Bodega Los Andes', peso 15 kg, ventana de 08:00 a 11:00 y guardo el pedido.*
  > 5. *Instantáneamente la tabla de pedidos se refresca y los KPIs superiores incrementan la carga acumulada sin necesidad de recargar la página."*

* **Minuto 6:00 – 8:30 (Conexión con el Motor VRP del Sprint 2 y Conclusión):**
  > *"Esta captura precisa de latitud, longitud, peso, volumen y ventanas de tiempo es el insumo fundamental para el Sprint 2, donde implementaremos el algoritmo genético para la optimización multiobjetivo de rutas con penalización por pendiente. En conclusión, nuestro equipo ha completado el Sprint 1 al 100%, con 87.83% de cobertura y una plataforma funcional lista para la fase metaheurística. Quedamos atentos a las preguntas del jurado."*

---

## 5. Tabla Cheat Sheet Consolidada (Resumen Ejecutivo del Sprint 1)

| Integrante | Rol en el Sprint 1 | Archivos Git que Debe Abrir | Comando / Acción en Vivo | Frase Clave de Cierre |
| :--- | :--- | :--- | :--- | :--- |
| **Albornoz Peña<br>Jeferson Bener** | Líder Técnico & Scrum Master<br>Director de Proyecto (PM) | • `README.md`<br>• `.gitignore`, `.env.example`<br>• `Guion_Exposicion_Mejorado.md` | Terminal:<br>`git status`<br>`git branch -a`<br>`git log --oneline -n 5` | *"El Sprint 1 habilitó la infraestructura base con 87.83% de cobertura y 0 deuda técnica."* |
| **Landa Rojas<br>Alexander Nelson** | Arquitecto Backend<br>QA / DevOps Engineer | • `database/migrations/001`<br>• `backend/src/services/pedidoService.js`<br>• `backend/tests/pedidos.test.js`<br>• `.github/workflows/ci.yml` | Terminal:<br>`cd backend`<br>`npm run test:coverage` | *"Validamos las ventanas horarias en base de datos y superamos el DoD con 87.83%."* |
| **Quispe Aquino<br>Junior** | Frontend / UX Designer<br>Geocoding & VRP Specialist | • `backend/src/services/geocodingService.js`<br>• `frontend/public/index.html`<br>• `frontend/public/app.js` | Navegador web:<br>`http://localhost:8000`<br>(Registrar pedido y mover pin) | *"Resolvemos la geocodificación en Huancayo a costo cero y listos para el motor VRP."* |

---

## 6. Banco de Preguntas Típicas del Jurado y Respuestas Recomendadas

> [!NOTE]
> **Pregunta para Jeferson (Líder Técnico / Scrum Master): ¿Cómo gestionaron el alcance técnico del Sprint 1 para garantizar el cumplimiento del Definition of Done sin acumular deuda técnica?**  
> **Respuesta:** *"Delimitamos el Sprint 1 estrictamente a la captura y georreferenciación de pedidos (`EP-01` / `US-001`) y la habilitación de la base de datos PostGIS (`EN-001`), evitando adelantar código del optimizador antes de tener insumos validados. Fijamos como Definition of Done que cada funcionalidad cuente con pruebas automatizadas que superen el 80% de cobertura y pasen por el pipeline de CI en GitHub Actions. Con esto logramos 87.83% de cobertura y un incremento 100% estable para arrancar el Sprint 2."*

> [!NOTE]
> **Pregunta para Alexander (Backend/QA): ¿Por qué implementaron PostGIS y cómo garantizan que no existan inconsistencias horarias?**  
> **Respuesta:** *"PostGIS nos brinda cálculo geodésico nativo sobre el elipsoide terrestre para distancias reales entre coordenadas, evitando distorsiones euclidianas. Para la consistencia horaria, no delegamos la validación únicamente al cliente: establecimos un `CONSTRAINT` DDL `check_ventanas_horarias` a nivel de base de datos relacional y pruebas unitarias automáticas en Jest que aseguran un 100% de cobertura en la lógica de pedidos."*

> [!NOTE]
> **Pregunta para Junior (Frontend/Geocoding): ¿Cómo resuelven el problema de direcciones informales o inexactas en Huancayo?**  
> **Respuesta:** *"Implementamos un enfoque en dos capas bajo la especificación BDD `US-001`. La capa automática consulta OpenStreetMap Nominatim acotado a Huancayo; si la dirección es ambigua o imprecisa, la interfaz activa el modo de confirmación asistida, desplegando un pin rojo con Drag & Drop en Leaflet. Esto le permite al despachador mover manualmente el marcador hacia el local exacto, calculando la geocodificación reversa instantáneamente."*
