# Documento 01: Transformando a ágil

[← Volver al README Principal](../../README.md)

## A. Metodología de Transformación
La línea base de requerimientos (documentada en la Fase de Inicio) fue analizada para extraer y modelar los componentes ágiles de Jira:
1. **Requerimientos Funcionales (RF):** Fueron agrupados por módulos de negocio (Ej: Optimización de Rutas, Geolocalización) y transformados en **Épicas**. Estas a su vez se desglosaron en **Historias de Usuario (US)** que aportan valor continuo al cliente (ej. RF-001 -> EP-01 -> US-001).
2. **Requerimientos No Funcionales (RNF):** Fueron mapeados como **Historias Técnicas (Enablers)** o integrados como **Criterios de Aceptación** dentro del DoD (ej. RNF-001 sobre Rendimiento del Motor VRP se transformó en un Enabler de optimización de consultas espaciales).

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

### Historia Técnica (Enabler) 1
**ID:** EN-001  
**Título:** Integración Base de Datos Espacial PostGIS  
**Épica Relacionada:** EP-03 [Infraestructura y Arquitectura Core]  
**Redacción:**  
**Como** Arquitecto de Software,  
**quiero** desplegar un contenedor PostgreSQL con la extensión PostGIS habilitada,  
**para** habilitar las consultas geoespaciales de alta eficiencia requeridas por el motor VRP.  

## C. Criterios de Aceptación bajo Sintaxis BDD (Gherkin)

### US-001: Geocodificación Automática de Direcciones
**Escenario 1: Dirección válida dentro de cobertura**  
**Dado** que el Operador Logístico está en el formulario de registro de pedido  
**Cuando** ingresa "Av. Giráldez 150, Huancayo" y hace clic en "Validar"  
**Entonces** el sistema captura las coordenadas (Lat: -12.067, Lon: -75.210) y dibuja un marcador en el mapa interactivo.  

**Escenario 2: Dirección ambigua o incompleta**  
**Dado** que el Operador Logístico está registrando un nuevo pedido  
**Cuando** ingresa una dirección incompleta que devuelve múltiples coincidencias en OSM  
**Entonces** el sistema muestra una lista de hasta 5 sugerencias y solicita al usuario seleccionar la ubicación exacta manualmente en el mapa.

### EN-001: Integración Base de Datos Espacial PostGIS
**Escenario 1: Ejecución de consultas espaciales**  
**Dado** un contenedor de base de datos inicializado en el ambiente de Staging  
**Cuando** la API envía una consulta de inserción con el tipo de dato GEOMETRY(Point, 4326)  
**Entonces** la base de datos persiste el registro sin errores de parseo y confirma la transacción.

## D. Definition of Done (DoD) Global del Proyecto
Toda Historia de Usuario o Enabler se considerará finalizada (estado "Done") si cumple estrictamente los siguientes criterios de calidad técnica:
1. **Cobertura de Código:** Cobertura de pruebas unitarias y de integración ≥ 80%.
2. **Seguridad y Calidad Estática:** Análisis estático de código ejecutado (ej. mediante SonarQube) y sin vulnerabilidades críticas, bloqueantes ni olores de código severos.
3. **Peer Review:** Revisión de código obligatoria, aprobada por al menos un par técnico distinto al autor, mediante validación de Pull Request en GitHub.
4. **Despliegue Automatizado:** Código fusionado en la rama `develop` y desplegado automáticamente de manera exitosa en el ambiente de Staging / Pruebas.
5. **Documentación Técnica:** API y componentes documentados y actualizados (ej. especificación OpenAPI/Swagger para los endpoints de Backend).

[← Volver al README Principal](../../README.md)
