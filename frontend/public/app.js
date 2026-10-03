// ==============================================================================
// EcoLogCity - Lógica del Cliente Frontend (Sprint 1)
// ==============================================================================

// Detección dinámica de la URL del API (soporta desarrollo local separado, servidor unificado Express y despliegue Cloud)
const API_BASE = window.__API_BASE__ || (
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '8000'
    ? 'http://localhost:8000/api/v1'
    : '/api/v1'
);

// Coordenadas base de Huancayo (Cercado)
const HUANCAYO_CENTER = [-12.0678, -75.2098];
const DEPOT_COORDS = [-12.0620, -75.2210];

let map = null;
let currentMarker = null;
let ordersLayerGroup = null;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  cargarEstadisticas();
  cargarPedidos();

  // Eventos de botones
  document.getElementById('btn-geocodificar').addEventListener('click', geocodificarDireccionActual);
  document.getElementById('form-pedido').addEventListener('submit', guardarNuevoPedido);
  document.getElementById('btn-centrar-huancayo').addEventListener('click', () => {
    map.setView(HUANCAYO_CENTER, 14);
  });
  document.getElementById('btn-refrescar').addEventListener('click', () => {
    cargarEstadisticas();
    cargarPedidos();
  });
});

/**
 * Inicializa el mapa Leaflet centrado en Huancayo
 */
