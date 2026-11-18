[← Volver al README principal](../../../README.md)

# Informe de Evaluación Cuantitativa de Usabilidad (System Usability Scale - SUS)

**Proyecto:** EcoLogCity — Plataforma de Optimización de Rutas Sostenibles de Última Milla  
**Empresa Patrocinadora:** DistriRápido S.A.C. (Huancayo, Perú)  
**Entorno de Evaluación:** Despliegue en Producción (Render Cloud)  
**Versión del Documento:** 1.0.0 — Sprint 4  
**Responsables:** Quispe Aquino Junior (Full-Stack & UX/UI) · Albornoz Peña Jeferson Bener (PM & Scrum Master)  

---

## 1. Ficha Técnica de la Evaluación

Para cuantificar objetivamente la usabilidad percibida, la eficiencia operativa y el grado de satisfacción de los usuarios finales respecto al incremento funcional del Sprint 4, se aplicó el instrumento estandarizado **System Usability Scale (SUS)** concebido por John Brooke (1986), ampliamente reconocido en la ingeniería de software y respaldado por el estándar internacional **ISO 9241-11** (Eficacia, Eficiencia y Satisfacción).

### 1.1. Instrumento y Escala Psicométrica
- **Cuestionario:** 10 ítems estructurados que alternan sistemáticamente afirmaciones positivas (ítems impares) y negativas (ítems pares) para neutralizar sesgos de aquiescencia o respuesta automática.
- **Escala de Valoración:** Escala de Likert de 5 puntos:
  - `1`: Totalmente en desacuerdo
  - `2`: En desacuerdo
  - `3`: Neutral / Indeciso
  - `4`: De acuerdo
  - `5`: Totalmente de acuerdo

### 1.2. Muestra Evaluada ($n = 6$)
La muestra estuvo compuesta por $n = 6$ evaluadores pertenecientes a la planilla operativa y directiva de **DistriRápido S.A.C.** en Huancayo, superando el umbral mínimo representativo de $n \ge 5$ usuarios necesario para detectar más del 80% de problemas de usabilidad según la curva de Nielsen-Norman:

| N° | Evaluador (Anonimizado) | Cargo / Rol en la Empresa | Perfil Tecnológico | Rol en EcoLogCity |
| :---: | :--- | :--- | :--- | :--- |
| **U1** | C. H. | Despachador Principal de Almacén | Intermedio (Uso diario de ERP y hojas de cálculo) | `USUARIO` |
| **U2** | L. R. | Conductor de Reparto de Última Milla | Básico (Uso preferente de smartphones y GPS móvil) | `USUARIO` |
| **U3** | M. C. | Jefe de Operaciones y Flota | Avanzado (Ingeniero de transportes, análisis de telemetría) | `ADMIN` |
| **U4** | R. M. | Analista de Planificación Logística | Avanzado (Manejo de bases de datos y matrices de ruteo) | `ADMIN` |
| **U5** | D. T. | Operadora de Digitación y Pedidos | Intermedio (Digitación rápida y atención de clientes) | `USUARIO` |
| **U6** | J. P. | Coordinador de Distribución Urbana | Intermedio (Coordinación de despacho y atención de incidencias) | `ADMIN` |

### 1.3. Protocolo de Tareas Pre-Evaluación
Previo al llenado individual y anónimo del cuestionario SUS, cada participante ejecutó de manera autónoma un guion con 4 tareas representativas sobre la plataforma desplegada:
- **Tarea 1 (Acceso y Seguridad):** Iniciar sesión con sus credenciales asignadas en `login.html`, verificar el badge de su rol en la cabecera y validar el acceso a sus módulos autorizados.
- **Tarea 2 (Registro y Geocodificación):** Ingresar a la sección Pedidos, registrar una nueva orden de entrega en Huancayo Cercado ("Av. Giráldez 230"), accionar el botón de geocodificación automática y comprobar que las coordenadas y el pin se dibujen en el mapa Leaflet.
- **Tarea 3 (Inspección de Rutas y Flota):** Navegar por el Directorio de Rutas, inspeccionar la secuencia óptima asignada a uno de los furgones y verificar las ventanas horarias de entrega junto con la huella de $CO_2$ mitigada.
- **Tarea 4 (Gestión de Perfil):** Acceder a "Mi perfil", actualizar su nombre o datos de contacto y cerrar sesión de manera segura.

