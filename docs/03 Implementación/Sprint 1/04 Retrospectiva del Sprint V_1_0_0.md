# Retrospectiva del sprint

[← Volver al README Principal](../../README.md)

**Nombre del Proyecto:** EcoLogCity
**Líder del Proyecto:** Albornoz Peña Jeferson Bener

## ¿Qué aprendimos?
Aprendimos a estandarizar nuestros entornos de desarrollo mediante Docker, lo que mitigó drásticamente el problema de "en mi máquina sí funciona". También fortalecimos nuestra capacidad para consumir APIs externas como Nominatim para geocodificación de manera asíncrona.

## ¿Qué estamos haciendo bien?
El versionamiento semántico de los documentos en formato Markdown puro funciona excelentemente. La calidad del código base (API REST) es muy limpia gracias a las pruebas unitarias integradas (Jest) con las que cumplimos el DoD de la fase anterior.

## ¿Qué podemos hacer mejor?
### Personas
Fomentar una mayor proactividad para notificar bloqueos (impedimentos) el mismo día que ocurren, en lugar de esperar a la sesión de revisión general.

### Relaciones
Sincronizar de forma más estrecha las tareas entre el Frontend (Junior) y el Backend (Alexander) para evitar cuellos de botella en la definición de los endpoints REST.

### Procesos
Implementar Pull Requests (PR) más pequeños y atómicos en Git, evitando hacer merge de funcionalidades gigantes al final del sprint.

### Herramientas
Estandarizar el uso de un linter (ESLint) y un formateador (Prettier) en nuestros editores para evitar diferencias de formato en el código JS.

### Acciones a realizar
1. Ejecutar Stand-ups diarios de máximo 10-15 minutos.
2. Configurar ESLint y Prettier en el repositorio la próxima semana.
3. Crear y mantener un script automatizado para inyectar datos falsos (seeds) a la base de datos y facilitar las pruebas locales.

[← Volver al README Principal](../../README.md)
