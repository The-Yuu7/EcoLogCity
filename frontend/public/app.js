// ==============================================================================
// EcoLogCity - Lógica del Cliente Frontend
// DistriRápido S.A.C. · Huancayo, Junín
// ==============================================================================

// API_BASE, apiFetch y la sesión del usuario vienen de session.js

// Coordenadas base de Huancayo (Cercado y Almacén Central DistriRápido)
const HUANCAYO_CENTER = [-12.0678, -75.2098];
const DEPOT_COORDS = [-12.0620, -75.2210];

let map = null;
let currentMarker = null;
let ordersLayerGroup = null;
let tileLayerOSM = null;
let tileLayerSat = null;
let todosLosPedidos = [];

// Sin sesión no se carga el panel: se redirige al inicio de sesión (US-007)
if (!obtenerSesion()) window.location.replace('login.html');

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
  const sesion = obtenerSesion();
  if (!sesion) return;
  aplicarPermisosDeRol(sesion.usuario);
  activarVisoresDeContrasena();

  initMap();
  cargarEstadisticas();
  cargarPedidos();

  // Navegación por módulos (Dashboard, Pedidos y Rutas, Gestión de Flota, Usuarios)
  document.querySelectorAll('[data-modulo]').forEach(tab => {
    tab.addEventListener('click', () => mostrarModulo(tab.dataset.modulo));
  });
  window.addEventListener('hashchange', () => mostrarModulo(location.hash.slice(1)));
  mostrarModulo(location.hash.slice(1));

  // Eventos de botones principales
  document.getElementById('btn-geocodificar').addEventListener('click', geocodificarDireccionActual);
  document.getElementById('form-pedido').addEventListener('submit', guardarNuevoPedido);
  
  document.getElementById('btn-centrar-huancayo').addEventListener('click', () => {
    map.setView(HUANCAYO_CENTER, 14);
  });

  document.getElementById('btn-refrescar').addEventListener('click', () => {
    cargarEstadisticas();
    cargarPedidos();
  });

  // Capas del mapa
  document.getElementById('btn-capa-calles').addEventListener('click', () => {
    if (map.hasLayer(tileLayerSat)) map.removeLayer(tileLayerSat);
    if (!map.hasLayer(tileLayerOSM)) map.addLayer(tileLayerOSM);
    document.getElementById('btn-capa-calles').className = 'text-xs bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-1.5 rounded-lg font-semibold transition';
    document.getElementById('btn-capa-satelite').className = 'text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg font-medium transition';
  });

  document.getElementById('btn-capa-satelite').addEventListener('click', () => {
    if (map.hasLayer(tileLayerOSM)) map.removeLayer(tileLayerOSM);
    if (!map.hasLayer(tileLayerSat)) map.addLayer(tileLayerSat);
    document.getElementById('btn-capa-satelite').className = 'text-xs bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-1.5 rounded-lg font-semibold transition';
    document.getElementById('btn-capa-calles').className = 'text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg font-medium transition';
  });

  // Buscador en tiempo real y Filtro por Distrito
  document.getElementById('input-buscar').addEventListener('input', filtrarYRenderizarTabla);
  document.getElementById('filtro-distrito').addEventListener('change', filtrarYRenderizarTabla);

  // Registro de vehículos y usuarios (solo administrador)
  document.getElementById('form-vehiculo').addEventListener('submit', registrarVehiculo);
  document.getElementById('form-usuario').addEventListener('submit', registrarUsuario);

  document.getElementById('btn-cerrar-sesion').addEventListener('click', cerrarSesion);

  // Exportar a CSV
  document.getElementById('btn-exportar-csv').addEventListener('click', exportarPedidosCSV);
});

const MODULOS = ['dashboard', 'pedidos', 'flota', 'usuarios'];
const MODULOS_SOLO_ADMIN = ['usuarios'];

/**
 * Muestra un módulo y oculta los demás. Un módulo desconocido o sin permiso abre el Dashboard.
 */
function mostrarModulo(nombre) {
  if (!MODULOS.includes(nombre) || (MODULOS_SOLO_ADMIN.includes(nombre) && !esAdmin())) {
    nombre = 'dashboard';
  }
  if (location.hash.slice(1) !== nombre) history.replaceState(null, '', `#${nombre}`);

  document.querySelectorAll('[data-modulo-panel]').forEach(panel => {
    panel.classList.toggle('hidden', panel.id !== `modulo-${nombre}`);
  });
  document.querySelectorAll('[data-modulo]').forEach(tab => {
    tab.setAttribute('aria-selected', String(tab.dataset.modulo === nombre));
  });

  // Leaflet calcula mal su tamaño si el mapa se creó estando oculto
  if (nombre === 'pedidos' && map) setTimeout(() => map.invalidateSize(), 0);
  if (nombre === 'flota') cargarFlota();
  if (nombre === 'usuarios') cargarUsuarios();
}

