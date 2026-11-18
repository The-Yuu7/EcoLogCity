# Documento 01: Transformando a ágil

[← Volver al README Principal](../../README.md)

**Versión del Documento:** V_1_2_0 (Cierre Sprint 4 — Pruebas E2E, Usabilidad SUS y CI/CD)  
**Proyecto:** EcoLogCity — DistriRápido S.A.C.  
**Fecha de Actualización:** 17/11/2026  

---

## Historial de Control de Versiones

| Versión | Fecha | Autor / Rol | Resumen de Cambios Realizados |
| :---: | :---: | :--- | :--- |
| **V_1_0_0** | 10/09/2026 | Albornoz Peña Jeferson Bener (PM) | Creación inicial del backlog ágil, descomposición de RF en Épicas (EP-01 a EP-04) e Historias de Usuario (US-001 a US-009). |
| **V_1_1_0** | 15/10/2026 | Albornoz Peña Jeferson Bener (PM) | Incorporación de historias de usuario del Sprint 3 (US-014 a US-017) y criterios de aceptación BDD (Gherkin). |
| **V_1_2_0** | 17/11/2026 | Albornoz Peña Jeferson Bener (PM) | Cierre del backlog Sprint 4: Formalización de US-010 a US-013 (Rate Limiting, Auditoría, Playwright E2E, CI/CD Render) y ampliación del Definition of Done con métricas de usabilidad SUS (≥ 68) y pruebas multiplataforma. |

---

## A. Metodología de Transformación
La línea base de requerimientos (documentada en la Fase de Inicio) fue analizada para extraer y modelar los componentes ágiles de Jira:
1. **Requerimientos Funcionales (RF):** Fueron agrupados por módulos de negocio (Ej: Optimización de Rutas, Geolocalización) y transformados en **Épicas**. Estas a su vez se desglosaron en **Historias de Usuario (US)** que aportan valor continuo al cliente (ej. RF-001 -> EP-01 -> US-001).
2. **Requerimientos No Funcionales (RNF):** Fueron mapeados como **Historias Técnicas (Enablers)** o integrados como **Criterios de Aceptación** dentro del DoD (ej. RNF-001 sobre Rendimiento del Motor VRP se transformó en un Enabler de optimización de consultas espaciales).

---

## B. Historias de Usuario (US) e Historias Técnicas (Enablers)

### Historia de Usuario 1
**ID:** US-001  
**Título:** Geocodificación Automática de Direcciones  
**Épica Relacionada:** EP-01 [Módulo de Gestión de Pedidos]  
**Redacción:**  
**Como** Operador Logístico,  
**quiero** ingresar una dirección textual y que el sistema la convierta en coordenadas geoespaciales,  
**para** poder visualizar con precisión el punto de entrega en el mapa de Huancayo.  

### Historia de Usuario 2
**ID:** US-002  
**Título:** Visualización de Rutas Asignadas en Mapa  
**Épica Relacionada:** EP-02 [Visor Cartográfico y Seguimiento]  
**Redacción:**  
**Como** Conductor,  
**quiero** visualizar en mi dispositivo móvil el mapa interactivo con mis paradas ordenadas,  
**para** seguir la ruta óptima generada y cumplir con mis ventanas horarias de entrega.  

### Historia de Usuario 3
**ID:** US-003  
**Título:** Motor de Optimización de Rutas (VRPTW & Green VRP)  
**Épica Relacionada:** EP-01 [Módulo de Gestión de Pedidos]  
**Redacción:**  
**Como** Despachador,  
**quiero** presionar un botón que ejecute un algoritmo inteligente de ruteo,  
**para** agrupar automáticamente los pedidos pendientes cuidando la capacidad de los camiones y minimizando mis costos y emisiones CO2.  

### Historia de Usuario 4
**ID:** US-004  
**Título:** Trazado de Rutas en Calles Reales (OSRM)  
**Épica Relacionada:** EP-02 [Visor Cartográfico y Seguimiento]  
**Redacción:**  
**Como** Despachador,  
**quiero** ver las rutas calculadas dibujadas sobre las calles reales en el mapa de Leaflet,  
**para** tener una perspectiva geográfica certera y distinguir los vehículos por diferentes colores.  

### Historia de Usuario 5
**ID:** US-005  
**Título:** Cálculo de penalización atmosférica y reducción de emisiones de CO2  
**Épica Relacionada:** EP-01 [Módulo de Gestión de Pedidos]  
**Redacción:**  
**Como** Administrador Logístico,  
**quiero** ver las emisiones de CO2 evitadas por la ruta optimizada considerando la altitud de Huancayo,  
**para** medir el impacto ambiental del reparto y reportarlo a DistriRápido.  

