# Registro de impedimentos

[← Volver al README Principal](../../README.md)

**Nombre del Proyecto:** EcoLogCity
**Líder del Proyecto:** Albornoz Peña Jeferson Bener

| Impedimento # | Fecha de Registro | Descripción e Impacto | Prioridad | Reportado por | Fecha tope | Estado | Fecha de Resolución | Resolución/Comentarios |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| IMP-001 | 28/09/2026 | Error al inicializar contenedores de PostGIS en Docker por conflicto de puertos. Impacto: Retraso en la creación de las tablas de geolocalización. | Alta | Landa Rojas Alexander Nelson | 30/09/2026 | Resuelto | 29/09/2026 | Se ajustó el archivo docker-compose.yml y se liberó el puerto 5432 local. |
| IMP-002 | 01/10/2026 | Codificación incorrecta (UTF-16) en el archivo .env generaba error 500 y fallo de autenticación `SASL: SCRAM` en la BD. Impacto: Caída del servicio backend temporalmente. | Alta | Quispe Aquino Junior | 02/10/2026 | Resuelto | 02/10/2026 | Se recreó el archivo en codificación UTF-8 pura. |

[← Volver al README Principal](../../README.md)