const escaparHtml = (texto) => String(texto ?? '').replace(/[&<>"']/g, c => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

/**
 * Muestra el usuario en sesión y ajusta la interfaz según su rol:
 * el ADMIN ve el directorio general, el motor de rutas y la gestión de flota;
 * el USUARIO ve solo sus pedidos y la flota en modo lectura.
 */
function aplicarPermisosDeRol(usuario) {
  const admin = usuario.rol === 'ADMIN';
  document.getElementById('sesion-nombre').textContent = usuario.nombre;

  const rolBadge = document.getElementById('sesion-rol');
  rolBadge.textContent = admin ? 'Admin' : 'Usuario';
  rolBadge.className += admin
    ? ' bg-amber-500/20 text-amber-300 border border-amber-500/40'
    : ' bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';

  document.querySelectorAll('[data-solo-admin]').forEach(el => el.classList.toggle('hidden', !admin));

  if (admin) {
    document.getElementById('titulo-directorio').textContent = '📋 Directorio General de Pedidos';
    document.getElementById('subtitulo-directorio').textContent = 'Pedidos registrados por todos los usuarios, listos para el motor de optimización';
  }
}

/**
 * Inicializa el mapa Leaflet centrado en Huancayo con capas y almacén
 */
function initMap() {
  map = L.map('map').setView(HUANCAYO_CENTER, 14);

  // Capa Base OpenStreetMap
  tileLayerOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors | EcoLogCity'
  }).addTo(map);

  // Capa Satélite (Esri World Imagery)
  tileLayerSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 18,
    attribution: 'Tiles © Esri | EcoLogCity'
  });

  ordersLayerGroup = L.layerGroup().addTo(map);

  // Polígonos de Cobertura de Distritos Clave en Huancayo
  dibujarZonasDeCobertura();

  // Marcador Almacén Central DistriRápido S.A.C.
  const depotIcon = L.divIcon({
    className: 'custom-depot-icon',
    html: `
      <div style="background: linear-gradient(135deg, #1d4ed8, #2563eb); color: white; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 4px 10px rgba(37,99,235,0.5); border: 2.5px solid white;">
        🏢
      </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });

  L.marker(DEPOT_COORDS, { icon: depotIcon })
    .addTo(map)
    .bindPopup(`
      <div style="font-family: inherit; padding: 4px;">
        <span style="background: #dbeafe; color: #1e40af; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">HUB LOGÍSTICO</span>
        <h4 style="font-weight: bold; font-size: 13px; margin: 4px 0 2px 0; color: #0f172a;">Almacén Central DistriRápido S.A.C.</h4>
        <p style="font-size: 11px; color: #64748b; margin: 0;">Punto de salida y retorno de flota (Depot VRPTW)</p>
        <p style="font-size: 11px; font-weight: bold; color: #2563eb; margin-top: 4px;">📍 Huancayo Cercado (3,250 msnm)</p>
      </div>
    `);

  // Marcador Draggable para nuevo pedido
  const pinIcon = L.divIcon({
    className: 'custom-pulse-pin',
    html: `
      <div style="background: #ef4444; color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 13px; box-shadow: 0 4px 8px rgba(239,68,68,0.4); border: 2px solid white;">
        📍
      </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28]
  });

  currentMarker = L.marker(HUANCAYO_CENTER, {
    draggable: true,
    icon: pinIcon
  }).addTo(map);

  currentMarker.bindPopup(`
    <div style="font-size: 11px; font-family: inherit;">
      <b>Punto Seleccionado para Registro</b><br>
      Puedes arrastrar este marcador en el mapa para ajustar la dirección exacta.
    </div>
  `).openPopup();

  // Actualizar inputs al arrastrar el marcador
  currentMarker.on('dragend', function (e) {
    const pos = e.target.getLatLng();
    actualizarCamposCoordenadas(pos.lat, pos.lng);
  });

  // Al hacer clic en el mapa, reubicar el marcador
  map.on('click', function (e) {
    currentMarker.setLatLng(e.latlng);
    actualizarCamposCoordenadas(e.latlng.lat, e.latlng.lng);
  });

  // Coordenadas iniciales
  actualizarCamposCoordenadas(HUANCAYO_CENTER[0], HUANCAYO_CENTER[1]);
}

/**
 * Dibuja zonas sutiles de cobertura en Huancayo
 */
function dibujarZonasDeCobertura() {
  const zonas = [
    { name: 'Huancayo Cercado', color: '#10b981', bounds: [[-12.0800, -75.2200], [-12.0550, -75.1950]] },
    { name: 'El Tambo', color: '#3b82f6', bounds: [[-12.0600, -75.2400], [-12.0300, -75.2100]] },
    { name: 'Chilca', color: '#f59e0b', bounds: [[-12.1000, -75.2250], [-12.0750, -75.1900]] }
  ];

  zonas.forEach(z => {
    L.rectangle(z.bounds, {
      color: z.color,
      weight: 1,
      dashArray: '4, 4',
      fillOpacity: 0.05
    }).addTo(map).bindTooltip(z.name, { permanent: false, direction: 'center' });
  });
}

function actualizarCamposCoordenadas(lat, lng) {
  document.getElementById('latitud').value = lat.toFixed(6);
  document.getElementById('longitud').value = lng.toFixed(6);
}

/**
 * Consulta el endpoint de geocodificación (US-001)
 */
async function geocodificarDireccionActual() {
  const direccion = document.getElementById('direccion_texto').value.trim();
  const distrito = document.getElementById('distrito').value;
  const alertEl = document.getElementById('geocod-alert');
  const sugsEl = document.getElementById('geocod-sugerencias');
  const spinner = document.getElementById('spinner-geo');

  if (!direccion) {
    mostrarAlerta('⚠️ Por favor ingrese una dirección antes de ubicar.', 'warning');
    return;
  }

  spinner.classList.remove('hidden');
  mostrarAlerta('🔍 Consultando OpenStreetMap en Huancayo...', 'info');
  sugsEl.classList.add('hidden');
  sugsEl.innerHTML = '';

  try {
    const res = await apiFetch(`${API_BASE}/geocodificar?direccion=${encodeURIComponent(direccion)}&distrito=${encodeURIComponent(distrito)}`);
    const json = await res.json();

    if (!json.ok) {
      mostrarAlerta(`❌ ${json.error || 'No se pudo geocodificar la dirección.'}`, 'error');
      return;
    }

    const data = json.data;
    const lat = data.latitud;
    const lon = data.longitud;

    // Actualizar mapa y campos
    currentMarker.setLatLng([lat, lon]);
    map.setView([lat, lon], 16);
    actualizarCamposCoordenadas(lat, lon);

    if (data.requiere_seleccion_manual && data.sugerencias && data.sugerencias.length > 0) {
      mostrarAlerta(`⚠️ ${data.mensaje || 'Múltiples coincidencias. Selecciona una opción o arrastra el marcador.'}`, 'warning');
      sugsEl.classList.remove('hidden');
      sugsEl.innerHTML = '<p class="text-[11px] font-semibold text-slate-700 mb-1">Coincidencias encontradas:</p>';
      
      data.sugerencias.forEach((sug, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'w-full text-left p-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 rounded-lg text-xs text-slate-700 transition border border-slate-200 block truncate font-medium';
        btn.textContent = `${i + 1}. ${sug.display_name}`;
        btn.onclick = () => {
          currentMarker.setLatLng([sug.lat, sug.lon]);
          map.setView([sug.lat, sug.lon], 16);
          actualizarCamposCoordenadas(sug.lat, sug.lon);
          mostrarAlerta(`✅ Ubicación fijada: ${sug.display_name.slice(0, 50)}...`, 'success');
        };
        sugsEl.appendChild(btn);
      });
    } else {
      mostrarAlerta(`✅ Dirección geocodificada con éxito: ${data.direccion_formateada.slice(0, 60)}...`, 'success');
    }

  } catch (err) {
    mostrarAlerta('❌ Error de comunicación con el servicio de mapas.', 'error');
  } finally {
    spinner.classList.add('hidden');
  }
}

