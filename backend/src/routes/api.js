const express = require('express');
const router = express.Router();

const { handleGeocodificar, handleGeocodificarReversa } = require('../controllers/geocodingController');
const {
  handleCrearPedido,
  handleListarPedidos,
  handleObtenerStats,
  handleObtenerPedidoPorId,
  handleCancelarPedido,
} = require('../controllers/pedidoController');

// Rutas de Geocodificación (US-001)
router.get('/geocodificar', handleGeocodificar);
router.get('/geocodificar/reversa', handleGeocodificarReversa);

// Rutas de Gestión de Pedidos (US-001 / EP-01)
router.get('/pedidos', handleListarPedidos);
router.post('/pedidos', handleCrearPedido);
router.get('/pedidos/stats', handleObtenerStats);
router.get('/pedidos/:id', handleObtenerPedidoPorId);
router.patch('/pedidos/:id/cancelar', handleCancelarPedido);

// Rutas de Gestión de Flota de Vehículos (RF-01)
router.get('/vehiculos', async (req, res) => {
  try {
    const { pool } = require('../config/db');
    const result = await pool.query('SELECT * FROM vehiculos WHERE activo = true ORDER BY capacidad_peso_kg DESC;');
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'EcoLogCity API - Core Sprint 1',
    env: process.env.NODE_ENV || 'development',
  });
});

module.exports = router;
