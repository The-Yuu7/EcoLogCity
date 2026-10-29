const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { ROLES } = require('../utils/auth');
const { handleOptimizarRutas } = require('../controllers/rutaController');
const { handleLogin, handleSesionActual } = require('../controllers/authController');

const { handleGeocodificar, handleGeocodificarReversa } = require('../controllers/geocodingController');
const {
  handleCrearPedido,
  handleListarPedidos,
  handleObtenerStats,
  handleObtenerPedidoPorId,
  handleCancelarPedido,
} = require('../controllers/pedidoController');
const {
  handleListarVehiculos,
  handleCrearVehiculo,
  handleCambiarEstadoVehiculo,
} = require('../controllers/vehiculoController');
const {
  handleObtenerPerfil,
  handleActualizarPerfil,
  handleListarUsuarios,
  handleCrearUsuario,
  handleActualizarUsuario,
} = require('../controllers/usuarioController');

// Health check (público)
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'EcoLogCity API',
    env: process.env.NODE_ENV || 'development',
  });
});

// Autenticación (US-007)
router.post('/auth/login', handleLogin);
router.get('/auth/me', requireAuth, handleSesionActual);

// Desde aquí todas las rutas requieren sesión iniciada
router.use(requireAuth);

// Rutas de Geocodificación (US-001)
router.get('/geocodificar', handleGeocodificar);
router.get('/geocodificar/reversa', handleGeocodificarReversa);

// Rutas de Gestión de Pedidos (US-001 / US-009): el admin ve el directorio general, el usuario solo los suyos
router.get('/pedidos', handleListarPedidos);
router.post('/pedidos', handleCrearPedido);
router.get('/pedidos/stats', handleObtenerStats);
router.get('/pedidos/:id', handleObtenerPedidoPorId);
router.patch('/pedidos/:id/cancelar', handleCancelarPedido);

// Motor de Optimización de Rutas (US-003 / US-015): la planificación es automática;
// GET devuelve el plan vigente para el Directorio de rutas (solo administrador)
router.get('/rutas', requireRole(ROLES.ADMIN), handleOptimizarRutas);
router.post('/rutas/optimizar', requireRole(ROLES.ADMIN), handleOptimizarRutas);

// Perfil propio (US-016): cualquier usuario con sesión
router.get('/perfil', handleObtenerPerfil);
router.patch('/perfil', handleActualizarPerfil);

// Gestión de Flota de Vehículos (US-008): lectura para todos, cambios solo administrador
router.get('/vehiculos', handleListarVehiculos);
router.post('/vehiculos', requireRole(ROLES.ADMIN), handleCrearVehiculo);
router.patch('/vehiculos/:id/estado', requireRole(ROLES.ADMIN), handleCambiarEstadoVehiculo);

// Gestión de Usuarios (US-014): solo administrador
router.get('/usuarios', requireRole(ROLES.ADMIN), handleListarUsuarios);
router.post('/usuarios', requireRole(ROLES.ADMIN), handleCrearUsuario);
router.patch('/usuarios/:id', requireRole(ROLES.ADMIN), handleActualizarUsuario);

module.exports = router;
