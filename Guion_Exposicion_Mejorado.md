# EcoLogCity — Plataforma de Optimización Logística Sostenible
### Informe Técnico: Definición de Sprints, Análisis de Viabilidad e Implementación Integral del Sprint 1

| Campo | Detalle |
| :--- | :--- |
| **Proyecto / Sistema** | **EcoLogCity** (Optimizador VRPTW & Green VRP para Última Milla) |
| **Empresa Patrocinadora** | **DistriRápido S.A.C.** · Huancayo, Junín (3,250 msnm) |
| **Metodología & Estándar** | **Scrum + Git Flow** · Lineamientos PMBOK 7.ª Edición |
| **Estado de Implementación** | **Sprint 1 Completado al 100%** · Cobertura DoD: **87.83%** · PostgreSQL + PostGIS Activo |

---

## 1. Planificación Integral de Sprints del Proyecto (15 Semanas)

El desarrollo del Producto Mínimo Viable (PMV) de **EcoLogCity** se estructura en **14 semanas de desarrollo activo** divididas en **4 Sprints / Iteraciones principales**, más **1 semana de cierre formal** para estabilización y entrega del release `v1.0.0-MVP`:

| Sprint / Iteración | Periodo | Objetivo Principal (Sprint Goal) | Alcance y Requerimientos Clave |
| :--- | :--- | :--- | :--- |
| **Sprint 1**<br>*(Iteración 1)* | **Semanas 1 - 2**<br>(24/08 – 04/09) | *Desplegar el núcleo arquitectónico (Base de datos e Infraestructura CI/CD) e implementar el módulo básico de gestión y geocodificación de pedidos para habilitar los insumos del motor VRP.* | • `EN-001`: Base de datos espacial PostgreSQL + PostGIS.<br>• `US-001`: Geocodificación OSM / Huancayo (BDD Escenarios 1 y 2).<br>• `EP-01`: Endpoints CRUD de pedidos y métricas de carga.<br>• Pipeline de CI/CD con GitHub Actions y DoD $\ge 80\%$. |
| **Sprint 2**<br>*(Iteración 2)* | **Semanas 3 - 6**<br>(07/09 – 02/10) | *Modelar las entidades maestras del negocio (flota, conductores, pedidos y clientes) y desarrollar el núcleo del motor metaheurístico VRPTW con penalización por altitud.* | • `RF-01`: Gestión de flota con restricción por placa de Huancayo.<br>• `RF-02`: Pedidos con ventanas horarias obligatorias.<br>• `RF-08`: Gestión de conductores y jornadas máximas legales.<br>• `RF-03 (Fase 1)`: Solucionador GA/Tabú ($\le 45\text{ s}$) con factor de sobreesfuerzo en altura (3,250 msnm). |
| **Sprint 3**<br>*(Iteración 3)* | **Semanas 7 - 10**<br>(05/10 – 30/10) | *Visualizar la secuencia de paradas sobre la cartografía de Huancayo e integrar las analíticas de sostenibilidad y cálculo de huella de $\text{CO}_2$ según ISO 14083.* | • `RF-04` / `US-002`: Visor cartográfico en Leaflet/OSM en corredores críticos (Real, Ferrocarril, Huancavelica).<br>• `RF-05`: Dashboard analítico de sostenibilidad ($\ge 15\%$ ahorro dist).<br>• `RF-06`: Reportes descargables PDF con TCO de flota.<br>• `RF-10`: Plan de compensación de carbono por reforestación. |
| **Sprint 4 & Cierre**<br>*(Iteración 4)* | **Semanas 11 - 15**<br>(02/11 – 05/12) | *Habilitar la re-optimización dinámica en ruta (<30s), validar la usabilidad con conductores reales y consolidar el release final v1.0.0-MVP.* | • `RF-07`: Re-optimización dinámica ante congestión imprevista.<br>• `RF-03 (Fase Final)`: Modelo multiobjetivo Green VRP calibrado.<br>• `OQ-06`: Auditoría OWASP Top 10 (0 críticas).<br>• `OQ-07`: Cumplimiento de accesibilidad WCAG 2.1 AA ($\ge 90\%$).<br>• Cierre PMBOK y publicación de Release `v1.0.0-MVP`. |

