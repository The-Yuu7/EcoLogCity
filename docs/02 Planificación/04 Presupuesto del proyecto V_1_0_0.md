# Documento 04: Presupuesto del proyecto

[← Volver al README Principal](../../README.md)

Este documento detalla el modelado financiero integral del PMV de EcoLogCity. Incluye la estimación del esfuerzo técnico, costos de infraestructura y un fondo de contingencia fundamentado en el análisis de riesgos. Se considera un horizonte de 15 semanas (3.5 meses aprox).

## Estructura Desagregada del Presupuesto

### 1. Costo de Recursos Humanos (CAPEX)
*Nota: Tarifa horaria académica simulada en USD para efectos de modelado de proyecto.*

| Rol | Dedicación (Horas totales) | Tarifa Hora (USD) | Subtotal (USD) |
| :--- | :--- | :--- | :--- |
| Project Manager / Líder | 160 hrs | $25.00 | $ 4,000.00 |
| Software Architect / Backend | 240 hrs | $30.00 | $ 7,200.00 |
| Especialista de Optimización (VRP) | 200 hrs | $30.00 | $ 6,000.00 |
| UI/UX Frontend Designer | 200 hrs | $20.00 | $ 4,000.00 |
| QA Engineer / DevOps | 160 hrs | $25.00 | $ 4,000.00 |
| **Subtotal Recursos Humanos** | **960 hrs** | | **$ 25,200.00** |

### 2. Costo de Licenciamiento y Herramientas
| Descripción | Periodo | Costo Mensual | Subtotal (USD) |
| :--- | :--- | :--- | :--- |
| Atlassian Jira Software (Standard) | 4 Meses | $8.15 / user (5 users = $40.75) | $ 163.00 |
| Figma (Professional) | 4 Meses | $15.00 / user (1 user) | $ 60.00 |
| GitHub Team (Privado avanzado) | 4 Meses | $4.00 / user (5 users = $20.00) | $ 80.00 |
| SonarCloud (Análisis Estático) | 4 Meses | $10.00 | $ 40.00 |
| **Subtotal Licenciamiento** | | | **$ 343.00** |

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
| 1. Recursos Humanos (CAPEX) | $ 25,200.00 | 97.04% |
| 2. Licenciamiento de Software | $ 343.00 | 1.32% |
| 3. Infraestructura Cloud (OPEX) | $ 425.00 | 1.64% |
| **SUBTOTAL DE PROYECTO** | **$ 25,968.00** | **100.0%** |
| 4. Reserva de Contingencia (12%) | $ 3,116.16 | N/A |
| **PRESUPUESTO TOTAL ESTIMADO** | **$ 29,084.16** | **100.0%** |

*Nota: La Reserva de Contingencia del 12% ha sido establecida como respuesta al impacto calculado en el Registro de Riesgos (particularmente el RSK-03 asociado a la recodificación de componentes matemáticos).*

[← Volver al README Principal](../../README.md)