---

## 2. Resultados Cuantitativos y Cálculo Matemático Paso a Paso

### 2.1. Las 10 Preguntas Estándar del SUS (Versión en Español)
- **P1:** Creo que me gustaría utilizar este sistema con frecuencia. *(Positiva)*
- **P2:** Encontré el sistema innecesariamente complejo. *(Negativa)*
- **P3:** Pensé que el sistema era fácil de usar. *(Positiva)*
- **P4:** Creo que necesitaría el apoyo de una persona técnica para poder utilizar este sistema. *(Negativa)*
- **P5:** Encontré que las diversas funciones de este sistema estaban bien integradas. *(Positiva)*
- **P6:** Pensé que había demasiada inconsistencia en este sistema. *(Negativa)*
- **P7:** Imagino que la mayoría de las personas aprenderían a utilizar este sistema muy rápidamente. *(Positiva)*
- **P8:** Encontré el sistema muy engorroso / pesado de usar. *(Negativa)*
- **P9:** Me sentí muy seguro / confiado utilizando el sistema. *(Positiva)*
- **P10:** Necesité aprender muchas cosas antes de poder empezar a utilizar este sistema. *(Negativa)*

### 2.2. Matriz de Puntuaciones Brutas Registradas

| Participante | Rol | P1 | P2 | P3 | P4 | P5 | P6 | P7 | P8 | P9 | P10 |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **U1** | Despachador | 5 | 1 | 4 | 2 | 5 | 1 | 4 | 1 | 5 | 2 |
| **U2** | Conductor | 4 | 2 | 4 | 2 | 4 | 2 | 4 | 1 | 4 | 2 |
| **U3** | Jefe de Flota | 5 | 1 | 5 | 1 | 4 | 1 | 5 | 1 | 5 | 2 |
| **U4** | Analista Logística | 4 | 1 | 4 | 2 | 4 | 1 | 4 | 2 | 4 | 2 |
| **U5** | Digitación | 5 | 2 | 4 | 1 | 4 | 1 | 5 | 1 | 4 | 2 |
| **U6** | Coordinador | 4 | 2 | 4 | 1 | 5 | 2 | 4 | 2 | 5 | 2 |

---

### 2.3. Metodología de Conversión y Fórmulas Matemáticas
El cálculo del puntaje SUS individual para cada participante $k$ se rige por las reglas psicométricas estándar:

1. **Para ítems impares ($i \in \{1, 3, 5, 7, 9\}$ - Positivos):**  
   $$X_i = \text{Respuesta}_i - 1$$  
   *(El puntaje transformado oscila entre 0 y 4).*

2. **Para ítems pares ($i \in \{2, 4, 6, 8, 10\}$ - Negativos):**  
   $$Y_i = 5 - \text{Respuesta}_i$$  
   *(El puntaje transformado oscila entre 0 y 4).*

3. **Puntaje individual escalado de 0 a 100:**  
   $$\text{SUS}_k = \left( \sum_{i \in \text{impares}} X_i + \sum_{i \in \text{pares}} Y_i \right) \times 2.5$$

---

### 2.4. Cálculo Paso a Paso por Participante

#### Participante U1 (Despachador):
- $\sum X_{\text{impares}} = (5-1) + (4-1) + (5-1) + (4-1) + (5-1) = 4 + 3 + 4 + 3 + 4 = 18$
- $\sum Y_{\text{pares}} = (5-1) + (5-2) + (5-1) + (5-1) + (5-2) = 4 + 3 + 4 + 4 + 3 = 18$
- $\text{Suma Total} = 18 + 18 = 36$
- $\text{SUS}_{U1} = 36 \times 2.5 = \mathbf{90.00}$

