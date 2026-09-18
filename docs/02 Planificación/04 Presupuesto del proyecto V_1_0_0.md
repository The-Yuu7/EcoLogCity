# Documento 04: Presupuesto del proyecto

[← Volver al README Principal](../../README.md)

Este documento detalla el modelado financiero integral del PMV de EcoLogCity. Incluye la estimación del esfuerzo técnico, costos de infraestructura y un fondo de contingencia fundamentado en el análisis de riesgos. Se considera un horizonte de 15 semanas (3.5 meses aprox).

## Estructura Desagregada del Presupuesto

### 1. Costo de Recursos Humanos (CAPEX)
*Nota: Tarifa horaria académica simulada en USD para efectos de modelado de proyecto.*

| Rol | Dedicación (Horas totales) | Tarifa Hora (USD) | Subtotal (USD) |
| :--- | :--- | :--- | :--- |
| Scrum Master y Analista de Negocio | 160 hrs | $25.00 | $ 4,000.00 |
| Arquitecto Cloud y Especialista Backend | 240 hrs | $30.00 | $ 7,200.00 |
| Desarrollador Full-Stack y UX/UI | 240 hrs | $25.00 | $ 6,000.00 |
| **Subtotal Recursos Humanos** | **640 hrs** | | **$ 17,200.00** |

### 2. Costo de Licenciamiento y Herramientas
| Descripción | Periodo | Costo Mensual | Subtotal (USD) |
| :--- | :--- | :--- | :--- |
| Atlassian Jira Software (Standard) | 4 Meses | $8.15 / user (3 users = $24.45) | $ 97.80 |
| Figma (Professional) | 4 Meses | $15.00 / user (1 user) | $ 60.00 |
| GitHub Team (Privado avanzado) | 4 Meses | $4.00 / user (3 users = $12.00) | $ 48.00 |
| SonarCloud (Análisis Estático) | 4 Meses | $10.00 | $ 40.00 |
| **Subtotal Licenciamiento** | | | **$ 245.80** |

### 3. Costo de Infraestructura Cloud y Servicios (OPEX)
| Descripción | Periodo | Costo Mensual | Subtotal (USD) |
| :--- | :--- | :--- | :--- |
| Instancia App Server (Ej. AWS EC2 t3.medium) | 4 Meses | $30.00 | $ 120.00 |
| Base de Datos Relacional (RDS PostgreSQL) | 4 Meses | $45.00 | $ 180.00 |
| Waze CCP API / Servicios Geográficos | 4 Meses | $25.00 (Tier 1) | $ 100.00 |
| Dominio y Certificados SSL | Anual | N/A | $ 25.00 |
| **Subtotal Infraestructura** | | | **$ 425.00** |

## Tabla Resumen Financiera

| Categoría | Costo Subtotal (USD) | Porcentaje del Total |
| :--- | :--- | :--- |
| 1. Recursos Humanos (CAPEX) | $ 17,200.00 | 96.24% |
| 2. Licenciamiento de Software | $ 245.80 | 1.38% |
| 3. Infraestructura Cloud (OPEX) | $ 425.00 | 2.38% |
| **SUBTOTAL DE PROYECTO** | **$ 17,870.80** | **100.0%** |
| 4. Reserva de Contingencia (12%) | $ 2,144.50 | N/A |
| **PRESUPUESTO TOTAL ESTIMADO** | **$ 20,015.30** | **100.0%** |

*Nota: La Reserva de Contingencia del 12% ha sido establecida como respuesta al impacto calculado en el Registro de Riesgos (particularmente el asociado a la recodificación de componentes matemáticos).*

[← Volver al README Principal](../../README.md)
