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

### Historia de Usuario 14
**ID:** US-014  
**Título:** Gestión de Usuarios  
**Épica Relacionada:** EP-03 [Infraestructura y Arquitectura Core]  
**Redacción:**  
**Como** Administrador Logístico,  
**quiero** registrar cuentas, cambiar su rol y activarlas o desactivarlas,  
**para** controlar quién accede a EcoLogCity sin depender de cambios en la base de datos.  

> **Nota de numeración:** US-010 a US-013 están reservadas para el backlog del Sprint 4 definido en la Revisión del Sprint 3 (recuperación de contraseña, protección de fuerza bruta, auditoría y CI/CD).

### Historia de Usuario 15
**ID:** US-015  
**Título:** Planificación Automática de Rutas y Directorio de Rutas  
**Épica Relacionada:** EP-01 [Módulo de Gestión de Pedidos]  
**Redacción:**  
**Como** Administrador Logístico,  
**quiero** que las rutas se replanifiquen solas cada vez que se registra o cancela un pedido o cambia la flota, y verlas en un directorio por ruta,  
**para** no depender de un botón y tener siempre el plan vigente de cada vehículo.  
*Reemplaza la interacción "presionar un botón" de US-003.*

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

### US-007: Inicio de Sesión y Control de Acceso por Roles
**Escenario 1: Credenciales válidas**  
**Dado** que el usuario está en la pantalla de inicio de sesión  
**Cuando** ingresa un correo y contraseña registrados  
**Entonces** el sistema abre el panel y muestra su nombre y su rol (Admin o Usuario).  

**Escenario 2: Acceso sin permiso**  
**Dado** que una persona inició sesión con el rol Usuario  
**Cuando** intenta optimizar rutas o modificar la flota  
**Entonces** la opción no aparece en la interfaz y la API responde 403 (sin permisos).

### US-008: Gestión de Flota de Vehículos
**Escenario 1: Baja de un vehículo**  
**Dado** que el Administrador está en "Gestión de Flota"  
**Cuando** da de baja un vehículo  
**Entonces** el vehículo queda marcado como "De baja", deja de usarse en la optimización y el dashboard recalcula la capacidad de la flota activa.

### US-009: Directorio de Pedidos por Rol
**Escenario 1: Directorio del usuario**  
**Dado** que un Usuario inició sesión  
**Cuando** abre el directorio de pedidos  
**Entonces** solo ve los pedidos que él registró.  

**Escenario 2: Directorio general**  
**Dado** que el Administrador inició sesión  
**Cuando** abre el directorio de pedidos  
**Entonces** ve los pedidos de todos los usuarios con la columna "Registrado por".

### US-014: Gestión de Usuarios
**Escenario 1: Registro de una cuenta**  
**Dado** que el Administrador está en el módulo "Usuarios"  
**Cuando** registra un nombre, un correo válido, una contraseña de al menos 8 caracteres y un rol  
**Entonces** la cuenta aparece en la lista y la persona puede iniciar sesión con ella.  

**Escenario 2: Protección de la propia cuenta**  
**Dado** que el Administrador ve su propia cuenta en la lista  
**Cuando** intenta desactivarla o quitarle el rol de administrador  
**Entonces** el sistema lo impide y muestra el motivo.

### US-015: Planificación Automática de Rutas
**Escenario 1: Pedido nuevo**  
**Dado** que hay vehículos activos con capacidad disponible  
**Cuando** un usuario registra un pedido  
**Entonces** el sistema lo asigna a una ruta sin intervención y el pedido queda en estado PLANIFICADO.  

**Escenario 2: Pedido que no cabe en la flota**  
**Dado** que la flota activa no tiene capacidad para un pedido  
**Cuando** se replanifican las rutas  
**Entonces** el pedido queda en REGISTRADO y aparece en "Pedidos sin asignar" del Directorio de rutas.  

**Escenario 3: Sin flota activa**  
**Dado** que todos los vehículos están dados de baja  
**Cuando** se replanifican las rutas  
**Entonces** ningún pedido queda PLANIFICADO y el directorio muestra el aviso "No hay vehículos activos en la flota".

### US-016: Editar Perfil
**Escenario 1: Cambio de contraseña**  
**Dado** que el usuario está en "Mi perfil"  
**Cuando** ingresa su contraseña actual correcta y una nueva de al menos 8 caracteres  
**Entonces** el sistema guarda la nueva contraseña cifrada y la sesión continúa con los datos actualizados.  

**Escenario 2: Contraseña actual incorrecta**  
**Dado** que el usuario quiere cambiar su correo o contraseña  
**Cuando** la contraseña actual no coincide  
**Entonces** el sistema rechaza el cambio y muestra "La contraseña actual no es correcta".

### US-017: Vistas Exclusivas del Administrador
**Escenario 1: Acceso del usuario**  
**Dado** que un Usuario inicia sesión  
**Cuando** se abre el panel  
**Entonces** entra directamente a "Pedidos" y no ve Dashboard, Directorio de rutas ni Usuarios en el menú; si escribe la dirección de esas vistas vuelve a "Pedidos" y la API responde 403.

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