---

## 2. Diagnóstico de Requisitos para Aplicar el Sprint 1

Para proceder con la implementación del Sprint 1 se realizó una auditoría de entorno en el equipo de desarrollo. El análisis determinó que **no se requería ninguna compra, token externo ni acción manual previa**:

* **Entorno de Ejecución (Node.js & npm):** El sistema cuenta de forma nativa con Node.js `v22.12.0` y npm `10.9.0`, permitiendo instalar dependencias modernas y ejecutar pruebas con Jest sin fricciones.
* **Motor de Base de Datos (PostgreSQL 17):** El servicio local `postgresql-x64-17` se encuentra activo y escuchando en el puerto estándar 5432, lo que permitió inicializar de inmediato la base de datos `ecologcity_db`.
* **Servicio Cartográfico y Geocodificación:** Se utilizó OpenStreetMap Nominatim parametrizado para la provincia de Huancayo, respaldado por una base de conocimiento local de coordenadas. No se requiere pagar APIs comerciales de Google Maps ni tokens de Mapbox.
* **Contenerización Opcional:** Se dejó estructurado el archivo `docker-compose.yml` con la imagen oficial `postgis/postgis:16-3.4` para despliegues portátiles y entornos de pruebas automatizadas.

---

## 3. Memoria Detallada de la Implementación del Sprint 1

### 3.1. Base de Datos Espacial y Migraciones ([`EN-001`](docs/02%20Planificación/01%20Transformando%20a%20ágil%20V_1_0_0.md#L30))
Se creó la base de datos relacional `ecologcity_db` y se ejecutaron las migraciones correspondientes en `database/`:
* **Migración DDL (`001_init_postgis_schema.sql`):** Crea la tabla principal `pedidos` con identificadores UUID, validación de ventanas horarias (`check_ventanas_horarias` que exige que `ventana_fin > ventana_inicio`), campos de alta precisión latitud/longitud, `peso_kg`, `volumen_m3`, tiempo de servicio y estado (`'REGISTRADO'`, `'PLANIFICADO'`, `'EN_RUTA'`, `'ENTREGADO'`, `'CANCELADO'`). Incluye además las tablas `zonas_cobertura`, `vehiculos` y `conductores` con índices espaciales y de estado.
* **Datos Semilla (`001_seed_pedidos_huancayo.sql`):** Se insertaron los polígonos/cuadrículas de los 5 distritos autorizados y 8 pedidos reales de prueba georreferenciados en Huancayo (Av. Giráldez 150, Calle Real 450 en El Tambo, Jr. Mantaro 320 en Mercado Modelo, Av. 9 de Diciembre en Chilca, etc.).

### 3.2. Motor de Geocodificación Automática para Huancayo ([`US-001`](docs/02%20Planificación/01%20Transformando%20a%20ágil%20V_1_0_0.md#L12))
Se implementó en `backend/src/services/geocodingService.js` dando cumplimiento a los dos escenarios formales BDD Gherkin:
* **Escenario 1 (Dirección válida dentro de cobertura):** Al ingresar direcciones estructuradas (ej. *"Av. Giráldez 150"*), el motor obtiene automáticamente las coordenadas GPS (Lat: -12.0673, Lon: -75.2104) con alta confianza y fija el punto en el mapa.
* **Escenario 2 (Dirección ambigua o incompleta):** Si la consulta devuelve múltiples opciones en OSM, el servicio retorna hasta 5 sugerencias y activa el modo de confirmación manual, permitiendo al usuario seleccionar una sugerencia o arrastrar el marcador (drag & drop) directamente en el mapa Leaflet.
* **Geocodificación Reversa:** Permite obtener la dirección textual a partir de cualquier coordenada geográfica dentro del valle del Mantaro.