function mostrarAlerta(mensaje, tipo = 'info') {
  const alertEl = document.getElementById('geocod-alert');
  alertEl.classList.remove('hidden', 'bg-emerald-50', 'text-emerald-800', 'bg-amber-50', 'text-amber-800', 'bg-red-50', 'text-red-800', 'bg-blue-50', 'text-blue-800');

  if (tipo === 'success') {
    alertEl.className = 'p-2.5 rounded-lg text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium';
  } else if (tipo === 'warning') {
    alertEl.className = 'p-2.5 rounded-lg text-xs bg-amber-50 text-amber-800 border border-amber-200 font-medium';
  } else if (tipo === 'error') {
    alertEl.className = 'p-2.5 rounded-lg text-xs bg-red-50 text-red-800 border border-red-200 font-medium';
  } else {
    alertEl.className = 'p-2.5 rounded-lg text-xs bg-blue-50 text-blue-800 border border-blue-200 font-medium';
  }

  alertEl.innerHTML = mensaje;
}

/**
 * Guarda un nuevo pedido en PostgreSQL
 */
async function guardarNuevoPedido(e) {
  e.preventDefault();

  const ventanaInicio = document.getElementById('ventana_inicio').value;
  const ventanaFin = document.getElementById('ventana_fin').value;

  if (ventanaFin <= ventanaInicio) {
    alert('La hora de fin debe ser posterior a la hora de inicio.');
    return;
  }

  const payload = {
    cliente_nombre: document.getElementById('cliente_nombre').value.trim(),
    cliente_telefono: document.getElementById('cliente_telefono').value.trim() || undefined,
    distrito: document.getElementById('distrito').value,
    direccion_texto: document.getElementById('direccion_texto').value.trim(),
    referencia: document.getElementById('referencia').value.trim() || undefined,
    latitud: parseFloat(document.getElementById('latitud').value),
    longitud: parseFloat(document.getElementById('longitud').value),
    ventana_inicio: ventanaInicio,
    ventana_fin: ventanaFin,
    peso_kg: parseFloat(document.getElementById('peso_kg').value),
    volumen_m3: parseFloat(document.getElementById('volumen_m3').value),
    prioridad: parseInt(document.getElementById('prioridad').value, 10),
  };

  const btnSubmit = document.getElementById('btn-submit');
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = '<span>⏳ Guardando pedido...</span>';

  try {
    const res = await apiFetch(`${API_BASE}/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (!json.ok) {
      alert(`Error al registrar pedido: ${json.error}`);
      return;
    }

    alert(`🎉 ¡Pedido registrado exitosamente en Huancayo!\nCódigo: ${json.data.codigo_seguimiento}`);
    
    // Limpiar formulario y resetear
    document.getElementById('form-pedido').reset();
    document.getElementById('ventana_inicio').value = '08:30';
    document.getElementById('ventana_fin').value = '11:30';
    document.getElementById('peso_kg').value = '25.0';
    document.getElementById('volumen_m3').value = '0.20';
    document.getElementById('geocod-alert').classList.add('hidden');
    document.getElementById('geocod-sugerencias').classList.add('hidden');
    actualizarCamposCoordenadas(HUANCAYO_CENTER[0], HUANCAYO_CENTER[1]);

    cargarEstadisticas();
    cargarPedidos();

  } catch (err) {
    alert('Error al conectar con la API de EcoLogCity');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = '<span>💾 Guardar Pedido</span>';
  }
}

/**
 * Carga estadísticas y métricas ecológicas (Green VRP)
 */
async function cargarEstadisticas() {
  try {
    const [resStats, resFlota] = await Promise.all([
      apiFetch(`${API_BASE}/pedidos/stats`),
      apiFetch(`${API_BASE}/vehiculos`),
    ]);
    const json = await resStats.json();
    const flota = (await resFlota.json()).data || [];

    if (json.ok && json.data) {
      const d = json.data;
      const total = parseInt(d.total_pedidos || 0, 10);
      const pesoTotal = parseFloat(d.peso_total_kg || 0);

      document.getElementById('kpi-total').textContent = total;
      document.getElementById('kpi-pendientes').textContent = `${d.pendientes_planificar || 0} pendientes`;
      document.getElementById('kpi-peso').textContent = `${pesoTotal.toFixed(1)} kg`;

      // Ocupación sobre la capacidad total de la flota activa (US-008)
      const capacidadFlota = flota.reduce((acc, v) => acc + parseFloat(v.capacidad_peso_kg), 0);
      const porcentaje = capacidadFlota > 0 ? Math.min(100, Math.round((pesoTotal / capacidadFlota) * 100)) : 0;
      document.getElementById('kpi-capacidad-flota').textContent =
        `Flota activa: ${flota.length} ${flota.length === 1 ? 'vehículo' : 'vehículos'} (${capacidadFlota.toLocaleString('es-PE')} kg)`;
      document.getElementById('kpi-porcentaje-carga').textContent = `${porcentaje}%`;
      document.getElementById('kpi-progress-bar').style.width = `${porcentaje}%`;

      // Estimación Green VRP preliminar (basada en coeficientes de la consigna)
      // Huancayo: ~4.5 km por parada promedio en reparto urbano
      const consumoGalKm = flota.length > 0
        ? flota.reduce((acc, v) => acc + parseFloat(v.consumo_gal_km), 0) / flota.length
        : 0.12; // consumo promedio de la flota activa
      const distanciaEstKm = total > 0 ? Math.max(12, total * 4.5) : 0;
      const co2Kg = (distanciaEstKm * 2.68 * consumoGalKm).toFixed(1); // factor diésel
      const arboles = co2Kg > 0 ? Math.ceil(parseFloat(co2Kg) / 22) : 0; // 1 árbol absorbe ~22 kg CO2/año
      const costoDiésel = ((distanciaEstKm * consumoGalKm) * 17.50).toFixed(2); // S/ 17.50/galón
      const ahorroSoles = (costoDiésel * 0.15).toFixed(2); // 15% meta

      document.getElementById('kpi-co2-base').textContent = `${co2Kg} kg`;
      document.getElementById('kpi-arboles').textContent = arboles;
      document.getElementById('kpi-costo-combustible').textContent = `S/ ${costoDiésel}`;
      document.getElementById('kpi-ahorro-soles').textContent = `~S/ ${ahorroSoles} (15%)`;
    }
    renderizarResumenFlota(flota);
  } catch (e) {
    console.error('Error cargando KPIs:', e);
  }
}

/**
 * Resumen de la flota activa para el Dashboard
 */
function renderizarResumenFlota(flota) {
  const suma = (campo) => flota.reduce((acc, v) => acc + parseFloat(v[campo]), 0);
  const gnv = flota.filter(v => v.tipo_combustible === 'GNV').length;
  const filas = [
    ['Vehículos activos', flota.length],
    ['Capacidad total', `${suma('capacidad_peso_kg').toLocaleString('es-PE')} kg`],
    ['Volumen total', `${suma('capacidad_volumen_m3').toFixed(1)} m³`],
    ['Diésel / GNV', `${flota.length - gnv} / ${gnv}`],
  ];
  document.getElementById('resumen-flota').innerHTML = filas.map(([etiqueta, valor]) => `
    <div class="flex justify-between border-b border-slate-100 pb-2 last:border-0">
      <dt class="text-slate-500">${etiqueta}</dt>
      <dd class="font-semibold text-slate-900">${valor}</dd>
    </div>`).join('');
}

/**
 * Barras horizontales de conteo (pedidos por estado y por distrito) para el Dashboard
 */
function renderizarBarras(contenedorId, conteos, colorBarra) {
  const contenedor = document.getElementById(contenedorId);
  const entradas = Object.entries(conteos).sort((a, b) => b[1] - a[1]);
  if (entradas.length === 0) {
    contenedor.innerHTML = '<p class="text-slate-400">Sin pedidos registrados.</p>';
    return;
  }
  const maximo = entradas[0][1];
  contenedor.innerHTML = entradas.map(([etiqueta, cantidad]) => `
    <div>
      <div class="flex justify-between mb-1">
        <span class="text-slate-600">${escaparHtml(etiqueta.replace('_', ' '))}</span>
        <span class="font-semibold text-slate-900">${cantidad}</span>
      </div>
      <div class="w-full bg-slate-100 rounded-full h-1.5">
        <div class="${colorBarra} h-1.5 rounded-full" style="width: ${Math.round((cantidad / maximo) * 100)}%"></div>
      </div>
    </div>`).join('');
}

function renderizarResumenPedidos(pedidos) {
  const contar = (clave, lista) => lista.reduce((acc, p) => ({ ...acc, [p[clave]]: (acc[p[clave]] || 0) + 1 }), {});
  renderizarBarras('resumen-estados', contar('estado', pedidos), 'bg-indigo-500');
  renderizarBarras('resumen-distritos', contar('distrito', pedidos.filter(p => p.estado !== 'CANCELADO')), 'bg-emerald-500');
}

/**
 * Carga pedidos de PostgreSQL y los pinta en el mapa y la tabla
 */
async function cargarPedidos() {
  const tbody = document.getElementById('pedidos-tbody');
  tbody.innerHTML = `<tr><td colspan="${columnasTabla()}" class="text-center py-8 text-slate-400">Actualizando paradas...</td></tr>`;

  try {
    const res = await apiFetch(`${API_BASE}/pedidos`);
    const json = await res.json();

    if (!json.ok) {
      tbody.innerHTML = `<tr><td colspan="${columnasTabla()}" class="text-center py-8 text-red-500 font-semibold">Error al cargar pedidos</td></tr>`;
      return;
    }

    todosLosPedidos = json.data || [];
    renderizarMarcadoresEnMapa(todosLosPedidos);
    filtrarYRenderizarTabla();
    renderizarResumenPedidos(todosLosPedidos);

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="${columnasTabla()}" class="text-center py-8 text-red-500">Error de comunicación con el backend</td></tr>`;
  }
}

/**
 * Pinta los marcadores de pedidos en el mapa Leaflet con colores según prioridad
 */
function renderizarMarcadoresEnMapa(pedidos) {
  ordersLayerGroup.clearLayers();

  pedidos.forEach(p => {
    if (p.estado === 'CANCELADO') return;

    // Color según nivel de prioridad
    let pinColor = '#059669'; // Normal
    let pinBorder = 'white';
    if (p.prioridad >= 5) pinColor = '#dc2626'; // Crítico / Express
    else if (p.prioridad >= 4) pinColor = '#ea580c'; // Alto
    else if (p.prioridad === 3) pinColor = '#0284c7'; // Medio

    const orderIcon = L.divIcon({
      className: 'custom-order-icon',
      html: `
        <div style="background-color: ${pinColor}; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; border: 2px solid ${pinBorder}; box-shadow: 0 2px 5px rgba(0,0,0,0.35);">
          ${p.prioridad}
        </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const m = L.marker([p.latitud, p.longitud], { icon: orderIcon }).addTo(ordersLayerGroup);
    m.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; min-width: 190px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span style="font-size: 10px; font-weight: bold; background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px;">${p.codigo_seguimiento}</span>
          <span style="font-size: 10px; font-weight: bold; color: ${pinColor};">Prioridad ${p.prioridad}</span>
        </div>
        <b style="color: #0f172a; font-size: 13px;">${p.cliente_nombre}</b>
        <div style="color: #475569; margin: 4px 0 2px 0;">📍 ${p.direccion_texto}</div>
        <div style="color: #059669; font-weight: 600; font-size: 11px;">🏛️ ${p.distrito}</div>
        ${p.referencia ? `<div style="font-style: italic; color: #64748b; font-size: 11px;">Ref: ${p.referencia}</div>` : ''}
        <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; font-size: 11px;">
          <span>🕒 <b>${p.ventana_inicio.slice(0, 5)} - ${p.ventana_fin.slice(0, 5)}</b></span>
          <span>⚖️ <b>${p.peso_kg} kg</b></span>
        </div>
      </div>
    `);
  });
}

// El directorio general del administrador tiene la columna "Registrado por"
const columnasTabla = () => (esAdmin() ? 10 : 9);

const ESTILOS_ESTADO = {
  REGISTRADO: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  PLANIFICADO: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  EN_RUTA: 'bg-sky-50 text-sky-800 border-sky-200',
  ENTREGADO: 'bg-slate-100 text-slate-700 border-slate-300',
  CANCELADO: 'bg-red-50 text-red-700 border-red-200',
};

/**
 * Filtra los pedidos en vivo por texto y distrito y los pinta en la tabla
 */
function filtrarYRenderizarTabla() {
  const query = document.getElementById('input-buscar').value.toLowerCase().trim();
  const distritoFiltro = document.getElementById('filtro-distrito').value;
  const tbody = document.getElementById('pedidos-tbody');

  const filtrados = todosLosPedidos.filter(p => {
    const matchDistrito = distritoFiltro === 'TODOS' || p.distrito === distritoFiltro;
    const matchQuery = !query || 
      p.cliente_nombre.toLowerCase().includes(query) ||
      p.direccion_texto.toLowerCase().includes(query) ||
      p.codigo_seguimiento.toLowerCase().includes(query);
    return matchDistrito && matchQuery;
  });

  document.getElementById('badge-contador-pedidos').textContent = filtrados.length;

  if (filtrados.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${columnasTabla()}" class="text-center py-8 text-slate-400">No se encontraron pedidos con esos filtros.</td></tr>`;
    return;
  }

  tbody.innerHTML = '';

  filtrados.forEach(p => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50/80 transition-colors border-b border-slate-100';

    // Badge de estado
    const estadoBadge = `<span class="${ESTILOS_ESTADO[p.estado] || ESTILOS_ESTADO.REGISTRADO} border px-2 py-0.5 rounded-full text-[10px] font-bold">${p.estado.replace('_', ' ')}</span>`;

    // Badge de prioridad
    let prioridadBadge = '<span class="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">1 Normal</span>';
    if (p.prioridad >= 5) {
      prioridadBadge = '<span class="bg-red-100 text-red-800 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">5 Crítica</span>';
    } else if (p.prioridad >= 4) {
      prioridadBadge = '<span class="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-semibold">4 Alta</span>';
    } else if (p.prioridad === 3) {
      prioridadBadge = '<span class="bg-sky-100 text-sky-800 px-2 py-0.5 rounded text-[10px] font-semibold">3 Media</span>';
    }

    tr.innerHTML = `
      <td class="py-3 px-3.5 font-mono font-semibold text-slate-900 text-xs">${p.codigo_seguimiento}</td>
      <td class="py-3 px-3.5">
        <div class="font-bold text-slate-900 text-xs">${p.cliente_nombre}</div>
        <div class="text-[11px] text-slate-400">${p.cliente_telefono || 'Sin teléfono'}</div>
      </td>
      ${esAdmin() ? `<td class="py-3 px-3.5 text-slate-700">${p.registrado_por || '<span class="text-slate-400 italic">Sin asignar</span>'}</td>` : ''}
      <td class="py-3 px-3.5">
        <div class="text-slate-800 font-medium">${p.direccion_texto}</div>
        <div class="text-[11px] text-emerald-700 font-semibold">${p.distrito}</div>
        ${p.referencia ? `<div class="text-[10px] text-slate-400 italic">Ref: ${p.referencia}</div>` : ''}
      </td>
      <td class="py-3 px-3.5 font-mono text-[11px] text-slate-500">
        <div>${parseFloat(p.latitud).toFixed(5)}</div>
        <div>${parseFloat(p.longitud).toFixed(5)}</div>
      </td>
      <td class="py-3 px-3.5 font-mono text-slate-800 font-medium">
        ${p.ventana_inicio.slice(0, 5)} - ${p.ventana_fin.slice(0, 5)}
      </td>
      <td class="py-3 px-3.5 text-slate-700">
        <span class="font-semibold">${parseFloat(p.peso_kg).toFixed(1)} kg</span>
        <span class="text-slate-400">·</span>
        <span class="text-slate-500">${parseFloat(p.volumen_m3).toFixed(2)} m³</span>
      </td>
      <td class="py-3 px-3.5">${prioridadBadge}</td>
      <td class="py-3 px-3.5">${estadoBadge}</td>
      <td class="py-3 px-3.5 text-right space-x-1.5 whitespace-nowrap">
        <button class="bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-semibold transition"
          onclick="centrarEnMapa(${p.latitud}, ${p.longitud}, '${p.cliente_nombre}')">
          📍 Ver Mapa
        </button>
        ${p.estado !== 'CANCELADO' ? `
          <button class="bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1 rounded-md text-[11px] font-semibold transition"
            onclick="cancelarPedido('${p.id}')">
            ✕
          </button>
        ` : ''}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Centra y hace zoom suave sobre el marcador de un pedido en el mapa
 */
window.centrarEnMapa = async function (lat, lon, nombre) {
  window.scrollTo({ top: 120, behavior: 'smooth' });
  
  if (!map.hasLayer(singleRouteLayerGroup)) {
      singleRouteLayerGroup.addTo(map);
  }
  singleRouteLayerGroup.clearLayers();
  
  // Almacén / Local (Casita)
  const almacenLat = -12.066;
  const almacenLon = -75.204;
  
  const iconCasita = L.divIcon({
      html: '<div style="font-size: 26px; text-shadow: 2px 2px 4px rgba(0,0,0,0.4);">🏠</div>',
      className: 'custom-div-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
  });
  
  L.marker([almacenLat, almacenLon], {icon: iconCasita}).addTo(singleRouteLayerGroup).bindPopup('<b>🏠 Local Comercial (Inicio)</b>').openPopup();
  
  // Fetch OSRM route for single item
  try {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${almacenLon},${almacenLat};${lon},${lat}?overview=full&geometries=geojson`;
      const res = await fetch(osrmUrl);
      const data = await res.json();
      
      if(data.routes && data.routes.length > 0) {
          const geojsonFeature = data.routes[0].geometry;
          L.geoJSON(geojsonFeature, {
              style: { color: '#ef4444', weight: 5, opacity: 0.9, dashArray: '8, 8' }
          }).addTo(singleRouteLayerGroup);
          
          // Ajustar la vista para que se vea toda la ruta
          const bounds = L.latLngBounds([almacenLat, almacenLon], [lat, lon]);
          map.flyToBounds(bounds, { padding: [50, 50], duration: 1.2 });
      } else {
          map.flyTo([lat, lon], 17, { duration: 1.2 });
      }
  } catch(e) {
      console.warn("Error OSRM", e);
      map.flyTo([lat, lon], 17, { duration: 1.2 });
  }
};

/**
 * Cancela un pedido con confirmación
 */
window.cancelarPedido = async function (id) {
  if (!confirm('¿Desea cancelar este pedido del despacho diario?')) return;

  try {
    const res = await apiFetch(`${API_BASE}/pedidos/${id}/cancelar`, { method: 'PATCH' });
    const json = await res.json();
    if (json.ok) {
      cargarEstadisticas();
      cargarPedidos();
    } else {
      alert(`No se pudo cancelar: ${json.error}`);
    }
  } catch (e) {
    alert('Error al cancelar el pedido');
  }
};

/**
 * Carga el módulo de Gestión de Flota (US-008).
 * El administrador ve también los vehículos dados de baja y puede registrar o cambiar su estado.
 */
async function cargarFlota() {
  const lista = document.getElementById('flota-lista');
  const admin = esAdmin();
  lista.innerHTML = '<div class="text-center py-6 text-slate-400 col-span-full">Consultando vehículos de la flota...</div>';

  try {
    const res = await apiFetch(`${API_BASE}/vehiculos${admin ? '?todos=true' : ''}`);
    const json = await res.json();
    const vehiculos = json.data || [];

    if (vehiculos.length === 0) {
      lista.innerHTML = '<div class="text-center py-6 text-slate-400 col-span-full">No hay vehículos registrados en la flota.</div>';
      return;
    }

    lista.innerHTML = '';
    vehiculos.forEach(v => {
      const card = document.createElement('div');
      card.className = `border rounded-xl p-4 flex flex-col justify-between transition ${v.activo
        ? 'bg-slate-50 border-slate-200 hover:border-emerald-300'
        : 'bg-slate-100 border-slate-200 opacity-60'}`;

      const tagCombustible = v.tipo_combustible === 'GNV'
        ? '<span class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">🌱 GNV (Ecológico)</span>'
        : '<span class="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">⛽ Diésel</span>';

      const accionAdmin = admin ? `
        <button class="mt-3 w-full text-[11px] font-semibold px-2.5 py-1.5 rounded-md transition ${v.activo
          ? 'bg-red-50 hover:bg-red-100 text-red-600'
          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'}"
          onclick="cambiarEstadoVehiculo('${v.id}', ${!v.activo})">
          ${v.activo ? 'Dar de baja' : 'Reactivar'}
        </button>` : '';

      card.innerHTML = `
        <div class="flex justify-between items-start mb-2">
          <div>
            <span class="font-mono text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded">${v.placa}</span>
            ${v.activo ? '' : '<span class="ml-1 text-[10px] font-bold text-slate-500">DE BAJA</span>'}
            <h4 class="font-bold text-slate-900 text-sm mt-1">${v.marca} ${v.modelo}</h4>
          </div>
          ${tagCombustible}
        </div>
        <div class="text-xs text-slate-600 space-y-1 mt-2 pt-2 border-t border-slate-200">
          <div class="flex justify-between">
            <span class="text-slate-400">Tipo:</span>
            <span class="font-semibold text-slate-800">${v.tipo_vehiculo.replace('_', ' ')}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Capacidad Máxima:</span>
            <span class="font-semibold text-slate-800">${parseFloat(v.capacidad_peso_kg).toFixed(0)} kg / ${parseFloat(v.capacidad_volumen_m3).toFixed(1)} m³</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Rendimiento:</span>
            <span class="font-semibold text-slate-800">${v.consumo_gal_km} gal/km</span>
          </div>
        </div>
        ${accionAdmin}
      `;
      lista.appendChild(card);
    });

  } catch (err) {
    lista.innerHTML = '<div class="text-center py-6 text-red-500 col-span-full">Error al cargar la flota de vehículos.</div>';
  }
}

/**
 * Registra un vehículo nuevo en la flota (solo administrador)
 */
async function registrarVehiculo(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-guardar-vehiculo');
  btn.disabled = true;

  const payload = {
    placa: document.getElementById('v-placa').value.trim(),
    marca: document.getElementById('v-marca').value.trim(),
    modelo: document.getElementById('v-modelo').value.trim(),
    tipo_vehiculo: document.getElementById('v-tipo').value,
    capacidad_peso_kg: parseFloat(document.getElementById('v-peso').value),
    capacidad_volumen_m3: parseFloat(document.getElementById('v-volumen').value),
    consumo_gal_km: parseFloat(document.getElementById('v-consumo').value),
    tipo_combustible: document.getElementById('v-combustible').value,
  };

  try {
    const res = await apiFetch(`${API_BASE}/vehiculos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.ok) {
      const detalle = json.detalles ? `\n${json.detalles.map(d => `• ${d.mensaje}`).join('\n')}` : '';
      alert(`No se pudo registrar el vehículo: ${json.error}${detalle}`);
      return;
    }
    document.getElementById('form-vehiculo').reset();
    document.getElementById('v-consumo').value = '0.12';
    await cargarFlota();
    cargarEstadisticas();
  } catch (err) {
    alert('Error al registrar el vehículo');
  } finally {
    btn.disabled = false;
  }
}

/**
 * Da de baja o reactiva un vehículo (solo administrador)
 */
window.cambiarEstadoVehiculo = async function (id, activo) {
  if (!activo && !confirm('¿Dar de baja este vehículo? Dejará de usarse en la optimización de rutas.')) return;

  try {
    const res = await apiFetch(`${API_BASE}/vehiculos/${id}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo }),
    });
    const json = await res.json();
    if (!json.ok) {
      alert(`No se pudo actualizar el vehículo: ${json.error}`);
      return;
    }
    await cargarFlota();
    cargarEstadisticas();
  } catch (err) {
    alert('Error al actualizar el vehículo');
  }
};

