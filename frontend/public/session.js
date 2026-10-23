// ==============================================================================
// EcoLogCity - Sesión del usuario (US-007)
// Compartido por login.html e index.html
// ==============================================================================

// Detección dinámica de la URL del API (soporta desarrollo local, servidor unificado Express y nube)
const API_BASE = window.__API_BASE__ || (
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '8000'
    ? 'http://localhost:8000/api/v1'
    : '/api/v1'
);

const SESION_KEY = 'ecologcity_sesion';

function obtenerSesion() {
  try {
    const sesion = JSON.parse(localStorage.getItem(SESION_KEY));
    return sesion && sesion.token && sesion.usuario ? sesion : null;
  } catch {
    return null;
  }
}

function guardarSesion(sesion) {
  try {
    localStorage.setItem(SESION_KEY, JSON.stringify(sesion));
  } catch {
    // Sin almacenamiento disponible la sesión dura solo esta página
  }
}

function cerrarSesion() {
  try {
    localStorage.removeItem(SESION_KEY);
  } catch {
    // nada que limpiar
  }
  window.location.replace('login.html');
}

function esAdmin() {
  const sesion = obtenerSesion();
  return !!sesion && sesion.usuario.rol === 'ADMIN';
}

/**
 * fetch hacia la API de EcoLogCity con el token de sesión.
 * Si la sesión expiró (401) se vuelve a la pantalla de inicio de sesión.
 */
async function apiFetch(url, opciones = {}) {
  const sesion = obtenerSesion();
  const headers = { ...(opciones.headers || {}) };
  if (sesion) headers.Authorization = `Bearer ${sesion.token}`;

  const res = await fetch(url, { ...opciones, headers });
  if (res.status === 401) {
    cerrarSesion();
    throw new Error('Sesión expirada');
  }
  return res;
}
