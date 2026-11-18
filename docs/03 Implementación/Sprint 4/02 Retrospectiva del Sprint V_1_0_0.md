[← Volver al README principal](../../../README.md)

# Retrospectiva del sprint

**Nombre del Proyecto:** EcoLogCity — Optimizador de Rutas Logísticas para DistriRápido S.A.C.  
**Líder del Proyecto:** Albornoz Peña Jeferson Bener  

## ¿Qué aprendimos?

Durante el transcurso del Sprint 4, el equipo consolidó lecciones de alta relevancia técnica, arquitectónica y de gestión de ingeniería de software:

1. **Automatización de Pruebas E2E y Multi-Navegador con Playwright:**
   Aprendimos a estructurar suites de pruebas funcionales y de resiliencia ejecutadas concurrentemente en Chromium, Firefox y WebKit. Comprendimos el impacto de la sincronización asíncrona, el uso de `page.route()` para interceptar peticiones de red y la inyección controlada de errores HTTP (500 y 401) para evaluar la degradación elegante de la interfaz de usuario sin requerir dependencias externas de infraestructura durante los tests.

2. **Orquestación de Pipelines CI/CD Modulares con GitHub Actions:**
   Evidenciamos las ventajas de desacoplar el ciclo de integración continua en tres flujos independientes (`ci.yml`, `tests.yml`, `deploy-production.yml`). Aprendimos a levantar servicios en contenedores dentro del runner de GitHub (PostgreSQL con extensión PostGIS 16), a gestionar artefactos temporales con `upload-artifact@v4` para almacenar trazas de ejecución y a proteger secretos críticos utilizando GitHub Secrets en lugar de variables fijas en el código.

3. **Evaluación Psicométrica de Usabilidad con la Escala SUS:**
   La aplicación del cuestionario System Usability Scale (SUS) bajo el estándar ISO 9241-11 con usuarios reales de DistriRápido S.A.C. nos enseñó a transformar apreciaciones cualitativas en métricas matemáticas normalizadas (0 a 100), diferenciando el tratamiento estadístico entre preguntas impares (positivas) y pares (negativas) para mitigar el sesgo de aquiescencia.

4. **Sutilezas de Renderizado y Jerarquía CSS (Green IT vs Frameworks):**
   Descubrimos que la colisión de especificidad entre clases de utilidades (`.hidden`) y estilos de componentes (`.item-rail { display: flex; }`) puede alterar el control de acceso visual si no se gestiona con directivas explícitas (`!important`). Esta experiencia reforzó la necesidad de validar el DOM computado real mediante pruebas automatizadas de regresión visual y funcional.

---

## ¿Qué estamos haciendo bien?

1. **Calidad de Código y Cobertura de Pruebas:**
   Logramos mantener el 100% de éxito en la suite de pruebas unitarias y de integración de backend con Jest (50 pruebas pasando) y alcanzamos el 100% de aprobación en la suite E2E de Playwright (60 pruebas pasando a lo largo de Chromium, Firefox y WebKit). No se realiza ningún merge a la rama productiva si los checks automáticos no concluyen en estado verde.

2. **Alineamiento con Estándares Ágiles y Git Flow:**
   El equipo mantuvo una disciplina estricta en el uso de Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `ci:`) y en la segregación de ramas de desarrollo y producción (`develop`, `feature/*`, `release/*`, `main`). Cada incremento estuvo estrictamente vinculado a historias de usuario trazables en Jira y GitHub.

3. **Arquitectura Limpia y Desacoplamiento Modular:**
   La clara división de responsabilidades entre el frontend estático servido de forma optimizada y el backend REST estructurado en controladores, servicios y consultas parametrizadas permitió trabajar de forma paralela sin bloqueos entre frontend (Quispe) y backend/cloud (Landa).

4. **Compromiso con la Sostenibilidad y Green IT:**
   La adopción de compresión dinámica Brotli/Gzip para respuestas mayores a 1 KB, el uso de cabeceras ETag fuertes con respuestas HTTP 304 Not Modified y la optimización de algoritmos metaheurísticos para Huancayo reducen de manera cuantificable el consumo energético de los servidores y el tráfico de red de los clientes.

---