/**
 * Carga el módulo de Usuarios (US-010, solo administrador)
 */
async function cargarUsuarios() {
  const tbody = document.getElementById('usuarios-tbody');
  const miId = obtenerSesion().usuario.id;
  tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-slate-400">Cargando usuarios...</td></tr>';

  try {
    const res = await apiFetch(`${API_BASE}/usuarios`);
    const json = await res.json();
    if (!json.ok) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-red-500">${escaparHtml(json.error)}</td></tr>`;
      return;
    }
    if (json.data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-slate-400">No hay usuarios registrados.</td></tr>';
      return;
    }

    tbody.innerHTML = json.data.map(u => {
      const esYo = u.id === miId;
      const rolBadge = u.rol === 'ADMIN'
        ? '<span class="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-bold">ADMIN</span>'
        : '<span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">USUARIO</span>';
      const estadoBadge = u.activo
        ? '<span class="text-emerald-700 font-semibold">Activo</span>'
        : '<span class="text-slate-400 font-semibold">Inactivo</span>';
      const acciones = esYo
        ? '<span class="text-[11px] text-slate-400 italic">Su cuenta</span>'
        : `<button class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-semibold transition"
             onclick="actualizarUsuario('${u.id}', { rol: '${u.rol === 'ADMIN' ? 'USUARIO' : 'ADMIN'}' })">
             ${u.rol === 'ADMIN' ? 'Hacer usuario' : 'Hacer admin'}
           </button>
           <button class="${u.activo ? 'bg-red-50 hover:bg-red-100 text-red-600' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'} px-2.5 py-1 rounded-md text-[11px] font-semibold transition"
             onclick="actualizarUsuario('${u.id}', { activo: ${!u.activo} })">
             ${u.activo ? 'Desactivar' : 'Activar'}
           </button>`;
      return `
        <tr class="hover:bg-slate-50/80 ${u.activo ? '' : 'opacity-60'}">
          <td class="py-3 px-3.5 font-bold text-slate-900">${escaparHtml(u.nombre_completo)}</td>
          <td class="py-3 px-3.5">${escaparHtml(u.email)}</td>
          <td class="py-3 px-3.5">${rolBadge}</td>
          <td class="py-3 px-3.5 font-mono">${u.pedidos_registrados}</td>
          <td class="py-3 px-3.5">${estadoBadge}</td>
          <td class="py-3 px-3.5 text-right space-x-1.5 whitespace-nowrap">${acciones}</td>
        </tr>`;
    }).join('');
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-red-500">Error al cargar los usuarios.</td></tr>';
  }
}