#### Participante U2 (Conductor):
- $\sum X_{\text{impares}} = (4-1) + (4-1) + (4-1) + (4-1) + (4-1) = 3 + 3 + 3 + 3 + 3 = 15$
- $\sum Y_{\text{pares}} = (5-2) + (5-2) + (5-2) + (5-1) + (5-2) = 3 + 3 + 3 + 4 + 3 = 16$
- $\text{Suma Total} = 15 + 16 = 31$
- $\text{SUS}_{U2} = 31 \times 2.5 = \mathbf{77.50}$

#### Participante U3 (Jefe de Flota):
- $\sum X_{\text{impares}} = (5-1) + (5-1) + (4-1) + (5-1) + (5-1) = 4 + 4 + 3 + 4 + 4 = 19$
- $\sum Y_{\text{pares}} = (5-1) + (5-1) + (5-1) + (5-1) + (5-2) = 4 + 4 + 4 + 4 + 3 = 19$
- $\text{Suma Total} = 19 + 19 = 38$
- $\text{SUS}_{U3} = 38 \times 2.5 = \mathbf{95.00}$

#### Participante U4 (Analista Logística):
- $\sum X_{\text{impares}} = (4-1) + (4-1) + (4-1) + (4-1) + (4-1) = 3 + 3 + 3 + 3 + 3 = 15$
- $\sum Y_{\text{pares}} = (5-1) + (5-2) + (5-1) + (5-2) + (5-2) = 4 + 3 + 4 + 3 + 3 = 17$
- $\text{Suma Total} = 15 + 17 = 32$
- $\text{SUS}_{U4} = 32 \times 2.5 = \mathbf{80.00}$

#### Participante U5 (Digitación):
- $\sum X_{\text{impares}} = (5-1) + (4-1) + (4-1) + (5-1) + (4-1) = 4 + 3 + 3 + 4 + 3 = 17$
- $\sum Y_{\text{pares}} = (5-2) + (5-1) + (5-1) + (5-1) + (5-2) = 3 + 4 + 4 + 4 + 3 = 18$
- $\text{Suma Total} = 17 + 18 = 35$
- $\text{SUS}_{U5} = 35 \times 2.5 = \mathbf{87.50}$

#### Participante U6 (Coordinador):
- $\sum X_{\text{impares}} = (4-1) + (4-1) + (5-1) + (4-1) + (5-1) = 3 + 3 + 4 + 3 + 4 = 17$
- $\sum Y_{\text{pares}} = (5-2) + (5-1) + (5-2) + (5-2) + (5-2) = 3 + 4 + 3 + 3 + 3 = 16$
- $\text{Suma Total} = 17 + 16 = 33$
- $\text{SUS}_{U6} = 33 \times 2.5 = \mathbf{82.50}$

---

### 2.5. Cálculo del Puntaje SUS Promedio Global

$$\overline{\text{SUS}} = \frac{1}{n} \sum_{k=1}^n \text{SUS}_k = \frac{90.00 + 77.50 + 95.00 + 80.00 + 87.50 + 82.50}{6} = \frac{512.50}{6} \approx \mathbf{85.42 \text{ pts}}$$

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   RESUMEN CUANTITATIVO SUS GLOBAL                      │
├────────────────────────────────────────────────────────────────────────┤
│  Muestra evaluada (n)                 : 6 usuarios                     │
│  Puntaje mínimo individual            : 77.50 pts (Conductor de ruta)  │
│  Puntaje máximo individual            : 95.00 pts (Jefe de flota)      │
│  Desviación Estándar (s)              : 6.54 pts                       │
│  PUNTAJE SUS PROMEDIO GLOBAL          : 85.42 pts                      │
│  Umbral de Aceptación de la Industria : 68.00 pts                      │
│  Diferencial sobre el Estándar        : +17.42 pts                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Análisis e Interpretación de Resultados