## ¿Qué podemos hacer mejor?

### Personas
- **Balance y Gestión de Carga de Trabajo:** Durante la recta final del Sprint 4, el esfuerzo en la implementación de pruebas automatizadas y documentación técnica recayó intensamente en Albornoz y Quispe. Se debe promover una rotación más homogénea de responsabilidades de QA entre todos los miembros del equipo.
- **Especialización Cruzada:** Fortalecer el conocimiento de Docker y pipelines de infraestructura en todos los integrantes para no depender exclusivamente de Landa ante configuraciones de runners en la nube.

### Relaciones
- **Sincronización Temprana de Selectores e IDs:** Aunque la comunicación entre frontend y backend fue fluida a nivel de APIs REST, surgieron pequeñas discrepancias en los nombres de selectores del DOM (`#tabla-pedidos` vs `#pedidos-tbody`) al redactar los tests E2E. Establecer un diccionario de selectores compartidos antes de iniciar el desarrollo evitará ajustes posteriores.
- **Coordinación con Stakeholders en Horarios Logísticos:** Las pruebas de campo con conductores de Huancayo tuvieron que ajustarse debido a sus horarios de despacho matutino. Para futuras fases se deben programar las sesiones de evaluación durante los turnos vespertinos de consolidación de carga.

### Procesos
- **Refinamiento de Criterios de Aceptación para Testing:** Es necesario incorporar la definición de los escenarios de prueba E2E como parte de la Definition of Ready (DoR) de cada historia de usuario, asegurando que los casos de prueba se redacten en paralelo al diseño funcional.
- **Automatización de Limpieza de Ramas:** Se detectó la permanencia de ramas temporales de feature ya fusionadas en el repositorio local. Se debe estandarizar la poda automática de ramas (`git branch -d`) al concluir cada ciclo.

### Herramientas
- **Tiempos de Ejecución de Runners en GitHub Actions:** La instalación completa de navegadores Playwright en máquinas virtuales de Ubuntu añade tiempo al pipeline. Se explorará el uso de imágenes oficiales de contenedor Docker (`mcr.microsoft.com/playwright`) con los navegadores preinstalados para acelerar los tiempos de CI en un 40%.
- **Monitoreo Continuo de Dependencias:** Integrar herramientas como Dependabot para auditar periódicamente vulnerabilidades en librerías de npm sin requerir auditorías manuales.

---

### Acciones a realizar

Para consolidar el cierre definitivo del proyecto y garantizar la sostenibilidad operativa de EcoLogCity, el equipo establece los siguientes compromisos bajo el marco **SMART** (Específicos, Medibles, Alcanzables, Relevantes y con Plazo Definido):

| Código | Acción de Mejora (SMART) | Responsable Principal | Métrica de Seguimiento / Criterio de Éxito | Plazo Máximo |
| :---: | :--- | :--- | :--- | :---: |
| **ACT-01** | Implementar contenedor base con Playwright preinstalado en el workflow de GitHub Actions para reducir el tiempo de ejecución en CI. | **Landa Rojas Alexander Nelson** (Arquitecto Cloud) | Tiempo de ejecución de `tests.yml` inferior a 3.5 minutos en GitHub Actions. | 22/11/2026 |
| **ACT-02** | Consolidar la guía de arquitectura y el diccionario de componentes DOM/UI para futuros mantenedores del sistema. | **Quispe Aquino Junior** (Frontend & UX) | Documento técnico publicado en `docs/04 Ejecución/` con el 100% de IDs y clases clave. | 25/11/2026 |
| **ACT-03** | Configurar alertas automáticas en producción mediante webhook para reportar excepciones no controladas en Render. | **Landa Rojas Alexander Nelson** (Backend) | 100% de errores HTTP 500 notificados con traza a canal seguro de Discord/Slack. | 27/11/2026 |
| **ACT-04** | Elaborar el informe final consolidado de cierre de proyecto (PMV) integrando las métricas de negocio y de sostenibilidad obtenidas. | **Albornoz Peña Jeferson Bener** (PM / Líder) | Informe final de cierre aprobado por la gerencia de DistriRápido S.A.C. y docente asesor. | 02/12/2026 |

---

[← Volver al README principal](../../../README.md)