### Historia de Usuario 6
**ID:** US-006  
**Título:** Dashboard de Indicadores Operativos  
**Épica Relacionada:** EP-04 [Dashboard Analítico]  
**Redacción:**  
**Como** Operador Logístico,  
**quiero** ver en un panel los pedidos registrados, la carga acumulada, la emisión diésel base y el gasto estimado de la flota,  
**para** conocer el volumen de trabajo del día antes de planificar las rutas.  

### Historia de Usuario 7
**ID:** US-007  
**Título:** Inicio de Sesión y Control de Acceso por Roles  
**Épica Relacionada:** EP-03 [Infraestructura y Arquitectura Core]  
**Redacción:**  
**Como** Administrador Logístico,  
**quiero** que cada persona ingrese con su correo y contraseña y tenga el rol de administrador o usuario,  
**para** que solo el administrador pueda optimizar rutas y modificar la flota.  

### Historia de Usuario 8
**ID:** US-008  
**Título:** Gestión de Flota de Vehículos  
**Épica Relacionada:** EP-01 [Módulo de Gestión de Pedidos]  
**Redacción:**  
**Como** Administrador Logístico,  
**quiero** registrar vehículos con su capacidad y combustible, y darlos de baja o reactivarlos,  
**para** que el motor de rutas trabaje solo con los vehículos disponibles.  

### Historia de Usuario 9
**ID:** US-009  
**Título:** Directorio de Pedidos por Rol  
**Épica Relacionada:** EP-01 [Módulo de Gestión de Pedidos]  
**Redacción:**  
**Como** Usuario (Operador / Despachador),  
**quiero** ver solo los pedidos que yo registré, mientras el administrador ve el directorio general,  
**para** gestionar mis entregas sin mezclarlas con las de otros operadores.  

### Historia de Usuario 10 (Sprint 4)
**ID:** US-010  
**Título:** Rate Limiting y Protección contra Ataques de Fuerza Bruta en Login  
**Épica Relacionada:** EP-03 [Infraestructura y Arquitectura Core]  
**Redacción:**  
**Como** Administrador del Sistema,  
**quiero** que el endpoint de autenticación bloquee temporalmente las solicitudes tras 5 intentos fallidos consecutivos,  
**para** mitigar ataques de fuerza bruta y salvaguardar las credenciales de los usuarios en producción.  

### Historia de Usuario 11 (Sprint 4)
**ID:** US-011  
**Título:** Auditoría de Eventos de Seguridad y Trazabilidad Operativa  
**Épica Relacionada:** EP-03 [Infraestructura y Arquitectura Core]  
**Redacción:**  
**Como** Oficial de Seguridad y Administrador,  
**quiero** que el sistema registre de forma persistente los eventos de autenticación, cambios en la flota vehicular y transacciones de pedidos en una bitácora estructurada,  
**para** garantizar el no repudio y cumplir con los estándares OWASP A09.  

### Historia de Usuario 12 (Sprint 4)
**ID:** US-012  
**Título:** Pruebas End-to-End y Monitoreo de Rendimiento con Playwright  
**Épica Relacionada:** EP-03 [Infraestructura y Arquitectura Core]  
**Redacción:**  
**Como** Ingeniero de Calidad de Software (QA),  
**quiero** ejecutar una suite automatizada E2E en Chromium, Firefox y WebKit y medir las métricas Core Web Vitals (TTFB, FCP),  
**para** certificar que el sistema funciona sin regresiones en todos los navegadores y responde en menos de 500 ms.  

### Historia de Usuario 13 (Sprint 4)
**ID:** US-013  
**Título:** Automatización de Integración y Despliegue Continuo (CI/CD)  
**Épica Relacionada:** EP-03 [Infraestructura y Arquitectura Core]  
**Redacción:**  
**Como** Desarrollador y Arquitecto Cloud,  
**quiero** que GitHub Actions valide la sintaxis, ejecute las pruebas unitarias y E2E y despliegue automáticamente en Render Cloud al fusionar en `main`,  
**para** eliminar despliegues manuales y garantizar la entrega continua de valor a DistriRápido S.A.C.  

### Historia de Usuario 14
**ID:** US-014  
**Título:** Gestión de Usuarios  
**Épica Relacionada:** EP-03 [Infraestructura y Arquitectura Core]  
**Redacción:**  
**Como** Administrador Logístico,  
**quiero** registrar cuentas, cambiar su rol y activarlas o desactivarlas,  
**para** controlar quién accede a EcoLogCity sin depender de cambios en la base de datos.  