async function registrarUsuario(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-guardar-usuario');
  btn.disabled = true;

  try {
    const res = await apiFetch(`${API_BASE}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_completo: document.getElementById('u-nombre').value.trim(),
        email: document.getElementById('u-email').value.trim(),
        password: document.getElementById('u-password').value,
        rol: document.getElementById('u-rol').value,
      }),
    });
    const json = await res.json();
    if (!json.ok) {
      const detalle = json.detalles ? `\n${json.detalles.map(d => `• ${d.mensaje}`).join('\n')}` : '';
      alert(`No se pudo registrar el usuario: ${json.error}${detalle}`);
      return;
    }
    document.getElementById('form-usuario').reset();
    await cargarUsuarios();
  } catch (err) {
    alert('Error al registrar el usuario');
  } finally {
    btn.disabled = false;
  }
}

window.actualizarUsuario = async function (id, cambios) {
  if (cambios.activo === false && !confirm('¿Desactivar esta cuenta? La persona ya no podrá iniciar sesión.')) return;

  try {
    const res = await apiFetch(`${API_BASE}/usuarios/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cambios),
    });
    const json = await res.json();
    if (!json.ok) {
      alert(`No se pudo actualizar el usuario: ${json.error}`);
      return;
    }
    await cargarUsuarios();
  } catch (err) {
    alert('Error al actualizar el usuario');
  }
};