### 3.1. Comparación frente al Estándar de la Industria
El promedio de referencia en la literatura psicométrica (Sauro & Lewis, 2012) tras más de 500 evaluaciones de software se ubica en **68 puntos** (percentil 50). Un resultado de **85.42 puntos** coloca a **EcoLogCity** sustancialmente por encima del umbral de aceptabilidad:

```text
  0       20       40       60   68   80   85.42      100
  ├────────┼────────┼────────┼───┼────┼──────█──────────┤
  Inaceptable     Marginal      Aceptable  EcoLogCity (Sobresaliente)
```

### 3.2. Clasificación Adjetiva y Calificación Escolar
- **Escala Adjetiva de Bangor, Kortum & Miller (2009):** El puntaje de 85.42 se ubica en la categoría más alta: **"Excelente" / "Best Imaginable"**.
- **Escala de Calificaciones por Letras (Grade Scale):** Corresponde a una calificación **Grade A** (rango entre 80.3 y 100 puntos).
- **Rango Percentil (Curva de Sauro, 2011):** Un puntaje SUS de 85.42 ubica a la plataforma en el **percentil ~96%**. Esto significa que el sistema EcoLogCity posee una usabilidad superior al 96% de las soluciones de software empresarial evaluadas globalmente.

---

## 4. Cuellos de Botella de Interfaz Identificados y Mejoras Implementadas

Durante las sesiones de observación directa de la interacción de los usuarios, se detectaron fricciones de interfaz que fueron abordadas o priorizadas por el equipo:

### 4.1. Cuellos de Botella Detectados
1. **Fricción en Visualización de Menú en Pantallas Pequeñas (Conductor U2):**
   - *Hallazgo:* El conductor de reparto utiliza tablets de 8 pulgadas en cabina. En resoluciones medianas, el menú lateral colapsado dificultaba distinguir si el icono de camión correspondía a "Pedidos" o a "Gestión de Flota".
   - *Severidad:* Media.
2. **Especificidad en Visibilidad de Módulos RBAC (Digitadora U5):**
   - *Hallazgo:* Los botones de módulos exclusivos de administrador poseían la clase `.item-rail` que forzaba `display: flex`, compitiendo con la clase `.hidden` de Tailwind y generando inconsistencias en navegadores WebKit.
   - *Severidad:* Alta (seguridad y claridad visual).
3. **Claridad en Retroalimentación de Geocodificación (Despachador U1):**
   - *Hallazgo:* Al pulsar "Validar Dirección", el botón no mostraba un spinner de carga visible, lo que inducía al usuario a hacer doble clic mientras el servicio de Nominatim resolvía las coordenadas de Huancayo.
   - *Severidad:* Baja.

### 4.2. Mejoras Aplicadas durante el Sprint 4
- **Hardening de Estilos RBAC en `theme.css`:** Se agregó la regla `.item-rail.hidden, [data-solo-admin].hidden { display: none !important; }`, erradicando cualquier desborde o renderizado indebido en usuarios sin rol administrador.
- **Diferenciación Iconográfica y Etiquetas Descriptivas:** Se incorporó el atributo `aria-label` descriptivo y la funcionalidad de expansión de menú con texto lateral visible (`#btn-expandir-menu`), facilitando la lectura para conductores.
- **Feedback Inmediato en Botones:** Se implementó cambio de estado de texto dinámico (`"Verificando..."`, `"Validando..."`) y bloqueo del botón durante llamadas asíncronas para evitar peticiones duplicadas.

---

## 5. Conclusión de la Evaluación de Usabilidad

El PMV **EcoLogCity** alcanzó un puntaje SUS global de **85.42 / 100**, validando formalmente que el sistema no solo cumple con los requerimientos funcionales de ruteo VRPTW y Green VRP en la altitud de Huancayo, sino que ofrece una experiencia fluida, intuitiva y accesible para los trabajadores de **DistriRápido S.A.C.**, alcanzando el nivel **Sobresaliente (3 puntos / Peso 3 = 9 pts)** de la rúbrica oficial.

---

[← Volver al README principal](../../../README.md)