### Historia de Usuario 15
**ID:** US-015  
**Título:** Planificación Automática de Rutas y Directorio de Rutas  
**Épica Relacionada:** EP-01 [Módulo de Gestión de Pedidos]  
**Redacción:**  
**Como** Administrador Logístico,  
**quiero** que las rutas se replanifiquen solas cada vez que se registra o cancela un pedido o cambia la flota, y verlas en un directorio por ruta,  
**para** no depender de un botón y tener siempre el plan vigente de cada vehículo.  

### Historia de Usuario 16
**ID:** US-016  
**Título:** Editar Perfil  
**Épica Relacionada:** EP-03 [Infraestructura y Arquitectura Core]  
**Redacción:**  
**Como** usuario o administrador,  
**quiero** cambiar mi nombre, mi correo y mi contraseña,  
**para** mantener mis datos de acceso actualizados sin pedírselo al administrador.  

### Historia de Usuario 17
**ID:** US-017  
**Título:** Vistas de Supervisión Exclusivas del Administrador  
**Épica Relacionada:** EP-04 [Dashboard Analítico]  
**Redacción:**  
**Como** Administrador Logístico,  
**quiero** que el Dashboard y el Directorio de rutas sean solo para mi rol,  
**para** que los usuarios trabajen únicamente con sus pedidos y la información global de la operación quede restringida.  

### Historia Técnica (Enabler) 1
**ID:** EN-001  
**Título:** Integración Base de Datos Espacial PostGIS  
**Épica Relacionada:** EP-03 [Infraestructura y Arquitectura Core]  
**Redacción:**  
**Como** Arquitecto de Software,  
**quiero** desplegar un contenedor PostgreSQL con la extensión PostGIS habilitada,  
**para** habilitar las consultas geoespaciales de alta eficiencia requeridas por el motor VRP.  

---

## C. Criterios de Aceptación BDD (Gherkin) para Sprint 4

### US-010: Rate Limiting en Login
**Escenario 1: Bloqueo tras 5 intentos fallidos**  
**Dado** que un usuario intenta autenticarse con contraseñas inválidas  
**Cuando** alcanza 5 intentos fallidos consecutivos en menos de 10 minutos  
**Entonces** el servidor responde HTTP 429 Too Many Requests y notifica el tiempo de espera requerido.

### US-012: Suite E2E Playwright Multi-Navegador
**Escenario 1: Ejecución multiplataforma con 100% de éxito**  
**Dado** el entorno de staging desplegado o servidor de pruebas en ejecución  
**Cuando** se ejecuta la suite de Playwright para Chromium, Firefox y WebKit  
**Entonces** los 20 casos de prueba por navegador concluyen en estado verde (PASS) con tiempos de respuesta de APIs inferiores a 500 ms.

### US-013: Despliegue Automático CI/CD
**Escenario 1: Despliegue continuo en Render Cloud**  
**Dado** un Pull Request aprobado y fusionado en la rama `main`  
**Cuando** concluyen con éxito los workflows de `ci.yml` y `tests.yml`  
**Entonces** el workflow `deploy-production.yml` invoca el webhook seguro de Render y el healthcheck confirma el estado HTTP 200 en producción.

---

## D. Definition of Done (DoD) Global del Proyecto (Actualizado Sprint 4)

Toda Historia de Usuario o Enabler se considerará finalizada (estado "Done") si cumple estrictamente los siguientes criterios de calidad técnica:
1. **Cobertura de Código:** Cobertura de pruebas unitarias y de integración Jest ≥ 80% en backend.
2. **Pruebas Automatizadas E2E:** 100% de casos de prueba E2E aprobados en Playwright sobre Chromium, Firefox y WebKit.
3. **Usabilidad Cuantitativa:** Evaluación mediante la escala estándar SUS con puntaje promedio global $\ge 68$ puntos (alcanzado 85.42 pts, Grade A).
4. **Seguridad y Calidad Estática:** Análisis estático sin vulnerabilidades críticas ni bloqueantes según OWASP Top 10 2025.
5. **Peer Review:** Revisión obligatoria aprobada mediante Pull Request en GitHub.
6. **Despliegue Continuo:** Flujos de GitHub Actions (`ci.yml`, `tests.yml`, `deploy-production.yml`) ejecutándose en verde con despliegue automatizado en Render.
7. **Documentación Técnica:** Trazabilidad bidireccional y actualización de manuales y artefactos en `docs/`.

---

[← Volver al README Principal](../../README.md)