/**
 * Exporta los pedidos actuales a formato CSV descargable
 */
function exportarPedidosCSV() {
  if (!todosLosPedidos || todosLosPedidos.length === 0) {
    alert('No hay pedidos registrados para exportar.');
    return;
  }

  const headers = ['Codigo', 'Cliente', 'Telefono', 'Distrito', 'Direccion', 'Latitud', 'Longitud', 'Ventana_Inicio', 'Ventana_Fin', 'Peso_kg', 'Volumen_m3', 'Prioridad', 'Estado'];
  const filas = todosLosPedidos.map(p => [
    p.codigo_seguimiento,
    `"${p.cliente_nombre.replace(/"/g, '""')}"`,
    p.cliente_telefono || '',
    p.distrito,
    `"${p.direccion_texto.replace(/"/g, '""')}"`,
    p.latitud,
    p.longitud,
    p.ventana_inicio,
    p.ventana_fin,
    p.peso_kg,
    p.volumen_m3,
    p.prioridad,
    p.estado
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...filas.map(f => f.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `EcoLogCity_Pedidos_Huancayo_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


// -------------------------------------------------------------
// SPRINT 2: MOTOR VRP & TRAZADO EN LEAFLET (OSRM)
// -------------------------------------------------------------
let vrpLayerGroup = L.layerGroup();
let singleRouteLayerGroup = L.layerGroup();

window.optimizarRutas = async function () {
  if (!map.hasLayer(vrpLayerGroup)) {
      vrpLayerGroup.addTo(map);
  }
  const btn = document.getElementById('btn-optimizar');
  btn.disabled = true;
  btn.innerHTML = '<span class="animate-pulse">Optimizando...</span>';

  try {
    const res = await apiFetch(`${API_BASE}/rutas/optimizar`, { method: 'POST' });
    const json = await res.json();

    if (!json.ok) {
      alert(`Error en Motor VRP: ${json.error}`);
      return;
    }

    const { rutas, resumen, almacen } = json.data;

    // Actualizar Modal de Resumen
    document.getElementById('vrp-dist').innerText = resumen.distancia_total_km;
    document.getElementById('vrp-ahorro').innerText = resumen.ahorro_estimado_km;
    document.getElementById('vrp-co2').innerText = resumen.emisiones_evitadas_kg_co2;
    document.getElementById('vrp-asignados').innerText = resumen.pedidos_asignados;
    document.getElementById('vrp-noasignados').innerText = resumen.pedidos_sin_asignar;
    
    document.getElementById('vrp-modal').classList.remove('hidden');

    // Limpiar rutas previas del mapa
    vrpLayerGroup.clearLayers();
    if(typeof singleRouteLayerGroup !== 'undefined') singleRouteLayerGroup.clearLayers();
    ordersLayerGroup.clearLayers(); // Ocultar puntos sueltos para mostrar las secuencias limpias

    // Paleta de colores para vehiculos (hasta 5 colores)
    const colores = ['#4F46E5', '#E11D48', '#059669', '#D97706', '#9333EA'];

    // Para cada ruta (Vehículo)
    rutas.forEach(async (rutaObj, idx) => {
        const color = colores[idx % colores.length];
        
        // Armar array de coordenadas para OSRM [lon, lat]
        const coordString = [];
        coordString.push(`${almacen.lon},${almacen.lat}`); // Salida
        
        rutaObj.paradas.forEach(p => {
            coordString.push(`${p.lon},${p.lat}`);
            
            // Re-dibujar marcador pero con el color del vehículo
            const m = L.circleMarker([p.lat, p.lon], {
                radius: 8,
                fillColor: color,
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.9
            }).addTo(vrpLayerGroup);
            
            m.bindPopup(`<b>Vehículo:</b> ${rutaObj.vehiculo.placa} <br> <b>Pedido:</b> ${p.codigo}`);
        });

        coordString.push(`${almacen.lon},${almacen.lat}`); // Retorno

        // Dibujar Almacén principal
        const iconCasitaVrp = L.divIcon({
            html: '<div style="font-size: 28px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">🏠</div>',
            className: 'custom-div-icon',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        L.marker([almacen.lat, almacen.lon], {icon: iconCasitaVrp}).addTo(vrpLayerGroup).bindPopup('<b>🏠 Local Central (Inicio)</b><br>DistriRápidoén DistriRápido</b>');

        // Llamar a OSRM Demo API para obtener la polyline real de las calles
        try {
            const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordString.join(';')}?overview=full&geometries=geojson`;
            const osrmRes = await fetch(osrmUrl);
            const osrmData = await osrmRes.json();
            
            if(osrmData.routes && osrmData.routes.length > 0) {
                const geojsonFeature = osrmData.routes[0].geometry;
                L.geoJSON(geojsonFeature, {
                    style: {
                        color: color,
                        weight: 4,
                        opacity: 0.8,
                        dashArray: '10, 5' // Linea punteada de ruta sugerida
                    }
                }).addTo(vrpLayerGroup);
            }
        } catch(e) {
            console.warn("No se pudo conectar a OSRM para trazar las calles, usando fallback de linea recta.");
            // DRAW FALLBACK STRAIGHT LINES
            const latlngs = [];
            latlngs.push([almacen.lat, almacen.lon]);
            rutaObj.paradas.forEach(p => latlngs.push([p.lat, p.lon]));
            latlngs.push([almacen.lat, almacen.lon]);
            L.polyline(latlngs, {color: color, weight: 3, dashArray: '5, 5', opacity: 0.8}).addTo(vrpLayerGroup);
        }
    });

    // Actualizar Tablas para reflejar que estan PLANIFICADOS
    cargarPedidos();
    cargarEstadisticas();

  } catch (err) {
    alert('Error al conectar con el servidor VRP');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        Optimizar Rutas (VRP)
    `;
  }
};
