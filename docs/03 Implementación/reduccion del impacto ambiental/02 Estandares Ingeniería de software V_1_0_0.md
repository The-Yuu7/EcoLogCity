[← Volver al README Principal](../../../README.md)

# Estándares de Ingeniería de Software y Guía de Desarrollo Verde

**Nombre del Proyecto:** EcoLogCity — Optimizador de Rutas Logísticas para DistriRápido S.A.C.  
**Fecha:** 2026-11-13  
**Versión:** V_1_0_0  
**Documento relacionado:** [01 Informe de reducción del impacto ambiental V_1_0_0](./01%20Informe%20de%20reduccion%20del%20impacto%20ambiental%20V_1_0_0.md)  
**Líder del Proyecto:** Albornoz Peña Jeferson Bener  

## 1. Estándares de referencia

### ISO/IEC 25010 — Calidad del producto de software
- **Eficiencia de desempeño:** comportamiento temporal (menos bytes y scripts sin bloqueo), utilización de recursos (proyección de columnas, índices, menos CPU en el navegador) y capacidad (paginación con límite máximo).
- **Mantenibilidad:** la paleta de marca vive en un único archivo de configuración (`tailwind.config.js`) y las columnas del listado en una constante (`COLUMNAS_LISTADO`).
- **Compatibilidad:** la paginación es opcional y no rompe a los clientes actuales de `GET /api/v1/pedidos`.

### Green Software Foundation — principios
- **Eficiencia de carbono y de energía:** hacer el mismo trabajo con menos cómputo y menos transferencia.
- **Eficiencia de hardware:** quitar el compilador de Tailwind del navegador alivia a los equipos de gama baja de los despachadores.
- **Medición:** las emisiones se estiman con SWDM v4 mediante `@tgwf/co2`, no con factores escritos a mano.

### W3C Web Sustainability Guidelines (WSG)
Las WSG son un borrador del W3C Sustainable Web Interest Group. Se citan por área temática, no por número de pauta, porque la numeración cambia entre borradores.
- **Desarrollo web:** eliminar código no usado, comprimir recursos, cachear, cargar scripts sin bloquear.
- **Infraestructura y sistemas:** compresión en el servidor y cabeceras de caché adecuadas.
- **Experiencia de usuario:** no cargar más datos de los que la vista necesita.

## 2. Matriz: optimización ↔ estándar

| # | Optimización en EcoLogCity | ISO/IEC 25010 | Principio GSF | Área WSG |
|---|---|---|---|---|
| 1 | Tailwind compilado en lugar del Play CDN | Eficiencia — utilización de recursos | Eficiencia de energía y de hardware | Desarrollo web: eliminar código no usado |
| 2 | Compresión Brotli/Gzip (`compression`) | Eficiencia — comportamiento temporal | Eficiencia de carbono | Infraestructura: compresión |
| 3 | `Cache-Control` + ETag fuerte (304) | Eficiencia — comportamiento temporal | Eficiencia de energía | Desarrollo web: estrategia de caché |
| 4 | `defer` y `preconnect` | Eficiencia — comportamiento temporal | Eficiencia de hardware | Desarrollo web: carga no bloqueante |
| 5 | Proyección de columnas SQL | Eficiencia — utilización de recursos | Eficiencia de energía | UX: transferir solo lo necesario |
| 6 | Índices (migración 003) | Eficiencia — utilización de recursos | Eficiencia de energía | Infraestructura: consultas eficientes |
| 7 | Paginación opcional con límite 200 | Eficiencia — capacidad | Eficiencia de carbono | UX: transferir solo lo necesario |
| 8 | Caché del trazado OSRM | Eficiencia — comportamiento temporal | Eficiencia de carbono | Desarrollo web: evitar peticiones redundantes |

## 3. Normas obligatorias para nuevos cambios

### Backend (Node.js / Express / PostgreSQL)
1. Prohibido `SELECT *` en listados: declarar las columnas que consume la vista.
2. Todo endpoint de listado nuevo debe aceptar `page`/`limit` y acotar `limit` con un máximo.
3. Toda consulta nueva con `WHERE`/`ORDER BY` sobre tablas que crecen (`pedidos`) debe revisarse con `EXPLAIN` y, si corresponde, añadir un índice en una migración numerada e idempotente.
4. No desactivar el middleware `compression` ni las cabeceras de caché de `app.js`.

### Frontend (HTML + JS + Tailwind + Leaflet)
1. No volver a usar `cdn.tailwindcss.com`. Las clases nuevas requieren `npm --prefix frontend run build:css`, y el `tailwind.css` resultante se versiona.
2. No construir nombres de clase Tailwind con interpolación (`bg-${x}-500`), porque la compilación no los detecta. Escribir el nombre completo.
3. Todo `<script>` externo o propio va con `defer`, salvo que lo use un script inline posterior.
4. Las imágenes que se agreguen a la interfaz se publican en WebP/AVIF con `width`/`height` y `loading="lazy"` si están fuera de la primera pantalla.
5. Las llamadas a servicios externos (OSRM, Nominatim) deben reutilizar una caché en memoria, como `trazadoRuta()`.
6. Antes de añadir una librería, revisar su peso (por ejemplo en bundlephobia.com) y justificarla en el PR.

## 4. Verificación continua (propuesta para CI)

Paso sugerido para el workflow de GitHub Actions existente; aún no se ha implementado:

```yaml
- name: Verificar que el CSS compilado está al día
  run: |
    npm --prefix frontend ci
    npm --prefix frontend run build:css
    git diff --exit-code frontend/public/tailwind.css
```

Cuando haya un entorno con Chrome disponible en CI, se puede añadir Lighthouse CI (`@lhci/cli`) con un presupuesto de peso por página, que falle el build si `index.html` supera 100 KB transferidos.
