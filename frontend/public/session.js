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

const ICONO_OJO = '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M2.04 12.32a1 1 0 010-.64C3.42 7.51 7.36 4.5 12 4.5c4.64 0 8.57 3 9.96 7.18.07.2.07.43 0 .64C20.58 16.49 16.64 19.5 12 19.5c-4.64 0-8.57-3-9.96-7.18z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>';
const ICONO_OJO_TACHADO = '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.22A10.48 10.48 0 002.04 12c1.38 4.18 5.32 7.5 9.96 7.5 1.96 0 3.78-.56 5.32-1.53M6.23 6.23A10.45 10.45 0 0112 4.5c4.64 0 8.57 3 9.96 7.5a10.52 10.52 0 01-4.29 5.47M6.23 6.23L3 3m3.23 3.23l3.65 3.65m7.89 7.89L21 21m-3.23-3.23l-3.65-3.65m0 0a3 3 0 10-4.24-4.24m4.24 4.24L9.88 9.88"/></svg>';

/**
 * Botones "ver contraseña": cada botón con data-visor-para="<id del input>"
 * alterna el campo entre texto oculto y visible.
 */
function activarVisoresDeContrasena() {
  document.querySelectorAll('[data-visor-para]').forEach(btn => {
    const input = document.getElementById(btn.dataset.visorPara);
    if (!input) return;
    btn.innerHTML = ICONO_OJO;
    btn.addEventListener('click', () => {
      const visible = input.type === 'password';
      input.type = visible ? 'text' : 'password';
      btn.innerHTML = visible ? ICONO_OJO_TACHADO : ICONO_OJO;
      const texto = visible ? 'Ocultar contraseña' : 'Mostrar contraseña';
      btn.setAttribute('aria-label', texto);
      btn.setAttribute('title', texto);
      btn.setAttribute('aria-pressed', String(visible));
      input.focus();
    });
  });
}