function initMap() {
  map = L.map('map').setView(HUANCAYO_CENTER, 14);

  // Capa base OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors | EcoLogCity'
  }).addTo(map);

  ordersLayerGroup = L.layerGroup().addTo(map);

  // Marcador Base DistriRápido
  const depotIcon = L.divIcon({
    className: 'custom-depot-icon',
    html: '<div style="background-color: #2563eb; color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.3); border: 2px solid white;">🏢</div>',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

  L.marker(DEPOT_COORDS, { icon: depotIcon })
    .addTo(map)
    .bindPopup('<b>Almacén Central DistriRápido S.A.C.</b><br>Punto de partida de flota en Huancayo');

  // Marcador draggable para georreferenciación de nuevo pedido
  const pinIcon = L.divIcon({
    className: 'custom-pin-icon',
    html: '<div style="background-color: #ef4444; color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.4); border: 2px solid white;">📍</div>',
    iconSize: [28, 28],
    iconAnchor: [14, 28]
  });

  currentMarker = L.marker(HUANCAYO_CENTER, {
    draggable: true,
    icon: pinIcon
  }).addTo(map);

  currentMarker.bindPopup('Punto seleccionado para el pedido (puedes arrastrarlo)').openPopup();

  // Actualizar campos al arrastrar el marcador
  currentMarker.on('dragend', function (e) {
    const pos = e.target.getLatLng();
    actualizarCamposCoordenadas(pos.lat, pos.lng);
  });

  // Al hacer clic en cualquier parte del mapa, mover el marcador
  map.on('click', function (e) {
    currentMarker.setLatLng(e.latlng);
    actualizarCamposCoordenadas(e.latlng.lat, e.latlng.lng);
  });

  // Establecer coordenadas iniciales
  actualizarCamposCoordenadas(HUANCAYO_CENTER[0], HUANCAYO_CENTER[1]);
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

  if (!direccion) {
    mostrarAlerta('Por favor ingrese una dirección antes de ubicar.', 'warning');
    return;
  }

  mostrarAlerta('Buscando geocodificación en Huancayo...', 'info');
  sugsEl.classList.add('hidden');
  sugsEl.innerHTML = '';

  try {
    const res = await fetch(`${API_BASE}/geocodificar?direccion=${encodeURIComponent(direccion)}&distrito=${encodeURIComponent(distrito)}`);
    const json = await res.json();

    if (!json.ok) {
      mostrarAlerta(json.error || 'Error al geocodificar', 'error');
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
      // Escenario 2 BDD: Dirección ambigua
      mostrarAlerta(`⚠️ ${data.mensaje || 'Múltiples coincidencias. Selecciona una sugerencia o ajusta el marcador en el mapa.'}`, 'warning');

      sugsEl.classList.remove('hidden');
      sugsEl.innerHTML = '<p class="text-[11px] font-semibold text-slate-600 mb-1">Sugerencias encontradas:</p>';
      
      data.sugerencias.forEach((sug, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'w-full text-left p-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 rounded text-[11px] text-slate-700 transition border border-slate-200 block truncate';
        btn.textContent = `${i + 1}. ${sug.display_name}`;
        btn.onclick = () => {
          currentMarker.setLatLng([sug.lat, sug.lon]);
          map.setView([sug.lat, sug.lon], 16);
          actualizarCamposCoordenadas(sug.lat, sug.lon);
          mostrarAlerta(`✅ Ubicación ajustada según sugerencia: ${sug.display_name.slice(0, 45)}...`, 'success');
        };
        sugsEl.appendChild(btn);
      });
    } else {
      // Escenario 1 BDD: Geocodificación precisa
      mostrarAlerta(`✅ Dirección geocodificada con éxito: ${data.direccion_formateada.slice(0, 60)}...`, 'success');
    }

  } catch (err) {
    mostrarAlerta('No se pudo conectar con el servicio de geocodificación.', 'error');
  }
}

function mostrarAlerta(mensaje, tipo = 'info') {
  const alertEl = document.getElementById('geocod-alert');
  alertEl.classList.remove('hidden', 'bg-emerald-50', 'text-emerald-800', 'bg-amber-50', 'text-amber-800', 'bg-red-50', 'text-red-800', 'bg-blue-50', 'text-blue-800');

  if (tipo === 'success') {
    alertEl.classList.add('bg-emerald-50', 'text-emerald-800', 'border', 'border-emerald-200');
  } else if (tipo === 'warning') {
    alertEl.classList.add('bg-amber-50', 'text-amber-800', 'border', 'border-amber-200');
  } else if (tipo === 'error') {
    alertEl.classList.add('bg-red-50', 'text-red-800', 'border', 'border-red-200');
  } else {
    alertEl.classList.add('bg-blue-50', 'text-blue-800', 'border', 'border-blue-200');
  }

  alertEl.innerHTML = mensaje;
}

/**
 * Registra un nuevo pedido en PostgreSQL
 */
async function guardarNuevoPedido(e) {
  e.preventDefault();

  const ventanaInicio = document.getElementById('ventana_inicio').value;
  const ventanaFin = document.getElementById('ventana_fin').value;

  if (ventanaFin <= ventanaInicio) {
    alert('La ventana de fin debe ser posterior a la ventana de inicio');
    return;
  }

  const payload = {
    cliente_nombre: document.getElementById('cliente_nombre').value.trim(),
    cliente_telefono: document.getElementById('cliente_telefono').value.trim() || undefined,
    distrito: document.getElementById('distrito').value,
    direccion_texto: document.getElementById('direccion_texto').value.trim(),
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
  btnSubmit.innerHTML = 'Guardando en Base de Datos...';

  try {
    const res = await fetch(`${API_BASE}/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (!json.ok) {
      alert(`Error al registrar pedido: ${json.error}`);
      return;
    }

    alert(`¡Pedido registrado exitosamente!\nCódigo: ${json.data.codigo_seguimiento}`);
    
    // Limpiar formulario y recargar
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
    alert('Error al conectar con la API del servidor');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = '<span>Guardar Pedido en PostgreSQL</span>';
  }
}

/**
 * Carga estadísticas desde el backend
 */
async function cargarEstadisticas() {
  try {
    const res = await fetch(`${API_BASE}/pedidos/stats`);
    const json = await res.json();
    if (json.ok && json.data) {
      const d = json.data;
      document.getElementById('kpi-total').textContent = d.total_pedidos || '0';
      document.getElementById('kpi-pendientes').textContent = d.pendientes_planificar || '0';
      document.getElementById('kpi-peso').textContent = `${parseFloat(d.peso_total_kg || 0).toFixed(1)} kg`;
      document.getElementById('kpi-volumen').textContent = `${parseFloat(d.volumen_total_m3 || 0).toFixed(2)} m³`;
    }
  } catch (e) {
    console.error('Error cargando KPIs:', e);
  }
}

/**
 * Carga pedidos de PostgreSQL y los pinta en la tabla y en el mapa Leaflet
 */
async function cargarPedidos() {
  const tbody = document.getElementById('pedidos-tbody');
  tbody.innerHTML = '<tr><td colspan="8" class="text-center py-6 text-slate-400">Actualizando pedidos...</td></tr>';

  try {
    const res = await fetch(`${API_BASE}/pedidos`);
    const json = await res.json();

    if (!json.ok) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center py-6 text-red-500">Error al cargar pedidos</td></tr>';
      return;
    }

    const pedidos = json.data || [];
    ordersLayerGroup.clearLayers();

    if (pedidos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center py-6 text-slate-400">No hay pedidos registrados</td></tr>';
      return;
    }

    tbody.innerHTML = '';

    pedidos.forEach(p => {
      // 1. Agregar a la tabla
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50 transition border-b border-slate-100';

      const estadoBadge = p.estado === 'CANCELADO'
        ? '<span class="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[11px] font-semibold">CANCELADO</span>'
        : '<span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-semibold">REGISTRADO</span>';

      tr.innerHTML = `
        <td class="py-2.5 px-3 font-mono font-medium text-slate-900">${p.codigo_seguimiento}</td>
        <td class="py-2.5 px-3">
          <div class="font-semibold text-slate-800">${p.cliente_nombre}</div>
          <div class="text-[11px] text-slate-400">${p.cliente_telefono || 'Sin teléfono'}</div>
        </td>
        <td class="py-2.5 px-3">
          <div class="text-slate-700">${p.direccion_texto}</div>
          <div class="text-[11px] text-emerald-700 font-medium">${p.distrito}</div>
        </td>
        <td class="py-2.5 px-3 font-mono text-[11px] text-slate-500">
          ${parseFloat(p.latitud).toFixed(4)}, ${parseFloat(p.longitud).toFixed(4)}
        </td>
        <td class="py-2.5 px-3 font-mono text-slate-700">
          ${p.ventana_inicio.slice(0, 5)} - ${p.ventana_fin.slice(0, 5)}
        </td>
        <td class="py-2.5 px-3 text-slate-600">
          ${parseFloat(p.peso_kg).toFixed(1)} kg | ${parseFloat(p.volumen_m3).toFixed(2)} m³
        </td>
        <td class="py-2.5 px-3">${estadoBadge}</td>
        <td class="py-2.5 px-3 text-right space-x-1">
          <button class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded text-[11px] font-medium"
            onclick="centrarEnMapa(${p.latitud}, ${p.longitud}, '${p.cliente_nombre}')">
            Ver Mapa
          </button>
          ${p.estado !== 'CANCELADO' ? `
            <button class="bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded text-[11px] font-medium"
              onclick="cancelarPedido('${p.id}')">
              Cancelar
            </button>
          ` : ''}
        </td>
      `;
      tbody.appendChild(tr);

      // 2. Agregar marcador al mapa si no está cancelado
      if (p.estado !== 'CANCELADO') {
        const orderIcon = L.divIcon({
          className: 'custom-order-icon',
          html: `<div style="background-color: #059669; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">${p.prioridad}</div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        const m = L.marker([p.latitud, p.longitud], { icon: orderIcon }).addTo(ordersLayerGroup);
        m.bindPopup(`
          <div style="font-size: 12px;">
            <b style="color: #065f46;">${p.cliente_nombre}</b> (${p.codigo_seguimiento})<br>
            <b>Dirección:</b> ${p.direccion_texto} (${p.distrito})<br>
            <b>Ventana:</b> ${p.ventana_inicio.slice(0, 5)} - ${p.ventana_fin.slice(0, 5)}<br>
            <b>Carga:</b> ${p.peso_kg} kg | ${p.volumen_m3} m³<br>
            <b>Prioridad:</b> Nivel ${p.prioridad}
          </div>
        `);
      }
    });

  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center py-6 text-red-500">Error de comunicación con el servidor</td></tr>';
  }
}

window.centrarEnMapa = function (lat, lon, nombre) {
  map.setView([lat, lon], 17);
  window.scrollTo({ top: 150, behavior: 'smooth' });
};

window.cancelarPedido = async function (id) {
  if (!confirm('¿Está seguro de que desea cancelar este pedido?')) return;

  try {
    const res = await fetch(`${API_BASE}/pedidos/${id}/cancelar`, { method: 'PATCH' });
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
