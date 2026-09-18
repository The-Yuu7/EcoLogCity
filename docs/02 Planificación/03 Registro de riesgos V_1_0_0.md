# Documento 03: Registro de riesgos

[← Volver al README Principal](../../README.md)

Este documento consolida la gestión de riesgos de EcoLogCity utilizando estándares del PMBOK y CMMI. La evaluación se ha realizado mediante una Matriz Cuantitativa, basándose en la exposición.

## Fórmulas de Cálculo
- **Severidad (Exposición)** = Probabilidad (1 a 5) × Impacto (1 a 5)
- **Probabilidad:** 1 (Muy baja) a 5 (Muy alta).
- **Impacto:** 1 (Insignificante) a 5 (Catastrófico).
- **Rangos de Severidad:** Low (1-6), Medium (8-12), High (15-25).

## Matriz de Evaluación de Riesgos

| ID | Descripción del Riesgo | Categoría | Prob. | Imp. | Severidad | Plan de Mitigación (Preventivo) | Plan de Contingencia (Reactivo) | Responsable |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **RSK-01** | Indisponibilidad de servicios Cloud en el proveedor por límites de cuota (servicios gratuitos superados). | Técnica / Infraestructura | 2 | 4 | **8 (Media)** | Monitorear consumo de cuotas e implementar alertas de umbral al 70%. | Migrar temporalmente los contenedores a una cuenta secundaria de respaldo. | QA / DevOps |
| **RSK-02** | Curva de aprendizaje elevada en el framework de Frontend (React) o motor geográfico (Leaflet). | Recursos Humanos / Capacidades | 3 | 3 | **9 (Media)** | Realizar 2 jornadas de Pair Programming y pases de conocimiento al inicio del Sprint 1. | Reasignar las tareas de mayor complejidad técnica UI/UX al Arquitecto de Software. | Scrum Master / Lider |
| **RSK-03** | Inconsistencia en las estimaciones del motor Metaheurístico (VRP) debido a los cambios de altitud en Huancayo. | Técnica / Arquitectura | 3 | 5 | **15 (Alta)** | Modelar un factor de corrección matemático (+12% de sobreesfuerzo) desde la fase de diseño técnico. | Recalibrar manualmente los pesos en el algoritmo y lanzar un parche correctivo (Hotfix). | Especialista en Optimización |
| **RSK-04** | Retraso en la validación de Historias de Usuario por falta de disponibilidad del Product Owner / Asesor. | Gestión del Proyecto | 2 | 3 | **6 (Baja)** | Programar sesiones fijas y recurrentes de validación semanales en el calendario oficial. | Proceder con la validación de un comité interno de pares y agendar validación asíncrona. | Project Manager |
| **RSK-05** | Pérdida de integridad en el código base por conflictos masivos durante la integración continua. | Técnica / Calidad | 2 | 4 | **8 (Media)** | Hacer cumplir de manera estricta la estrategia Git Flow (Pull Requests obligatorios y revisión de pares). | Revertir el branch `develop` al último commit estable y auditar la solicitud fallida. | QA / DevOps |

[← Volver al README Principal](../../README.md)