### 3.3. API REST y Gestión de Pedidos ([`EP-01`](docs/02%20Planificación/01%20Transformando%20a%20ágil%20V_1_0_0.md#L15))
Desarrollada sobre Node.js y Express en `backend/src/`, estructurada en capas limpias (Config, Services, Controllers, Routes):
* `POST /api/v1/pedidos`: Registro de pedidos con validación estricta Zod y geocodificación automática integrada.
* `GET /api/v1/pedidos`: Consulta y filtrado de pedidos por distrito, estado o paginación.
* `GET /api/v1/pedidos/stats`: Endpoint analítico que consolida la carga total (kg), volumen total ($m^3$) y pedidos pendientes (insumos directos para el motor VRP de Sprint 2).
* `GET /api/v1/geocodificar` y `/api/v1/geocodificar/reversa`: Servicios REST de georreferenciación.
* `PATCH /api/v1/pedidos/:id/cancelar`: Cancelación controlada de órdenes de despacho.

### 3.4. Calidad Técnica y Cobertura de Pruebas (DoD $\ge 80\%$)
Para certificar formalmente el Definition of Done (DoD) exigido en la planificación ágil, se construyeron 3 suites de pruebas automatizadas con Jest y Supertest en `backend/tests/` (`geocoding.test.js`, `pedidos.test.js` y `endpoints.test.js`). Los resultados obtenidos son:
* **Pruebas Automatizadas:** 26 pruebas ejecutadas y 26 pruebas aprobadas (0 fallos).
* **Cobertura de Líneas alcanzada: 87.83%** (Supera con holgura el umbral del $80\%$ exigido).
* **Cobertura de Sentencias: 87.04%**.
* **Cobertura en Controladores HTTP: 85.10%**.
* **Cobertura en Servicio de Pedidos: 100.00%**.

### 3.5. Interfaz Visual Interactiva (Frontend UI)
Desarrollada en `frontend/public/` (`index.html` y `app.js`) utilizando Tailwind CSS y Leaflet Map, servida directamente en `http://localhost:8000`:
* **Visor Cartográfico Leaflet:** Mapa centrado en Huancayo (-12.0678, -75.2098) que dibuja el Almacén Central de DistriRápido y todos los pedidos activos.
* **Marcador Drag & Drop (Rojo):** Permite arrastrar el pin para reubicar manualmente pedidos con georreferenciación imprecisa.
* **Formulario de Pedidos:** Conexión asíncrona con el botón *"🔍 Ubicar"* para geocodificación en vivo.
* **Panel de Indicadores (KPIs):** Visualización en tiempo real del peso acumulado, volumen total y órdenes pendientes.
* **Tabla de Órdenes:** Listado con códigos de seguimiento, ventana horaria, botón *"Ver Mapa"* y opción de cancelación.

### 3.6. Contenerización y Pipeline CI/CD (GitHub Actions)
* `docker-compose.yml`: Orquestación reproducible para levantar la base de datos PostGIS (`postgis/postgis:16-3.4`) y el servidor backend en cualquier entorno.
* `.github/workflows/ci.yml`: Workflow automático de Integración Continua que despliega una instancia de PostgreSQL + PostGIS, corre las migraciones y valida que la suite de pruebas mantenga la cobertura superior al 80% en cada Pull Request hacia `develop` o `main`.

---

## 4. Guía de Ejecución y Pruebas en Vivo

Para iniciar y auditar el sistema en el ambiente local, ejecutar los siguientes comandos en PowerShell:

1. **Iniciar el Servidor Backend:**
   ```powershell
   cd C:\Users\USER\Desktop\EcoLogCity\backend
   npm start
   ```

2. **Abrir la Aplicación Web en el Navegador:**
   Navegar a: **[http://localhost:8000](http://localhost:8000)**  
   *(Permite registrar pedidos, probar geocodificación automática e interactuar con el mapa de Huancayo).*

3. **Ejecutar la Suite de Pruebas y Cobertura (DoD):**
   ```powershell
   npm run test:coverage
   ```
   *(Comprueba que las 26 pruebas pasen satisfactoriamente con 87.83% de cobertura de código).*
